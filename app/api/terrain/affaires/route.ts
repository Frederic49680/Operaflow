import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get("site_id")

    let query = supabase
      .from("v_affaires_taches_jour")
      .select("*")

    if (siteId) {
      query = query.eq("site_id", siteId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching affaires:", error)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error in affaires route:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

