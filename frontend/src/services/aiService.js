// src/services/aiService.js
// Browser Web Speech API – TTS (Text-to-Speech) utilities.
// Does NOT use any paid/external TTS service.
//
// Public API:
//   speak(text, language, callbacks)
//   speakSequential(segments, callbacks)
//   stopSpeaking()
//   isSpeaking()

import { TTS_CONFIG, TTS_VOICE_MAP } from '../config/aiConfig'

// Keep active utterances in module scope to prevent Chrome garbage-collection bug
// where onend fails to fire for dynamically created utterances.
const activeUtterancesSet = new Set()

/* ================================================================
   VOICE SELECTION
   ================================================================ */

/**
 * Score a voice against the desired language tag.
 * Higher = better match.
 *
 * @param {SpeechSynthesisVoice} voice
 * @param {string} desiredTag  e.g. "hi-IN"
 * @returns {number}  3 = exact | 2 = same lang+script | 1 = same language | 0 = no match
 */
function scoreVoice(voice, desiredTag) {
  const vLang   = voice.lang.toLowerCase()
  const desired = desiredTag.toLowerCase()
  const prefix  = desired.split('-')[0]   // "hi" from "hi-IN"

  if (vLang === desired)                    return 3   // exact: hi-IN == hi-IN
  if (vLang.startsWith(desired + '-'))      return 2   // hi-IN-x-something
  if (vLang.startsWith(prefix + '-'))       return 1   // hi-XX  (any Indian Hindi variant)
  if (vLang === prefix)                     return 1   // bare "hi"
  return 0
}

/**
 * Pick the best available SpeechSynthesisVoice for the given language.
 * Returns { voice, score } or null if no match.
 *
 * @param {string} lang  LanguageSelector code, e.g. 'hi-IN'
 */
function pickVoice(lang) {
  if (!window.speechSynthesis) return null

  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null

  const tag = (TTS_VOICE_MAP[lang] ?? lang ?? 'en-IN')

  let best = null
  let bestScore = 0

  for (const voice of voices) {
    const s = scoreVoice(voice, tag)
    if (s > bestScore) {
      bestScore = s
      best = voice
    }
  }

  return best ? { voice: best, score: bestScore } : null
}

/**
 * Log all available voices to the console.
 */
function logAvailableVoices(tag) {
  const voices = window.speechSynthesis.getVoices()
  console.group(`MediNest TTS — available voices (${voices.length} total) for tag "${tag}"`)
  voices.forEach((v, i) => {
    console.log(`  [${i}] name="${v.name}" lang="${v.lang}" local=${v.localService} default=${v.default}`)
  })
  console.groupEnd()
}

/* ================================================================
   INTERNAL: build and dispatch a single utterance
   ================================================================ */

function _dispatchUtterance(text, lang, utterance, callbacks) {
  const tag = TTS_VOICE_MAP[lang] ?? lang ?? 'en-IN'

  utterance.lang = tag

  const result = pickVoice(lang)

  if (result) {
    utterance.voice = result.voice
    const matchQuality = ['', 'language-prefix', 'language-variant', 'exact'][result.score] ?? 'unknown'
    console.log(
      `[TTS] [${tag}] selected voice "${result.voice.name}" (${result.voice.lang}) — match: ${matchQuality}`
    )
  } else {
    const isHindi = tag.startsWith('hi')
    if (isHindi) {
      logAvailableVoices(tag)
      console.warn(
        `[TTS] No Hindi voice found on this system for "${tag}". Using default voice.`
      )
      callbacks.onError?.('hindi_voice_unavailable')
    } else {
      console.log(`[TTS] [${tag}] no exact voice found, using browser default.`)
    }
  }

  // Prosody
  utterance.rate   = TTS_CONFIG.rate
  utterance.pitch  = TTS_CONFIG.pitch
  utterance.volume = TTS_CONFIG.volume

  // Retain reference to prevent GC in Chrome
  activeUtterancesSet.add(utterance)

  utterance.onstart = () => {
    console.log(`[TTS] onstart fired for [${tag}]: "${text.slice(0, 35)}..."`)
    callbacks.onStart?.()
  }

  utterance.onend = () => {
    console.log(`[TTS] onend fired for [${tag}]: "${text.slice(0, 35)}..."`)
    activeUtterancesSet.delete(utterance)
    callbacks.onEnd?.()
  }

  utterance.onerror = (event) => {
    activeUtterancesSet.delete(utterance)
    if (event.error === 'interrupted' || event.error === 'canceled') {
      console.log(`[TTS] speech interrupted/canceled for [${tag}]`)
      callbacks.onEnd?.()
    } else {
      console.error(`[TTS] error for [${tag}]:`, event.error)
      callbacks.onError?.(event.error)
    }
  }

  window.speechSynthesis.speak(utterance)
}

/* ================================================================
   PUBLIC API
   ================================================================ */

