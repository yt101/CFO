"use client";

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { 
  BarChart3, 
  Shield, 
  Brain, 
  TrendingUp, 
  DollarSign,
  CheckCircle,
  ArrowRight
} from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Check if we're in demo mode
      const isDemoMode = process.env.NEXT_PUBLIC_FORCE_DEMO_MODE === 'true' || 
                         !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                         process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_url_here' ||
                         process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co'

      if (isDemoMode) {
        // Local authentication for demo mode
        const demoUsers = {
          'admin@demo.com': { 
            password: 'demo123456', 
            role: 'admin', 
            company_id: '550e8400-e29b-41d4-a716-446655440001',
            id: 'demo-admin-id'
          },
          'user@demo.com': { 
            password: 'demo123456', 
            role: 'user', 
            company_id: '550e8400-e29b-41d4-a716-446655440001',
            id: 'demo-user-id'
          }
        }

        const user = demoUsers[email as keyof typeof demoUsers]
        
        if (user && user.password === password) {
          // Set demo user cookie
          const userData = {
            email,
            role: user.role,
            company_id: user.company_id,
            id: user.id
          }
          
          // Set cookie with 7 days expiration
          document.cookie = `demo_user=${JSON.stringify(userData)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
          
          console.log('Demo login successful:', email)
          router.push("/dashboard")
          router.refresh()
          return
        } else {
          setError("Invalid email or password. Use admin@demo.com or user@demo.com with password: demo123456")
          setIsLoading(false)
          return
        }
      }

      // Production mode - use Supabase
      const supabase = createClient()
      
      // Attempt Supabase authentication
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.error('Supabase auth error:', authError)
        setError(authError.message || "Invalid email or password")
        setIsLoading(false)
        return
      }

      if (data?.user) {
        console.log('Login successful:', data.user.email)
        router.push("/dashboard")
        router.refresh()
      } else {
        setError("Login failed. Please try again.")
        setIsLoading(false)
      }
    } catch (err) {
      console.error('Login error:', err)
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Improved Background Pattern - Fixed SVG */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 100 0 L 0 0 0 100' fill='none' stroke='%233b82f6' stroke-width='0.5' opacity='0.1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`,
          backgroundSize: '100px 100px',
        }}
      />
      
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-20 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-20 left-1/2 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      
      <div className="relative flex min-h-screen w-full items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Side - Branding & Features */}
            <div className="space-y-8 order-2 lg:order-1">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                    <BarChart3 className="w-8 h-8 sm:w-9 sm:h-9 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      ReturnSight AI
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Powered by Advanced Analytics</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                    Transform Your Tax Returns Into
                    <span className="block text-blue-600 mt-2">Strategic Insights</span>
                  </h2>
                  <p className="text-base sm:text-lg text-gray-600 max-w-lg leading-relaxed">
                    Unlock the hidden value in your financial data with AI-powered analysis and actionable recommendations.
                  </p>
                </div>
              </div>

              {/* Feature List */}
              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/50 transition-colors">
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex-shrink-0">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm sm:text-base font-medium text-gray-800">AI-Powered Financial Analysis</span>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Advanced machine learning algorithms</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/50 transition-colors">
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex-shrink-0">
                    <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm sm:text-base font-medium text-gray-800">Smart Tax Optimization Strategies</span>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Maximize savings with intelligent planning</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/50 transition-colors">
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex-shrink-0">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm sm:text-base font-medium text-gray-800">Real-time Performance Monitoring</span>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Track metrics and KPIs live</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/50 transition-colors">
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl flex-shrink-0">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm sm:text-base font-medium text-gray-800">Bank-Grade Security & Compliance</span>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">SOC-2 certified, GDPR compliant</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">500+</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">Companies</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">$2.3M</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600">99.9%</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">Uptime</div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex justify-center lg:justify-end order-1 lg:order-2">
              <div className="w-full max-w-md">
                <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-md">
                  <CardHeader className="space-y-3 text-center pb-6 pt-8">
                    <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl mx-auto mb-2 shadow-lg">
                      <DollarSign className="w-10 h-10 text-white" />
                    </div>
                    <CardTitle className="text-2xl sm:text-3xl font-bold">Welcome Back</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Sign in to access your financial insights dashboard
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 pb-8">
                    <form onSubmit={handleLogin} className="space-y-5">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="admin@demo.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-11 sm:h-12 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-11 sm:h-12 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          />
                        </div>
                        {error && (
                          <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                            {error}
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full h-11 sm:h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-200" 
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Signing in...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <span>Sign in</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        )}
                      </Button>
                      
                      <div className="text-center text-xs sm:text-sm text-gray-600 pt-2">
                        Don&apos;t have an account?{" "}
                        <Link 
                          href="/auth/sign-up" 
                          className="font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                        >
                          Create one now
                        </Link>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
