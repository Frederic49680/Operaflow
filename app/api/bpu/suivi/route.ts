import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET : Suivi BPU d'une affaire
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

    // Récupérer le suivi depuis la vue
    const { data, error } = await supabase
      .from("V_Affaire_BPU_Suivi")
      .select("*")
      .eq("affaire_id", affaireId)
      .single()

    if (error) {
      console.error("Erreur récupération suivi BPU:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Erreur route suivi BPU:", error)
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération du suivi BPU" },
      { status: 500 }
    )
  }
}

