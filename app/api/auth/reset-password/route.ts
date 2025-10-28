import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendPasswordResetEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email requis" },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe
    const { data: user, error: userError } = await supabase
      .from("app_users")
      .select("id, email, prenom, nom")
      .eq("email", email)
      .eq("active", true)
      .single()

    if (userError || !user) {
      // Pour des raisons de sécurité, on ne révèle pas si l'email existe ou non
      return NextResponse.json({
        success: true,
        message: "Si cet email existe, vous recevrez un lien de réinitialisation"
      })
    }

    // Générer un token de réinitialisation avec Supabase Auth
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`
    })

    if (resetError) {
      console.error("Erreur Supabase Auth:", resetError)
      return NextResponse.json(
        { success: false, message: "Erreur lors de la génération du lien" },
        { status: 500 }
      )
    }

    // Envoyer l'email personnalisé (optionnel, Supabase envoie déjà un email)
    const emailResult = await sendPasswordResetEmail({
      email: user.email,
      prenom: user.prenom,
      nom: user.nom
    })

    if (emailResult.success) {
      console.log("✅ Email de réinitialisation envoyé à:", email)
    }

    return NextResponse.json({
      success: true,
      message: "Si cet email existe, vous recevrez un lien de réinitialisation"
    })

  } catch (error) {
    console.error("Erreur dans reset-password:", error)
    return NextResponse.json(
      { success: false, message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
