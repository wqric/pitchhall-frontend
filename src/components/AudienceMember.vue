<template>
  <div
    :class="[
      'seat-item flex flex-col items-center justify-end transition-all duration-300 relative',
      containerClasses
    ]"
    :style="{ transform: `scale(${scale})` }"
  >
    <!-- Speaking Badge -->
    <span
      v-if="state === 'speaking'"
      class="text-[10px] text-brand-soundwave font-bold mb-1 tracking-wider uppercase flex items-center gap-1 animate-pulse"
    >
      <span class="w-1.5 h-1.5 rounded-full bg-brand-soundwave"></span>
      Говорит
    </span>

    <!-- Hand Raised Badge -->
    <span
      v-else-if="state === 'hand-raised'"
      class="text-[10px] text-indigo-400 font-bold mb-1 tracking-wide flex items-center gap-1 animate-bounce"
    >
      Вопрос ✋
    </span>

    <!-- Head -->
    <div
      :class="[
        'rounded-full transition-all duration-300 mb-1',
        headClasses
      ]"
    ></div>

    <!-- Torso / Shoulders -->
    <div
      :class="[
        'rounded-t-md transition-all duration-300',
        torsoClasses
      ]"
    ></div>

    <!-- Armchair base -->
    <div
      :class="[
        'rounded mt-0.5 transition-all duration-300',
        armchairClasses
      ]"
    ></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  state: {
    type: String,
    default: 'idle', // 'idle' | 'hand-raised' | 'speaking'
    validator: (v) => ['idle', 'hand-raised', 'speaking'].includes(v)
  },
  role: {
    type: String,
    default: 'idle'
  },
  scale: {
    type: Number,
    default: 1.0
  }
})

const containerClasses = computed(() => {
  if (props.state === 'speaking') {
    return 'p-3 rounded-xl border-2 border-brand-soundwave bg-emerald-500/15 shadow-xl shadow-emerald-500/20'
  }
  if (props.state === 'hand-raised') {
    return 'p-2 rounded-xl border border-indigo-500/50 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
  }
  return 'p-1 hover:brightness-110'
})

const headClasses = computed(() => {
  if (props.state === 'speaking') {
    return 'w-8 h-8 bg-brand-soundwave shadow-md shadow-emerald-500/40 ring-2 ring-brand-soundwave/40'
  }
  if (props.state === 'hand-raised') {
    return 'w-7 h-7 bg-indigo-400 shadow-md shadow-indigo-500/30'
  }
  return 'w-7 h-7 bg-gray-500'
})

const torsoClasses = computed(() => {
  if (props.state === 'speaking') {
    return 'w-16 h-9 bg-gray-900 border-2 border-brand-soundwave'
  }
  if (props.state === 'hand-raised') {
    return 'w-14 h-8 bg-indigo-950 border border-indigo-500/50'
  }
  return 'w-14 h-8 bg-brand-surface border border-brand-border'
})

const armchairClasses = computed(() => {
  if (props.state === 'speaking') {
    return 'w-18 h-2.5 bg-emerald-950 border border-brand-soundwave/40'
  }
  if (props.state === 'hand-raised') {
    return 'w-16 h-2 bg-indigo-900'
  }
  return 'w-16 h-2 bg-brand-border'
})
</script>
