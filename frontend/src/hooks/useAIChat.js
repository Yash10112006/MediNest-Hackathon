import { useCallback, useState } from 'react'
import api from '../services/api'

const INITIAL_MESSAGE = {
    id: 'welcome',
    role: 'assistant',
    content:
        'Namaste! I am MediNest AI. Tell me what symptoms or health problem you are experiencing. I will ask a few questions to understand your situation.',
}

export default function useAIChat({
    patientId = null,
    language = 'en',
} = {}) {
    const [messages, setMessages] = useState([INITIAL_MESSAGE])
    const [sessionId, setSessionId] = useState(null)
    const [triage, setTriage] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [complete, setComplete] = useState(false)

    const sendMessage = useCallback(
        async (message) => {
            const cleanMessage = message?.trim()

            if (!cleanMessage || loading || complete) {
                return null
            }

            setError('')
            setLoading(true)

            const userMessage = {
                id: `${Date.now()}-user`,
                role: 'user',
                content: cleanMessage,
            }

            setMessages((previous) => [...previous, userMessage])

            try {
                const response = await api.post('/api/chatbot/message', {
                    message: cleanMessage,
                    patient_id: patientId,
                    session_id: sessionId,
                    emotion: null,
                    language,
                })

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

                setMessages((previous) => [
                    ...previous,
                    assistantMessage,
                ])

                const normalizedLevel =
                    data.triage_level?.toString().trim().toLowerCase()

                const isEmergency = normalizedLevel === 'emergency'
                const isComplete = data.is_complete === true

                // Only show the final triage result when the assessment
                // is actually complete or an emergency has been detected.
                if (data.triage_level && (isComplete || isEmergency)) {
                    setTriage({
                        level: normalizedLevel,
                        confidence: data.confidence,
                        reason: data.reason,
                        emotion: data.emotion,
                        timestamp: data.timestamp,
                        next_action: data.next_action,
                    })
                }

                if (isComplete || isEmergency) {
                    setComplete(true)
                }

                return data
            } catch (err) {
                console.error('MediNest AI error:', err)

                const backendMessage =
                    err.response?.data?.detail ||
                    err.response?.data?.message ||
                    'The AI service could not be reached.'

                setError(backendMessage)

                setMessages((previous) => [
                    ...previous,
                    {
                        id: `${Date.now()}-error`,
                        role: 'assistant',
                        content:
                            'I am temporarily unable to connect to the AI service. Please try again. If your symptoms are serious or getting worse, please seek medical care.',
                    },
                ])

                return null
            } finally {
                setLoading(false)
            }
        },
        [patientId, language, sessionId, loading, complete]
    )

    const resetChat = useCallback(() => {
        setMessages([INITIAL_MESSAGE])
        setSessionId(null)
        setTriage(null)
        setLoading(false)
        setError('')
        setComplete(false)
    }, [])

    return {
        messages,
        sessionId,
        triage,
        loading,
        error,
        complete,
        sendMessage,
        resetChat,
    }
}