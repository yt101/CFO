import { DashboardLayout } from "@/components/dashboard-layout"
import { BankFeedsConnect } from "@/components/integrations/bank-feeds-connect"
import { QuickBooksConnect } from "@/components/integrations/quickbooks-connect"
import { QuickBooksSimpleConnect } from "@/components/integrations/quickbooks-simple-connect"
import { ServiceConfiguration } from "@/components/integrations/service-configuration"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle, CreditCard, Calculator, FileText, Shield, Users, Settings } from "lucide-react"

export default function IntegrationsPage() {
  const integrations = [
    {
      id: 'bank-feeds',
      name: 'Bank Feeds',
      description: 'Connect bank accounts for automatic transaction import',
      status: 'connected',
      icon: CreditCard,
      category: 'Data Sources'
    },
    {
      id: 'quickbooks',
      name: 'QuickBooks Online',
      description: 'Sync accounting data and financial statements',
      status: 'connected',
      icon: Calculator,
      category: 'Accounting'
    },
    {
      id: 'xero',
      name: 'Xero',
      description: 'Alternative accounting system integration',
      status: 'available',
      icon: Calculator,
      category: 'Accounting'
    },
    {
      id: 'ocr-parser',
      name: 'Document Parser',
      description: 'AI-powered PDF and document processing',
      status: 'active',
      icon: FileText,
      category: 'Data Processing'
    },
    {
      id: 'slack',
      name: 'Slack Integration',
      description: 'Financial alerts and notifications',
      status: 'configured',
      icon: Users,
      category: 'Collaboration'
    },
    {
      id: 'security',
      name: 'Security & Compliance',
      description: 'Bank-grade encryption and SOC-2 controls',
      status: 'active',
      icon: Shield,
      category: 'Security'
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />Active</Badge>
      case 'configured':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" />Configured</Badge>
      case 'available':
        return <Badge variant="outline" className="flex items-center gap-1"><AlertCircle className="h-3 w-3" />Available</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const groupedIntegrations = integrations.reduce((acc, integration) => {
    if (!acc[integration.category]) {
      acc[integration.category] = []
    }
    acc[integration.category].push(integration)
    return acc
  }, {} as Record<string, typeof integrations>)

  return (
    <DashboardLayout 
      title="Integrations" 
      description="Connect external services and manage data sources"
    >
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Integrations</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {integrations.filter(i => i.status === 'connected' || i.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">
                of {integrations.length} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Sources</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                Bank feeds, QuickBooks, OCR
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2m ago</div>
              <p className="text-xs text-muted-foreground">
                Bank transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Score</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98%</div>
              <p className="text-xs text-muted-foreground">
                SOC-2 compliant
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Integration Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Integrations</TabsTrigger>
            <TabsTrigger value="data-sources">Data Sources</TabsTrigger>
            <TabsTrigger value="accounting">Accounting</TabsTrigger>
            <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {Object.entries(groupedIntegrations).map(([category, categoryIntegrations]) => (
              <div key={category} className="space-y-4">
                <h3 className="text-lg font-medium">{category}</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categoryIntegrations.map((integration) => {
                    const Icon = integration.icon
                    return (
                      <Card key={integration.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Icon className="h-5 w-5" />
                              <CardTitle className="text-base">{integration.name}</CardTitle>
                            </div>
                            {getStatusBadge(integration.status)}
                          </div>
                          <CardDescription>{integration.description}</CardDescription>
                        </CardHeader>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="data-sources" className="space-y-6">
            <BankFeedsConnect />
          </TabsContent>

          <TabsContent value="accounting" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <QuickBooksConnect />
              <QuickBooksSimpleConnect />
            </div>
          </TabsContent>

          <TabsContent value="collaboration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Collaboration Tools
                </CardTitle>
                <CardDescription>
                  Manage team access and communication integrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5" />
                      <div>
                        <div className="font-medium">Slack Integration</div>
                        <div className="text-sm text-muted-foreground">
                          Financial alerts and team notifications
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">Configured</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5" />
                      <div>
                        <div className="font-medium">Microsoft Teams</div>
                        <div className="text-sm text-muted-foreground">
                          Enterprise collaboration and alerts
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">Available</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security & Compliance
                </CardTitle>
                <CardDescription>
                  Bank-grade security and compliance features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Encryption</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• AES-256-GCM encryption</li>
                        <li>• End-to-end data protection</li>
                        <li>• Secure key management</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Access Control</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Role-based permissions</li>
                        <li>• Multi-factor authentication</li>
                        <li>• Audit trail logging</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Compliance</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• SOC-2 Type II certified</li>
                        <li>• GDPR compliant</li>
                        <li>• Data isolation per tenant</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Monitoring</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Real-time threat detection</li>
                        <li>• Security event logging</li>
                        <li>• Automated alerts</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuration" className="space-y-6">
            <ServiceConfiguration />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}













