const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rrmvejpwbkwlmyjhnxaz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'
);

async function checkRoles() {
  console.log('🔍 Vérification des rôles existants...');
  
  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('*')
    .order('code');
    
  if (rolesError) {
    console.error('❌ Erreur rôles:', rolesError);
    return;
  }
  
  console.log('📋 Rôles trouvés:', roles.length);
  roles.forEach(role => {
    console.log(`  - ${role.code}: ${role.label} (system: ${role.system})`);
  });
  
  console.log('\n🔍 Vérification des permissions existantes...');
  
  const { data: permissions, error: permError } = await supabase
    .from('permissions')
    .select('*')
    .order('code');
    
  if (permError) {
    console.error('❌ Erreur permissions:', permError);
    return;
  }
  
  console.log('📋 Permissions trouvées:', permissions.length);
  permissions.forEach(perm => {
    console.log(`  - ${perm.code}: ${perm.label}`);
  });
}

checkRoles().catch(console.error);
