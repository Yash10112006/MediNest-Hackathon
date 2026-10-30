import React, { useEffect, useRef } from 'react'
import ChatMessage from './ChatMessage'

export default function ChatWindow({
  messages = [],
  loading = false,
}) {
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages, loading])

  return (
    <div className="flex flex-1 flex-col overflow-hidden">

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-5 dark:bg-slate-950">

        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Start a conversation with Medi AI
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Describe your symptoms or health concern.
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
            />
          ))
        )}

        {/* Thinking indicator */}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
              🤖
            </div>

            <div className="rounded-2xl rounded-tl-md bg-white px-4 py-3 shadow-sm dark:bg-slate-800">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-teal-500" />
                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-teal-500"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-teal-500"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}