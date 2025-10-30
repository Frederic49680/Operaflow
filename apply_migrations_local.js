/**
 * Script pour appliquer les migrations 088-091 sur Supabase local
 * Port 3000 (base de données locale)
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration Supabase local
const SUPABASE_URL = 'http://localhost:54321';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Créer le client Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
  },
});

async function applyMigration(migrationFile) {
  const filePath = path.join(__dirname, 'supabase', 'migrations', migrationFile);
  const sql = fs.readFileSync(filePath, 'utf-8');

  console.log(`\n📄 Application de ${migrationFile}...`);

  try {
    // Exécuter le SQL via l'API Supabase (fonction SQL directe)
    const { data, error } = await supabase.rpc('exec_sql', { 
      query: sql 
    });

    if (error) {
      // Si exec_sql n'existe pas, utiliser l'endpoint SQL direct
      console.log('⚠️  exec_sql non disponible, utilisation alternative...');
      
      // Pour Supabase local, nous devons utiliser l'API REST directement
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ query: sql }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erreur: ${response.status} - ${errorText}`);
        throw new Error(`Migration échouée: ${migrationFile}`);
      }

      console.log(`✅ ${migrationFile} appliquée avec succès`);
    } else {
      console.log(`✅ ${migrationFile} appliquée avec succès`);
    }
  } catch (error) {
    console.error(`❌ Erreur lors de l'application de ${migrationFile}:`, error.message);
    
    // Essayer une alternative : exécuter via psql si disponible
    console.log('💡 Tentative d\'exécution via psql...');
    const { exec } = require('child_process');
    
    exec(`psql postgresql://postgres:postgres@localhost:54322/postgres -c "${sql.replace(/"/g, '\\"')}"`, 
      (err, stdout, stderr) => {
        if (err) {
          console.error('❌ Erreur psql:', err);
          throw err;
        }
        console.log('✅ Exécution psql réussie');
        console.log(stdout);
      }
    );
  }
}

async function main() {
  console.log('🚀 Début de l\'application des migrations locales (088-091)');
  console.log(`📍 URL Supabase: ${SUPABASE_URL}`);

  const migrations = [
    '088_create_job_functions_table.sql',
    '089_clarify_roles_and_job_functions.sql',
    '090_fix_role_references_to_job_functions.sql',
    '091_create_roles_clarification_views.sql',
  ];

  for (const migration of migrations) {
    await applyMigration(migration);
  }

  console.log('\n✨ Toutes les migrations ont été appliquées avec succès !');
}

main().catch((error) => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});

