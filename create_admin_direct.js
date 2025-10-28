const { createClient } = require('@supabase/supabase-js');

// Utiliser la clé service_role pour créer des utilisateurs admin
const supabase = createClient(
  'https://rrmvejpwbkwlmyjhnxaz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'
);

async function createAdminUserDirect() {
  console.log('🔍 Création directe de l\'utilisateur admin...');
  
  try {
    // Utiliser la méthode admin pour créer l'utilisateur
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@operaflow.com',
      password: 'Admin123!',
      email_confirm: true,
      user_metadata: {
        prenom: 'Admin',
        nom: 'OperaFlow'
      }
    });
    
    if (authError) {
      console.error('❌ Erreur création auth user:', authError);
      
      // Si l'utilisateur existe déjà, essayer de se connecter
      if (authError.message.includes('already registered')) {
        console.log('🔄 Utilisateur existe déjà, test de connexion...');
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'admin@operaflow.com',
          password: 'Admin123!'
        });
        
        if (signInError) {
          console.error('❌ Erreur connexion:', signInError);
        } else {
          console.log('✅ Connexion réussie:', signInData.user?.email);
          console.log('📋 User ID:', signInData.user?.id);
          
          // Tester l'accès aux demandes
          const { data: requests, error } = await supabase
            .from('access_requests')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (error) {
            console.error('❌ Erreur accès demandes:', error);
          } else {
            console.log('✅ Demandes récupérées:', requests.length);
            requests.forEach((req, index) => {
              console.log(`📋 Demande ${index + 1}:`, {
                id: req.id,
                email: req.email,
                prenom: req.prenom,
                nom: req.nom,
                statut: req.statut
              });
            });
          }
        }
      }
      return;
    }
    
    console.log('✅ Utilisateur créé dans Auth:', authUser.user?.email);
    console.log('📋 User ID:', authUser.user?.id);
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

createAdminUserDirect().catch(console.error);
