import { NextRequest, NextResponse } from "next/server"
import { ocrParser } from "@/lib/integrations/ocr-parser"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentType = formData.get('type') as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    let result
    switch (documentType) {
      case 'tax_return':
        result = await ocrParser.parseTaxReturn(buffer, file.name)
        break
      case 'financial_statement':
        result = await ocrParser.parseFinancialStatement(buffer, file.name)
        break
      case 'bank_statement':
        result = await ocrParser.parseBankStatement(buffer, file.name)
        break
      default:
        result = await ocrParser.parseDocument(buffer, file.name)
    }

    return NextResponse.json({
      success: true,
      result,
      message: "Document parsed successfully"
    })
  } catch (error) {
    console.error("OCR parsing error:", error)
    return NextResponse.json(
      { error: "Failed to parse document" },
      { status: 500 }
    )
  }
}
































