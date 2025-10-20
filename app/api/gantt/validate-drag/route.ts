import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { task_id, new_date_debut, new_date_fin } = await request.json()

    // Valider les paramètres
    if (!task_id || !new_date_debut || !new_date_fin) {
      return NextResponse.json(
        { success: false, message: "Paramètres manquants" },
        { status: 400 }
      )
    }

    // Appeler la fonction de validation
    const { data, error } = await supabase.rpc("fn_validate_drag_tache", {
      p_tache_id: task_id,
      p_new_date_debut: new_date_debut,
      p_new_date_fin: new_date_fin,
    })

    if (error) {
      console.error("Error validating drag:", error)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Error in validate-drag route:", error)
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    )
  }
}

