// Test de vérification des fonctions disponibles
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rrmvejpwbkwlmyjhnxaz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDc5MzU0MSwiZXhwIjoyMDc2MzY5NTQxfQ.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('🔍 Test de connexion Supabase...')
  
  try {
    // Test de connexion basique
    const { data, error } = await supabase
      .from('roles')
      .select('id, code, label')
      .limit(1)
    
    if (error) {
      console.error('❌ Erreur connexion:', error)
    } else {
      console.log('✅ Connexion OK:', data)
    }
    
    // Test de la fonction send_custom_email
    console.log('🧪 Test fonction send_custom_email...')
    const { data: emailData, error: emailError } = await supabase.rpc('send_custom_email', {
      p_to_email: 'frederic.baudry@outlook.fr',
      p_subject: 'Test OperaFlow',
      p_html_content: '<h1>Test</h1>',
      p_text_content: 'Test'
    })
    
    if (emailError) {
      console.error('❌ Erreur fonction email:', emailError)
    } else {
      console.log('✅ Fonction email OK:', emailData)
    }
    
  } catch (err) {
    console.error('❌ Erreur générale:', err)
  }
}

testConnection()
