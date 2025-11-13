import { getCurrentUserCompanyContext, getCompanySettings } from "@/lib/auth/company-context"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { TaxOptimizationClient } from "./tax-optimization-client"
import { isDemoMode } from "@/lib/utils/demo-mode"

export default async function TaxOptimizationPage() {
  const demoMode = isDemoMode()
  const userContext = await getCurrentUserCompanyContext()
  
  // In demo mode, userContext should always be available
  // Only redirect if not in demo mode and no user context
  if (!demoMode && !userContext) {
    redirect('/auth/login')
  }
  
  // In demo mode, if userContext is null, create a default one
  if (demoMode && !userContext) {
    // This shouldn't happen, but handle it gracefully
    return (
      <div className="flex h-screen">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-gray-50/50">
            <div className="p-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 text-yellow-600">⚠️</div>
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-800">Session Expired</h3>
                    <p className="text-yellow-700 mt-1">
                      Please log in again to continue.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const companySettings = await getCompanySettings(userContext.company_id)
  
  // Check if user has access to tax optimization module
  if (!companySettings?.modules?.tax_optimization) {
    return (
      <div className="flex h-screen">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-gray-50/50">
            <div className="p-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 text-yellow-600">⚠️</div>
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-800">Tax Optimization Module Not Enabled</h3>
                    <p className="text-yellow-700 mt-1">
                      Contact your administrator to enable the Tax Optimization module for your company.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TaxOptimizationClient userContext={userContext} />
    </Suspense>
  )
}