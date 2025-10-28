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
      .select("role_id")
      .eq("user_id", user.id)

    console.log("🔍 Debug - User roles:", userRoles, "Error:", roleError)

    if (roleError || !userRoles || userRoles.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Accès non autorisé - Aucun rôle trouvé",
          debug: {
            userId: user.id,
            userRoles: userRoles,
            roleError: roleError
          }
        },
        { status: 403 }
      )
    }

    // Récupérer les détails des rôles
    const roleIds = userRoles.map(ur => ur.role_id)
    const { data: roles, error: rolesError } = await supabase
      .from("roles")
      .select("id, code, label")
      .in("id", roleIds)

    console.log("🔍 Debug - Roles details:", roles, "Error:", rolesError)

    // Vérifier si l'utilisateur a le rôle ADMIN
    const hasAdminRole = roles?.some(role => role.code === "ADMIN") || false
    
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

    // Récupérer toutes les demandes d'accès avec gestion d'erreur RLS
    console.log("🔍 Tentative de récupération des demandes...")
    
    let requests = []
    let fetchError = null
    
    try {
      const { data: accessRequests, error: requestsError } = await supabase
        .from("access_requests")
        .select("*")
        .order("created_at", { ascending: false })

      console.log("🔍 Debug - Requests:", accessRequests, "Error:", requestsError)

      if (requestsError) {
        console.error("❌ Erreur RLS lors de la récupération:", requestsError)
        fetchError = requestsError
      } else {
        console.log("✅ Demandes récupérées:", accessRequests?.length || 0)
        requests = accessRequests || []
      }
    } catch (err) {
      console.error("❌ Exception lors de la récupération:", err)
      fetchError = err
    }

    // Si erreur RLS, retourner une réponse avec debug
    if (fetchError) {
      return NextResponse.json({
        success: false,
        message: "Erreur d'accès aux données (RLS)",
        debug: {
          error: fetchError,
          userId: user.id,
          hasAdminRole: hasAdminRole,
          suggestion: "RLS peut bloquer l'accès même pour les admins"
        }
      }, { status: 500 })
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
