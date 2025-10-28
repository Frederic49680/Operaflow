// Script de test pour envoyer un email directement
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rrmvejpwbkwlmyjhnxaz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDc5MzU0MSwiZXhwIjoyMDc2MzY5NTQxfQ.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'

const supabase = createClient(supabaseUrl, supabaseKey)

// Template email OperaFlow (version simplifiée)
const OPERAFLOW_EMAIL_TEMPLATE = `
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
            <h1>🧪 Test Email</h1>
            <p>Configuration SMTP SendGrid</p>
        </div>
        
        <div class="content">
            <div style="font-size: 18px; margin-bottom: 30px;">
                Bonjour <strong>Fred Baudry</strong>,<br><br>
                Ceci est un email de test pour vérifier que la configuration SMTP SendGrid fonctionne correctement.
            </div>
            
            <div class="credentials">
                <h3 style="color: #1e40af; margin: 0 0 15px 0;">🔐 Informations de test</h3>
                <div class="credential-item">
                    <span class="credential-label">📧 Email :</span>
                    <span class="credential-value">frederic.baudry@outlook.fr</span>
                </div>
                <div class="credential-item">
                    <span class="credential-label">🔑 Mot de passe :</span>
                    <span class="credential-value">Test123!</span>
                </div>
            </div>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <strong>✅ Si vous recevez cet email, la configuration SMTP fonctionne parfaitement !</strong>
            </div>
            
            <div style="text-align: center;">
                <a href="https://operaflow-ten.vercel.app/auth/login" class="cta-button">
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
                Test de configuration SMTP SendGrid
            </p>
        </div>
    </div>
</body>
</html>
`

async function testEmailSend() {
  console.log('🧪 Test d\'envoi d\'email OperaFlow...')
  console.log('📧 Destinataire: frederic.baudry@outlook.fr')
  console.log('📅 Date:', new Date().toLocaleString('fr-FR'))
  
  try {
    // Test avec la fonction RPC send_custom_email
    const { data, error } = await supabase.rpc('send_custom_email', {
      p_to_email: 'frederic.baudry@outlook.fr',
      p_subject: '🧪 Test OperaFlow - Configuration SMTP SendGrid',
      p_html_content: OPERAFLOW_EMAIL_TEMPLATE,
      p_text_content: `
Test Email OperaFlow

Bonjour Fred Baudry,

Ceci est un email de test pour vérifier que la configuration SMTP SendGrid fonctionne correctement.

Informations de test :
- Email : frederic.baudry@outlook.fr
- Mot de passe : Test123!

✅ Si vous recevez cet email, la configuration SMTP fonctionne parfaitement !

Date du test : ${new Date().toLocaleString('fr-FR')}

Cordialement,
L'équipe OperaFlow
      `
    })

    if (error) {
      console.error('❌ Erreur envoi email:', error)
      console.log('🔍 Détails de l\'erreur:', JSON.stringify(error, null, 2))
    } else {
      console.log('✅ Email envoyé avec succès !')
      console.log('📊 Résultat:', data)
      console.log('📧 Vérifiez votre boîte mail (et les spams)')
    }
  } catch (err) {
    console.error('❌ Erreur générale:', err)
  }
}

// Lancer le test
testEmailSend()
