import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, FileText } from "lucide-react"
import { ChatInterface } from "@/components/chat-interface"

export default async function ChatPage({
  params,
}: {
  params: Promise<{ returnId: string }>
}) {
  const { returnId } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  // Fetch return details
  const { data: returnData } = await supabase
    .from("returns")
    .select("*")
    .eq("id", returnId)
    .eq("user_id", user.id)
    .single()

  if (!returnData) {
    redirect("/dashboard")
  }

  // Fetch or create chat session
  let { data: session } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("return_id", returnId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (!session) {
    const { data: newSession } = await supabase
      .from("chat_sessions")
      .insert({
        user_id: user.id,
        return_id: returnId,
        title: `Chat about ${returnData.entity_name}`,
      })
      .select()
      .single()
    session = newSession
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/dashboard/returns/${returnId}`}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              <div>
                <div className="font-semibold">{returnData.entity_name}</div>
                <div className="text-xs text-muted-foreground">
                  Form {returnData.entity_type} • {returnData.tax_year}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Interface */}
      <main className="flex-1">
        <ChatInterface sessionId={session?.id || ""} returnId={returnId} />
      </main>
    </div>
  )
}
