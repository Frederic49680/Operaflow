const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variables SUPABASE manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAbsencesSchema() {
  console.log('🔍 Vérification du schéma de la table absences...');
  
  const { data, error } = await supabase.rpc('exec_sql', { 
    sql: `
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'absences' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `
  });
  
  if (error) {
    console.error('❌ Erreur:', error.message);
    return;
  }
  
  console.log('📋 Colonnes de la table absences:');
  data.forEach(col => {
    console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
  });
  
  // Vérifier les contraintes CHECK
  const { data: constraints, error: constraintError } = await supabase.rpc('exec_sql', { 
    sql: `
      SELECT 
        conname as constraint_name,
        pg_get_constraintdef(oid) as constraint_definition
      FROM pg_constraint 
      WHERE conrelid = 'public.absences'::regclass 
      AND contype = 'c';
    `
  });
  
  if (constraintError) {
    console.error('❌ Erreur contraintes:', constraintError.message);
    return;
  }
  
  console.log('🔒 Contraintes CHECK:');
  constraints.forEach(constraint => {
    console.log(`  - ${constraint.constraint_name}: ${constraint.constraint_definition}`);
  });
}

checkAbsencesSchema();
