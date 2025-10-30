// Test de plusieurs endpoints pour vérifier le déploiement
async function testEndpoints() {
  const endpoints = [
    '/api/admin/users',
    '/api/sendgrid', 
    '/api/test-sendgrid'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🧪 Test GET ${endpoint}...`);
      const response = await fetch(`https://operaflow-ten.vercel.app${endpoint}`);
      console.log(`📊 Statut: ${response.status}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Succès:`, result);
      } else {
        const error = await response.text();
        console.log(`❌ Erreur:`, error.substring(0, 100) + '...');
      }
    } catch (error) {
      console.error(`🚨 Erreur ${endpoint}:`, error.message);
    }
  }
}

testEndpoints();

