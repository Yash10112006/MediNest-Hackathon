import { RefreshCw, Sparkles } from 'lucide-react'
import { useCallback, useState } from 'react'

import useAIChat from '../../hooks/useAIChat'
import ChatInput from './ChatInput'
import ChatWindow from './ChatWindow'
import LanguageSelector from './LanguageSelector'
import TriageResult from './TriageResult'
import AIAvatar2D from './AIAvatar2D'

export default function AIChatbot({
    patientId = null,
    className = '',
}) {
    const [language, setLanguage] = useState('en')
    const [input, setInput] = useState('')

    const {
        messages,
        triage,
        loading,
        error,
        complete,
        sendMessage,
        resetChat,
    } = useAIChat({
        patientId,
        language,
    })

    const handleSend = useCallback(async () => {
        const message = input.trim()

        if (!message || loading || complete) {
            return
        }

        setInput('')

        await sendMessage(message)
    }, [
        input,
        loading,
        complete,
        sendMessage,
    ])

    const avatarState = complete
        ? triage?.level === 'emergency'
            ? 'emergency'
            : 'speaking'
        : loading
            ? 'thinking'
            : 'idle'

    return (
        <div
            className={`w-full ${className}`}
        >
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.7fr)]">

                {/* =========================
            CHAT PANEL
        ========================== */}
                <section className="flex min-h-[680px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

                    {/* Header */}
                    <div className="flex items-center justify-between bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-700 px-5 py-4 text-white">

                        <div className="flex items-center gap-3">

                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/15">
                                <Sparkles className="h-6 w-6" />
                            </div>

                            <div>
                                <h2 className="font-extrabold">
                                    MediNest AI
                                </h2>

                                <p className="text-xs text-teal-100">
                                    Interactive health assistant
                                </p>
                            </div>

                        </div>

                        <div className="flex items-center gap-3">

                            <LanguageSelector
                                value={language}
                                onChange={setLanguage}
                            />

                            <span className="hidden items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-bold sm:flex">
                                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
                                AI Active
                            </span>

                        </div>
                    </div>

                    {/* Conversation */}
                    <ChatWindow
                        messages={messages}
                        loading={loading}
                    />

                    {/* Error */}
                    {error && (
                        <div className="border-t border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                            {error}
                        </div>
                    )}

                    {/* Input */}
                    <div className="border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">

                        {complete ? (
                            <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">

                                <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">
                                        Assessment completed
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        Start a new assessment if you need to continue.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={resetChat}
                                    className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-teal-500"
                                >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    New Assessment
                                </button>

                            </div>
                        ) : (
                            <ChatInput
                                value={input}
                                onChange={setInput}
                                onSend={handleSend}
                                loading={loading}
                            />
                        )}

                    </div>
                </section>

                {/* =========================
            AI SIDE PANEL
        ========================== */}
                <aside className="space-y-5">

                    {/* Avatar */}
                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

                        <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                            <p className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                                Your AI Health Assistant
                            </p>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Talk naturally. I will ask questions when I need more information.
                            </p>
                        </div>

                        <AIAvatar2D
                            state={avatarState}
                            size="large"
                        />

                    </div>

                    {/* Triage */}
                    <TriageResult
                        result={triage}
                    />

                    {/* Privacy / safety */}
                    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/50 dark:bg-amber-950/20">

                        <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                            Important
                        </p>

                        <p className="mt-1 text-xs leading-5 text-amber-700 dark:text-amber-400">
                            MediNest provides preliminary health guidance and does not replace a qualified medical professional.
                        </p>

                    </div>

                </aside>

            </div>
        </div>
    )
}