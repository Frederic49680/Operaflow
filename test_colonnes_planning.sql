-- Script de vérification des colonnes de planning_taches
-- À exécuter dans le SQL Editor de Supabase

-- RÉSULTAT UNIQUE avec toutes les infos
SELECT 
  'COLONNES_PLANNING_TACHES' as section,
  string_agg(column_name, ', ' ORDER BY ordinal_position) as colonnes_disponibles
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'planning_taches'

UNION ALL

SELECT 
  'VÉRIFICATIONS_MIGRATION_039' as section,
  string_agg(
    CASE 
      WHEN column_name = 'level' THEN '✅ level'
      WHEN column_name = 'parent_id' THEN '✅ parent_id' 
      WHEN column_name = 'order_index' THEN '✅ order_index'
      WHEN column_name = 'is_milestone' THEN '✅ is_milestone'
      WHEN column_name = 'manual' THEN '✅ manual'
      WHEN column_name = 'template_origin_id' THEN '✅ template_origin_id'
    END, ', '
  ) as colonnes_migration_039
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'planning_taches'
  AND column_name IN ('level', 'parent_id', 'order_index', 'is_milestone', 'manual', 'template_origin_id')

UNION ALL

SELECT 
  'NOMBRE_TACHES' as section,
  COUNT(*)::text as nb_taches 
FROM planning_taches

UNION ALL

SELECT 
  'TASK_TEMPLATES' as section,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'task_templates'
  ) THEN '✅ task_templates existe' ELSE '❌ task_templates manquante' END as check_table;

