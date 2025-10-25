// Script de test direct pour vérifier les rôles
const { createClient } = require('@supabase/supabase-js')

// Variables Supabase (à adapter selon votre configuration)
const supabaseUrl = 'https://rrmvejpwbkwlmyjhnxaz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRoles() {
  try {
    console.log('🔍 Test des rôles...')
    
    // Test 1: Vérifier les rôles
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('*')
    
    if (rolesError) {
      console.error('❌ Erreur rôles:', rolesError)
      return
    }
    
    console.log('✅ Rôles trouvés:', roles?.length || 0)
    if (roles && roles.length > 0) {
      console.log('📋 Rôles:', roles.map(r => `${r.code} (${r.label})`).join(', '))
    }
    
    // Test 2: Vérifier les permissions
    const { data: permissions, error: permissionsError } = await supabase
      .from('permissions')
      .select('*')
    
    if (permissionsError) {
      console.error('❌ Erreur permissions:', permissionsError)
      return
    }
    
    console.log('✅ Permissions trouvées:', permissions?.length || 0)
    
    // Test 3: Vérifier les rôles avec permissions
    const { data: rolesWithPerms, error: rolesWithPermsError } = await supabase
      .from('roles')
      .select(`
        *,
        role_permissions(
          permission_id,
          permissions(code, label)
        )
      `)
    
    if (rolesWithPermsError) {
      console.error('❌ Erreur rôles avec permissions:', rolesWithPermsError)
      return
    }
    
    console.log('✅ Rôles avec permissions:', rolesWithPerms?.length || 0)
    
    if (rolesWithPerms && rolesWithPerms.length > 0) {
      rolesWithPerms.forEach(role => {
        const permCount = role.role_permissions?.length || 0
        console.log(`📋 ${role.code}: ${permCount} permissions`)
        if (role.role_permissions && role.role_permissions.length > 0) {
          role.role_permissions.forEach(rp => {
            console.log(`  - ${rp.permissions?.label || rp.permissions?.code || 'Inconnue'}`)
          })
        }
      })
    }
    
    console.log('🎉 Test terminé avec succès!')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

testRoles()
