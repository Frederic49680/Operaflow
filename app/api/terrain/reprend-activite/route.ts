import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    console.log("=== REPREND ACTIVITE API CALL START ===")
    const supabase = await createClient()
    const body = await request.json()
    const { tache_id, commentaire } = body

    console.log("Reprend activite request:", { tache_id, commentaire })

    if (!tache_id) {
      console.error("Missing required fields:", { tache_id })
      return NextResponse.json(
        { success: false, message: "Missing required fields: tache_id" },
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
    if (!["Suspendu", "Reporté", "Prolongé"].includes(tache.statut)) {
      console.error("Task not in correct status:", tache.statut)
      return NextResponse.json(
        { success: false, message: `Task must be suspended, reported, or prolonged to be resumed` },
        { status: 400 }
      )
    }

    // Utiliser la fonction SQL pour reprendre l'activité
    const { data: result, error: reprendError } = await supabase
      .rpc('reprend_activite', {
        tache_id: tache_id,
        commentaire: commentaire || null
      })

    if (reprendError) {
      console.error("Error resuming activity:", reprendError)
      return NextResponse.json(
        { success: false, message: `Error resuming activity: ${reprendError.message}` },
        { status: 500 }
      )
    }

    console.log("Activity resumed successfully:", result)

    // Créer une entrée dans remontee_site pour tracer la reprise
    const { error: remonteeError } = await supabase
      .from("remontee_site")
      .insert({
        tache_id,
        site_id: tache.site_id,
        affaire_id: tache.affaire_id,
        date_saisie: new Date().toISOString().split("T")[0],
        statut_reel: "En cours",
        avancement_pct: 0,
        commentaire: commentaire || "Activité reprise"
      })

    if (remonteeError) {
      console.error("Error creating remontee entry:", remonteeError)
      // Ne pas échouer si la remontée échoue, l'activité a été reprise
      console.warn("Warning: Could not create remontee entry, but activity was resumed")
    }

    console.log("=== REPREND ACTIVITE API CALL SUCCESS ===")
    return NextResponse.json({ 
      success: true, 
      message: "Activité reprise avec succès",
      data: { tache_id, statut: "En cours", commentaire }
    })
  } catch (error) {
    console.error("=== REPREND ACTIVITE API CALL ERROR ===")
    console.error("Error in reprend-activite route:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
