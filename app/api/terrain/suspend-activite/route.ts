import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    console.log("=== SUSPEND ACTIVITE API CALL START ===")
    const supabase = await createClient()
    const body = await request.json()
    const { tache_id, motif, responsable_id, duree_estimee } = body

    console.log("Suspend activite request:", { tache_id, motif, responsable_id, duree_estimee })

    if (!tache_id || !motif || !responsable_id) {
      console.error("Missing required fields:", { tache_id, motif, responsable_id })
      return NextResponse.json(
        { success: false, message: "Missing required fields: tache_id, motif, responsable_id" },
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
        { success: false, message: `Task must be in "En cours" status to be suspended` },
        { status: 400 }
      )
    }

    // Mettre à jour directement la tâche au lieu d'utiliser la fonction SQL
    const { error: updateError } = await supabase
      .from("planning_taches")
      .update({
        statut: "Suspendu",
        motif_suspension: motif,
        date_suspension: new Date().toISOString(),
        responsable_suspension: responsable_id,
        updated_at: new Date().toISOString()
      })
      .eq("id", tache_id)

    if (updateError) {
      console.error("Error updating task:", updateError)
      return NextResponse.json(
        { success: false, message: `Error updating task: ${updateError.message}` },
        { status: 500 }
      )
    }

    console.log("Activity suspended successfully")

    // Créer une entrée dans remontee_site pour tracer la suspension
    const { error: remonteeError } = await supabase
      .from("remontee_site")
      .insert({
        tache_id,
        site_id: tache.site_id,
        affaire_id: tache.affaire_id,
        date_saisie: new Date().toISOString().split("T")[0],
        statut_reel: "Suspendue",
        avancement_pct: 0,
        motif: motif,
        commentaire: `Suspension: ${motif}`
      })

    if (remonteeError) {
      console.error("Error creating remontee entry:", remonteeError)
      // Ne pas échouer si la remontée échoue, l'activité a été suspendue
      console.warn("Warning: Could not create remontee entry, but activity was suspended")
    }

    console.log("=== SUSPEND ACTIVITE API CALL SUCCESS ===")
    return NextResponse.json({ 
      success: true, 
      message: "Activité suspendue avec succès",
      data: { tache_id, statut: "Suspendu", motif }
    })
  } catch (error) {
    console.error("=== SUSPEND ACTIVITE API CALL ERROR ===")
    console.error("Error in suspend-activite route:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
