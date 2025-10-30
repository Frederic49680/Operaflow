// Test d'approbation de demande d'accès (simulation)
async function testApprovalFlow() {
  try {
    console.log('🧪 Test du flux d\'approbation...');
    
    // D'abord, créer une demande d'accès
    console.log('1️⃣ Création d\'une demande d\'accès...');
    const createResponse = await fetch('https://operaflow-ten.vercel.app/api/auth/access-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prenom: 'Test',
        nom: 'SendGrid',
        email: 'frederic.baudry@outlook.fr',
        message: 'Test d\'envoi d\'email SendGrid'
      })
    });
    
    console.log('📊 Statut création:', createResponse.status);
    
    if (createResponse.ok) {
      const createResult = await createResponse.json();
      console.log('✅ Demande créée:', createResult);
      
      // Récupérer les demandes en attente
      console.log('\n2️⃣ Récupération des demandes...');
      const requestsResponse = await fetch('https://operaflow-ten.vercel.app/api/admin/access-requests');
      
      if (requestsResponse.ok) {
        const requests = await requestsResponse.json();
        console.log('📋 Demandes trouvées:', requests.length);
        
        if (requests.length > 0) {
          const lastRequest = requests[requests.length - 1];
          console.log('📝 Dernière demande:', lastRequest);
          
          // Récupérer les rôles disponibles
          console.log('\n3️⃣ Récupération des rôles...');
          const rolesResponse = await fetch('https://operaflow-ten.vercel.app/api/admin/roles');
          
          if (rolesResponse.ok) {
            const roles = await rolesResponse.json();
            console.log('🎭 Rôles disponibles:', roles.length);
            
            if (roles.length > 0) {
              const userRole = roles.find(r => r.code === 'USER') || roles[0];
              console.log('👤 Rôle sélectionné:', userRole);
              
              // Approuver la demande
              console.log('\n4️⃣ Approbation de la demande...');
              const approveResponse = await fetch('https://operaflow-ten.vercel.app/api/admin/approve-access-request', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  requestId: lastRequest.id,
                  roleId: userRole.id
                })
              });
              
              console.log('📊 Statut approbation:', approveResponse.status);
              
              if (approveResponse.ok) {
                const approveResult = await approveResponse.json();
                console.log('✅ Approbation réussie:', approveResult);
              } else {
                const error = await approveResponse.text();
                console.log('❌ Erreur approbation:', error);
              }
            }
          }
        }
      }
    } else {
      const error = await createResponse.text();
      console.log('❌ Erreur création:', error);
    }
  } catch (error) {
    console.error('🚨 Erreur:', error);
  }
}

testApprovalFlow();

