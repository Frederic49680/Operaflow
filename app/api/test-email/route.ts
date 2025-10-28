import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateWelcomeEmail } from "@/lib/email-templates"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 Test d'envoi d'email OperaFlow...")
    
    // Données de test
    const testData = {
      prenom: "Fred",
      nom: "Baudry", 
      email: "frederic.baudry@outlook.fr",
      temporaryPassword: "Test123!",
      loginUrl: "https://operaflow-ten.vercel.app/auth/login"
    }
    
    console.log("📧 Données de test:", testData)
    
    // Générer l'email avec le template personnalisé
    const emailTemplate = generateWelcomeEmail(testData)
    
    console.log("📧 Template généré:", {
      to: emailTemplate.to,
      subject: emailTemplate.subject,
      hasHtml: !!emailTemplate.html,
      hasText: !!emailTemplate.text
    })
    
    // Envoyer l'email
    try {
      const emailSent = await sendEmail(emailTemplate)
      
      if (emailSent) {
        console.log("✅ Email envoyé avec succès !")
        return NextResponse.json({
          success: true,
          message: "Email de test envoyé avec succès",
          recipient: testData.email,
          template: "OperaFlow personnalisé"
        })
      } else {
        console.log("❌ Échec envoi email")
        return NextResponse.json({
          success: false,
          message: "Échec de l'envoi d'email",
          recipient: testData.email
        }, { status: 500 })
      }
    } catch (emailError) {
      console.error("❌ Erreur envoi email:", emailError)
      return NextResponse.json({
        success: false,
        message: "Erreur lors de l'envoi d'email",
        error: emailError instanceof Error ? emailError.message : String(emailError)
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error("❌ Erreur générale:", error)
    return NextResponse.json({
      success: false,
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Endpoint de test email OperaFlow",
    usage: "POST pour envoyer un email de test",
    recipient: "frederic.baudry@outlook.fr"
  })
}
