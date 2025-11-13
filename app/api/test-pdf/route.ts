import { NextRequest, NextResponse } from "next/server"
import { Form1040OCREngine } from "@/lib/ai/1040-ocr-engine"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
	try {
		const form = await req.formData()
		const file = form.get("file") as unknown as File | null
		if (!file) {
			return NextResponse.json({ error: "Missing file" }, { status: 400 })
		}

		const arrayBuffer = await file.arrayBuffer()
		const ocrEngine = new Form1040OCREngine()
		
		console.log("=== TESTING PDF EXTRACTION ===")
		console.log("File info:", {
			name: file.name,
			size: file.size,
			type: file.type
		})
		
		const extractedData = await ocrEngine.extractFromPDF(arrayBuffer)
		
		console.log("=== EXTRACTION RESULT ===")
		console.log("Extracted data:", extractedData)
		
		return NextResponse.json({ 
			ok: true, 
			extractedData,
			fileInfo: {
				name: file.name,
				size: file.size,
				type: file.type
			},
			debug: {
				extractionSuccess: extractedData.name !== "PDF_EXTRACTION_FAILED",
				hasIncome: extractedData.totalIncome > 0,
				hasTax: extractedData.taxOwed > 0
			}
		})
	} catch (err) {
		console.error("Test PDF error", err)
		return NextResponse.json({ 
			error: "Failed to process PDF", 
			details: err instanceof Error ? err.message : 'Unknown error',
			stack: err instanceof Error ? err.stack : undefined
		}, { status: 500 })
	}
}




