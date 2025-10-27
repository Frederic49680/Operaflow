import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    console.log("=== LANCE ACTIVITE API CALL START ===")
    const supabase = await createClient()
    const body = await request.json()
    const { tache_id } = body

    console.log("Lance activite request:", { tache_id })

    if (!tache_id) {
      console.error("Missing required fields:", { tache_id })
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
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
    if (tache.statut !== "Non lancé") {
      console.error("Task not in correct status:", tache.statut)
      return NextResponse.json(
        { success: false, message: `Task must be in "Non lancé" status to be launched` },
        { status: 400 }
      )
    }

    // Utiliser la fonction SQL pour lancer l'activité
    const { data: result, error: lanceError } = await supabase
      .rpc('lance_activite', {
        tache_id: tache_id,
        user_id: null // TODO: Récupérer l'ID de l'utilisateur connecté
      })

    if (lanceError) {
      console.error("Error launching activity:", lanceError)
      return NextResponse.json(
        { success: false, message: `Error launching activity: ${lanceError.message}` },
        { status: 500 }
      )
    }

    console.log("Activity launched successfully:", result)

    // Créer une entrée dans remontee_site pour tracer le lancement
    const { error: remonteeError } = await supabase
      .from("remontee_site")
      .insert({
        tache_id,
        site_id: tache.site_id,
        affaire_id: tache.affaire_id,
        date_saisie: new Date().toISOString().split("T")[0],
        statut_reel: "En cours",
        avancement_pct: 0,
        commentaire: "Activité lancée"
      })

    if (remonteeError) {
      console.error("Error creating remontee entry:", remonteeError)
      // Ne pas échouer si la remontée échoue, l'activité a été lancée
      console.warn("Warning: Could not create remontee entry, but activity was launched")
    }

    console.log("=== LANCE ACTIVITE API CALL SUCCESS ===")
    return NextResponse.json({ 
      success: true, 
      message: "Activité lancée avec succès",
      data: { tache_id, statut: "En cours" }
    })
  } catch (error) {
    console.error("=== LANCE ACTIVITE API CALL ERROR ===")
    console.error("Error in lance-activite route:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
