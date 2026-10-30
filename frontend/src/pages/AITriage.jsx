import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    ArrowLeft,
    CheckCircle2,
    HeartPulse,
    Loader2,
    Mic,
    Phone,
    RefreshCw,
    Send,
    ShieldAlert,
    Sparkles,
    User,
    XCircle,
} from 'lucide-react'

import api from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../i18n/LanguageContext'
import LanguageSelector from '../components/ai/LanguageSelector'

/* =========================================================
   IMAGE CONFIGURATION
   ========================================================= */

const AI_DOCTOR_IMAGE = '/ai-doctor.png'

/* =========================================================
   INITIAL MESSAGE
   ========================================================= */

const INITIAL_MESSAGE = {
    id: 'welcome',
    role: 'assistant',
    content:
        'Namaste! I am MediNest AI Triage. Tell me what symptoms or health problem you are experiencing. I will ask a few questions to understand the situation.',
}

/* =========================================================
   TRIAGE CONFIG
   ========================================================= */

const TRIAGE_CONFIG = {
    green: {
        label: 'Low Risk',
        description:
            'No immediate warning signs detected. Continue monitoring your symptoms.',
        icon: CheckCircle2,
        classes:
            'bg-emerald-50 border-emerald-200 text-emerald-800',
        iconClasses: 'text-emerald-600',
    },

    yellow: {
        label: 'Moderate Risk',
        description:
            'Medical evaluation may be needed. Consider consulting a healthcare professional.',
        icon: HeartPulse,
        classes:
            'bg-amber-50 border-amber-200 text-amber-800',
        iconClasses: 'text-amber-600',
    },

    red: {
        label: 'High Risk',
        description:
            'Urgent medical attention may be required.',
        icon: ShieldAlert,
        classes:
            'bg-orange-50 border-orange-200 text-orange-800',
        iconClasses: 'text-orange-600',
    },

    emergency: {
        label: 'Emergency',
        description:
            'Possible medical emergency. Immediate medical attention is required.',
        icon: XCircle,
        classes:
            'bg-red-50 border-red-300 text-red-800',
        iconClasses: 'text-red-600',
    },
}

/* =========================================================
   REUSABLE AI AVATAR
   ========================================================= */

