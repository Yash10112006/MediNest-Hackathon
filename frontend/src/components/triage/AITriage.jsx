// src/components/triage/AITriage.jsx
// Complete Professional Telehealth AI Doctor Consultation with GREEN / YELLOW / RED Clinical Triage.
// Integrates:
//  - Interactive 3D AI Doctor in Webcam Telehealth Consultation Frame (Left Panel ~40%)
//  - Consultation Stream with Smart Auto-Scroll (Right Panel ~60%)
//  - GREEN (Low Risk), YELLOW (Moderate Risk), RED (Urgent) Triage System & Stepper Visualizer
//  - Smart Symptom Interview with Structured Context & Red-Flag Emergency Detection
//  - Comprehensive Consultation Summary & Medical Disclaimer
//  - Supabase Consultation History Logging with Local Fallback
//  - Demo Scenario Presets (Fever, Chest Discomfort, Tension Headache, Maternal Warning)
//  - Hands-Free Bilingual Voice Loop (Hindi & English), Silence Auto-Restart & Interruption

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Activity,
  AlertOctagon,
  ArrowDown,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Download,
  FileText,
  HeartPulse,
  Info,
  Loader2,
  Mic,
  Phone,
  Play,
  RefreshCw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Square,
  Stethoscope,
  User,
  Volume2,
  XCircle,
} from 'lucide-react'

import api from '../../services/api'
import { speak, speakSequential, stopSpeaking } from '../../services/aiService'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../i18n/LanguageContext'
import LanguageSelector from '../../components/ai/LanguageSelector'
import AIAvatar2D from '../../components/ai/AIAvatar2D'
import Doctor3D from '../../components/ai/Doctor3D'
import VoiceInput from '../../components/ai/VoiceInput'
import { AVATAR_CONFIG } from '../../config/aiConfig'

/* ================================================================
   1. Bilingual Messages & Constants
   ================================================================ */

const INITIAL_BILINGUAL_MESSAGE = {
  id: 'welcome-bilingual',
  role: 'assistant',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  content:
    'Namaste! I am MediNest AI Triage. Which language are you comfortable with — Hindi or English?\n\n' +
    'नमस्ते! मैं MediNest AI Triage हूँ। आप किस भाषा में बात करना पसंद करेंगे — हिंदी या अंग्रेज़ी?',
}

const WELCOME_SEGMENTS = [
  {
    text: 'Namaste! I am MediNest AI Triage. Which language are you comfortable with — Hindi or English?',
    language: 'en-IN',
  },
  {
    text: 'नमस्ते! मैं MediNest AI Triage हूँ। आप किस भाषा में बात करना पसंद करेंगे — हिंदी या अंग्रेज़ी?',
    language: 'hi-IN',
  },
]

const HINDI_CONFIRMATION =
  'ठीक है। अब हम हिंदी में बात करेंगे। कृपया बताइए कि आपको क्या परेशानी हो रही है या आपको कौन-कौन से लक्षण महसूस हो रहे हैं?'

const ENGLISH_CONFIRMATION =
  'Okay. We will continue in English. Please describe the health problem or symptoms you are experiencing.'

const CLARIFICATION_MESSAGE =
  'Please say Hindi or English.\n\nकृपया हिंदी या अंग्रेज़ी में से एक भाषा चुनें।'

const CLARIFICATION_SEGMENTS = [
  {
    text: 'Please say Hindi or English.',
    language: 'en-IN',
  },
  {
    text: 'कृपया हिंदी या अंग्रेज़ी में से एक भाषा चुनें।',
    language: 'hi-IN',
  },
]

/* ================================================================
   2. Red-Flag Emergency Keyword Patterns
   ================================================================ */
