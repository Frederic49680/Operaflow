// Test de l'endpoint test-email-direct
async function testEmailDirectEndpoint() {
  console.log('🧪 Test endpoint /api/test-email-direct...')
  
  try {
    const response = await fetch('https://operaflow-ten.vercel.app/api/test-email-direct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const result = await response.json()
    
    console.log('📊 Statut:', response.status)
    console.log('📧 Résultat:', JSON.stringify(result, null, 2))
    
    if (result.success) {
      console.log('✅ Email envoyé avec succès !')
      console.log('📧 Vérifiez votre boîte mail (et les spams)')
      console.log('📊 Vérifiez aussi les logs SendGrid')
    } else {
      console.log('❌ Échec:', result.message)
      if (result.error) {
        console.log('🔍 Erreur:', result.error)
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

// Lancer le test
testEmailDirectEndpoint()
