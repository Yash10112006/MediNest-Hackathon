// src/config/aiConfig.js
// Central configuration for the MediNest AI voice and avatar system.

/* ================================================================
   TTS – Text-to-Speech voice preferences
   Maps LanguageSelector codes → primary BCP-47 tag used for:
     1. utterance.lang  (tells the engine which language to speak)
     2. Voice search    (matched by scoreVoice() in aiService.js)

   Hindi note:
     Windows voices are typically listed as "hi-IN" (Microsoft Swara,
     Microsoft Heera, or Google हिन्दी).  The scoring system in
     aiService.js also accepts bare "hi" as a fallback prefix match.
   ================================================================ */
export const TTS_VOICE_MAP = {
  'en-IN': 'en-IN',
  'hi-IN': 'hi-IN',   // Hindi — primary tag; "hi" prefix also matched
  'bn-IN': 'bn-IN',
  'mr-IN': 'mr-IN',
  'ta-IN': 'ta-IN',
  'te-IN': 'te-IN',
  'gu-IN': 'gu-IN',
  'kn-IN': 'kn-IN',
  'ml-IN': 'ml-IN',
  'pa-IN': 'pa-IN',
  'or-IN': 'or-IN',
}

/* ================================================================
   TTS parameters
   ================================================================ */
export const TTS_CONFIG = {
  // Speech rate: 1.0 is normal, 0.92 is slightly slower (clearer for Indian languages)
  rate: 0.92,
  // Pitch: 1.0 is normal
  pitch: 1.0,
  // Volume: 0–1
  volume: 1.0,
}

/* ================================================================
   Avatar animation durations (ms)
   ================================================================ */
export const AVATAR_CONFIG = {
  // How long the speaking animation plays after TTS ends before
  // the avatar returns to idle.
  speakingCooldownMs: 400,
}
