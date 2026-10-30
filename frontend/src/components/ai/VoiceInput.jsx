// src/components/ai/VoiceInput.jsx
// Hands-free Voice Input Component using Web Speech API with Silence Auto-Restart.
// Exposes imperative methods via ref:
//   startListening()
//   stopListening()
//   isListening()
//   isSupported()

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { Mic, MicOff } from 'lucide-react'

const VoiceInput = forwardRef(function VoiceInput(
  {
    /** Called with the final transcript string. */
    onResult,
    /** Called with (isListening: boolean) whenever state changes. */
    onListeningChange,
    /** BCP-47 language tag, e.g. 'hi-IN'. Must match LanguageSelector value. */
    language = 'en-IN',
    /** Disable the button (e.g. while AI API is loading). */
    disabled = false,
  },
  ref
) {
  const recognitionRef           = useRef(null)
  const isListeningRef           = useRef(false)
  const shouldListenRef          = useRef(false)
  const transcriptReceivedRef    = useRef(false)
  const isExplicitlyStoppedRef   = useRef(false)
  const restartTimerRef          = useRef(null)

  const [listening,  setListening]  = useState(false)
  const [supported,  setSupported]  = useState(true)
  const [voiceError, setVoiceError] = useState('')

  // Synchronize state & invoke onListeningChange
  const updateListeningState = useCallback(
    (newState) => {
      isListeningRef.current = newState
      setListening(newState)
      onListeningChange?.(newState)
    },
    [onListeningChange]
  )

  /* ----------------------------------------------------------------
     Build / rebuild the recognition object whenever language changes.
     ---------------------------------------------------------------- */
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      console.warn('[VoiceInput] Web SpeechRecognition is not supported in this browser.')
      setSupported(false)
      return
    }

    // Clean up any previous instance and pending timers
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current)
      restartTimerRef.current = null
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch (_) {
        /* ignore */
      }
      recognitionRef.current = null
    }

    const recognition = new SpeechRecognition()

    recognition.lang = language
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      console.log('[VoiceInput] SpeechRecognition onstart fired. Listening active.')
      setVoiceError('')
      transcriptReceivedRef.current = false
      updateListeningState(true)
    }

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? ''
      console.log('[VoiceInput] SpeechRecognition onresult:', transcript)

      if (transcript.trim()) {
        // Mark that speech was successfully captured so onend does not auto-restart
        transcriptReceivedRef.current = true
        shouldListenRef.current = false
        onResult?.(transcript.trim())
      }
    }

    recognition.onerror = (event) => {
      console.log('[VoiceInput] SpeechRecognition onerror:', event.error)

      // 'no-speech' is a natural silence timeout
      if (event.error === 'no-speech') {
        // If hands-free listening is expected, silence will be handled in onend by auto-restarting
        return
      }

      // 'aborted' fires when recognition is cancelled programmatically
      if (event.error === 'aborted') {
        return
      }

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        shouldListenRef.current = false
        isExplicitlyStoppedRef.current = true
        setVoiceError('Tap the microphone once to enable hands-free voice.')
        updateListeningState(false)
        return
      }

      const messages = {
        'audio-capture': 'Microphone not found. Please check your device.',
        'network': 'Network error during voice input. Please check connection.',
        'language-not-supported':
          "This language is not supported by your browser's speech engine.",
      }

      setVoiceError(messages[event.error] ?? 'Tap mic to speak.')
      updateListeningState(false)
    }

    recognition.onend = () => {
      console.log('[VoiceInput] SpeechRecognition onend fired.', {
        transcriptReceived: transcriptReceivedRef.current,
        shouldListen: shouldListenRef.current,
        isExplicitlyStopped: isExplicitlyStoppedRef.current,
        disabled,
      })

      // Case 1: A transcript was received and sent to the chatbot lifecycle
      if (transcriptReceivedRef.current) {
        updateListeningState(false)
        return
      }

      // Case 2: Recognition was stopped intentionally (by user, API loading, TTS, unmount)
      if (isExplicitlyStoppedRef.current || disabled || !shouldListenRef.current) {
        updateListeningState(false)
        return
      }

      // Case 3: Silence timeout! The patient hasn't spoken yet.
      // Keep listening indicator active and smoothly restart SpeechRecognition.
      console.log('[VoiceInput] Silence timeout detected. Auto-restarting SpeechRecognition in 250ms...')
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current)

      restartTimerRef.current = setTimeout(() => {
        if (
          shouldListenRef.current &&
          !isExplicitlyStoppedRef.current &&
          !disabled &&
          recognitionRef.current
        ) {
          try {
            console.log('[VoiceInput] Invoking recognition.start() after silence timeout...')
            recognitionRef.current.start()
          } catch (err) {
            console.log('[VoiceInput] Restart after silence note:', err.name)
            if (err.name !== 'InvalidStateError') {
              updateListeningState(false)
            }
          }
        }
      }, 250)
    }

    recognitionRef.current = recognition

    return () => {
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current)
        restartTimerRef.current = null
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch (_) {
          /* ignore */
        }
        recognitionRef.current = null
      }
      updateListeningState(false)
    }
  }, [language, onResult, updateListeningState, disabled])

  /* ----------------------------------------------------------------
     Start listening method (safe & idempotent)
     ---------------------------------------------------------------- */
  const startListening = useCallback(() => {
    console.log('[VoiceInput] startListening() called.')

    if (disabled || !supported || !recognitionRef.current) {
      console.warn('[VoiceInput] startListening() aborted - disabled or unsupported')
      return false
    }

    isExplicitlyStoppedRef.current = false
    shouldListenRef.current = true
    transcriptReceivedRef.current = false

    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current)
      restartTimerRef.current = null
    }

    if (isListeningRef.current) {
      console.log('[VoiceInput] startListening() - already listening')
      return true
    }

    setVoiceError('')

    try {
      recognitionRef.current.start()
      return true
    } catch (err) {
      console.log('[VoiceInput] recognition.start() catch:', err.name)
      if (err.name === 'InvalidStateError') {
        return true
      }
      if (err.name === 'NotAllowedError') {
        setVoiceError('Tap the microphone once to enable hands-free voice.')
      } else {
        setVoiceError('Tap microphone to start speaking.')
      }
      updateListeningState(false)
      return false
    }
  }, [disabled, supported, updateListeningState])

  /* ----------------------------------------------------------------
     Stop listening method (safe & idempotent)
     ---------------------------------------------------------------- */
  const stopListening = useCallback(() => {
    console.log('[VoiceInput] stopListening() called.')
    isExplicitlyStoppedRef.current = true
    shouldListenRef.current = false
    transcriptReceivedRef.current = false

    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current)
      restartTimerRef.current = null
    }

    if (!recognitionRef.current) return

    try {
      recognitionRef.current.stop()
    } catch (_) {
      /* ignore */
    }
    updateListeningState(false)
  }, [updateListeningState])

  /* ----------------------------------------------------------------
     Expose imperative methods via ref
     ---------------------------------------------------------------- */
  useImperativeHandle(
    ref,
    () => ({
      startListening,
      stopListening,
      isListening: () => isListeningRef.current,
      isSupported: () => supported,
    }),
    [startListening, stopListening, supported]
  )

  /* ----------------------------------------------------------------
     Manual Toggle (User Click)
     ---------------------------------------------------------------- */
  const toggleListening = useCallback(() => {
    if (disabled || !supported || !recognitionRef.current) return

    if (isListeningRef.current || shouldListenRef.current) {
      stopListening()
    } else {
      startListening()
    }
  }, [disabled, supported, startListening, stopListening])

  /* ----------------------------------------------------------------
     Render nothing when browser lacks speech recognition support
     ---------------------------------------------------------------- */
  if (!supported) {
    return null
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        title={
          listening ? 'Stop listening' : 'Hands-free mic (click to talk)'
        }
        aria-label={listening ? 'Stop listening' : 'Voice input'}
        className={[
          'relative flex h-10 w-10 items-center justify-center rounded-xl shadow-sm transition-all duration-200',
          listening
            ? 'bg-red-100 text-red-600 ring-2 ring-red-400/60 dark:bg-red-950/40 dark:text-red-400 dark:ring-red-500/40'
            : 'bg-white text-slate-500 hover:text-teal-600 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-teal-400',
          disabled ? 'cursor-not-allowed opacity-40' : '',
        ].join(' ')}
      >
        {/* Ping ring while active */}
        {listening && (
          <span className="absolute inset-0 rounded-xl animate-ping bg-red-400/30 pointer-events-none" />
        )}

        {listening ? (
          <MicOff className="relative h-4 w-4" />
        ) : (
          <Mic className="relative h-4 w-4" />
        )}
      </button>

      {/* Inline status/error message – non-blocking */}
      {voiceError && (
        <p className="max-w-[160px] text-center text-[10px] font-medium leading-tight text-red-500 dark:text-red-400 animate-fadeIn">
          {voiceError}
        </p>
      )}
    </div>
  )
})

export default VoiceInput