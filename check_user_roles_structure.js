const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rrmvejpwbkwlmyjhnxaz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'
);

async function checkUserRolesStructure() {
  console.log('🔍 Vérification de la structure user_roles...');
  
  // Vérifier la structure de user_roles
  const { data: userRoles, error: userRolesError } = await supabase
    .from('user_roles')
    .select('*')
    .limit(5);
    
  if (userRolesError) {
    console.error('❌ Erreur user_roles:', userRolesError);
  } else {
    console.log('📋 Structure user_roles:', userRoles);
  }
  
  // Vérifier la structure de roles
  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('*')
    .limit(5);
    
  if (rolesError) {
    console.error('❌ Erreur roles:', rolesError);
  } else {
    console.log('📋 Structure roles:', roles);
  }
  
  // Essayer une requête simple sans jointure
  console.log('\n🔍 Test requête simple user_roles...');
  const { data: simpleUserRoles, error: simpleError } = await supabase
    .from('user_roles')
    .select('user_id, role_id')
    .limit(5);
    
  if (simpleError) {
    console.error('❌ Erreur requête simple:', simpleError);
  } else {
    console.log('📋 Données user_roles:', simpleUserRoles);
  }
  
  // Vérifier si l'utilisateur connecté a des rôles
  console.log('\n🔍 Vérification rôles de l\'utilisateur connecté...');
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    console.log('👤 User ID:', user.id);
    
    const { data: userRoleData, error: userRoleError } = await supabase
      .from('user_roles')
      .select('role_id')
      .eq('user_id', user.id);
      
    if (userRoleError) {
      console.error('❌ Erreur rôles utilisateur:', userRoleError);
    } else {
      console.log('📋 Rôles utilisateur:', userRoleData);
    }
  }
}

checkUserRolesStructure().catch(console.error);
