import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    console.log("=== PROLONGE ACTIVITE API CALL START ===")
    const supabase = await createClient()
    const body = await request.json()
    const { tache_id, motif, duree_supplementaire } = body

    console.log("Prolonge activite request:", { tache_id, motif, duree_supplementaire })

    if (!tache_id || !motif || !duree_supplementaire) {
      console.error("Missing required fields:", { tache_id, motif, duree_supplementaire })
      return NextResponse.json(
        { success: false, message: "Missing required fields: tache_id, motif, duree_supplementaire" },
        { status: 400 }
      )
    }

    // Vérifier que la durée supplémentaire est positive
    if (duree_supplementaire <= 0) {
      console.error("Invalid duration:", duree_supplementaire)
      return NextResponse.json(
        { success: false, message: "Duration must be positive" },
        { status: 400 }
      )
    }

    // Vérifier que la tâche existe et est dans le bon statut
    const { data: tache, error: tacheError } = await supabase
      .from("planning_taches")
      .select("id, statut, libelle_tache, site_id, affaire_id, date_fin_plan")
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
    if (!["En cours", "Suspendu"].includes(tache.statut)) {
      console.error("Task not in correct status:", tache.statut)
      return NextResponse.json(
        { success: false, message: `Task must be in progress or suspended to be extended` },
        { status: 400 }
      )
    }

    // Utiliser la fonction SQL pour prolonger l'activité
    const { data: result, error: prolongeError } = await supabase
      .rpc('prolonge_activite', {
        tache_id: tache_id,
        motif: motif,
        duree_supplementaire: duree_supplementaire
      })

    if (prolongeError) {
      console.error("Error extending activity:", prolongeError)
      return NextResponse.json(
        { success: false, message: `Error extending activity: ${prolongeError.message}` },
        { status: 500 }
      )
    }

    console.log("Activity extended successfully:", result)

    // Créer une entrée dans remontee_site pour tracer la prolongation
    const { error: remonteeError } = await supabase
      .from("remontee_site")
      .insert({
        tache_id,
        site_id: tache.site_id,
        affaire_id: tache.affaire_id,
        date_saisie: new Date().toISOString().split("T")[0],
        statut_reel: "Prolongée",
        avancement_pct: 0,
        motif: motif,
        commentaire: `Prolongation: ${motif} - +${duree_supplementaire} jours`
      })

    if (remonteeError) {
      console.error("Error creating remontee entry:", remonteeError)
      // Ne pas échouer si la remontée échoue, l'activité a été prolongée
      console.warn("Warning: Could not create remontee entry, but activity was extended")
    }

    console.log("=== PROLONGE ACTIVITE API CALL SUCCESS ===")
    return NextResponse.json({ 
      success: true, 
      message: "Activité prolongée avec succès",
      data: { 
        tache_id, 
        motif, 
        duree_supplementaire,
        nouvelle_date_fin: new Date(new Date(tache.date_fin_plan).getTime() + duree_supplementaire * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
      }
    })
  } catch (error) {
    console.error("=== PROLONGE ACTIVITE API CALL ERROR ===")
    console.error("Error in prolonge-activite route:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
