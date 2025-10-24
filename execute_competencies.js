const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rrmvejpwbkwlmyjhnxaz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createCompetencies() {
  try {
    // Créer la table competencies
    const { error: competenciesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.competencies (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          code text NOT NULL UNIQUE,
          label text NOT NULL,
          description text,
          actif boolean DEFAULT true,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );
      `
    })
    
    if (competenciesError) {
      console.log('Table competencies existe déjà ou erreur:', competenciesError.message)
    }

    // Insérer des compétences par défaut
    const competencies = [
      { code: 'AUTO', label: 'Automatisme', description: 'Compétences en automatisme et régulation' },
      { code: 'ELEC', label: 'Électricité', description: 'Compétences en électricité industrielle' },
      { code: 'CVC', label: 'Chauffage Ventilation Climatisation', description: 'Compétences en CVC' },
      { code: 'SECU', label: 'Sécurité', description: 'Compétences en sécurité et prévention' },
      { code: 'QUAL', label: 'Qualité', description: 'Compétences en qualité et normes' },
      { code: 'GEST', label: 'Gestion', description: 'Compétences en gestion de projet' },
      { code: 'FORM', label: 'Formation', description: 'Compétences en formation et encadrement' },
      { code: 'MAINT', label: 'Maintenance', description: 'Compétences en maintenance industrielle' },
      { code: 'INFO', label: 'Informatique', description: 'Compétences en informatique et digital' },
      { code: 'COMM', label: 'Communication', description: 'Compétences en communication et relation client' }
    ]

    for (const comp of competencies) {
      const { error } = await supabase
        .from('competencies')
        .upsert(comp, { onConflict: 'code' })
      
      if (error) {
        console.log('Erreur insertion compétence:', comp.code, error.message)
      } else {
        console.log('Compétence ajoutée:', comp.code)
      }
    }

    // Créer la table roles
    const { error: rolesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.roles (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          code text NOT NULL UNIQUE,
          label text NOT NULL,
          description text,
          seniority_rank integer DEFAULT 0,
          is_special boolean DEFAULT false,
          actif boolean DEFAULT true,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );
      `
    })
    
    if (rolesError) {
      console.log('Table roles existe déjà ou erreur:', rolesError.message)
    }

    // Insérer des rôles par défaut
    const roles = [
      { code: 'TECH', label: 'Technicien', description: 'Technicien de terrain', seniority_rank: 1, is_special: false },
      { code: 'CHEF', label: 'Chef d\'équipe', description: 'Chef d\'équipe technique', seniority_rank: 2, is_special: false },
      { code: 'RESP', label: 'Responsable', description: 'Responsable technique', seniority_rank: 3, is_special: false },
      { code: 'EXPERT', label: 'Expert', description: 'Expert technique', seniority_rank: 4, is_special: true },
      { code: 'MANAGER', label: 'Manager', description: 'Manager de projet', seniority_rank: 5, is_special: true },
      { code: 'DIR', label: 'Directeur', description: 'Directeur technique', seniority_rank: 6, is_special: true }
    ]

    for (const role of roles) {
      const { error } = await supabase
        .from('roles')
        .upsert(role, { onConflict: 'code' })
      
      if (error) {
        console.log('Erreur insertion rôle:', role.code, error.message)
      } else {
        console.log('Rôle ajouté:', role.code)
      }
    }

    console.log('✅ Compétences et rôles créés avec succès!')
    
  } catch (error) {
    console.error('Erreur:', error)
  }
}

createCompetencies()
