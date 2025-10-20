import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET : Liste des lignes BPU disponibles pour une affaire
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const affaireId = searchParams.get("affaire_id")

    if (!affaireId) {
      return NextResponse.json(
        { error: "affaire_id requis" },
        { status: 400 }
      )
    }

    // Récupérer les lignes disponibles depuis la vue
    const { data, error } = await supabase
      .from("V_BPU_Lignes_Disponibles")
      .select("*")
      .eq("affaire_id", affaireId)
      .order("code_bpu")

    if (error) {
      console.error("Erreur récupération lignes BPU:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Erreur route lignes BPU:", error)
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des lignes BPU" },
      { status: 500 }
    )
  }
}

