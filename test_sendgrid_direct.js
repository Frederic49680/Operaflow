// Test de l'endpoint SendGrid avec GET d'abord
async function testSendGridEndpoint() {
  try {
    console.log('🧪 Test GET de l\'endpoint SendGrid...');
    
    const response = await fetch('https://operaflow-ten.vercel.app/api/sendgrid');
    console.log('📊 Statut GET:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ GET OK:', result);
    } else {
      const error = await response.text();
      console.log('❌ Erreur GET:', error);
    }
    
    console.log('\n🧪 Test POST de l\'endpoint SendGrid...');
    
    const postResponse = await fetch('https://operaflow-ten.vercel.app/api/sendgrid', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'frederic.baudry@outlook.fr',
        subject: 'Test SendGrid OperaFlow',
        html: '<h1>Test SendGrid</h1><p>Ceci est un test d\'envoi d\'email via SendGrid.</p>',
        text: 'Test SendGrid - Ceci est un test d\'envoi d\'email via SendGrid.'
      })
    });

    console.log('📊 Statut POST:', postResponse.status);
    
    if (postResponse.ok) {
      const result = await postResponse.json();
      console.log('✅ POST Succès:', result);
    } else {
      const error = await postResponse.text();
      console.log('❌ Erreur POST:', error);
    }
  } catch (error) {
    console.error('🚨 Erreur test:', error);
  }
}

testSendGridEndpoint();

