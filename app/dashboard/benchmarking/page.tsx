import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Benchmarking } from "@/components/benchmarking"

export default async function BenchmarkingPage() {
  // Check if we're in demo mode
  const isDemoMode = process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co' || 
                    process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_url_here'

  if (isDemoMode) {
    // Demo mode - show component directly
    return (
      <DashboardLayout 
        title="Benchmarking" 
        description="Compare your metrics against industry standards"
      >
        <Benchmarking />
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
      title="Benchmarking" 
      description="Compare your metrics against industry standards"
    >
      <Benchmarking />
    </DashboardLayout>
  )
}

