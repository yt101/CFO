"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Bot } from "lucide-react"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  evidence_links?: Array<{ label: string; value: string }>
  created_at: string
}

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user"

  return (
    <div className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}

      <div className={`flex max-w-[80%] flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
        <Card className={`p-4 ${isUser ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
        </Card>

        {message.evidence_links && message.evidence_links.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.evidence_links.map((link, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {link.label}: {link.value}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  )
}
