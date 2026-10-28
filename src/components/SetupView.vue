<template>
  <div class="w-full h-full flex flex-col justify-between bg-brand-canvas select-none">
    <!-- Top Nav -->
    <nav class="h-16 px-8 md:px-12 border-b border-brand-border flex items-center justify-between bg-brand-canvas/80 backdrop-blur z-10">
      <div class="flex items-center gap-3">
        <div class="w-7 h-7 rounded-md bg-brand-primary flex items-center justify-center font-bold text-xs text-white shadow-md shadow-indigo-500/20">▲</div>
        <span class="font-bold text-lg text-white">PitchHall</span>
      </div>
      <div class="flex items-center gap-4">
        <span class="px-2.5 py-1 text-xs rounded-full border border-brand-border bg-brand-surface text-indigo-400 font-medium">
          MVP v1.0
        </span>
        <a
          href="https://github.com/wqric/pitchhall-backend"
          target="_blank"
          rel="noreferrer"
          class="text-xs text-brand-subtle hover:text-white transition"
        >
          Репозиторий ↗
        </a>
      </div>
    </nav>

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col items-center justify-center p-6 md:p-8">
      <!-- Header Box -->
      <div class="text-center max-w-xl mb-6">
        <h1 class="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
          Подготовьтесь к выходу на сцену
        </h1>
        <p class="text-sm text-brand-subtle leading-relaxed">
          Вставьте текст вашего доклада. Вы прочитаете его перед залом с телесуфлера, а слушатели зададут вопросы по теме.
        </p>
      </div>

      <!-- Center Focus Box (Card 760px wide) -->
      <div class="w-full max-w-[760px] bg-brand-surface border border-brand-border rounded-xl p-6 shadow-2xl flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-gray-200">Текст доклада (Телесуфлер)</span>
          <span class="text-[11px] px-2 py-0.5 rounded bg-brand-border text-brand-subtle font-medium">
            Русский язык
          </span>
        </div>

        <textarea
          v-model="speechText"
          rows="9"
          placeholder="Введите или вставьте текст доклада здесь..."
          class="w-full bg-brand-canvas border border-brand-border focus:border-brand-primary rounded-lg p-4 text-sm text-gray-200 placeholder-brand-muted focus:outline-none transition-colors leading-relaxed resize-none font-normal"
        ></textarea>

        <!-- Card Footer -->
        <div class="flex items-center justify-between pt-2 border-t border-brand-border/60">
          <span class="text-xs text-brand-muted font-medium">
            ~{{ wordCount }} {{ wordPlural }} • расчетное время ~{{ estimatedMinutes }} мин
          </span>
          <button
            @click="handleSubmit"
            :disabled="!speechText.trim()"
            class="px-5 py-2.5 rounded-lg bg-brand-primary hover:bg-brand-primaryHover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-95"
          >
            Выйти на сцену →
          </button>
        </div>
      </div>
    </main>

    <!-- Footer Spacer -->
    <footer class="h-6"></footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['start-pitch'])

const DEFAULT_SPEECH = `Здравствуйте, коллеги! Сегодня мы представляем платформу PitchHall — интерактивный симулятор публичных выступлений нового поколения.

Главная проблема молодых фаундеров и спикеров — страх перед неожиданными и критическими вопросами из зала. Наше решение моделирует полноценную конференцию: вы выступаете перед адаптивной виртуальной аудиторией, где каждый слушатель обладает собственным психотипом и экспертной позицией — от доброжелательного слушателя до бескомпромиссного скептика.

Система в реальном времени анализирует темп вашей речи, паузы и уверенность подачи, а в секции Q&A генерирует глубокие голосовые вопросы.`

const speechText = ref(DEFAULT_SPEECH)

const wordCount = computed(() => {
  const trimmed = speechText.value.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).filter(Boolean).length
})

const estimatedMinutes = computed(() => {
  // Average speaking rate in Russian is ~130 words per minute
  const mins = Math.ceil(wordCount.value / 130)
  return Math.max(1, mins)
})

const wordPlural = computed(() => {
  const count = wordCount.value % 100
  const rem = count % 10
  if (count > 10 && count < 20) return 'слов'
  if (rem > 1 && rem < 5) return 'слова'
  if (rem === 1) return 'слово'
  return 'слов'
})

const handleSubmit = () => {
  if (speechText.value.trim()) {
    emit('start-pitch', speechText.value.trim())
  }
}
</script>
