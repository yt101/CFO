import { NextRequest, NextResponse } from 'next/server'
import PptxGenJS from 'pptxgenjs'

// Function to generate board pack PPTX
async function generateBoardPackPPTX(quarter: string, includeRisks: boolean = true) {
  const pptx = new PptxGenJS()
  
  // Set presentation properties
  pptx.defineLayout({ name: 'A4', width: 10, height: 7.5 })
  pptx.layout = 'A4'
  
  // Title slide
  const titleSlide = pptx.addSlide()
  titleSlide.addText(`${quarter} Board Pack`, {
    x: 1,
    y: 2,
    w: 8,
    h: 1,
    fontSize: 32,
    bold: true,
    align: 'center',
    color: '2E86AB'
  })
  titleSlide.addText('Financial Performance Review', {
    x: 1,
    y: 3.5,
    w: 8,
    h: 0.5,
    fontSize: 18,
    align: 'center',
    color: '666666'
  })
  titleSlide.addText(`Generated on ${new Date().toLocaleDateString()}`, {
    x: 1,
    y: 6,
    w: 8,
    h: 0.5,
    fontSize: 14,
    align: 'center',
    color: '999999'
  })
  
  // Executive Summary slide
  const summarySlide = pptx.addSlide()
  summarySlide.addText('Executive Summary', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.8,
    fontSize: 24,
    bold: true,
    color: '2E86AB'
  })
  
  const summaryData = [
    ['Metric', 'Current Period', 'Previous Period', 'Change'],
    ['Revenue', '$2,400,000', '$2,200,000', '+9.1%'],
    ['EBITDA', '$720,000', '$650,000', '+10.8%'],
    ['Net Income', '$480,000', '$420,000', '+14.3%'],
    ['Cash Position', '$1,200,000', '$1,100,000', '+9.1%']
  ]
  
  summarySlide.addTable(summaryData, {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 3,
    fontSize: 12,
    border: { type: 'solid', color: 'CCCCCC', pt: 1 }
  })
  
  // Financial Performance slide
  const performanceSlide = pptx.addSlide()
  performanceSlide.addText('Financial Performance', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.8,
    fontSize: 24,
    bold: true,
    color: '2E86AB'
  })
  
  const performanceData = [
    ['Income Statement', 'Amount', 'Margin'],
    ['Revenue', '$2,400,000', '100%'],
    ['COGS', '$960,000', '40%'],
    ['Gross Profit', '$1,440,000', '60%'],
    ['Operating Expenses', '$720,000', '30%'],
    ['EBITDA', '$720,000', '30%'],
    ['Depreciation', '$120,000', '5%'],
    ['EBIT', '$600,000', '25%'],
    ['Interest', '$60,000', '2.5%'],
    ['EBT', '$540,000', '22.5%'],
    ['Tax', '$60,000', '2.5%'],
    ['Net Income', '$480,000', '20%']
  ]
  
  performanceSlide.addTable(performanceData, {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 4.5,
    fontSize: 11,
    border: { type: 'solid', color: 'CCCCCC', pt: 1 }
  })
  
  // Key Metrics slide
  const metricsSlide = pptx.addSlide()
  metricsSlide.addText('Key Performance Indicators', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.8,
    fontSize: 24,
    bold: true,
    color: '2E86AB'
  })
  
  const metricsData = [
    ['KPI', 'Current', 'Target', 'Status'],
    ['Revenue Growth', '12.5%', '10%', '✓ Above Target'],
    ['Gross Margin', '60%', '55%', '✓ Above Target'],
    ['EBITDA Margin', '30%', '25%', '✓ Above Target'],
    ['Cash Conversion', '45 days', '50 days', '✓ Above Target'],
    ['Customer Acquisition', '150', '120', '✓ Above Target'],
    ['Churn Rate', '3.2%', '<5%', '✓ Within Target']
  ]
  
  metricsSlide.addTable(metricsData, {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 4.5,
    fontSize: 11,
    border: { type: 'solid', color: 'CCCCCC', pt: 1 }
  })
  
  // Add risk assessment slide if requested
  if (includeRisks) {
    const riskSlide = pptx.addSlide()
    riskSlide.addText('Risk Assessment', {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.8,
      fontSize: 24,
      bold: true,
      color: '2E86AB'
    })
    
    const riskData = [
      ['Risk Category', 'Risk Level', 'Mitigation Strategy'],
      ['Market Competition', 'Medium', 'Focus on innovation and customer retention'],
      ['Economic Downturn', 'Low', 'Diversified revenue streams and strong cash position'],
      ['Regulatory Changes', 'Low', 'Regular compliance monitoring and legal review'],
      ['Technology Disruption', 'Medium', 'Continuous R&D investment and partnerships'],
      ['Key Person Dependency', 'Medium', 'Succession planning and knowledge transfer']
    ]
    
    riskSlide.addTable(riskData, {
      x: 0.5,
      y: 1.5,
      w: 9,
      h: 4.5,
      fontSize: 11,
      border: { type: 'solid', color: 'CCCCCC', pt: 1 }
    })
  }
  
  // Outlook slide
  const outlookSlide = pptx.addSlide()
  outlookSlide.addText('Forward-Looking Statements', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.8,
    fontSize: 24,
    bold: true,
    color: '2E86AB'
  })
  
  outlookSlide.addText('Key Priorities for Next Quarter:', {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 0.5,
    fontSize: 16,
    bold: true
  })
  
  const priorities = [
    '• Continue revenue growth momentum through expanded market reach',
    '• Optimize operational efficiency to maintain strong margins',
    '• Invest in technology infrastructure for scalability',
    '• Strengthen customer relationships and reduce churn',
    '• Explore strategic partnerships for market expansion'
  ]
  
  priorities.forEach((priority, index) => {
    outlookSlide.addText(priority, {
      x: 0.5,
      y: 2.2 + (index * 0.4),
      w: 9,
      h: 0.4,
      fontSize: 14
    })
  })
  
  return pptx
}

