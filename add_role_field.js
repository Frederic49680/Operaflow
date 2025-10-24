const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rrmvejpwbkwlmyjhnxaz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'

const supabase = createClient(supabaseUrl, supabaseKey)

async function addRoleField() {
  try {
    // Ajouter le champ role_principal à la table ressources
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.ressources 
        ADD COLUMN IF NOT EXISTS role_principal text;
      `
    })
    
    if (alterError) {
      console.log('Erreur ajout colonne:', alterError.message)
    } else {
      console.log('✅ Colonne role_principal ajoutée à la table ressources')
    }

    // Ajouter la contrainte de clé étrangère
    const { error: fkError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.ressources 
        ADD CONSTRAINT IF NOT EXISTS fk_ressources_role_principal 
        FOREIGN KEY (role_principal) REFERENCES public.roles(code) 
        ON DELETE SET NULL;
      `
    })
    
    if (fkError) {
      console.log('Erreur contrainte FK:', fkError.message)
    } else {
      console.log('✅ Contrainte de clé étrangère ajoutée')
    }

    console.log('✅ Migration terminée!')
    
  } catch (error) {
    console.error('Erreur:', error)
  }
}

addRoleField()
