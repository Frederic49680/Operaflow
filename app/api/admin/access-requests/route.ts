import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Vérifier que l'utilisateur est admin
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Non authentifié" },
        { status: 401 }
      )
    }

    // Vérifier le rôle admin
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("roles(code)")
      .eq("user_id", user.id)
      .eq("roles.code", "admin")
      .single()

    if (!userRole) {
      return NextResponse.json(
        { success: false, message: "Accès non autorisé" },
        { status: 403 }
      )
    }

    // Récupérer toutes les demandes d'accès
    const { data: requests, error } = await supabase
      .from("access_requests")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erreur récupération demandes:", error)
      return NextResponse.json(
        { success: false, message: "Erreur lors de la récupération des demandes" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      requests: requests || []
    })

  } catch (error) {
    console.error("Erreur dans access-requests GET:", error)
    return NextResponse.json(
      { success: false, message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
