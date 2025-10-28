// Service d'envoi d'emails pour l'application
import { createClient } from '@/lib/supabase/client'

export interface EmailTemplate {
  to: string
  subject: string
  html: string
  text?: string
}

export interface UserActivationEmail {
  to: string
  prenom?: string
  nom?: string
  activationLink: string
  temporaryPassword: string
}

export interface PasswordResetEmail {
  to: string
  prenom?: string
  nom?: string
  resetLink: string
}

// Template HTML pour l'activation d'utilisateur
export function createUserActivationTemplate(data: UserActivationEmail): EmailTemplate {
  const { to, prenom, nom, activationLink, temporaryPassword } = data
  const displayName = prenom && nom ? `${prenom} ${nom}` : prenom || 'Utilisateur'
  
  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Activation de votre compte OperaFlow</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .credentials { background: #e9ecef; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Bienvenue sur OperaFlow</h1>
          <p>Votre compte a été créé avec succès</p>
        </div>
        
        <div class="content">
          <h2>Bonjour ${displayName},</h2>
          
          <p>Votre compte OperaFlow a été créé avec succès ! Vous pouvez maintenant accéder à la plateforme de gestion opérationnelle.</p>
          
          <div class="credentials">
            <h3>🔐 Vos identifiants temporaires :</h3>
            <p><strong>Email :</strong> ${to}</p>
            <p><strong>Mot de passe temporaire :</strong> <code style="background: #f1f3f4; padding: 4px 8px; border-radius: 3px;">${temporaryPassword}</code></p>
          </div>
          
          <div class="warning">
            <strong>⚠️ Important :</strong> Vous devrez changer ce mot de passe lors de votre première connexion.
          </div>
          
          <p>Pour activer votre compte et vous connecter :</p>
          
          <div style="text-align: center;">
            <a href="${activationLink}" class="button">🚀 Activer mon compte</a>
          </div>
          
          <p><strong>Ou copiez ce lien dans votre navigateur :</strong><br>
          <a href="${activationLink}">${activationLink}</a></p>
          
          <p>Ce lien d'activation est valide pendant <strong>48 heures</strong>.</p>
          
          <h3>📋 Prochaines étapes :</h3>
          <ol>
            <li>Cliquez sur le lien d'activation ci-dessus</li>
            <li>Connectez-vous avec vos identifiants temporaires</li>
            <li>Changez votre mot de passe</li>
            <li>Explorez la plateforme OperaFlow !</li>
          </ol>
          
          <p>Si vous avez des questions, n'hésitez pas à contacter l'administrateur.</p>
          
          <p>Cordialement,<br>
          <strong>L'équipe OperaFlow</strong></p>
        </div>
        
        <div class="footer">
          <p>Cet email a été envoyé automatiquement par OperaFlow</p>
          <p>Si vous n'avez pas demandé ce compte, vous pouvez ignorer cet email.</p>
        </div>
      </div>
    </body>
    </html>
  `
  
  const text = `
    Bienvenue sur OperaFlow !
    
    Bonjour ${displayName},
    
    Votre compte OperaFlow a été créé avec succès.
    
    Identifiants temporaires :
    - Email : ${to}
    - Mot de passe : ${temporaryPassword}
    
    Lien d'activation : ${activationLink}
    
    IMPORTANT : Vous devrez changer ce mot de passe lors de votre première connexion.
    Ce lien est valide pendant 48 heures.
    
    Cordialement,
    L'équipe OperaFlow
  `
  
  return {
    to,
    subject: '🎉 Activation de votre compte OperaFlow',
    html,
    text
  }
}

// Template HTML pour la réinitialisation de mot de passe
export function createPasswordResetTemplate(data: PasswordResetEmail): EmailTemplate {
  const { to, prenom, nom, resetLink } = data
  const displayName = prenom && nom ? `${prenom} ${nom}` : prenom || 'Utilisateur'
  
  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Réinitialisation de votre mot de passe OperaFlow</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔒 Réinitialisation de mot de passe</h1>
          <p>Demande de réinitialisation pour OperaFlow</p>
        </div>
        
        <div class="content">
          <h2>Bonjour ${displayName},</h2>
          
          <p>Vous avez demandé la réinitialisation de votre mot de passe OperaFlow.</p>
          
          <div class="warning">
            <strong>⚠️ Important :</strong> Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
          </div>
          
          <p>Pour créer un nouveau mot de passe :</p>
          
          <div style="text-align: center;">
            <a href="${resetLink}" class="button">🔑 Réinitialiser mon mot de passe</a>
          </div>
          
          <p><strong>Ou copiez ce lien dans votre navigateur :</strong><br>
          <a href="${resetLink}">${resetLink}</a></p>
          
          <p>Ce lien de réinitialisation est valide pendant <strong>1 heure</strong>.</p>
          
          <h3>📋 Instructions :</h3>
          <ol>
            <li>Cliquez sur le lien ci-dessus</li>
            <li>Choisissez un nouveau mot de passe sécurisé</li>
            <li>Confirmez votre nouveau mot de passe</li>
            <li>Connectez-vous avec vos nouveaux identifiants</li>
          </ol>
          
          <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.</p>
          
          <p>Cordialement,<br>
          <strong>L'équipe OperaFlow</strong></p>
        </div>
        
        <div class="footer">
          <p>Cet email a été envoyé automatiquement par OperaFlow</p>
          <p>Pour votre sécurité, ce lien expirera dans 1 heure.</p>
        </div>
      </div>
    </body>
    </html>
  `
  
  const text = `
    Réinitialisation de mot de passe OperaFlow
    
    Bonjour ${displayName},
    
    Vous avez demandé la réinitialisation de votre mot de passe.
    
    Lien de réinitialisation : ${resetLink}
    
    IMPORTANT : Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
    Ce lien est valide pendant 1 heure.
    
    Cordialement,
    L'équipe OperaFlow
  `
  
  return {
    to,
    subject: '🔒 Réinitialisation de votre mot de passe OperaFlow',
    html,
    text
  }
}

// Fonction pour générer un mot de passe temporaire
export function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let password = ''
  
  // Assurer au moins un caractère de chaque type
  password += 'ABCDEFGHJKMNPQRSTUVWXYZ'[Math.floor(Math.random() * 23)] // Majuscule
  password += 'abcdefghijkmnpqrstuvwxyz'[Math.floor(Math.random() * 23)] // Minuscule
  password += '23456789'[Math.floor(Math.random() * 8)] // Chiffre
  
  // Compléter avec des caractères aléatoires
  for (let i = 3; i < 12; i++) {
    password += chars[Math.floor(Math.random() * chars.length)]
  }
  
  // Mélanger le mot de passe
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

// Fonction pour générer un token d'activation
export function generateActivationToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Fonction pour générer un token de réinitialisation
export function generateResetToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Fonction pour créer un lien d'activation
export function createActivationLink(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://operaflow-kappa.vercel.app'
  return `${baseUrl}/auth/activate?token=${token}`
}

// Fonction pour créer un lien de réinitialisation
export function createResetLink(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://operaflow-kappa.vercel.app'
  return `${baseUrl}/auth/reset?token=${token}`
}

// Fonction principale d'envoi d'email avec Supabase
export async function sendEmail(template: EmailTemplate): Promise<boolean> {
  try {
    console.log('📧 Envoi d\'email:', {
      to: template.to,
      subject: template.subject,
      hasHtml: !!template.html,
      hasText: !!template.text
    })
    
    // Utiliser Supabase pour logger l'email
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    
    const { error } = await supabase.rpc('send_custom_email', {
      p_to_email: template.to,
      p_subject: template.subject,
      p_html_content: template.html,
      p_text_content: template.text || ''
    })
    
    if (error) {
      console.error('❌ Erreur Supabase email:', error)
      return false
    }
    
    console.log('✅ Email envoyé avec succès via Supabase')
    return true
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error)
    return false
  }
}

