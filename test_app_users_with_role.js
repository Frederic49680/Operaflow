// Test pour vérifier que la colonne role est bien ajoutée à app_users
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rrmvejpwbkwlmyjhnxaz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAppUsersWithRole() {
  console.log('🔍 [TEST] Test de la colonne role dans app_users...')
  
  try {
    // Test 1: Vérifier la structure de la table
    console.log('📋 [TEST] Vérification de la structure de app_users...')
    const { data: usersData, error: usersError } = await supabase
      .from('app_users')
      .select('*')
      .limit(5)
    
    if (usersError) {
      console.error('❌ [TEST] Erreur:', usersError)
      return
    }
    
    console.log('✅ [TEST] Utilisateurs trouvés:', usersData?.length || 0)
    
    if (usersData && usersData.length > 0) {
      console.log('📊 [TEST] Structure des utilisateurs:')
      const firstUser = usersData[0]
      console.log('  - Colonnes disponibles:', Object.keys(firstUser))
      console.log('  - Premier utilisateur:', {
        id: firstUser.id,
        email: firstUser.email,
        prenom: firstUser.prenom,
        nom: firstUser.nom,
        role: firstUser.role || 'NON DÉFINI'
      })
      
      // Vérifier si la colonne role existe
      if ('role' in firstUser) {
        console.log('✅ [TEST] Colonne role trouvée!')
      } else {
        console.log('❌ [TEST] Colonne role manquante!')
      }
    }
    
    // Test 2: Vérifier les rôles et user_roles
    console.log('\n🔐 [TEST] Vérification des rôles et user_roles...')
    const { data: rolesData, error: rolesError } = await supabase
      .from('roles')
      .select('*')
      .limit(3)
    
    if (rolesError) {
      console.error('❌ [TEST] Erreur rôles:', rolesError)
    } else {
      console.log('✅ [TEST] Rôles trouvés:', rolesData?.length || 0)
    }
    
    const { data: userRolesData, error: userRolesError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(3)
    
    if (userRolesError) {
      console.error('❌ [TEST] Erreur user_roles:', userRolesError)
    } else {
      console.log('✅ [TEST] User_roles trouvés:', userRolesData?.length || 0)
    }
    
  } catch (error) {
    console.error('❌ [TEST] Erreur générale:', error)
  }
}

testAppUsersWithRole()
