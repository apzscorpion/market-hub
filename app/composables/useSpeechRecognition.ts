export interface SpeechRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
  language: string
}

export function useSpeechRecognition() {
  const isListening = ref(false)
  const isSupported = ref(false)
  const transcript = ref('')
  const interimTranscript = ref('')
  const confidence = ref(0)
  const error = ref<string | null>(null)

  let recognition: any = null

  onMounted(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    isSupported.value = !!SpeechRecognition

    if (!SpeechRecognition) return

    recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onresult = (event: any) => {
      let interim = ''
      let final = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          final += result[0].transcript
          confidence.value = result[0].confidence
        }
        else {
          interim += result[0].transcript
        }
      }

      if (final) {
        transcript.value = (transcript.value + ' ' + final).trim()
      }
      interimTranscript.value = interim
    }

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') return
      error.value = event.error
      isListening.value = false
    }

    recognition.onend = () => {
      if (isListening.value) {
        try { recognition.start() } catch {}
      }
    }
  })

  function setLanguage(lang: 'en' | 'ml'): void {
    if (!recognition) return
    recognition.lang = lang === 'ml' ? 'ml-IN' : 'en-IN'
  }

  function start(lang: 'en' | 'ml' = 'en'): void {
    if (!recognition || isListening.value) return

    transcript.value = ''
    interimTranscript.value = ''
    confidence.value = 0
    error.value = null

    setLanguage(lang)

    try {
      recognition.start()
      isListening.value = true
    }
    catch (e) {
      error.value = (e as Error).message
    }
  }

  function stop(): void {
    if (!recognition) return
    isListening.value = false
    try { recognition.stop() } catch {}
  }

  function reset(): void {
    stop()
    transcript.value = ''
    interimTranscript.value = ''
    confidence.value = 0
    error.value = null
  }

  onUnmounted(() => {
    stop()
  })

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    confidence,
    error,
    start,
    stop,
    reset,
  }
}
