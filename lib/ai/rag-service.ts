"use client"

import { VectorService, VectorDocument, SearchResult } from './vector-service'
import { LLMService } from './llm-service'

interface RAGContext {
  documents: SearchResult[]
  query: string
  userContext?: string
}

interface RAGResponse {
  answer: string
  sources: Array<{
    document: VectorDocument
    relevance: 'high' | 'medium' | 'low'
    excerpt: string
  }>
  confidence: number
  reasoning?: string
}

export class RAGService {
  private vectorService: VectorService
  private llmService: LLMService

  constructor(vectorService: VectorService, llmService: LLMService) {
    this.vectorService = vectorService
    this.llmService = llmService
  }

  // Main RAG query method
  async query(
    question: string, 
    options: {
      context?: string
      maxSources?: number
      includeReasoning?: boolean
    } = {}
  ): Promise<RAGResponse> {
    const { context = '', maxSources = 5, includeReasoning = false } = options

    // Step 1: Search for relevant documents
    const searchResults = await this.vectorService.searchDocuments(question, {
      limit: maxSources,
      threshold: 0.6
    })

    // Step 2: Prepare context for LLM
    const ragContext = this.prepareContext(searchResults, question, context)

    // Step 3: Generate answer using LLM with context
    const answer = await this.generateAnswer(ragContext, includeReasoning)

    // Step 4: Extract sources and confidence
    const sources = this.extractSources(searchResults)
    const confidence = this.calculateConfidence(searchResults, answer)

    return {
      answer,
      sources,
      confidence,
      reasoning: includeReasoning ? this.generateReasoning(searchResults, answer) : undefined
    }
  }

  private prepareContext(
    searchResults: SearchResult[], 
    question: string, 
    userContext: string
  ): RAGContext {
    return {
      documents: searchResults,
      query: question,
      userContext
    }
  }

  private async generateAnswer(
    context: RAGContext, 
    includeReasoning: boolean
  ): Promise<string> {
    const systemPrompt = `You are an AI CFO assistant with access to company financial documents and data. 
    Use the provided context to answer questions accurately and comprehensively.

    Guidelines:
    - Base your answer on the provided documents and context
    - If information is not available in the context, clearly state this
    - Cite specific documents or data points when relevant
    - Provide actionable insights when possible
    - Be precise and professional in your financial analysis
    - If you're uncertain about something, express that uncertainty

    ${includeReasoning ? 'Also provide your reasoning process for how you arrived at your answer.' : ''}`

    const contextText = this.formatContextForLLM(context)
    
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: `Context:\n${contextText}\n\nQuestion: ${context.query}` }
    ]

    const response = await this.llmService.generateResponse(messages, {
      temperature: 0.3, // Lower temperature for more consistent, factual responses
      maxTokens: 2000
    })

    return response.content
  }

  private formatContextForLLM(context: RAGContext): string {
    let contextText = ''

    if (context.userContext) {
      contextText += `User Context:\n${context.userContext}\n\n`
    }

    if (context.documents.length > 0) {
      contextText += 'Relevant Documents:\n'
      context.documents.forEach((result, index) => {
        const doc = result.document
        contextText += `\n${index + 1}. ${doc.metadata.title || 'Document'} (${doc.metadata.type})\n`
        contextText += `   Source: ${doc.metadata.source || 'Unknown'}\n`
        contextText += `   Date: ${doc.metadata.date || 'Unknown'}\n`
        contextText += `   Relevance: ${result.relevance}\n`
        contextText += `   Content: ${doc.content.substring(0, 500)}${doc.content.length > 500 ? '...' : ''}\n`
      })
    } else {
      contextText += 'No relevant documents found in the knowledge base.\n'
    }

    return contextText
  }

  private extractSources(searchResults: SearchResult[]) {
    return searchResults.map(result => ({
      document: result.document,
      relevance: result.relevance,
      excerpt: this.extractExcerpt(result.document.content, 200)
    }))
  }

  private extractExcerpt(content: string, maxLength: number): string {
    if (content.length <= maxLength) return content
    
    // Try to find a good breaking point
    const halfLength = Math.floor(maxLength / 2)
    const start = content.substring(0, halfLength)
    const end = content.substring(content.length - halfLength)
    
    return `${start}...${end}`
  }

  private calculateConfidence(searchResults: SearchResult[], answer: string): number {
    if (searchResults.length === 0) return 0.3

    // Base confidence on search result scores and number of sources
    const avgScore = searchResults.reduce((sum, result) => sum + result.score, 0) / searchResults.length
    const sourceBonus = Math.min(searchResults.length * 0.1, 0.3)
    
    return Math.min(avgScore + sourceBonus, 1.0)
  }

  private generateReasoning(searchResults: SearchResult[], answer: string): string {
    const reasoning = []
    
    reasoning.push(`Found ${searchResults.length} relevant documents`)
    
    if (searchResults.length > 0) {
      const highRelevance = searchResults.filter(r => r.relevance === 'high').length
      const mediumRelevance = searchResults.filter(r => r.relevance === 'medium').length
      
      reasoning.push(`${highRelevance} highly relevant, ${mediumRelevance} moderately relevant`)
      
      const avgScore = searchResults.reduce((sum, r) => sum + r.score, 0) / searchResults.length
      reasoning.push(`Average relevance score: ${avgScore.toFixed(2)}`)
    }
    
    reasoning.push(`Answer length: ${answer.length} characters`)
    
    return reasoning.join('. ')
  }

  // Store a new document in the knowledge base
  async addDocument(document: Omit<VectorDocument, 'id'>): Promise<string> {
    const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const fullDocument: VectorDocument = { ...document, id }
    
    await this.vectorService.storeDocument(fullDocument)
    return id
  }

  // Store multiple documents
  async addDocuments(documents: Omit<VectorDocument, 'id'>[]): Promise<string[]> {
    const ids: string[] = []
    
    for (const doc of documents) {
      const id = await this.addDocument(doc)
      ids.push(id)
    }
    
    return ids
  }

  // Get document by ID
  async getDocument(id: string): Promise<VectorDocument | null> {
    return await this.vectorService.getDocument(id)
  }

  // Delete document
  async deleteDocument(id: string): Promise<boolean> {
    return await this.vectorService.deleteDocument(id)
  }

  // List all documents
  async listDocuments(): Promise<VectorDocument[]> {
    return await this.vectorService.getAllDocuments()
  }

  // Search documents without generating an answer
  async searchDocuments(
    query: string, 
    options: {
      limit?: number
      threshold?: number
      filter?: Record<string, any>
    } = {}
  ): Promise<SearchResult[]> {
    return await this.vectorService.searchDocuments(query, options)
  }
}

// Factory function to create RAG service
export function createRAGService(vectorService: VectorService, llmService: LLMService): RAGService {
  return new RAGService(vectorService, llmService)
}












