"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertCircle, CreditCard, Building2 } from "lucide-react"

interface BankAccount {
  id: string
  name: string
  type: 'checking' | 'savings' | 'credit' | 'loan'
  balance: number
  currency: string
  institution: string
  lastUpdated: Date
}

export function BankFeedsConnect() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectedAccounts, setConnectedAccounts] = useState<BankAccount[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      // In production, this would open Plaid Link
      // For demo, simulate connection
      await new Promise(resolve => setTimeout(resolve, 2000))

      const response = await fetch('/api/integrations/bank-feeds/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicToken: 'demo-token', provider: 'plaid' })
      })

      const data = await response.json()

      if (data.success) {
        setConnectedAccounts(data.accounts)
      } else {
        setError(data.error || 'Failed to connect bank account')
      }
    } catch (err) {
      setError('Connection failed. Please try again.')
    } finally {
      setIsConnecting(false)
    }
  }

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking':
      case 'savings':
        return <CreditCard className="h-5 w-5" />
      case 'credit':
        return <AlertCircle className="h-5 w-5" />
      case 'loan':
        return <Building2 className="h-5 w-5" />
      default:
        return <CreditCard className="h-5 w-5" />
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Bank Feeds Integration
          </CardTitle>
          <CardDescription>
            Connect your bank accounts to automatically import transactions and maintain real-time financial data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connectedAccounts.length === 0 ? (
            <div className="space-y-4">
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Bank Accounts Connected</h3>
                <p className="text-muted-foreground mb-4">
                  Connect your bank accounts to start importing transactions automatically.
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
                    'Connect Bank Account'
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Connected Accounts</h3>
                <Button variant="outline" size="sm" onClick={handleConnect}>
                  Add Another Account
                </Button>
              </div>
              
              <div className="grid gap-4">
                {connectedAccounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getAccountIcon(account.type)}
                      <div>
                        <div className="font-medium">{account.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {account.institution} • {account.type}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(account.balance, account.currency)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Connected
                      </div>
                    </div>
                  </div>
                ))}
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
            <h4 className="font-medium text-blue-900 mb-2">Supported Banks</h4>
            <div className="flex flex-wrap gap-2">
              {['Chase', 'Bank of America', 'Wells Fargo', 'Citibank', 'Capital One', 'PNC', 'US Bank'].map((bank) => (
                <Badge key={bank} variant="secondary" className="text-xs">
                  {bank}
                </Badge>
              ))}
            </div>
            <p className="text-blue-700 text-sm mt-2">
              Powered by Plaid for secure, encrypted connections to 11,000+ financial institutions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
































