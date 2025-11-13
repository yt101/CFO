// OCR Parser - Tesseract + LangChain document loaders
// Note: Tesseract.js is not installed in demo mode - using mock implementation

export interface OCRResult {
  text: string
  confidence: number
  boundingBoxes: BoundingBox[]
  metadata: {
    pageCount: number
    processingTime: number
    language: string
  }
}

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
  text: string
  confidence: number
}

export interface DocumentStructure {
  type: 'tax_return' | 'financial_statement' | 'bank_statement' | 'invoice' | 'receipt'
  confidence: number
  sections: DocumentSection[]
  extractedData: any
}

export interface DocumentSection {
  name: string
  content: string
  confidence: number
  boundingBox: BoundingBox
  lineItems: LineItem[]
}

export interface LineItem {
  label: string
  value: string | number
  confidence: number
  boundingBox: BoundingBox
}

export class OCRParser {
  private worker: any

  constructor() {
    // Mock worker for demo mode
    this.worker = null
  }

  async parseDocument(file: Buffer, filename: string): Promise<OCRResult> {
    const startTime = Date.now()
    
    try {
      // Mock OCR implementation for demo mode
      const mockText = `Mock OCR Text from ${filename}
      
      This is a simulated OCR result for demonstration purposes.
      In production, this would use Tesseract.js for actual OCR processing.
      
      Document contains:
      - Revenue: $1,000,000
      - Expenses: $750,000
      - Net Income: $250,000
      - Cash: $500,000
      - Accounts Receivable: $200,000
      - Accounts Payable: $150,000`

      const mockBoundingBoxes: BoundingBox[] = [
        { x: 10, y: 10, width: 100, height: 20, text: 'Revenue: $1,000,000', confidence: 0.95 },
        { x: 10, y: 40, width: 100, height: 20, text: 'Expenses: $750,000', confidence: 0.92 },
        { x: 10, y: 70, width: 100, height: 20, text: 'Net Income: $250,000', confidence: 0.88 }
      ]

      const processingTime = Date.now() - startTime

      return {
        text: mockText,
        confidence: 0.9,
        boundingBoxes: mockBoundingBoxes,
        metadata: {
          pageCount: 1,
          processingTime,
          language: 'eng'
        }
      }
    } catch (error) {
      console.error('OCR parsing error:', error)
      throw new Error('Failed to parse document with OCR')
    }
  }

  async parseTaxReturn(file: Buffer, filename: string): Promise<DocumentStructure> {
    const ocrResult = await this.parseDocument(file, filename)
    
    // AI-powered document structure analysis
    const documentType = this.identifyDocumentType(ocrResult.text)
    const sections = this.extractTaxReturnSections(ocrResult)
    const extractedData = this.extractTaxReturnData(sections)

    return {
      type: 'tax_return',
      confidence: ocrResult.confidence,
      sections,
      extractedData
    }
  }

  async parseFinancialStatement(file: Buffer, filename: string): Promise<DocumentStructure> {
    const ocrResult = await this.parseDocument(file, filename)
    
    const documentType = this.identifyDocumentType(ocrResult.text)
    const sections = this.extractFinancialStatementSections(ocrResult)
    const extractedData = this.extractFinancialData(sections)

    return {
      type: 'financial_statement',
      confidence: ocrResult.confidence,
      sections,
      extractedData
    }
  }

  async parseBankStatement(file: Buffer, filename: string): Promise<DocumentStructure> {
    const ocrResult = await this.parseDocument(file, filename)
    
    const sections = this.extractBankStatementSections(ocrResult)
    const extractedData = this.extractBankData(sections)

    return {
      type: 'bank_statement',
      confidence: ocrResult.confidence,
      sections,
      extractedData
    }
  }

  private identifyDocumentType(text: string): string {
    const lowerText = text.toLowerCase()
    
    if (lowerText.includes('form 1040') || lowerText.includes('schedule c')) {
      return 'tax_return'
    }
    if (lowerText.includes('income statement') || lowerText.includes('balance sheet')) {
      return 'financial_statement'
    }
    if (lowerText.includes('bank statement') || lowerText.includes('account summary')) {
      return 'bank_statement'
    }
    if (lowerText.includes('invoice') || lowerText.includes('bill to')) {
      return 'invoice'
    }
    if (lowerText.includes('receipt') || lowerText.includes('total:')) {
      return 'receipt'
    }
    
    return 'unknown'
  }

  private extractTaxReturnSections(ocrResult: OCRResult): DocumentSection[] {
    const sections: DocumentSection[] = []
    const text = ocrResult.text
    
    // Extract common tax return sections
    const sectionPatterns = [
      { name: 'Income', pattern: /income|revenue|gross receipts/gi },
      { name: 'Deductions', pattern: /deductions|expenses/gi },
      { name: 'Taxes', pattern: /tax|withholding/gi },
      { name: 'Refund', pattern: /refund|overpayment/gi }
    ]

    sectionPatterns.forEach(({ name, pattern }) => {
      const matches = text.match(pattern)
      if (matches) {
        sections.push({
          name,
          content: this.extractSectionContent(text, name),
          confidence: ocrResult.confidence,
          boundingBox: { x: 0, y: 0, width: 0, height: 0, text: '', confidence: 0 },
          lineItems: this.extractLineItems(text, name)
        })
      }
    })

    return sections
  }

