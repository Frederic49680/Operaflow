const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rrmvejpwbkwlmyjhnxaz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'
);

async function checkTables() {
  console.log('🔍 Vérification des tables liées aux rôles...');
  
  // Vérifier si user_roles existe
  const { data: userRoles, error: userRolesError } = await supabase
    .from('user_roles')
    .select('*')
    .limit(1);
    
  if (userRolesError) {
    console.error('❌ Erreur user_roles:', userRolesError.message);
  } else {
    console.log('✅ Table user_roles existe');
  }
  
  // Vérifier si roles existe
  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('*')
    .limit(1);
    
  if (rolesError) {
    console.error('❌ Erreur roles:', rolesError.message);
  } else {
    console.log('✅ Table roles existe');
  }
  
  // Vérifier si app_users existe
  const { data: appUsers, error: appUsersError } = await supabase
    .from('app_users')
    .select('*')
    .limit(1);
    
  if (appUsersError) {
    console.error('❌ Erreur app_users:', appUsersError.message);
  } else {
    console.log('✅ Table app_users existe');
  }
  
  // Lister toutes les tables
  console.log('\n🔍 Tentative de lister toutes les tables...');
  const { data: tables, error: tablesError } = await supabase
    .rpc('get_tables');
    
  if (tablesError) {
    console.log('❌ Impossible de lister les tables via RPC');
  } else {
    console.log('📋 Tables trouvées:', tables);
  }
}

checkTables().catch(console.error);
