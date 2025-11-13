import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { WorkforceHealth } from "@/components/workforce-health"

export default async function WorkforceHealthPage() {
  // Check if we're in demo mode
  const isDemoMode = process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co' || 
                    process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_url_here'

  if (isDemoMode) {
    // Demo mode - show component directly
    return (
      <DashboardLayout 
        title="Long-Term Workforce Health & ROI" 
        description="Sustainable workforce strategies with measurable returns"
      >
        <WorkforceHealth />
      </DashboardLayout>
    )
  }

  // Production mode - check authentication
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect("/auth/login")
  }

  return (
    <DashboardLayout 
      title="Long-Term Workforce Health & ROI" 
      description="Sustainable workforce strategies with measurable returns"
    >
      <WorkforceHealth />
    </DashboardLayout>
  )
}






























