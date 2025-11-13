import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CostControl } from "@/components/cost-control"

export default async function CostControlPage() {
  // Check if we're in demo mode
  const isDemoMode = process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co' || 
                    process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_url_here'

  if (isDemoMode) {
    // Demo mode - show component directly
    return (
      <DashboardLayout 
        title="Cost Control & Process Optimization" 
        description="Optimize costs through process improvements and automation"
      >
        <CostControl />
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
      title="Cost Control & Process Optimization" 
      description="Optimize costs through process improvements and automation"
    >
      <CostControl />
    </DashboardLayout>
  )
}






























