import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { requestId, rejectionReason } = body

    if (!requestId || !rejectionReason) {
      return NextResponse.json(
        { success: false, message: "ID de demande et raison du rejet requis" },
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

    // Mettre à jour la demande comme rejetée
    const { error: updateError } = await supabase
      .from("access_requests")
      .update({
        statut: "rejected",
        rejection_reason: rejectionReason,
        processed_at: new Date().toISOString()
      })
      .eq("id", requestId)

    if (updateError) {
      console.error("Erreur mise à jour demande:", updateError)
      return NextResponse.json(
        { success: false, message: "Erreur lors de la mise à jour de la demande" },
        { status: 500 }
      )
    }

    // Envoyer un email de notification au demandeur
    const rejectionEmailTemplate = {
      to: requestData.email,
      subject: "❌ Demande d'accès OperaFlow - Rejetée",
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Demande d'accès rejetée</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .reason-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Demande d'accès rejetée</h1>
              <p>OperaFlow - Notification</p>
            </div>
            
            <div class="content">
              <h2>Bonjour ${requestData.prenom} ${requestData.nom},</h2>
              
              <p>Nous vous informons que votre demande d'accès à OperaFlow a été rejetée.</p>
              
              <div class="reason-box">
                <h3>📋 Raison du rejet :</h3>
                <p>${rejectionReason}</p>
              </div>
              
              <p>Si vous pensez qu'il s'agit d'une erreur ou si vous souhaitez plus d'informations, n'hésitez pas à contacter l'administrateur.</p>
              
              <p>Cordialement,<br>
              <strong>L'équipe OperaFlow</strong></p>
            </div>
            
            <div class="footer">
              <p>Cet email a été envoyé automatiquement par OperaFlow</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Demande d'accès OperaFlow - Rejetée
        
        Bonjour ${requestData.prenom} ${requestData.nom},
        
        Nous vous informons que votre demande d'accès à OperaFlow a été rejetée.
        
        Raison du rejet : ${rejectionReason}
        
        Si vous pensez qu'il s'agit d'une erreur, contactez l'administrateur.
        
        Cordialement,
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
