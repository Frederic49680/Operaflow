import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET : Liste des parapluies BPU par site
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get("site_id")

    // Récupérer les parapluies actifs
    let query = supabase
      .from("v_bpu_parapluies_actifs")
      .select("*")

    if (siteId) {
      query = query.eq("site_id", siteId)
    }

    const { data, error } = await query.order("code_affaire")

    if (error) {
      console.error("Erreur récupération parapluies BPU:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Erreur route parapluies BPU:", error)
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des parapluies BPU" },
      { status: 500 }
    )
  }
}

