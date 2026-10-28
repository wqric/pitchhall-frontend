<template>
  <div class="w-full min-h-screen bg-[#070A10] flex flex-col items-center justify-center p-0 md:p-6 select-none">
    <!-- Viewport 1440x900 Frame Container per Figma Spec -->
    <div class="w-full max-w-[1440px] h-screen md:h-[900px] bg-brand-canvas md:rounded-2xl md:border border-brand-border md:shadow-2xl overflow-hidden relative flex flex-col">
      <!-- State 1: Setup View -->
      <SetupView
        v-if="currentStep === 'setup'"
        @start-pitch="onStartPitch"
      />

      <!-- State 2: Teleprompter View -->
      <TeleprompterView
        v-else-if="currentStep === 'teleprompter'"
        :speech-text="speechText"
        :is-submitting="isLoading"
        @finish-pitch="onFinishPitch"
      />

      <!-- State 3: QA Auditorium Session View -->
      <AuditoriumStage
        v-else-if="currentStep === 'qa_session'"
        :questions="juryQuestions"
        @restart="onRestart"
      />

      <!-- Loading Overlay when generating AI jury questions and voice audio -->
      <div
        v-if="isLoading"
        class="absolute inset-0 bg-brand-canvas/85 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fadeIn"
      >
        <div class="w-16 h-16 rounded-2xl bg-brand-surface border border-brand-primary/40 flex items-center justify-center shadow-2xl mb-5">
          <div class="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h3 class="text-xl font-bold text-white mb-2">Экспертная комиссия анализирует доклад</h3>
        <p class="text-sm text-brand-subtle max-w-md text-center leading-relaxed">
          Timeweb Cloud AI формулирует каверзные вопросы жюри, а нейросетевой модуль синтезирует голоса персонажей...
        </p>
      </div>

      <!-- Network Error Toast / Retry Modal -->
      <div
        v-if="errorMessage"
        class="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3.5 rounded-xl bg-red-950/90 border border-red-500/50 text-red-200 text-sm shadow-2xl flex items-center gap-4 z-50 animate-fadeIn"
      >
        <span>⚠️ {{ errorMessage }}</span>
        <button
          @click="retryAnalysis"
          class="px-3 py-1 bg-red-800 hover:bg-red-700 text-white rounded text-xs font-semibold transition"
        >
          Повторить
        </button>
        <button
          @click="errorMessage = ''"
          class="text-red-400 hover:text-white text-xs"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SetupView from './components/SetupView.vue'
import TeleprompterView from './components/TeleprompterView.vue'
import AuditoriumStage from './components/AuditoriumStage.vue'

// State machine: 'setup' | 'teleprompter' | 'qa_session'
const currentStep = ref('setup')
const speechText = ref('')
const juryQuestions = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

const onStartPitch = (text) => {
  speechText.value = text
  currentStep.value = 'teleprompter'
}

const onFinishPitch = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: speechText.value
      })
    })

    if (!response.ok) {
      throw new Error(`Ошибка сервера (${response.status})`)
    }

    const data = await response.json()
    if (data.questions && data.questions.length > 0) {
      juryQuestions.value = data.questions
      currentStep.value = 'qa_session'
    } else {
      throw new Error('Не удалось получить вопросы от жюри')
    }
  } catch (err) {
    console.error('Analysis request error:', err)
    errorMessage.value = `Не удалось связаться с бэкендом: ${err.message}. Проверьте запуск сервера.`
  } finally {
    isLoading.value = false
  }
}

const retryAnalysis = () => {
  errorMessage.value = ''
  onFinishPitch()
}

const onRestart = () => {
  juryQuestions.value = []
  currentStep.value = 'setup'
}
</script>

<style>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>
