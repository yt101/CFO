"use client"

import type { FormEvent } from "react"

type ChatInputProps = {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  isSending?: boolean
}

export function ChatInput({ value, onChange, onSend, isSending }: ChatInputProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSend()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200/70 bg-white/90 p-3 shadow-lg shadow-slate-900/5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <textarea
          value={value}
          rows={1}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Type here. Lifeline is listening deeply..."
          className="min-h-[48px] flex-1 resize-none rounded-2xl bg-transparent px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={!value.trim() || Boolean(isSending)}
          className="inline-flex items-center justify-center rounded-2xl bg-[#3D5C67] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-md shadow-[#3D5C67]/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
        >
          {isSending ? "Breathing" : "Send"}
        </button>
      </div>
    </form>
  )
}

export default ChatInput
