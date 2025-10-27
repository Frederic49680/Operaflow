import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    console.log("=== DAILY REPORT API CALL START ===")
    const supabase = await createClient()
    const body = await request.json()
    const { tache_id, avancement_pct } = body

    console.log("Daily report request:", { tache_id, avancement_pct })

    if (!tache_id || avancement_pct === undefined) {
      console.error("Missing required fields:", { tache_id, avancement_pct })
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Valider que l'avancement est entre 0 et 100
    if (avancement_pct < 0 || avancement_pct > 100) {
      console.error("Invalid avancement_pct:", avancement_pct)
      return NextResponse.json(
        { success: false, message: "Avancement must be between 0 and 100" },
        { status: 400 }
      )
    }

    // Récupérer les informations de la tâche
    console.log("Fetching task with ID:", tache_id)
    const { data: tache, error: tacheError } = await supabase
      .from("planning_taches")
      .select("id, site_id, affaire_id, libelle_tache")
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

    // Vérifier si site_id et affaire_id ne sont pas NULL
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
      // Mettre à jour la remontée existante avec le nouvel avancement
      console.log("Updating existing remontee:", existingRemontee.id)
      console.log("Update data:", { avancement_pct })

             const { error } = await supabase
               .from("remontee_site")
               .update({
                 avancement_pct,
               })
               .eq("id", existingRemontee.id)

      if (error) {
        console.error("Error updating remontee:", error)
        console.error("Error details:", JSON.stringify(error, null, 2))
        return NextResponse.json(
          { success: false, message: `Update error: ${error.message}` },
          { status: 500 }
        )
      }
      console.log("Remontee updated successfully with new progress")
    } else {
      // Créer une nouvelle remontée avec l'avancement
      const insertData = {
        tache_id,
        site_id: tache.site_id,
        affaire_id: tache.affaire_id,
        date_saisie: today,
        statut_reel: "En cours",
        avancement_pct,
      }

      console.log("Creating new remontee with data:", insertData)

      const { error } = await supabase
        .from("remontee_site")
        .insert(insertData)

      if (error) {
        console.error("Error creating remontee:", error)
        console.error("Error details:", JSON.stringify(error, null, 2))
        console.error("Insert data:", JSON.stringify(insertData, null, 2))
        return NextResponse.json(
          { success: false, message: `Insert error: ${error.message}` },
          { status: 500 }
        )
      }
      console.log("Remontee created successfully with initial progress")
    }

    // Mettre à jour l'avancement de la tâche dans planning_taches
    console.log("Updating task progress in planning_taches")
    const { error: updateTaskError } = await supabase
      .from("planning_taches")
      .update({
        avancement_pct,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tache_id)

    if (updateTaskError) {
      console.error("Error updating task progress:", updateTaskError)
      // Ne pas échouer si la mise à jour de la tâche échoue, on a déjà enregistré la remontée
      console.warn("Warning: Could not update task progress, but remontee was saved")
    } else {
      console.log("Task progress updated successfully")
    }

    console.log("=== DAILY REPORT API CALL SUCCESS ===")
    return NextResponse.json({ success: true, avancement_pct })
  } catch (error) {
    console.error("=== DAILY REPORT API CALL ERROR ===")
    console.error("Error in daily-report route:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
