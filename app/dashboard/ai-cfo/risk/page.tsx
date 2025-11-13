"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  AlertTriangle, 
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from "lucide-react"

export default function RiskManagementPage() {
  const [activeTab, setActiveTab] = useState("risks")
  const [newRisk, setNewRisk] = useState({
    area: "",
    likelihood: 3,
    impact: 3,
    owner: "",
    description: ""
  })

  const [risks, setRisks] = useState([
    {
      id: "1",
      area: "Financial",
      likelihood: 4,
      impact: 3,
      owner: "CFO",
      mitigation_status: "in_progress",
      description: "Currency fluctuation affecting international revenue",
      created: "2025-01-10",
      last_updated: "2025-01-15"
    },
    {
      id: "2",
      area: "Operational",
      likelihood: 2,
      impact: 4,
      owner: "COO",
      mitigation_status: "open",
      description: "Key supplier dependency risk in APAC region",
      created: "2025-01-08",
      last_updated: "2025-01-12"
    },
    {
      id: "3",
      area: "Technology",
      likelihood: 3,
      impact: 2,
      owner: "CTO",
      mitigation_status: "closed",
      description: "Data security breach potential",
      created: "2025-01-05",
      last_updated: "2025-01-14"
    },
    {
      id: "4",
      area: "Regulatory",
      likelihood: 2,
      impact: 5,
      owner: "Legal",
      mitigation_status: "in_progress",
      description: "New data privacy regulations compliance",
      created: "2025-01-12",
      last_updated: "2025-01-16"
    }
  ])

  const getRiskLevel = (likelihood: number, impact: number) => {
    const score = likelihood * impact
    if (score >= 16) return { level: "Critical", color: "red" }
    if (score >= 12) return { level: "High", color: "orange" }
    if (score >= 8) return { level: "Medium", color: "yellow" }
    return { level: "Low", color: "green" }
  }

  const getMitigationStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="destructive">Open</Badge>
      case "in_progress":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">In Progress</Badge>
      case "closed":
        return <Badge variant="default" className="bg-green-100 text-green-800">Closed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const riskAreas = ["Financial", "Operational", "Technology", "Regulatory", "Market", "Reputation"]
  const owners = ["CFO", "COO", "CTO", "Legal", "CEO", "VP Sales"]

  const handleAddRisk = () => {
    if (newRisk.area && newRisk.owner && newRisk.description) {
      const risk = {
        id: (risks.length + 1).toString(),
        ...newRisk,
        created: new Date().toISOString().split('T')[0],
        last_updated: new Date().toISOString().split('T')[0]
      }
      setRisks([...risks, risk])
      setNewRisk({ area: "", likelihood: 3, impact: 3, owner: "", description: "" })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Risk Management</h1>
          <p className="text-muted-foreground">
            Identify, assess, and mitigate business risks with AI insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Risk
          </Button>
        </div>
      </div>

      {/* Risk Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Risks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{risks.length}</div>
            <p className="text-xs text-muted-foreground">
              Identified risks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {risks.filter(r => getRiskLevel(r.likelihood, r.impact).level === "Critical").length}
            </div>
            <p className="text-xs text-muted-foreground">
              High priority risks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {risks.filter(r => r.mitigation_status === "in_progress").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Being addressed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {risks.filter(r => r.mitigation_status === "closed").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully mitigated
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="risks">Risk Register</TabsTrigger>
          <TabsTrigger value="matrix">Risk Matrix</TabsTrigger>
          <TabsTrigger value="add">Add Risk</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="risks" className="space-y-4">
          <div className="space-y-4">
            {risks.map((risk) => {
              const riskLevel = getRiskLevel(risk.likelihood, risk.impact)
              return (
                <Card key={risk.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-medium">{risk.description}</h4>
                          <Badge 
                            variant="outline" 
                            className={`${
                              riskLevel.color === 'red' ? 'border-red-200 text-red-800' :
                              riskLevel.color === 'orange' ? 'border-orange-200 text-orange-800' :
                              riskLevel.color === 'yellow' ? 'border-yellow-200 text-yellow-800' :
                              'border-green-200 text-green-800'
                            }`}
                          >
                            {riskLevel.level}
                          </Badge>
                          {getMitigationStatusBadge(risk.mitigation_status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Area: {risk.area}</span>
                          <span>Owner: {risk.owner}</span>
                          <span>Likelihood: {risk.likelihood}/5</span>
                          <span>Impact: {risk.impact}/5</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Created: {risk.created}</span>
                          <span>Updated: {risk.last_updated}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="matrix" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment Matrix</CardTitle>
              <CardDescription>
                Visual representation of risk likelihood vs impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-2 text-center">
                <div></div>
                <div className="text-xs font-medium">1</div>
                <div className="text-xs font-medium">2</div>
                <div className="text-xs font-medium">3</div>
                <div className="text-xs font-medium">4</div>
                <div className="text-xs font-medium">5</div>
                
                {[5, 4, 3, 2, 1].map((impact) => (
                  <div key={impact} className="contents">
                    <div className="text-xs font-medium flex items-center justify-center">
                      {impact}
                    </div>
                    {[1, 2, 3, 4, 5].map((likelihood) => {
                      const riskLevel = getRiskLevel(likelihood, impact)
                      const riskCount = risks.filter(r => r.likelihood === likelihood && r.impact === impact).length
                      return (
                        <div
                          key={`${impact}-${likelihood}`}
                          className={`p-2 rounded text-xs ${
                            riskLevel.color === 'red' ? 'bg-red-100 border-red-300' :
                            riskLevel.color === 'orange' ? 'bg-orange-100 border-orange-300' :
                            riskLevel.color === 'yellow' ? 'bg-yellow-100 border-yellow-300' :
                            'bg-green-100 border-green-300'
                          }`}
                        >
                          {riskCount > 0 && (
                            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center font-bold">
                              {riskCount}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
                <div className="text-xs font-medium">Impact →</div>
                <div className="col-span-5 text-xs text-muted-foreground">
                  Likelihood →
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Risk</CardTitle>
              <CardDescription>
                Identify and assess a new business risk
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="risk-area">Risk Area</Label>
                  <select 
                    id="risk-area"
                    value={newRisk.area}
                    onChange={(e) => setNewRisk({...newRisk, area: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Select area...</option>
                    {riskAreas.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="risk-owner">Owner</Label>
                  <select 
                    id="risk-owner"
                    value={newRisk.owner}
                    onChange={(e) => setNewRisk({...newRisk, owner: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Select owner...</option>
                    {owners.map((owner) => (
                      <option key={owner} value={owner}>{owner}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="risk-description">Risk Description</Label>
                <Input 
                  id="risk-description"
                  value={newRisk.description}
                  onChange={(e) => setNewRisk({...newRisk, description: e.target.value})}
                  placeholder="Describe the risk..."
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="likelihood">Likelihood (1-5)</Label>
                  <Input 
                    id="likelihood"
                    type="number"
                    min="1"
                    max="5"
                    value={newRisk.likelihood}
                    onChange={(e) => setNewRisk({...newRisk, likelihood: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="impact">Impact (1-5)</Label>
                  <Input 
                    id="impact"
                    type="number"
                    min="1"
                    max="5"
                    value={newRisk.impact}
                    onChange={(e) => setNewRisk({...newRisk, impact: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <Button onClick={handleAddRisk} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Risk
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Risk Trends</CardTitle>
                <CardDescription>
                  AI analysis of risk patterns and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Financial risks increasing (+25% this month)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Technology risks decreasing (-15% this month)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Regulatory risks stable but high impact</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mitigation Recommendations</CardTitle>
                <CardDescription>
                  AI-suggested risk mitigation strategies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium text-sm">Currency Hedging</div>
                    <div className="text-xs text-muted-foreground">
                      Implement currency hedging for international revenue
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium text-sm">Supplier Diversification</div>
                    <div className="text-xs text-muted-foreground">
                      Identify alternative suppliers in different regions
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium text-sm">Compliance Monitoring</div>
                    <div className="text-xs text-muted-foreground">
                      Set up automated compliance tracking system
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}













