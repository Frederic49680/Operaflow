// Test direct de l'API pour vérifier si les données arrivent
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rrmvejpwbkwlmyjhnxaz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAPI() {
  console.log('🔍 [API] Test direct de l\'API...')
  
  try {
    // Test exactement comme dans l'interface
    console.log('📋 [API] Test de la requête exacte de l\'interface...')
    const { data: rolesData, error: rolesError } = await supabase
      .from('roles')
      .select(`
        *,
        role_permissions(
          permission_id,
          permissions(code, label)
        )
      `)
      .order('seniority_rank', { ascending: true })
    
    if (rolesError) {
      console.error('❌ [API] Erreur:', rolesError)
      return
    }
    
    console.log('✅ [API] Données reçues:', rolesData?.length || 0, 'rôles')
    
    // Analyser chaque rôle
    rolesData?.forEach((role, index) => {
      console.log(`\n📊 [ROLE ${index + 1}] ${role.code} (${role.label}):`)
      console.log(`  - ID: ${role.id}`)
      console.log(`  - Système: ${role.system}`)
      console.log(`  - Permissions: ${role.role_permissions?.length || 0}`)
      
      if (role.role_permissions && role.role_permissions.length > 0) {
        role.role_permissions.forEach((rp, permIndex) => {
          console.log(`    ${permIndex + 1}. ${rp.permissions?.code || 'N/A'}: ${rp.permissions?.label || 'N/A'}`)
        })
      } else {
        console.log('    ⚠️ Aucune permission trouvée')
      }
    })
    
    // Test de la sauvegarde
    console.log('\n💾 [API] Test de sauvegarde des permissions...')
    const { data: testSave, error: saveError } = await supabase
      .from('page_access_rules')
      .select('*')
      .limit(1)
    
    if (saveError) {
      console.error('❌ [API] Erreur sauvegarde:', saveError)
    } else {
      console.log('✅ [API] Test sauvegarde OK')
    }
    
  } catch (error) {
    console.error('❌ [API] Erreur générale:', error)
  }
}

testAPI()