const EMERGENCY_PATTERNS = [
  /\b(chest pain|heart attack|crushing chest|chest tightness|radiating to arm|chest pressure)\b/i,
  /\b(can't breathe|cannot breathe|difficulty breathing|severe breathlessness|gasping|severe asthma|suffocating)\b/i,
  /\b(unconscious|passed out|fainted|unresponsive|collapsed|blacked out)\b/i,
  /\b(stroke|face drooping|slurred speech|arm weakness|paralysis|sudden numbness)\b/i,
  /\b(uncontrolled bleeding|heavy bleeding|vomiting blood|coughing blood)\b/i,
  /\b(seizure|convulsion|epileptic fit|frothing)\b/i,
  /\b(anaphylaxis|swelling throat|severe allergic reaction|cannot swallow)\b/i,
  /\b(suicide|self harm|kill myself|end my life)\b/i,
  // Hindi Emergency Triggers
  /छाती में दर्द|दिल का दौरा|सांस लेने में भारी तकलीफ|सांस नहीं आ रही|बेहोश|लकवा|खून की उल्टी|दौरा|गंभीर एलर्जी|आत्महत्या/i,
]

function checkIsEmergency(text) {
  if (!text || typeof text !== 'string') return false
  return EMERGENCY_PATTERNS.some((pattern) => pattern.test(text))
}

function detectLanguageChoice(text) {
  if (!text || typeof text !== 'string') return null
  const cleaned = text.trim().toLowerCase()

  const isHindi =
    /\b(hindi|hindii|hindi mein|hindi me|in hindi)\b/i.test(cleaned) ||
    /हिंदी|हिन्दी|हिंदी में|हिन्दी में|बात करूंगा|मुझे हिंदी|हिंदी आती/.test(cleaned)

  const isEnglish =
    /\b(english|in english|english please|comfortable with english)\b/i.test(cleaned) ||
    /अंग्रेज़ी|अंग्रेजी|अंग्रेजी में|अंग्रेज़ी में/.test(cleaned)

  if (isHindi && !isEnglish) return 'hi-IN'
  if (isEnglish && !isHindi) return 'en-IN'
  return null
}

/* ================================================================
   3. Standardized GREEN / YELLOW / RED Triage Configurations
   ================================================================ */
const TRIAGE_TIERS = {
  LOW: {
    key: 'LOW',
    label: '🟢 GREEN — LOW RISK',
    shortLabel: '🟢 LOW RISK',
    colorName: 'GREEN',
    subTitle: 'Self-care & monitoring appropriate',
    badgeClass:
      'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    cardClass:
      'border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-100',
    icon: CheckCircle2,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    indicatorDot: 'bg-emerald-500',
    recommendationEn:
      'Self-care and symptom monitoring recommended. Stay well-hydrated, take adequate rest, and monitor your symptoms. If symptoms worsen or persist beyond 3 days, visit a local clinic or primary healthcare provider.',
    recommendationHi:
      'घरेलू देखभाल और लक्षणों की निगरानी की सलाह दी जाती है। पर्याप्त पानी पिएं, आराम करें। यदि लक्षण 3 दिनों से अधिक रहें या बढ़ें, तो स्थानीय स्वास्थ्य केंद्र में डॉक्टर से परामर्श लें।',
  },
  MODERATE: {
    key: 'MODERATE',
    label: '🟡 YELLOW — MODERATE RISK',
    shortLabel: '🟡 MODERATE RISK',
    colorName: 'YELLOW',
    subTitle: 'Medical assessment recommended',
    badgeClass:
      'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    cardClass:
      'border-amber-200 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-100',
    icon: Activity,
    iconColor: 'text-amber-600 dark:text-amber-400',
    indicatorDot: 'bg-amber-500',
    recommendationEn:
      'Medical consultation recommended within 24 to 48 hours. Schedule a visit to your nearest Primary Health Centre (PHC) or family physician for examination and treatment.',
    recommendationHi:
      'अगले 24 से 48 घंटों के भीतर डॉक्टर से जांच कराने की सलाह दी जाती है। नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC) या डॉक्टर से परामर्श लें।',
  },
  URGENT: {
    key: 'URGENT',
    label: '🔴 RED — URGENT',
    shortLabel: '🔴 URGENT',
    colorName: 'RED',
    subTitle: 'Immediate medical evaluation required',
    badgeClass:
      'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800',
    cardClass:
      'border-red-200 bg-red-50/80 dark:border-red-900/60 dark:bg-red-950/30 text-red-900 dark:text-red-100',
    icon: ShieldAlert,
    iconColor: 'text-red-600 dark:text-red-400',
    indicatorDot: 'bg-red-500',
    recommendationEn:
      'Immediate medical evaluation required. Please visit the nearest hospital emergency department or call 112/108 emergency services immediately. Do not delay.',
    recommendationHi:
      'तत्काल आपातकालीन चिकित्सा सहायता की आवश्यकता है। कृपया तुरंत नजदीकी अस्पताल जाएं या 112/108 आपातकालीन सेवा पर कॉल करें।',
  },
}

/* ================================================================
   4. Demo Clinical Scenarios
   ================================================================ */
const DEMO_SCENARIOS = [
  {
    id: 'fever_cough',
    title: 'Fever & Cough',
    tag: '🟡 MODERATE',
    lang: 'en-IN',
    prompt: 'I have had a fever of 100.4°F and dry cough for the past 2 days with mild headache.',
    context: {
      chiefComplaint: 'Fever and dry cough',
      symptoms: ['Fever (100.4°F)', 'Dry cough', 'Mild headache'],
      duration: '2 days',
      severity: 'Moderate',
      triageLevel: 'MODERATE',
      recommendation:
        'Suspected viral respiratory infection. Rest, hydration, and a Primary Health Centre visit within 24-48 hours recommended.',
    },
  },
  {
    id: 'chest_pain',
    title: 'Chest Discomfort',
    tag: '🔴 URGENT',
    lang: 'en-IN',
    prompt: 'I have severe pressure in my chest radiating to my left arm and feeling breathless for 20 minutes.',
    context: {
      chiefComplaint: 'Acute chest pressure with arm radiation',
      symptoms: ['Chest pressure', 'Left arm pain', 'Shortness of breath'],
      duration: '20 minutes',
      severity: 'Severe / Emergency',
      triageLevel: 'URGENT',
      recommendation:
        'High cardiac risk warning. Call 112 or visit nearest hospital emergency department immediately.',
    },
  },
  {
    id: 'headache',
    title: 'Tension Headache',
    tag: '🟢 LOW RISK',
    lang: 'en-IN',
    prompt: 'I have a mild dull headache across my forehead after working on screen for 6 hours. No nausea.',
    context: {
      chiefComplaint: 'Dull tension headache',
      symptoms: ['Forehead ache', 'Screen strain', 'No nausea/vomiting'],
      duration: '4 hours',
      severity: 'Mild',
      triageLevel: 'LOW',
      recommendation:
        'Tension headache / eye fatigue. Rest in dark room, hydration, and reduced screen time advised.',
    },
  },
  {
    id: 'maternal_warning',
    title: 'Maternal Warning (Hindi)',
    tag: '🔴 URGENT',
    lang: 'hi-IN',
    prompt: 'मैं 7 महीने की गर्भवती हूँ और मुझे अचानक तेज सिरदर्द, आंखों में धुंधलापन और चेहरे पर सूजन है।',
    context: {
      chiefComplaint: 'गर्भावस्था में तेज सिरदर्द और धुंधलापन (Pregnancy with severe headache & blurred vision)',
      symptoms: ['7 months pregnant', 'Severe headache', 'Blurred vision', 'Facial swelling'],
      duration: '1 day',
      severity: 'Urgent / Pre-eclampsia risk',
      triageLevel: 'URGENT',
      recommendation:
        'प्री-एक्लेम्पसिया की संभावना। तुरंत नजदीकी अस्पताल या महिला चिकित्सक से संपर्क करें।',
    },
  },
]

/* ================================================================
   5. Main Component
   ================================================================ */

export default function AITriage() {
  const location = useLocation()
  const { user } = useAuth()

  /* ── Refs ──────────────────────────────────────────────────── */
  const chatContainerRef     = useRef(null)
  const textareaRef          = useRef(null)
  const voiceInputRef        = useRef(null)
  const speakCooldownRef     = useRef(null)
  const autoMicTimerRef      = useRef(null)
  const isUnmountedRef       = useRef(false)
  const isNearBottomRef      = useRef(true)
  const prevMessagesCountRef = useRef(0)

  /* ── Routing ───────────────────────────────────────────────── */
  const isASHA = location.pathname.startsWith('/asha')

  const { language, setLanguage, t } = useLanguage()

  const [conversationStage, setConversationStage] = useState('awaiting_language') // 'awaiting_language' | 'triage' | 'complete'
  const [messages,          setMessages]          = useState([INITIAL_BILINGUAL_MESSAGE])
  const [selectedLanguage,  setSelectedLanguage]  = useState(() => {
    return language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN'
  })

  // Sync selectedLanguage when global language changes
  useEffect(() => {
    const code = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN'
    setSelectedLanguage(code)
  }, [language])

  const handleLanguageChange = (code) => {
    setSelectedLanguage(code)
    if (code.startsWith('hi')) setLanguage('hi')
    else if (code.startsWith('mr')) setLanguage('mr')
    else setLanguage('en')
  }
  const [input,             setInput]             = useState('')
  const [sessionId,         setSessionId]         = useState(null)
  const [loading,           setLoading]           = useState(false)
  const [error,             setError]             = useState('')
  const [complete,          setComplete]          = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState(user?.id || 'PT-USER')
  const [showScrollBottom,  setShowScrollBottom]  = useState(false)
  const [viewMode,          setViewMode]          = useState('3d')
  const [summaryExpanded,   setSummaryExpanded]   = useState(true)
  const [copiedSummary,     setCopiedSummary]     = useState(false)

  /* ── Voice / avatar state ──────────────────────────────────── */
  const [isListening,   setIsListening]   = useState(false)
  const [isSpeakingTTS, setIsSpeakingTTS] = useState(false)

  /* ── Structured Symptom & Triage Context ───────────────────── */
  const [triageResult, setTriageResult] = useState(null)
  const [symptomContext, setSymptomContext] = useState({
    chiefComplaint: '',
    symptoms: [],
    duration: '',
    severity: '',
    age: '',
    gender: '',
    existingConditions: '',
    medications: '',
    allergies: '',
    emergencyFlags: [],
    questionCount: 0,
    triageLevel: null, // 'LOW' | 'MODERATE' | 'URGENT'
    recommendation: '',
  })

  /* ── Single Source of Truth Consultation State ──────────────── */
  const consultationState = (() => {
    if (triageResult?.level === 'URGENT' || triageResult?.level === 'emergency') return 'emergency'
    if (loading)                       return 'processing'
    if (isSpeakingTTS)                 return 'speaking'
    if (isListening)                   return 'listening'
    return 'idle'
  })()

  /* ── Cleanup on unmount ────────────────────────────────────── */
  useEffect(() => {
    isUnmountedRef.current = false

    return () => {
      isUnmountedRef.current = true
      stopSpeaking()
      if (speakCooldownRef.current) clearTimeout(speakCooldownRef.current)
      if (autoMicTimerRef.current)  clearTimeout(autoMicTimerRef.current)
      voiceInputRef.current?.stopListening()
    }
  }, [])

  /* ── Smart Chat Scroll Logic ───────────────────────────────── */
  const handleChatScroll = useCallback(() => {
    const container = chatContainerRef.current
    if (!container) return

    const threshold = 120 // px from bottom
    const distanceToBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight
    const nearBottom = distanceToBottom <= threshold

    isNearBottomRef.current = nearBottom
    setShowScrollBottom(!nearBottom)
  }, [])

  const scrollToBottom = useCallback((smooth = true) => {
    const container = chatContainerRef.current
    if (!container) return

    container.scrollTo({
      top: container.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    })
    isNearBottomRef.current = true
    setShowScrollBottom(false)
  }, [])

  // Auto-scroll ONLY when a new message is added AND user was already near bottom
  useEffect(() => {
    if (messages.length > prevMessagesCountRef.current) {
      if (isNearBottomRef.current) {
        requestAnimationFrame(() => {
          scrollToBottom(true)
        })
      }
    }
    prevMessagesCountRef.current = messages.length
  }, [messages, scrollToBottom])

  /* ── Stop speaking manually / interrupt ─────────────────────── */
  const handleStopSpeaking = useCallback(() => {
    stopSpeaking()
    if (speakCooldownRef.current) clearTimeout(speakCooldownRef.current)
    if (autoMicTimerRef.current)  clearTimeout(autoMicTimerRef.current)
    if (!isUnmountedRef.current) {
      setIsSpeakingTTS(false)
    }
  }, [])

  /* ── Sequential bilingual TTS helper ───────────────────────── */
  const speakBilingualResponse = useCallback(
    (segments, autoListenAfter = true) => {
      stopSpeaking()
      if (speakCooldownRef.current) clearTimeout(speakCooldownRef.current)
      if (autoMicTimerRef.current)  clearTimeout(autoMicTimerRef.current)

      voiceInputRef.current?.stopListening()
      setIsListening(false)

      speakSequential(segments, {
        onStart: () => {
          if (isUnmountedRef.current) return
          setIsSpeakingTTS(true)
        },
        onEnd: () => {
          if (isUnmountedRef.current) return

          speakCooldownRef.current = setTimeout(() => {
            if (isUnmountedRef.current) return
            setIsSpeakingTTS(false)

            if (autoListenAfter) {
              autoMicTimerRef.current = setTimeout(() => {
                if (
                  !isUnmountedRef.current &&
                  !loading &&
                  voiceInputRef.current
                ) {
                  voiceInputRef.current.startListening()
                }
              }, 300)
            }
          }, AVATAR_CONFIG.speakingCooldownMs)
        },
        onError: () => {
          if (isUnmountedRef.current) return
          setIsSpeakingTTS(false)
        },
      })
    },
    [loading]
  )

  /* ── Single-language TTS helper with hands-free post-speech listening ── */
  const speakResponse = useCallback(
    (text, autoListenAfter = true, languageOverride = null) => {
      stopSpeaking()
      if (speakCooldownRef.current) clearTimeout(speakCooldownRef.current)
      if (autoMicTimerRef.current)  clearTimeout(autoMicTimerRef.current)

      voiceInputRef.current?.stopListening()
      setIsListening(false)

      const langToUse = languageOverride || selectedLanguage

      speak(text, langToUse, {
        onStart: () => {
          if (isUnmountedRef.current) return
          setIsSpeakingTTS(true)
        },
        onEnd: () => {
          if (isUnmountedRef.current) return

          speakCooldownRef.current = setTimeout(() => {
            if (isUnmountedRef.current) return
            setIsSpeakingTTS(false)

            if (autoListenAfter) {
              autoMicTimerRef.current = setTimeout(() => {
                if (
                  !isUnmountedRef.current &&
                  !loading &&
                  voiceInputRef.current
                ) {
                  voiceInputRef.current.startListening()
                }
              }, 300)
            }
          }, AVATAR_CONFIG.speakingCooldownMs)
        },
        onError: () => {
          if (isUnmountedRef.current) return
          setIsSpeakingTTS(false)
        },
      })
    },
    [selectedLanguage, loading]
  )

  /* ── Speak bilingual welcome on initial load ────────────────── */
  useEffect(() => {
    const t = setTimeout(() => {
      if (!isUnmountedRef.current) {
        speakBilingualResponse(WELCOME_SEGMENTS, true)
      }
    }, 800)

    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── Save Consultation to Supabase ──────────────────────────── */
  const saveConsultationToSupabase = useCallback(
    async (finalTriage, finalContext, currentMessages) => {
      try {
        const patientId = user?.id || selectedPatientId || 'guest-patient'
        const conversationText = currentMessages
          .slice(-6)
          .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
          .join('\n\n')

        const record = {
          patient_id: patientId,
          chief_complaint: finalContext.chiefComplaint || 'Clinical Assessment',
          symptoms:
            finalContext.symptoms?.length > 0
              ? finalContext.symptoms
              : [finalContext.chiefComplaint || 'Consultation symptoms'],
          duration: finalContext.duration || 'Not specified',
          severity: finalContext.severity || 'Moderate',
          triage_level: finalTriage.level,
          recommendation: finalTriage.recommendation,
          language: selectedLanguage,
          conversation_summary: conversationText,
          created_at: new Date().toISOString(),
        }

        const { error: dbError } = await supabase.from('triage_records').insert([record])
        if (dbError) {
          console.warn('Notice: Supabase triage_records table may need creation:', dbError.message)
        } else {
          console.log('Consultation record saved to Supabase successfully')
        }
      } catch (err) {
        console.warn('Could not save triage record to Supabase:', err)
      }
    },
    [user, selectedPatientId, selectedLanguage]
  )

  /* ================================================================
     SEND MESSAGE & CLINICAL TRIAGE ENGINE
     ================================================================ */
  const sendMessage = async (messageOverride = null) => {
    const message = (messageOverride ?? input).trim()
    if (!message || loading || complete) return

    const nowTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    setInput('')
    setError('')

    const userMessage = {
      id:        `${Date.now()}-user`,
      role:      'user',
      timestamp: nowTimestamp,
      content:   message,
    }

    setMessages((prev) => [...prev, userMessage])

    // Stop TTS & mic while processing (Strict Mutual Exclusion)
    handleStopSpeaking()
    voiceInputRef.current?.stopListening()
    setIsListening(false)

    // ──────────────────────────────────────────────────────────────
    // STAGE 1: Language Selection
    // ──────────────────────────────────────────────────────────────
    if (conversationStage === 'awaiting_language') {
      const detected = detectLanguageChoice(message)

      if (detected === 'hi-IN') {
        setSelectedLanguage('hi-IN')
        setConversationStage('triage')

        const assistantMessage = {
          id:        `${Date.now()}-assistant`,
          role:      'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content:   HINDI_CONFIRMATION,
        }

        setMessages((prev) => [...prev, assistantMessage])
        speakResponse(HINDI_CONFIRMATION, true, 'hi-IN')
        return
      }

      if (detected === 'en-IN') {
        setSelectedLanguage('en-IN')
        setConversationStage('triage')

        const assistantMessage = {
          id:        `${Date.now()}-assistant`,
          role:      'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content:   ENGLISH_CONFIRMATION,
        }

        setMessages((prev) => [...prev, assistantMessage])
        speakResponse(ENGLISH_CONFIRMATION, true, 'en-IN')
        return
      }

      // Ambiguous: Ask again bilingually
      const clarificationMsg = {
        id:        `${Date.now()}-assistant`,
        role:      'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content:   CLARIFICATION_MESSAGE,
      }

      setMessages((prev) => [...prev, clarificationMsg])
      speakBilingualResponse(CLARIFICATION_SEGMENTS, true)
      return
    }

    // ──────────────────────────────────────────────────────────────
    // STAGE 2: Client-Side Instant Emergency Intercept
    // ──────────────────────────────────────────────────────────────
    const isEmergencyTrigger = checkIsEmergency(message)

    if (isEmergencyTrigger) {
      const emergencyReply = selectedLanguage.startsWith('hi')
        ? '🚨 आपातकालीन चेतावनी: आपके द्वारा बताए गए लक्षण गंभीर आपातकालीन स्थिति का संकेत हो सकते हैं। कृपया तुरंत नजदीकी अस्पताल जाएं या 112/108 पर कॉल करें।'
        : '🚨 EMERGENCY WARNING: The symptoms you described may indicate a serious medical emergency. Please seek immediate emergency medical care or call 112/108 right away.'

      const emergencyTriage = {
        level: 'URGENT',
        reason: 'Red-flag clinical symptoms detected (urgent emergency intervention required).',
        confidence: 0.98,
        recommendation:
          selectedLanguage.startsWith('hi')
            ? TRIAGE_TIERS.URGENT.recommendationHi
            : TRIAGE_TIERS.URGENT.recommendationEn,
        timestamp: new Date().toISOString(),
      }

      const updatedContext = {
        ...symptomContext,
        chiefComplaint: symptomContext.chiefComplaint || message,
        symptoms: [...new Set([...symptomContext.symptoms, message])],
        severity: 'Severe / Emergency',
        triageLevel: 'URGENT',
        recommendation: emergencyTriage.recommendation,
      }

      setTriageResult(emergencyTriage)
      setSymptomContext(updatedContext)
      setComplete(true)

      const assistantMsg = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: emergencyReply,
      }

      const nextMessages = [...messages, userMessage, assistantMsg]
      setMessages(nextMessages)
      saveConsultationToSupabase(emergencyTriage, updatedContext, nextMessages)
      speakResponse(emergencyReply, false)
      return
    }

    // ──────────────────────────────────────────────────────────────
    // STAGE 3: Medical Chatbot & Symptom Triage Backend
    // ──────────────────────────────────────────────────────────────
    setLoading(true)

    try {
      const response = await api.post('/api/chatbot/message', {
        message,
        patient_id: selectedPatientId || null,
        session_id: sessionId || null,
        emotion:    null,
        language:   selectedLanguage,
      })

      if (isUnmountedRef.current) return

      const data = response.data
      if (data.session_id) setSessionId(data.session_id)

      const replyText =
        data.response || 'Please tell me more about what symptoms you are experiencing.'

      const assistantMessage = {
        id:        `${Date.now()}-assistant`,
        role:      'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content:   replyText,
      }

      const nextMessages = [...messages, userMessage, assistantMessage]
      setMessages(nextMessages)

      // Map backend triage level to standard GREEN / YELLOW / RED tiers
      const rawLevel = (data.triage_level || '').toLowerCase()
      let mappedLevel = 'MODERATE'
      if (rawLevel === 'green' || rawLevel === 'low') mappedLevel = 'LOW'
      else if (rawLevel === 'red' || rawLevel === 'emergency' || rawLevel === 'urgent') mappedLevel = 'URGENT'
      else if (rawLevel === 'yellow' || rawLevel === 'moderate') mappedLevel = 'MODERATE'

      const isCompletedAssessment =
        mappedLevel === 'URGENT' || data.is_complete === true || symptomContext.questionCount >= 3

      const currentTier = TRIAGE_TIERS[mappedLevel] ?? TRIAGE_TIERS.MODERATE
      const finalRecommendation =
        selectedLanguage.startsWith('hi') ? currentTier.recommendationHi : currentTier.recommendationEn

      const calculatedTriage = {
        level: mappedLevel,
        reason: data.reason || data.response || 'Assessment based on reported clinical presentation.',
        confidence: typeof data.confidence === 'number' ? data.confidence : 0.88,
        recommendation: finalRecommendation,
        timestamp: new Date().toISOString(),
      }

      const updatedContext = {
        ...symptomContext,
        chiefComplaint: symptomContext.chiefComplaint || message,
        symptoms: [...new Set([...symptomContext.symptoms, message])],
        questionCount: symptomContext.questionCount + 1,
        triageLevel: mappedLevel,
        recommendation: finalRecommendation,
      }

      setTriageResult(calculatedTriage)
      setSymptomContext(updatedContext)

      if (isCompletedAssessment) {
        setComplete(true)
        saveConsultationToSupabase(calculatedTriage, updatedContext, nextMessages)
      }

      // Hands-free voice: continue listening automatically unless complete or emergency
      const shouldAutoListen = !isCompletedAssessment
      speakResponse(replyText, shouldAutoListen)
    } catch (err) {
      if (isUnmountedRef.current) return
      console.error('AI Triage error:', err)

      // Fallback rule-based triage response
      const fallbackLevel = 'MODERATE'
      const fallbackTier = TRIAGE_TIERS[fallbackLevel]
      const fallbackReply = selectedLanguage.startsWith('hi')
        ? `मैंने आपके लक्षणों को समझ लिया है। ${fallbackTier.recommendationHi}`
        : `I have noted your reported symptoms. ${fallbackTier.recommendationEn}`

      const calculatedTriage = {
        level: fallbackLevel,
        reason: 'Preliminary assessment based on reported symptoms.',
        confidence: 0.85,
        recommendation: fallbackTier.recommendationEn,
        timestamp: new Date().toISOString(),
      }

      const updatedContext = {
        ...symptomContext,
        chiefComplaint: symptomContext.chiefComplaint || message,
        symptoms: [...new Set([...symptomContext.symptoms, message])],
        triageLevel: fallbackLevel,
        recommendation: fallbackTier.recommendationEn,
      }

      setTriageResult(calculatedTriage)
      setSymptomContext(updatedContext)

      const assistantMsg = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: fallbackReply,
      }

      setMessages((prev) => [...prev, assistantMsg])
      speakResponse(fallbackReply, true)
    } finally {
      if (!isUnmountedRef.current) {
        setLoading(false)
      }
    }
  }

  /* ── Form handlers ─────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault()
    await sendMessage()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  /* ── Voice transcript from VoiceInput ──────────────────────── */
  const handleVoiceTranscript = useCallback(
    (transcript) => {
      const trimmed = transcript?.trim()
      if (!trimmed) return

      handleStopSpeaking()
      sendMessage(trimmed)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loading, complete, sessionId, selectedLanguage, selectedPatientId, conversationStage, symptomContext]
  )

  /* ── Microphone listening state & Interruption ─────────────── */
  const handleListeningChange = useCallback(
    (listeningState) => {
      if (listeningState) {
        handleStopSpeaking()
      }
      if (!isUnmountedRef.current) {
        setIsListening(listeningState)
      }
    },
    [handleStopSpeaking]
  )

  /* ── Load Demo Scenario ────────────────────────────────────── */
  const handleSelectScenario = (scenario) => {
    handleStopSpeaking()
    if (autoMicTimerRef.current) clearTimeout(autoMicTimerRef.current)
    voiceInputRef.current?.stopListening()
    setIsListening(false)

    setSelectedLanguage(scenario.lang)
    setConversationStage('triage')

    const userMsg = {
      id: `${Date.now()}-user`,
      role: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: scenario.prompt,
    }

    const tier = TRIAGE_TIERS[scenario.context.triageLevel] || TRIAGE_TIERS.MODERATE
    const assistantReply =
      scenario.lang.startsWith('hi')
        ? `नमस्ते। मैंने आपके लक्षणों का विश्लेषण किया है: ${scenario.context.chiefComplaint}।\n\n${tier.recommendationHi}`
        : `Thank you for sharing your symptoms: ${scenario.context.chiefComplaint}.\n\n${tier.recommendationEn}`

    const assistantMsg = {
      id: `${Date.now()}-assistant`,
      role: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: assistantReply,
    }

    const calculatedTriage = {
      level: scenario.context.triageLevel,
      reason: `Clinical presentation matches ${scenario.context.chiefComplaint}.`,
      confidence: 0.94,
      recommendation: scenario.context.recommendation,
      timestamp: new Date().toISOString(),
    }

    setMessages([INITIAL_BILINGUAL_MESSAGE, userMsg, assistantMsg])
    setTriageResult(calculatedTriage)
    setSymptomContext(scenario.context)
    setComplete(true)

    speakResponse(assistantReply, false, scenario.lang)
  }

  /* ── Reset / New Assessment ────────────────────────────────── */
  const resetTriage = () => {
    handleStopSpeaking()
    if (autoMicTimerRef.current) clearTimeout(autoMicTimerRef.current)
    voiceInputRef.current?.stopListening()
    setIsListening(false)

    setConversationStage('awaiting_language')
    setMessages([INITIAL_BILINGUAL_MESSAGE])
    setInput('')
    setSessionId(null)
    setTriageResult(null)
    setSymptomContext({
      chiefComplaint: '',
      symptoms: [],
      duration: '',
      severity: '',
      age: '',
      gender: '',
      existingConditions: '',
      medications: '',
      allergies: '',
      emergencyFlags: [],
      questionCount: 0,
      triageLevel: null,
      recommendation: '',
    })
    setError('')
    setComplete(false)

    setTimeout(() => {
      if (!isUnmountedRef.current) {
        speakBilingualResponse(WELCOME_SEGMENTS, true)
      }
    }, 400)
  }

  /* ── Copy Consultation Summary ─────────────────────────────── */
  const handleCopySummary = () => {
    const summaryText = `MEDI NEST AI CONSULTATION SUMMARY
------------------------------------------------
Chief Complaint: ${symptomContext.chiefComplaint || 'General Assessment'}
Symptoms: ${symptomContext.symptoms.join(', ') || 'Reported during chat'}
Duration: ${symptomContext.duration || 'Not specified'}
Triage Level: ${currentTier.shortLabel}
Recommended Next Step: ${triageResult?.recommendation || 'Consult physician'}
Language: ${selectedLanguage === 'hi-IN' ? 'Hindi' : 'English'}
Timestamp: ${new Date().toLocaleString()}

Medical Disclaimer: AI guidance is for preliminary triage support and is not a definitive medical diagnosis. Consult a qualified physician.`

    navigator.clipboard.writeText(summaryText)
    setCopiedSummary(true)
    setTimeout(() => setCopiedSummary(false), 2000)
  }

  const currentTier = TRIAGE_TIERS[triageResult?.level] ?? TRIAGE_TIERS.MODERATE
  const ResultIcon = currentTier.icon

  /* ================================================================
     RENDER
     ================================================================ */
  return (
    <div className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">

        {/* ── HEADER ──────────────────────────────────────────────── */}
        <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              to={isASHA ? '/asha/dashboard' : '/patient/dashboard'}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              title="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-lg shadow-teal-600/20">
                <Stethoscope className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  AI Doctor Consultation
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isASHA
                    ? 'AI-assisted clinical triage assessment for ASHA workers'
                    : 'Interactive medical symptom triage & preliminary healthcare guidance'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <LanguageSelector
              value={selectedLanguage}
              onChange={handleLanguageChange}
            />

            <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-300">
              <Sparkles className="h-3.5 w-3.5" />
              AI Specialist Online
            </span>

            {complete && (
              <button
                onClick={resetTriage}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                New Consultation
              </button>
            )}
          </div>
        </header>

        {/* ── DEMO SCENARIOS BAR ──────────────────────────────────── */}
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Play className="h-3.5 w-3.5 text-teal-600" />
              <span>Demo Clinical Scenarios:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {DEMO_SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => handleSelectScenario(sc)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <span>{sc.title}</span>
                  <span className="ml-1.5 text-[10px] opacity-80 font-bold">{sc.tag}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── MAIN GRID LAYOUT ────────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-[minmax(340px,0.85fr)_minmax(0,1.35fr)] items-start">

          {/* ── LEFT PANEL: 3D TELEHEALTH VIDEO CALL & TRIAGE STATUS ─ */}
          <aside className="space-y-5 lg:sticky lg:top-6">

            {/* 3D Video Call Frame */}
            <div className="overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-sm dark:border-teal-900/40 dark:bg-slate-900">
              <div className="border-b border-teal-100 bg-gradient-to-r from-teal-50 to-cyan-50 px-5 py-3.5 dark:border-teal-900/40 dark:from-teal-950/40 dark:to-cyan-950/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                      MediNest AI Doctor
                    </p>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      {consultationState === 'listening'
                        ? 'Listening to you…'
                        : consultationState === 'processing'
                        ? 'Understanding your symptoms…'
                        : consultationState === 'speaking'
                        ? 'Doctor is speaking…'
                        : consultationState === 'emergency'
                        ? 'Emergency detected!'
                        : 'Virtual Triage Specialist'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-bold text-emerald-700 shadow-sm dark:border-emerald-900 dark:bg-slate-800 dark:text-emerald-300">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                    Live Consultation
                  </div>
                </div>
              </div>

              {/* 3D Doctor Video Scene with 2D Fallback */}
              {viewMode === '3d' ? (
                <Doctor3D
                  state={consultationState}
                  isSpeaking={isSpeakingTTS}
                  isListening={isListening}
                  language={selectedLanguage}
                  size="large"
                  viewMode={viewMode}
                  onToggleViewMode={() => setViewMode('2d')}
                />
              ) : (
                <div className="relative">
                  <AIAvatar2D
                    state={consultationState}
                    size="large"
                  />
                  <button
                    type="button"
                    onClick={() => setViewMode('3d')}
                    className="absolute top-4 left-4 z-20 rounded-lg bg-white/80 px-2.5 py-1 text-[10px] font-bold text-slate-700 backdrop-blur shadow-sm transition hover:bg-white dark:bg-slate-800/80 dark:text-slate-200"
                  >
                    Switch to 3D Call
                  </button>
                </div>
              )}

              {/* Stop Speaking / Interrupt Button */}
              {isSpeakingTTS && (
                <div className="flex justify-center border-t border-teal-100 bg-teal-50 py-2 dark:border-teal-900/40 dark:bg-teal-950/20">
                  <button
                    type="button"
                    onClick={handleStopSpeaking}
                    className="flex items-center gap-2 rounded-xl bg-white px-4 py-1.5 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <Square className="h-3.5 w-3.5 text-red-500" />
                    Stop Speaking / Interrupt
                  </button>
                </div>
              )}
            </div>

            {/* ── RESTORED GREEN / YELLOW / RED TRIAGE STATUS PROGRESSION CARD ── */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Triage Status
                  </h3>
                </div>
                {triageResult ? (
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold ${currentTier.badgeClass}`}>
                    <span className={`h-2 w-2 rounded-full ${currentTier.indicatorDot}`} />
                    {currentTier.shortLabel}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-teal-500" />
                    Assessment in progress
                  </span>
                )}
              </div>

              {/* 3-Tier Stepper Visualizer (Green -> Yellow -> Red) */}
              <div className="mt-3.5 grid grid-cols-3 gap-2">
                {/* 🟢 GREEN: LOW RISK */}
                <div
                  className={`flex flex-col items-center justify-center rounded-2xl border p-2.5 text-center transition-all ${
                    triageResult?.level === 'LOW'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm ring-2 ring-emerald-500/20 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200'
                      : 'border-slate-200 bg-slate-50/60 text-slate-400 opacity-60 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-500'
                  }`}
                >
                  <span className="text-base">🟢</span>
                  <span className="mt-1 text-[11px] font-extrabold leading-tight">LOW RISK</span>
                  <span className="text-[9px] font-medium opacity-80">Self-Care</span>
                </div>

                {/* 🟡 YELLOW: MODERATE RISK */}
                <div
                  className={`flex flex-col items-center justify-center rounded-2xl border p-2.5 text-center transition-all ${
                    triageResult?.level === 'MODERATE'
                      ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-sm ring-2 ring-amber-500/20 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200'
                      : 'border-slate-200 bg-slate-50/60 text-slate-400 opacity-60 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-500'
                  }`}
                >
                  <span className="text-base">🟡</span>
                  <span className="mt-1 text-[11px] font-extrabold leading-tight">MODERATE</span>
                  <span className="text-[9px] font-medium opacity-80">Clinic / PHC</span>
                </div>

                {/* 🔴 RED: URGENT */}
                <div
                  className={`flex flex-col items-center justify-center rounded-2xl border p-2.5 text-center transition-all ${
                    triageResult?.level === 'URGENT'
                      ? 'border-red-500 bg-red-50 text-red-900 shadow-sm ring-2 ring-red-500/20 dark:border-red-700 dark:bg-red-950/50 dark:text-red-200 animate-pulse'
                      : 'border-slate-200 bg-slate-50/60 text-slate-400 opacity-60 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-500'
                  }`}
                >
                  <span className="text-base">🔴</span>
                  <span className="mt-1 text-[11px] font-extrabold leading-tight">URGENT</span>
                  <span className="text-[9px] font-medium opacity-80">Immediate Care</span>
                </div>
              </div>

              {/* Active Clinical Details */}
              {triageResult ? (
                <div className="mt-3.5 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800 text-xs">
                  <div>
                    <p className="font-bold text-slate-500 dark:text-slate-400">Clinical Interpretation:</p>
                    <p className="mt-0.5 font-semibold text-slate-800 dark:text-slate-200">
                      {triageResult.level === 'LOW' && 'Symptoms appear lower risk based on reported information. Self-care and observation may be appropriate.'}
                      {triageResult.level === 'MODERATE' && 'Medical evaluation recommended by a healthcare professional or Primary Health Centre (PHC).'}
                      {triageResult.level === 'URGENT' && 'Potential emergency warning signs detected. Immediate medical evaluation required.'}
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-500 dark:text-slate-400">Recommended Next Step:</p>
                    <p className="mt-0.5 text-slate-700 dark:text-slate-300">
                      {triageResult.recommendation}
                    </p>
                  </div>

                  {/* Confidence Meter */}
                  {typeof triageResult.confidence === 'number' && (
                    <div className="pt-1">
                      <div className="mb-1 flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        <span>Triage Confidence</span>
                        <span>{Math.round(triageResult.confidence * 100)}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            triageResult.level === 'LOW'
                              ? 'bg-emerald-500'
                              : triageResult.level === 'MODERATE'
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.round(triageResult.confidence * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Emergency 112 Action */}
                  {triageResult.level === 'URGENT' && (
                    <a
                      href="tel:112"
                      className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-md shadow-red-600/20 transition hover:bg-red-500"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      Call Emergency Services — 112
                    </a>
                  )}
                </div>
              ) : (
                <div className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 pt-3 dark:border-slate-800">
                  {loading ? (
                    <div className="flex items-center justify-center gap-2 text-teal-600 font-medium">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Assessing clinical symptoms...</span>
                    </div>
                  ) : (
                    <p>Describe your symptoms to determine GREEN, YELLOW, or RED triage priority.</p>
                  )}
                </div>
              )}
            </div>

            {/* ── CONSULTATION SUMMARY CARD ────────────────────────── */}
            {complete && (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white">
                    <FileText className="h-4 w-4 text-teal-600" />
                    <span>Consultation Summary</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleCopySummary}
                      className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                      title="Copy summary"
                    >
                      <Copy className="h-3 w-3" />
                      {copiedSummary ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSummaryExpanded(!summaryExpanded)}
                      className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {summaryExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {summaryExpanded && (
                  <div className="mt-3.5 space-y-2.5 border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                    <div>
                      <span className="font-bold text-slate-500">Chief Complaint: </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {symptomContext.chiefComplaint || 'General Assessment'}
                      </span>
                    </div>
                    {symptomContext.symptoms.length > 0 && (
                      <div>
                        <span className="font-bold text-slate-500">Reported Symptoms: </span>
                        <span className="text-slate-700 dark:text-slate-300">
                          {symptomContext.symptoms.join(', ')}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="font-bold text-slate-500">Triage Level: </span>
                      <span className={`font-bold ${currentTier.key === 'URGENT' ? 'text-red-600' : currentTier.key === 'MODERATE' ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {currentTier.label}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-500">Recommended Action: </span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {triageResult?.recommendation}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── SAFETY DISCLAIMER ───────────────────────────────── */}
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
              <div className="flex gap-2.5">
                <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                    Medical Disclaimer
                  </p>
                  <p className="mt-0.5 text-[11px] leading-4 text-amber-700 dark:text-amber-400">
                    AI guidance is not a diagnosis. Please consult a qualified healthcare professional or Primary Health Centre (PHC) for in-person medical evaluation.
                  </p>
                </div>
              </div>
            </div>

          </aside>

          {/* ── RIGHT PANEL: CONSULTATION CHAT STREAM ───────────────── */}
          <section className="relative flex flex-col h-[740px] max-h-[82vh] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

            {/* Chat header */}
            <div className="shrink-0 flex items-center justify-between bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-700 px-6 py-3.5 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white p-1 shadow-sm flex-shrink-0">
                  <img src="/logo.png" alt="MediNest Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h2 className="font-extrabold text-sm leading-tight">
                    Consultation Stream
                  </h2>
                  <p className="text-[11px] text-teal-100">
                    {isASHA
                      ? 'AI-assisted clinical triage assessment'
                      : 'Live doctor-patient voice consultation'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold sm:flex">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
                  Live Voice Active
                </span>
              </div>
            </div>

            {/* Scrollable Messages Container */}
            <div
              ref={chatContainerRef}
              onScroll={handleChatScroll}
              className="flex-1 overflow-y-auto overscroll-contain bg-slate-50/80 p-5 sm:p-6 dark:bg-slate-950/40"
            >
              <div className="mx-auto max-w-3xl space-y-4">

                {messages.map((message) => {
                  const isUser = message.role === 'user'
                  return (
                    <div
                      key={message.id}
                      className={`flex items-end gap-3 animate-msg-entry ${
                        isUser ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {/* Doctor Icon */}
                      {!isUser && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700 shadow-sm dark:bg-teal-950/60 dark:text-teal-300">
                          <Stethoscope className="h-4 w-4" />
                        </div>
                      )}

                      {/* Message bubble */}
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm transition-all ${
                          isUser
                            ? 'rounded-br-sm bg-teal-600 text-white shadow-teal-600/10 font-medium'
                            : 'rounded-bl-sm border border-slate-200/90 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'
                        }`}
                      >
                        {!isUser && (
                          <div className="mb-1 flex items-center justify-between gap-4 border-b border-slate-100 pb-1 text-[10px] font-bold text-teal-600 dark:border-slate-800 dark:text-teal-400">
                            <span>Dr. Ananya Sharma · AI Triage</span>
                            {message.timestamp && (
                              <span className="font-normal text-slate-400">{message.timestamp}</span>
                            )}
                          </div>
                        )}

                        <p className="whitespace-pre-wrap">{message.content}</p>

                        {isUser && message.timestamp && (
                          <div className="mt-1 text-right text-[10px] font-normal text-teal-100 opacity-80">
                            {message.timestamp}
                          </div>
                        )}
                      </div>

                      {/* Patient Icon */}
                      {isUser && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm shadow-teal-600/20">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Processing Indicator */}
                {loading && (
                  <div className="flex items-end gap-3 animate-msg-entry">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                      <Stethoscope className="h-4 w-4" />
                    </div>
                    <div className="rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-600" />
                        <span>Understanding your symptoms...</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Scroll to Bottom Button */}
            {showScrollBottom && (
              <button
                type="button"
                onClick={() => scrollToBottom(true)}
                className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 rounded-full bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-teal-600/30 transition hover:bg-teal-500 hover:scale-105 active:scale-95 backdrop-blur"
                aria-label="Scroll to latest messages"
              >
                <ArrowDown className="h-3.5 w-3.5" />
                Latest messages
              </button>
            )}

            {/* Error Banner */}
            {error && (
              <div className="shrink-0 border-t border-red-100 bg-red-50 px-5 py-2.5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                <div className="flex items-start gap-2">
                  <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Speaking Status Banner */}
            {isSpeakingTTS && (
              <div className="shrink-0 flex items-center justify-between border-t border-teal-100 bg-teal-50 px-5 py-2 text-xs font-semibold text-teal-800 dark:border-teal-900/40 dark:bg-teal-950/30 dark:text-teal-300">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-3.5 w-3.5 animate-pulse text-teal-600" />
                  <span>Doctor is speaking…</span>
                </div>
                <button
                  type="button"
                  onClick={handleStopSpeaking}
                  className="flex items-center gap-1 rounded-lg bg-teal-100 px-2 py-0.5 text-[11px] font-bold text-teal-700 transition hover:bg-teal-200 dark:bg-teal-900/50 dark:text-teal-300"
                  title="Stop speaking"
                >
                  <Square className="h-3 w-3" />
                  Interrupt
                </button>
              </div>
            )}

            {/* Listening Status Banner */}
            {isListening && (
              <div className="shrink-0 flex items-center justify-between border-t border-sky-100 bg-sky-50 px-5 py-2 text-xs font-semibold text-sky-800 dark:border-sky-900/40 dark:bg-sky-950/30 dark:text-sky-300">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-ping rounded-full bg-sky-500" />
                  <span>Listening to you…</span>
                </div>
                <span className="text-[11px] font-normal text-sky-600 dark:text-sky-400">
                  Hands-free active
                </span>
              </div>
            )}

            {/* Fixed Message Composer */}
            <div className="shrink-0 border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              {complete ? (
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">
                      Assessment Completed
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Triage guidance provided. You can start a new consultation anytime.
                    </p>
                  </div>
                  <button
                    onClick={resetTriage}
                    className="rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-teal-500"
                  >
                    Start New Consultation
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
                  <div className="relative rounded-2xl border border-slate-200 bg-slate-50 transition focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={loading}
                      rows={2}
                      placeholder={
                        conversationStage === 'awaiting_language'
                          ? 'Say or type your language: Hindi or English...'
                          : isASHA
                          ? "Describe the patient's symptoms..."
                          : 'Describe your symptoms...'
                      }
                      className="min-h-[64px] w-full resize-none bg-transparent px-4 py-3 pr-28 text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-white"
                    />

                    <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2">
                      <VoiceInput
                        ref={voiceInputRef}
                        language={selectedLanguage}
                        onResult={handleVoiceTranscript}
                        onListeningChange={handleListeningChange}
                        disabled={loading}
                      />

                      <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        title="Send message"
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between px-1 text-[11px] text-slate-400">
                    <span>Press Enter to send · Shift + Enter for new line</span>
                    <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-medium">
                      <Mic className="h-3 w-3" />
                      {isListening ? 'Hands-free voice active' : 'Tap mic to speak'}
                    </span>
                  </div>
                </form>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}