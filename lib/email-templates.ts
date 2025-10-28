// Template email personnalisé pour OperaFlow
export const OPERAFLOW_EMAIL_TEMPLATE = {
  // Template pour création de compte
  accountCreated: (data: {
    prenom: string
    nom: string
    email: string
    temporaryPassword: string
    loginUrl: string
  }) => `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenue sur OperaFlow</title>
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
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 40px 30px;
        }
        .welcome {
            font-size: 18px;
            margin-bottom: 30px;
        }
        .credentials {
            background: #f8fafc;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
        }
        .credentials h3 {
            color: #1e40af;
            margin: 0 0 15px 0;
            font-size: 16px;
            display: flex;
            align-items: center;
        }
        .credentials h3::before {
            content: "🔐";
            margin-right: 8px;
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
        .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
        }
        .warning strong {
            color: #92400e;
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
            transition: transform 0.2s;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer p {
            margin: 0;
            color: #6b7280;
            font-size: 14px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .steps {
            background: #f0f9ff;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
        }
        .steps h3 {
            color: #0369a1;
            margin: 0 0 15px 0;
        }
        .step {
            margin: 10px 0;
            display: flex;
            align-items: center;
        }
        .step-number {
            background: #3b82f6;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            margin-right: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🏭 OperaFlow</div>
            <h1>Bienvenue dans l'équipe !</h1>
            <p>Votre compte a été créé avec succès</p>
        </div>
        
        <div class="content">
            <div class="welcome">
                Bonjour <strong>${data.prenom} ${data.nom}</strong>,<br><br>
                Félicitations ! Votre compte OperaFlow a été créé avec succès. Vous avez maintenant accès à notre plateforme de gestion opérationnelle.
            </div>
            
            <div class="credentials">
                <h3>Vos identifiants temporaires</h3>
                <div class="credential-item">
                    <span class="credential-label">📧 Email :</span>
                    <span class="credential-value">${data.email}</span>
                </div>
                <div class="credential-item">
                    <span class="credential-label">🔑 Mot de passe :</span>
                    <span class="credential-value">${data.temporaryPassword}</span>
                </div>
            </div>
            
            <div class="warning">
                <strong>⚠️ Important :</strong> Ce mot de passe est temporaire. Vous devrez le changer lors de votre première connexion pour des raisons de sécurité.
            </div>
            
            <div class="steps">
                <h3>🚀 Prochaines étapes</h3>
                <div class="step">
                    <div class="step-number">1</div>
                    <span>Cliquez sur le bouton ci-dessous pour vous connecter</span>
                </div>
                <div class="step">
                    <div class="step-number">2</div>
                    <span>Changez votre mot de passe temporaire</span>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <span>Explorez les modules disponibles selon votre rôle</span>
                </div>
            </div>
            
            <div style="text-align: center;">
                <a href="${data.loginUrl}" class="cta-button">
                    🚀 Se connecter maintenant
                </a>
            </div>
            
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                <strong>Ou copiez ce lien dans votre navigateur :</strong><br>
                <a href="${data.loginUrl}" style="color: #3b82f6;">${data.loginUrl}</a>
            </p>
        </div>
        
        <div class="footer">
            <p>
                <strong>OperaFlow</strong> - Plateforme de gestion opérationnelle<br>
                Si vous avez des questions, contactez votre administrateur.
            </p>
        </div>
    </div>
</body>
</html>
  `,

  // Template pour réinitialisation de mot de passe
  passwordReset: (data: {
    prenom: string
    nom: string
    resetUrl: string
  }) => `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Réinitialisation de mot de passe - OperaFlow</title>
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
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
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
        .warning {
            background: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 20px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
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
            <h1>🔒 Réinitialisation de mot de passe</h1>
        </div>
        
        <div class="content">
            <p>Bonjour <strong>${data.prenom} ${data.nom}</strong>,</p>
            
            <p>Vous avez demandé une réinitialisation de votre mot de passe OperaFlow.</p>
            
            <div class="warning">
                <strong>⚠️ Important :</strong> Ce lien est valide pendant 1 heure seulement. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
            </div>
            
            <div style="text-align: center;">
                <a href="${data.resetUrl}" class="cta-button">
                    🔑 Réinitialiser mon mot de passe
                </a>
            </div>
            
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                <strong>Ou copiez ce lien dans votre navigateur :</strong><br>
                <a href="${data.resetUrl}" style="color: #ef4444;">${data.resetUrl}</a>
            </p>
        </div>
        
        <div class="footer">
            <p>
                <strong>OperaFlow</strong> - Plateforme de gestion opérationnelle<br>
                Si vous avez des questions, contactez votre administrateur.
            </p>
        </div>
    </div>
</body>
</html>
  `
}

// Fonction pour générer l'email de bienvenue
export function generateWelcomeEmail(data: {
  prenom: string
  nom: string
  email: string
  temporaryPassword: string
  loginUrl?: string
}) {
  const loginUrl = data.loginUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://operaflow-ten.vercel.app'}/auth/login`
  
  return {
    to: data.email,
    subject: "🎉 Bienvenue sur OperaFlow - Votre compte a été créé !",
    html: OPERAFLOW_EMAIL_TEMPLATE.accountCreated({
      ...data,
      loginUrl
    }),
    text: `
Bonjour ${data.prenom} ${data.nom},

Félicitations ! Votre compte OperaFlow a été créé avec succès.

Vos identifiants temporaires :
- Email : ${data.email}
- Mot de passe : ${data.temporaryPassword}

⚠️ Important : Vous devrez changer ce mot de passe lors de votre première connexion.

Pour vous connecter : ${loginUrl}

Cordialement,
L'équipe OperaFlow
    `
  }
}

// Fonction pour générer l'email de réinitialisation
export function generatePasswordResetEmail(data: {
  prenom: string
  nom: string
  email: string
  resetUrl: string
}) {
  return {
    to: data.email,
    subject: "🔒 Réinitialisation de mot de passe - OperaFlow",
    html: OPERAFLOW_EMAIL_TEMPLATE.passwordReset(data),
    text: `
Bonjour ${data.prenom} ${data.nom},

Vous avez demandé une réinitialisation de votre mot de passe OperaFlow.

⚠️ Ce lien est valide pendant 1 heure seulement.

Pour réinitialiser votre mot de passe : ${data.resetUrl}

Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

Cordialement,
L'équipe OperaFlow
    `
  }
}
