"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  AlertTriangle,
  TrendingDown,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Settings
} from "lucide-react"

export default function AlertsPage() {
  const [slackEnabled, setSlackEnabled] = useState(true)
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [teamsEnabled, setTeamsEnabled] = useState(false)

  const recentAlerts = [
    {
      id: "1",
      type: "warning",
      title: "Cash Runway Below Threshold",
      message: "Current runway is 8 months, below your 12-month threshold",
      timestamp: "2 hours ago",
      status: "active",
      priority: "high"
    },
    {
      id: "2",
      type: "info",
      title: "Large Transaction Detected",
      message: "Incoming payment of $125,000 from Client XYZ",
      timestamp: "5 hours ago",
      status: "acknowledged",
      priority: "medium"
    },
    {
      id: "3",
      type: "warning",
      title: "DSO Trending Up",
      message: "Days Sales Outstanding increased from 32 to 38 days",
      timestamp: "1 day ago",
      status: "resolved",
      priority: "medium"
    },
    {
      id: "4",
      type: "success",
      title: "Monthly Revenue Target Met",
      message: "December revenue of $1.2M exceeds target by 15%",
      timestamp: "2 days ago",
      status: "resolved",
      priority: "low"
    }
  ]

  const alertRules = [
    {
      id: "1",
      name: "Low Cash Runway",
      description: "Alert when runway drops below threshold",
      trigger: "Cash runway < 12 months",
      channels: ["email", "slack"],
      enabled: true,
      priority: "high"
    },
    {
      id: "2",
      name: "Large Transaction",
      description: "Notify on transactions above limit",
      trigger: "Transaction > $100,000",
      channels: ["slack"],
      enabled: true,
      priority: "medium"
    },
    {
      id: "3",
      name: "DSO Increase",
      description: "Alert when collection period increases",
      trigger: "DSO > 35 days or +10% WoW",
      channels: ["email", "slack"],
      enabled: true,
      priority: "medium"
    },
    {
      id: "4",
      name: "Revenue Milestone",
      description: "Celebrate revenue achievements",
      trigger: "Monthly revenue > target",
      channels: ["slack"],
      enabled: true,
      priority: "low"
    },
    {
      id: "5",
      name: "Burn Rate Alert",
      description: "Alert on unusual spending patterns",
      trigger: "Monthly burn > budget by 20%",
      channels: ["email"],
      enabled: false,
      priority: "high"
    }
  ]

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Bell className="h-5 w-5 text-blue-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="destructive">Active</Badge>
      case "acknowledged":
        return <Badge variant="secondary">Acknowledged</Badge>
      case "resolved":
        return <Badge variant="outline">Resolved</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>
      case "medium":
        return <Badge variant="default">Medium</Badge>
      case "low":
        return <Badge variant="outline">Low</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  return (
    <DashboardLayout
      title="Alerts & Notifications"
      description="Manage financial alerts and notification preferences"
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alert Rules</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">
                Currently enabled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Email Alerts</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                Sent this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Slack Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28</div>
              <p className="text-xs text-muted-foreground">
                Sent this week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="recent" className="space-y-6">
          <TabsList>
            <TabsTrigger value="recent">Recent Alerts</TabsTrigger>
            <TabsTrigger value="rules">Alert Rules</TabsTrigger>
            <TabsTrigger value="channels">Notification Channels</TabsTrigger>
            <TabsTrigger value="digest">Daily Digest</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>
                  Latest financial alerts and notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{alert.title}</span>
                          <div className="flex items-center gap-2">
                            {getPriorityBadge(alert.priority)}
                            {getStatusBadge(alert.status)}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {alert.timestamp}
                          </span>
                        </div>
                      </div>
                      {alert.status === "active" && (
                        <Button size="sm" variant="outline">
                          Acknowledge
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Alert Rules</CardTitle>
                    <CardDescription>
                      Configure conditions that trigger alerts
                    </CardDescription>
                  </div>
                  <Button>
                    <Bell className="mr-2 h-4 w-4" />
                    Create Rule
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alertRules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium">{rule.name}</span>
                          {getPriorityBadge(rule.priority)}
                          {rule.enabled ? (
                            <Badge variant="default">Enabled</Badge>
                          ) : (
                            <Badge variant="outline">Disabled</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{rule.description}</p>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-muted-foreground">
                            Trigger: <span className="font-mono bg-muted px-1 py-0.5 rounded">{rule.trigger}</span>
                          </span>
                          <span className="text-muted-foreground">
                            Channels: {rule.channels.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(", ")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={rule.enabled} />
                        <Button size="sm" variant="ghost">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="channels" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Channels</CardTitle>
                <CardDescription>
                  Configure how you receive alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Email Notifications</div>
                        <div className="text-sm text-muted-foreground">
                          Send alerts to admin@demo.com
                        </div>
                      </div>
                    </div>
                    <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Slack Integration</div>
                        <div className="text-sm text-muted-foreground">
                          Post to #financial-alerts channel
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Connected</Badge>
                      <Switch checked={slackEnabled} onCheckedChange={setSlackEnabled} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Microsoft Teams</div>
                        <div className="text-sm text-muted-foreground">
                          Not configured
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">Connect</Button>
                      <Switch checked={teamsEnabled} onCheckedChange={setTeamsEnabled} disabled />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="digest" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily Digest</CardTitle>
                <CardDescription>
                  Automated daily summary of key financial metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="digest-enabled">Enable Daily Digest</Label>
                      <Switch id="digest-enabled" defaultChecked />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="digest-time">Delivery Time</Label>
                      <Select defaultValue="9am">
                        <SelectTrigger id="digest-time">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6am">6:00 AM</SelectItem>
                          <SelectItem value="7am">7:00 AM</SelectItem>
                          <SelectItem value="8am">8:00 AM</SelectItem>
                          <SelectItem value="9am">9:00 AM</SelectItem>
                          <SelectItem value="10am">10:00 AM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="digest-recipients">Recipients</Label>
                      <Input 
                        id="digest-recipients"
                        placeholder="email1@example.com, email2@example.com"
                        defaultValue="admin@demo.com, cfo@demo.com"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Preview: Daily Digest</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>📊 <strong>Cash In:</strong> $22,000</p>
                      <p>📉 <strong>Cash Out:</strong> $18,000</p>
                      <p>💰 <strong>Net Cash Flow:</strong> +$4,000</p>
                      <p>⏱️ <strong>Cash Runway:</strong> 9 months</p>
                      <p>🎯 <strong>Monthly Burn:</strong> $67,000</p>
                    </div>
                  </div>

                  <Button className="w-full">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Test Digest
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

































