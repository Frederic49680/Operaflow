#!/usr/bin/env node
/**
 * Script pour appliquer les migrations 088-091 sur Supabase local via API REST
 * Port 3001 (base de données locale)
 */

const fs = require('fs');
const path = require('path');

// Configuration Supabase local (port 3001)
const SUPABASE_URL = 'http://localhost:3001';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

async function execSQL(sql) {
  const endpoint = `${SUPABASE_URL}/rest/v1/rpc/exec_sql`;
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    // Si exec_sql n'existe pas, tenter via l'endpoint direct SQL
    console.log('⚠️  exec_sql non disponible, tentative alternative...');
    
    // Alternative: utiliser l'endpoint SQL Editor de Supabase
    const sqlEndpoint = `${SUPABASE_URL}/rest/v1/rpc/sql`;
    const sqlResponse = await fetch(sqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!sqlResponse.ok) {
      throw new Error(`SQL endpoint failed: ${sqlResponse.status}`);
    }

    return await sqlResponse.json();
  }
}

async function applyMigration(migrationFile) {
  const filePath = path.join(__dirname, 'supabase', 'migrations', migrationFile);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Fichier introuvable: ${filePath}`);
  }

  const sql = fs.readFileSync(filePath, 'utf-8');

  console.log(`\n📄 Application de ${migrationFile}...`);

  try {
    await execSQL(sql);
    console.log(`✅ ${migrationFile} appliquée avec succès`);
  } catch (error) {
    console.error(`❌ Erreur lors de l'application de ${migrationFile}:`);
    console.error(error.message);
    
    // Proposer d'exécuter manuellement dans l'UI
    console.log(`\n💡 Conseil: Copiez le contenu de ${filePath}`);
    console.log(`   et exécutez-le manuellement dans l'interface Supabase.`);
    throw error;
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

  try {
    for (const migration of migrations) {
      await applyMigration(migration);
    }

    console.log('\n✨ Toutes les migrations ont été appliquées avec succès !');
    console.log('\n📊 Vérifications:');
    console.log('   - SELECT * FROM job_functions;');
    console.log('   - SELECT * FROM v_roles_clarification;');
  } catch (error) {
    console.error('\n💥 Erreur fatale:', error.message);
    console.log('\n📋 Pour appliquer manuellement:');
    console.log('   1. Ouvrez http://localhost:3001');
    console.log('   2. Allez dans SQL Editor');
    console.log('   3. Copiez le contenu de chaque fichier de migration');
    console.log('   4. Exécutez dans l\'ordre 088 → 089 → 090 → 091');
    process.exit(1);
  }
}

main();
