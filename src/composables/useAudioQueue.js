import { ref, computed } from 'vue'

export function useAudioQueue() {
  const questions = ref([])
  const currentIndex = ref(0)
  const currentSpeakerState = ref('idle') // 'idle' | 'hand-raised' | 'speaking'
  const isPlaying = ref(false)
  const isQueueComplete = ref(false)
  
  let currentAudio = null
  let transitionTimer = null

  const currentQuestion = computed(() => {
    if (questions.value.length === 0 || currentIndex.value >= questions.value.length) {
      return null
    }
    return questions.value[currentIndex.value]
  })

  const clearTimersAndAudio = () => {
    if (transitionTimer) {
      clearTimeout(transitionTimer)
      transitionTimer = null
    }
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.onended = null
      currentAudio.onerror = null
      currentAudio = null
    }
    isPlaying.value = false
  }

  const playStep = (index) => {
    clearTimersAndAudio()

    if (index >= questions.value.length) {
      isQueueComplete.value = true
      currentSpeakerState.value = 'idle'
      return
    }

    currentIndex.value = index
    isQueueComplete.value = false

    // Step 1: Smooth hand-raise transition
    currentSpeakerState.value = 'hand-raised'

    transitionTimer = setTimeout(() => {
      // Step 2: Character starts speaking and audio plays
      currentSpeakerState.value = 'speaking'
      isPlaying.value = true

      const item = questions.value[index]
      if (item && item.audio_url) {
        currentAudio = new Audio(item.audio_url)
        
        currentAudio.onended = () => {
          onSpeechFinished(index)
        }

        currentAudio.onerror = () => {
          console.warn('Audio playback error or offline, fallback to timed duration')
          // Fallback speaking duration ~3.5 seconds
          transitionTimer = setTimeout(() => {
            onSpeechFinished(index)
          }, 3500)
        }

        currentAudio.play().catch((err) => {
          console.warn('Autoplay prevented or audio playback issue:', err)
          transitionTimer = setTimeout(() => {
            onSpeechFinished(index)
          }, 3500)
        })
      } else {
        // No audio URL, simulate ~3.5 seconds speech
        transitionTimer = setTimeout(() => {
          onSpeechFinished(index)
        }, 3500)
      }
    }, 800)
  }

  const onSpeechFinished = (finishedIndex) => {
    isPlaying.value = false
    currentSpeakerState.value = 'idle'

    // Exactly 1.5 seconds delay before advancing to next question per specification
    transitionTimer = setTimeout(() => {
      playStep(finishedIndex + 1)
    }, 1500)
  }

  const startQueue = (questionList) => {
    clearTimersAndAudio()
    questions.value = questionList || []
    currentIndex.value = 0
    isQueueComplete.value = false
    if (questions.value.length > 0) {
      playStep(0)
    }
  }

  const nextQuestion = () => {
    clearTimersAndAudio()
    const nextIdx = currentIndex.value + 1
    playStep(nextIdx)
  }

  const stopQueue = () => {
    clearTimersAndAudio()
    currentSpeakerState.value = 'idle'
  }

  return {
    questions,
    currentIndex,
    currentQuestion,
    currentSpeakerState,
    isPlaying,
    isQueueComplete,
    startQueue,
    nextQuestion,
    stopQueue
  }
}
