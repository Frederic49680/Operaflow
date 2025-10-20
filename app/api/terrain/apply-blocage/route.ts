import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { site_id, affaire_id, cause, start_at, end_at, scope_level } = body

    if (!cause || !start_at || !end_at || !scope_level) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      )
    }

    if (scope_level === "site" && !site_id) {
      return NextResponse.json(
        { success: false, message: "Site ID required for site-level blocage" },
        { status: 400 }
      )
    }

    if (scope_level === "affaire" && !affaire_id) {
      return NextResponse.json(
        { success: false, message: "Affaire ID required for affaire-level blocage" },
        { status: 400 }
      )
    }

    // Appeler la fonction SQL
    const { data, error } = await supabase.rpc("fn_apply_site_blocage", {
      p_site_id: site_id,
      p_affaire_id: affaire_id,
      p_cause: cause,
      p_start_at: start_at,
      p_end_at: end_at,
      p_scope_level: scope_level,
    })

    if (error) {
      console.error("Error applying blocage:", error)
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    // Compter les tâches suspendues
    let query = supabase.from("planning_taches").select("*", { count: "exact", head: true })
    
    if (scope_level === "site") {
      query = query.eq("site_id", site_id)
    } else {
      query = query.eq("affaire_id", affaire_id)
    }

    const { count } = await query

    return NextResponse.json({
      success: true,
      nb_taches_suspendues: count || 0,
    })
  } catch (error) {
    console.error("Error in apply-blocage route:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

