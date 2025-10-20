import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// POST : Importer les lignes BPU depuis CSV
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { affaire_id, lignes } = body

    if (!affaire_id || !lignes || !Array.isArray(lignes)) {
      return NextResponse.json(
        { error: "affaire_id et lignes requis" },
        { status: 400 }
      )
    }

    // Récupérer l'utilisateur connecté
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Insérer les lignes BPU
    const lignesToInsert = lignes.map((ligne: any) => ({
      affaire_id,
      code_bpu: ligne.code_bpu,
      libelle: ligne.libelle,
      systeme_elementaire: ligne.systeme_elementaire,
      quantite: ligne.quantite,
      unite: ligne.unite,
      pu: ligne.pu,
      pu_horaire: ligne.pu_horaire || null,
      heures_equiv_unitaire: ligne.heures_equiv_unitaire || null,
      delivered_qty: 0,
      delivered_hours: 0,
      montant_reconnu: 0,
      statut_ligne: "vendue",
      created_by: user.id,
    }))

    const { data, error } = await supabase
      .from("affaire_bpu_lignes")
      .insert(lignesToInsert)
      .select()

    if (error) {
      console.error("Erreur import lignes BPU:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { success: true, data, count: data.length },
      { status: 201 }
    )
  } catch (error) {
    console.error("Erreur route import BPU:", error)
    return NextResponse.json(
      { error: "Erreur serveur lors de l'import des lignes BPU" },
      { status: 500 }
    )
  }
}

