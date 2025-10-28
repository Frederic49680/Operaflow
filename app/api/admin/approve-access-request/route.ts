import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { requestId, roleId } = body

    if (!requestId || !roleId) {
      return NextResponse.json(
        { success: false, message: "requestId et roleId requis" },
        { status: 400 }
      )
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
    
    // Vérifier si l'utilisateur existe déjà dans Auth
    let authUser
    try {
      const { data: existingUser, error: getUserError } = await serviceSupabase.auth.admin.getUserByEmail(accessRequest.email)
      
      if (getUserError && getUserError.status !== 404) {
        console.error("❌ Erreur vérification utilisateur existant:", getUserError)
        return NextResponse.json(
          { success: false, message: `Erreur lors de la vérification: ${getUserError.message}` },
          { status: 500 }
        )
      }
      
      if (existingUser && existingUser.user) {
        console.log("✅ Utilisateur existe déjà dans Auth:", existingUser.user.id)
        authUser = existingUser
      } else {
        // Créer l'utilisateur dans Supabase Auth
        console.log("🆕 Création nouvel utilisateur Auth...")
        const { data: newUser, error: authError } = await serviceSupabase.auth.admin.createUser({
          email: accessRequest.email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            prenom: accessRequest.prenom,
            nom: accessRequest.nom
          }
        })

        if (authError || !newUser.user) {
          console.error("❌ Erreur création utilisateur Auth:", authError)
          return NextResponse.json(
            { success: false, message: `Erreur lors de la création du compte: ${authError?.message}` },
            { status: 500 }
          )
        }
        
        console.log("✅ Nouvel utilisateur créé:", newUser.user.id)
        authUser = newUser
      }
    } catch (error) {
      console.error("❌ Erreur lors de la vérification/création:", error)
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
    const { error: roleError } = await supabase
      .from("user_roles")
      .upsert({
        user_id: authUser.user.id,
        role_id: roleId
      })

    if (roleError) {
      console.error("Erreur assignation rôle:", roleError)
      // Ne pas faire échouer la création pour une erreur de rôle
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

    // Envoyer un email de bienvenue avec le mot de passe temporaire
    const welcomeEmailTemplate = {
      to: accessRequest.email,
      subject: "🎉 Votre compte OperaFlow a été créé !",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 2rem; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 2rem;">🎉 Bienvenue sur OperaFlow !</h1>
            <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Votre compte a été créé avec succès</p>
          </div>
          
          <div style="background: white; padding: 2rem; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #1e293b; margin-top: 0;">📋 Vos informations de connexion</h2>
            
            <div style="background: #f8fafc; padding: 1rem; border-radius: 6px; margin: 1rem 0;">
              <p style="margin: 0;"><strong>Email :</strong> ${accessRequest.email}</p>
              <p style="margin: 0;"><strong>Mot de passe temporaire :</strong> <code style="background: #e2e8f0; padding: 0.25rem 0.5rem; border-radius: 4px;">${tempPassword}</code></p>
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 1rem; border-radius: 6px; margin: 1rem 0;">
              <p style="margin: 0; color: #92400e;"><strong>⚠️ Important :</strong> Vous devrez changer ce mot de passe lors de votre première connexion.</p>
            </div>
            
            <div style="text-align: center; margin: 2rem 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/login" 
                 style="background: #3b82f6; color: white; padding: 0.75rem 2rem; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                Se connecter maintenant
              </a>
            </div>
            
            <p style="color: #64748b; font-size: 0.9rem; margin-top: 2rem;">
              Si vous avez des questions, n'hésitez pas à contacter votre administrateur.
            </p>
          </div>
        </div>
      `,
      text: `
        Bienvenue sur OperaFlow !
        
        Votre compte a été créé avec succès.
        
        Email : ${accessRequest.email}
        Mot de passe temporaire : ${tempPassword}
        
        IMPORTANT : Vous devrez changer ce mot de passe lors de votre première connexion.
        
        Lien de connexion : ${process.env.NEXT_PUBLIC_APP_URL}/auth/login
        
        Cordialement,
        L'équipe OperaFlow
      `
    }

    await sendEmail(welcomeEmailTemplate)

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