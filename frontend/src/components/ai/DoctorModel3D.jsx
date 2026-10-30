// src/components/ai/DoctorModel3D.jsx
// Realistic 3D Human Doctor Model for Telehealth AI Consultation.
// Features:
//  - Anatomical procedural Indian human doctor model with organic adult proportions
//  - Head & Shoulders webcam framing (doctor occupies ~68% of frame with proper headroom)
//  - LipSyncController with multi-frequency speech cadence, vowel modulation & natural conversational pauses
//  - FacialExpressionController with randomized single/double blinking, eyelid folds, eyebrow kinematics & gaze saccades
//  - Tailored white lab coat, teal scrubs, stethoscope, MediNest ID badge & modern thin wireframe glasses
//  - State-driven reactive micro-kinematics: IDLE, LISTENING, PROCESSING, SPEAKING, EMERGENCY
//  - Subconscious breathing & professional telemedicine clinic background

import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* ================================================================
   1. LipSyncController Architecture
   ================================================================ */
export class LipSyncController {
  constructor() {
    this.currentOpenness = 0
    this.targetOpenness = 0
    this.syllablePhase = 0
    this.pauseTimer = 0
    this.isPausing = false
    this.isActive = false
    this.mouthWidth = 1
  }

  start() {
    this.isActive = true
  }

  stop() {
    this.isActive = false
    this.targetOpenness = 0
  }

  update(delta, isSpeaking) {
    if (!isSpeaking && !this.isActive) {
      this.currentOpenness = THREE.MathUtils.lerp(this.currentOpenness, 0, delta * 18)
      this.mouthWidth = THREE.MathUtils.lerp(this.mouthWidth, 1, delta * 18)
      return { openness: this.currentOpenness, width: this.mouthWidth }
    }

    // Conversational pauses between phrases to simulate human speech pacing
    this.pauseTimer += delta
    if (this.pauseTimer > 1.7) {
      this.isPausing = Math.random() < 0.22
      this.pauseTimer = 0
    }

    if (this.isPausing) {
      this.targetOpenness = 0.03
      this.mouthWidth = 1.0
    } else {
      this.syllablePhase += delta * 14.2

      // Natural speech cadence (pacing + vowel variations + consonant transitions)
      const primarySyllable = Math.sin(this.syllablePhase) * 0.35
      const vowelResonance  = Math.sin(this.syllablePhase * 0.54 + 0.9) * 0.25
      const consonantDip    = Math.cos(this.syllablePhase * 1.74) * 0.12
      const naturalBase     = 0.28

      const raw = naturalBase + primarySyllable + vowelResonance + consonantDip
      this.targetOpenness = Math.max(0.02, Math.min(0.80, raw))
      this.mouthWidth = 1.0 + (this.targetOpenness * 0.14)
    }

    this.currentOpenness = THREE.MathUtils.lerp(this.currentOpenness, this.targetOpenness, delta * 20)
    return { openness: this.currentOpenness, width: this.mouthWidth }
  }
}

/* ================================================================
   2. FacialExpressionController Architecture
   ================================================================ */
export class FacialExpressionController {
  constructor() {
    this.blinkTimer = 3.2
    this.isBlinking = false
    this.blinkProgress = 0
    this.blinkDuration = 0.14
    this.isDoubleBlink = false
    this.doubleBlinkPending = false
    this.gazeSaccadeTimer = 3.8
    this.gazeOffset = new THREE.Vector2(0, 0)
    this.browLift = 0
  }

