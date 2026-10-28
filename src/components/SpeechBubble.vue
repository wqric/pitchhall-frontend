<template>
  <div class="z-20 flex flex-col items-center transition-all duration-300 transform animate-fadeIn">
    <!-- Bubble Card Container -->
    <div class="w-[500px] max-w-[90vw] bg-brand-surface border border-brand-borderHover rounded-xl p-5 shadow-2xl relative">
      <!-- Header Row: Speaker Name + Role Badge + Soundwave -->
      <div class="flex items-center justify-between mb-2.5">
        <div class="flex items-center gap-2.5">
          <span class="font-bold text-sm text-white tracking-wide">{{ speakerName }}</span>
          <span
            :class="[
              'text-[11px] font-semibold px-2 py-0.5 rounded border transition-colors',
              roleBadgeClasses
            ]"
          >
            [{{ roleLabel }}]
          </span>
        </div>

        <!-- Animated Equalizer Bars -->
        <div class="flex items-center gap-1 h-5 px-1">
          <span
            :class="[
              'w-1 rounded-full transition-all duration-150',
              isPlaying ? 'bg-brand-soundwave wave-bar-1' : 'bg-brand-soundwave/40 h-1.5'
            ]"
          ></span>
          <span
            :class="[
              'w-1 rounded-full transition-all duration-150',
              isPlaying ? 'bg-brand-soundwave wave-bar-2' : 'bg-brand-soundwave/40 h-2'
            ]"
          ></span>
          <span
            :class="[
              'w-1 rounded-full transition-all duration-150',
              isPlaying ? 'bg-brand-soundwave wave-bar-3' : 'bg-brand-soundwave/40 h-3'
            ]"
          ></span>
          <span
            :class="[
              'w-1 rounded-full transition-all duration-150',
              isPlaying ? 'bg-brand-soundwave wave-bar-4' : 'bg-brand-soundwave/40 h-2'
            ]"
          ></span>
          <span
            :class="[
              'w-1 rounded-full transition-all duration-150',
              isPlaying ? 'bg-brand-soundwave wave-bar-5' : 'bg-brand-soundwave/40 h-1.5'
            ]"
          ></span>
        </div>
      </div>

      <!-- Question Text Body -->
      <p class="text-sm text-gray-200 leading-relaxed font-normal">
        «{{ questionText }}»
      </p>
    </div>

    <!-- Triangle Down Pointer -->
    <div class="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-brand-surface -mt-0.5 shadow-md"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  speakerName: {
    type: String,
    default: 'Слушатель'
  },
  role: {
    type: String,
    default: 'skeptic'
  },
  questionText: {
    type: String,
    default: ''
  },
  isPlaying: {
    type: Boolean,
    default: false
  }
})

const roleLabel = computed(() => {
  switch (props.role?.toLowerCase()) {
    case 'skeptic':
      return 'Скептик'
    case 'theorist':
      return 'Теоретик'
    case 'newbie':
      return 'Новичок'
    default:
      return 'Жюри'
  }
})

const roleBadgeClasses = computed(() => {
  switch (props.role?.toLowerCase()) {
    case 'skeptic':
      return 'bg-brand-liveMic/15 border-brand-liveMic/40 text-brand-liveMic'
    case 'theorist':
      return 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
    case 'newbie':
      return 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
    default:
      return 'bg-gray-800 border-gray-700 text-gray-300'
  }
})
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.25s ease-out forwards;
}
</style>
