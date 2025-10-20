import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { task_id, avancement_pct } = await request.json()

    // Valider les paramètres
    if (!task_id || avancement_pct === undefined) {
      return NextResponse.json(
        { success: false, message: "Paramètres manquants" },
        { status: 400 }
      )
    }

    // Valider le pourcentage
    if (avancement_pct < 0 || avancement_pct > 100) {
      return NextResponse.json(
        { success: false, message: "Le pourcentage doit être entre 0 et 100" },
        { status: 400 }
      )
    }

    // Mettre à jour la tâche
    const { data, error } = await supabase
      .from("planning_taches")
      .update({
        avancement_pct,
        updated_at: new Date().toISOString(),
      })
      .eq("id", task_id)
      .select()

    if (error) {
      console.error("Error updating progress:", error)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Progression mise à jour avec succès",
      data,
    })
  } catch (error) {
    console.error("Error in update-progress route:", error)
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    )
  }
}