  update(delta, state, isSpeaking, isListening) {
    // ── Eye Blinking (Randomized interval 2.5s - 5.0s with occasional double blink) ──
    this.blinkTimer -= delta
    if (this.blinkTimer <= 0 && !this.isBlinking) {
      this.isBlinking = true
      this.blinkProgress = 0
      this.blinkDuration = 0.13 + Math.random() * 0.04
      this.isDoubleBlink = Math.random() < 0.2 // 20% chance of realistic double-blink
      this.blinkTimer = 2.5 + Math.random() * 2.5
    }

    let eyeBlinkFactor = 0
    if (this.isBlinking) {
      this.blinkProgress += delta
      const progress = this.blinkProgress / this.blinkDuration

      if (progress >= 1) {
        if (this.isDoubleBlink && !this.doubleBlinkPending) {
          this.doubleBlinkPending = true
          this.blinkProgress = 0
          this.blinkDuration = 0.11
        } else {
          this.isBlinking = false
          this.doubleBlinkPending = false
          this.isDoubleBlink = false
          eyeBlinkFactor = 0
        }
      } else {
        // Smooth non-linear blink curve (fast close, smooth open)
        eyeBlinkFactor = Math.sin(progress * Math.PI)
      }
    }

    // ── Gaze Micro-Saccades (Doctor maintains natural camera eye contact) ──
    this.gazeSaccadeTimer -= delta
    if (this.gazeSaccadeTimer <= 0) {
      this.gazeSaccadeTimer = 3.2 + Math.random() * 3.0
      if (state === 'processing') {
        // Subtle downward/side thoughtful glance during processing
        this.gazeOffset.set(-0.006, -0.005)
      } else {
        // Looking directly at camera with tiny lifelike adjustments
        this.gazeOffset.set(
          (Math.random() - 0.5) * 0.006,
          (Math.random() - 0.5) * 0.004
        )
      }
    }

    // ── Eyebrow State-Driven Kinematics ──
    let targetBrowLift = 0
    if (state === 'listening' || isListening) {
      targetBrowLift = 0.005 // Attentive raised brows
    } else if (state === 'processing') {
      targetBrowLift = -0.003 // Concentrated slight brow furrow
    } else if (state === 'emergency') {
      targetBrowLift = -0.006 // Serious concerned expression
    } else if (state === 'speaking' || isSpeaking) {
      targetBrowLift = 0.003 * Math.sin(this.blinkTimer * 4) // Conversational emphasis
    }
    this.browLift = THREE.MathUtils.lerp(this.browLift, targetBrowLift, delta * 6)

    return {
      eyeBlinkFactor,
      gazeOffset: this.gazeOffset,
      browLift: this.browLift,
    }
  }
}

/* ================================================================
   3. Realistic Procedural Doctor Mesh (Webcam Telehealth Framing)
   ================================================================ */
