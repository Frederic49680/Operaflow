import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    console.log("=== REPORTE ACTIVITE API CALL START ===")
    const supabase = await createClient()
    const body = await request.json()
    const { tache_id, motif, nouvelle_date, besoin_claim } = body

    console.log("Reporte activite request:", { tache_id, motif, nouvelle_date, besoin_claim })

    if (!tache_id || !motif || !nouvelle_date) {
      console.error("Missing required fields:", { tache_id, motif, nouvelle_date })
      return NextResponse.json(
        { success: false, message: "Missing required fields: tache_id, motif, nouvelle_date" },
        { status: 400 }
      )
    }

    // Vérifier que la tâche existe et est dans le bon statut
    const { data: tache, error: tacheError } = await supabase
      .from("planning_taches")
      .select("id, statut, libelle_tache, site_id, affaire_id")
      .eq("id", tache_id)
      .single()

    if (tacheError) {
      console.error("Error fetching task:", tacheError)
      return NextResponse.json(
        { success: false, message: `Task not found: ${tacheError.message}` },
        { status: 404 }
      )
    }

    if (!tache) {
      console.error("Task not found:", tache_id)
      return NextResponse.json(
        { success: false, message: `Task not found: ${tache_id}` },
        { status: 404 }
      )
    }

    console.log("Task found:", tache)

    // Vérifier que la tâche est dans le bon statut
    if (tache.statut !== "En cours") {
      console.error("Task not in correct status:", tache.statut)
      return NextResponse.json(
        { success: false, message: `Task must be in "En cours" status to be reported` },
        { status: 400 }
      )
    }

    // Utiliser la fonction SQL pour reporter l'activité
    const { data: result, error: reporteError } = await supabase
      .rpc('reporte_activite', {
        tache_id: tache_id,
        motif: motif,
        nouvelle_date: nouvelle_date,
        besoin_claim: besoin_claim || false
      })

    if (reporteError) {
      console.error("Error reporting activity:", reporteError)
      return NextResponse.json(
        { success: false, message: `Error reporting activity: ${reporteError.message}` },
        { status: 500 }
      )
    }

    console.log("Activity reported successfully:", result)

    // Créer une entrée dans remontee_site pour tracer le report
    const { error: remonteeError } = await supabase
      .from("remontee_site")
      .insert({
        tache_id,
        site_id: tache.site_id,
        affaire_id: tache.affaire_id,
        date_saisie: new Date().toISOString().split("T")[0],
        statut_reel: "Reportée",
        avancement_pct: 0,
        motif: motif,
        commentaire: `Report: ${motif} - Nouvelle date: ${nouvelle_date}`
      })

    if (remonteeError) {
      console.error("Error creating remontee entry:", remonteeError)
      // Ne pas échouer si la remontée échoue, l'activité a été reportée
      console.warn("Warning: Could not create remontee entry, but activity was reported")
    }

    console.log("=== REPORTE ACTIVITE API CALL SUCCESS ===")
    return NextResponse.json({ 
      success: true, 
      message: "Activité reportée avec succès",
      data: { 
        tache_id, 
        statut: "Reporté", 
        motif, 
        nouvelle_date,
        besoin_claim 
      }
    })
  } catch (error) {
    console.error("=== REPORTE ACTIVITE API CALL ERROR ===")
    console.error("Error in reporte-activite route:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
