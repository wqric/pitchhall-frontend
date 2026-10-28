<template>
  <div class="w-full h-full flex flex-col justify-between bg-brand-canvas select-none overflow-hidden relative">
    <!-- Top Nav -->
    <nav class="h-16 px-8 md:px-12 border-b border-brand-border flex items-center justify-between bg-brand-canvas z-20">
      <div class="flex items-center gap-3">
        <div class="w-7 h-7 rounded-md bg-brand-primary flex items-center justify-center font-bold text-xs text-white shadow-md shadow-indigo-500/20">▲</div>
        <span class="font-bold text-lg text-white">PitchHall</span>
        <span class="text-brand-muted">•</span>
        <span class="text-xs font-medium text-brand-subtle">Режим выступления</span>
      </div>

      <div class="flex items-center gap-4">
        <button
          @click="handleFinish"
          :disabled="isSubmitting"
          class="px-4 py-1.5 rounded-lg bg-brand-border hover:bg-gray-800 border border-brand-borderHover text-xs text-gray-200 transition flex items-center gap-2 active:scale-95 disabled:opacity-50"
        >
          <span v-if="isSubmitting" class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          {{ isSubmitting ? 'Анализ доклада...' : 'Перейти к вопросам (Q&A) →' }}
        </button>
      </div>
    </nav>

    <!-- UPPER BLOCK: Teleprompter (40% height) -->
    <div class="h-[360px] border-b border-brand-border flex flex-col items-center justify-between p-6 md:p-8 bg-gradient-to-b from-[#0B0F19] via-[#0B0F19] to-[#0d1322] z-10">
      <!-- Prompter Text Stream with Scroll / Highlight -->
      <div class="w-full max-w-3xl flex-1 flex flex-col justify-center text-center space-y-3 overflow-y-auto px-4 py-2 scrollbar-none">
        <p v-if="paragraphs[0]" class="text-sm md:text-base text-gray-500 transition-opacity">
          {{ paragraphs[0] }}
        </p>
        <p
          v-if="paragraphs[1]"
          class="text-xl md:text-2xl font-bold text-white tracking-wide leading-relaxed bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-white drop-shadow"
        >
          «{{ paragraphs[1] }}»
        </p>
        <p v-if="paragraphs[2]" class="text-sm md:text-base text-gray-500 transition-opacity">
          {{ paragraphs[2] }}
        </p>
      </div>

      <!-- Floating HUD Bar -->
      <div class="px-6 py-2.5 rounded-full bg-brand-surface border border-brand-borderHover flex items-center gap-6 md:gap-8 shadow-2xl">
        <!-- Mic Indicator -->
        <div class="flex items-center gap-2.5">
          <span class="w-2.5 h-2.5 rounded-full bg-brand-liveMic pulse-dot"></span>
          <span class="text-xs font-semibold text-brand-liveMic">
            ● {{ isListening ? 'Микрофон активен' : 'Микрофон готов' }}
          </span>
        </div>

        <!-- Timer -->
        <div class="text-sm font-bold text-white font-mono tracking-wider">
          {{ formattedTimer }}
        </div>

        <!-- End Speech Button -->
        <button
          @click="handleFinish"
          :disabled="isSubmitting"
          class="px-3.5 py-1 rounded-md bg-brand-border hover:bg-gray-800 border border-brand-borderHover text-xs text-gray-300 hover:text-white transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
        >
          <span v-if="isSubmitting" class="w-2.5 h-2.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          Завершить доклад
        </button>
      </div>
    </div>

    <!-- LOWER BLOCK: Auditorium (60% height) -->
    <div class="flex-1 bg-[#070A12] flex flex-col items-center justify-center gap-8 relative overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_center_bottom,_rgba(99,102,241,0.08),_transparent_70%)] pointer-events-none"></div>

      <!-- Row 2 (Back Row, 7 seats, scaled 0.85, lower opacity for depth) -->
      <div class="flex items-center gap-8 md:gap-10 opacity-60 scale-85 z-10">
        <AudienceMember
          v-for="i in 7"
          :key="`tp-row2-${i}`"
          state="idle"
          :scale="0.85"
        />
      </div>

      <!-- Row 1 (Front Row, 5 seats, full scale 1.0) -->
      <div class="flex items-center gap-10 md:gap-14 z-10">
        <AudienceMember
          v-for="i in 5"
          :key="`tp-row1-${i}`"
          state="idle"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AudienceMember from './AudienceMember.vue'
import { useSpeechRecognition } from '../composables/useSpeechRecognition.js'

const props = defineProps({
  speechText: {
    type: String,
    required: true
  },
  isSubmitting: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['finish-pitch'])

const { isListening, transcript, startListening, stopListening } = useSpeechRecognition()

// Timer counting up in seconds
const elapsedSeconds = ref(0)
let timerInterval = null

const formattedTimer = computed(() => {
  const mins = Math.floor(elapsedSeconds.value / 60)
  const secs = elapsedSeconds.value % 60
  const m = String(mins).padStart(2, '0')
  const s = String(secs).padStart(2, '0')
  return `${m}:${s}`
})

// Split speech text into paragraphs for presentation view
const paragraphs = computed(() => {
  const parts = props.speechText
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)
  
  if (parts.length >= 3) {
    return [parts[0], parts[1], parts.slice(2).join(' ')]
  } else if (parts.length === 2) {
    return [parts[0], parts[1], '...']
  } else if (parts.length === 1) {
    // Split single paragraph into 3 sentences if possible
    const sentences = parts[0].match(/[^.!?]+[.!?]+/g) || [parts[0]]
    if (sentences.length >= 3) {
      return [sentences[0], sentences[1], sentences.slice(2).join(' ')]
    }
    return ['', parts[0], '']
  }
  return ['', props.speechText, '']
})

const handleFinish = () => {
  stopListening()
  if (timerInterval) clearInterval(timerInterval)
  emit('finish-pitch')
}

onMounted(() => {
  startListening()
  timerInterval = setInterval(() => {
    elapsedSeconds.value += 1
  }, 1000)
})

onUnmounted(() => {
  stopListening()
  if (timerInterval) clearInterval(timerInterval)
})
</script>
