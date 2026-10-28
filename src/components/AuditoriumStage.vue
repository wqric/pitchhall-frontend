<template>
  <div class="w-full h-full flex flex-col justify-between bg-[#070A12] text-gray-100 select-none overflow-hidden relative">
    <!-- Ambient Radial Glow -->
    <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center_center,_rgba(99,102,241,0.12),_transparent_70%)]"></div>

    <!-- Top Navigation Bar -->
    <nav class="h-16 px-8 md:px-12 border-b border-brand-border flex items-center justify-between bg-brand-canvas/90 backdrop-blur z-20">
      <div class="flex items-center gap-3">
        <div class="w-7 h-7 rounded-md bg-brand-primary flex items-center justify-center font-bold text-xs text-white shadow-md shadow-indigo-500/20">▲</div>
        <span class="font-bold text-lg text-white">PitchHall</span>
        <span class="text-brand-muted">•</span>
        <span class="text-xs font-semibold text-indigo-400">
          Секция Q&A: Вопрос {{ Math.min(currentIndex + 1, totalQuestionsCount) }} из {{ totalQuestionsCount }}
        </span>
      </div>

      <div class="flex items-center gap-4">
        <span class="text-xs px-2.5 py-1 rounded-full border border-brand-border bg-brand-surface text-brand-subtle">
          Слушателей в зале: 12
        </span>
        <button
          @click="$emit('restart')"
          class="px-3 py-1.5 rounded-lg bg-brand-border hover:bg-gray-800 border border-brand-borderHover text-xs text-brand-subtle hover:text-white transition"
        >
          Начать заново
        </button>
      </div>
    </nav>

    <!-- Center Stage Area -->
    <div class="flex-1 flex flex-col items-center justify-center gap-4 relative py-6 z-10">
      <!-- Back Row (Row 2, 7 idle seats, scaled 0.85, lower opacity for depth) -->
      <div class="flex items-center gap-8 md:gap-10 opacity-40 scale-85 mb-2">
        <AudienceMember
          v-for="i in 7"
          :key="`row2-${i}`"
          state="idle"
          :scale="0.85"
        />
      </div>

      <!-- Speech Bubble Area (Positioned above the active speaker) -->
      <div class="h-44 flex items-end justify-center transition-all duration-300">
        <SpeechBubble
          v-if="currentQuestion && currentSpeakerState !== 'idle'"
          :speaker-name="currentQuestion.name"
          :role="currentQuestion.role"
          :question-text="currentQuestion.question"
          :is-playing="isPlaying"
        />
        <div
          v-else-if="isQueueComplete"
          class="p-4 rounded-xl bg-brand-surface/90 border border-brand-soundwave/40 text-center animate-fadeIn shadow-2xl"
        >
          <div class="text-brand-soundwave font-bold text-sm mb-1">🎉 Все вопросы жюри завершены!</div>
          <p class="text-xs text-gray-300">Вы успешно справились со всеми каверзными вопросами комиссии.</p>
        </div>
      </div>

      <!-- Front Row (Row 1, 5 seats with 3 jury bot positions) -->
      <div class="flex items-center gap-8 md:gap-14 mt-1">
        <!-- Seat 0: Ordinary Idle Listener -->
        <AudienceMember
          state="idle"
          role="idle"
        />

        <!-- Seat 1: Theorist (Елена Михайловна) -->
        <AudienceMember
          :state="getSeatState(1, 'theorist')"
          role="theorist"
        />

        <!-- Seat 2 (Center): Skeptic (Виктор Сергеевич) -->
        <AudienceMember
          :state="getSeatState(2, 'skeptic')"
          role="skeptic"
        />

        <!-- Seat 3: Newbie (Иван) -->
        <AudienceMember
          :state="getSeatState(3, 'newbie')"
          role="newbie"
        />

        <!-- Seat 4: Ordinary Idle Listener -->
        <AudienceMember
          state="idle"
          role="idle"
        />
      </div>
    </div>

    <!-- Bottom Speaker Control Bar -->
    <footer class="h-20 px-8 md:px-12 border-t border-brand-border flex items-center justify-between bg-brand-surface z-20">
      <div class="flex items-center gap-3">
        <span class="w-3 h-3 rounded-full bg-brand-soundwave pulse-dot"></span>
        <span class="text-sm font-semibold text-white">
          {{ isPlaying ? 'Жюри озвучивает вопрос...' : 'Микрофон слушает ответ докладчика...' }}
        </span>
        <span class="text-xs text-brand-muted hidden sm:inline">
          {{ isPlaying ? '(Внимательно слушайте вопрос)' : '(Говорите в микрофон, ответ записывается)' }}
        </span>
      </div>

      <div class="flex items-center gap-3">
        <button
          v-if="!isQueueComplete"
          @click="onNextQuestionClick"
          class="px-5 py-2.5 rounded-lg bg-brand-primary hover:bg-brand-primaryHover text-white text-sm font-semibold transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-95"
        >
          Следующий вопрос →
        </button>
        <button
          v-else
          @click="$emit('restart')"
          class="px-5 py-2.5 rounded-lg bg-brand-soundwave hover:bg-emerald-600 text-gray-950 text-sm font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95"
        >
          Завершить симуляцию ✓
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import AudienceMember from './AudienceMember.vue'
import SpeechBubble from './SpeechBubble.vue'
import { useAudioQueue } from '../composables/useAudioQueue.js'

const props = defineProps({
  questions: {
    type: Array,
    required: true,
    default: () => []
  }
})

const emit = defineEmits(['restart', 'finished'])

const {
  currentIndex,
  currentQuestion,
  currentSpeakerState,
  isPlaying,
  isQueueComplete,
  startQueue,
  nextQuestion,
  stopQueue
} = useAudioQueue()

const totalQuestionsCount = computed(() => props.questions.length || 3)

// Map role to seat index in front row:
// index 1: theorist
// index 2: skeptic
// index 3: newbie
const getSeatState = (seatIdx, expectedRole) => {
  if (!currentQuestion.value || isQueueComplete.value) {
    return 'idle'
  }
  const activeRole = currentQuestion.value.role?.toLowerCase()
  if (activeRole === expectedRole) {
    return currentSpeakerState.value
  }
  return 'idle'
}

const onNextQuestionClick = () => {
  nextQuestion()
}

onMounted(() => {
  if (props.questions && props.questions.length > 0) {
    startQueue(props.questions)
  }
})

onUnmounted(() => {
  stopQueue()
})
</script>
