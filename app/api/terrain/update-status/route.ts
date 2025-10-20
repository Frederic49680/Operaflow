import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { tache_id, statut_reel } = body

    if (!tache_id || !statut_reel) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Vérifier si une remontée existe déjà pour aujourd'hui
    const { data: existingRemontee } = await supabase
      .from("remontee_site")
      .select("*")
      .eq("tache_id", tache_id)
      .eq("date_saisie", new Date().toISOString().split("T")[0])
      .single()

    if (existingRemontee) {
      // Mettre à jour la remontée existante
      const { error } = await supabase
        .from("remontee_site")
        .update({
          statut_reel,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingRemontee.id)

      if (error) {
        console.error("Error updating remontee:", error)
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 500 }
        )
      }
    } else {
      // Créer une nouvelle remontée
      const { error } = await supabase
        .from("remontee_site")
        .insert({
          tache_id,
          date_saisie: new Date().toISOString().split("T")[0],
          statut_reel,
          avancement_pct: 0,
        })

      if (error) {
        console.error("Error creating remontee:", error)
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 500 }
        )
      }
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

