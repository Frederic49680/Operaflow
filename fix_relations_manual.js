// Script pour corriger manuellement les relations entre les tables
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rrmvejpwbkwlmyjhnxaz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixRelations() {
  console.log('🔧 Correction des relations entre les tables...')
  
  try {
    // 1. Vérifier les contraintes existantes
    console.log('\n1. 📋 Vérification des contraintes existantes...')
    const { data: constraints, error: constraintsError } = await supabase
      .from('information_schema.table_constraints')
      .select('*')
      .eq('table_schema', 'public')
      .in('table_name', ['user_roles', 'role_permissions', 'page_access_rules', 'component_flags', 'user_tokens'])
      .eq('constraint_type', 'FOREIGN KEY')
    
    if (constraintsError) {
      console.log('❌ Erreur lors de la vérification des contraintes:', constraintsError.message)
    } else {
      console.log(`✅ Contraintes trouvées: ${constraints.length}`)
      constraints.forEach(c => {
        console.log(`  - ${c.table_name}.${c.constraint_name}`)
      })
    }
    
    // 2. Test de la jointure après vérification
    console.log('\n2. 🔗 Test de la jointure app_users -> user_roles...')
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
      
      // Si l'erreur persiste, cela signifie que les clés étrangères ne sont pas correctement configurées
      console.log('\n⚠️  Les clés étrangères ne sont pas correctement configurées.')
      console.log('💡 Solution: Exécuter le script SQL directement dans l\'interface Supabase SQL Editor')
      console.log('📄 Fichier à exécuter: fix_user_relations.sql')
      
    } else {
      console.log('✅ Jointure réussie:', joinTest)
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
  
  console.log('\n🎯 Vérification terminée!')
}

fixRelations()
