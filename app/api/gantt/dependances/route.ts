import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const tache_id = searchParams.get("tache_id")

    // Construire la requête
    let query = supabase
      .from("v_taches_avec_dependances")
      .select("*")

    // Filtrer par tâche si spécifié
    if (tache_id) {
      query = query.eq("id", tache_id)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching dependances:", error)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    })
  } catch (error) {
    console.error("Error in dependances route:", error)
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { tache_id, tache_precedente_id, type_dependance, lag_jours } = await request.json()

    // Valider les paramètres
    if (!tache_id || !tache_precedente_id || !type_dependance) {
      return NextResponse.json(
        { success: false, message: "Paramètres manquants" },
        { status: 400 }
      )
    }

    // Créer la dépendance
    const { data, error } = await supabase
      .from("tache_dependances")
      .insert({
        tache_id,
        tache_precedente_id,
        type_dependance,
        lag_jours: lag_jours || 0,
      })
      .select()

    if (error) {
      console.error("Error creating dependance:", error)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Dépendance créée avec succès",
      data,
    })
  } catch (error) {
    console.error("Error in dependances POST route:", error)
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    )
  }
}

