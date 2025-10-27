import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Récupérer toutes les remontées non confirmées pour aujourd'hui
    const { data: remontees, error: fetchError } = await supabase
      .from("remontee_site")
      .select("*")
      .eq("date_saisie", new Date().toISOString().split("T")[0])
      .eq("etat_confirme", false)

    if (fetchError) {
      console.error("Error fetching remontees:", fetchError)
      return NextResponse.json(
        { success: false, message: fetchError.message },
        { status: 500 }
      )
    }

    if (!remontees || remontees.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Aucune remontée à confirmer",
        count: 0,
      })
    }

    // Pour chaque remontée, créer une copie dans remontee_site_reporting
    const reportingData = remontees.map((r) => ({
      remontee_id: r.id,
      date_report: r.date_saisie,
      tache_id: r.tache_id,
      site_id: r.site_id,
      affaire_id: r.affaire_id,
      statut_final: r.statut_reel,
      avancement_final: r.avancement_pct,
      nb_present: r.nb_present,
      heures_metal: r.heures_metal,
      motif: r.motif,
      claim: r.claim,
      commentaire: r.commentaire,
      confirme_par: r.created_by,
      date_confirmation: new Date().toISOString(),
    }))

    const { error: insertError } = await supabase
      .from("remontee_site_reporting")
      .insert(reportingData)

    if (insertError) {
      console.error("Error inserting reporting data:", insertError)
      return NextResponse.json(
        { success: false, message: insertError.message },
        { status: 500 }
      )
    }

    // Marquer toutes les remontées comme confirmées
    const { error: updateError } = await supabase
      .from("remontee_site")
      .update({ etat_confirme: true })
      .eq("date_saisie", new Date().toISOString().split("T")[0])
      .eq("etat_confirme", false)

    if (updateError) {
      console.error("Error updating confirmation status:", updateError)
      return NextResponse.json(
        { success: false, message: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${remontees.length} remontée(s) confirmée(s)`,
      count: remontees.length,
    })
  } catch (error) {
    console.error("Error in confirm-day route:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
