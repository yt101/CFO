"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, Upload, DollarSign, CheckCircle, Loader2 } from "lucide-react"
import type { PersonalTaxSummary, PersonalTaxQuestion, Form1040Data } from "@/lib/ai/1040-planner-engine"

interface ChatMessage {
	id: string
	role: "user" | "assistant"
	content: string
}

export default function PersonalTaxPlanning() {
	const [summary, setSummary] = useState<PersonalTaxSummary | null>(null)
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
	const [messages, setMessages] = useState<ChatMessage[]>([
		{ id: "welcome", role: "assistant", content: "Welcome to Personal Tax Planning. Upload your 1040 tax return (PDF or XML) to begin. I will extract your tax data and guide you through optimization opportunities." },
	])
	const [input, setInput] = useState("")
	const [isUploading, setIsUploading] = useState(false)
	const [isAnswering, setIsAnswering] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	// Debug: Log when component mounts
	console.log("PersonalTaxPlanning component mounted")

	const handleUpload = async (file: File) => {
		console.log("Upload started with file:", file.name)
		setIsUploading(true)
		try {
			const form = new FormData()
			form.append("file", file)
			console.log("Sending request to /api/1040/personal-tax/parse")
			const res = await fetch("/api/1040/personal-tax/parse", { method: "POST", body: form })
			console.log("Response status:", res.status)
			if (!res.ok) {
				const errorText = await res.text()
				console.error("Upload failed:", errorText)
				throw new Error(`Upload failed: ${res.status} ${errorText}`)
			}
			const data = await res.json()
			console.log("Upload successful, data:", data)
			
			// Check if extraction failed
			const form1040Data = data.summary.form1040Data
			if (form1040Data && (form1040Data.taxpayerInfo.name === "PDF_EXTRACTION_FAILED" || form1040Data.taxpayerInfo.name === "SCANNED_PDF_DETECTED")) {
				const isScanned = form1040Data.taxpayerInfo.name === "SCANNED_PDF_DETECTED"
				const errorTitle = isScanned ? "❌ **Scanned PDF Detected**" : "❌ **PDF Extraction Failed**"
				const errorDetail = isScanned 
					? "This PDF appears to be a scanned image (like a photo of a form). The system can only extract text from PDFs that contain actual text data.\n\n**Please use one of these options:**\n\n1. **Use Demo Data** - I can work with sample data to show you how the system works\n2. **Manual Entry** - Provide your tax information manually\n3. **Try a Different PDF** - Upload a PDF with actual text (not scanned)\n4. **Upload as XML** - If you have the tax return in IRS XML format"
					: "The system was unable to reliably extract your tax data from the PDF. This can happen with:\n- Scanned PDFs with poor image quality\n- Complex form layouts\n- Handwritten forms\n- Corrupted PDF files\n\n**Please use one of these options:**\n\n1. **Use Demo Data** - I can work with sample data to show you how the system works\n2. **Manual Entry** - Provide your tax information manually\n3. **Try a Different PDF** - Upload a cleaner, text-based PDF\n4. **Upload as XML** - If you have the tax return in IRS XML format"
				
				setMessages((prev) => [
					...prev,
					{ 
						id: String(Date.now()), 
						role: "assistant", 
						content: `${errorTitle}\n\n${errorDetail}\n\n**Would you like to:**\n- Type "use demo data" to see how the system works with sample information\n- Type "manual entry" to enter your information step by step\n- Try uploading a different PDF file\n\nI'm here to help you optimize your taxes regardless of which method you choose!` 
					}
				])
				return
			}
			
			setSummary(data.summary)
			setCurrentQuestionIndex(0)
			
			// Show 1040 data summary and start asking questions
			const firstQuestion = data.summary.questions[0]
			
			let welcomeMessage = `✅ **1040 Return Processed Successfully!**\n\n`
			if (form1040Data) {
				welcomeMessage += `**Taxpayer:** ${form1040Data.taxpayerInfo.name}\n`
				welcomeMessage += `**Filing Status:** ${form1040Data.taxpayerInfo.filingStatus}\n`
				welcomeMessage += `**Tax Year:** ${form1040Data.taxpayerInfo.taxYear}\n`
				welcomeMessage += `**Total Income:** $${form1040Data.income.totalIncome.toLocaleString()}\n`
				welcomeMessage += `**Tax Owed:** $${form1040Data.taxLiability.taxOwed.toLocaleString()}\n\n`
			}
			
			welcomeMessage += `I've identified ${data.summary.questions.length} potential optimization opportunities with a total potential savings of $${data.summary.totalTypicalSavings.toLocaleString()}.\n\n`
			
			if (firstQuestion) {
				welcomeMessage += `Let's start with the first question:\n\n**${firstQuestion.question}**\n\n${firstQuestion.typicalSavings ? `Typical potential savings: $${firstQuestion.typicalSavings.toLocaleString()}` : ""}\n\nPlease answer yes/no or provide details about your situation.`
			}
			
			setMessages((prev) => [
				...prev,
				{ id: String(Date.now()), role: "assistant", content: welcomeMessage },
			])
		} catch (e) {
			console.error("Upload error:", e)
			setMessages((prev) => [...prev, { id: String(Date.now()), role: "assistant", content: `Failed to process 1040 return: ${e instanceof Error ? e.message : 'Unknown error'}. Please make sure the file is a valid PDF or XML 1040 tax return.` }])
		} finally {
			setIsUploading(false)
		}
	}

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (file) {
			console.log("File selected:", file.name)
			handleUpload(file)
		}
	}

	const triggerFileUpload = () => {
		console.log("Upload button clicked")
		if (fileInputRef.current) {
			console.log("Triggering file input click")
			fileInputRef.current.click()
		} else {
			console.error("File input ref is null")
		}
	}

	const handleAsk = async () => {
		if (!input.trim()) return
		const userMsg: ChatMessage = { id: String(Date.now()), role: "user", content: input }
		setMessages((prev) => [...prev, userMsg])
		setInput("")
		setIsAnswering(true)
		
		try {
			// Check if this is manual data entry
			if (!summary && input && typeof input === 'string' && (input.toLowerCase().includes('income') || input.toLowerCase().includes('tax') || input.toLowerCase().includes('filing'))) {
				console.log("Processing manual data entry...")
				
				try {
					// Extract data from user input
					const incomeMatch = input.match(/income[:\s]*\$?([\d,]+)/i)
					const taxMatch = input.match(/tax[:\s]*\$?([\d,]+)/i)
					const statusMatch = input.match(/filing[:\s]*(single|married|head of household)/i)
					
					const income = incomeMatch ? parseInt(incomeMatch[1].replace(/,/g, '')) : 0
					const tax = taxMatch ? parseInt(taxMatch[1].replace(/,/g, '')) : 0
					const status = statusMatch ? statusMatch[1] : "Single"
					
					if (income > 0) {
						console.log("Creating summary from manual data...")
						
						// Create a mock summary with the manual data
						const mockForm1040Data = {
							taxpayerInfo: {
								name: "Manual Entry",
								ssn: "XXX-XX-XXXX",
								filingStatus: status,
								taxYear: 2024
							},
							income: {
								wages: income,
								interest: 0,
								dividends: 0,
								businessIncome: 0,
								capitalGains: 0,
								otherIncome: 0,
								totalIncome: income
							},
							deductions: {
								standardDeduction: 0,
								itemizedDeductions: 0,
								qualifiedBusinessIncome: 0,
								totalDeductions: 0
							},
							taxCredits: {
								childTaxCredit: 0,
								earnedIncomeCredit: 0,
								educationCredits: 0,
								otherCredits: 0,
								totalCredits: 0
							},
							taxLiability: {
								taxBeforeCredits: 0,
								totalCredits: 0,
								taxOwed: tax,
								refund: 0
							}
						}
						
						// Create questions for this data
						const { PersonalTaxPlannerEngine } = await import("@/lib/ai/1040-planner-engine")
						const plannerEngine = new PersonalTaxPlannerEngine()
						const mockSummary = plannerEngine.analyzeOptimizationOpportunities(mockForm1040Data)
						
						setSummary(mockSummary)
						setCurrentQuestionIndex(0)
						
						setMessages((prev) => [
							...prev,
							{ 
								id: String(Date.now()+1), 
								role: "assistant", 
								content: `✅ **Manual Data Processed Successfully!**\n\n**Taxpayer:** ${mockForm1040Data.taxpayerInfo.name}\n**Filing Status:** ${mockForm1040Data.taxpayerInfo.filingStatus}\n**Tax Year:** ${mockForm1040Data.taxpayerInfo.taxYear}\n**Total Income:** $${mockForm1040Data.income.totalIncome.toLocaleString()}\n**Tax Owed:** $${mockForm1040Data.taxLiability.taxOwed.toLocaleString()}\n\nI've identified ${mockSummary.questions.length} potential optimization opportunities with a total potential savings of $${mockSummary.totalTypicalSavings.toLocaleString()}.\n\nLet's start with the first question:\n\n**${mockSummary.questions[0].question}**\n\n${mockSummary.questions[0].typicalSavings ? `Typical potential savings: $${mockSummary.questions[0].typicalSavings.toLocaleString()}` : ""}\n\nPlease answer yes/no or provide details about your situation.` 
							}
						])
						return
					} else {
						setMessages((prev) => [
							...prev,
							{ 
								id: String(Date.now()+1), 
								role: "assistant", 
								content: "I couldn't find valid income data in your message. Please try again with a format like:\n\n**Income: $75,000, Tax owed: $8,500, Filing status: Single**" 
							}
						])
						return
					}
				} catch (manualError) {
					console.error("Manual data entry error:", manualError)
					setMessages((prev) => [
						...prev,
						{ 
							id: String(Date.now()+1), 
							role: "assistant", 
							content: "Sorry, there was an error processing your manual entry. Please try again with a format like:\n\n**Income: $75,000, Tax owed: $8,500, Filing status: Single**" 
						}
					])
					return
				}
			}
			
			if (!summary) {
				setMessages((prev) => [...prev, { id: String(Date.now()+1), role: "assistant", content: "Upload the Excel first so I can reference the checklist and savings." }])
				return
			}

			// Process the current question and move to next
			const currentQuestion = summary.questions[currentQuestionIndex]
			if (currentQuestion) {
				// Analyze the user's response and provide feedback
				const response = userMsg.content.toLowerCase()
				let feedback = ""
				let actualSavings = 0
				
				if (response.includes("yes") || response.includes("y") || response.includes("applicable") || response.includes("qualify")) {
					feedback = `Great! This applies to your situation. `
					actualSavings = currentQuestion.typicalSavings || 0
				} else if (response.includes("no") || response.includes("n") || response.includes("not applicable") || response.includes("doesn't apply")) {
					feedback = `Understood, this doesn't apply to your current situation. `
					actualSavings = 0
				} else {
					feedback = `Thank you for the details. Based on your response, `
					// Simple heuristic: if they provided details, assume partial applicability
					actualSavings = currentQuestion.typicalSavings ? Math.round(currentQuestion.typicalSavings * 0.5) : 0
				}

				// Update the question with actual savings
				const updatedQuestions = summary.questions.map((q, idx) => 
					idx === currentQuestionIndex ? { ...q, actualSavings } : q
				)
				const updatedSummary = {
					...summary,
					questions: updatedQuestions,
					totalActualSavings: updatedQuestions.reduce((sum, q) => sum + (q.actualSavings || 0), 0)
				}
				setSummary(updatedSummary)

				// Move to next question or complete
				const nextIndex = currentQuestionIndex + 1
				if (nextIndex < summary.questions.length) {
					const nextQuestion = summary.questions[nextIndex]
					setCurrentQuestionIndex(nextIndex)
					setMessages((prev) => [
						...prev,
						{ 
							id: String(Date.now()+1), 
							role: "assistant", 
							content: `${feedback}I've recorded this as $${actualSavings.toLocaleString()} in actual savings.\n\n**Next question (${nextIndex + 1}/${summary.questions.length}):**\n\n${nextQuestion.question}\n\n${nextQuestion.typicalSavings ? `Typical potential savings: $${nextQuestion.typicalSavings.toLocaleString()}` : ""}\n\nPlease answer yes/no or provide details about your situation.` 
						}
					])
				} else {
					// All questions completed
					setMessages((prev) => [
						...prev,
						{ 
							id: String(Date.now()+1), 
							role: "assistant", 
							content: `${feedback}I've recorded this as $${actualSavings.toLocaleString()} in actual savings.\n\n🎉 **All questions completed!**\n\n**Summary:**\n• Total potential savings: $${summary.totalTypicalSavings.toLocaleString()}\n• Your actual savings: $${updatedSummary.totalActualSavings.toLocaleString()}\n• Savings realized: ${Math.round((updatedSummary.totalActualSavings / summary.totalTypicalSavings) * 100)}%\n\nYou can review all items in the savings dashboard on the right. Feel free to ask me about any specific deductions or credits!` 
						}
					])
				}
			} else {
				setMessages((prev) => [...prev, { id: String(Date.now()+1), role: "assistant", content: "No more questions to review. Check the savings dashboard for a complete summary." }])
			}
		} finally {
			setIsAnswering(false)
		}
	}

	return (
		<div className="space-y-4">
			<h2 className="text-2xl font-semibold">Personal Tax Planning</h2>
			<div className="grid gap-6 md:grid-cols-2">
			{/* Chat + Upload */}
			<Card className="flex flex-col h-[600px]">
				<CardHeader>
					<CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5" /> Personal Tax Planning Chat</CardTitle>
				</CardHeader>
				<CardContent className="flex-1 flex flex-col p-0">
					<div className="px-4 py-2 flex items-center gap-2">
						<input 
							ref={fileInputRef}
							type="file" 
							accept=".pdf,.xml" 
							className="hidden" 
							onChange={handleFileChange}
						/>
						<Button 
							variant="outline" 
							size="sm" 
							disabled={isUploading} 
							onClick={triggerFileUpload}
							className="cursor-pointer"
						>
							{isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
							{isUploading ? "Processing..." : "Upload 1040 Return"}
						</Button>
						<Button 
							variant="outline" 
							size="sm" 
							onClick={() => {
								console.log("Manual data entry clicked")
								setMessages(prev => [...prev, { 
									id: String(Date.now()), 
									role: "assistant", 
									content: "Since PDF extraction is having issues, please provide your tax information manually:\n\n**Please tell me:**\n- Your total income for 2024\n- Your tax owed (or refund amount)\n- Your filing status (Single, Married filing jointly, etc.)\n- Any other relevant tax details\n\nI'll use this information to guide you through optimization opportunities.\n\n**Example format:**\n- Income: $75,000\n- Tax owed: $8,500\n- Filing status: Single" 
								}])
							}}
						>
							Manual Entry
						</Button>
						<Button 
							variant="outline" 
							size="sm" 
							onClick={async () => {
								console.log("Test PDF parsing...")
								setMessages(prev => [...prev, { id: String(Date.now()), role: "assistant", content: "Testing PDF parsing. Please upload a PDF file to see detailed extraction logs in the console." }])
								
								// Test with a sample file if available
								try {
									const response = await fetch('/api/test-pdf', {
										method: 'POST',
										body: new FormData()
									})
									const result = await response.json()
									console.log("Test result:", result)
								} catch (e) {
									console.log("Test error:", e)
								}
							}}
						>
							Test PDF
						</Button>
					</div>
					<ScrollArea className="flex-1 px-4">
						<div className="space-y-3 py-3">
							{messages.map(m => (
								<div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
									<div className={`rounded-lg px-3 py-2 max-w-[80%] ${m.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100"}`}>{m.content}</div>
								</div>
							))}
							{isAnswering && (
								<div className="text-sm text-muted-foreground">Thinking...</div>
							)}
						</div>
					</ScrollArea>
					<div className="p-4 border-t">
						<div className="flex gap-2">
							<Input placeholder={summary ? "Answer the question above (yes/no/details)..." : "Upload 1040 return to begin guided questions..."} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleAsk() }} />
							<Button onClick={handleAsk} disabled={!input.trim() || isAnswering || !summary}>Answer</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Savings Dashboard */}
			<Card className="h-[600px]">
				<CardHeader>
					<CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> Savings Dashboard</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<Card>
							<CardHeader>
								<CardTitle className="text-sm">Typical Potential Savings</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">${(summary?.totalTypicalSavings ?? 0).toLocaleString()}</div>
								<Progress value={summary && summary.totalTypicalSavings > 0 ? Math.min(100, ((summary.totalActualSavings ?? 0) / summary.totalTypicalSavings) * 100) : 0} className="mt-2" />
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle className="text-sm">Actual Savings (Reviewed)</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">${(summary?.totalActualSavings ?? 0).toLocaleString()}</div>
								<div className="text-xs text-muted-foreground">Updated as items are reviewed</div>
							</CardContent>
						</Card>
					</div>
					<div className="space-y-2 max-h-[360px] overflow-y-auto">
						{summary?.questions.map((q) => (
							<div key={q.id} className="flex items-center justify-between border rounded-lg p-3">
								<div className="pr-3">
									<div className="font-medium text-sm">{q.question}</div>
									<div className="text-xs text-muted-foreground">Typical: {q.typicalSavings ? `$${q.typicalSavings.toLocaleString()}` : "-"}</div>
								</div>
								<div className="flex items-center gap-2">
									<Badge variant="secondary" className="text-xs">Actual: {q.actualSavings ? `$${q.actualSavings.toLocaleString()}` : "-"}</Badge>
									<Button variant="outline" size="sm"><CheckCircle className="h-4 w-4 mr-1" /> Mark Reviewed</Button>
								</div>
							</div>
						))}
						{!summary && (
							<div className="text-sm text-muted-foreground">Upload your 1040 return to populate savings items.</div>
						)}
					</div>
				</CardContent>
			</Card>
			</div>
		</div>
	)
}


