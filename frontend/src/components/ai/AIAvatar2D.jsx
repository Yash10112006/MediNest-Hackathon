// src/components/ai/AIAvatar2D.jsx
// Interactive 2D AI Doctor Avatar for Clinical Consultation.
// Image: /ai-doctor.png (served from Vite public folder)
// States: idle | listening | processing (or thinking) | speaking | emergency

import { useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  HeartPulse,
  Loader2,
  Mic,
  Volume2,
} from 'lucide-react'

/* ================================================================
   State Configuration & Status Communication
   ================================================================ */
const STATE_BADGE_CONFIG = {
  idle: {
    label: 'Ready to help',
    icon: CheckCircle2,
    badgeClasses:
      'border-teal-200/80 bg-white/95 text-teal-700 dark:border-teal-800/80 dark:bg-slate-900/95 dark:text-teal-300',
    dotClass: 'bg-emerald-500',
  },
  listening: {
    label: 'Listening to you...',
    icon: Mic,
    badgeClasses:
      'border-sky-300 bg-sky-50/95 text-sky-800 dark:border-sky-800 dark:bg-sky-950/95 dark:text-sky-200 shadow-sky-500/10',
    dotClass: 'bg-sky-500 animate-ping',
  },
  processing: {
    label: 'Understanding your symptoms...',
    icon: Loader2,
    badgeClasses:
      'border-amber-300 bg-amber-50/95 text-amber-800 dark:border-amber-800 dark:bg-amber-950/95 dark:text-amber-300 shadow-amber-500/10',
    dotClass: 'bg-amber-500 animate-pulse',
  },
  thinking: {
    label: 'Understanding your symptoms...',
    icon: Loader2,
    badgeClasses:
      'border-amber-300 bg-amber-50/95 text-amber-800 dark:border-amber-800 dark:bg-amber-950/95 dark:text-amber-300 shadow-amber-500/10',
    dotClass: 'bg-amber-500 animate-pulse',
  },
  speaking: {
    label: 'Doctor is speaking...',
    icon: Volume2,
    badgeClasses:
      'border-teal-300 bg-teal-50/95 text-teal-800 dark:border-teal-700 dark:bg-teal-950/95 dark:text-teal-200 shadow-teal-500/10',
    dotClass: 'bg-teal-500 animate-pulse',
  },
  emergency: {
    label: 'Emergency attention required',
    icon: AlertTriangle,
    badgeClasses:
      'border-red-300 bg-red-50/95 text-red-700 dark:border-red-800 dark:bg-red-950/95 dark:text-red-300 shadow-red-500/20',
    dotClass: 'bg-red-500 animate-ping',
  },
}

const BOTTOM_HELPERS = {
  idle: 'Ready to help — speak or type your symptoms',
  listening: 'Speak naturally. I’m listening...',
  processing: 'Let me understand that...',
  thinking: 'Let me understand that...',
  speaking: 'Please listen to the doctor...',
  emergency: 'Please seek immediate medical care',
}

/* ================================================================
   Multi-Bar Live Voice Waveform Component
   ================================================================ */
function LiveVoiceWaveform({ colorClass = 'bg-sky-500' }) {
  return (
    <div
      className="flex items-center gap-[3px] h-6 px-2 py-1 rounded-full bg-black/5 dark:bg-white/5 backdrop-blur-sm"
      aria-hidden="true"
    >
      <span className={`w-[2.5px] rounded-full animate-vbar-1 ${colorClass}`} />
      <span className={`w-[2.5px] rounded-full animate-vbar-2 ${colorClass}`} />
      <span className={`w-[2.5px] rounded-full animate-vbar-3 ${colorClass}`} />
      <span className={`w-[2.5px] rounded-full animate-vbar-4 ${colorClass}`} />
      <span className={`w-[2.5px] rounded-full animate-vbar-5 ${colorClass}`} />
      <span className={`w-[2.5px] rounded-full animate-vbar-6 ${colorClass}`} />
      <span className={`w-[2.5px] rounded-full animate-vbar-7 ${colorClass}`} />
      <span className={`w-[2.5px] rounded-full animate-vbar-8 ${colorClass}`} />
      <span className={`w-[2.5px] rounded-full animate-vbar-9 ${colorClass}`} />
    </div>
  )
}

