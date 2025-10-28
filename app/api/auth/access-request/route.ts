import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    // Utiliser le client anonyme pour permettre la création de demandes d'accès
    const supabase = createClient({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    })
    const body = await request.json()
    const { email, prenom, nom, message } = body

    if (!email || !prenom || !nom) {
      return NextResponse.json(
        { success: false, message: "Email, prénom et nom requis" },
        { status: 400 }
      )
    }

    // Vérifier si une demande existe déjà pour cet email
    const { data: existingRequest } = await supabase
      .from("access_requests")
      .select("id, statut")
      .eq("email", email)
      .single()

    if (existingRequest) {
      if (existingRequest.statut === "pending") {
        return NextResponse.json(
          { success: false, message: "Une demande est déjà en cours pour cet email" },
          { status: 409 }
        )
      }
      if (existingRequest.statut === "approved") {
        return NextResponse.json(
          { success: false, message: "Un compte existe déjà pour cet email" },
          { status: 409 }
        )
      }
    }

    // Créer la demande d'accès
    const { data: requestData, error: requestError } = await supabase
      .from("access_requests")
      .insert({
        email,
        prenom,
        nom,
        message: message || "Demande d'accès à OperaFlow",
        statut: "pending",
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (requestError) {
      console.error("Erreur création demande:", requestError)
      return NextResponse.json(
        { success: false, message: "Erreur lors de la création de la demande" },
        { status: 500 }
      )
    }

    // Envoyer un email de notification à l'administrateur
    const adminEmailTemplate = {
      to: process.env.ADMIN_EMAIL || "admin@operaflow.com",
      subject: "🔔 Nouvelle demande d'accès OperaFlow",
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nouvelle demande d'accès</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .info-box { background: #e9ecef; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Nouvelle demande d'accès</h1>
              <p>OperaFlow - Administration</p>
            </div>
            
            <div class="content">
              <h2>Bonjour Administrateur,</h2>
              
              <p>Une nouvelle demande d'accès a été soumise pour OperaFlow.</p>
              
              <div class="info-box">
                <h3>📋 Informations du demandeur :</h3>
                <p><strong>Nom :</strong> ${prenom} ${nom}</p>
                <p><strong>Email :</strong> ${email}</p>
                <p><strong>Message :</strong> ${message || "Aucun message"}</p>
                <p><strong>Date de demande :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
                <p><strong>ID Demande :</strong> ${requestData.id}</p>
              </div>
              
              <p>Pour traiter cette demande :</p>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/access-requests" class="button">
                  🚀 Gérer les demandes d'accès
                </a>
              </div>
              
              <p><strong>Ou copiez ce lien dans votre navigateur :</strong><br>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/access-requests">${process.env.NEXT_PUBLIC_APP_URL}/admin/access-requests</a></p>
              
              <p>Cordialement,<br>
              <strong>Le système OperaFlow</strong></p>
            </div>
            
            <div class="footer">
              <p>Cet email a été envoyé automatiquement par OperaFlow</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Nouvelle demande d'accès OperaFlow
        
        Bonjour Administrateur,
        
        Une nouvelle demande d'accès a été soumise :
        
        Nom : ${prenom} ${nom}
        Email : ${email}
        Message : ${message || "Aucun message"}
        Date : ${new Date().toLocaleDateString('fr-FR')}
        ID Demande : ${requestData.id}
        
        Lien pour traiter la demande : ${process.env.NEXT_PUBLIC_APP_URL}/admin/access-requests
        
        Cordialement,
        Le système OperaFlow
      `
    }

    await sendEmail(adminEmailTemplate)

    return NextResponse.json({
      success: true,
      message: "Demande d'accès envoyée avec succès",
      requestId: requestData.id
    })

  } catch (error) {
    console.error("Erreur dans access-request:", error)
    return NextResponse.json(
      { success: false, message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
