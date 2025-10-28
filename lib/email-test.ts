// Service d'envoi d'emails alternatif pour test
export interface EmailTemplate {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmailTest(template: EmailTemplate): Promise<boolean> {
  try {
    console.log('📧 Test envoi d\'email:', {
      to: template.to,
      subject: template.subject,
      hasHtml: !!template.html,
      hasText: !!template.text
    })
    
    // Option 1: Utiliser Resend (service email moderne)
    if (process.env.RESEND_API_KEY) {
      const resend = await import('resend')
      const resendClient = new resend.Resend(process.env.RESEND_API_KEY)
      
      const { data, error } = await resendClient.emails.send({
        from: 'OperaFlow <noreply@operaflow.com>',
        to: template.to,
        subject: template.subject,
        html: template.html,
        text: template.text
      })
      
      if (error) {
        console.error('❌ Erreur Resend:', error)
        return false
      }
      
      console.log('✅ Email envoyé via Resend:', data)
      return true
    }
    
    // Option 2: Utiliser EmailJS (service gratuit)
    if (process.env.EMAILJS_SERVICE_ID) {
      const emailjs = await import('@emailjs/browser')
      
      const result = await emailjs.send(
        process.env.EMAILJS_SERVICE_ID,
        process.env.EMAILJS_TEMPLATE_ID,
        {
          to_email: template.to,
          subject: template.subject,
          message: template.html,
          from_name: 'OperaFlow'
        },
        process.env.EMAILJS_PUBLIC_KEY
      )
      
      console.log('✅ Email envoyé via EmailJS:', result)
      return true
    }
    
    // Option 3: Fallback - juste logger (pour debug)
    console.log('⚠️ Aucun service email configuré, simulation d\'envoi')
    console.log('📧 Email simulé:', {
      to: template.to,
      subject: template.subject,
      preview: template.html.substring(0, 100) + '...'
    })
    
    return true
    
  } catch (error) {
    console.error('❌ Erreur envoi email:', error)
    return false
  }
}