  private extractFinancialStatementSections(ocrResult: OCRResult): DocumentSection[] {
    const sections: DocumentSection[] = []
    const text = ocrResult.text
    
    const sectionPatterns = [
      { name: 'Assets', pattern: /assets|current assets|fixed assets/gi },
      { name: 'Liabilities', pattern: /liabilities|current liabilities|long-term debt/gi },
      { name: 'Equity', pattern: /equity|retained earnings|common stock/gi },
      { name: 'Revenue', pattern: /revenue|sales|income/gi },
      { name: 'Expenses', pattern: /expenses|cost of goods sold|operating expenses/gi }
    ]

    sectionPatterns.forEach(({ name, pattern }) => {
      const matches = text.match(pattern)
      if (matches) {
        sections.push({
          name,
          content: this.extractSectionContent(text, name),
          confidence: ocrResult.confidence,
          boundingBox: { x: 0, y: 0, width: 0, height: 0, text: '', confidence: 0 },
          lineItems: this.extractLineItems(text, name)
        })
      }
    })

    return sections
  }

  private extractBankStatementSections(ocrResult: OCRResult): DocumentSection[] {
    const sections: DocumentSection[] = []
    const text = ocrResult.text
    
    const sectionPatterns = [
      { name: 'Account Summary', pattern: /account summary|balance/gi },
      { name: 'Transactions', pattern: /transactions|activity/gi },
      { name: 'Deposits', pattern: /deposits|credits/gi },
      { name: 'Withdrawals', pattern: /withdrawals|debits/gi }
    ]

    sectionPatterns.forEach(({ name, pattern }) => {
      const matches = text.match(pattern)
      if (matches) {
        sections.push({
          name,
          content: this.extractSectionContent(text, name),
          confidence: ocrResult.confidence,
          boundingBox: { x: 0, y: 0, width: 0, height: 0, text: '', confidence: 0 },
          lineItems: this.extractLineItems(text, name)
        })
      }
    })

    return sections
  }

  private extractSectionContent(text: string, sectionName: string): string {
    // Simple extraction - in production, use more sophisticated NLP
    const lines = text.split('\n')
    const sectionLines: string[] = []
    let inSection = false

    for (const line of lines) {
      if (line.toLowerCase().includes(sectionName.toLowerCase())) {
        inSection = true
        continue
      }
      if (inSection && line.trim() === '') {
        break
      }
      if (inSection) {
        sectionLines.push(line)
      }
    }

    return sectionLines.join('\n')
  }

  private extractLineItems(text: string, sectionName: string): LineItem[] {
    const lines = text.split('\n')
    const lineItems: LineItem[] = []
    
    // Look for lines with numbers (potential line items)
    const numberPattern = /\$?[\d,]+\.?\d*/
    
    for (const line of lines) {
      if (numberPattern.test(line)) {
        const parts = line.split(/\s+/)
        const value = parts.find(part => numberPattern.test(part))
        const label = parts.filter(part => !numberPattern.test(part)).join(' ')
        
        if (value && label) {
          lineItems.push({
            label: label.trim(),
            value: this.parseValue(value),
            confidence: 0.8, // Default confidence
            boundingBox: { x: 0, y: 0, width: 0, height: 0, text: line, confidence: 0.8 }
          })
        }
      }
    }

    return lineItems
  }

  private parseValue(valueStr: string): number {
    // Remove currency symbols and commas
    const cleaned = valueStr.replace(/[$,]/g, '')
    return parseFloat(cleaned) || 0
  }

  private extractTaxReturnData(sections: DocumentSection[]): any {
    const data: any = {}
    
    sections.forEach(section => {
      if (section.name === 'Income') {
        data.income = section.lineItems.reduce((sum, item) => sum + (typeof item.value === 'number' ? item.value : 0), 0)
      } else if (section.name === 'Deductions') {
        data.deductions = section.lineItems.reduce((sum, item) => sum + (typeof item.value === 'number' ? item.value : 0), 0)
      }
    })

    return data
  }

  private extractFinancialData(sections: DocumentSection[]): any {
    const data: any = {}
    
    sections.forEach(section => {
      data[section.name.toLowerCase()] = section.lineItems.reduce((sum, item) => sum + (typeof item.value === 'number' ? item.value : 0), 0)
    })

    return data
  }

  private extractBankData(sections: DocumentSection[]): any {
    const data: any = {}
    
    sections.forEach(section => {
      if (section.name === 'Account Summary') {
        data.balance = section.lineItems.find(item => 
          item.label.toLowerCase().includes('balance')
        )?.value || 0
      } else if (section.name === 'Transactions') {
        data.transactions = section.lineItems
      }
    })

    return data
  }
}

// Export singleton instance
export const ocrParser = new OCRParser()
