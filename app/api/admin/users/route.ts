import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 API /api/admin/users appelée")
    
    const supabase = await createClient()
    
    // Récupérer les utilisateurs depuis app_users
    const { data: users, error } = await supabase
      .from("app_users")
      .select("id, prenom, nom, email")
      .eq("active", true)
      .order("nom", { ascending: true })

    if (error) {
      console.error("❌ Erreur récupération utilisateurs:", error)
      return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }

    console.log("✅ Utilisateurs récupérés:", users?.length || 0)
    return NextResponse.json(users || [], { status: 200 })
  } catch (error) {
    console.error("❌ Erreur serveur:", error)
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 })
  }
}