// Fonction pour envoyer l'email d'activation
export async function sendUserActivationEmail(userData: {
  email: string
  prenom?: string
  nom?: string
}): Promise<{ success: boolean; temporaryPassword?: string; activationToken?: string }> {
  try {
    const temporaryPassword = generateTemporaryPassword()
    const activationToken = generateActivationToken()
    const activationLink = createActivationLink(activationToken)
    
    const template = createUserActivationTemplate({
      to: userData.email,
      prenom: userData.prenom,
      nom: userData.nom,
      activationLink,
      temporaryPassword
    })
    
    const emailSent = await sendEmail(template)
    
    if (emailSent) {
      // Ici vous pourriez sauvegarder le token en base de données
      console.log('💾 Token d\'activation généré:', activationToken)
      console.log('🔐 Mot de passe temporaire:', temporaryPassword)
      
      return {
        success: true,
        temporaryPassword,
        activationToken
      }
    }
    
    return { success: false }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email d\'activation:', error)
    return { success: false }
  }
}

// Fonction pour envoyer l'email de réinitialisation
export async function sendPasswordResetEmail(userData: {
  email: string
  prenom?: string
  nom?: string
}): Promise<{ success: boolean; resetToken?: string }> {
  try {
    const resetToken = generateResetToken()
    const resetLink = createResetLink(resetToken)
    
    const template = createPasswordResetTemplate({
      to: userData.email,
      prenom: userData.prenom,
      nom: userData.nom,
      resetLink
    })
    
    const emailSent = await sendEmail(template)
    
    if (emailSent) {
      // Ici vous pourriez sauvegarder le token en base de données
      console.log('💾 Token de réinitialisation généré:', resetToken)
      
      return {
        success: true,
        resetToken
      }
    }
    
    return { success: false }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email de réinitialisation:', error)
    return { success: false }
  }
}
