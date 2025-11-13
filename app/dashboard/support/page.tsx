import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail, MessageSquare, Phone, HelpCircle } from "lucide-react"
import Link from "next/link"

export default function SupportPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-6 w-6" />
              <span className="text-xl font-bold">Support</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Support Center</h1>
            <p className="text-muted-foreground mt-2">
              Get help with ReturnSight AI and find answers to common questions.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Support
                </CardTitle>
                <CardDescription>
                  Send us an email and we'll get back to you within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  support@returnsight.ai
                </p>
                <Button asChild>
                  <a href="mailto:support@returnsight.ai">
                    Send Email
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Live Chat
                </CardTitle>
                <CardDescription>
                  Chat with our support team in real-time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Available Monday-Friday, 9 AM - 6 PM EST
                </p>
                <Button variant="outline">
                  Start Chat
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Phone Support
                </CardTitle>
                <CardDescription>
                  Call us for immediate assistance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  +1 (555) 123-4567
                </p>
                <Button variant="outline">
                  Call Now
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Documentation</CardTitle>
                <CardDescription>
                  Browse our comprehensive help documentation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Find guides, tutorials, and API documentation.
                </p>
                <Button variant="outline">
                  View Docs
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium">How do I upload my tax returns?</h4>
                <p className="text-sm text-muted-foreground">
                  Use the upload button in the dashboard to upload PDF or XML tax return files.
                </p>
              </div>
              <div>
                <h4 className="font-medium">What file formats are supported?</h4>
                <p className="text-sm text-muted-foreground">
                  We support PDF and XML formats for tax returns.
                </p>
              </div>
              <div>
                <h4 className="font-medium">How accurate are the AI insights?</h4>
                <p className="text-sm text-muted-foreground">
                  Our AI provides insights with high confidence levels, but always consult with a tax professional for important decisions.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
































