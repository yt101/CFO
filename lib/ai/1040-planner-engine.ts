export interface Form1040Data {
	taxpayerInfo: {
		name: string
		ssn: string
		filingStatus: string
		taxYear: number
	}
	income: {
		wages: number
		interest: number
		dividends: number
		businessIncome: number
		capitalGains: number
		otherIncome: number
		totalIncome: number
	}
	deductions: {
		standardDeduction: number
		itemizedDeductions: number
		qualifiedBusinessIncome: number
		totalDeductions: number
	}
	taxCredits: {
		childTaxCredit: number
		earnedIncomeCredit: number
		educationCredits: number
		otherCredits: number
		totalCredits: number
	}
	taxLiability: {
		taxBeforeCredits: number
		totalCredits: number
		taxOwed: number
		refund: number
	}
}

export interface PersonalTaxQuestion {
	id: string
	question: string
	typicalSavings?: number
	actualSavings?: number
	appliesToUser: boolean
	userResponse?: string
}

export interface PersonalTaxSummary {
	form1040Data: Form1040Data | null
	questions: PersonalTaxQuestion[]
	totalTypicalSavings: number
	totalActualSavings: number
}

export class PersonalTaxPlannerEngine {
	private readonly optimizationQuestions: PersonalTaxQuestion[] = [
		{
			id: "1",
			question: "Did you maximize your 401(k) or 403(b) contributions? (2024 limit: $23,000, $30,500 if 50+)",
			typicalSavings: 5000,
			appliesToUser: false
		},
		{
			id: "2", 
			question: "Did you contribute to a Traditional IRA? (2024 limit: $7,000, $8,000 if 50+)",
			typicalSavings: 2000,
			appliesToUser: false
		},
		{
			id: "3",
			question: "Did you contribute to a Health Savings Account (HSA)? (2024 limit: $4,300 individual, $8,550 family)",
			typicalSavings: 1200,
			appliesToUser: false
		},
		{
			id: "4",
			question: "Did you maximize your Flexible Spending Account (FSA) contributions?",
			typicalSavings: 800,
			appliesToUser: false
		},
		{
			id: "5",
			question: "Did you track and deduct all business expenses if you have business income?",
			typicalSavings: 3000,
			appliesToUser: false
		},
		{
			id: "6",
			question: "Did you claim the home office deduction if you work from home?",
			typicalSavings: 1500,
			appliesToUser: false
		},
		{
			id: "7",
			question: "Did you deduct all eligible medical expenses over 7.5% of AGI?",
			typicalSavings: 2000,
			appliesToUser: false
		},
		{
			id: "8",
			question: "Did you claim all eligible charitable contributions?",
			typicalSavings: 1000,
			appliesToUser: false
		},
		{
			id: "9",
			question: "Did you deduct state and local taxes (SALT) up to the $10,000 limit?",
			typicalSavings: 2500,
			appliesToUser: false
		},
		{
			id: "10",
			question: "Did you claim the student loan interest deduction if applicable?",
			typicalSavings: 600,
			appliesToUser: false
		},
		{
			id: "11",
			question: "Did you claim the mortgage interest deduction?",
			typicalSavings: 4000,
			appliesToUser: false
		},
		{
			id: "12",
			question: "Did you claim the child and dependent care credit?",
			typicalSavings: 1200,
			appliesToUser: false
		},
		{
			id: "13",
			question: "Did you claim education credits (American Opportunity or Lifetime Learning)?",
			typicalSavings: 2500,
			appliesToUser: false
		},
		{
			id: "14",
			question: "Did you claim the Earned Income Tax Credit if eligible?",
			typicalSavings: 3000,
			appliesToUser: false
		},
		{
			id: "15",
			question: "Did you consider Roth IRA conversion for tax diversification?",
			typicalSavings: 2000,
			appliesToUser: false
		}
	]

