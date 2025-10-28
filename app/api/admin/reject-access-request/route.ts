import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { requestId, reason } = body

    if (!requestId || !reason) {
      return NextResponse.json(
        { success: false, message: "requestId et reason requis" },
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
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("roles(code)")
      .eq("user_id", user.id)
      .eq("roles.code", "ADMIN")
      .single()

    if (!userRole) {
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

    // Mettre à jour le statut de la demande
    const { error: updateError } = await supabase
      .from("access_requests")
      .update({
        statut: "rejected",
        processed_at: new Date().toISOString(),
        processed_by: user.id,
        rejection_reason: reason
      })
      .eq("id", requestId)

    if (updateError) {
      console.error("Erreur mise à jour demande:", updateError)
      return NextResponse.json(
        { success: false, message: "Erreur lors de la mise à jour de la demande" },
        { status: 500 }
      )
    }

    // Envoyer un email de notification de rejet
    const rejectionEmailTemplate = {
      to: accessRequest.email,
      subject: "❌ Demande d'accès OperaFlow - Rejetée",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 2rem; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 2rem;">❌ Demande d'accès rejetée</h1>
            <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">Votre demande d'accès à OperaFlow</p>
          </div>
          
          <div style="background: white; padding: 2rem; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #1e293b; margin-top: 0;">📋 Détails de votre demande</h2>
            
            <div style="background: #f8fafc; padding: 1rem; border-radius: 6px; margin: 1rem 0;">
              <p style="margin: 0;"><strong>Nom :</strong> ${accessRequest.prenom} ${accessRequest.nom}</p>
              <p style="margin: 0;"><strong>Email :</strong> ${accessRequest.email}</p>
              <p style="margin: 0;"><strong>Date de demande :</strong> ${new Date(accessRequest.created_at).toLocaleDateString('fr-FR')}</p>
            </div>
            
            <div style="background: #fef2f2; border: 1px solid #fca5a5; padding: 1rem; border-radius: 6px; margin: 1rem 0;">
              <h3 style="color: #dc2626; margin-top: 0;">Motif du rejet :</h3>
              <p style="margin: 0; color: #7f1d1d;">${reason}</p>
            </div>
            
            <div style="background: #f0f9ff; border: 1px solid #7dd3fc; padding: 1rem; border-radius: 6px; margin: 1rem 0;">
              <p style="margin: 0; color: #0c4a6e;">
                <strong>💡 Que faire maintenant ?</strong><br>
                Si vous pensez que cette décision est injustifiée, vous pouvez contacter l'administrateur pour plus d'informations.
              </p>
            </div>
            
            <p style="color: #64748b; font-size: 0.9rem; margin-top: 2rem;">
              Merci de votre compréhension.
            </p>
          </div>
        </div>
      `,
      text: `
        Demande d'accès OperaFlow - Rejetée
        
        Votre demande d'accès à OperaFlow a été rejetée.
        
        Détails :
        - Nom : ${accessRequest.prenom} ${accessRequest.nom}
        - Email : ${accessRequest.email}
        - Date de demande : ${new Date(accessRequest.created_at).toLocaleDateString('fr-FR')}
        
        Motif du rejet : ${reason}
        
        Si vous pensez que cette décision est injustifiée, vous pouvez contacter l'administrateur.
        
        Merci de votre compréhension.
        L'équipe OperaFlow
      `
    }

    await sendEmail(rejectionEmailTemplate)

    return NextResponse.json({
      success: true,
      message: "Demande rejetée avec succès"
    })

  } catch (error) {
    console.error("Erreur dans reject-access-request:", error)
    return NextResponse.json(
      { success: false, message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}