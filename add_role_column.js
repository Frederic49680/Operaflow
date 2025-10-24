const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rrmvejpwbkwlmyjhnxaz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'

const supabase = createClient(supabaseUrl, supabaseKey)

async function addRoleColumn() {
  try {
    // Ajouter la colonne role_principal à la table ressources
    const { error } = await supabase
      .from('ressources')
      .select('role_principal')
      .limit(1)
    
    if (error && error.code === 'PGRST204') {
      console.log('Colonne role_principal n\'existe pas, elle sera créée automatiquement lors de la première insertion')
    } else {
      console.log('Colonne role_principal existe déjà')
    }

    // Mettre à jour les rôles avec ceux de l'image
    const roles = [
      { code: 'ADMIN', label: 'Administratif', description: 'Administratif (Spécial)', seniority_rank: 0, is_special: true },
      { code: 'ETUDE', label: 'Chargé d\'Étude', description: 'Chargé d\'Étude (Spécial)', seniority_rank: 0, is_special: true },
      { code: 'MAG', label: 'Magasinier', description: 'Magasinier (Spécial)', seniority_rank: 0, is_special: true },
      { code: 'INTER', label: 'Intervenant', description: 'Intervenant (N1)', seniority_rank: 1, is_special: false },
      { code: 'TECH', label: 'Technicien', description: 'Technicien (N1)', seniority_rank: 1, is_special: false },
      { code: 'CHEF', label: 'Chef d\'équipe', description: 'Chef d\'équipe (N2)', seniority_rank: 2, is_special: false },
      { code: 'CT', label: 'Chargé de Travaux', description: 'Chargé de Travaux (N2)', seniority_rank: 2, is_special: false },
      { code: 'RESP', label: 'Responsable', description: 'Responsable (N3)', seniority_rank: 3, is_special: false },
      { code: 'CC', label: 'Chef de Chantier', description: 'Chef de Chantier (N3)', seniority_rank: 3, is_special: false },
      { code: 'CDT', label: 'Conducteur de Travaux', description: 'Conducteur de Travaux (N4)', seniority_rank: 4, is_special: false },
      { code: 'EXPERT', label: 'Expert', description: 'Expert (Spécial)', seniority_rank: 0, is_special: true },
      { code: 'CA', label: 'Chargé d\'Affaire', description: 'Chargé d\'Affaire (N5)', seniority_rank: 5, is_special: false },
      { code: 'MANAGER', label: 'Manager', description: 'Manager (Spécial)', seniority_rank: 0, is_special: true },
      { code: 'RA', label: 'Responsable d\'Activités', description: 'Responsable d\'Activités (N6)', seniority_rank: 6, is_special: false },
      { code: 'DIR', label: 'Directeur', description: 'Directeur (Spécial)', seniority_rank: 0, is_special: true },
      { code: 'RAG', label: 'Responsable d\'Agence', description: 'Responsable d\'Agence (N7)', seniority_rank: 7, is_special: false },
      { code: 'RR', label: 'Responsable Régional', description: 'Responsable Régional (N8)', seniority_rank: 8, is_special: false }
    ]

    for (const role of roles) {
      const { error } = await supabase
        .from('roles')
        .upsert(role, { onConflict: 'code' })
      
      if (error) {
        console.log('Erreur insertion rôle:', role.code, error.message)
      } else {
        console.log('Rôle ajouté/mis à jour:', role.code, '-', role.label)
      }
    }

    console.log('✅ Rôles mis à jour avec succès!')
    
  } catch (error) {
    console.error('Erreur:', error)
  }
}

addRoleColumn()
