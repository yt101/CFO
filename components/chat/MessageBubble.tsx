"use client"

import { cn } from "@/lib/utils"

type MessageBubbleProps = {
  role: "user" | "assistant"
  content: string
  modeTag?: string
}

export function MessageBubble({ role, content, modeTag }: MessageBubbleProps) {
  const isAssistant = role === "assistant"

  return (
    <div className={cn("flex w-full", isAssistant ? "justify-start" : "justify-end")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm shadow-slate-900/5 transition-all animate-message-in",
          isAssistant
            ? "rounded-tl-sm bg-[#F4E9DA] text-slate-900"
            : "rounded-tr-sm bg-white text-slate-900"
        )}
      >
        {modeTag && isAssistant ? (
          <span className="mb-1 block text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-[#3D5C67]/70">
            {modeTag}
          </span>
        ) : null}
        <p>{content}</p>
      </div>
    </div>
  )
}

export default MessageBubble
