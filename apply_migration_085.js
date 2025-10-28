const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://rrmvejpwbkwlmyjhnxaz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration085() {
  try {
    console.log('🔄 Application de la migration 085 (désactivation RLS)...');
    
    // Utiliser l'API REST directement pour exécuter le SQL
    const migrationSQL = fs.readFileSync('supabase/migrations/085_disable_rls_temporarily.sql', 'utf8');
    
    // Diviser le SQL en commandes individuelles
    const commands = migrationSQL.split(';').filter(cmd => cmd.trim());
    
    for (const command of commands) {
      if (command.trim()) {
        console.log('Exécution:', command.trim().substring(0, 50) + '...');
        
        // Utiliser une requête SQL brute via l'API REST
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({ sql: command.trim() })
        });
        
        if (!response.ok) {
          console.log('⚠️ Commande ignorée (fonction exec non disponible)');
        }
      }
    }
    
    // Test direct de l'accès
    console.log('🧪 Test d\'accès direct...');
    const { data: requests, error: selectError } = await supabase
      .from('access_requests')
      .select('*');
    
    if (selectError) {
      console.log('❌ Erreur lecture:', selectError);
    } else {
      console.log('✅ Lecture réussie:', requests?.length || 0, 'demandes');
    }
    
    // Test d'insertion
    console.log('🧪 Test d\'insertion...');
    const { data: insertData, error: insertError } = await supabase
      .from('access_requests')
      .insert({
        email: 'test-rls@example.com',
        prenom: 'Test',
        nom: 'RLS',
        message: 'Test après désactivation RLS',
        statut: 'pending'
      })
      .select();
    
    if (insertError) {
      console.log('❌ Erreur insertion:', insertError);
    } else {
      console.log('✅ Insertion réussie:', insertData);
      
      // Supprimer le test
      if (insertData && insertData[0]) {
        await supabase
          .from('access_requests')
          .delete()
          .eq('id', insertData[0].id);
        console.log('🧹 Test supprimé');
      }
    }
    
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  }
}

applyMigration085();
