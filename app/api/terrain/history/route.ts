import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    console.log("=== HISTORY API CALL START ===")
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const tache_id = searchParams.get('tache_id')

    console.log("History request:", { tache_id })

    if (!tache_id) {
      console.error("Missing tache_id parameter")
      return NextResponse.json(
        { success: false, message: "Missing tache_id parameter" },
        { status: 400 }
      )
    }

    // Récupérer l'historique des remontées pour cette tâche
    console.log("Fetching history for task:", tache_id)
    const { data: history, error } = await supabase
      .from("remontee_site")
      .select(`
        id,
        date_saisie,
        statut_reel,
        avancement_pct,
        nb_present,
        heures_metal,
        motif,
        commentaire,
        date_creation
      `)
      .eq("tache_id", tache_id)
      .order("date_saisie", { ascending: false })
      .order("date_creation", { ascending: false })

    if (error) {
      console.error("Error fetching history:", error)
      return NextResponse.json(
        { success: false, message: `Error fetching history: ${error.message}` },
        { status: 500 }
      )
    }

    console.log("History found:", history?.length || 0, "entries")
    console.log("=== HISTORY API CALL SUCCESS ===")
    
    return NextResponse.json({ 
      success: true, 
      data: history || [] 
    })
  } catch (error) {
    console.error("=== HISTORY API CALL ERROR ===")
    console.error("Error in history route:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
