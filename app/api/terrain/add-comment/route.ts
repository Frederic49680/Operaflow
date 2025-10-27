import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { tache_id, commentaire } = body

    if (!tache_id || !commentaire) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Vérifier si une remontée existe pour aujourd'hui
    const { data: existingRemontee } = await supabase
      .from("remontee_site")
      .select("*")
      .eq("tache_id", tache_id)
      .eq("date_saisie", new Date().toISOString().split("T")[0])
      .single()

    if (existingRemontee) {
      // Mettre à jour la remontée existante avec le commentaire
             const { error } = await supabase
               .from("remontee_site")
               .update({
                 commentaire,
               })
               .eq("id", existingRemontee.id)

      if (error) {
        console.error("Error updating comment:", error)
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 500 }
        )
      }
    } else {
      // Créer une nouvelle remontée avec le commentaire
      const { error } = await supabase
        .from("remontee_site")
        .insert({
          tache_id,
          date_saisie: new Date().toISOString().split("T")[0],
          statut_reel: "En cours",
          avancement_pct: 0,
          commentaire,
        })

      if (error) {
        console.error("Error creating remontee with comment:", error)
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in add-comment route:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
