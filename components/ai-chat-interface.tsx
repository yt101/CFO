"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Send, 
  Bot, 
  User, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Target
} from "lucide-react"

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  confidence?: number
  charts?: any[]
  recommendations?: any[]
  followUpQuestions?: string[]
}

interface AIResponse {
  answer: string
  confidence: number
  sources: string[]
  charts?: any[]
  recommendations?: any[]
  followUpQuestions?: string[]
}

export function AIChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Simulate AI response
      const response = await simulateAIResponse(input.trim())
      
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: response.answer,
        timestamp: new Date(),
        confidence: response.confidence,
        charts: response.charts,
        recommendations: response.recommendations,
        followUpQuestions: response.followUpQuestions
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('AI response error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFollowUpQuestion = (question: string) => {
    setInput(question)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600"
    if (confidence >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (confidence >= 0.6) return <Clock className="h-4 w-4 text-yellow-600" />
    return <AlertCircle className="h-4 w-4 text-red-600" />
  }

  const quickQuestions = [
    "What's our current cash runway?",
    "Why did revenue dip last month?",
    "How can we improve our DSO?",
    "What are our biggest cost drivers?",
    "Show me the 13-week cash forecast",
    "What risks should I be aware of?"
  ]

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Financial Advisor
              </CardTitle>
              <CardDescription>
                Ask questions about your financial data and get AI-powered insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Quick Questions */}
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Quick Questions:</h4>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleFollowUpQuestion(question)}
                      className="text-xs"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Chat Messages */}
              <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                {messages.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Start a conversation with your AI financial advisor</p>
                    <p className="text-sm">Try asking about cash flow, revenue, or financial metrics</p>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.type === 'ai' && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                    
                    <div className={`max-w-[80%] ${message.type === 'user' ? 'order-first' : ''}`}>
                      <Card className={message.type === 'user' ? 'bg-primary text-primary-foreground' : ''}>
                        <CardContent className="p-3">
                          <div className="space-y-2">
                            <p className="text-sm">{message.content}</p>
                            
                            {message.type === 'ai' && message.confidence && (
                              <div className="flex items-center gap-2 text-xs">
                                {getConfidenceIcon(message.confidence)}
                                <span className={getConfidenceColor(message.confidence)}>
                                  {Math.round(message.confidence * 100)}% confidence
                                </span>
                              </div>
                            )}

                            {message.recommendations && message.recommendations.length > 0 && (
                              <div className="space-y-2">
                                <h5 className="text-xs font-medium flex items-center gap-1">
                                  <Lightbulb className="h-3 w-3" />
                                  Recommendations:
                                </h5>
                                <div className="space-y-1">
                                  {message.recommendations.map((rec, index) => (
                                    <div key={index} className="text-xs p-2 bg-muted rounded">
                                      <div className="font-medium">{rec.title}</div>
                                      <div className="text-muted-foreground">{rec.description}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                              <div className="space-y-2">
                                <h5 className="text-xs font-medium">Follow-up questions:</h5>
                                <div className="flex flex-wrap gap-1">
                                  {message.followUpQuestions.map((question, index) => (
                                    <Button
                                      key={index}
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleFollowUpQuestion(question)}
                                      className="text-xs h-6"
                                    >
                                      {question}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <div className="text-xs text-muted-foreground mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>

                    {message.type === 'user' && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </div>
                    <Card>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <Progress value={33} className="w-4 h-4" />
                          <span className="text-sm">AI is thinking...</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your financial data..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!input.trim() || isLoading}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                AI-Generated Insights
              </CardTitle>
              <CardDescription>
                Key insights and recommendations from your financial data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">Revenue Growth Opportunity</h4>
                      <p className="text-sm text-green-800 mt-1">
                        Your revenue has grown 15.2% this quarter. Consider scaling customer acquisition 
                        to capitalize on this momentum. Potential impact: $150K additional revenue.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Working Capital Optimization</h4>
                      <p className="text-sm text-blue-800 mt-1">
                        Improving DSO from 32 to 25 days could free up $120K in cash. 
                        Implement automated follow-up sequences and payment incentives.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-orange-900">Cost Management Alert</h4>
                      <p className="text-sm text-orange-800 mt-1">
                        Operating expenses increased 8% this month. Review discretionary spending 
                        and identify cost optimization opportunities.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Scenario Analysis
              </CardTitle>
              <CardDescription>
                Model different business scenarios and their financial impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Best Case Scenario</CardTitle>
                      <CardDescription>20% revenue growth, 5% cost reduction</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Revenue Impact:</span>
                          <span className="text-sm font-medium text-green-600">+$200K</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Cash Flow Impact:</span>
                          <span className="text-sm font-medium text-green-600">+$150K</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Runway Extension:</span>
                          <span className="text-sm font-medium text-green-600">+6 months</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Worst Case Scenario</CardTitle>
                      <CardDescription>5% revenue decline, 10% cost increase</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Revenue Impact:</span>
                          <span className="text-sm font-medium text-red-600">-$50K</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Cash Flow Impact:</span>
                          <span className="text-sm font-medium text-red-600">-$80K</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Runway Reduction:</span>
                          <span className="text-sm font-medium text-red-600">-3 months</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Scenario Modeling</h4>
                  <p className="text-sm text-muted-foreground">
                    Use the AI chat to create custom scenarios. Try asking: 
                    "What if we increased headcount by 20%?" or 
                    "Model the impact of a 10% price increase"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Simulate AI response for demo
async function simulateAIResponse(question: string): Promise<AIResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500))

  const lowerQuestion = question.toLowerCase()

  if (lowerQuestion.includes('cash') || lowerQuestion.includes('runway')) {
    return {
      answer: "Your current cash runway is 12 months at the current burn rate of $50K/month. With $600K in cash and monthly expenses of $50K, you have sufficient runway for the next year. However, I recommend monitoring this closely as it's below the recommended 18-month minimum for startups.",
      confidence: 0.92,
      sources: ['Cash Flow Statement', 'Bank Statements'],
      recommendations: [
        {
          title: 'Extend Runway',
          description: 'Consider raising additional funding or reducing burn rate to extend runway to 18+ months'
        }
      ],
      followUpQuestions: [
        "How can we reduce our burn rate?",
        "What's our fundraising timeline?",
        "Show me the detailed cash flow forecast"
      ]
    }
  }

  if (lowerQuestion.includes('revenue') || lowerQuestion.includes('sales')) {
    return {
      answer: "Revenue analysis shows $1M in current period, representing a 15.2% increase from last quarter. The growth is primarily driven by new customer acquisition (60%) and existing customer expansion (40%). Your revenue per customer has increased 8% due to pricing optimization.",
      confidence: 0.88,
      sources: ['Income Statement', 'Customer Analytics'],
      recommendations: [
        {
          title: 'Scale Customer Acquisition',
          description: 'Increase marketing spend to capitalize on current growth momentum'
        }
      ],
      followUpQuestions: [
        "What's driving the customer expansion?",
        "How does this compare to industry benchmarks?",
        "What's our customer acquisition cost?"
      ]
    }
  }

  if (lowerQuestion.includes('dso') || lowerQuestion.includes('collection')) {
    return {
      answer: "Your Days Sales Outstanding (DSO) is currently 32 days, which is slightly above the industry average of 30 days. This means it takes about 32 days to collect payment from customers. The main drivers are longer payment terms for enterprise customers and some delayed payments.",
      confidence: 0.85,
      sources: ['Accounts Receivable Aging', 'Customer Payment History'],
      recommendations: [
        {
          title: 'Improve Collections Process',
          description: 'Implement automated follow-up sequences and early payment discounts'
        }
      ],
      followUpQuestions: [
        "Which customers have the longest payment terms?",
        "What's our collection rate by customer segment?",
        "How can we incentivize faster payments?"
      ]
    }
  }

  // Default response
  return {
    answer: "I can help you analyze your financial data. I can provide insights on cash flow, revenue, profitability, working capital, forecasting, and risk assessment. Could you be more specific about what you'd like to know?",
    confidence: 0.7,
    sources: ['General Knowledge Base'],
    followUpQuestions: [
      "What's our current cash runway?",
      "How is our revenue performing?",
      "What are our biggest cost drivers?",
      "Show me the financial forecast"
    ]
  }
}
































