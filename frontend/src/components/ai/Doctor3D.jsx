// src/components/ai/Doctor3D.jsx
// Telehealth Video Consultation 3D Doctor Component.
// Renders an interactive 3D AI Doctor in a clinical consultation video frame.
// Includes WebGL fallback to AIAvatar2D if WebGL is unavailable or errors occur.

import React, { Component, Suspense, useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  AlertTriangle,
  CheckCircle2,
  HeartPulse,
  Loader2,
  Maximize2,
  Mic,
  MicOff,
  Minimize2,
  ShieldCheck,
  User,
  Video,
  Volume2,
} from 'lucide-react'

import DoctorModel3D from './DoctorModel3D'
import AIAvatar2D from './AIAvatar2D'

/* ================================================================
   Error Boundary for 3D Canvas (Graceful Fallback to 2D)
   ================================================================ */
class ThreeErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.warn('Doctor3D WebGL render error. Falling back to 2D avatar:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

/* ================================================================
   Lighting Rig: Professional Telehealth Portrait Studio
   ================================================================ */
function ClinicalStudioLighting({ state }) {
  const rimColor =
    state === 'emergency'
      ? '#EF4444'
      : state === 'listening'
      ? '#38BDF8'
      : state === 'processing'
      ? '#F59E0B'
      : state === 'speaking'
      ? '#14B8A6'
      : '#E0F2FE'

  const rimIntensity = state === 'emergency' ? 2.4 : 1.35

  return (
    <>
      {/* Soft ambient clinic fill */}
      <ambientLight intensity={1.05} />

      {/* Main Key Light (Soft Warm-White Studio from front-left) */}
      <directionalLight position={[1.2, 1.5, 2.0]} intensity={1.3} color="#FFFDF7" />

      {/* Fill Light (Soft Cool Medical Neutral from front-right) */}
      <directionalLight position={[-1.3, 0.8, 1.4]} intensity={0.6} color="#E2EEF8" />

      {/* Rim / Backlight (Subtle Edge Glow) */}
      <spotLight
        position={[0, 1.8, -1.5]}
        intensity={rimIntensity}
        color={rimColor}
        angle={0.65}
        penumbra={0.85}
      />
    </>
  )
}

/* ================================================================
   Live Voice Waveform for Video Frame Overlay
   ================================================================ */
function LiveCallWaveform({ colorClass = 'bg-sky-400' }) {
  return (
    <div
      className="flex items-center gap-[3px] h-4 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm"
      aria-hidden="true"
    >
      <span className={`w-[2.5px] rounded-full animate-vbar-1 ${colorClass}`} />
      <span className={`w-[2.5px] rounded-full animate-vbar-2 ${colorClass}`} />
      <span className={`w-[2.5px] rounded-full animate-vbar-3 ${colorClass}`} />
      <span className={`w-[2.5px] rounded-full animate-vbar-4 ${colorClass}`} />
      <span className={`w-[2.5px] rounded-full animate-vbar-5 ${colorClass}`} />
      <span className={`w-[2.5px] rounded-full animate-vbar-6 ${colorClass}`} />
      <span className={`w-[2.5px] rounded-full animate-vbar-7 ${colorClass}`} />
    </div>
  )
}

/* ================================================================
   Doctor3D Main Video-Call Component
   ================================================================ */
export default function Doctor3D({
  state = 'idle',
  isSpeaking = false,
  isListening = false,
  language = 'en-IN',
  size = 'large',
  onToggleViewMode = null,
  viewMode = '3d',
}) {
  const containerRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Standardize state
  const normalizedState = state === 'thinking' ? 'processing' : state
  const isEmergency = normalizedState === 'emergency'
  const isCurrentlyListening = normalizedState === 'listening' || isListening
  const isCurrentlySpeaking = normalizedState === 'speaking' || isSpeaking
  const isCurrentlyProcessing = normalizedState === 'processing'

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
    }
  }

  // Status text mapping
  const statusTexts = {
    idle: 'Ready to help',
    listening: 'Listening to you...',
    processing: 'Understanding your symptoms...',
    speaking: 'Doctor is speaking...',
    emergency: 'Emergency attention required',
  }

  return (
    <div
      ref={containerRef}
      className={[
        'relative flex w-full flex-col overflow-hidden rounded-3xl border transition-all duration-300',
        isEmergency
          ? 'border-red-400/80 bg-slate-950 shadow-red-500/20 shadow-xl'
          : isCurrentlyListening
          ? 'border-sky-300/80 bg-slate-950 shadow-sky-500/10 shadow-lg'
          : isCurrentlySpeaking
          ? 'border-teal-400/80 bg-slate-950 shadow-teal-500/10 shadow-lg'
          : 'border-slate-800 bg-slate-950 shadow-md',
        size === 'large' ? 'h-[390px] sm:h-[430px]' : 'h-[270px]',
      ].join(' ')}
      aria-label={`Telehealth Video Consultation with 3D AI Doctor (${normalizedState} state)`}
    >
      {/* ── 1. Video Call Top Bar Overlay ─────────────────────── */}
      <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-transparent px-4 py-3 text-white">
        {/* Doctor Info & HD Live Badge */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-600/90 text-white shadow-md shadow-teal-900/30">
            <Video className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wide text-white">
                MediNest AI Doctor
              </span>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-400 border border-emerald-500/30">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                ● HD LIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Dr. Ananya Sharma · AI Triage Specialist
            </p>
          </div>
        </div>

        {/* Video Call Controls (View switch, Fullscreen) */}
        <div className="flex items-center gap-1.5">
          {onToggleViewMode && (
            <button
              type="button"
              onClick={onToggleViewMode}
              className="rounded-lg bg-white/10 px-2 py-1 text-[10px] font-bold text-slate-200 backdrop-blur-md transition hover:bg-white/20"
              title="Switch between 3D & 2D consultation mode"
            >
              {viewMode === '3d' ? 'Switch to 2D' : 'Switch to 3D'}
            </button>
          )}

          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-slate-300 backdrop-blur-md transition hover:bg-white/20 hover:text-white"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* ── 2. 3D WebGL Canvas Scene (Chest-up Portrait Webcam Framing) ── */}
      <div className="relative h-full w-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
        <ThreeErrorBoundary
          fallback={
            <div className="flex h-full w-full items-center justify-center">
              <AIAvatar2D state={normalizedState} size={size} />
            </div>
          }
        >
          <Canvas
            camera={{ position: [0, 0.04, 1.75], fov: 25 }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            dpr={[1, 2]}
            className="h-full w-full"
          >
            <Suspense fallback={null}>
              <ClinicalStudioLighting state={normalizedState} />
              <DoctorModel3D
                state={normalizedState}
                isSpeaking={isCurrentlySpeaking}
                isListening={isCurrentlyListening}
                language={language}
              />
            </Suspense>
          </Canvas>
        </ThreeErrorBoundary>
      </div>

      {/* ── 3. Patient Self-View (Picture-in-Picture) ─────────── */}
      <div className="absolute right-3.5 bottom-14 z-20 flex flex-col items-center justify-center h-14 w-18 sm:h-16 sm:w-20 rounded-xl border border-white/20 bg-slate-900/80 shadow-md backdrop-blur-md">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-800/60 text-teal-200">
          <User className="h-3.5 w-3.5" />
        </div>
        <span className="text-[9px] font-bold text-slate-300 mt-0.5 tracking-wider">YOU</span>
      </div>

      {/* ── 4. Bottom Video Status & Waveform Banner ─────────── */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/80 px-3.5 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Status Indicator Icon */}
          {isEmergency ? (
            <span className="flex h-2 w-2 animate-ping rounded-full bg-red-500" />
          ) : isCurrentlyListening ? (
            <span className="flex h-2 w-2 animate-ping rounded-full bg-sky-400" />
          ) : isCurrentlySpeaking ? (
            <span className="flex h-2 w-2 animate-pulse rounded-full bg-teal-400" />
          ) : isCurrentlyProcessing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400 shrink-0" />
          ) : (
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          )}

          <span className="truncate text-slate-200">
            {statusTexts[normalizedState] ?? statusTexts.idle}
          </span>
        </div>

        {/* Live Frequency Waveform */}
        {isCurrentlySpeaking && (
          <LiveCallWaveform colorClass="bg-teal-400" />
        )}
        {isCurrentlyListening && (
          <LiveCallWaveform colorClass="bg-sky-400" />
        )}
      </div>

      {/* ── 5. Emergency Priority Border Glow Overlay ─────────── */}
      {isEmergency && (
        <div className="pointer-events-none absolute inset-0 rounded-3xl border-2 border-red-500 animate-pulse" />
      )}
    </div>
  )
}
