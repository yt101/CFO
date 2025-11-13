import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, Mail, ArrowRight, BarChart3 } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-svh w-full bg-gradient-to-br from-emerald-50 via-white to-green-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative flex min-h-svh w-full items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="text-center space-y-8">
            {/* Success Animation */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                  <Mail className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-gray-900">
                Almost There!
              </h1>
              <p className="text-xl text-gray-600 max-w-md mx-auto">
                We&apos;ve sent a confirmation link to your email address
              </p>
            </div>

            {/* Main Card */}
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm max-w-lg mx-auto">
              <CardHeader className="text-center pb-6">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
                <CardDescription className="text-base">
                  Click the confirmation link to activate your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-green-800">
                      <p className="font-medium mb-1">What happens next?</p>
                      <ul className="space-y-1 text-green-700">
                        <li>• Check your email inbox (and spam folder)</li>
                        <li>• Click the confirmation link in the email</li>
                        <li>• Return here to sign in to your dashboard</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <p className="text-sm text-gray-600">
                    Didn&apos;t receive the email? Check your spam folder or{" "}
                    <button className="text-green-600 hover:text-green-700 font-medium underline">
                      resend confirmation
                    </button>
                  </p>
                  
                  <Button asChild className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200">
                    <Link href="/auth/login" className="flex items-center gap-2">
                      Back to Sign In
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center text-sm text-gray-500">
              <p>Need help? Contact our support team at support@returnsight.ai</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
