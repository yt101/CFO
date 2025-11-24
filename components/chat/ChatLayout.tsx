"use client"

import { useEffect, useRef, useState } from "react"

import { ChatInput } from "@/components/chat/ChatInput"
import { MessageBubble } from "@/components/chat/MessageBubble"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  modeTag?: string
}

const seedMessages: Message[] = [
  {
    id: "assistant-1",
    role: "assistant",
    modeTag: "Grounding",
    content: "Okay. I'm here. One step at a time.",
  },
  {
    id: "assistant-2",
    role: "assistant",
    modeTag: "Listening",
    content: "I hear a lot of pressure in what you're carrying. Where would you like to start?",
  },
  {
    id: "user-1",
    role: "user",
    content: "Everything's moving at once and I can't miss a beat.",
  },
]

const assistantReplies = [
  "I'm here. Tell me what's on your mind.",
  "Let's find steady ground together before we move.",
  "Noted. What feels most urgent to release first?",
]

const assistantModes = ["Grounding", "Listening", "Clarity Mode"]

export function ChatLayout() {
  const [messages, setMessages] = useState<Message[]>(seedMessages)
  const [inputValue, setInputValue] = useState("")
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false)
  const [replyIndex, setReplyIndex] = useState(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleSend = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return

    const nextUserMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    }

    setMessages((prev) => [...prev, nextUserMessage])
    setInputValue("")
    setIsAwaitingResponse(true)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      const nextAssistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: assistantReplies[replyIndex % assistantReplies.length],
        modeTag: assistantModes[replyIndex % assistantModes.length],
      }

      setMessages((prev) => [...prev, nextAssistantMessage])
      setReplyIndex((prev) => prev + 1)
      setIsAwaitingResponse(false)
    }, 900 + Math.random() * 700)
  }

  return (
    <section className="mx-auto w-full max-w-3xl">
      <div className="flex min-h-[65vh] flex-col rounded-3xl border border-white/80 bg-white/80 p-6 shadow-2xl shadow-slate-900/10">
        <div className="border-b border-slate-100 pb-4">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Now in session</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Your Lifeline Session</h2>
          <p className="mt-1 text-sm text-slate-500">Take a breath. You're safe here.</p>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto py-6 pr-1" role="log" aria-live="polite">
          {messages.map((message) => (
            <MessageBubble key={message.id} {...message} />
          ))}
          {isAwaitingResponse ? (
            <MessageBubble
              role="assistant"
              modeTag="Listening"
              content="Breathing with you..."
            />
          ) : null}
        </div>
        <div className="border-t border-slate-100 pt-4">
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSend}
            isSending={isAwaitingResponse}
          />
        </div>
      </div>
    </section>
  )
}

export default ChatLayout