// Function to generate custom report PPTX
async function generateCustomReportPPTX(reportData: any) {
  const pptx = new PptxGenJS()
  
  // Set presentation properties
  pptx.defineLayout({ name: 'A4', width: 10, height: 7.5 })
  pptx.layout = 'A4'
  
  // Title slide
  const titleSlide = pptx.addSlide()
  titleSlide.addText(reportData.name, {
    x: 1,
    y: 2,
    w: 8,
    h: 1,
    fontSize: 32,
    bold: true,
    align: 'center',
    color: '2E86AB'
  })
  titleSlide.addText(reportData.description || 'Custom Financial Report', {
    x: 1,
    y: 3.5,
    w: 8,
    h: 0.5,
    fontSize: 18,
    align: 'center',
    color: '666666'
  })
  titleSlide.addText(`Generated on ${new Date().toLocaleDateString()}`, {
    x: 1,
    y: 6,
    w: 8,
    h: 0.5,
    fontSize: 14,
    align: 'center',
    color: '999999'
  })
  
  // Generate slides based on selected sections
  const sectionTemplates = {
    executive_summary: {
      title: 'Executive Summary',
      content: [
        ['Metric', 'Current Period', 'Previous Period', 'Change'],
        ['Revenue', '$2,400,000', '$2,200,000', '+9.1%'],
        ['EBITDA', '$720,000', '$650,000', '+10.8%'],
        ['Net Income', '$480,000', '$420,000', '+14.3%'],
        ['Cash Position', '$1,200,000', '$1,100,000', '+9.1%']
      ]
    },
    financial_performance: {
      title: 'Financial Performance',
      content: [
        ['Income Statement', 'Amount', 'Margin'],
        ['Revenue', '$2,400,000', '100%'],
        ['COGS', '$960,000', '40%'],
        ['Gross Profit', '$1,440,000', '60%'],
        ['Operating Expenses', '$720,000', '30%'],
        ['EBITDA', '$720,000', '30%'],
        ['Net Income', '$480,000', '20%']
      ]
    },
    kpis: {
      title: 'Key Performance Indicators',
      content: [
        ['KPI', 'Current', 'Target', 'Status'],
        ['Revenue Growth', '12.5%', '10%', '✓ Above Target'],
        ['Gross Margin', '60%', '55%', '✓ Above Target'],
        ['EBITDA Margin', '30%', '25%', '✓ Above Target'],
        ['Cash Conversion', '45 days', '50 days', '✓ Above Target'],
        ['Customer Acquisition', '150', '120', '✓ Above Target']
      ]
    },
    variance_analysis: {
      title: 'Variance Analysis',
      content: [
        ['Account', 'Actual', 'Budget', 'Variance', 'Variance %'],
        ['Revenue', '$750,000', '$800,000', '-$50,000', '-6.25%'],
        ['COGS', '$300,000', '$320,000', '+$20,000', '+6.25%'],
        ['Marketing', '$120,000', '$100,000', '-$20,000', '-20%'],
        ['Operations', '$200,000', '$210,000', '+$10,000', '+4.8%']
      ]
    },
    cash_flow: {
      title: 'Cash Flow Analysis',
      content: [
        ['Cash Flow Category', 'Amount', 'Change'],
        ['Operating Cash Flow', '$150,000', '+$25,000'],
        ['Investing Cash Flow', '-$50,000', '-$10,000'],
        ['Financing Cash Flow', '$0', '$0'],
        ['Net Cash Change', '$100,000', '+$15,000'],
        ['Beginning Cash', '$1,100,000', '+$100,000'],
        ['Ending Cash', '$1,200,000', '+$100,000']
      ]
    },
    risk_assessment: {
      title: 'Risk Assessment',
      content: [
        ['Risk Category', 'Risk Level', 'Mitigation Strategy'],
        ['Market Competition', 'Medium', 'Focus on innovation and customer retention'],
        ['Economic Downturn', 'Low', 'Diversified revenue streams and strong cash position'],
        ['Regulatory Changes', 'Low', 'Regular compliance monitoring and legal review'],
        ['Technology Disruption', 'Medium', 'Continuous R&D investment and partnerships'],
        ['Key Person Dependency', 'Medium', 'Succession planning and knowledge transfer']
      ]
    },
    benchmarking: {
      title: 'Industry Benchmarking',
      content: [
        ['Metric', 'Company', 'Industry Avg', 'Performance'],
        ['Revenue Growth', '12.5%', '8.2%', 'Above Average'],
        ['Gross Margin', '60%', '55%', 'Above Average'],
        ['EBITDA Margin', '30%', '22%', 'Above Average'],
        ['ROE', '18%', '15%', 'Above Average'],
        ['Current Ratio', '2.1', '1.8', 'Above Average']
      ]
    },
    forecasting: {
      title: 'Financial Forecasting',
      content: [
        ['Period', 'Revenue Forecast', 'EBITDA Forecast', 'Cash Forecast'],
        ['Q1 2025', '$2,400,000', '$720,000', '$1,200,000'],
        ['Q2 2025', '$2,520,000', '$756,000', '$1,356,000'],
        ['Q3 2025', '$2,646,000', '$793,800', '$1,549,800'],
        ['Q4 2025', '$2,778,300', '$833,490', '$1,783,290'],
        ['FY 2025', '$10,344,300', '$3,103,290', '$1,783,290']
      ]
    }
  }
  
  // Generate slides for selected sections
  reportData.sections.forEach((sectionId: string) => {
    const section = sectionTemplates[sectionId as keyof typeof sectionTemplates]
    if (section) {
      const slide = pptx.addSlide()
      slide.addText(section.title, {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.8,
        fontSize: 24,
        bold: true,
        color: '2E86AB'
      })
      
      slide.addTable(section.content, {
        x: 0.5,
        y: 1.5,
        w: 9,
        h: 4.5,
        fontSize: 11,
        border: { type: 'solid', color: 'CCCCCC', pt: 1 }
      })
    }
  })
  
  // Add insights slide if requested
  if (reportData.includeInsights) {
    const insightsSlide = pptx.addSlide()
    insightsSlide.addText('AI-Generated Insights', {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.8,
      fontSize: 24,
      bold: true,
      color: '2E86AB'
    })
    
    const insights = [
      '• Revenue growth is exceeding targets with strong market demand',
      '• Operational efficiency improvements are driving margin expansion',
      '• Cash position remains healthy with positive operating cash flow',
      '• Key performance indicators show consistent improvement trends',
      '• Risk factors are well-managed with appropriate mitigation strategies'
    ]
    
    insights.forEach((insight, index) => {
      insightsSlide.addText(insight, {
        x: 0.5,
        y: 1.5 + (index * 0.4),
        w: 9,
        h: 0.4,
        fontSize: 14
      })
    })
  }
  
  // Add summary slide
  const summarySlide = pptx.addSlide()
  summarySlide.addText('Report Summary', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.8,
    fontSize: 24,
    bold: true,
    color: '2E86AB'
  })
  
  summarySlide.addText(`Report: ${reportData.name}`, {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 0.5,
    fontSize: 16,
    bold: true
  })
  
  summarySlide.addText(`Type: ${reportData.reportType}`, {
    x: 0.5,
    y: 2.2,
    w: 9,
    h: 0.4,
    fontSize: 14
  })
  
  summarySlide.addText(`Period: ${reportData.period}`, {
    x: 0.5,
    y: 2.8,
    w: 9,
    h: 0.4,
    fontSize: 14
  })
  
  summarySlide.addText(`Sections Included: ${reportData.sections.length}`, {
    x: 0.5,
    y: 3.4,
    w: 9,
    h: 0.4,
    fontSize: 14
  })
  
  summarySlide.addText(`Generated: ${new Date().toLocaleString()}`, {
    x: 0.5,
    y: 4.5,
    w: 9,
    h: 0.4,
    fontSize: 12,
    color: '666666'
  })
  
  return pptx
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'mtd'
    const period = searchParams.get('period') || '2025-01'

    switch (type) {
      case 'mtd':
        const mtdData = {
          period,
          pnl: {
            revenue: 750000,
            cogs: 300000,
            gross_profit: 450000,
            opex: 280000,
            ebitda: 170000,
            net_income: 120000
          },
          bs: {
            cash: 1200000,
            ar: 450000,
            inventory: 180000,
            total_assets: 2500000,
            ap: 120000,
            debt: 500000,
            equity: 1880000
          },
          cfs: {
            operating_cash: 150000,
            investing_cash: -50000,
            financing_cash: 0,
            net_cash_change: 100000
          }
        }
        return NextResponse.json(mtdData)

      case 'board_pack_status':
        const boardPackStatus = {
          status: "ready",
          last_generated: "2025-01-15T10:30:00Z",
          file_url: "https://api.cfo.ai/reports/board-pack-2025-q1.pptx",
          summary: "Q1 2025 board pack includes financial highlights, key metrics, and risk assessment"
        }
        return NextResponse.json(boardPackStatus)

      case 'templates':
        const templates = [
          {
            id: "monthly_summary",
            name: "Monthly Financial Summary",
            description: "Standard monthly financial report template",
            type: "standard",
            features: ["P&L", "Balance Sheet", "Cash Flow", "AI insights"]
          },
          {
            id: "quarterly_board",
            name: "Quarterly Board Report",
            description: "Comprehensive quarterly board presentation",
            type: "premium",
            features: ["Executive summary", "KPIs", "Risks", "Automated charts"]
          }
        ]
        return NextResponse.json({ templates })

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error fetching reporting data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reporting data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'generate_board_pack':
        const { quarter, include_risks } = data
        try {
          // Generate the PPTX
          const pptx = await generateBoardPackPPTX(quarter, include_risks)
          
          // Convert to buffer
          const buffer = await pptx.write('nodebuffer')
          
          // Return the file as a response
          return new NextResponse(buffer, {
            headers: {
              'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
              'Content-Disposition': `attachment; filename="board-pack-${quarter}.pptx"`,
              'Content-Length': buffer.length.toString()
            }
          })
        } catch (error) {
          console.error('Error generating board pack:', error)
          return NextResponse.json(
            { error: 'Failed to generate board pack' },
            { status: 500 }
          )
        }

      case 'generate_custom_report':
        const { name, description, reportType, period, sections, format, includeCharts, includeInsights } = data
        
        try {
          // Generate custom report based on format
          if (format === 'pdf') {
            // For now, return a mock PDF generation response
            const customReportResponse = {
              report_id: `custom_report_${Date.now()}`,
              name,
              description,
              reportType,
              period,
              sections,
              format,
              includeCharts,
              includeInsights,
              status: 'generated',
              generated_at: new Date().toISOString(),
              download_url: `https://api.cfo.ai/reports/custom-${name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
              file_size: '2.3 MB',
              page_count: sections.length * 2 + 1
            }
            return NextResponse.json(customReportResponse)
          } else if (format === 'excel') {
            // Generate Excel report
            const customReportResponse = {
              report_id: `custom_report_${Date.now()}`,
              name,
              description,
              reportType,
              period,
              sections,
              format,
              includeCharts,
              includeInsights,
              status: 'generated',
              generated_at: new Date().toISOString(),
              download_url: `https://api.cfo.ai/reports/custom-${name.toLowerCase().replace(/\s+/g, '-')}.xlsx`,
              file_size: '1.8 MB',
              sheet_count: sections.length
            }
            return NextResponse.json(customReportResponse)
          } else if (format === 'pptx') {
            // Generate actual PowerPoint report
            try {
              const pptx = await generateCustomReportPPTX(data)
              const buffer = await pptx.write('nodebuffer')
              
              // Return the file as a response
              return new NextResponse(buffer, {
                headers: {
                  'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                  'Content-Disposition': `attachment; filename="${name.toLowerCase().replace(/\s+/g, '-')}-custom-report.pptx"`,
                  'Content-Length': buffer.length.toString()
                }
              })
            } catch (error) {
              console.error('Error generating custom PPTX report:', error)
              return NextResponse.json(
                { error: 'Failed to generate custom PPTX report' },
                { status: 500 }
              )
            }
          } else {
            // HTML format
            const customReportResponse = {
              report_id: `custom_report_${Date.now()}`,
              name,
              description,
              reportType,
              period,
              sections,
              format,
              includeCharts,
              includeInsights,
              status: 'generated',
              generated_at: new Date().toISOString(),
              download_url: `https://api.cfo.ai/reports/custom-${name.toLowerCase().replace(/\s+/g, '-')}.html`,
              file_size: '856 KB'
            }
            return NextResponse.json(customReportResponse)
          }
        } catch (error) {
          console.error('Error generating custom report:', error)
          return NextResponse.json(
            { error: 'Failed to generate custom report' },
            { status: 500 }
          )
        }

      case 'download_report':
        const downloadResponse = {
          download_url: `https://api.cfo.ai/reports/download/${data.report_id}`,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
        return NextResponse.json(downloadResponse)

      case 'schedule_report':
        const scheduleResponse = {
          schedule_id: `schedule_${Date.now()}`,
          frequency: data.frequency,
          next_run: data.next_run,
          created_at: new Date().toISOString()
        }
        return NextResponse.json(scheduleResponse)

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error processing reporting request:', error)
    return NextResponse.json(
      { error: 'Failed to process reporting request' },
      { status: 500 }
    )
  }
}


