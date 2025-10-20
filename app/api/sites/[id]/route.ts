import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET : Récupérer un site par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params

    const { data, error } = await supabase
      .from("sites")
      .select(`
        *,
        responsable_id:ressources (
          id,
          nom,
          prenom
        ),
        remplaçant_id:ressources (
          id,
          nom,
          prenom
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Erreur récupération site:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Erreur route site GET:", error)
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération du site" },
      { status: 500 }
    )
  }
}

// PUT : Modifier un site
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params
    const body = await request.json()

    const { data, error } = await supabase
      .from("sites")
      .update(body)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Erreur modification site:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Erreur route site PUT:", error)
    return NextResponse.json(
      { error: "Erreur serveur lors de la modification du site" },
      { status: 500 }
    )
  }
}

// DELETE : Supprimer un site
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params

    const { error } = await supabase
      .from("sites")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Erreur suppression site:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur route site DELETE:", error)
    return NextResponse.json(
      { error: "Erreur serveur lors de la suppression du site" },
      { status: 500 }
    )
  }
}

