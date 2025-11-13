"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertCircle, Calculator, FileText, TrendingUp } from "lucide-react"

interface QuickBooksConnection {
  isConnected: boolean
  companyName?: string
  lastSync?: Date
  dataTypes: string[]
}

export function QuickBooksConnect() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [connection, setConnection] = useState<QuickBooksConnection>({
    isConnected: false,
    dataTypes: []
  })
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      // Redirect to QuickBooks OAuth
      const qbAuthUrl = `https://sandbox-quickbooks.intuit.com/oauth/v1/authorize?` +
        `client_id=${process.env.NEXT_PUBLIC_QUICKBOOKS_CLIENT_ID}&` +
        `scope=com.intuit.quickbooks.accounting&` +
        `redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_QUICKBOOKS_REDIRECT_URI || '')}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `state=${Date.now()}`
      
      window.location.href = qbAuthUrl
    } catch (err) {
      setError('Connection failed. Please try again.')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleSync = async () => {
    // Simulate data sync
    setConnection(prev => ({
      ...prev,
      lastSync: new Date()
    }))
  }

  const getDataTypeIcon = (type: string) => {
    switch (type) {
      case 'Chart of Accounts':
        return <Calculator className="h-4 w-4" />
      case 'Financial Statements':
        return <FileText className="h-4 w-4" />
      case 'Journal Entries':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            QuickBooks Online Integration
          </CardTitle>
          <CardDescription>
            Connect your QuickBooks Online account to sync chart of accounts, financial statements, and journal entries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!connection.isConnected ? (
            <div className="space-y-4">
              <div className="text-center py-8">
                <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Connect QuickBooks Online</h3>
                <p className="text-muted-foreground mb-4">
                  Sync your accounting data to get comprehensive financial insights and automated reconciliation.
                </p>
                <Button 
                  onClick={handleConnect} 
                  disabled={isConnecting}
                  className="w-full sm:w-auto"
                >
                  {isConnecting ? (
                    <>
                      <Progress value={33} className="w-4 h-4 mr-2" />
                      Connecting...
                    </>
                  ) : (
                    'Connect QuickBooks'
                  )}
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">What gets synced:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Chart of Accounts</li>
                    <li>• Financial Statements</li>
                    <li>• Journal Entries</li>
                    <li>• Customer & Vendor Data</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Benefits:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Automated reconciliation</li>
                    <li>• Real-time financial data</li>
                    <li>• Enhanced reporting</li>
                    <li>• AI-powered insights</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">{connection.companyName}</h3>
                  <p className="text-sm text-muted-foreground">
                    Last synced: {connection.lastSync?.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleSync}>
                    Sync Now
                  </Button>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Connected
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Synced Data Types:</h4>
                <div className="grid gap-2">
                  {connection.dataTypes.map((type) => (
                    <div key={type} className="flex items-center gap-2 p-2 border rounded">
                      {getDataTypeIcon(type)}
                      <span className="text-sm">{type}</span>
                      <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Connection Error</span>
              </div>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Security & Privacy</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• OAuth 2.0 secure authentication</li>
              <li>• Read-only access to your data</li>
              <li>• Encrypted data transmission</li>
              <li>• No storage of sensitive credentials</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}