function ProceduralDoctorMesh({ state, isSpeaking, isListening }) {
  const groupRef      = useRef()
  const headGroupRef  = useRef()
  const jawRef        = useRef()
  const eyeLeftRef    = useRef()
  const eyeRightRef   = useRef()
  const browLeftRef   = useRef()
  const browRightRef  = useRef()
  const torsoRef      = useRef()

  const lipSync = useMemo(() => new LipSyncController(), [])
  const facial  = useMemo(() => new FacialExpressionController(), [])

  // Listening nod timing
  const nodTimerRef = useRef(0)

  useFrame((sceneState, delta) => {
    const time = sceneState.clock.getElapsedTime()
    const isActuallySpeaking = state === 'speaking' || isSpeaking
    const isActuallyListening = state === 'listening' || isListening

    // ── 1. Subconscious Breathing (Chest/Shoulders ~0.5% scale) ──
    const breathCycle = Math.sin(time * 1.5)
    const breath = breathCycle * 0.005

    if (torsoRef.current) {
      torsoRef.current.position.y = -0.38 + breath * 0.5
      torsoRef.current.scale.x = 1 + breath * 0.18
    }

    // ── 2. Natural Blinking, Eyebrows & Gaze Controller ──
    const { eyeBlinkFactor, gazeOffset, browLift } = facial.update(delta, state, isActuallySpeaking, isActuallyListening)

    // Smooth eyelid closure
    const eyeScaleY = Math.max(0.08, 1 - eyeBlinkFactor * 0.92)
    if (eyeLeftRef.current && eyeRightRef.current) {
      eyeLeftRef.current.scale.y = eyeScaleY
      eyeRightRef.current.scale.y = eyeScaleY

      // Subtle gaze adjustments
      eyeLeftRef.current.position.x = -0.052 + gazeOffset.x
      eyeLeftRef.current.position.y = 0.015 + gazeOffset.y
      eyeRightRef.current.position.x = 0.052 + gazeOffset.x
      eyeRightRef.current.position.y = 0.015 + gazeOffset.y
    }

    // Dynamic Eyebrows
    if (browLeftRef.current && browRightRef.current) {
      browLeftRef.current.position.y = 0.046 + browLift
      browRightRef.current.position.y = 0.046 + browLift
    }

    // ── 3. State-Driven Head Postures & Conversational Movement ──
    if (headGroupRef.current) {
      let targetRotX = breath * 0.12
      let targetRotY = 0
      let targetRotZ = 0
      let targetPosY = 0.14 + breath

      if (isActuallyListening) {
        // Attentive forward inclination (+0.045 rad) + natural listening nod
        targetRotX = 0.045 + Math.sin(time * 2.0) * 0.004
        targetRotY = 0.018
        targetPosY = 0.146

        nodTimerRef.current += delta
        if (nodTimerRef.current > 4.0) {
          targetRotX += Math.sin((nodTimerRef.current - 4.0) * 5.2) * 0.018
          if (nodTimerRef.current > 5.0) {
            nodTimerRef.current = 0
          }
        }
      } else if (state === 'processing') {
        // Thoughtful upward & slight side contemplation
        targetRotX = -0.02
        targetRotY = -0.03 + Math.sin(time * 1.3) * 0.006
        targetRotZ = 0.012
      } else if (isActuallySpeaking) {
        // Conversational cadence (emphasis nods and subtle head tilt)
        const speakingNod = Math.sin(time * 7.2) * 0.012 + Math.cos(time * 3.6) * 0.006
        const speakingSway = Math.sin(time * 2.0) * 0.008
        targetRotX = speakingNod
        targetRotY = speakingSway
      } else if (state === 'emergency') {
        // Direct, serious, steady gaze
        targetRotX = 0.006
        targetRotY = 0
      } else {
        // IDLE: subtle resting micro-movement
        targetRotY = Math.sin(time * 0.7) * 0.005
      }

      headGroupRef.current.rotation.x = THREE.MathUtils.lerp(headGroupRef.current.rotation.x, targetRotX, delta * 8)
      headGroupRef.current.rotation.y = THREE.MathUtils.lerp(headGroupRef.current.rotation.y, targetRotY, delta * 8)
      headGroupRef.current.rotation.z = THREE.MathUtils.lerp(headGroupRef.current.rotation.z, targetRotZ, delta * 8)
      headGroupRef.current.position.y = THREE.MathUtils.lerp(headGroupRef.current.position.y, targetPosY, delta * 8)
    }

    // ── 4. Lip-Sync & Jaw Kinematics ──
    const { openness, width } = lipSync.update(delta, isActuallySpeaking)
    if (jawRef.current) {
      jawRef.current.rotation.x = openness * 0.25
      jawRef.current.scale.y = 1 + openness * 0.28
      jawRef.current.scale.x = width
      jawRef.current.position.y = -0.082 - openness * 0.01
    }
  })

  // ── Realistic Medical Palette (Warm Indian Physician) ──
  const skinTone    = '#CE966E' // Natural warm matte South Asian skin tone
  const coatWhite   = '#F8FAFC' // Natural fabric off-white
  const scrubTeal   = '#0D766E' // Professional medical scrub teal
  const hairDark    = '#1A1412' // Dark natural Indian hair
  const stethTubing = '#1E293B' // Matte black flexible medical PVC
  const stethMetal  = '#E2E8F0' // High-grade surgical stainless steel
  const lipTone     = '#B2645F' // Natural lip pigmentation

  return (
    <group ref={groupRef} position={[0, -0.03, 0]}>
      {/* ── CLINICAL TELEMEDICINE ROOM BACKGROUND (Soft Depth) ── */}
      <group position={[0, 0, -1.8]}>
        {/* Soft Consultation Room Wall */}
        <mesh position={[0, 0.2, 0]}>
          <planeGeometry args={[6.5, 4.5]} />
          <meshStandardMaterial color="#0B132B" roughness={0.92} />
        </mesh>
        {/* Blurred Medical Credential / Certificate Frame */}
        <mesh position={[-1.05, 0.32, 0.05]}>
          <boxGeometry args={[0.55, 0.38, 0.02]} />
          <meshStandardMaterial color="#1C2541" roughness={0.75} />
        </mesh>
        <mesh position={[-1.05, 0.32, 0.065]}>
          <planeGeometry args={[0.49, 0.32]} />
          <meshBasicMaterial color="#334155" opacity={0.4} transparent />
        </mesh>
        {/* Ambient Clinic Office Lamp Glow */}
        <mesh position={[1.15, 0.45, 0.05]}>
          <circleGeometry args={[0.2, 24]} />
          <meshBasicMaterial color="#38BDF8" opacity={0.12} transparent />
        </mesh>
      </group>

      {/* ── TORSO & TAILORED MEDICAL LAB COAT ── */}
      <group ref={torsoRef} position={[0, -0.38, 0]}>
        {/* Inner Teal Clinical Scrubs */}
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.26, 0.32, 0.42, 32]} />
          <meshStandardMaterial color={scrubTeal} roughness={0.65} />
        </mesh>

        {/* V-Neck Scrub Opening */}
        <mesh position={[0, 0.23, 0.14]} rotation={[0.34, 0, 0]}>
          <boxGeometry args={[0.095, 0.095, 0.025]} />
          <meshStandardMaterial color={skinTone} roughness={0.72} metalness={0.02} />
        </mesh>

        {/* White Lab Coat Body (Fabric wrap) */}
        <mesh position={[0, 0.06, 0.02]}>
          <cylinderGeometry args={[0.29, 0.35, 0.44, 32, 1, false, 0, Math.PI * 1.74]} />
          <meshStandardMaterial color={coatWhite} roughness={0.55} />
        </mesh>

        {/* Tailored Coat Lapels (Left & Right) */}
        <mesh position={[-0.08, 0.15, 0.16]} rotation={[0, 0.23, -0.16]}>
          <boxGeometry args={[0.058, 0.24, 0.02]} />
          <meshStandardMaterial color={coatWhite} roughness={0.5} />
        </mesh>
        <mesh position={[0.08, 0.15, 0.16]} rotation={[0, -0.23, 0.16]}>
          <boxGeometry args={[0.058, 0.24, 0.02]} />
          <meshStandardMaterial color={coatWhite} roughness={0.5} />
        </mesh>

        {/* MediNest ID Card & Green Lanyard */}
        <group position={[-0.13, 0.10, 0.16]} rotation={[0, 0.24, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.052, 0.078, 0.006]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.022, 0.004]}>
            <boxGeometry args={[0.044, 0.014, 0.003]} />
            <meshStandardMaterial color="#0D9488" roughness={0.2} />
          </mesh>
          <mesh position={[-0.008, -0.008, 0.004]}>
            <boxGeometry args={[0.02, 0.026, 0.002]} />
            <meshStandardMaterial color="#475569" roughness={0.4} />
          </mesh>
        </group>

        {/* Realistic Stethoscope Assembly */}
        <group position={[0, 0.22, 0.12]}>
          {/* Neck Y-Loop */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.14, 0.012, 16, 32, Math.PI]} />
            <meshStandardMaterial color={stethTubing} roughness={0.45} />
          </mesh>
          {/* Left Hanging Tube */}
          <mesh position={[-0.08, -0.09, 0.05]} rotation={[0.1, 0, 0.14]}>
            <cylinderGeometry args={[0.008, 0.008, 0.19, 16]} />
            <meshStandardMaterial color={stethTubing} roughness={0.45} />
          </mesh>
          {/* Right Hanging Tube to Chest Piece */}
          <mesh position={[0.06, -0.10, 0.05]} rotation={[0.14, 0, -0.16]}>
            <cylinderGeometry args={[0.008, 0.008, 0.21, 16]} />
            <meshStandardMaterial color={stethTubing} roughness={0.45} />
          </mesh>
          {/* Surgical Stainless Steel Chest Piece */}
          <mesh position={[0.065, -0.19, 0.06]} rotation={[0.45, 0, 0]}>
            <cylinderGeometry args={[0.028, 0.028, 0.012, 24]} />
            <meshStandardMaterial color={stethMetal} metalness={0.92} roughness={0.14} />
          </mesh>
        </group>

        {/* Natural Shoulders */}
        <mesh position={[-0.28, 0.16, 0]} rotation={[0, 0, 0.22]}>
          <sphereGeometry args={[0.105, 24, 24]} />
          <meshStandardMaterial color={coatWhite} roughness={0.55} />
        </mesh>
        <mesh position={[0.28, 0.16, 0]} rotation={[0, 0, -0.22]}>
          <sphereGeometry args={[0.105, 24, 24]} />
          <meshStandardMaterial color={coatWhite} roughness={0.55} />
        </mesh>
      </group>

      {/* ── HEAD & FACIAL KINEMATICS GROUP ── */}
      <group ref={headGroupRef} position={[0, 0.14, 0]}>
        {/* Slender Anatomical Neck */}
        <mesh position={[0, -0.14, 0]}>
          <cylinderGeometry args={[0.065, 0.082, 0.14, 24]} />
          <meshStandardMaterial color={skinTone} roughness={0.72} metalness={0.02} />
        </mesh>

        {/* Anatomical Head Cranium */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.165, 32, 32]} scale={[0.88, 1.05, 0.94]} />
          <meshStandardMaterial color={skinTone} roughness={0.72} metalness={0.02} />
        </mesh>

        {/* Cheeks & Jaw Structure (Narrow anatomical taper) */}
        <mesh position={[0, -0.04, 0.035]} scale={[0.82, 0.88, 0.88]}>
          <sphereGeometry args={[0.14, 24, 24]} />
          <meshStandardMaterial color={skinTone} roughness={0.72} metalness={0.02} />
        </mesh>

        {/* Chin Contour */}
        <mesh position={[0, -0.12, 0.10]} scale={[0.72, 0.62, 0.72]}>
          <sphereGeometry args={[0.042, 16, 16]} />
          <meshStandardMaterial color={skinTone} roughness={0.72} metalness={0.02} />
        </mesh>

        {/* Nasolabial and Philtrum Volume */}
        <mesh position={[0, -0.06, 0.128]}>
          <boxGeometry args={[0.028, 0.03, 0.015]} />
          <meshStandardMaterial color={skinTone} roughness={0.72} metalness={0.02} />
        </mesh>

        {/* Professional Layered Hair (Indian Physician) */}
        <group position={[0, 0.035, -0.012]}>
          <mesh position={[0, 0.06, -0.018]} scale={[0.92, 0.95, 0.98]}>
            <sphereGeometry args={[0.17, 24, 24]} />
            <meshStandardMaterial color={hairDark} roughness={0.82} />
          </mesh>
          <mesh position={[-0.15, -0.025, 0.025]} rotation={[0, 0, 0.12]}>
            <boxGeometry args={[0.03, 0.095, 0.06]} />
            <meshStandardMaterial color={hairDark} roughness={0.82} />
          </mesh>
          <mesh position={[0.15, -0.025, 0.025]} rotation={[0, 0, -0.12]}>
            <boxGeometry args={[0.03, 0.095, 0.06]} />
            <meshStandardMaterial color={hairDark} roughness={0.82} />
          </mesh>
          {/* Front hairline locks framing temples */}
          <mesh position={[-0.095, 0.045, 0.085]} rotation={[0.2, 0.3, -0.1]}>
            <boxGeometry args={[0.042, 0.025, 0.02]} />
            <meshStandardMaterial color={hairDark} roughness={0.85} />
          </mesh>
          <mesh position={[0.095, 0.045, 0.085]} rotation={[0.2, -0.3, 0.1]}>
            <boxGeometry args={[0.042, 0.025, 0.02]} />
            <meshStandardMaterial color={hairDark} roughness={0.85} />
          </mesh>
        </group>

        {/* Eyebrows (Arched Natural Contour) */}
        <mesh ref={browLeftRef} position={[-0.052, 0.046, 0.142]} rotation={[0, 0, -0.06]}>
          <boxGeometry args={[0.044, 0.009, 0.009]} />
          <meshStandardMaterial color={hairDark} roughness={0.88} />
        </mesh>
        <mesh ref={browRightRef} position={[0.052, 0.046, 0.142]} rotation={[0, 0, 0.06]}>
          <boxGeometry args={[0.044, 0.009, 0.009]} />
          <meshStandardMaterial color={hairDark} roughness={0.88} />
        </mesh>

        {/* ── LEFT EYE WITH BLINK & GAZE ── */}
        <group ref={eyeLeftRef} position={[-0.052, 0.015, 0.134]}>
          {/* Sclera (White) */}
          <mesh>
            <sphereGeometry args={[0.022, 20, 20]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.12} />
          </mesh>
          {/* Iris (Dark Brown) */}
          <mesh position={[0, 0, 0.019]}>
            <cylinderGeometry args={[0.011, 0.011, 0.004, 20]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#24140D" roughness={0.25} />
          </mesh>
          {/* Pupil */}
          <mesh position={[0, 0, 0.021]}>
            <cylinderGeometry args={[0.005, 0.005, 0.004, 16]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#000000" roughness={0.1} />
          </mesh>
          {/* Corneal Specular Catchlight */}
          <mesh position={[-0.003, 0.003, 0.022]}>
            <sphereGeometry args={[0.0018, 8, 8]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          {/* Upper Eyelid Fold */}
          <mesh position={[0, 0.016, 0.016]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.028, 0.006, 0.008]} />
            <meshStandardMaterial color={skinTone} roughness={0.72} metalness={0.02} />
          </mesh>
        </group>

        {/* ── RIGHT EYE WITH BLINK & GAZE ── */}
        <group ref={eyeRightRef} position={[0.052, 0.015, 0.134]}>
          {/* Sclera (White) */}
          <mesh>
            <sphereGeometry args={[0.022, 20, 20]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.12} />
          </mesh>
          {/* Iris (Dark Brown) */}
          <mesh position={[0, 0, 0.019]}>
            <cylinderGeometry args={[0.011, 0.011, 0.004, 20]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#24140D" roughness={0.25} />
          </mesh>
          {/* Pupil */}
          <mesh position={[0, 0, 0.021]}>
            <cylinderGeometry args={[0.005, 0.005, 0.004, 16]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#000000" roughness={0.1} />
          </mesh>
          {/* Corneal Specular Catchlight */}
          <mesh position={[-0.003, 0.003, 0.022]}>
            <sphereGeometry args={[0.0018, 8, 8]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          {/* Upper Eyelid Fold */}
          <mesh position={[0, 0.016, 0.016]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.028, 0.006, 0.008]} />
            <meshStandardMaterial color={skinTone} roughness={0.72} metalness={0.02} />
          </mesh>
        </group>

        {/* Refined Nose Geometry */}
        <group position={[0, -0.02, 0.152]}>
          <mesh position={[0, 0.015, -0.006]} rotation={[0.18, 0, 0]}>
            <boxGeometry args={[0.016, 0.04, 0.02]} />
            <meshStandardMaterial color={skinTone} roughness={0.72} metalness={0.02} />
          </mesh>
          <mesh position={[0, -0.01, 0.004]}>
            <sphereGeometry args={[0.014, 16, 16]} scale={[1.1, 0.8, 1]} />
            <meshStandardMaterial color={skinTone} roughness={0.72} metalness={0.02} />
          </mesh>
        </group>

        {/* Subtle Ears */}
        <mesh position={[-0.16, 0.01, 0]} rotation={[0, -0.28, 0]}>
          <sphereGeometry args={[0.032, 16, 16]} scale={[0.38, 1.2, 0.8]} />
          <meshStandardMaterial color={skinTone} roughness={0.72} metalness={0.02} />
        </mesh>
        <mesh position={[0.16, 0.01, 0]} rotation={[0, 0.28, 0]}>
          <sphereGeometry args={[0.032, 16, 16]} scale={[0.38, 1.2, 0.8]} />
          <meshStandardMaterial color={skinTone} roughness={0.72} metalness={0.02} />
        </mesh>

        {/* ── MOUTH & LIP-SYNC JAW ASSEMBLY ── */}
        <group ref={jawRef} position={[0, -0.082, 0.138]}>
          {/* Upper Lip */}
          <mesh position={[0, 0.005, 0]}>
            <boxGeometry args={[0.044, 0.008, 0.01]} />
            <meshStandardMaterial color={lipTone} roughness={0.52} />
          </mesh>
          {/* Lower Lip */}
          <mesh position={[0, -0.005, 0]}>
            <boxGeometry args={[0.04, 0.01, 0.01]} />
            <meshStandardMaterial color={lipTone} roughness={0.52} />
          </mesh>
          {/* Inside Mouth Cavity */}
          <mesh position={[0, 0, -0.006]}>
            <boxGeometry args={[0.035, 0.014, 0.01]} />
            <meshBasicMaterial color="#30080C" />
          </mesh>
        </group>

        {/* Professional Wireframe Glasses with Transparent Lenses */}
        <group position={[0, 0.018, 0.155]}>
          {/* Bridge */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.03, 0.003, 0.003]} />
            <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Left Frame & Lens */}
          <mesh position={[-0.052, 0, 0]}>
            <torusGeometry args={[0.028, 0.003, 12, 24]} />
            <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[-0.052, 0, 0]}>
            <circleGeometry args={[0.025, 20]} />
            <meshStandardMaterial color="#38BDF8" opacity={0.08} transparent roughness={0.1} />
          </mesh>
          {/* Right Frame & Lens */}
          <mesh position={[0.052, 0, 0]}>
            <torusGeometry args={[0.028, 0.003, 12, 24]} />
            <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0.052, 0, 0]}>
            <circleGeometry args={[0.025, 20]} />
            <meshStandardMaterial color="#38BDF8" opacity={0.08} transparent roughness={0.1} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

/* ================================================================
   4. Main Export
   ================================================================ */
export default function DoctorModel3D({
  state = 'idle',
  isSpeaking = false,
  isListening = false,
  language = 'en-IN',
}) {
  return (
    <ProceduralDoctorMesh
      state={state}
      isSpeaking={isSpeaking}
      isListening={isListening}
      language={language}
    />
  )
}