/* ================================================================
   AIAvatar2D Component
   ================================================================ */
export default function AIAvatar2D({
  state = 'idle',
  size = 'large',
}) {
  const [imageError, setImageError] = useState(false)

  // Standardize state
  const normalizedState = state === 'thinking' ? 'processing' : state

  const isEmergency  = normalizedState === 'emergency'
  const isListening  = normalizedState === 'listening'
  const isProcessing = normalizedState === 'processing'
  const isSpeaking   = normalizedState === 'speaking'

  const currentBadge =
    STATE_BADGE_CONFIG[normalizedState] || STATE_BADGE_CONFIG.idle
  const BadgeIcon = currentBadge.icon

  /* ----------------------------------------------------------
     Image CSS animation classes driven by current state
     ---------------------------------------------------------- */
  const imageClasses = [
    'relative z-10 w-auto max-w-[90%] object-contain select-none transition-all duration-500 ease-out',
    size === 'large' ? 'h-[350px] sm:h-[370px]' : 'h-[230px]',
    // Drop shadow
    isEmergency
      ? 'drop-shadow-[0_16px_32px_rgba(239,68,68,0.45)]'
      : isListening
      ? 'drop-shadow-[0_16px_28px_rgba(14,165,233,0.35)]'
      : isSpeaking
      ? 'drop-shadow-[0_16px_30px_rgba(13,148,136,0.32)]'
      : isProcessing
      ? 'drop-shadow-[0_12px_24px_rgba(245,158,11,0.25)]'
      : 'drop-shadow-[0_14px_24px_rgba(13,148,136,0.14)]',
    // State keyframe animation
    isEmergency ? 'animate-avatar-emergency'
      : isProcessing ? 'animate-avatar-process'
      : isSpeaking ? 'animate-avatar-speak'
      : isListening ? 'animate-avatar-listen'
      : 'animate-avatar-idle',
  ].filter(Boolean).join(' ')

  /* ----------------------------------------------------------
     Ambient aura glow shifts per state
     ---------------------------------------------------------- */
  const glowClasses = [
    'absolute left-1/2 top-10 h-64 w-64 -translate-x-1/2 rounded-full blur-3xl transition-all duration-700 pointer-events-none',
    isEmergency ? 'bg-red-400/45 scale-115'
      : isListening ? 'bg-sky-300/55 scale-110'
      : isProcessing ? 'bg-amber-300/40 scale-100'
      : isSpeaking ? 'bg-teal-300/55 scale-105'
      : 'bg-teal-100/60 scale-100',
  ].join(' ')

  return (
    <div
      className={[
        'relative flex w-full items-end justify-center overflow-hidden',
        'bg-gradient-to-b from-cyan-50/90 via-teal-50/70 to-white',
        'dark:from-slate-800 dark:via-teal-950/20 dark:to-slate-900',
        size === 'large' ? 'h-[380px] sm:h-[400px]' : 'h-[260px]',
      ].join(' ')}
      aria-label={`AI Doctor Avatar (${normalizedState} state)`}
    >
      {/* ── Background depth layers ─────────────────────────── */}
      <div className="absolute left-1/2 top-8 h-64 w-64 -translate-x-1/2 rounded-full bg-white/75 shadow-inner dark:bg-teal-900/20 pointer-events-none" />
      <div className="absolute left-1/2 top-16 h-48 w-48 -translate-x-1/2 rounded-full bg-teal-100/40 dark:bg-teal-800/20 pointer-events-none" />

      {/* ── Ambient aura glow ───────────────────────────────── */}
      <div className={glowClasses} />

      {/* ── Speaking soundwave ripples ───────────────────────── */}
      {isSpeaking && (
        <>
          <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-teal-400/40 animate-wave-ripple-1 pointer-events-none" />
          <div className="absolute left-1/2 top-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal-300/25 animate-wave-ripple-2 pointer-events-none" />
        </>
      )}

      {/* ── Listening radar ripples ─────────────────────────── */}
      {isListening && (
        <>
          <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-sky-400/50 animate-wave-ripple-1 pointer-events-none" />
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-300/30 animate-wave-ripple-2 pointer-events-none" />
        </>
      )}

      {/* ── Doctor 2D Image & Speech Shimmer ────────────────── */}
      <div className="relative z-10 flex items-end justify-center">
        {imageError ? (
          <div className="flex items-end justify-center pb-8">
            <img
              src="/logo.png"
              alt="MediNest Logo"
              className={[
                'opacity-80 transition-all duration-500 object-contain',
                size === 'large' ? 'h-28 w-28' : 'h-20 w-20',
                isProcessing ? 'animate-pulse' : '',
              ].join(' ')}
            />
          </div>
        ) : (
          <div className="relative">
            <img
              src="/ai-doctor.png"
              alt="MediNest AI Doctor Assistant"
              className={imageClasses}
              onError={() => {
                console.error('AIAvatar2D: /ai-doctor.png failed to load. Showing fallback.')
                setImageError(true)
              }}
            />

            {/* Subtle speaking vocalization overlay (jaw area micro-shimmer) */}
            {isSpeaking && (
              <div
                className="absolute left-[49%] top-[34%] h-5 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-400/30 blur-[4px] animate-mouth-vocalize pointer-events-none"
                aria-hidden="true"
              />
            )}
          </div>
        )}
      </div>

      {/* ── Status Badge (Top-Right) ─────────────────────────── */}
      <div
        className={[
          'absolute right-4 top-4 z-20 flex items-center gap-2',
          'rounded-full border px-3 py-1.5 text-xs font-bold shadow-md backdrop-blur-md',
          'transition-all duration-300',
          currentBadge.badgeClasses,
        ].join(' ')}
      >
        <span className={`h-2 w-2 rounded-full ${currentBadge.dotClass}`} />
        <BadgeIcon
          className={`h-3.5 w-3.5 ${
            isProcessing
              ? 'animate-spin'
              : isSpeaking
              ? 'animate-pulse'
              : ''
          }`}
        />
        <span>{currentBadge.label}</span>
      </div>

      {/* ── Bottom Contextual Status & Live Waveform Pill ─────── */}
      <div
        className={[
          'absolute bottom-3 left-1/2 z-20 -translate-x-1/2 max-w-[92%] sm:max-w-none',
          'flex items-center gap-2.5 rounded-full border px-4 py-2 text-xs font-semibold shadow-lg backdrop-blur-md',
          'transition-all duration-500',
          isEmergency
            ? 'border-red-200/80 bg-red-50/95 text-red-700 dark:border-red-800 dark:bg-red-950/95 dark:text-red-300 shadow-red-500/20'
            : isListening
            ? 'border-sky-200/80 bg-sky-50/95 text-sky-800 dark:border-sky-800 dark:bg-sky-950/95 dark:text-sky-200 shadow-sky-500/10'
            : isSpeaking
            ? 'border-teal-200/80 bg-teal-50/95 text-teal-800 dark:border-teal-800 dark:bg-teal-950/95 dark:text-teal-200 shadow-teal-500/10'
            : isProcessing
            ? 'border-amber-200/80 bg-amber-50/95 text-amber-800 dark:border-amber-800 dark:bg-amber-950/95 dark:text-amber-300 shadow-amber-500/10'
            : 'border-white/80 bg-white/90 text-slate-700 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200',
        ].join(' ')}
      >
        {isSpeaking && (
          <LiveVoiceWaveform colorClass="bg-teal-600 dark:bg-teal-400" />
        )}
        {isListening && (
          <LiveVoiceWaveform colorClass="bg-sky-600 dark:bg-sky-400" />
        )}
        {isProcessing && (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-600 dark:text-amber-400 shrink-0" />
        )}
        <span className="truncate">
          {BOTTOM_HELPERS[normalizedState] ?? BOTTOM_HELPERS.idle}
        </span>
      </div>
    </div>
  )
}