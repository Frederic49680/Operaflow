import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { affaire_id, statut } = await request.json()

    // Valider les paramètres
    if (!affaire_id || !statut) {
      return NextResponse.json(
        { success: false, message: "Paramètres manquants" },
        { status: 400 }
      )
    }

    // Valider le statut
    const validStatuts = ["Brouillon", "Soumise", "Planifiée", "En suivi", "Clôturée"]
    if (!validStatuts.includes(statut)) {
      return NextResponse.json(
        { success: false, message: "Statut invalide" },
        { status: 400 }
      )
    }

    // Mettre à jour le statut
    const { data, error } = await supabase
      .from("affaires")
      .update({
        statut,
        updated_at: new Date().toISOString(),
      })
      .eq("id", affaire_id)
      .select()

    if (error) {
      console.error("Error updating status:", error)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Statut mis à jour avec succès",
      data,
    })
  } catch (error) {
    console.error("Error in update-status route:", error)
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    )
  }
}

