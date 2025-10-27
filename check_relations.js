// Script pour vérifier les relations entre les tables
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rrmvejpwbkwlmyjhnxaz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkRelations() {
  console.log('🔍 Vérification des relations entre les tables...')
  
  try {
    // Test 1: Vérifier app_users
    console.log('\n1. 📋 Test app_users...')
    const { data: users, error: usersError } = await supabase
      .from('app_users')
      .select('*')
      .limit(3)
    
    if (usersError) {
      console.log('❌ Erreur app_users:', usersError.message)
    } else {
      console.log(`✅ app_users: ${users.length} utilisateurs trouvés`)
      if (users.length > 0) {
        console.log('📊 Premier utilisateur:', users[0])
      }
    }
    
    // Test 2: Vérifier roles
    console.log('\n2. 🎭 Test roles...')
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('*')
      .limit(3)
    
    if (rolesError) {
      console.log('❌ Erreur roles:', rolesError.message)
    } else {
      console.log(`✅ roles: ${roles.length} rôles trouvés`)
      if (roles.length > 0) {
        console.log('📊 Premier rôle:', roles[0])
      }
    }
    
    // Test 3: Vérifier user_roles
    console.log('\n3. 🔗 Test user_roles...')
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(3)
    
    if (userRolesError) {
      console.log('❌ Erreur user_roles:', userRolesError.message)
    } else {
      console.log(`✅ user_roles: ${userRoles.length} associations trouvées`)
      if (userRoles.length > 0) {
        console.log('📊 Première association:', userRoles[0])
      }
    }
    
    // Test 4: Test de la jointure qui pose problème
    console.log('\n4. 🔗 Test de la jointure app_users -> user_roles...')
    const { data: joinTest, error: joinError } = await supabase
      .from('app_users')
      .select(`
        *,
        user_roles(
          role_id,
          roles(code, label)
        )
      `)
      .limit(1)
    
    if (joinError) {
      console.log('❌ Erreur jointure:', joinError.message)
      console.log('🔍 Détails:', joinError.details)
      console.log('💡 Hint:', joinError.hint)
    } else {
      console.log('✅ Jointure réussie:', joinTest)
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
  
  console.log('\n🎯 Vérification des relations terminée!')
}

checkRelations()
