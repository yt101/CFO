import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ScenarioAnalysis } from "@/components/scenario-analysis"

export default async function ScenariosPage() {
  // Check if we're in demo mode
  const isDemoMode = process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co' || 
                    process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_url_here'

  if (isDemoMode) {
    // Demo mode - show component directly
    return (
      <DashboardLayout 
        title="Scenario Analysis" 
        description="Model different business scenarios and their impact"
      >
        <ScenarioAnalysis />
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
      title="Scenario Analysis" 
      description="Model different business scenarios and their impact"
    >
      <ScenarioAnalysis />
    </DashboardLayout>
  )
}

