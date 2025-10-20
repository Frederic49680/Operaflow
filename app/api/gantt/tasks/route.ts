import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const affaire_id = searchParams.get("affaire_id")
    const site_id = searchParams.get("site_id")

    // Construire la requête avec jointures
    let query = supabase
      .from("planning_taches")
      .select(`
        *,
        affaires (
          code_affaire,
          nom
        ),
        sites (
          nom
        )
      `)
      .order("date_debut_plan", { ascending: true })

    // Filtrer par affaire si spécifié
    if (affaire_id) {
      query = query.eq("affaire_id", affaire_id)
    }

    // Filtrer par site si spécifié
    if (site_id) {
      query = query.eq("site_id", site_id)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching tasks:", error)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    // Transformer les données pour inclure les informations des relations
    const formattedData = data?.map((task: any) => ({
      ...task,
      code_affaire: task.affaires?.code_affaire || 'N/A',
      site_nom: task.sites?.nom || 'N/A',
    })) || []

    return NextResponse.json({
      success: true,
      data: formattedData,
    })
  } catch (error) {
    console.error("Error in tasks route:", error)
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    )
  }
}

