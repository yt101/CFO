import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calculator,
  FileText,
  Package,
  Bot,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const quickStats = [
    {
      title: "Cash Flow",
      value: "$2.3M",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      href: "/dashboard/cash-flow"
    },
    {
      title: "Tax Savings",
      value: "$450K",
      change: "+8.2%",
      trend: "up",
      icon: Calculator,
      href: "/dashboard/tax-optimization"
    },
    {
      title: "Active Users",
      value: "24",
      change: "+3",
      trend: "up",
      icon: Users,
      href: "/dashboard/team"
    },
    {
      title: "AI Insights",
      value: "156",
      change: "+12",
      trend: "up",
      icon: Bot,
      href: "/dashboard/ai-cfo"
    }
  ]

  const recentActivity = [
    { action: "Tax return uploaded", time: "2 hours ago", type: "success" },
    { action: "Cash flow forecast updated", time: "5 hours ago", type: "info" },
    { action: "New optimization opportunity identified", time: "1 day ago", type: "success" },
    { action: "Integration connected", time: "2 days ago", type: "info" }
  ]

  const quickActions = [
    { name: "Upload Tax Return", href: "/dashboard/returns", icon: FileText },
    { name: "View Cash Flow", href: "/dashboard/cash-flow", icon: DollarSign },
    { name: "Tax Optimization", href: "/dashboard/tax-optimization", icon: Calculator },
    { name: "AI Assistant", href: "/dashboard/ai-cfo/chat", icon: Bot },
    { name: "Settings", href: "/dashboard/settings", icon: Shield },
    { name: "Integrations", href: "/dashboard/integrations", icon: Package }
  ]

  return (
    <DashboardLayout 
      title="Dashboard" 
      description="Welcome back! Here's an overview of your financial insights."
    >
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickStats.map((stat) => {
            const Icon = stat.icon
            return (
              <Link key={stat.title} href={stat.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-green-600">{stat.change}</span>
                      <span>from last month</span>
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Quick Actions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Access frequently used features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <Link key={action.name} href={action.href}>
                      <Button variant="outline" className="w-full justify-start h-auto py-3">
                        <Icon className="mr-2 h-4 w-4" />
                        <span>{action.name}</span>
                        <ArrowRight className="ml-auto h-4 w-4" />
                      </Button>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    {activity.type === "success" ? (
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Financial Overview
              </CardTitle>
              <CardDescription>Key financial metrics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Revenue</span>
                  <span className="text-lg font-semibold">$12.5M</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Operating Expenses</span>
                  <span className="text-lg font-semibold">$8.2M</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Net Income</span>
                  <span className="text-lg font-semibold text-green-600">$4.3M</span>
                </div>
                <div className="pt-4 border-t">
                  <Link href="/dashboard/cash-flow">
                    <Button variant="outline" className="w-full">
                      View Full Report
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                System Status
              </CardTitle>
              <CardDescription>Platform health and integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">System Status</span>
                  <Badge className="bg-green-100 text-green-800">Operational</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Integrations</span>
                  <span className="text-lg font-semibold">5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Data Sync</span>
                  <Badge className="bg-green-100 text-green-800">Up to date</Badge>
                </div>
                <div className="pt-4 border-t">
                  <Link href="/dashboard/integrations">
                    <Button variant="outline" className="w-full">
                      Manage Integrations
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
