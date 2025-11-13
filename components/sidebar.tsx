"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  FileText, 
  BarChart3, 
  DollarSign, 
  Users, 
  Calculator, 
  Package, 
  TrendingUp, 
  Settings, 
  Upload,
  MessageSquare,
  Download,
  ChevronLeft,
  ChevronRight,
  Bell,
  Shield,
  Bot,
  Brain,
  Target,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  Key,
  Webhook,
  CreditCard,
  Database,
  Activity
} from "lucide-react"

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  adminOnly?: boolean
}

interface NavigationSection {
  name: string
  items: NavigationItem[]
}

const navigation: NavigationSection[] = [
  {
    name: "OVERVIEW",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
      { name: "Cash Flow", href: "/dashboard/cash-flow", icon: DollarSign },
    ]
  },
  {
    name: "FINANCE",
    items: [
      { name: "Cash & Liquidity", href: "/dashboard/cash-flow", icon: DollarSign },
      { name: "SG&A Optimization", href: "/dashboard/sga-optimization", icon: TrendingUp },
    ]
  },
  {
    name: "HUMAN RESOURCE",
    items: [
      { name: "Cost Control & Process Optimization", href: "/dashboard/cost-control", icon: Calculator },
      { name: "Talent, Retention & Productivity", href: "/dashboard/talent", icon: Users },
      { name: "Long-Term Workforce Health & ROI", href: "/dashboard/workforce-health", icon: TrendingUp },
    ]
  },
  {
    name: "TAX OPTIMIZATION",
    items: [
      { name: "Tax Planning", href: "/dashboard/tax-optimization", icon: Calculator },
      { name: "Personal Tax Return", href: "/dashboard/tax-optimization?tab=personal", icon: FileText },
      { name: "Tax Returns", href: "/dashboard/returns", icon: FileText },
    ]
  },
  {
    name: "SUPPLY CHAIN",
    items: [
      { name: "Inventory & Suppliers", href: "/dashboard/supply-chain", icon: Package },
    ]
  },
  {
    name: "ANALYTICS",
    items: [
      { name: "Variance Analysis", href: "/dashboard/variance", icon: BarChart3 },
      { name: "Benchmarking", href: "/dashboard/benchmarking", icon: BarChart3 },
      { name: "Scenarios", href: "/dashboard/scenarios", icon: TrendingUp },
    ]
  },
  {
    name: "AI CFO",
    items: [
      { name: "Dashboard", href: "/dashboard/ai-cfo", icon: Bot },
      { name: "FP&A", href: "/dashboard/ai-cfo/fpna", icon: Brain },
      { name: "Cash Management", href: "/dashboard/ai-cfo/cash", icon: DollarSign },
      { name: "Reporting", href: "/dashboard/ai-cfo/reporting", icon: FileText },
      { name: "Controls", href: "/dashboard/ai-cfo/controls", icon: ShieldCheck },
      { name: "Risk Management", href: "/dashboard/ai-cfo/risk", icon: AlertTriangle },
      { name: "Audit", href: "/dashboard/ai-cfo/audit", icon: FileCheck },
      { name: "AI Assistant", href: "/dashboard/ai-cfo/chat", icon: MessageSquare },
      { name: "Chat", href: "/dashboard/chat", icon: MessageSquare },
    ]
  },
  {
    name: "INDUSTRY SPECIFIC",
    items: [
      { name: "Healthcare RCM", href: "/dashboard/healthcare-rcm", icon: FileText },
    ]
  },
  {
    name: "SETTINGS & ADMIN",
    items: [
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
      { name: "Team Management", href: "/dashboard/team", icon: Users },
      { name: "Integrations", href: "/dashboard/integrations", icon: Settings },
      { name: "API Keys", href: "/dashboard/integrations?tab=api-keys", icon: Key, adminOnly: true },
      { name: "Webhooks", href: "/dashboard/integrations?tab=webhooks", icon: Webhook, adminOnly: true },
      { name: "Billing", href: "/dashboard/settings?tab=billing", icon: CreditCard, adminOnly: true },
      { name: "Audit Logs", href: "/dashboard/settings?tab=audit", icon: Activity, adminOnly: true },
      { name: "Reports", href: "/dashboard/reports", icon: Download },
      { name: "Alerts", href: "/dashboard/alerts", icon: Bell },
      { name: "Company Test", href: "/dashboard/company-test", icon: Shield, adminOnly: true },
      { name: "Support", href: "/dashboard/support", icon: MessageSquare },
    ]
  }
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [isAdmin, setIsAdmin] = useState(true) // Default to true for demo mode
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is admin from demo cookie or assume admin in demo mode
    const checkAdminStatus = () => {
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';')
        const demoUserCookie = cookies.find(c => c.trim().startsWith('demo_user='))
        
        if (demoUserCookie) {
          try {
            const userData = JSON.parse(decodeURIComponent(demoUserCookie.split('=')[1]))
            setIsAdmin(userData.role === 'admin' || userData.email === 'admin@demo.com')
          } catch (e) {
            // In demo mode, default to admin
            setIsAdmin(true)
          }
        } else {
          // Demo mode - default to admin
          setIsAdmin(true)
        }
      }
    }
    
    checkAdminStatus()
  }, [])

  // Filter navigation items based on admin status
  const getFilteredNavigation = () => {
    return navigation.map(section => ({
      ...section,
      items: section.items.filter(item => {
        // Show all items for admin, or non-admin-only items for regular users
        if (isAdmin) return true
        return !item.adminOnly
      })
    }))
  }

  const filteredNavigation = getFilteredNavigation()

  return (
    <div className={cn(
      "flex h-full flex-col border-r bg-white transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <div className="flex flex-col">
              <span className="text-lg font-semibold">ReturnSight AI</span>
              {isAdmin && (
                <span className="text-xs text-blue-600 font-medium">Admin Access</span>
              )}
            </div>
          </div>
        )}
        {collapsed && isAdmin && (
          <div className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full" title="Admin" />
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <div className="space-y-6">
          {filteredNavigation.map((section) => (
            <div key={section.name}>
              {!collapsed && (
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.name}
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                      title={collapsed ? item.name : undefined}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span className="truncate">{item.name}</span>}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer Actions */}
      <div className="border-t p-4">
        <div className="space-y-2">
          <Button className="w-full justify-start" size="sm">
            <Download className="mr-2 h-4 w-4" />
            {!collapsed && "Export Report"}
          </Button>
          <Button variant="outline" className="w-full justify-start" size="sm">
            <MessageSquare className="mr-2 h-4 w-4" />
            {!collapsed && "AI Assistant"}
          </Button>
        </div>
      </div>
    </div>
  )
}

