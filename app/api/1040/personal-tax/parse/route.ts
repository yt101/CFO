import { NextRequest, NextResponse } from "next/server"
import { PersonalTaxPlannerEngine } from "@/lib/ai/1040-planner-engine"
import { Form1040OCREngine } from "@/lib/ai/1040-ocr-engine"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
	try {
		const contentType = req.headers.get("content-type") || ""
		if (!contentType.includes("multipart/form-data")) {
			return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 })
		}

		const form = await req.formData()
		const file = form.get("file") as unknown as File | null
		if (!file) {
			return NextResponse.json({ error: "Missing file" }, { status: 400 })
		}

		const arrayBuffer = await file.arrayBuffer()
		const fileName = file.name.toLowerCase()
		
		// Check if Python parser microservice is available
		const pythonParserAvailable = process.env.PYTHON_PARSER_URL || "http://localhost:8000"
		
		// For PDF files, try Python parser first (better OCR support)
		if (fileName.endsWith('.pdf')) {
			try {
				console.log("Attempting to use Python parser for PDF...")
				
				// Create a new FormData for Python service
				const pythonFormData = new FormData()
				const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
				pythonFormData.append('file', blob, file.name)
				
				const pythonResponse = await fetch(`${pythonParserAvailable}/parse?year=2024`, {
					method: 'POST',
					body: pythonFormData,
				})
				
				if (pythonResponse.ok) {
					const pythonData = await pythonResponse.json()
					console.log("Python parser succeeded:", pythonData)
					
					// Helper function to parse numbers from strings
					const parseMoney = (value: any): number => {
						if (!value) return 0
						const str = String(value).replace(/[$,]/g, '')
						const num = parseFloat(str)
						return isNaN(num) ? 0 : num
					}
					
					// Convert Python output to our format
					const extractedData = {
						name: pythonData.primary_name || "Unknown",
						ssn: pythonData.ssn || "000-00-0000",
						filingStatus: "Single", // Python parser doesn't extract this yet
						taxYear: pythonData._meta?.year || 2024,
						wages: parseMoney(pythonData.wages),
						interest: parseMoney(pythonData.interest),
						dividends: parseMoney(pythonData.dividends),
						businessIncome: parseMoney(pythonData.business_income),
						capitalGains: parseMoney(pythonData.capital_gains),
						otherIncome: parseMoney(pythonData.other_income),
						totalIncome: parseMoney(pythonData.total_income) || parseMoney(pythonData.agi),
						standardDeduction: parseMoney(pythonData.standard_deduction),
						itemizedDeductions: parseMoney(pythonData.itemized_deductions),
						qualifiedBusinessIncome: parseMoney(pythonData.qualified_business_income),
						totalDeductions: parseMoney(pythonData.total_deductions),
						childTaxCredit: parseMoney(pythonData.child_tax_credit),
						earnedIncomeCredit: 0, // Would need Schedule EIC
						educationCredits: 0,
						otherCredits: parseMoney(pythonData.other_credits),
						totalCredits: parseMoney(pythonData.total_credits),
						taxBeforeCredits: parseMoney(pythonData.total_tax),
						taxOwed: parseMoney(pythonData.amount_owed),
						refund: parseMoney(pythonData.refund),
					}
					
					// Use TypeScript parser for the rest
					const ocrEngine = new Form1040OCREngine()
					const plannerEngine = new PersonalTaxPlannerEngine()
					const form1040Data = plannerEngine.parse1040Data(extractedData)
					const summary = plannerEngine.analyzeOptimizationOpportunities(form1040Data)
					
					return NextResponse.json({ ok: true, summary })
				} else {
					console.log("Python parser not available, falling back to TypeScript parser...")
				}
			} catch (pythonError) {
				console.log("Python parser failed, falling back to TypeScript parser:", pythonError.message)
			}
		}
		
		// Fallback to TypeScript parser
		let extractedData
		const ocrEngine = new Form1040OCREngine()
		
		if (fileName.endsWith('.pdf')) {
			console.log("Processing PDF 1040 return with TypeScript parser")
			extractedData = await ocrEngine.extractFromPDF(arrayBuffer)
		} else if (fileName.endsWith('.xml')) {
			console.log("Processing XML 1040 return")
			extractedData = await ocrEngine.extractFromXML(arrayBuffer)
		} else {
			return NextResponse.json({ error: "Unsupported file type. Please upload a PDF or XML 1040 return." }, { status: 400 })
		}

		// Parse the extracted data into structured format
		const plannerEngine = new PersonalTaxPlannerEngine()
		const form1040Data = plannerEngine.parse1040Data(extractedData)
		
		// Analyze optimization opportunities
		const summary = plannerEngine.analyzeOptimizationOpportunities(form1040Data)

		return NextResponse.json({ ok: true, summary })
	} catch (err) {
		console.error("/api/1040/personal-tax/parse error", err)
		return NextResponse.json({ error: "Failed to process 1040 return" }, { status: 500 })
	}
}


