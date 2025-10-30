// Test de la suspension d'activité avec de vrais utilisateurs
async function testSuspendActivity() {
  try {
    console.log('🧪 Test de suspension d\'activité...');
    
    // D'abord, récupérer les utilisateurs disponibles
    const usersResponse = await fetch('https://operaflow-ten.vercel.app/api/admin/users');
    if (!usersResponse.ok) {
      throw new Error('Impossible de récupérer les utilisateurs');
    }
    
    const users = await usersResponse.json();
    console.log('👥 Utilisateurs disponibles:', users.length);
    
    if (users.length > 0) {
      const firstUser = users[0];
      console.log('👤 Premier utilisateur:', firstUser);
      
      // Test de suspension avec un ID de tâche fictif
      const suspendResponse = await fetch('https://operaflow-ten.vercel.app/api/terrain/suspend-activite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tache_id: 'test-task-id-123',
          motif: 'Test de suspension avec SendGrid',
          responsable_id: firstUser.id,
          duree_estimee: 2
        })
      });
      
      console.log('📊 Statut suspension:', suspendResponse.status);
      
      if (suspendResponse.ok) {
        const result = await suspendResponse.json();
        console.log('✅ Suspension réussie:', result);
      } else {
        const error = await suspendResponse.text();
        console.log('❌ Erreur suspension:', error);
      }
    }
  } catch (error) {
    console.error('🚨 Erreur test:', error);
  }
}

testSuspendActivity();

