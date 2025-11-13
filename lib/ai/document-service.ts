"use client"

import { RAGService } from './rag-service'
import { VectorDocument } from './vector-service'

interface DocumentUpload {
  file: File
  type: 'financial_report' | 'policy' | 'procedure' | 'data_dictionary' | 'analysis' | 'other'
  title?: string
  source?: string
  metadata?: Record<string, any>
}

interface ProcessedDocument {
  id: string
  title: string
  type: string
  content: string
  metadata: Record<string, any>
  uploadedAt: string
  status: 'processing' | 'ready' | 'error'
}

export class DocumentService {
  private ragService: RAGService

  constructor(ragService: RAGService) {
    this.ragService = ragService
  }

  // Upload and process a document
  async uploadDocument(upload: DocumentUpload): Promise<ProcessedDocument> {
    try {
      // Extract text content from file
      const content = await this.extractTextFromFile(upload.file)
      
      // Create document metadata
      const metadata: Record<string, any> = {
        title: upload.title || upload.file.name,
        type: upload.type,
        source: upload.source || upload.file.name,
        date: new Date().toISOString(),
        fileSize: upload.file.size,
        mimeType: upload.file.type,
        ...upload.metadata
      }

      // Create document for vector store
      const document: Omit<VectorDocument, 'id'> = {
        content,
        metadata
      }

      // Store in vector database
      const id = await this.ragService.addDocument(document)

      return {
        id,
        title: metadata.title,
        type: upload.type,
        content,
        metadata,
        uploadedAt: new Date().toISOString(),
        status: 'ready'
      }
    } catch (error) {
      console.error('Error uploading document:', error)
      throw new Error(`Failed to upload document: ${error}`)
    }
  }

