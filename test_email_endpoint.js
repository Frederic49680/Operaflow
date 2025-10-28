// Test d'envoi d'email via l'endpoint de test
async function testEmailEndpoint() {
  console.log('🧪 Test d\'envoi d\'email via endpoint OperaFlow...')
  
  try {
    const response = await fetch('https://operaflow-ten.vercel.app/api/test-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    const result = await response.json()
    
    console.log('📊 Statut:', response.status)
    console.log('📧 Résultat:', result)
    
    if (result.success) {
      console.log('✅ Email envoyé avec succès !')
      console.log('📧 Vérifiez votre boîte mail (et les spams)')
    } else {
      console.log('❌ Échec:', result.message)
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

// Lancer le test
testEmailEndpoint()
