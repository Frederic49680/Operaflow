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
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("role_id")
      .eq("user_id", user.id)

    if (!userRoles || userRoles.length === 0) {
      return NextResponse.json(
        { success: false, message: "Aucun rôle trouvé" },
        { status: 403 }
      )
    }

    const roleIds = userRoles.map(ur => ur.role_id)
    const { data: roles } = await supabase
      .from("roles")
      .select("id, code, label")
      .in("id", roleIds)

    const isAdmin = roles?.some(r => r.code === "ADMIN")
    
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Accès refusé: rôle admin requis" },
        { status: 403 }
      )
    }

    // Récupérer tous les rôles disponibles
    const { data: allRoles, error } = await supabase
      .from("roles")
      .select("id, code, label")
      .order("label")

    if (error) {
      console.error("Erreur récupération rôles:", error)
      return NextResponse.json(
        { success: false, message: "Erreur lors de la récupération des rôles" },
        { status: 500 }
      )
    }

    return NextResponse.json(allRoles || [])

  } catch (error) {
    console.error("Erreur dans /api/admin/roles:", error)
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    )
  }
}
