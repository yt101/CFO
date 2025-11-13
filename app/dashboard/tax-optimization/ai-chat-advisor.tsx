"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Form1120AdvisorEngine, type Form1120Data } from "@/lib/ai/1120-advisor-engine"
import {
  Send,
  Bot,
  User,
  Lightbulb,
  Calculator,
  TrendingUp,
  FileText,
  Loader2,
  Upload,
  Download
} from "lucide-react"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestions?: string[]
  citations?: string[]
}

interface AIChatAdvisorProps {
  taxData?: any
  companyId?: string
}

export function AIChatAdvisor({ taxData, companyId }: AIChatAdvisorProps) {
  const [advisorEngine] = useState(new Form1120AdvisorEngine())
  const [formData, setFormData] = useState<Form1120Data | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI Tax Advisor for Form 1120. I can help you analyze your Schedule L, P&L, M-1, M-2, financial ratios, and optimization opportunities. Upload your 1120 data or ask me questions!",
      timestamp: new Date(),
      suggestions: [
        "Upload 1120 data from Excel template",
        "Analyze my Schedule L balance sheet",
        "Review my P&L and profitability",
        "Show me optimization opportunities",
        "Analyze my working capital efficiency"
      ]
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await advisorEngine.answerQuestion(input)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
        timestamp: new Date(),
        suggestions: response.followUpQuestions || [],
        citations: response.sources
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I need 1120 data to provide analysis. Please upload your data first using the upload button.",
        timestamp: new Date(),
        suggestions: ["Upload 1120 data from Excel template"]
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const data = await advisorEngine.importFromExcel(file)
      setFormData(data)
      
      // Save to database if companyId is provided
      if (companyId) {
        await advisorEngine.saveToDatabase(companyId)
      }

      const uploadMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `✅ Successfully imported 1120 data!\n\n**Summary:**\n• Company: ${data.companyName}\n• EIN: ${data.ein}\n• Tax Year: ${data.taxYear}\n• Entity Type: ${data.entityType}\n• Optimization Opportunities: ${data.optimizationOpportunities.length}\n• Total Potential Savings: $${Math.round(data.optimizationOpportunities.reduce((sum, opp) => sum + opp.potentialSavings, 0)).toLocaleString()}\n\nI'm now ready to analyze your data. What would you like to explore?`,
        timestamp: new Date(),
        suggestions: [
          "Analyze my Schedule L balance sheet",
          "Review my P&L and profitability",
          "Show me all optimization opportunities",
          "Analyze my working capital efficiency",
          "Review my Schedule M-1 reconciliation"
        ]
      }
      setMessages(prev => [...prev, uploadMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "❌ Error importing data. Please ensure the file is a valid 1120 template format.",
        timestamp: new Date(),
        suggestions: ["Try uploading again", "Check file format"]
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsUploading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }


  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI 1120 Tax Advisor
          </CardTitle>
          <div className="flex gap-2">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              disabled={isUploading}
            />
            <label htmlFor="file-upload">
              <Button
                variant="outline"
                size="sm"
                disabled={isUploading}
                className="cursor-pointer"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {isUploading ? "Uploading..." : "Upload 1120 Data"}
              </Button>
            </label>
            {formData && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Export functionality could be added here
                  console.log("Export data", formData)
                }}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            )}
          </div>
        </div>
        {formData && (
          <div className="text-sm text-gray-600 mt-2">
            Loaded: {formData.companyName} ({formData.ein}) - {formData.taxYear}
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white ml-12'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  
                  {message.citations && message.citations.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {message.citations.map((citation, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {citation}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                {message.role === 'user' && (
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-blue-600" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-600">Analyzing...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {/* Suggestions */}
        {messages[messages.length - 1]?.suggestions && (
          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-2">
              {messages[messages.length - 1].suggestions?.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs"
                >
                  <Lightbulb className="h-3 w-3 mr-1" />
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about tax optimization, deductions, or planning..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


