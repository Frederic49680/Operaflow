// Test de l'API /api/affaires/a-planifier
const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('🧪 Test de l\'API /api/affaires/a-planifier...\n');
    
    const response = await fetch('http://localhost:3001/api/affaires/a-planifier');
    const data = await response.json();
    
    console.log('📊 Statut:', response.status);
    console.log('📋 Réponse:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✅ API fonctionne correctement !');
      console.log(`📦 Nombre d'affaires: ${data.data?.length || 0}`);
    } else {
      console.log('\n❌ Erreur API:', data.error);
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testAPI();

