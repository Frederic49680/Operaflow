import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET : Livraisons BPU d'une affaire
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

    // Récupérer les livraisons depuis la vue
    const { data, error } = await supabase
      .from("V_Affaire_BPU_Livraisons")
      .select("*")
      .eq("affaire_id", affaireId)
      .order("date_jour", { ascending: false })

    if (error) {
      console.error("Erreur récupération livraisons BPU:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Erreur route livraisons BPU:", error)
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des livraisons BPU" },
      { status: 500 }
    )
  }
}

