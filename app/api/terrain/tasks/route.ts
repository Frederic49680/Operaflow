import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const affaireId = searchParams.get("affaire_id")

    let query = supabase
      .from("v_taches_tuiles")
      .select("*")

    if (affaireId) {
      query = query.eq("affaire_id", affaireId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching tasks:", error)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error in tasks route:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

