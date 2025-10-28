import { NextRequest, NextResponse } from "next/server"
import { generateWelcomeEmail } from "@/lib/email-templates"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const recipientEmail = body.recipient || "frederic.baudry@outlook.fr"

    const tempPassword = "TempPassword123!" // For testing
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://operaflow-ten.vercel.app'}/auth/login`

    const welcomeEmailTemplate = generateWelcomeEmail({
      prenom: "Test",
      nom: "User",
      email: recipientEmail,
      temporaryPassword: tempPassword,
      loginUrl: loginUrl,
    })

    // Appel à l'API SendGrid interne
    const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://operaflow-ten.vercel.app'}/api/sendgrid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: recipientEmail,
        subject: welcomeEmailTemplate.subject,
        html: welcomeEmailTemplate.html,
        text: welcomeEmailTemplate.text
      })
    })

    if (emailResponse.ok) {
      return NextResponse.json({
        success: true,
        message: "Email de test envoyé via SendGrid",
        recipient: recipientEmail
      }, { status: 200 })
    } else {
      const errorText = await emailResponse.text()
      return NextResponse.json({
        success: false,
        message: "Erreur SendGrid",
        error: errorText
      }, { status: 500 })
    }

  } catch (error) {
    console.error("❌ Erreur test SendGrid:", error)
    return NextResponse.json({
      success: false,
      message: "Erreur lors du test SendGrid",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Endpoint de test SendGrid OperaFlow",
    usage: "POST pour envoyer un email de test via SendGrid",
    recipient: "frederic.baudry@outlook.fr"
  }, { status: 200 })
}
