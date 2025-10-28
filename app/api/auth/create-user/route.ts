import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendUserActivationEmail, generateTemporaryPassword } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { email, prenom, nom, role_id, sites_scope } = body

    if (!email || !prenom || !nom) {
      return NextResponse.json(
        { success: false, message: "Email, prénom et nom requis" },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe déjà
    const { data: existingUser } = await supabase
      .from("app_users")
      .select("id")
      .eq("email", email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Un utilisateur avec cet email existe déjà" },
        { status: 409 }
      )
    }

    // Générer un mot de passe temporaire
    const temporaryPassword = generateTemporaryPassword()

    // Créer l'utilisateur dans Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: false, // L'utilisateur devra confirmer son email
      user_metadata: {
        prenom,
        nom
      }
    })

    if (authError) {
      console.error("Erreur création utilisateur Auth:", authError)
      return NextResponse.json(
        { success: false, message: "Erreur lors de la création de l'utilisateur" },
        { status: 500 }
      )
    }

    if (!authUser.user) {
      return NextResponse.json(
        { success: false, message: "Erreur lors de la création de l'utilisateur" },
        { status: 500 }
      )
    }

    // Créer l'utilisateur dans notre table app_users
    const { error: userError } = await supabase
      .from("app_users")
      .insert({
        id: authUser.user.id,
        email,
        prenom,
        nom,
        active: true,
        email_verified: false,
        force_pwd_change: true,
        sites_scope: sites_scope || [],
        created_at: new Date().toISOString()
      })

    if (userError) {
      console.error("Erreur création app_users:", userError)
      // Nettoyer l'utilisateur Auth créé
      await supabase.auth.admin.deleteUser(authUser.user.id)
      return NextResponse.json(
        { success: false, message: "Erreur lors de la création du profil utilisateur" },
        { status: 500 }
      )
    }

    // Assigner le rôle si fourni
    if (role_id) {
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: authUser.user.id,
          role_id
        })

      if (roleError) {
        console.error("Erreur assignation rôle:", roleError)
        // Ne pas faire échouer la création pour une erreur de rôle
      }
    }

    // Envoyer l'email d'activation
    const emailResult = await sendUserActivationEmail({
      email,
      prenom,
      nom
    })

    if (emailResult.success) {
      console.log("✅ Email d'activation envoyé à:", email)
      console.log("🔐 Mot de passe temporaire:", temporaryPassword)
    }

    return NextResponse.json({
      success: true,
      message: "Utilisateur créé avec succès",
      user: {
        id: authUser.user.id,
        email,
        prenom,
        nom,
        temporaryPassword: temporaryPassword // À retirer en production
      }
    })

  } catch (error) {
    console.error("Erreur dans create-user:", error)
    return NextResponse.json(
      { success: false, message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
