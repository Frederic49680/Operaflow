const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rrmvejpwbkwlmyjhnxaz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'

const supabase = createClient(supabaseUrl, supabaseKey)

async function diagnosticFunctions() {
  console.log('🔍 Diagnostic des fonctions et triggers de la base de données...')
  
  try {
    // 1. Vérifier l'état de la table ressources
    console.log('\n1. 📋 Vérification de la table ressources...')
    const { data: ressources, error: ressourcesError } = await supabase
      .from('ressources')
      .select('*')
      .limit(5)
    
    if (ressourcesError) {
      console.log('❌ Erreur lors de la lecture des ressources:', ressourcesError.message)
    } else {
      console.log('✅ Ressources lues:', ressources?.length || 0, 'enregistrements')
      if (ressources && ressources.length > 0) {
        console.log('📊 Premier enregistrement:', {
          id: ressources[0].id,
          nom: ressources[0].nom,
          prenom: ressources[0].prenom,
          role_principal: ressources[0].role_principal
        })
      }
    }

    // 2. Vérifier l'état de la table roles
    console.log('\n2. 🎭 Vérification de la table roles...')
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('*')
      .order('seniority_rank', { ascending: true })
    
    if (rolesError) {
      console.log('❌ Erreur lors de la lecture des rôles:', rolesError.message)
    } else {
      console.log('✅ Rôles lus:', roles?.length || 0, 'rôles')
      if (roles && roles.length > 0) {
        console.log('📊 Premiers rôles:')
        roles.slice(0, 5).forEach(role => {
          console.log(`  - ${role.code}: ${role.label} (rang: ${role.seniority_rank})`)
        })
      }
    }

    // 3. Vérifier l'état de la table user_roles
    console.log('\n3. 🔗 Vérification de la table user_roles...')
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select(`
        *,
        roles(code, label),
        app_users(email)
      `)
      .limit(5)
    
    if (userRolesError) {
      console.log('❌ Erreur lors de la lecture des user_roles:', userRolesError.message)
    } else {
      console.log('✅ User_roles lus:', userRoles?.length || 0, 'associations')
      if (userRoles && userRoles.length > 0) {
        console.log('📊 Premières associations:')
        userRoles.forEach(ur => {
          console.log(`  - ${ur.app_users?.email || 'N/A'} -> ${ur.roles?.label || ur.roles?.code || 'N/A'}`)
        })
      }
    }

    // 4. Test de mise à jour d'une ressource
    console.log('\n4. 🔄 Test de mise à jour d\'une ressource...')
    if (ressources && ressources.length > 0) {
      const testRessource = ressources[0]
      console.log(`📝 Test de mise à jour de la ressource: ${testRessource.nom} ${testRessource.prenom}`)
      
      const { error: updateError } = await supabase
        .from('ressources')
        .update({ 
          role_principal: 'Technicien',
          updated_at: new Date().toISOString()
        })
        .eq('id', testRessource.id)
      
      if (updateError) {
        console.log('❌ Erreur lors de la mise à jour:', updateError.message)
        console.log('🔍 Code erreur:', updateError.code)
        console.log('🔍 Détails:', updateError.details)
        console.log('🔍 Hint:', updateError.hint)
      } else {
        console.log('✅ Mise à jour réussie!')
        
        // Vérifier la mise à jour
        const { data: updatedRessource, error: readError } = await supabase
          .from('ressources')
          .select('role_principal, updated_at')
          .eq('id', testRessource.id)
          .single()
        
        if (readError) {
          console.log('❌ Erreur lors de la lecture après mise à jour:', readError.message)
        } else {
          console.log('✅ Vérification après mise à jour:', updatedRessource)
        }
      }
    }

    // 5. Vérifier les triggers et fonctions
    console.log('\n5. ⚙️ Vérification des triggers et fonctions...')
    
    // Test de création d'un user_role
    console.log('\n6. 🔗 Test de création d\'un user_role...')
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
      } else {
        console.log('✅ User_role créé avec succès:', newUserRole.id)
        
        // Vérifier si le trigger a mis à jour app_users
        const { data: appUser, error: appUserError } = await supabase
          .from('app_users')
          .select('role')
          .eq('id', testRessource.id)
          .single()
        
        if (appUserError) {
          console.log('⚠️ Pas d\'app_user correspondant (normal si pas de compte)')
        } else {
          console.log('✅ App_user mis à jour par trigger:', appUser.role)
        }
        
        // Nettoyer
        await supabase.from('user_roles').delete().eq('id', newUserRole.id)
        console.log('🧹 User_role de test supprimé')
      }
    }

    console.log('\n🎯 Diagnostic terminé!')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

diagnosticFunctions()
