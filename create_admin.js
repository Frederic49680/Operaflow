const { createClient } = require('@supabase/supabase-js');

// Utiliser le service_role pour contourner RLS
const supabase = createClient(
  'https://rrmvejpwbkwlmyjhnxaz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDc5MzU0MSwiZXhwIjoyMDc2MzY5NTQxfQ.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'
);

async function createAdminUser() {
  console.log('🔧 Création d\'un utilisateur admin...');
  
  try {
    // 1. Créer l'utilisateur dans auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@operaflow.com',
      password: 'Admin123!',
      email_confirm: true
    });
    
    if (authError) {
      console.error('❌ Erreur création auth:', authError);
      return;
    }
    
    console.log('✅ Utilisateur auth créé:', authData.user.id);
    
    // 2. Créer le profil dans app_users
    const { error: profileError } = await supabase
      .from('app_users')
      .insert({
        id: authData.user.id,
        email: 'admin@operaflow.com',
        prenom: 'Admin',
        nom: 'OperaFlow',
        active: true,
        email_verified: true,
        force_pwd_change: false
      });
    
    if (profileError) {
      console.error('❌ Erreur création profil:', profileError);
      return;
    }
    
    console.log('✅ Profil utilisateur créé');
    
    // 3. Récupérer l'ID du rôle admin
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('code', 'admin')
      .single();
    
    if (roleError || !roleData) {
      console.error('❌ Erreur récupération rôle admin:', roleError);
      return;
    }
    
    // 4. Assigner le rôle admin
    const { error: assignError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role_id: roleData.id
      });
    
    if (assignError) {
      console.error('❌ Erreur assignation rôle:', assignError);
      return;
    }
    
    console.log('✅ Rôle admin assigné');
    console.log('🎉 Utilisateur admin créé avec succès !');
    console.log('📧 Email: admin@operaflow.com');
    console.log('🔑 Mot de passe: Admin123!');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

createAdminUser();
