import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Présente" : "❌ Manquante",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Présente" : "❌ Manquante",
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? "✅ Présente" : "❌ Manquante",
    }
    
    console.log("🔍 Environment variables check:", envCheck)
    
    return NextResponse.json({
      success: true,
      environment: envCheck,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error checking environment:", error)
    return NextResponse.json(
      { success: false, message: "Error checking environment" },
      { status: 500 }
    )
  }
}
