// Script pour réinitialiser le mot de passe de l'utilisateur admin
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rrmvejpwbkwlmyjhnxaz.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDc5MzU0MSwiZXhwIjoyMDc2MzY5NTQxfQ.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'

const serviceSupabase = createClient(supabaseUrl, serviceRoleKey)

async function resetAdminPassword() {
  console.log('🔑 Réinitialisation du mot de passe admin...')
  
  try {
    // Nouveau mot de passe simple pour les tests
    const newPassword = 'Admin123!'
    
    // Lister les utilisateurs pour trouver l'admin
    const { data: users, error: listError } = await serviceSupabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Erreur liste utilisateurs:', listError.message)
      return
    }
    
    const adminUser = users?.users?.find(user => user.email === 'admin@operaflow.com')
    
    if (!adminUser) {
      console.error('❌ Utilisateur admin non trouvé')
      return
    }
    
    console.log('✅ Utilisateur admin trouvé:', adminUser.id)
    
    // Mettre à jour le mot de passe
    const { data, error } = await serviceSupabase.auth.admin.updateUserById(adminUser.id, {
      password: newPassword
    })
    
    if (error) {
      console.error('❌ Erreur mise à jour mot de passe:', error.message)
      return
    }
    
    console.log('✅ Mot de passe mis à jour avec succès!')
    console.log('📧 Email:', adminUser.email)
    console.log('🔑 Nouveau mot de passe:', newPassword)
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
}

resetAdminPassword()
