import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { task_id, date_debut_plan, date_fin_plan } = await request.json()

    // Valider les paramètres
    if (!task_id || !date_debut_plan || !date_fin_plan) {
      return NextResponse.json(
        { success: false, message: "Paramètres manquants" },
        { status: 400 }
      )
    }

    // Appeler la fonction SQL de validation et mise à jour
    const { data, error } = await supabase.rpc("fn_update_tache_with_validation", {
      p_tache_id: task_id,
      p_date_debut_plan: date_debut_plan,
      p_date_fin_plan: date_fin_plan,
    })

    if (error) {
      console.error("Error updating task:", error)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    // Vérifier le résultat
    if (!data.success) {
      return NextResponse.json(
        { success: false, message: "Validation échouée", errors: data.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Tâche mise à jour avec succès",
      warnings: data.warnings,
    })
  } catch (error) {
    console.error("Error in update-task route:", error)
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    )
  }
}

