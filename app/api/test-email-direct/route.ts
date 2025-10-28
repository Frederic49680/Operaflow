import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 Test d'envoi d'email OperaFlow via SendGrid direct...")
    
    // Données de test
    const testData = {
      prenom: "Fred",
      nom: "Baudry", 
      email: "frederic.baudry@outlook.fr",
      temporaryPassword: "Test123!",
      loginUrl: "https://operaflow-ten.vercel.app/auth/login"
    }
    
    console.log("📧 Données de test:", testData)
    
    // Template HTML OperaFlow
    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Email OperaFlow</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .content {
            padding: 40px 30px;
        }
        .credentials {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
        }
        .credential-item {
            margin: 12px 0;
            display: flex;
            align-items: center;
        }
        .credential-label {
            font-weight: 600;
            color: #374151;
            min-width: 120px;
        }
        .credential-value {
            background: #1f2937;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            margin-left: 10px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
        }
        .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">🏭 OperaFlow</div>
            <h1>🧪 Test Email SendGrid</h1>
            <p>Configuration SMTP Direct</p>
        </div>
        
        <div class="content">
            <div style="font-size: 18px; margin-bottom: 30px;">
                Bonjour <strong>${testData.prenom} ${testData.nom}</strong>,<br><br>
                Ceci est un email de test pour vérifier que la configuration SMTP SendGrid fonctionne correctement.
            </div>
            
            <div class="credentials">
                <h3 style="color: #1e40af; margin: 0 0 15px 0;">🔐 Informations de test</h3>
                <div class="credential-item">
                    <span class="credential-label">📧 Email :</span>
                    <span class="credential-value">${testData.email}</span>
                </div>
                <div class="credential-item">
                    <span class="credential-label">🔑 Mot de passe :</span>
                    <span class="credential-value">${testData.temporaryPassword}</span>
                </div>
            </div>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <strong>✅ Si vous recevez cet email, la configuration SMTP fonctionne parfaitement !</strong>
            </div>
            
            <div style="text-align: center;">
                <a href="${testData.loginUrl}" class="cta-button">
                    🚀 Se connecter maintenant
                </a>
            </div>
            
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                <strong>Date du test :</strong> ${new Date().toLocaleString('fr-FR')}
            </p>
        </div>
        
        <div class="footer">
            <p>
                <strong>OperaFlow</strong> - Plateforme de gestion opérationnelle<br>
                Test de configuration SMTP SendGrid Direct
            </p>
        </div>
    </div>
</body>
</html>
    `
    
    const textContent = `
Test Email OperaFlow

Bonjour ${testData.prenom} ${testData.nom},

Ceci est un email de test pour vérifier que la configuration SMTP SendGrid fonctionne correctement.

Informations de test :
- Email : ${testData.email}
- Mot de passe : ${testData.temporaryPassword}

✅ Si vous recevez cet email, la configuration SMTP fonctionne parfaitement !

Date du test : ${new Date().toLocaleString('fr-FR')}

Cordialement,
L'équipe OperaFlow
    `
    
    // Utiliser Supabase avec la fonction send_custom_email
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    console.log("📧 Envoi via Supabase send_custom_email...")
    
    const { data, error } = await supabase.rpc('send_custom_email', {
      p_to_email: testData.email,
      p_subject: '🧪 Test OperaFlow - SendGrid Direct',
      p_html_content: htmlContent,
      p_text_content: textContent
    })
    
    if (error) {
      console.error("❌ Erreur Supabase:", error)
      return NextResponse.json({
        success: false,
        message: "Erreur Supabase",
        error: error.message
      }, { status: 500 })
    }
    
    console.log("✅ Réponse Supabase:", data)
    
    return NextResponse.json({
      success: true,
      message: "Email de test envoyé via Supabase",
      recipient: testData.email,
      supabaseResponse: data
    })
    
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
    message: "Endpoint de test email OperaFlow - Version SendGrid Direct",
    usage: "POST pour envoyer un email de test",
    recipient: "frederic.baudry@outlook.fr",
    note: "Utilise la fonction send_custom_email de Supabase"
  })
}
