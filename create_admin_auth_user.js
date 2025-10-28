const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rrmvejpwbkwlmyjhnxaz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDc5MzU0MSwiZXhwIjoyMDc2MzY5NTQxfQ.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'
);

async function createAdminUser() {
  console.log('🔍 Création de l\'utilisateur admin dans Supabase Auth...');
  
  try {
    // Créer l'utilisateur dans Supabase Auth
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
      return;
    }
    
    console.log('✅ Utilisateur créé dans Auth:', authUser.user?.email);
    console.log('📋 User ID:', authUser.user?.id);
    
    // Vérifier si l'utilisateur existe déjà dans app_users
    const { data: existingAppUser } = await supabase
      .from('app_users')
      .select('*')
      .eq('email', 'admin@operaflow.com')
      .single();
    
    if (existingAppUser) {
      console.log('✅ Utilisateur existe déjà dans app_users');
      console.log('📋 App User ID:', existingAppUser.id);
      
      // Mettre à jour l'ID auth dans app_users
      const { error: updateError } = await supabase
        .from('app_users')
        .update({ auth_id: authUser.user?.id })
        .eq('email', 'admin@operaflow.com');
        
      if (updateError) {
        console.error('❌ Erreur mise à jour app_users:', updateError);
      } else {
        console.log('✅ auth_id mis à jour dans app_users');
      }
    } else {
      console.log('❌ Utilisateur n\'existe pas dans app_users');
    }
    
    // Vérifier les rôles
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role_id, roles(code, label)')
      .eq('user_id', existingAppUser?.id || authUser.user?.id);
      
    console.log('📋 Rôles utilisateur:', userRoles);
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

createAdminUser().catch(console.error);
