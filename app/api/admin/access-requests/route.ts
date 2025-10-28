import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Types pour les données Supabase
interface Role {
  code: string
  label: string
}

interface UserRole {
  roles: Role | null
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Vérifier que l'utilisateur est admin
    const { data: { user } } = await supabase.auth.getUser()
    
    console.log("🔍 Debug - User:", user?.id)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Non authentifié" },
        { status: 401 }
      )
    }

    // Vérifier le rôle admin avec plus de détails
    const { data: userRoles, error: roleError } = await supabase
      .from("user_roles")
      .select("roles(code, label)")
      .eq("user_id", user.id)

    console.log("🔍 Debug - User roles:", userRoles, "Error:", roleError)

    // Vérifier si l'utilisateur a le rôle admin
    const hasAdminRole = userRoles?.some((ur: any) => ur.roles?.code === "admin") || false
    
    console.log("🔍 Debug - Has admin role:", hasAdminRole)

    if (!hasAdminRole) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Accès non autorisé - Rôle admin requis",
          debug: {
            userId: user.id,
            userRoles: userRoles,
            hasAdminRole: hasAdminRole
          }
        },
        { status: 403 }
      )
    }

    // Récupérer toutes les demandes d'accès
    const { data: requests, error } = await supabase
      .from("access_requests")
      .select("*")
      .order("created_at", { ascending: false })

    console.log("🔍 Debug - Requests:", requests, "Error:", error)

    if (error) {
      console.error("Erreur récupération demandes:", error)
      return NextResponse.json(
        { success: false, message: "Erreur lors de la récupération des demandes", error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      requests: requests || [],
      debug: {
        userId: user.id,
        hasAdminRole: hasAdminRole,
        requestCount: requests?.length || 0
      }
    })

  } catch (error) {
    console.error("Erreur dans access-requests GET:", error)
    return NextResponse.json(
      { success: false, message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
