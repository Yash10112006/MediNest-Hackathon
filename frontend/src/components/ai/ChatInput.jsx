import { Send } from 'lucide-react'
import { useEffect, useRef } from 'react'

export default function ChatInput({
  value = '',
  onChange,
  onSend,
  loading = false,
}) {
  const textareaRef = useRef(null)

  useEffect(() => {
    if (!loading && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [loading])

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!value.trim() || loading) {
      return
    }

    onSend()
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit(event)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-3"
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
        rows={2}
        placeholder={
          loading
            ? 'Medi AI is thinking...'
            : 'Describe your symptoms...'
        }
        className="
          min-h-[52px]
          flex-1
          resize-none
          rounded-2xl
          border border-slate-200
          bg-slate-50
          px-4 py-3
          text-sm
          text-slate-800
          outline-none
          transition
          placeholder:text-slate-400
          focus:border-teal-500
          focus:ring-2
          focus:ring-teal-500/20
          disabled:cursor-not-allowed
          disabled:opacity-60
          dark:border-slate-700
          dark:bg-slate-800
          dark:text-white
        "
      />

      <button
        type="submit"
        disabled={!value.trim() || loading}
        className="
          flex
          h-[52px]
          w-[52px]
          shrink-0
          items-center
          justify-center
          rounded-2xl
          bg-teal-600
          text-white
          shadow-sm
          transition
          hover:bg-teal-500
          disabled:cursor-not-allowed
          disabled:bg-slate-300
          dark:disabled:bg-slate-700
        "
        aria-label="Send message"
      >
        <Send className="h-5 w-5" />
      </button>
    </form>
  )
}