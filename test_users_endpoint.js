async function testUsersEndpoint() {
  try {
    console.log('Test endpoint /api/admin/users...');
    const response = await fetch('https://operaflow-ten.vercel.app/api/admin/users');
    
    console.log('Statut:', response.status);
    
    if (response.ok) {
      const users = await response.json();
      console.log('Utilisateurs trouves:', users.length);
      if (users.length > 0) {
        console.log('Premier utilisateur:', users[0]);
      }
    } else {
      const text = await response.text();
      console.log('Erreur:', text.substring(0, 200));
    }
  } catch (error) {
    console.error('Erreur test endpoint:', error.message);
  }
}

testUsersEndpoint();
