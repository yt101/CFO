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
  ArrowRight,
  Users,
  Zap,
  Target
} from "lucide-react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      
      // Attempt Supabase sign up
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (authError) {
        console.error('Supabase auth error:', authError)
        setError(authError.message || "Failed to create account")
        setIsLoading(false)
        return
      }

      if (data?.user) {
        console.log('Sign up successful:', data.user.email)
        // Redirect to success page
        router.push("/auth/sign-up-success")
      } else {
        setError("Failed to create account. Please try again.")
        setIsLoading(false)
      }
    } catch (err) {
      console.error('Sign up error:', err)
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-svh w-full bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative flex min-h-svh w-full items-center justify-center p-6">
        <div className="w-full max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Branding & Benefits */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl">
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      ReturnSight AI
                    </h1>
                    <p className="text-sm text-muted-foreground">Powered by Advanced Analytics</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-4xl font-bold text-gray-900">
                    Start Your Journey to
                    <span className="block text-green-600">Financial Excellence</span>
                  </h2>
                  <p className="text-lg text-gray-600 max-w-md">
                    Join hundreds of companies already using AI to transform their financial data into strategic advantages.
                  </p>
                </div>
              </div>

              {/* Benefits List */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                    <Zap className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700">Get started in under 5 minutes</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-gray-700">Personalized insights for your business</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-gray-700">Team collaboration features</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg">
                    <Shield className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="text-gray-700">Enterprise-grade security</span>
                </div>
              </div>

              {/* Testimonials */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-green-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">AC</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Sarah Chen</div>
                    <div className="text-sm text-gray-600">CFO, TechCorp</div>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "ReturnSight AI helped us identify $150K in tax savings we never knew existed. The ROI was immediate."
                </p>
              </div>
            </div>

            {/* Right Side - Sign Up Form */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md">
                <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="space-y-2 text-center pb-8">
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl mx-auto mb-4">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
                    <CardDescription className="text-base">
                      Join the future of financial intelligence
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSignUp} className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="advisor@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="repeat-password" className="text-sm font-medium">Confirm Password</Label>
                          <Input
                            id="repeat-password"
                            type="password"
                            required
                            value={repeatPassword}
                            onChange={(e) => setRepeatPassword(e.target.value)}
                            className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
                          />
                        </div>
                        {error && (
                          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                            {error}
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200" 
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Creating account...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            Create account
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        )}
                      </Button>
                      
                      <div className="text-center text-sm text-gray-600">
                        Already have an account?{" "}
                        <Link 
                          href="/auth/login" 
                          className="font-medium text-green-600 hover:text-green-700 hover:underline transition-colors"
                        >
                          Sign in here
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
