// Test de l'endpoint SendGrid
async function testSendGrid() {
  try {
    console.log('🧪 Test de l\'endpoint SendGrid...');
    
    const response = await fetch('https://operaflow-ten.vercel.app/api/test-sendgrid', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient: 'frederic.baudry@outlook.fr'
      })
    });

    console.log('📊 Statut:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Succès:', result);
    } else {
      const error = await response.text();
      console.log('❌ Erreur:', error);
    }
  } catch (error) {
    console.error('🚨 Erreur test:', error);
  }
}

testSendGrid();
