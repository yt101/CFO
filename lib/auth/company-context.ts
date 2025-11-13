import { createClient } from "@/lib/supabase/server"

export interface CompanyUser {
  id: string
  email: string
  role: 'admin' | 'user' | 'viewer'
  company_id: string
  company_name: string
  permissions: Record<string, any>
}

export interface CompanySettings {
  company_id: string
  modules: {
    cash_flow: boolean
    finance: boolean
    human_resource: boolean
    tax_optimization: boolean
    supply_chain: boolean
    analytics: boolean
    industry_specific: boolean
  }
  settings: Record<string, any>
}

/**
 * Get the current user's company context including role and permissions
 */
export async function getCurrentUserCompanyContext(): Promise<CompanyUser | null> {
  const supabase = await createClient()
  
  // Check if we're in demo mode - also check for localhost and force demo mode
  const isDemoMode = process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co' || 
                    process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_url_here' ||
                    process.env.NEXT_PUBLIC_FORCE_DEMO_MODE === 'true' ||
                    process.env.NODE_ENV === 'development' // Always demo mode in development

  console.log('getCurrentUserCompanyContext - isDemoMode:', isDemoMode, 'FORCE_DEMO_MODE:', process.env.NEXT_PUBLIC_FORCE_DEMO_MODE, 'NODE_ENV:', process.env.NODE_ENV)

  if (isDemoMode) {
    console.log('Returning demo user context')
    // Return demo user context with super user permissions
    return {
      id: 'demo-admin-id',
      email: 'admin@demo.com',
      role: 'admin',
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
  }

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return null
    }

    // Get user profile with company information
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        role,
        permissions,
        company_id,
        companies (
          id,
          name
        )
      `)
      .eq('user_id', user.id)
      .single()

    if (profileError || !userProfile) {
      return null
    }

    return {
      id: user.id,
      email: user.email || '',
      role: userProfile.role,
      company_id: userProfile.company_id,
      company_name: userProfile.companies?.name || '',
      permissions: userProfile.permissions || {}
    }
  } catch (error) {
    console.error('Error getting user company context:', error)
    return null
  }
}

/**
 * Get company settings and module access
 */
export async function getCompanySettings(companyId: string): Promise<CompanySettings | null> {
  const supabase = await createClient()
  
  // Check if we're in demo mode - same logic as getCurrentUserCompanyContext
  const isDemoMode = process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co' || 
                    process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_url_here' ||
                    process.env.NEXT_PUBLIC_FORCE_DEMO_MODE === 'true' ||
                    process.env.NODE_ENV === 'development' // Always demo mode in development

  console.log('getCompanySettings - isDemoMode:', isDemoMode, 'FORCE_DEMO_MODE:', process.env.NEXT_PUBLIC_FORCE_DEMO_MODE, 'NODE_ENV:', process.env.NODE_ENV)

  if (isDemoMode) {
    console.log('Returning demo company settings')
    // Return demo company settings with all modules enabled for admin
    return {
      company_id: companyId,
      modules: {
        cash_flow: true,
        finance: true,
        human_resource: true,
        tax_optimization: true,
        supply_chain: true,
        analytics: true,
        industry_specific: true
      },
      settings: {
        allow_all_configurations: true,
        super_user_mode: true,
        unrestricted_access: true
      }
    }
  }

  try {
    const { data: settings, error } = await supabase
      .from('company_settings')
      .select('module_name, enabled, settings')
      .eq('company_id', companyId)

    if (error || !settings) {
      return null
    }

    // Transform settings into modules object
    const modules = {
      cash_flow: false,
      finance: false,
      human_resource: false,
      tax_optimization: false,
      supply_chain: false,
      analytics: false,
      industry_specific: false
    }

    const moduleSettings: Record<string, any> = {}

    settings.forEach(setting => {
      if (setting.module_name in modules) {
        modules[setting.module_name as keyof typeof modules] = setting.enabled
      }
      moduleSettings[setting.module_name] = setting.settings
    })

    return {
      company_id: companyId,
      modules,
      settings: moduleSettings
    }
  } catch (error) {
    console.error('Error getting company settings:', error)
    return null
  }
}

/**
 * Check if user has access to a specific module
 */
export async function hasModuleAccess(moduleName: string): Promise<boolean> {
  const userContext = await getCurrentUserCompanyContext()
  
  if (!userContext) {
    return false
  }

  const companySettings = await getCompanySettings(userContext.company_id)
  
  if (!companySettings) {
    return false
  }

  // Admin users have access to all modules
  if (userContext.role === 'admin') {
    return true
  }

  // Check if the module is enabled for the company
  return companySettings.modules[moduleName as keyof typeof companySettings.modules] || false
}

/**
 * Check if user has admin role
 */
export async function isAdmin(): Promise<boolean> {
  const userContext = await getCurrentUserCompanyContext()
  return userContext?.role === 'admin' || false
}

/**
 * Get all users in the same company
 */
export async function getCompanyUsers(): Promise<CompanyUser[]> {
  const userContext = await getCurrentUserCompanyContext()
  
  if (!userContext) {
    return []
  }

  const supabase = await createClient()
  
  // Check if we're in demo mode
  const isDemoMode = process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co' || 
                    process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_url_here'

  if (isDemoMode) {
    // Return demo company users
    return [
      {
        id: 'demo-admin-id',
        email: 'admin@demo.com',
        role: 'admin',
        company_id: userContext.company_id,
        company_name: userContext.company_name,
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
      },
      {
        id: 'demo-user-id',
        email: 'user@demo.com',
        role: 'user',
        company_id: userContext.company_id,
        company_name: userContext.company_name,
        permissions: { cash_flow: true, finance: true }
      }
    ]
  }

  try {
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select(`
        id,
        role,
        permissions,
        company_id,
        companies (
          id,
          name
        ),
        auth.users (
          id,
          email
        )
      `)
      .eq('company_id', userContext.company_id)

    if (error || !users) {
      return []
    }

    return users.map(user => ({
      id: user.auth.users?.id || user.id,
      email: user.auth.users?.email || '',
      role: user.role,
      company_id: user.company_id,
      company_name: user.companies?.name || '',
      permissions: user.permissions || {}
    }))
  } catch (error) {
    console.error('Error getting company users:', error)
    return []
  }
}
