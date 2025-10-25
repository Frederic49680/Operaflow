// Test simple pour vérifier les rôles
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rrmvejpwbkwlmyjhnxaz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRoles() {
  console.log('🔍 [TEST] Début du test des rôles...')
  
  try {
    // Test 1: Vérifier les rôles
    console.log('📋 [TEST] Chargement des rôles...')
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('*')
      .order('seniority_rank', { ascending: true })
    
    if (rolesError) {
      console.error('❌ [TEST] Erreur rôles:', rolesError)
      return
    }
    
    console.log('✅ [TEST] Rôles chargés:', roles?.length || 0)
    roles?.forEach(role => {
      console.log(`  - ${role.code}: ${role.label} (système: ${role.system})`)
    })
    
    // Test 2: Vérifier les permissions
    console.log('🔐 [TEST] Chargement des permissions...')
    const { data: permissions, error: permError } = await supabase
      .from('permissions')
      .select('*')
      .order('code', { ascending: true })
    
    if (permError) {
      console.error('❌ [TEST] Erreur permissions:', permError)
      return
    }
    
    console.log('✅ [TEST] Permissions chargées:', permissions?.length || 0)
    
    // Test 3: Vérifier les permissions des rôles
    console.log('🔗 [TEST] Chargement des permissions des rôles...')
    const { data: rolesWithPerms, error: rolePermError } = await supabase
      .from('roles')
      .select(`
        *,
        role_permissions(
          permission_id,
          permissions(code, label)
        )
      `)
      .order('seniority_rank', { ascending: true })
    
    if (rolePermError) {
      console.error('❌ [TEST] Erreur permissions des rôles:', rolePermError)
      return
    }
    
    console.log('✅ [TEST] Rôles avec permissions:', rolesWithPerms?.length || 0)
    rolesWithPerms?.forEach(role => {
      const permCount = role.role_permissions?.length || 0
      console.log(`  - ${role.code}: ${permCount} permissions`)
      if (role.role_permissions && role.role_permissions.length > 0) {
        role.role_permissions.forEach(rp => {
          console.log(`    └─ ${rp.permissions?.code}: ${rp.permissions?.label}`)
        })
      }
    })
    
    console.log('🎯 [TEST] Test terminé avec succès!')
    
  } catch (error) {
    console.error('❌ [TEST] Erreur générale:', error)
  }
}

testRoles()