	parse1040Data(extractedData: any): Form1040Data {
		// Parse extracted 1040 data into structured format
		return {
			taxpayerInfo: {
				name: extractedData.name || "Unknown",
				ssn: extractedData.ssn || "XXX-XX-XXXX",
				filingStatus: extractedData.filingStatus || "Single",
				taxYear: extractedData.taxYear || 2024
			},
			income: {
				wages: this.parseNumber(extractedData.wages) || 0,
				interest: this.parseNumber(extractedData.interest) || 0,
				dividends: this.parseNumber(extractedData.dividends) || 0,
				businessIncome: this.parseNumber(extractedData.businessIncome) || 0,
				capitalGains: this.parseNumber(extractedData.capitalGains) || 0,
				otherIncome: this.parseNumber(extractedData.otherIncome) || 0,
				totalIncome: this.parseNumber(extractedData.totalIncome) || 0
			},
			deductions: {
				standardDeduction: this.parseNumber(extractedData.standardDeduction) || 0,
				itemizedDeductions: this.parseNumber(extractedData.itemizedDeductions) || 0,
				qualifiedBusinessIncome: this.parseNumber(extractedData.qualifiedBusinessIncome) || 0,
				totalDeductions: this.parseNumber(extractedData.totalDeductions) || 0
			},
			taxCredits: {
				childTaxCredit: this.parseNumber(extractedData.childTaxCredit) || 0,
				earnedIncomeCredit: this.parseNumber(extractedData.earnedIncomeCredit) || 0,
				educationCredits: this.parseNumber(extractedData.educationCredits) || 0,
				otherCredits: this.parseNumber(extractedData.otherCredits) || 0,
				totalCredits: this.parseNumber(extractedData.totalCredits) || 0
			},
			taxLiability: {
				taxBeforeCredits: this.parseNumber(extractedData.taxBeforeCredits) || 0,
				totalCredits: this.parseNumber(extractedData.totalCredits) || 0,
				taxOwed: this.parseNumber(extractedData.taxOwed) || 0,
				refund: this.parseNumber(extractedData.refund) || 0
			}
		}
	}

	private parseNumber(value: any): number | undefined {
		if (value === null || value === undefined) return undefined
		if (typeof value === "number") return isFinite(value) ? value : undefined
		if (typeof value === "string") {
			const cleaned = value.replace(/[$,%\s]/g, "")
			const n = Number(cleaned)
			return isNaN(n) ? undefined : n
		}
		return undefined
	}

	analyzeOptimizationOpportunities(form1040Data: Form1040Data): PersonalTaxSummary {
		// Analyze the 1040 data and determine which optimization questions apply
		const questions = this.optimizationQuestions.map(q => {
			let appliesToUser = false
			
			// Logic to determine if question applies based on 1040 data
			switch (q.id) {
				case "1": // 401(k) contributions
					appliesToUser = form1040Data.income.wages > 0
					break
				case "2": // Traditional IRA
					appliesToUser = form1040Data.income.wages > 0 && form1040Data.income.wages < 80000
					break
				case "3": // HSA
					appliesToUser = form1040Data.income.wages > 0
					break
				case "4": // FSA
					appliesToUser = form1040Data.income.wages > 0
					break
				case "5": // Business expenses
					appliesToUser = form1040Data.income.businessIncome > 0
					break
				case "6": // Home office
					appliesToUser = form1040Data.income.businessIncome > 0
					break
				case "7": // Medical expenses
					appliesToUser = form1040Data.deductions.itemizedDeductions > 0
					break
				case "8": // Charitable contributions
					appliesToUser = form1040Data.deductions.itemizedDeductions > 0
					break
				case "9": // SALT deduction
					appliesToUser = form1040Data.deductions.itemizedDeductions > 0
					break
				case "10": // Student loan interest
					appliesToUser = form1040Data.income.wages > 0
					break
				case "11": // Mortgage interest
					appliesToUser = form1040Data.deductions.itemizedDeductions > 0
					break
				case "12": // Child care credit
					appliesToUser = form1040Data.taxCredits.childTaxCredit > 0
					break
				case "13": // Education credits
					appliesToUser = form1040Data.income.wages > 0
					break
				case "14": // EITC
					appliesToUser = form1040Data.income.wages > 0 && form1040Data.income.wages < 60000
					break
				case "15": // Roth conversion
					appliesToUser = form1040Data.income.wages > 0
					break
			}

			return {
				...q,
				appliesToUser,
				actualSavings: 0
			}
		})

		const totalTypicalSavings = questions.reduce((sum, q) => sum + (q.typicalSavings ?? 0), 0)
		const totalActualSavings = questions.reduce((sum, q) => sum + (q.actualSavings ?? 0), 0)

		return {
			form1040Data,
			questions,
			totalTypicalSavings,
			totalActualSavings
		}
	}
}