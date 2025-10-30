// Test de debug SendGrid
async function testDebugSendGrid() {
  try {
    console.log('🔍 Debug configuration SendGrid...');
    
    const response = await fetch('https://operaflow-ten.vercel.app/api/debug-sendgrid');
    console.log('📊 Statut:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Configuration:', result);
    } else {
      const error = await response.text();
      console.log('❌ Erreur:', error);
    }
  } catch (error) {
    console.error('🚨 Erreur:', error);
  }
}

testDebugSendGrid();

