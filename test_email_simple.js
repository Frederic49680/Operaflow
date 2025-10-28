// Test d'envoi d'email via l'API de l'application
const fetch = require('node-fetch')

async function testEmailViaAPI() {
  console.log('🧪 Test d\'envoi d\'email via API OperaFlow...')
  
  try {
    // Simuler une demande d'accès pour tester l'email
    const testData = {
      prenom: 'Fred',
      nom: 'Baudry',
      email: 'frederic.baudry@outlook.fr',
      temporaryPassword: 'Test123!',
      loginUrl: 'https://operaflow-ten.vercel.app/auth/login'
    }
    
    console.log('📧 Données de test:', testData)
    
    // Appeler directement l'API d'approbation (simulation)
    const response = await fetch('https://operaflow-ten.vercel.app/api/admin/approve-access-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_ADMIN_TOKEN' // Vous devrez remplacer par un vrai token
      },
      body: JSON.stringify({
        requestId: 'test-request-id',
        roleId: 'test-role-id'
      })
    })
    
    const result = await response.json()
    console.log('📊 Résultat API:', result)
    
  } catch (error) {
    console.error('❌ Erreur API:', error)
  }
}

// Alternative : Test direct avec Supabase
async function testDirectSupabase() {
  console.log('🧪 Test direct Supabase...')
  
  const { createClient } = require('@supabase/supabase-js')
  
  const supabaseUrl = 'https://rrmvejpwbkwlmyjhnxaz.supabase.co'
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDc5MzU0MSwiZXhwIjoyMDc2MzY5NTQxfQ.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // Test simple
    const { data, error } = await supabase.rpc('send_custom_email', {
      p_to_email: 'frederic.baudry@outlook.fr',
      p_subject: '🧪 Test Simple OperaFlow',
      p_html_content: '<h1>Test Email OperaFlow</h1><p>Si vous recevez cet email, SendGrid fonctionne !</p>',
      p_text_content: 'Test Email OperaFlow - Si vous recevez cet email, SendGrid fonctionne !'
    })
    
    if (error) {
      console.error('❌ Erreur:', error)
    } else {
      console.log('✅ Email envoyé !', data)
    }
  } catch (err) {
    console.error('❌ Erreur:', err)
  }
}

// Lancer le test direct
testDirectSupabase()
