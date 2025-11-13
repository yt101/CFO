import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Check if we're in demo mode
    const isDemoMode = process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co' || 
                      process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_url_here'

    const formData = await request.formData()
    const file = formData.get("file") as File
    const entityName = formData.get("entityName") as string
    const entityType = formData.get("entityType") as string
    const taxYear = Number.parseInt(formData.get("taxYear") as string)

    if (!file || !entityName || !entityType || !taxYear) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (isDemoMode) {
      // Demo mode - simulate successful upload
      const fileExt = file.name.split(".").pop()
      const returnId = `demo-return-${Date.now()}`
      
      console.log("Demo mode upload:", {
        returnId,
        entityName,
        entityType,
        taxYear,
        fileType: fileExt
      })

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      return NextResponse.json({
        returnId,
        message: "Upload successful (Demo Mode)",
        demo: true
      })
    }

    // Production mode - use Supabase
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Upload file to Supabase Storage (using Blob storage)
    const fileExt = file.name.split(".").pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    // For now, we'll store a placeholder URL
    // In production, you would upload to Blob storage
    const fileUrl = `/uploads/${fileName}`

    // Get user's company_id
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .single()

    // Create return record with company_id
    const { data: returnData, error: insertError } = await supabase
      .from("returns")
      .insert({
        user_id: user.id,
        company_id: userProfile?.company_id || null, // RLS triggers will auto-set if null
        entity_name: entityName,
        entity_type: entityType,
        tax_year: taxYear,
        source_type: fileExt === "xml" ? "xml" : "pdf",
        file_url: fileUrl,
        status: "processing",
      })
      .select()
      .single()

    if (insertError) {
      console.error("Insert error:", insertError)
      return NextResponse.json({ error: "Failed to create return" }, { status: 500 })
    }

    // In production, this would be done via a queue/webhook
    // For demo purposes, we'll call it directly
    try {
      await fetch(`${request.nextUrl.origin}/api/returns/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnId: returnData.id }),
      })
    } catch (error) {
      console.error("Processing trigger error:", error)
      // Don't fail the upload if processing fails
    }

    return NextResponse.json({
      returnId: returnData.id,
      message: "Upload successful",
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
