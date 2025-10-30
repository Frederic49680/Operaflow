// Test SendGrid avec un email simple
async function testSendGridSimple() {
  try {
    console.log('🧪 Test SendGrid simple...');
    
    const response = await fetch('https://operaflow-ten.vercel.app/api/sendgrid', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'frederic.baudry@outlook.fr',
        subject: 'Test SendGrid OperaFlow',
        html: '<h1>Test</h1><p>Email de test SendGrid</p>',
        text: 'Test SendGrid - Email de test'
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
    console.error('🚨 Erreur:', error);
  }
}

testSendGridSimple();