  // Extract text from various file types
  private async extractTextFromFile(file: File): Promise<string> {
    const fileType = file.type
    const fileName = file.name.toLowerCase()

    if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      return await this.extractFromTextFile(file)
    } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return await this.extractFromPDF(file)
    } else if (fileType.includes('spreadsheet') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      return await this.extractFromExcel(file)
    } else if (fileName.endsWith('.csv')) {
      return await this.extractFromCSV(file)
    } else if (fileType.includes('word') || fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      return await this.extractFromWord(file)
    } else {
      throw new Error(`Unsupported file type: ${fileType}`)
    }
  }

  private async extractFromTextFile(file: File): Promise<string> {
    return await file.text()
  }

  private async extractFromPDF(file: File): Promise<string> {
    // For demo purposes, we'll use a simple text extraction
    // In production, you'd use a library like pdf-parse or pdfjs-dist
    try {
      const arrayBuffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      
      // Simple PDF text extraction (very basic)
      // In production, use a proper PDF parsing library
      const text = new TextDecoder('utf-8').decode(uint8Array)
      
      // Extract readable text (basic approach)
      const readableText = text
        .replace(/[^\x20-\x7E\n\r]/g, ' ') // Remove non-printable characters
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()
      
      return readableText || 'PDF content extraction not available in demo mode'
    } catch (error) {
      console.error('PDF extraction error:', error)
      return 'PDF content extraction failed'
    }
  }

  private async extractFromExcel(file: File): Promise<string> {
    // For demo purposes, return a placeholder
    // In production, use a library like xlsx
    return `Excel file: ${file.name}\nContent extraction not available in demo mode. Please convert to CSV or text format.`
  }

  private async extractFromCSV(file: File): Promise<string> {
    const content = await file.text()
    // Convert CSV to readable format
    const lines = content.split('\n')
    const headers = lines[0]?.split(',') || []
    
    let readableContent = `CSV Data from ${file.name}:\n\n`
    readableContent += `Headers: ${headers.join(', ')}\n\n`
    
    // Add first few rows as sample
    const sampleRows = lines.slice(1, 6).map(line => 
      line.split(',').map((cell, index) => `${headers[index] || `Column ${index + 1}`}: ${cell}`).join(', ')
    )
    
    readableContent += sampleRows.join('\n')
    
    if (lines.length > 6) {
      readableContent += `\n... and ${lines.length - 6} more rows`
    }
    
    return readableContent
  }

  private async extractFromWord(file: File): Promise<string> {
    // For demo purposes, return a placeholder
    // In production, use a library like mammoth
    return `Word document: ${file.name}\nContent extraction not available in demo mode. Please convert to text format.`
  }

  // Get all uploaded documents
  async getDocuments(): Promise<ProcessedDocument[]> {
    const documents = await this.ragService.listDocuments()
    
    return documents.map(doc => ({
      id: doc.id,
      title: doc.metadata.title || 'Untitled',
      type: doc.metadata.type || 'other',
      content: doc.content,
      metadata: doc.metadata,
      uploadedAt: doc.metadata.date || new Date().toISOString(),
      status: 'ready' as const
    }))
  }

  // Delete a document
  async deleteDocument(id: string): Promise<boolean> {
    return await this.ragService.deleteDocument(id)
  }

  // Search documents
  async searchDocuments(query: string, options: {
    limit?: number
    type?: string
  } = {}): Promise<ProcessedDocument[]> {
    const searchResults = await this.ragService.searchDocuments(query, {
      limit: options.limit || 10,
      filter: options.type ? { type: options.type } : {}
    })
    
    return searchResults.map(result => ({
      id: result.document.id,
      title: result.document.metadata.title || 'Untitled',
      type: result.document.metadata.type || 'other',
      content: result.document.content,
      metadata: result.document.metadata,
      uploadedAt: result.document.metadata.date || new Date().toISOString(),
      status: 'ready' as const
    }))
  }

  // Add sample financial documents for demo
  async addSampleDocuments(): Promise<string[]> {
    const sampleDocs = [
      {
        content: `Q1 2025 Financial Performance Report

Executive Summary:
- Revenue: $2.4M (15% increase from Q4 2024)
- Gross Margin: 68% (2% improvement)
- Operating Expenses: $1.8M (12% increase)
- Net Income: $432K (18% increase)
- Cash Position: $1.2M (stable)

Key Metrics:
- Customer Acquisition Cost: $180 (down 8%)
- Customer Lifetime Value: $2,400 (up 12%)
- Monthly Recurring Revenue: $800K
- Churn Rate: 3.2% (improved from 4.1%)

Revenue Analysis:
- New Customer Revenue: $1.2M (50% of total)
- Expansion Revenue: $720K (30% of total)
- Renewal Revenue: $480K (20% of total)

Cost Management:
- Sales & Marketing: $720K (30% of revenue)
- Research & Development: $480K (20% of revenue)
- General & Administrative: $360K (15% of revenue)
- Customer Success: $240K (10% of revenue)

Cash Flow:
- Operating Cash Flow: $456K
- Investing Cash Flow: -$120K (equipment purchases)
- Financing Cash Flow: $0 (no new funding)

Outlook:
- Q2 2025 revenue target: $2.8M
- Expected headcount increase: 15%
- New product launch planned for Q3`,
        metadata: {
          title: 'Q1 2025 Financial Performance Report',
          type: 'financial_report',
          source: 'Finance Team',
          date: '2025-01-31',
          quarter: 'Q1 2025',
          year: 2025
        }
      },
      {
        content: `Financial Controls and Compliance Policy

1. Revenue Recognition
- Revenue is recognized when services are delivered and payment is received
- Monthly recurring revenue is recognized on a monthly basis
- One-time fees are recognized upon completion of service

2. Expense Management
- All expenses over $1,000 require manager approval
- Travel expenses must be pre-approved
- Equipment purchases over $5,000 require CFO approval

3. Cash Management
- Daily cash position monitoring required
- Bank reconciliations must be completed within 3 business days
- Cash flow forecasts updated weekly

4. Financial Reporting
- Monthly financial statements due by 10th of following month
- Quarterly board reports due within 15 days of quarter end
- Annual audit must be completed within 90 days of year end

5. Internal Controls
- Segregation of duties for all financial transactions
- Monthly variance analysis required
- Budget vs actual reporting mandatory

6. Compliance Requirements
- GAAP accounting standards must be followed
- SOX compliance for all financial processes
- Regular internal audit reviews`,
        metadata: {
          title: 'Financial Controls and Compliance Policy',
          type: 'policy',
          source: 'Finance Team',
          date: '2024-12-01',
          version: '2.1',
          department: 'Finance'
        }
      },
      {
        content: `Data Dictionary - Financial Metrics

Revenue Metrics:
- MRR (Monthly Recurring Revenue): Total monthly subscription revenue
- ARR (Annual Recurring Revenue): MRR × 12
- New MRR: Revenue from new customers in the month
- Expansion MRR: Additional revenue from existing customers
- Churn MRR: Revenue lost from customer cancellations

Customer Metrics:
- CAC (Customer Acquisition Cost): Total sales & marketing spend / new customers
- LTV (Customer Lifetime Value): Average revenue per customer × gross margin / churn rate
- Churn Rate: Customers lost in period / total customers at start of period
- Net Revenue Retention: (Starting MRR + Expansion - Churn) / Starting MRR

Financial Metrics:
- Gross Margin: (Revenue - Cost of Goods Sold) / Revenue
- Operating Margin: Operating Income / Revenue
- EBITDA: Earnings Before Interest, Taxes, Depreciation, Amortization
- Cash Conversion Cycle: Days Sales Outstanding + Days Inventory Outstanding - Days Payable Outstanding

Operational Metrics:
- Burn Rate: Monthly cash consumption
- Runway: Current cash / monthly burn rate
- Rule of 40: Growth Rate + Profit Margin
- Magic Number: (Quarterly Revenue Growth × 4) / (Quarterly Sales & Marketing Spend / Quarterly Revenue)`,
        metadata: {
          title: 'Financial Metrics Data Dictionary',
          type: 'data_dictionary',
          source: 'Finance Team',
          date: '2024-11-15',
          version: '1.3',
          category: 'definitions'
        }
      }
    ]

    const ids: string[] = []
    for (const doc of sampleDocs) {
      const id = await this.ragService.addDocument(doc)
      ids.push(id)
    }

    return ids
  }
}

// Factory function to create document service
export function createDocumentService(ragService: RAGService): DocumentService {
  return new DocumentService(ragService)
}












