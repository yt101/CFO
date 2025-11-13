"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User,
  RefreshCw,
  Settings,
  FileText,
  BarChart3,
  DollarSign,
  AlertTriangle,
  Brain,
  Target,
  CheckCircle,
  Shield,
  BookOpen
} from "lucide-react"
import { createLLMService, getLLMConfiguration } from "@/lib/ai/llm-service"
import { configService } from "@/lib/ai/config-service"
import { createVectorService } from "@/lib/ai/vector-service"
import { createRAGService } from "@/lib/ai/rag-service"
import { createDocumentService } from "@/lib/ai/document-service"
import { createToolOrchestrator } from "@/lib/ai/tool-orchestrator"
import { DocumentUpload } from "@/components/document-upload"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  tool_calls?: string[]
  provenance?: string[]
}

export default function AIChatPage() {
  const [activeTab, setActiveTab] = useState("chat")
  // Initialize with empty array to avoid hydration mismatch, then set initial message on client
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [llmService, setLlmService] = useState<any>(null)
  const [llmConfig, setLlmConfig] = useState<any>(null)
  const [ragService, setRagService] = useState<any>(null)
  const [documentService, setDocumentService] = useState<any>(null)
  const [toolOrchestrator, setToolOrchestrator] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)
  const [ragEnabled, setRagEnabled] = useState(false)
  const [toolsEnabled, setToolsEnabled] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Set client flag and initialize messages to prevent hydration issues
  useEffect(() => {
    setIsClient(true)
    // Set initial message only on client side to avoid hydration mismatch
    setMessages([{
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI CFO assistant. I can help you with financial planning, analysis, risk management, and more. What would you like to know?",
      timestamp: new Date()
    }])
  }, [])

  // Initialize LLM and RAG services
  useEffect(() => {
    if (!isClient) return

    const initializeServices = async () => {
      try {
        // Initialize LLM service
        const llmConfig = await configService.getLLMConfiguration()
        if (llmConfig && llmConfig.apiKey) {
          const llmService = createLLMService(llmConfig)
          setLlmService(llmService)
          setLlmConfig(llmConfig)
          console.log('LLM service initialized:', llmConfig.provider)

          // Initialize RAG service
          const vectorConfig = await configService.getVectorDBConfiguration()
          if (vectorConfig) {
            const vectorService = createVectorService(vectorConfig, llmService)
            const ragService = createRAGService(vectorService, llmService)
            const documentService = createDocumentService(ragService)
            
            setRagService(ragService)
            setDocumentService(documentService)
            setRagEnabled(true)
            
            // Add sample documents for demo
            await documentService.addSampleDocuments()
            console.log('RAG service initialized with sample documents')
          } else {
            console.log('No vector database configuration found, RAG disabled')
          }

          // Initialize Tool Orchestrator
          const toolOrchestrator = createToolOrchestrator(llmService)
          
          // Check if QuickBooks is configured and enable it
          const qbConfig = await configService.getQuickBooksConfiguration()
          if (qbConfig && qbConfig.companyId) {
            toolOrchestrator.enableQuickBooks()
            console.log('QuickBooks integration enabled with Company ID:', qbConfig.companyId)
          }
          
          setToolOrchestrator(toolOrchestrator)
          setToolsEnabled(true)
          console.log('Tool orchestrator initialized')
        } else {
          console.log('No LLM configuration found, using mock responses')
          // Clear cache and try once more
          configService.clearCache()
          const retryConfig = await configService.getLLMConfiguration()
          if (retryConfig && retryConfig.apiKey) {
            const llmService = createLLMService(retryConfig)
            setLlmService(llmService)
            setLlmConfig(retryConfig)
            console.log('LLM service initialized on retry:', retryConfig.provider)
            
            // Initialize tool orchestrator with retry LLM service
            const toolOrchestrator = createToolOrchestrator(llmService)
            const qbConfig = await configService.getQuickBooksConfiguration()
            if (qbConfig && qbConfig.companyId) {
              toolOrchestrator.enableQuickBooks()
              console.log('QuickBooks integration enabled with Company ID:', qbConfig.companyId)
            }
            setToolOrchestrator(toolOrchestrator)
            setToolsEnabled(true)
          } else {
            // Even without LLM, check for QuickBooks to enable basic tools
            const qbConfig = await configService.getQuickBooksConfiguration()
            if (qbConfig && qbConfig.companyId) {
              console.log('QuickBooks configuration found but LLM not available')
              console.log('QuickBooks Company ID:', qbConfig.companyId)
            }
          }
        }
      } catch (error) {
        console.error('Error initializing services:', error)
      }
    }

    initializeServices()
  }, [isClient])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !isClient) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = inputMessage
    setInputMessage("")
    setIsLoading(true)

    try {
      let response: string
      let sources: any[] = []
      let toolCalls: any[] = []
      let toolResults: any[] = []

      // Always try secure server-side API first (even if client-side LLM is configured)
      console.log('Attempting secure server-side LLM API')
      let usedSecureAPI = false
      try {
        const apiResponse = await fetch('/api/llm/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: messages.slice(-5).map(m => ({
              role: m.role,
              content: m.content
            })),
            options: {
              maxTokens: llmConfig?.maxTokens || 4000,
              temperature: llmConfig?.temperature || 0.7
            }
          })
        })

        if (apiResponse.ok) {
          const data = await apiResponse.json()
          response = data.content
          console.log('✅ LLM response received from secure API:', data.provider, data.model)
          usedSecureAPI = true
        } else {
          const errorData = await apiResponse.json().catch(() => ({ error: `HTTP ${apiResponse.status}` }))
          console.error('❌ LLM API error:', errorData)
          throw new Error(errorData.message || errorData.error || 'LLM API not available')
        }
      } catch (apiError: any) {
        console.warn('Secure API failed, falling back to client-side LLM:', apiError?.message)
        // Fall through to client-side LLM if available
      }

      // Only use client-side LLM if secure API failed and client-side is configured
      if (!usedSecureAPI && isClient && llmService && llmConfig) {
        // Use real LLM service with tool orchestration
        console.log('Using client-side LLM service:', llmConfig.provider)
        
        if (toolsEnabled && toolOrchestrator) {
          // Use tool orchestration for enhanced responses
          console.log('Using tool orchestration')
          const orchestrationResult = await toolOrchestrator.orchestrate(currentInput, {
            conversationHistory: messages.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n'),
            recentResults: []
          })
          
          response = orchestrationResult.answer
          toolCalls = orchestrationResult.toolCalls
          toolResults = orchestrationResult.toolResults
          
          // Add tool execution information to response
          if (toolCalls.length > 0) {
            response += `\n\n**Tools Used:**\n`
            toolCalls.forEach((tool, index) => {
              const result = toolResults[index]
              const status = result?.success ? '✅' : '❌'
              response += `${status} ${tool.name}\n`
            })
          }
        } else if (ragEnabled && ragService) {
          // Use RAG for enhanced responses
          console.log('Using RAG-enhanced response')
          const ragResponse = await ragService.query(currentInput, {
            context: messages.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n'),
            maxSources: 3,
            includeReasoning: true
          })
          
          response = ragResponse.answer
          sources = ragResponse.sources
          
          // Add source information to response
          if (sources.length > 0) {
            response += `\n\n**Sources:**\n`
            sources.forEach((source, index) => {
              response += `${index + 1}. ${source.document.metadata.title} (${source.relevance} relevance)\n`
            })
          }
        } else {
          // Use direct LLM call without RAG or tools
          const context = messages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')
          
          if (currentInput.toLowerCase().includes('board') || currentInput.toLowerCase().includes('deck')) {
            const llmResponse = await llmService.generateBoardDeck({}, 'Q1 2025')
            response = llmResponse.content
          } else if (currentInput.toLowerCase().includes('performance') || currentInput.toLowerCase().includes('analyze')) {
            const llmResponse = await llmService.analyzePerformance({}, 'Q1 2025')
            response = llmResponse.content
          } else {
            const llmResponse = await llmService.generateFinancialInsight(context, currentInput)
            response = llmResponse.content
          }
        }
      } else if (!usedSecureAPI) {
        // Fallback to enhanced mock response only if secure API also failed
        console.log('Using enhanced mock response (LLM not configured)')
        response = generateEnhancedAIResponse(currentInput, messages)
      }

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
        // Only add tool_calls and provenance if they exist (from API response)
        tool_calls: toolCalls.length > 0 ? toolCalls.map(t => t.name || t) : undefined,
        provenance: sources.length > 0 ? sources.map(s => s.document?.metadata?.title || s).slice(0, 3) : undefined
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } catch (error: any) {
      console.error('Error generating AI response:', error)
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      })
      
      // Try to provide more helpful error message
      let errorMessage = "I'm experiencing technical difficulties"
      if (error?.message) {
        errorMessage += `: ${error.message}`
      }
      
      // Fallback to mock response on error
      const assistantMessage: Message = {
        id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: "assistant",
        content: `${errorMessage}. Let me provide a basic response: ${generateAIResponse(currentInput)}`,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, assistantMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDocumentUpload = async (file: File, type: string, title?: string) => {
    if (!documentService) {
      throw new Error('Document service not available')
    }

    setIsUploading(true)
    try {
      await documentService.uploadDocument({
        file,
        type: type as any,
        title,
        source: 'User Upload'
      })
    } finally {
      setIsUploading(false)
    }
  }

  const generateEnhancedAIResponse = (userInput: string, messageHistory: Message[]): string => {
    // Enhanced version that considers conversation history
    const input = userInput.toLowerCase()
    const recentContext = messageHistory.slice(-3).map(m => m.content).join(' ')
    
    if (input.includes("cash") || input.includes("runway")) {
      return "Based on your current financial data, you have approximately 18 weeks of cash runway. Your monthly burn rate is $150K, and with $1.2M in current cash, you're in a stable position. I recommend monitoring your AR collection to potentially extend this runway."
    } else if (input.includes("revenue") || input.includes("forecast")) {
      return "Your Q1 2025 revenue forecast shows strong growth at 15% month-over-month. Current trajectory suggests $2.4M in revenue for the quarter. Key drivers include new customer acquisition (+20%) and expansion revenue (+12%). Would you like me to create a scenario analysis?"
    } else if (input.includes("risk") || input.includes("risks")) {
      return "I've identified 4 active risks in your portfolio. The highest priority is currency fluctuation affecting international revenue (High impact, Medium likelihood). I recommend implementing currency hedging strategies. Would you like me to show you the complete risk matrix?"
    } else if (input.includes("control") || input.includes("compliance")) {
      return "Your financial controls are performing well with a 95% pass rate. The GAAP flux check and balance sheet balance controls are all passing. There's one warning on cash reconciliation with minor discrepancies in petty cash. All evidence is available for review."
    } else if (input.includes("report") || input.includes("board")) {
      return "I can generate a comprehensive board pack for Q1 2025 including financial highlights, KPIs, risk assessment, and forward-looking statements. The report will be ready in PDF format within 5 minutes. Would you like me to proceed with the generation?"
    } else {
      return "I understand you're asking about financial matters. I can help you with cash flow analysis, revenue forecasting, risk assessment, control monitoring, and board reporting. Could you be more specific about what you'd like to explore?"
    }
  }

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()
    
    if (input.includes("cash") || input.includes("runway")) {
      return "Based on your current financial data, you have approximately 18 weeks of cash runway. Your monthly burn rate is $150K, and with $1.2M in current cash, you're in a stable position. I recommend monitoring your AR collection to potentially extend this runway."
    } else if (input.includes("revenue") || input.includes("forecast")) {
      return "Your Q1 2025 revenue forecast shows strong growth at 15% month-over-month. Current trajectory suggests $2.4M in revenue for the quarter. Key drivers include new customer acquisition (+20%) and expansion revenue (+12%). Would you like me to create a scenario analysis?"
    } else if (input.includes("risk") || input.includes("risks")) {
      return "I've identified 4 active risks in your portfolio. The highest priority is currency fluctuation affecting international revenue (High impact, Medium likelihood). I recommend implementing currency hedging strategies. Would you like me to show you the complete risk matrix?"
    } else if (input.includes("control") || input.includes("compliance")) {
      return "Your financial controls are performing well with a 95% pass rate. The GAAP flux check and balance sheet balance controls are all passing. There's one warning on cash reconciliation with minor discrepancies in petty cash. All evidence is available for review."
    } else if (input.includes("report") || input.includes("board")) {
      return "I can generate a comprehensive board pack for Q1 2025 including financial highlights, KPIs, risk assessment, and forward-looking statements. The report will be ready in PDF format within 5 minutes. Would you like me to proceed with the generation?"
    } else {
      return "I understand you're asking about financial matters. I can help you with cash flow analysis, revenue forecasting, risk assessment, control monitoring, and board reporting. Could you be more specific about what you'd like to explore?"
    }
  }

  const quickActions = [
    {
      title: "Cash Flow Analysis",
      description: "Analyze current cash position and runway",
      icon: DollarSign,
      action: "What's our current cash runway and burn rate?"
    },
    {
      title: "Revenue Forecast",
      description: "Generate revenue projections and scenarios",
      icon: BarChart3,
      action: "Show me the Q1 revenue forecast and key drivers"
    },
    {
      title: "Risk Assessment",
      description: "Review identified risks and mitigation strategies",
      icon: AlertTriangle,
      action: "What are our top financial risks and how can we mitigate them?"
    },
    {
      title: "Control Status",
      description: "Check financial control compliance status",
      icon: Target,
      action: "Run all control checks and show me the results"
    }
  ]

  const handleQuickAction = (action: string) => {
    setInputMessage(action)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
          <p className="text-muted-foreground">
            Your intelligent CFO assistant for financial insights and analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant={isClient && llmService ? "default" : "outline"} 
            className={`flex items-center gap-1 ${isClient && llmService ? 'bg-green-100 text-green-800' : ''}`}
          >
            <Brain className="h-3 w-3" />
            {isClient ? (
              llmService ? (
                toolsEnabled ? `Tools+LLM (${llmConfig?.provider})` : 
                ragEnabled ? `RAG+LLM (${llmConfig?.provider})` : 
                `LLM (${llmConfig?.provider})`
              ) : 'Mock Mode'
            ) : 'Loading...'}
          </Badge>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            New Chat
          </Button>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="quick-actions">Quick Actions</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="tools">Available Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-3">
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    AI CFO Assistant
                  </CardTitle>
                  <CardDescription>
                    Ask me anything about your financial data, forecasts, or business metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {message.role === "assistant" && (
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <Bot className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          {message.tool_calls && message.tool_calls.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium mb-1">Tools Used:</p>
                              <div className="flex flex-wrap gap-1">
                                {message.tool_calls.map((tool, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tool}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {message.provenance && message.provenance.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium mb-1">Sources:</p>
                              <div className="flex flex-wrap gap-1">
                                {message.provenance.map((source, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    <FileText className="h-2 w-2 mr-1" />
                                    {source}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          <p className="text-xs opacity-70 mt-2">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        {message.role === "user" && (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div className="bg-muted rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder={isClient ? "Ask me about your financial data..." : "Initializing..."}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      disabled={isLoading || !isClient}
                    />
                    <Button onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim() || !isClient}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Context</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Current Period:</span> Q1 2025
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Cash Runway:</span> 18 weeks
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Active Risks:</span> 4
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Control Status:</span> 95% pass
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xs text-muted-foreground">
                    • Cash flow analysis completed
                  </div>
                  <div className="text-xs text-muted-foreground">
                    • Risk assessment updated
                  </div>
                  <div className="text-xs text-muted-foreground">
                    • Control checks passed
                  </div>
                  <div className="text-xs text-muted-foreground">
                    • Board pack generated
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="quick-actions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {quickActions.map((action, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <action.icon className="h-8 w-8 text-primary mt-1" />
                    <div className="flex-1">
                      <h4 className="font-medium">{action.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {action.description}
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleQuickAction(action.action)}
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Ask
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Insights</CardTitle>
              <CardDescription>
                Key financial insights and recommendations from AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Brain className="h-5 w-5 text-blue-500 mt-1" />
                    <div>
                      <h4 className="font-medium">Revenue Growth Opportunity</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        AI analysis suggests 15% revenue increase possible through pricing optimization. 
                        Current pricing is 8% below market average.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-1" />
                    <div>
                      <h4 className="font-medium">Cash Flow Alert</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        SG&A expenses trending 8% above budget. Marketing spend increased 25% 
                        without corresponding revenue growth.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-green-500 mt-1" />
                    <div>
                      <h4 className="font-medium">Efficiency Improvement</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        AR collection efficiency improved 12% this month. Consider implementing 
                        automated follow-up for further gains.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <DocumentUpload 
              onUpload={handleDocumentUpload}
              isUploading={isUploading}
            />
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Base</CardTitle>
                <CardDescription>
                  Documents available for AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Q1 2025 Financial Report</span>
                    </div>
                    <Badge variant="outline">Financial Report</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Financial Controls Policy</span>
                    </div>
                    <Badge variant="outline">Policy</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">Financial Metrics Dictionary</span>
                    </div>
                    <Badge variant="outline">Data Dictionary</Badge>
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  <p>RAG Status: {ragEnabled ? 'Active' : 'Inactive'}</p>
                  <p>Total Documents: 3</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available FP&A Tools</CardTitle>
              <CardDescription>
                Financial Planning & Analysis tools available to the AI assistant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {toolOrchestrator?.getAvailableTools().map((tool, index) => (
                  <Card key={index} className="p-4">
                  <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <h4 className="font-medium text-sm">{tool.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                    </div>
                      <p className="text-xs text-muted-foreground">{tool.description}</p>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {tool.category.replace('_', ' ')}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {tool.parameters.required.length} params
                        </Badge>
                    </div>
                    </div>
                  </Card>
                ))}
                    </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <Brain className="h-4 w-4" />
                  <span className="font-medium">Tool Status: {toolsEnabled ? 'Active' : 'Inactive'}</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Tools are automatically selected based on your questions. Try asking about cash flow, revenue, expenses, or financial reports.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

