import { getCurrentUserCompanyContext, getCompanySettings } from "@/lib/auth/company-context"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { TaxOptimizationClient } from "./tax-optimization-client"
import { isDemoMode } from "@/lib/utils/demo-mode"

export default async function TaxOptimizationPage() {
  const demoMode = isDemoMode()
  const userContext = await getCurrentUserCompanyContext()
  
  // If no user context, check for demo cookie as fallback (even when Supabase is configured)
  if (!userContext) {
    // Check for demo cookie as fallback
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const demoUserCookie = cookieStore.get('demo_user')
    
    if (demoUserCookie) {
      // Use demo context from cookie
      try {
        const userData = JSON.parse(demoUserCookie.value)
        const defaultUserContext = {
          id: userData.id || 'demo-admin-id',
          email: userData.email || 'admin@demo.com',
          role: (userData.role || 'admin') as const,
          company_id: userData.company_id || '550e8400-e29b-41d4-a716-446655440001',
          company_name: 'Acme Corporation',
          permissions: {
            all_modules: true,
            can_manage_users: true,
            can_edit_settings: true,
            can_configure_integrations: true,
            can_manage_company_settings: true,
            can_access_all_configurations: true,
            can_modify_permissions: true,
            can_access_admin_panel: true,
            can_manage_billing: true,
            can_export_data: true,
            can_import_data: true,
            can_manage_api_keys: true,
            can_configure_webhooks: true,
            can_manage_roles: true,
            can_audit_logs: true,
            super_user: true
          }
        }
        
        const companySettings = await getCompanySettings(defaultUserContext.company_id)
        
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
            <TaxOptimizationClient userContext={defaultUserContext} />
          </Suspense>
        )
      } catch (e) {
        console.error('Error parsing demo user cookie:', e)
      }
    }
    
    // No user context and no demo cookie - redirect to login
    if (!demoMode) {
      redirect('/auth/login')
    }
  }
  
  // In demo mode, if userContext is null, create a default admin context
  if (demoMode && !userContext) {
    // Create default admin context for demo mode
    const defaultUserContext = {
      id: 'demo-admin-id',
      email: 'admin@demo.com',
      role: 'admin' as const,
      company_id: '550e8400-e29b-41d4-a716-446655440001',
      company_name: 'Acme Corporation',
      permissions: {
        all_modules: true,
        can_manage_users: true,
        can_edit_settings: true,
        can_configure_integrations: true,
        can_manage_company_settings: true,
        can_access_all_configurations: true,
        can_modify_permissions: true,
        can_access_admin_panel: true,
        can_manage_billing: true,
        can_export_data: true,
        can_import_data: true,
        can_manage_api_keys: true,
        can_configure_webhooks: true,
        can_manage_roles: true,
        can_audit_logs: true,
        super_user: true
      }
    }
    
    // Use the default context
    const companySettings = await getCompanySettings(defaultUserContext.company_id)
    
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
        <TaxOptimizationClient userContext={defaultUserContext} />
      </Suspense>
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