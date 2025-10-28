import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET : Liste des sites
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const statut = searchParams.get("statut")

    let query = supabase
      .from("sites")
      .select(`
        *,
        responsable:ressources!sites_responsable_id_fkey (
          nom,
          prenom
        ),
        remplaçant:ressources!sites_remplacant_id_fkey (
          nom,
          prenom
        )
      `)
      .order("nom")

    if (statut) {
      query = query.eq("statut", statut)
    }

    const { data, error } = await query

    if (error) {
      console.error("Erreur récupération sites:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Erreur route sites GET:", error)
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des sites" },
      { status: 500 }
    )
  }
}

// POST : Créer un site
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      code_site,
      nom,
      responsable_id,
      remplacant_id,
      statut,
      commentaires,
    } = body

    // Validation
    if (!code_site || !nom || !responsable_id) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants" },
        { status: 400 }
      )
    }

    // Récupérer l'utilisateur connecté
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error("Erreur auth:", authError)
    }

    // Préparer les données d'insertion
    const insertData = {
      code_site,
      nom,
      responsable_id,
      remplacant_id: remplacant_id || null,
      statut: statut || "Actif",
      commentaires: commentaires || null,
      created_by: user?.id || null,
    }

    // Insérer le site
    const { data: site, error: insertError } = await supabase
      .from("sites")
      .insert(insertData)
      .select()
      .single()

    if (insertError) {
      console.error("❌ Erreur création site:", insertError)
      return NextResponse.json({ 
        error: insertError.message,
        code: insertError.code,
      }, { status: 500 })
    }

    console.log("✅ Site créé avec succès:", site)
    return NextResponse.json({ success: true, data: site }, { status: 201 })
  } catch (error) {
    console.error("❌ Erreur route sites POST:", error)
    return NextResponse.json(
      { error: "Erreur serveur lors de la création du site", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

