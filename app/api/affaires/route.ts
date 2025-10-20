import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET : Liste des affaires
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get("site_id")

    let query = supabase
      .from("affaires")
      .select(`
        *,
        sites!inner(nom),
        ressources!inner(nom, prenom)
      `)
      .order("code_affaire", { ascending: false })

    if (siteId) {
      query = query.eq("site_id", siteId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Erreur récupération affaires:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Erreur route affaires GET:", error)
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération des affaires" },
      { status: 500 }
    )
  }
}

// POST : Créer une affaire
export async function POST(request: NextRequest) {
  try {
    console.log("=== POST /api/affaires ===")
    const body = await request.json()
    console.log("Body reçu:", body)
    
    console.log("🔗 Connexion à Supabase...")
    const supabase = await createClient()
    console.log("✅ Connexion OK")

    const {
      code_affaire,
      nom,
      site_id,
      responsable_id,
      client_id,
      competence_principale,
      num_commande,
      type_affaire,
      montant_total_ht,
      date_debut,
      date_fin_prevue,
      statut,
      // Champs spécifiques BPU
      nb_ressources_ref,
      heures_semaine_ref,
      periode_debut,
      periode_fin,
    } = body

    // Validation
    if (!code_affaire || !nom || !site_id || !responsable_id || !type_affaire) {
      console.error("Champs obligatoires manquants")
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

    // TEMPORAIRE : Accepter même sans authentification pour tester
    // if (!user) {
    //   console.error("Utilisateur non authentifié")
    //   return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    // }

    console.log("User ID:", user?.id || "AUCUN (test)")

    // Calculer la capacité pour BPU
    let heures_capacite = null
    if (type_affaire === "BPU" && nb_ressources_ref && heures_semaine_ref && periode_debut && periode_fin) {
      const debut = new Date(periode_debut)
      const fin = new Date(periode_fin)
      const diffTime = Math.abs(fin.getTime() - debut.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      const nbSemaines = Math.ceil(diffDays / 7)
      heures_capacite = nb_ressources_ref * heures_semaine_ref * nbSemaines
      console.log("Capacité BPU calculée:", heures_capacite, "h")
    }

    // Préparer les données d'insertion
    const insertData = {
      code_affaire,
      nom,
      site_id,
      responsable_id,
      client_id: client_id || null,
      competence_principale: competence_principale || null,
      num_commande: num_commande || null,
      type_contrat: "Forfait", // Obligatoire (NOT NULL) - par défaut "Forfait"
      type_affaire,
      montant_total_ht: montant_total_ht || null,
      date_debut: date_debut || null,
      date_fin_prevue: date_fin_prevue || null,
      statut: statut || "Brouillon",
      // Champs BPU
      nb_ressources_ref: type_affaire === "BPU" ? nb_ressources_ref : null,
      heures_semaine_ref: type_affaire === "BPU" ? heures_semaine_ref : null,
      periode_debut: type_affaire === "BPU" ? periode_debut : null,
      periode_fin: type_affaire === "BPU" ? periode_fin : null,
      heures_capacite: type_affaire === "BPU" ? heures_capacite : null,
      heures_vendues_total: 0,
      heures_consommes_total: 0,
      montant_reconnu_total: 0,
      created_by: user?.id || null, // TEMPORAIRE pour tester
    }

    console.log("Données à insérer:", insertData)

    // Insérer l'affaire
    const { data: affaire, error: insertError } = await supabase
      .from("affaires")
      .insert(insertData)
      .select()
      .single()

    if (insertError) {
      console.error("❌ Erreur création affaire:", insertError)
      console.error("Code erreur:", insertError.code)
      console.error("Détails:", insertError.details)
      console.error("Hint:", insertError.hint)
      return NextResponse.json({ 
        error: insertError.message,
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint
      }, { status: 500 })
    }

    console.log("✅ Affaire créée avec succès:", affaire)
    return NextResponse.json({ success: true, data: affaire }, { status: 201 })
  } catch (error) {
    console.error("❌ Erreur route affaires POST:", error)
    return NextResponse.json(
      { error: "Erreur serveur lors de la création de l'affaire", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// PUT : Modifier une affaire
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: "ID affaire requis" },
        { status: 400 }
      )
    }

    // Calculer la capacité pour BPU si modifié
    if (updates.type_affaire === "BPU" && updates.nb_ressources_ref && updates.heures_semaine_ref && updates.periode_debut && updates.periode_fin) {
      const debut = new Date(updates.periode_debut)
      const fin = new Date(updates.periode_fin)
      const diffTime = Math.abs(fin.getTime() - debut.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      const nbSemaines = Math.ceil(diffDays / 7)
      updates.heures_capacite = updates.nb_ressources_ref * updates.heures_semaine_ref * nbSemaines
    }

    const { data, error } = await supabase
      .from("affaires")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Erreur modification affaire:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Erreur route affaires PUT:", error)
    return NextResponse.json(
      { error: "Erreur serveur lors de la modification de l'affaire" },
      { status: 500 }
    )
  }
}

