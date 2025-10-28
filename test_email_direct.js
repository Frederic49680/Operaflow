// Test d'envoi d'email direct
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rrmvejpwbkwlmyjhnxaz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDc5MzU0MSwiZXhwIjoyMDc2MzY5NTQxfQ.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testEmail() {
  console.log('🧪 Test d\'envoi d\'email...')
  
  try {
    // Test avec la fonction RPC send_custom_email
    const { data, error } = await supabase.rpc('send_custom_email', {
      to_email: 'frederic.baudry@outlook.fr',
      subject: '🧪 Test Email OperaFlow',
      html_content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>🧪 Test Email</h1>
          <p>Si vous recevez cet email, la configuration SMTP fonctionne !</p>
          <p>Date: ${new Date().toLocaleString()}</p>
        </div>
      `,
      text_content: 'Test Email OperaFlow - Si vous recevez cet email, la configuration SMTP fonctionne !'
    })

    if (error) {
      console.error('❌ Erreur envoi email:', error)
    } else {
      console.log('✅ Email envoyé:', data)
    }
  } catch (err) {
    console.error('❌ Erreur:', err)
  }
}

testEmail()
