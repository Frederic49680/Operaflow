const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rrmvejpwbkwlmyjhnxaz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixUserRolesRelations() {
  console.log('🔧 Correction des relations user_roles...')
  
  try {
    // 1. Vérifier l'état actuel des user_roles
    console.log('\n1. 📋 Vérification de l\'état actuel des user_roles...')
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(5)
    
    if (userRolesError) {
      console.log('❌ Erreur lors de la lecture des user_roles:', userRolesError.message)
    } else {
      console.log('✅ User_roles lus:', userRoles?.length || 0, 'associations')
      if (userRoles && userRoles.length > 0) {
        console.log('📊 Premières associations:')
        userRoles.forEach(ur => {
          console.log(`  - User: ${ur.user_id}, Role: ${ur.role_id}`)
        })
      }
    }

    // 2. Vérifier les rôles disponibles
    console.log('\n2. 🎭 Vérification des rôles disponibles...')
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('*')
      .order('seniority_rank', { ascending: true })
    
    if (rolesError) {
      console.log('❌ Erreur lors de la lecture des rôles:', rolesError.message)
    } else {
      console.log('✅ Rôles lus:', roles?.length || 0, 'rôles')
    }

    // 3. Vérifier les ressources disponibles
    console.log('\n3. 👥 Vérification des ressources disponibles...')
    const { data: ressources, error: ressourcesError } = await supabase
      .from('ressources')
      .select('*')
      .limit(5)
    
    if (ressourcesError) {
      console.log('❌ Erreur lors de la lecture des ressources:', ressourcesError.message)
    } else {
      console.log('✅ Ressources lues:', ressources?.length || 0, 'ressources')
    }

    // 4. Test de création d'un user_role avec vérification manuelle
    console.log('\n4. 🔗 Test de création d\'un user_role avec vérification manuelle...')
    if (roles && roles.length > 0 && ressources && ressources.length > 0) {
      const testRole = roles.find(r => r.code === 'TECH') || roles[0]
      const testRessource = ressources[0]
      
      console.log(`📝 Test de création user_role: ${testRessource.nom} -> ${testRole.label}`)
      
      const { data: newUserRole, error: createError } = await supabase
        .from('user_roles')
        .insert({
          user_id: testRessource.id,
          role_id: testRole.id
        })
        .select()
        .single()
      
      if (createError) {
        console.log('❌ Erreur lors de la création user_role:', createError.message)
        console.log('🔍 Code erreur:', createError.code)
        console.log('🔍 Détails:', createError.details)
        console.log('🔍 Hint:', createError.hint)
      } else {
        console.log('✅ User_role créé avec succès:', newUserRole.id)
        
        // Vérification manuelle des relations
        console.log('\n5. 🔍 Vérification manuelle des relations...')
        
        // Vérifier le rôle
        const { data: roleData, error: roleError } = await supabase
          .from('roles')
          .select('*')
          .eq('id', testRole.id)
          .single()
        
        if (roleError) {
          console.log('❌ Erreur lors de la lecture du rôle:', roleError.message)
        } else {
          console.log('✅ Rôle trouvé:', roleData.code, '-', roleData.label)
        }
        
        // Vérifier la ressource
        const { data: ressourceData, error: ressourceError } = await supabase
          .from('ressources')
          .select('*')
          .eq('id', testRessource.id)
          .single()
        
        if (ressourceError) {
          console.log('❌ Erreur lors de la lecture de la ressource:', ressourceError.message)
        } else {
          console.log('✅ Ressource trouvée:', ressourceData.nom, ressourceData.prenom)
        }
        
        // Nettoyer
        await supabase.from('user_roles').delete().eq('id', newUserRole.id)
        console.log('🧹 User_role de test supprimé')
      }
    }

    // 6. Vérifier les contraintes de clés étrangères
    console.log('\n6. 🔑 Vérification des contraintes de clés étrangères...')
    
    // Test avec des IDs invalides pour voir les erreurs de contrainte
    console.log('📝 Test avec des IDs invalides...')
    
    const { error: invalidUserError } = await supabase
      .from('user_roles')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000', // ID invalide
        role_id: roles?.[0]?.id || '00000000-0000-0000-0000-000000000000'
      })
    
    if (invalidUserError) {
      console.log('✅ Contrainte user_id fonctionne:', invalidUserError.message)
    } else {
      console.log('⚠️ Contrainte user_id ne fonctionne pas')
    }
    
    const { error: invalidRoleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: ressources?.[0]?.id || '00000000-0000-0000-0000-000000000000',
        role_id: '00000000-0000-0000-0000-000000000000' // ID invalide
      })
    
    if (invalidRoleError) {
      console.log('✅ Contrainte role_id fonctionne:', invalidRoleError.message)
    } else {
      console.log('⚠️ Contrainte role_id ne fonctionne pas')
    }

    console.log('\n🎯 Diagnostic des relations terminé!')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

fixUserRolesRelations()
