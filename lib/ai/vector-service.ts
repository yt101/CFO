"use client"

interface VectorDocument {
  id: string
  content: string
  metadata: {
    title?: string
    type: 'financial_report' | 'policy' | 'procedure' | 'data_dictionary' | 'analysis' | 'other'
    source?: string
    date?: string
    company_id?: string
    [key: string]: any
  }
  embedding?: number[]
}

interface SearchResult {
  document: VectorDocument
  score: number
  relevance: 'high' | 'medium' | 'low'
}

interface VectorDBConfig {
  provider: 'pinecone' | 'postgres'
  apiKey?: string
  environment?: string
  index?: string
  url?: string
  embedDim?: number
}

export class VectorService {
  private config: VectorDBConfig
  private llmService: any

  constructor(config: VectorDBConfig, llmService?: any) {
    this.config = config
    this.llmService = llmService
  }

  // Generate embeddings using the configured LLM service
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.llmService) {
      throw new Error('LLM service not available for embedding generation')
    }

    try {
      // Use OpenAI embeddings API
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: text,
          model: 'text-embedding-3-small' // More cost-effective than text-embedding-ada-002
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI embeddings API error: ${response.status}`)
      }

      const data = await response.json()
      return data.data[0].embedding
    } catch (error) {
      console.error('Error generating embedding:', error)
      // Fallback to mock embedding for demo
      return this.generateMockEmbedding(text)
    }
  }

  private generateMockEmbedding(text: string): number[] {
    // Simple hash-based mock embedding for demo purposes
    const hash = this.simpleHash(text)
    const embedding = new Array(1536).fill(0)
    
    for (let i = 0; i < 1536; i++) {
      embedding[i] = Math.sin(hash + i) * 0.1
    }
    
    return embedding
  }

  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  // Store document in vector database
  async storeDocument(document: VectorDocument): Promise<string> {
    const embedding = await this.generateEmbedding(document.content)
    document.embedding = embedding

    if (this.config.provider === 'pinecone') {
      return this.storeInPinecone(document)
    } else if (this.config.provider === 'postgres') {
      return this.storeInPostgres(document)
    } else {
      throw new Error(`Unsupported vector database provider: ${this.config.provider}`)
    }
  }

  private async storeInPinecone(document: VectorDocument): Promise<string> {
    if (!this.config.apiKey || !this.config.index) {
      throw new Error('Pinecone configuration incomplete')
    }

    const response = await fetch(`https://${this.config.index}-${this.config.environment}.svc.pinecone.io/vectors/upsert`, {
      method: 'POST',
      headers: {
        'Api-Key': this.config.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vectors: [{
          id: document.id,
          values: document.embedding,
          metadata: document.metadata
        }]
      }),
    })

    if (!response.ok) {
      throw new Error(`Pinecone API error: ${response.status}`)
    }

    return document.id
  }

  private async storeInPostgres(document: VectorDocument): Promise<string> {
    // For demo purposes, we'll store in localStorage
    // In production, this would connect to PostgreSQL with pgvector
    const stored = localStorage.getItem('vector_documents') || '[]'
    const documents = JSON.parse(stored)
    
    documents.push({
      ...document,
      created_at: new Date().toISOString()
    })
    
    localStorage.setItem('vector_documents', JSON.stringify(documents))
    return document.id
  }

  // Search for similar documents
  async searchDocuments(
    query: string, 
    options: {
      limit?: number
      threshold?: number
      filter?: Record<string, any>
    } = {}
  ): Promise<SearchResult[]> {
    const { limit = 5, threshold = 0.7, filter = {} } = options
    
    const queryEmbedding = await this.generateEmbedding(query)

    if (this.config.provider === 'pinecone') {
      return this.searchInPinecone(queryEmbedding, limit, threshold, filter)
    } else if (this.config.provider === 'postgres') {
      return this.searchInPostgres(queryEmbedding, limit, threshold, filter)
    } else {
      throw new Error(`Unsupported vector database provider: ${this.config.provider}`)
    }
  }

  private async searchInPinecone(
    queryEmbedding: number[], 
    limit: number, 
    threshold: number, 
    filter: Record<string, any>
  ): Promise<SearchResult[]> {
    if (!this.config.apiKey || !this.config.index) {
      throw new Error('Pinecone configuration incomplete')
    }

    const response = await fetch(`https://${this.config.index}-${this.config.environment}.svc.pinecone.io/query`, {
      method: 'POST',
      headers: {
        'Api-Key': this.config.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vector: queryEmbedding,
        topK: limit,
        includeMetadata: true,
        filter: Object.keys(filter).length > 0 ? filter : undefined
      }),
    })

    if (!response.ok) {
      throw new Error(`Pinecone API error: ${response.status}`)
    }

    const data = await response.json()
    
    return data.matches
      .filter((match: any) => match.score >= threshold)
      .map((match: any) => ({
        document: {
          id: match.id,
          content: '', // Pinecone doesn't store content, only metadata
          metadata: match.metadata
        },
        score: match.score,
        relevance: this.calculateRelevance(match.score)
      }))
  }

  private async searchInPostgres(
    queryEmbedding: number[], 
    limit: number, 
    threshold: number, 
    filter: Record<string, any>
  ): Promise<SearchResult[]> {
    // For demo purposes, we'll search in localStorage
    const stored = localStorage.getItem('vector_documents') || '[]'
    const documents = JSON.parse(stored)
    
    // Simple cosine similarity search
    const results = documents
      .map((doc: any) => {
        if (doc.embedding) {
          const similarity = this.cosineSimilarity(queryEmbedding, doc.embedding)
          return {
            document: doc,
            score: similarity,
            relevance: this.calculateRelevance(similarity)
          }
        }
        return null
      })
      .filter((result: any) => result && result.score >= threshold)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, limit)

    return results
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  private calculateRelevance(score: number): 'high' | 'medium' | 'low' {
    if (score >= 0.8) return 'high'
    if (score >= 0.6) return 'medium'
    return 'low'
  }

  // Get document by ID
  async getDocument(id: string): Promise<VectorDocument | null> {
    if (this.config.provider === 'postgres') {
      const stored = localStorage.getItem('vector_documents') || '[]'
      const documents = JSON.parse(stored)
      return documents.find((doc: any) => doc.id === id) || null
    }
    
    // For Pinecone, we'd need to implement a separate metadata store
    return null
  }

  // Delete document
  async deleteDocument(id: string): Promise<boolean> {
    if (this.config.provider === 'postgres') {
      const stored = localStorage.getItem('vector_documents') || '[]'
      const documents = JSON.parse(stored)
      const filtered = documents.filter((doc: any) => doc.id !== id)
      localStorage.setItem('vector_documents', JSON.stringify(filtered))
      return true
    }
    
    return false
  }

  // Get all documents (for management)
  async getAllDocuments(): Promise<VectorDocument[]> {
    if (this.config.provider === 'postgres') {
      const stored = localStorage.getItem('vector_documents') || '[]'
      return JSON.parse(stored)
    }
    
    return []
  }
}

// Factory function to create vector service
export function createVectorService(config: VectorDBConfig, llmService?: any): VectorService {
  return new VectorService(config, llmService)
}