/**
 * Speak `text` aloud using the browser's speech synthesis engine.
 *
 * @param {string}   text      The text to speak.
 * @param {string}   language  A LanguageSelector code, e.g. 'hi-IN'.
 * @param {object}   [callbacks]
 * @param {function} [callbacks.onStart]
 * @param {function} [callbacks.onEnd]
 * @param {function} [callbacks.onError]
 * @returns {SpeechSynthesisUtterance|null}
 */
export function speak(text, language = 'en-IN', callbacks = {}) {
  if (!window.speechSynthesis) {
    console.warn('[TTS] speechSynthesis not supported in this browser.')
    callbacks.onError?.('not_supported')
    return null
  }

  if (!text?.trim()) return null

  // Cancel any speech already in progress
  stopSpeaking()

  const utterance = new SpeechSynthesisUtterance(text)
  const voices = window.speechSynthesis.getVoices()

  if (voices.length > 0) {
    _dispatchUtterance(text, language, utterance, callbacks)
  } else {
    console.log('[TTS] Voices not loaded yet, awaiting voiceschanged...')
    const onVoicesReady = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesReady)
      _dispatchUtterance(text, language, utterance, callbacks)
    }
    window.speechSynthesis.addEventListener('voiceschanged', onVoicesReady)

    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesReady)
      if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
        _dispatchUtterance(text, language, utterance, callbacks)
      }
    }, 400)
  }

  return utterance
}

/**
 * Speak an array of { text, language } segments sequentially.
 * e.g. [
 *   { text: "English segment...", language: 'en-IN' },
 *   { text: "Hindi segment...", language: 'hi-IN' }
 * ]
 *
 * @param {Array<{ text: string, language: string }>} segments
 * @param {object} [callbacks]
 * @param {function} [callbacks.onStart]
 * @param {function} [callbacks.onEnd]
 * @param {function} [callbacks.onError]
 */
export function speakSequential(segments, callbacks = {}) {
  if (!window.speechSynthesis) {
    console.warn('[TTS] speechSynthesis not supported in this browser.')
    callbacks.onError?.('not_supported')
    return
  }

  const validSegments = (segments || []).filter((s) => s?.text?.trim())
  if (validSegments.length === 0) {
    callbacks.onEnd?.()
    return
  }

  // Cancel any previous speech
  stopSpeaking()

  let currentIndex = 0
  let isCancelled = false

  const startPlayback = () => {
    const playNext = () => {
      if (isCancelled) return

      if (currentIndex >= validSegments.length) {
        console.log('[TTS] Sequential pipeline completed all segments successfully.')
        callbacks.onEnd?.()
        return
      }

      const item = validSegments[currentIndex]
      const isFirst = currentIndex === 0
      const segmentIndex = currentIndex + 1
      currentIndex++

      console.log(`[TTS] Starting segment ${segmentIndex}/${validSegments.length} (${item.language})`)

      const utterance = new SpeechSynthesisUtterance(item.text)
      const tag = TTS_VOICE_MAP[item.language] ?? item.language ?? 'en-IN'
      utterance.lang = tag

      const result = pickVoice(item.language)
      if (result) {
        utterance.voice = result.voice
      }

      utterance.rate   = TTS_CONFIG.rate
      utterance.pitch  = TTS_CONFIG.pitch
      utterance.volume = TTS_CONFIG.volume

      activeUtterancesSet.add(utterance)

      utterance.onstart = () => {
        console.log(`[TTS] Segment ${segmentIndex} onstart: "${item.text.slice(0, 30)}..."`)
        if (isFirst) {
          callbacks.onStart?.()
        }
      }

      utterance.onend = () => {
        console.log(`[TTS] Segment ${segmentIndex} onend: "${item.text.slice(0, 30)}..."`)
        activeUtterancesSet.delete(utterance)
        if (!isCancelled) {
          playNext()
        }
      }

      utterance.onerror = (event) => {
        activeUtterancesSet.delete(utterance)
        if (event.error === 'interrupted' || event.error === 'canceled') {
          console.log(`[TTS] Segment ${segmentIndex} interrupted/canceled`)
          isCancelled = true
          callbacks.onEnd?.()
        } else {
          console.error(`[TTS] Segment ${segmentIndex} error [${tag}]:`, event.error)
          if (!isCancelled && currentIndex < validSegments.length) {
            playNext()
          } else {
            callbacks.onError?.(event.error)
          }
        }
      }

      window.speechSynthesis.speak(utterance)
    }

    playNext()
  }

  const voices = window.speechSynthesis.getVoices()
  if (voices.length > 0) {
    startPlayback()
  } else {
    console.log('[TTS] Sequential: voices not ready, waiting...')
    const onVoicesReady = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesReady)
      startPlayback()
    }
    window.speechSynthesis.addEventListener('voiceschanged', onVoicesReady)

    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesReady)
      startPlayback()
    }, 400)
  }
}

/**
 * Immediately stop any ongoing speech synthesis.
 */
export function stopSpeaking() {
  if (window.speechSynthesis) {
    activeUtterancesSet.clear()
    window.speechSynthesis.cancel()
  }
}

/**
 * Returns true if speech synthesis is currently speaking.
 */
export function isSpeaking() {
  return window.speechSynthesis?.speaking ?? false
}
