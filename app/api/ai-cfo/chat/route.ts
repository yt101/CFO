import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, context } = body

    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Generate AI response based on question
    const response = generateAIResponse(question, context)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error processing chat request:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}

function generateAIResponse(question: string, context: any): any {
  const input = question.toLowerCase()
  
  // Determine if tool calls are needed
  const needsToolCalls = Math.random() > 0.5
  const toolCalls = needsToolCalls ? getRelevantToolCalls(input) : []
  const provenance = needsToolCalls ? getRelevantSources(input) : []

  let answer = ""
  
  if (input.includes("cash") || input.includes("runway")) {
    answer = "Based on your current financial data, you have approximately 18 weeks of cash runway. Your monthly burn rate is $150K, and with $1.2M in current cash, you're in a stable position. I recommend monitoring your AR collection to potentially extend this runway."
  } else if (input.includes("revenue") || input.includes("forecast")) {
    answer = "Your Q1 2025 revenue forecast shows strong growth at 15% month-over-month. Current trajectory suggests $2.4M in revenue for the quarter. Key drivers include new customer acquisition (+20%) and expansion revenue (+12%). Would you like me to create a scenario analysis?"
  } else if (input.includes("risk") || input.includes("risks")) {
    answer = "I've identified 4 active risks in your portfolio. The highest priority is currency fluctuation affecting international revenue (High impact, Medium likelihood). I recommend implementing currency hedging strategies. Would you like me to show you the complete risk matrix?"
  } else if (input.includes("control") || input.includes("compliance")) {
    answer = "Your financial controls are performing well with a 95% pass rate. The GAAP flux check and balance sheet balance controls are all passing. There's one warning on cash reconciliation with minor discrepancies in petty cash. All evidence is available for review."
  } else if (input.includes("report") || input.includes("board")) {
    answer = "I can generate a comprehensive board pack for Q1 2025 including financial highlights, KPIs, risk assessment, and forward-looking statements. The report will be ready in PDF format within 5 minutes. Would you like me to proceed with the generation?"
  } else if (input.includes("variance") || input.includes("analysis")) {
    answer = "Your variance analysis shows revenue 6.25% below budget due to lower conversion rates, but this is partially offset by better COGS performance from improved supplier negotiations. Marketing spend is 20% above budget - I recommend reviewing campaign ROI."
  } else if (input.includes("optimization") || input.includes("improve")) {
    answer = "I can suggest several optimization opportunities: 1) Accelerate AR collection for $180K impact, 2) Extend AP terms for $75K impact, 3) Reduce inventory levels for $120K impact. Would you like me to run a detailed cash optimization analysis?"
  } else {
    answer = "I understand you're asking about financial matters. I can help you with cash flow analysis, revenue forecasting, risk assessment, control monitoring, variance analysis, and board reporting. Could you be more specific about what you'd like to explore?"
  }

  return {
    answer,
    tool_calls: toolCalls,
    provenance: provenance,
    confidence: Math.floor(Math.random() * 20) + 80, // 80-100%
    response_time: Math.floor(Math.random() * 500) + 500 // 500-1000ms
  }
}

function getRelevantToolCalls(input: string): string[] {
  const toolCalls = []
  
  if (input.includes("cash") || input.includes("runway")) {
    toolCalls.push("get_cash_flow", "calculate_runway")
  }
  if (input.includes("revenue") || input.includes("forecast")) {
    toolCalls.push("get_forecast", "analyze_drivers")
  }
  if (input.includes("risk")) {
    toolCalls.push("get_risk_matrix", "assess_mitigation")
  }
  if (input.includes("control")) {
    toolCalls.push("run_control_checks", "get_control_results")
  }
  if (input.includes("variance")) {
    toolCalls.push("analyze_variance", "get_budget_data")
  }
  if (input.includes("optimization")) {
    toolCalls.push("optimize_cash_flow", "analyze_working_capital")
  }
  
  return toolCalls
}

function getRelevantSources(input: string): string[] {
  const sources = []
  
  if (input.includes("cash") || input.includes("runway")) {
    sources.push("Cash_Flow_Statement_Jan_2025.xlsx", "Bank_Reconciliation_Jan.pdf")
  }
  if (input.includes("revenue") || input.includes("forecast")) {
    sources.push("Revenue_Forecast_Q1_2025.xlsx", "Pipeline_Data_Jan.csv")
  }
  if (input.includes("risk")) {
    sources.push("Risk_Register_2025.xlsx", "Risk_Assessment_Matrix.pdf")
  }
  if (input.includes("control")) {
    sources.push("Control_Test_Results_Jan.pdf", "GAAP_Flux_Analysis.xlsx")
  }
  if (input.includes("variance")) {
    sources.push("Budget_vs_Actual_Jan.xlsx", "Variance_Analysis_Report.pdf")
  }
  
  return sources
}













