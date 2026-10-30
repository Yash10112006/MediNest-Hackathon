import { Activity, User } from 'lucide-react'

export default function ChatMessage({ message }) {
  const isUser = message?.role === 'user'

  return (
    <div
      className={`flex items-end gap-3 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {!isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
          <Activity className="h-4 w-4" />
        </div>
      )}

      <div
        className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-5 py-3.5 text-sm leading-6 shadow-sm ${
          isUser
            ? 'rounded-br-md bg-teal-600 text-white'
            : 'rounded-bl-md border border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'
        }`}
      >
        {message?.content}
      </div>

      {isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  )
}   