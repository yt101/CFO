"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Send, Loader2 } from "lucide-react"
import { ChatMessage } from "@/components/chat-message"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  evidence_links?: Array<{ label: string; value: string }>
  created_at: string
}

export function ChatInterface({
  sessionId,
  returnId,
}: {
  sessionId: string
  returnId: string
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load existing messages
  useEffect(() => {
    async function loadMessages() {
      try {
        const response = await fetch(`/api/chat/messages?sessionId=${sessionId}`)
        if (response.ok) {
          const data = await response.json()
          setMessages(data.messages || [])
        }
      } catch (error) {
        console.error("Failed to load messages:", error)
      }
    }

    if (sessionId) {
      loadMessages()
    }
  }, [sessionId])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: input,
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          returnId,
          message: input,
        }),
      })

      if (!response.ok) throw new Error("Failed to send message")

      const data = await response.json()

      const assistantMessage: Message = {
        id: data.messageId,
        role: "assistant",
        content: data.response,
        evidence_links: data.evidence_links,
        created_at: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="rounded-lg bg-muted p-8">
                <h3 className="mb-2 text-lg font-semibold">Ask me anything about this tax return</h3>
                <p className="text-sm text-muted-foreground">
                  I can help you understand metrics, explore opportunities, and run what-if scenarios.
                </p>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <Card
                  className="cursor-pointer p-4 transition-colors hover:bg-muted/50"
                  onClick={() => setInput("What are the key working capital metrics?")}
                >
                  <p className="text-sm">What are the key working capital metrics?</p>
                </Card>
                <Card
                  className="cursor-pointer p-4 transition-colors hover:bg-muted/50"
                  onClick={() => setInput("What opportunities have been identified?")}
                >
                  <p className="text-sm">What opportunities have been identified?</p>
                </Card>
                <Card
                  className="cursor-pointer p-4 transition-colors hover:bg-muted/50"
                  onClick={() => setInput("How can we improve our cash conversion cycle?")}
                >
                  <p className="text-sm">How can we improve our cash conversion cycle?</p>
                </Card>
                <Card
                  className="cursor-pointer p-4 transition-colors hover:bg-muted/50"
                  onClick={() => setInput("What if we reduced DSO by 10 days? What would be the impact?")}
                >
                  <p className="text-sm">What if we reduced DSO by 10 days?</p>
                </Card>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Analyzing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about this tax return..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
