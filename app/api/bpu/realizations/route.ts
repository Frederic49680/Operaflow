import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// POST : Créer une réalisation BPU
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      affaire_id,
      tache_id,
      bpu_ligne_id,
      tranche,
      systeme_elementaire,
      type_maintenance,
      etat_reel,
      heures_presence,
      heures_suspension,
      heures_metal,
      motif,
      description,
    } = body

    // Validation
    if (!affaire_id || !tache_id || !bpu_ligne_id || tranche === undefined) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants" },
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

    // Récupérer le site_id depuis l'affaire
    const { data: affaire, error: affaireError } = await supabase
      .from("affaires")
      .select("site_id")
      .eq("id", affaire_id)
      .single()

    if (affaireError || !affaire) {
      return NextResponse.json(
        { error: "Affaire introuvable" },
        { status: 404 }
      )
    }

    // Insérer la réalisation dans maintenance_journal
    const { data: realisation, error: insertError } = await supabase
      .from("maintenance_journal")
      .insert({
        site_id: affaire.site_id,
        affaire_id,
        tache_id,
        bpu_ligne_id,
        date_jour: new Date().toISOString().split("T")[0],
        tranche,
        systeme_elementaire,
        systeme: null, // Optionnel pour BPU
        type_maintenance,
        etat_reel,
        heures_presence,
        heures_suspension,
        heures_metal,
        motif: etat_reel === "Reportee" ? motif : null,
        description,
        created_by: user.id,
      })
      .select()
      .single()

    if (insertError) {
      console.error("Erreur insertion réalisation BPU:", insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Si la réalisation est terminée, déclencher la fonction de mise à jour
    if (etat_reel === "Termine") {
      const { error: triggerError } = await supabase.rpc(
        "fn_bpu_on_realisation_terminee",
        {
          p_maintenance_id: realisation.id,
        }
      )

      if (triggerError) {
        console.error("Erreur trigger fn_bpu_on_realisation_terminee:", triggerError)
        // Ne pas bloquer la création, juste logger l'erreur
      }
    }

    // Si la réalisation est reportée, déclencher la fonction de log
    if (etat_reel === "Reportee") {
      const { error: triggerError } = await supabase.rpc(
        "fn_bpu_on_realisation_reportee",
        {
          p_maintenance_id: realisation.id,
        }
      )

      if (triggerError) {
        console.error("Erreur trigger fn_bpu_on_realisation_reportee:", triggerError)
        // Ne pas bloquer la création, juste logger l'erreur
      }
    }

    return NextResponse.json({ success: true, data: realisation }, { status: 201 })
  } catch (error) {
    console.error("Erreur route réalisations BPU:", error)
    return NextResponse.json(
      { error: "Erreur serveur lors de la création de la réalisation BPU" },
      { status: 500 }
    )
  }
}

