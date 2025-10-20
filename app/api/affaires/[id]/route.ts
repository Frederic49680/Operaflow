import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET : Récupérer une affaire par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params

    const { data, error } = await supabase
      .from("affaires")
      .select(`
        *,
        sites:site_id (
          id,
          nom,
          code_site
        ),
        clients:client_id (
          id,
          nom_client
        ),
        ressources:responsable_id (
          id,
          nom,
          prenom
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Erreur récupération affaire:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Erreur route affaire GET:", error)
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération de l'affaire" },
      { status: 500 }
    )
  }
}

// PUT : Modifier une affaire
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params
    const body = await request.json()

    // Calculer la capacité pour BPU si modifié
    if (body.type_affaire === "BPU" && body.nb_ressources_ref && body.heures_semaine_ref && body.periode_debut && body.periode_fin) {
      const debut = new Date(body.periode_debut)
      const fin = new Date(body.periode_fin)
      const diffTime = Math.abs(fin.getTime() - debut.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      const nbSemaines = Math.ceil(diffDays / 7)
      body.heures_capacite = body.nb_ressources_ref * body.heures_semaine_ref * nbSemaines
    }

    const { data, error } = await supabase
      .from("affaires")
      .update(body)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Erreur modification affaire:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Erreur route affaire PUT:", error)
    return NextResponse.json(
      { error: "Erreur serveur lors de la modification de l'affaire" },
      { status: 500 }
    )
  }
}

// DELETE : Supprimer une affaire
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params

    const { error } = await supabase
      .from("affaires")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Erreur suppression affaire:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur route affaire DELETE:", error)
    return NextResponse.json(
      { error: "Erreur serveur lors de la suppression de l'affaire" },
      { status: 500 }
    )
  }
}

