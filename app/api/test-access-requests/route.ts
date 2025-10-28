import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    console.log("🔍 Debug - Test API - Récupération des demandes d'accès")
    
    // Récupérer toutes les demandes d'accès (sans vérification de rôle pour debug)
    const { data: requests, error } = await supabase
      .from("access_requests")
      .select("*")
      .order("created_at", { ascending: false })

    console.log("🔍 Debug - Test API - Requests:", requests, "Error:", error)

    if (error) {
      console.error("Erreur récupération demandes:", error)
      return NextResponse.json(
        { success: false, message: "Erreur lors de la récupération des demandes", error: error.message },
        { status: 500 }
      )
    }

    // Compter par statut
    const stats = {
      total: requests?.length || 0,
      pending: requests?.filter(r => r.statut === "pending").length || 0,
      approved: requests?.filter(r => r.statut === "approved").length || 0,
      rejected: requests?.filter(r => r.statut === "rejected").length || 0
    }

    return NextResponse.json({
      success: true,
      requests: requests || [],
      stats: stats,
      debug: {
        requestCount: requests?.length || 0,
        allRequests: requests
      }
    })

  } catch (error) {
    console.error("Erreur dans test-access-requests GET:", error)
    return NextResponse.json(
      { success: false, message: "Erreur interne du serveur", error: error.message },
      { status: 500 }
    )
  }
}
