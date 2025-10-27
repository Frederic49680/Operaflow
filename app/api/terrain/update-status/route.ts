import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { tache_id, statut_reel } = body

    console.log("Update status request:", { tache_id, statut_reel })

    if (!tache_id || !statut_reel) {
      console.error("Missing required fields:", { tache_id, statut_reel })
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Mapper les statuts du frontend vers les statuts de la base de données
    const statutMapping: { [key: string]: string } = {
      'Non lancé': 'Non lancée',
      'À lancer': 'Non lancée',
      'Terminé': 'Terminée',
      'Suspendu': 'Suspendue',
      'Reporté': 'Reportée',
      'Prolongé': 'Prolongée',
      'Bloqué': 'Bloquée',
      // Garder les statuts déjà corrects
      'Non lancée': 'Non lancée',
      'En cours': 'En cours',
      'Terminée': 'Terminée',
      'Bloquée': 'Bloquée',
      'Suspendue': 'Suspendue',
      'Reportée': 'Reportée',
      'Prolongée': 'Prolongée'
    }
    
    const mappedStatut = statutMapping[statut_reel] || statut_reel
    
    // Vérifier que le statut mappé est valide
    const validStatuts = [
      'Non lancée',
      'En cours',
      'Terminée',
      'Bloquée',
      'Suspendue',
      'Reportée',
      'Prolongée'
    ]
    
    if (!validStatuts.includes(mappedStatut)) {
      console.error("Invalid statut_reel:", statut_reel, "-> mapped:", mappedStatut)
      return NextResponse.json(
        { success: false, message: `Invalid statut_reel: ${statut_reel}` },
        { status: 400 }
      )
    }
    
    // Utiliser le statut mappé pour la suite
    const finalStatut = mappedStatut

    // Récupérer les informations de la tâche pour obtenir site_id et affaire_id
    const { data: tache, error: tacheError } = await supabase
      .from("planning_taches")
      .select("site_id, affaire_id, date_debut_plan, date_fin_plan")
      .eq("id", tache_id)
      .single()

    if (tacheError || !tache) {
      console.error("Error fetching task:", tacheError)
      return NextResponse.json(
        { success: false, message: `Task not found: ${tacheError?.message}` },
        { status: 404 }
      )
    }

    console.log("Task found:", tache)

    // Vérifier que site_id et affaire_id ne sont pas NULL
    if (!tache.site_id || !tache.affaire_id) {
      console.error("Missing site_id or affaire_id:", tache)
      return NextResponse.json(
        { success: false, message: "Task must have site_id and affaire_id" },
        { status: 400 }
      )
    }

    // Vérifier si une remontée existe déjà pour aujourd'hui
    const today = new Date().toISOString().split("T")[0]
    const { data: existingRemontee, error: existingError } = await supabase
      .from("remontee_site")
      .select("*")
      .eq("tache_id", tache_id)
      .eq("date_saisie", today)
      .maybeSingle()
    
    console.log("Existing remontee check:", { existingRemontee, existingError })

    if (existingRemontee) {
      console.log("Updating existing remontee:", existingRemontee.id)
      // Mettre à jour la remontée existante
      const { error } = await supabase
        .from("remontee_site")
        .update({
          statut_reel: finalStatut,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingRemontee.id)

      if (error) {
        console.error("Error updating remontee:", error)
        return NextResponse.json(
          { success: false, message: `Update error: ${error.message}` },
          { status: 500 }
        )
      }
      console.log("Remontee updated successfully")
    } else {
      console.log("Creating new remontee with data:", {
        tache_id,
        site_id: tache.site_id,
        affaire_id: tache.affaire_id,
        date_saisie: new Date().toISOString().split("T")[0],
        statut_reel,
        avancement_pct: 0,
      })
      
      // Créer une nouvelle remontée avec tous les champs nécessaires
      const { error } = await supabase
        .from("remontee_site")
        .insert({
          tache_id,
          site_id: tache.site_id,
          affaire_id: tache.affaire_id,
          date_saisie: new Date().toISOString().split("T")[0],
          statut_reel: finalStatut,
          avancement_pct: 0,
        })

      if (error) {
        console.error("Error creating remontee:", error)
        return NextResponse.json(
          { success: false, message: `Insert error: ${error.message}` },
          { status: 500 }
        )
      }
      console.log("Remontee created successfully")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in update-status route:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

