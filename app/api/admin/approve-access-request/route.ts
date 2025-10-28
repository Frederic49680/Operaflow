import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { sendEmail } from "@/lib/email"
import { generateWelcomeEmail } from "@/lib/email-templates"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { requestId, roleId } = body

    if (!requestId) {
      return NextResponse.json(
        { success: false, message: "requestId requis" },
        { status: 400 }
      )
    }

    // Si aucun roleId fourni, utiliser le rôle USER par défaut
    let finalRoleId = roleId
    if (!finalRoleId) {
      console.log("🔍 Aucun rôle fourni, recherche du rôle USER par défaut")
      const { data: defaultRole } = await supabase
        .from("roles")
        .select("id")
        .eq("code", "USER")
        .single()
      
      if (defaultRole) {
        finalRoleId = defaultRole.id
        console.log("✅ Rôle USER trouvé:", finalRoleId)
      } else {
        console.error("❌ Rôle USER non trouvé dans la base")
        return NextResponse.json(
          { success: false, message: "Rôle USER par défaut non trouvé" },
          { status: 500 }
        )
      }
    }

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
        { success: false, message: "Accès non autorisé" },
        { status: 403 }
      )
    }

    // Récupérer les détails des rôles
    const roleIds = userRoles.map(ur => ur.role_id)
    const { data: roles } = await supabase
      .from("roles")
      .select("id, code")
      .in("id", roleIds)

    const hasAdminRole = roles?.some(role => role.code === "ADMIN") || false

    if (!hasAdminRole) {
      return NextResponse.json(
        { success: false, message: "Accès non autorisé" },
        { status: 403 }
      )
    }

    // Récupérer la demande d'accès
    const { data: accessRequest, error: fetchError } = await supabase
      .from("access_requests")
      .select("*")
      .eq("id", requestId)
      .single()

    if (fetchError || !accessRequest) {
      return NextResponse.json(
        { success: false, message: "Demande d'accès non trouvée" },
        { status: 404 }
      )
    }

    if (accessRequest.statut !== "pending") {
      return NextResponse.json(
        { success: false, message: "Cette demande a déjà été traitée" },
        { status: 400 }
      )
    }

    // Générer un mot de passe temporaire
    const tempPassword = Math.random().toString(36).slice(-12) + "A1!"

    // Créer l'utilisateur dans Supabase Auth avec service_role
    console.log("🔍 Debug - Environment variables:")
    console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Présente" : "❌ Manquante")
    console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Présente" : "❌ Manquante")
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("❌ SUPABASE_SERVICE_ROLE_KEY manquante")
      return NextResponse.json(
        { success: false, message: "Configuration serveur manquante" },
        { status: 500 }
      )
    }
    
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Créer l'utilisateur dans Supabase Auth (ou récupérer s'il existe)
    let authUser
    try {
      // Essayer de créer l'utilisateur
      const { data: newUser, error: authError } = await serviceSupabase.auth.admin.createUser({
        email: accessRequest.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          prenom: accessRequest.prenom,
          nom: accessRequest.nom
        }
      })

      if (authError) {
        // Si l'erreur est "email_exists", récupérer l'utilisateur existant
        if (authError.message.includes("already been registered") || authError.message.includes("email_exists")) {
          console.log("✅ Utilisateur existe déjà, récupération...")
          
          // Lister les utilisateurs pour trouver celui avec cet email
          const { data: users, error: listError } = await serviceSupabase.auth.admin.listUsers()
          
          if (listError) {
            console.error("❌ Erreur lors de la récupération des utilisateurs:", listError)
            return NextResponse.json(
              { success: false, message: "Erreur lors de la récupération de l'utilisateur existant" },
              { status: 500 }
            )
          }
          
          const existingUser = users?.users?.find(user => user.email === accessRequest.email)
          
          if (!existingUser) {
            console.error("❌ Utilisateur non trouvé malgré l'erreur email_exists")
            return NextResponse.json(
              { success: false, message: "Utilisateur non trouvé" },
              { status: 500 }
            )
          }
          
          console.log("✅ Utilisateur existant récupéré:", existingUser.id)
          authUser = { user: existingUser }
        } else {
          console.error("❌ Erreur création utilisateur Auth:", authError)
          return NextResponse.json(
            { success: false, message: `Erreur lors de la création du compte: ${authError.message}` },
            { status: 500 }
          )
        }
      } else if (newUser && newUser.user) {
        console.log("✅ Nouvel utilisateur créé:", newUser.user.id)
        authUser = newUser
      } else {
        console.error("❌ Utilisateur non créé")
        return NextResponse.json(
          { success: false, message: "Erreur lors de la création de l'utilisateur" },
          { status: 500 }
        )
      }
    } catch (error) {
      console.error("❌ Erreur lors de la création/récupération:", error)
      return NextResponse.json(
        { success: false, message: "Erreur lors de la gestion de l'utilisateur" },
        { status: 500 }
      )
    }

    // Créer le profil utilisateur (ou mettre à jour s'il existe)
    const { error: profileError } = await supabase
      .from("app_users")
      .upsert({
        id: authUser.user.id,
        email: accessRequest.email,
        prenom: accessRequest.prenom,
        nom: accessRequest.nom,
        active: true,
        email_verified: true,
        force_pwd_change: true
      })

    if (profileError) {
      console.error("Erreur création/mise à jour profil:", profileError)
      return NextResponse.json(
        { success: false, message: "Erreur lors de la création/mise à jour du profil" },
        { status: 500 }
      )
    }

    // Assigner le rôle (ou mettre à jour s'il existe)
    console.log("🎭 Assignation du rôle:", { userId: authUser.user.id, roleId: finalRoleId })
    
    const { error: roleError } = await supabase
      .from("user_roles")
      .upsert({
        user_id: authUser.user.id,
        role_id: finalRoleId
      })

    if (roleError) {
      console.error("❌ Erreur assignation rôle:", roleError)
      console.error("❌ Détails erreur:", JSON.stringify(roleError, null, 2))
      // Ne pas faire échouer la création pour une erreur de rôle
    } else {
      console.log("✅ Rôle assigné avec succès")
    }

    // Mettre à jour le statut de la demande
    const { error: updateError } = await supabase
      .from("access_requests")
      .update({
        statut: "approved",
        processed_at: new Date().toISOString(),
        processed_by: user.id
      })
      .eq("id", requestId)

    if (updateError) {
      console.error("Erreur mise à jour demande:", updateError)
      // Ne pas faire échouer pour cette erreur
    }

    // Générer l'email de bienvenue avec le template personnalisé
    const welcomeEmailTemplate = generateWelcomeEmail({
      prenom: accessRequest.prenom,
      nom: accessRequest.nom,
      email: accessRequest.email,
      temporaryPassword: tempPassword,
      loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://operaflow-ten.vercel.app'}/auth/login`
    })

    // Envoyer l'email de bienvenue
    try {
      console.log("📧 Envoi de l'email de bienvenue à:", accessRequest.email)
      
      // Test avec console.log pour debug
      console.log("📧 Email à envoyer:", {
        to: accessRequest.email,
        subject: welcomeEmailTemplate.subject,
        preview: welcomeEmailTemplate.html.substring(0, 200) + "..."
      })
      
      await sendEmail(welcomeEmailTemplate)
      console.log("✅ Email envoyé avec succès")
    } catch (emailError) {
      console.error("❌ Erreur envoi email:", emailError)
      console.log("⚠️ Email non envoyé mais compte créé quand même")
      // Ne pas faire échouer la création pour une erreur d'email
    }

    return NextResponse.json({
      success: true,
      message: "Compte créé avec succès",
      userId: authUser.user.id
    })

  } catch (error) {
    console.error("Erreur dans approve-access-request:", error)
    return NextResponse.json(
      { success: false, message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}