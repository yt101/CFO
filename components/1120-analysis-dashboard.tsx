"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calculator, 
  FileText, 
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  Users
} from "lucide-react"
import type { Form1120Data } from "@/lib/ai/1120-advisor-engine"

interface AnalysisDashboardProps {
  formData: Form1120Data
  onOptimizationClick?: (opportunityId: string) => void
}

export function AnalysisDashboard({ formData, onOptimizationClick }: AnalysisDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const totalSavings = formData.optimizationOpportunities.reduce((sum, opp) => sum + opp.potentialSavings, 0)
  const highPriorityOpps = formData.optimizationOpportunities.filter(opp => opp.priority === 'high')
  const completedOpps = formData.optimizationOpportunities.filter(opp => opp.status === 'completed')

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Potential Savings</p>
                <p className="text-2xl font-bold text-green-600">
                  ${Math.round(totalSavings).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Opportunities</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formData.optimizationOpportunities.length}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-red-600">
                  {highPriorityOpps.length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {completedOpps.length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schedule-l">Schedule L</TabsTrigger>
          <TabsTrigger value="profit-loss">P&L</TabsTrigger>
          <TabsTrigger value="reconciliation">M-1/M-2</TabsTrigger>
          <TabsTrigger value="ratios">Ratios</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Company Name:</span>
                  <span className="font-medium">{formData.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">EIN:</span>
                  <span className="font-medium">{formData.ein}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tax Year:</span>
                  <span className="font-medium">{formData.taxYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Entity Type:</span>
                  <Badge variant="outline">{formData.entityType}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Key Financial Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Gross Receipts:</span>
                  <span className="font-medium">
                    ${formData.profitLoss.grossReceipts.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Net Income:</span>
                  <span className="font-medium">
                    ${formData.profitLoss.netIncome.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Assets:</span>
                  <span className="font-medium">
                    ${formData.scheduleL.totalAssets.ending.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Cash Conversion Cycle:</span>
                  <span className="font-medium">
                    {formData.financialRatios.cashConversionCycle.toFixed(0)} days
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Optimization Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Top Optimization Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {formData.optimizationOpportunities
                  .sort((a, b) => b.potentialSavings - a.potentialSavings)
                  .slice(0, 3)
                  .map((opp, index) => (
                    <div key={opp.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={opp.priority === 'high' ? 'destructive' : opp.priority === 'medium' ? 'default' : 'secondary'}
                          >
                            {opp.priority.toUpperCase()}
                          </Badge>
                          <span className="font-medium">{opp.title}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{opp.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          ${Math.round(opp.potentialSavings).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(opp.confidence * 100).toFixed(0)}% confidence
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule L Tab */}
        <TabsContent value="schedule-l" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assets */}
            <Card>
              <CardHeader>
                <CardTitle>Assets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Cash:</span>
                  <span>${formData.scheduleL.cash.ending.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Accounts Receivable:</span>
                  <span>${formData.scheduleL.accountsReceivable.ending.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Inventories:</span>
                  <span>${formData.scheduleL.inventories.ending.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Other Current Assets:</span>
                  <span>${formData.scheduleL.otherCurrentAssets.ending.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Total Current Assets:</span>
                  <span>${formData.scheduleL.totalCurrentAssets.ending.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Buildings & Depreciable Assets:</span>
                  <span>${formData.scheduleL.buildingsAndDepreciableAssets.ending.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Less Accumulated Depreciation:</span>
                  <span>${formData.scheduleL.accumulatedDepreciation.ending.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Land:</span>
                  <span>${formData.scheduleL.land.ending.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Total Assets:</span>
                  <span>${formData.scheduleL.totalAssets.ending.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Liabilities & Equity */}
            <Card>
              <CardHeader>
                <CardTitle>Liabilities & Equity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Accounts Payable:</span>
                  <span>${formData.scheduleL.accountsPayable.ending.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Short-term Debt:</span>
                  <span>${formData.scheduleL.shortTermDebt.ending.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Other Current Liabilities:</span>
                  <span>${formData.scheduleL.otherCurrentLiabilities.ending.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Total Current Liabilities:</span>
                  <span>${formData.scheduleL.totalCurrentLiabilities.ending.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Long-term Debt:</span>
                  <span>${formData.scheduleL.longTermDebt.ending.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Total Liabilities:</span>
                  <span>${formData.scheduleL.totalLiabilities.ending.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Paid-in Capital:</span>
                  <span>${formData.scheduleL.paidInCapital.ending.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Retained Earnings:</span>
                  <span>${formData.scheduleL.retainedEarnings.ending.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Total Equity:</span>
                  <span>${formData.scheduleL.totalEquity.ending.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* P&L Tab */}
        <TabsContent value="profit-loss" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Income Statement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Gross Receipts:</span>
                  <span className="font-medium">${formData.profitLoss.grossReceipts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Cost of Goods Sold:</span>
                  <span>${formData.profitLoss.costOfGoodsSold.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Gross Profit:</span>
                  <span>${formData.profitLoss.grossProfit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Deductions:</span>
                  <span>${formData.profitLoss.totalDeductions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Taxable Income:</span>
                  <span>${formData.profitLoss.taxableIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Income Tax:</span>
                  <span>${formData.profitLoss.incomeTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2 text-lg">
                  <span>Net Income:</span>
                  <span>${formData.profitLoss.netIncome.toLocaleString()}</span>
                </div>
              </div>

              {/* Profitability Ratios */}
              <div className="mt-6 space-y-3">
                <h4 className="font-medium">Profitability Ratios</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-sm text-gray-600">Gross Margin</p>
                    <p className="text-xl font-bold">
                      {(formData.financialRatios.grossMargin * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-sm text-gray-600">Operating Margin</p>
                    <p className="text-xl font-bold">
                      {(formData.financialRatios.operatingMargin * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-sm text-gray-600">Net Margin</p>
                    <p className="text-xl font-bold">
                      {(formData.financialRatios.netMargin * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reconciliation Tab */}
        <TabsContent value="reconciliation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Schedule M-1 */}
            <Card>
              <CardHeader>
                <CardTitle>Schedule M-1 (Reconciliation)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Income per Books:</span>
                  <span>${formData.scheduleM1.incomePerBooks.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Federal Income Tax per Books:</span>
                  <span>${formData.scheduleM1.federalIncomeTaxPerBooks.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Depreciation (Book):</span>
                  <span>${formData.scheduleM1.depreciation.book.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Depreciation (Tax):</span>
                  <span>${formData.scheduleM1.depreciation.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Depreciation Difference:</span>
                  <span className={formData.scheduleM1.depreciation.difference > 0 ? 'text-green-600' : 'text-red-600'}>
                    ${formData.scheduleM1.depreciation.difference.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Meals & Entertainment (Book):</span>
                  <span>${formData.scheduleM1.mealsAndEntertainment.book.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Meals & Entertainment (Tax):</span>
                  <span>${formData.scheduleM1.mealsAndEntertainment.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Meals & Entertainment Difference:</span>
                  <span className={formData.scheduleM1.mealsAndEntertainment.difference > 0 ? 'text-red-600' : 'text-green-600'}>
                    ${formData.scheduleM1.mealsAndEntertainment.difference.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Schedule M-2 */}
            <Card>
              <CardHeader>
                <CardTitle>Schedule M-2 (Retained Earnings)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Beginning Retained Earnings:</span>
                  <span>${formData.scheduleM2.beginningRetainedEarnings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Net Income:</span>
                  <span>${formData.scheduleM2.netIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Distributions:</span>
                  <span>${formData.scheduleM2.distributions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Other Adjustments:</span>
                  <span>${formData.scheduleM2.otherAdjustments.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2 text-lg">
                  <span>Ending Retained Earnings:</span>
                  <span>${formData.scheduleM2.endingRetainedEarnings.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Ratios Tab */}
        <TabsContent value="ratios" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Working Capital Ratios */}
            <Card>
              <CardHeader>
                <CardTitle>Working Capital Ratios</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Days Sales Outstanding (DSO):</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formData.financialRatios.dso.toFixed(0)} days</span>
                      {formData.financialRatios.dso > 30 ? (
                        <Badge variant="destructive">Above Target</Badge>
                      ) : (
                        <Badge variant="default">Good</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Days Payable Outstanding (DPO):</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formData.financialRatios.dpo.toFixed(0)} days</span>
                      {formData.financialRatios.dpo < 35 ? (
                        <Badge variant="destructive">Below Target</Badge>
                      ) : (
                        <Badge variant="default">Good</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Days Inventory Outstanding (DIO):</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formData.financialRatios.dio.toFixed(0)} days</span>
                      {formData.financialRatios.dio > 45 ? (
                        <Badge variant="destructive">Above Target</Badge>
                      ) : (
                        <Badge variant="default">Good</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-2">
                    <span>Cash Conversion Cycle:</span>
                    <div className="flex items-center gap-2">
                      <span>{formData.financialRatios.cashConversionCycle.toFixed(0)} days</span>
                      {formData.financialRatios.cashConversionCycle > 60 ? (
                        <Badge variant="destructive">Above Target</Badge>
                      ) : (
                        <Badge variant="default">Good</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Health Ratios */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Health Ratios</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Current Ratio:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formData.financialRatios.currentRatio.toFixed(2)}</span>
                      {formData.financialRatios.currentRatio > 2 ? (
                        <Badge variant="default">Strong</Badge>
                      ) : formData.financialRatios.currentRatio > 1 ? (
                        <Badge variant="secondary">Adequate</Badge>
                      ) : (
                        <Badge variant="destructive">Weak</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Quick Ratio:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formData.financialRatios.quickRatio.toFixed(2)}</span>
                      {formData.financialRatios.quickRatio > 1 ? (
                        <Badge variant="default">Good</Badge>
                      ) : (
                        <Badge variant="destructive">Low</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Debt-to-Equity:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formData.financialRatios.debtToEquity.toFixed(2)}</span>
                      {formData.financialRatios.debtToEquity < 1 ? (
                        <Badge variant="default">Conservative</Badge>
                      ) : formData.financialRatios.debtToEquity < 2 ? (
                        <Badge variant="secondary">Moderate</Badge>
                      ) : (
                        <Badge variant="destructive">High</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Return on Assets:</span>
                    <span className="font-medium">
                      {(formData.financialRatios.returnOnAssets * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Return on Equity:</span>
                    <span className="font-medium">
                      {(formData.financialRatios.returnOnEquity * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-4">
          <div className="space-y-4">
            {formData.optimizationOpportunities.map((opp, index) => (
              <Card key={opp.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge 
                          variant={opp.priority === 'high' ? 'destructive' : opp.priority === 'medium' ? 'default' : 'secondary'}
                        >
                          {opp.priority.toUpperCase()}
                        </Badge>
                        <Badge 
                          variant={opp.status === 'completed' ? 'default' : opp.status === 'in_progress' ? 'secondary' : 'outline'}
                        >
                          {opp.status.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {opp.category.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{opp.title}</h3>
                      <p className="text-gray-600 mb-3">{opp.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Confidence: {(opp.confidence * 100).toFixed(0)}%</span>
                        <span>IRS Ref: {opp.irsReference}</span>
                        <span>Source: {opp.sourceLine}</span>
                        {opp.assignedTo && <span>Assigned: {opp.assignedTo}</span>}
                        {opp.dueDate && <span>Due: {new Date(opp.dueDate).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-2xl font-bold text-green-600">
                        ${Math.round(opp.potentialSavings).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">Potential Savings</p>
                      {onOptimizationClick && (
                        <Button 
                          size="sm" 
                          className="mt-2"
                          onClick={() => onOptimizationClick(opp.id)}
                        >
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}










