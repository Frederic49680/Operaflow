// Test direct SendGrid SMTP
const nodemailer = require('nodemailer')

async function testSendGridSMTP() {
  console.log('🧪 Test SMTP SendGrid direct...')
  
  // Configuration SMTP SendGrid
  const transporter = nodemailer.createTransporter({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false, // true pour 465, false pour autres ports
    auth: {
      user: 'apikey', // Utilisateur fixe pour SendGrid
      pass: 'YOUR_SENDGRID_API_KEY' // Remplacez par votre vraie clé API
    }
  })
  
  // Email de test
  const mailOptions = {
    from: 'noreply@operaflow.com',
    to: 'frederic.baudry@outlook.fr',
    subject: '🧪 Test SMTP SendGrid Direct',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 2rem; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">🏭 OperaFlow</h1>
          <p style="margin: 0.5rem 0 0 0;">Test SMTP SendGrid Direct</p>
        </div>
        
        <div style="background: white; padding: 2rem; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2>Bonjour Fred Baudry,</h2>
          
          <p>Ceci est un test direct de l'envoi SMTP via SendGrid.</p>
          
          <div style="background: #f8fafc; padding: 1rem; border-radius: 6px; margin: 1rem 0;">
            <p><strong>Email :</strong> frederic.baudry@outlook.fr</p>
            <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 1rem; border-radius: 6px; margin: 1rem 0;">
            <p style="margin: 0; color: #92400e;"><strong>✅ Si vous recevez cet email, SMTP SendGrid fonctionne !</strong></p>
          </div>
        </div>
      </div>
    `,
    text: `
Test SMTP SendGrid Direct

Bonjour Fred Baudry,

Ceci est un test direct de l'envoi SMTP via SendGrid.

Email : frederic.baudry@outlook.fr
Date : ${new Date().toLocaleString('fr-FR')}

✅ Si vous recevez cet email, SMTP SendGrid fonctionne !

Cordialement,
L'équipe OperaFlow
    `
  }
  
  try {
    console.log('📧 Envoi de l\'email...')
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Email envoyé avec succès !')
    console.log('📊 Message ID:', info.messageId)
    console.log('📧 Réponse:', info.response)
  } catch (error) {
    console.error('❌ Erreur SMTP:', error)
    console.log('🔍 Détails:', {
      code: error.code,
      command: error.command,
      response: error.response
    })
  }
}

// Instructions
console.log('📋 Instructions :')
console.log('1. Remplacez YOUR_SENDGRID_API_KEY par votre vraie clé API')
console.log('2. Installez nodemailer : npm install nodemailer')
console.log('3. Lancez le test : node test_sendgrid_smtp.js')
console.log('')

testSendGridSMTP()
