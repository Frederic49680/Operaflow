import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendUserActivationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { requestId, roleId } = body

    if (!requestId) {
      return NextResponse.json(
        { success: false, message: "ID de demande requis" },
        { status: 400 }
      )
    }

    // Récupérer la demande
    const { data: requestData, error: requestError } = await supabase
      .from("access_requests")
      .select("*")
      .eq("id", requestId)
      .eq("statut", "pending")
      .single()

    if (requestError || !requestData) {
      return NextResponse.json(
        { success: false, message: "Demande non trouvée ou déjà traitée" },
        { status: 404 }
      )
    }

    // Générer un mot de passe temporaire
    const temporaryPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    // Créer l'utilisateur dans Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: requestData.email,
      password: temporaryPassword,
      email_confirm: false,
      user_metadata: {
        prenom: requestData.prenom,
        nom: requestData.nom
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
        email: requestData.email,
        prenom: requestData.prenom,
        nom: requestData.nom,
        active: true,
        email_verified: false,
        force_pwd_change: true,
        sites_scope: [],
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
    if (roleId) {
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: authUser.user.id,
          role_id: roleId
        })

      if (roleError) {
        console.error("Erreur assignation rôle:", roleError)
        // Ne pas faire échouer la création pour une erreur de rôle
      }
    }

    // Mettre à jour la demande comme approuvée
    const { error: updateError } = await supabase
      .from("access_requests")
      .update({
        statut: "approved",
        role_id: roleId,
        processed_at: new Date().toISOString()
      })
      .eq("id", requestId)

    if (updateError) {
      console.error("Erreur mise à jour demande:", updateError)
    }

    // Envoyer l'email d'activation
    const emailResult = await sendUserActivationEmail({
      email: requestData.email,
      prenom: requestData.prenom,
      nom: requestData.nom
    })

    if (emailResult.success) {
      console.log("✅ Email d'activation envoyé à:", requestData.email)
    }

    return NextResponse.json({
      success: true,
      message: "Demande approuvée et compte créé avec succès",
      user: {
        id: authUser.user.id,
        email: requestData.email,
        prenom: requestData.prenom,
        nom: requestData.nom,
        temporaryPassword: temporaryPassword // À retirer en production
      }
    })

  } catch (error) {
    console.error("Erreur dans approve-access-request:", error)
    return NextResponse.json(
      { success: false, message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
