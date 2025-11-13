import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowLeft, FileText, MessageSquare } from "lucide-react"
import { MetricsView } from "@/components/metrics-view"
import { OpportunitiesView } from "@/components/opportunities-view"

export default async function ReturnDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  // Fetch return details
  const { data: returnData } = await supabase.from("returns").select("*").eq("id", id).eq("user_id", user.id).single()

  if (!returnData) {
    redirect("/dashboard")
  }

  // Fetch metrics
  const { data: metrics } = await supabase
    .from("metrics")
    .select("*")
    .eq("return_id", id)
    .order("created_at", { ascending: false })

  // Fetch opportunities
  const { data: opportunities } = await supabase
    .from("opportunities")
    .select("*")
    .eq("return_id", id)
    .order("priority", { ascending: true })

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              <span className="text-xl font-bold">ReturnSight AI</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/chat/${id}`}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Open Chatbot
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="space-y-6">
          {/* Return Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{returnData.entity_name}</h1>
              <Badge
                variant={
                  returnData.status === "completed"
                    ? "default"
                    : returnData.status === "processing"
                      ? "secondary"
                      : "outline"
                }
              >
                {returnData.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Form {returnData.entity_type} • Tax Year {returnData.tax_year}
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Key Metrics</CardTitle>
                    <CardDescription>Working capital and liquidity indicators</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MetricsView metrics={metrics || []} compact />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Opportunities</CardTitle>
                    <CardDescription>Highest priority optimization opportunities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <OpportunitiesView opportunities={opportunities?.slice(0, 3) || []} compact />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="metrics">
              <Card>
                <CardHeader>
                  <CardTitle>All Metrics</CardTitle>
                  <CardDescription>Detailed view of computed KPIs and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <MetricsView metrics={metrics || []} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="opportunities">
              <Card>
                <CardHeader>
                  <CardTitle>All Opportunities</CardTitle>
                  <CardDescription>Complete list of identified optimization opportunities</CardDescription>
                </CardHeader>
                <CardContent>
                  <OpportunitiesView opportunities={opportunities || []} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
