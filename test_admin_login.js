// Test de connexion pour l'utilisateur admin créé
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rrmvejpwbkwlmyjhnxaz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAdminLogin() {
  console.log('🔍 Test de connexion admin...')
  
  try {
    // Test de connexion avec les identifiants admin
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@operaflow.com',
      password: 'Kawasak!49680@' // Mot de passe personnalisé
    })
    
    if (error) {
      console.error('❌ Erreur de connexion:', error.message)
      return
    }
    
    if (data.user) {
      console.log('✅ Connexion réussie!')
      console.log('👤 Utilisateur:', data.user.email)
      console.log('🆔 ID:', data.user.id)
      
      // Vérifier les rôles avec une requête plus simple
      const { data: userRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', data.user.id)
      
      if (roleError) {
        console.error('❌ Erreur récupération rôles:', roleError.message)
      } else {
        console.log('🎭 Rôles IDs:', userRoles?.map(ur => ur.role_id).join(', '))
        
        // Récupérer les détails des rôles
        if (userRoles && userRoles.length > 0) {
          const roleIds = userRoles.map(ur => ur.role_id)
          const { data: roles, error: rolesError } = await supabase
            .from('roles')
            .select('id, code, label')
            .in('id', roleIds)
          
          if (rolesError) {
            console.error('❌ Erreur détails rôles:', rolesError.message)
          } else {
            console.log('🎭 Rôles assignés:', roles?.map(r => r.code).join(', '))
          }
        }
      }
      
      // Test d'accès à l'API admin
      console.log('🔐 Test accès API admin...')
      const response = await fetch('https://operaflow-ten.vercel.app/api/admin/access-requests', {
        headers: {
          'Authorization': `Bearer ${data.session?.access_token}`
        }
      })
      
      if (response.ok) {
        console.log('✅ Accès API admin autorisé')
      } else {
        console.log('❌ Accès API admin refusé:', response.status)
      }
      
    } else {
      console.log('❌ Aucun utilisateur retourné')
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
}

testAdminLogin()
