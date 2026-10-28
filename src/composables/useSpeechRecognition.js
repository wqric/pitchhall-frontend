import { ref } from 'vue'

export function useSpeechRecognition() {
  const isListening = ref(false)
  const transcript = ref('')
  const error = ref(null)
  
  const SpeechRecognition = typeof window !== 'undefined' 
    ? (window.SpeechRecognition || window.webkitSpeechRecognition) 
    : null
    
  const isSupported = ref(!!SpeechRecognition)
  let recognitionInstance = null

  if (SpeechRecognition) {
    recognitionInstance = new SpeechRecognition()
    recognitionInstance.continuous = true
    recognitionInstance.interimResults = true
    recognitionInstance.lang = 'ru-RU'

    recognitionInstance.onresult = (event) => {
      let finalTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' '
        }
      }
      if (finalTranscript.trim()) {
        transcript.value = (transcript.value + ' ' + finalTranscript).trim()
      }
    }

    recognitionInstance.onerror = (err) => {
      // Don't treat abort or no-speech as fatal errors
      if (err.error !== 'no-speech' && err.error !== 'aborted') {
        console.warn('SpeechRecognition error:', err.error)
        error.value = err.error
      }
    }

    recognitionInstance.onend = () => {
      if (isListening.value) {
        try {
          recognitionInstance.start()
        } catch {
          isListening.value = false
        }
      }
    }
  }

  const startListening = () => {
    error.value = null
    transcript.value = ''
    isListening.value = true
    if (recognitionInstance) {
      try {
        recognitionInstance.start()
      } catch (err) {
        console.warn('Could not start speech recognition:', err)
      }
    }
  }

  const stopListening = () => {
    isListening.value = false
    if (recognitionInstance) {
      try {
        recognitionInstance.stop()
      } catch {
        // Ignored
      }
    }
  }

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening
  }
}