function AIAvatar({
    imageClassName = '',
    containerClassName = '',
    small = false,
    priority = false,
}) {
    const [imageError, setImageError] = useState(false)
    const [imageLoaded, setImageLoaded] = useState(false)
    const imgRef = useRef(null)

    useEffect(() => {
        if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
            setImageLoaded(true)
        }
    }, [])

    if (imageError) {
        return (
            <div
                className={`flex items-center justify-center bg-teal-50 ${containerClassName}`}
                aria-label="MediNest AI Health Assistant"
            >
                <img
                    src="/logo.png"
                    alt="MediNest Logo"
                    className={
                        small
                            ? 'h-5 w-5 object-contain'
                            : 'h-16 w-16 object-contain'
                    }
                />
            </div>
        )
    }

    return (
        <div className={`relative ${containerClassName}`}>
            {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div
                        className={
                            small
                                ? 'h-6 w-6 animate-pulse rounded-full bg-teal-200'
                                : 'h-24 w-24 animate-pulse rounded-full bg-teal-100'
                        }
                    />
                </div>
            )}

            <img
                ref={imgRef}
                src="/ai-doctor.png"
                alt="MediNest AI Health Assistant"
                width="600"
                height="800"
                loading={priority ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={priority ? 'high' : 'auto'}
                onLoad={() => {
                    console.log('MediNest AI doctor image loaded successfully')
                    setImageLoaded(true)
                }}
                onError={(event) => {
                    console.error(
                        'Could not load MediNest AI doctor:',
                        event.currentTarget.src
                    )
                    setImageError(true)
                }}
                className={`transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                    } ${imageClassName}`}
            />
        </div>
    )
}

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export default function AITriage() {
    const { user } = useAuth()
    const { language, setLanguage, t } = useLanguage()

    useEffect(() => {
        const image = new Image()
        image.src = '/ai-doctor.png'
        image.onload = () => {
            console.log('MediNest AI doctor image preloaded')
        }
        image.onerror = () => {
            console.error('MediNest AI doctor preload failed:', image.src)
        }
    }, [])

    const messagesEndRef = useRef(null)
    const textareaRef = useRef(null)

    const [selectedLanguage, setSelectedLanguage] = useState(() => {
        return language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN'
    })

    const [messages, setMessages] = useState([INITIAL_MESSAGE])
    const [input, setInput] = useState('')
    const [sessionId, setSessionId] = useState(null)
    const [triage, setTriage] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [complete, setComplete] = useState(false)

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

    /* =====================================================
       AUTO SCROLL
       ===================================================== */

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth',
        })
    }, [messages, loading])

    /* =====================================================
       SEND MESSAGE
       ===================================================== */

    const sendMessage = async () => {
        const message = input.trim()

        if (!message || loading || complete) {
            return
        }

        setInput('')
        setError('')

        const userMessage = {
            id: `${Date.now()}-user`,
            role: 'user',
            content: message,
        }

        setMessages((prev) => [
            ...prev,
            userMessage,
        ])

        setLoading(true)

        try {
            const response = await api.post(
                '/api/chatbot/message',
                {
                    message,
                    patient_id: user?.id || 'PT-USER',
                    session_id: sessionId,
                    emotion: null,
                    language: selectedLanguage,
                }
            )

            const data = response.data

            if (data.session_id) {
                setSessionId(data.session_id)
            }

            const assistantMessage = {
                id: `${Date.now()}-assistant`,
                role: 'assistant',
                content:
                    data.response ||
                    'I was unable to generate a response. Please try again.',
            }

            setMessages((prev) => [
                ...prev,
                assistantMessage,
            ])

            if (data.triage_level) {
                setTriage({
                    level:
                        data.triage_level.toLowerCase(),
                    confidence: data.confidence,
                    reason: data.reason,
                    emotion: data.emotion,
                    timestamp: data.timestamp,
                })
            }

            if (
                data.triage_level?.toLowerCase() ===
                'emergency' ||
                data.is_complete === true
            ) {
                setComplete(true)
            }
        } catch (err) {
            console.error(
                'AI Triage error:',
                err
            )

            const backendMessage =
                err.response?.data?.detail ||
                err.response?.data?.message ||
                'The AI service could not be reached.'

            setError(backendMessage)

            setMessages((prev) => [
                ...prev,
                {
                    id: `${Date.now()}-error`,
                    role: 'assistant',
                    content:
                        'I am temporarily unable to connect to the AI service. Please try again. If your symptoms are serious or getting worse, please seek medical care.',
                },
            ])
        } finally {
            setLoading(false)

            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({
                    behavior: 'smooth',
                })
            }, 100)
        }
    }

    /* =====================================================
       FORM
       ===================================================== */

    const handleSubmit = async (e) => {
        e.preventDefault()
        await sendMessage()
    }

    const handleKeyDown = async (e) => {
        if (
            e.key === 'Enter' &&
            !e.shiftKey
        ) {
            e.preventDefault()
            await sendMessage()
        }
    }

    /* =====================================================
       RESET
       ===================================================== */

    const resetTriage = () => {
        setMessages([INITIAL_MESSAGE])
        setInput('')
        setSessionId(null)
        setTriage(null)
        setError('')
        setComplete(false)
    }

    /* =====================================================
       VOICE INPUT
       ===================================================== */

    const handleVoiceInput = () => {
        if (
            !(
                'webkitSpeechRecognition' in
                window ||
                'SpeechRecognition' in window
            )
        ) {
            alert(
                'Voice input is not supported in this browser. Please use Google Chrome.'
            )

            return
        }

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition

        const recognition =
            new SpeechRecognition()

        recognition.lang = selectedLanguage
        recognition.interimResults = false
        recognition.continuous = false

        recognition.onstart = () => {
            setError('')
        }

        recognition.onresult = (event) => {
            const transcript =
                event.results[0][0]
                    .transcript

            setInput((prev) =>
                `${prev} ${transcript}`.trim()
            )

            textareaRef.current?.focus()
        }

        recognition.onerror = () => {
            setError(
                'Voice input could not be captured. Please try again.'
            )
        }

        recognition.start()
    }

    /* =====================================================
       TRIAGE RESULT
       ===================================================== */

    const currentLevel =
        triage?.level || 'green'

    const config =
        TRIAGE_CONFIG[currentLevel] ||
        TRIAGE_CONFIG.green

    const ResultIcon = config.icon

    const confidence =
        typeof triage?.confidence === 'number'
            ? Math.round(
                triage.confidence * 100
            )
            : null

    /* =====================================================
       RENDER
       ===================================================== */

    return (
        <div className="min-h-screen bg-slate-50">

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <div className="mb-6 flex items-center justify-between">

                    <div className="flex items-center gap-3">

                        <Link
                            to="/patient/dashboard"
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>

                        <div className="flex items-center gap-3">

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white p-1.5 shadow-md flex-shrink-0">
                                <img src="/logo.png" alt="MediNest Logo" className="w-full h-full object-contain" />
                            </div>

                            <div>

                                <h1 className="text-2xl font-extrabold text-slate-900">
                                    AI Health Triage
                                </h1>

                                <p className="text-sm text-slate-500">
                                    Your personal symptom assessment assistant
                                </p>

                            </div>

                        </div>

                    </div>

                    <div className="flex items-center gap-3">

                        <LanguageSelector
                            value={selectedLanguage}
                            onChange={handleLanguageChange}
                        />

                        <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-bold text-teal-700">

                            <Sparkles className="h-4 w-4" />

                            AI Active

                        </span>

                    </div>

                </div>

                {/* =================================================
                    MAIN GRID
                ================================================= */}

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(330px,0.8fr)]">

                    {/* =================================================
                        CHAT PANEL
                    ================================================= */}

                    <section className="flex min-h-[720px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                        {/* CHAT HEADER */}

                        <div className="flex items-center justify-between bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-700 px-6 py-5 text-white">

                            <div className="flex items-center gap-4">

                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white p-1.5 shadow-sm flex-shrink-0">

                                    <img src="/logo.png" alt="MediNest Logo" className="w-full h-full object-contain" />

                                </div>

                                <div>

                                    <h2 className="text-lg font-extrabold">
                                        MediNest AI Triage
                                    </h2>

                                    <p className="text-xs text-teal-100">
                                        Your personal symptom assessment assistant
                                    </p>

                                </div>

                            </div>

                            <span className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold">

                                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />

                                AI Active

                            </span>

                        </div>

                        {/* =================================================
                            MESSAGES
                        ================================================= */}

                        <div className="flex-1 overflow-y-auto bg-slate-50/80 p-6">

                            <div className="mx-auto max-w-3xl space-y-5">

                                {messages.map(
                                    (message) => {

                                        const isUser =
                                            message.role ===
                                            'user'

                                        return (
                                            <div
                                                key={message.id}
                                                className={`flex items-end gap-3 ${isUser
                                                    ? 'justify-end'
                                                    : 'justify-start'
                                                    }`}
                                            >

                                                {/* AI AVATAR */}

                                                {!isUser && (
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-teal-100">

                                                        <AIAvatar
                                                            small
                                                            containerClassName="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-teal-100"
                                                            imageClassName="h-full w-full object-contain"
                                                        />

                                                    </div>
                                                )}

                                                {/* MESSAGE */}

                                                <div
                                                    className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-5 py-3.5 text-sm leading-6 shadow-sm ${isUser
                                                        ? 'rounded-br-md bg-teal-600 text-white'
                                                        : 'rounded-bl-md border border-slate-200 bg-white text-slate-700'
                                                        }`}
                                                >
                                                    {message.content}
                                                </div>

                                                {/* USER AVATAR */}

                                                {isUser && (
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white">

                                                        <User className="h-5 w-5" />

                                                    </div>
                                                )}

                                            </div>
                                        )
                                    }
                                )}

                                {/* LOADING */}

                                {loading && (
                                    <div className="flex items-end gap-3">

                                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-teal-100">

                                            <AIAvatar
                                                small
                                                containerClassName="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-teal-100"
                                                imageClassName="h-full w-full object-contain"
                                            />

                                        </div>

                                        <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-5 py-4 shadow-sm">

                                            <div className="flex items-center gap-2 text-sm text-slate-500">

                                                <Loader2 className="h-4 w-4 animate-spin text-teal-600" />

                                                MediNest is thinking...

                                            </div>

                                        </div>

                                    </div>
                                )}

                                <div ref={messagesEndRef} />

                            </div>

                        </div>

                        {/* ERROR */}

                        {error && (
                            <div className="border-t border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700">

                                <div className="flex items-start gap-2">

                                    <XCircle className="mt-0.5 h-4 w-4 shrink-0" />

                                    <span>
                                        {error}
                                    </span>

                                </div>

                            </div>
                        )}

                        {/* =================================================
                            INPUT
                        ================================================= */}

                        <div className="border-t border-slate-200 bg-white p-5">

                            {complete ? (

                                <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4">

                                    <div>

                                        <p className="text-sm font-bold text-slate-800">
                                            Assessment completed
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Start a new assessment if you need to continue.
                                        </p>

                                    </div>

                                    <button
                                        onClick={
                                            resetTriage
                                        }
                                        className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-teal-500"
                                    >

                                        <RefreshCw className="h-4 w-4" />

                                        New Assessment

                                    </button>

                                </div>

                            ) : (

                                <form
                                    onSubmit={
                                        handleSubmit
                                    }
                                    className="mx-auto max-w-3xl"
                                >

                                    <div className="relative rounded-2xl border border-slate-200 bg-slate-50 transition focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-500/10">

                                        <textarea
                                            ref={
                                                textareaRef
                                            }
                                            value={input}
                                            onChange={(e) =>
                                                setInput(
                                                    e.target.value
                                                )
                                            }
                                            onKeyDown={
                                                handleKeyDown
                                            }
                                            disabled={
                                                loading
                                            }
                                            rows={2}
                                            placeholder="Describe your symptoms..."
                                            className="min-h-[78px] w-full resize-none bg-transparent px-4 py-4 pr-28 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                                        />

                                        <div className="absolute bottom-3 right-3 flex items-center gap-2">

                                            {/* VOICE */}

                                            <button
                                                type="button"
                                                onClick={
                                                    handleVoiceInput
                                                }
                                                disabled={
                                                    loading
                                                }
                                                title="Voice input"
                                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm transition hover:text-teal-600 disabled:opacity-50"
                                            >

                                                <Mic className="h-4 w-4" />

                                            </button>

                                            {/* SEND */}

                                            <button
                                                type="submit"
                                                disabled={
                                                    loading ||
                                                    !input.trim()
                                                }
                                                title="Send"
                                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-40"
                                            >

                                                {loading ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Send className="h-4 w-4" />
                                                )}

                                            </button>

                                        </div>

                                    </div>

                                    <p className="mt-2 text-center text-[11px] text-slate-400">
                                        Press Enter to send · Shift + Enter for a new line
                                    </p>

                                </form>

                            )}

                        </div>

                    </section>

                    {/* =================================================
                        RIGHT PANEL
                    ================================================= */}

                    <aside className="space-y-5">

                        {/* =================================================
                            AI DOCTOR CARD
                        ================================================= */}

                        <div className="overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-sm">

                            {/* HEADER */}

                            <div className="flex items-center justify-between border-b border-teal-100 px-5 py-4">

                                <div>

                                    <p className="text-xs font-bold uppercase tracking-wider text-teal-600">
                                        Your AI Health Assistant
                                    </p>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Your virtual MediNest doctor
                                    </p>

                                </div>

                                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">

                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />

                                    Online

                                </span>

                            </div>

                            {/* =================================================
                                IMAGE AREA
                            ================================================= */}

                            <div className="relative h-[500px] overflow-hidden bg-gradient-to-b from-teal-50 via-white to-cyan-50">

                                {/* Decorative glow */}

                                <div className="absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-teal-200/30 blur-3xl" />

                                <div className="absolute left-1/2 top-24 h-64 w-64 -translate-x-1/2 rounded-full border border-teal-100 bg-white/40" />

                                {/* AI BADGE */}

                                <div className="absolute right-4 top-5 z-30 flex items-center gap-2 rounded-full border border-teal-100 bg-white px-4 py-2 text-xs font-bold text-teal-700 shadow-lg">

                                    <Sparkles className="h-3.5 w-3.5" />

                                    AI Assistant

                                </div>

                                {/* =================================================
                                    DOCTOR IMAGE
                                ================================================= */}

                                <AIAvatar
                                    priority
                                    containerClassName="absolute bottom-0 left-1/2 z-10 h-[470px] w-[90%] -translate-x-1/2"
                                    imageClassName="h-full w-full object-contain object-bottom drop-shadow-2xl"
                                />

                                {/* NAME */}

                                <div className="absolute bottom-5 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-full border border-slate-100 bg-white px-5 py-2.5 text-xs font-semibold text-slate-600 shadow-xl">

                                    Your MediNest Health Assistant

                                </div>

                            </div>

                            {/* FOOTER */}

                            <div className="border-t border-teal-100 bg-white px-5 py-5 text-center">

                                <h3 className="text-lg font-extrabold text-slate-900">
                                    How can I help you today?
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Describe your symptoms below
                                </p>

                            </div>

                        </div>

                        {/* =================================================
                            TRIAGE RESULT
                        ================================================= */}

                        <div
                            className={`rounded-3xl border p-6 shadow-sm ${config.classes}`}
                        >

                            <div className="flex items-start gap-3">

                                <ResultIcon
                                    className={`mt-0.5 h-7 w-7 ${config.iconClasses}`}
                                />

                                <div className="min-w-0 flex-1">

                                    <p className="text-xs font-bold uppercase tracking-wider opacity-70">
                                        Triage Result
                                    </p>

                                    <h2 className="mt-1 text-2xl font-extrabold">
                                        {triage
                                            ? config.label
                                            : 'Awaiting Assessment'}
                                    </h2>

                                    <p className="mt-3 text-sm leading-6">

                                        {triage?.level ===
                                            'emergency'
                                            ? 'Emergency warning detected. Seek emergency medical care immediately.'
                                            : triage?.reason ||
                                            config.description}

                                    </p>

                                    {confidence !==
                                        null && (
                                            <div className="mt-5">

                                                <div className="mb-2 flex justify-between text-xs font-bold">

                                                    <span>
                                                        AI Confidence
                                                    </span>

                                                    <span>
                                                        {confidence}%
                                                    </span>

                                                </div>

                                                <div className="h-2 overflow-hidden rounded-full bg-black/10">

                                                    <div
                                                        className="h-full rounded-full bg-current transition-all duration-500"
                                                        style={{
                                                            width: `${confidence}%`,
                                                        }}
                                                    />

                                                </div>

                                            </div>
                                        )}

                                    {triage?.reason && (
                                        <div className="mt-5 border-t border-current/10 pt-4">

                                            <p className="text-xs font-extrabold uppercase tracking-wider">
                                                Why?
                                            </p>

                                            <p className="mt-2 text-sm leading-6">
                                                {triage.reason}
                                            </p>

                                        </div>
                                    )}

                                </div>

                            </div>

                            {/* EMERGENCY */}

                            {triage?.level ===
                                'emergency' && (
                                    <a
                                        href="tel:112"
                                        className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-extrabold text-white shadow-lg transition hover:bg-red-500"
                                    >

                                        <Phone className="h-4 w-4" />

                                        Call Emergency Services — 112

                                    </a>
                                )}

                        </div>

                        {/* =================================================
                            HOW IT WORKS
                        ================================================= */}

                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

                            <h3 className="text-lg font-extrabold text-slate-900">
                                How it works
                            </h3>

                            <div className="mt-5 space-y-4">

                                {[
                                    'Describe the patient’s symptoms.',
                                    'AI asks relevant follow-up questions.',
                                    'Receive an explainable triage result.',
                                    'Seek professional care when recommended.',
                                ].map(
                                    (
                                        item,
                                        index
                                    ) => (
                                        <div
                                            key={
                                                item
                                            }
                                            className="flex gap-3"
                                        >

                                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-extrabold text-teal-600">

                                                {index +
                                                    1}

                                            </span>

                                            <p className="pt-1 text-sm leading-5 text-slate-500">
                                                {
                                                    item
                                                }
                                            </p>

                                        </div>
                                    )
                                )}

                            </div>

                        </div>

                        {/* =================================================
                            SAFETY
                        ================================================= */}

                        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">

                            <div className="flex gap-3">

                                <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600" />

                                <div>

                                    <p className="text-sm font-bold text-amber-800">
                                        Important
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-amber-700">
                                        MediNest provides preliminary health guidance and does not replace a qualified medical professional.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </aside>

                </div>

            </div>

        </div>
    )
}