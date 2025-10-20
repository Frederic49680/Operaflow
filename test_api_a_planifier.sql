-- Test de l'API /api/affaires/a-planifier

-- 1. Vérifier que la table affaires existe
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'affaires'
ORDER BY ordinal_position;

-- 2. Vérifier que la table affaires_lots_financiers existe
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'affaires_lots_financiers'
ORDER BY ordinal_position;

-- 3. Vérifier les affaires avec statut 'A_planifier'
SELECT 
  id,
  code_affaire,
  nom,
  statut,
  site_id,
  client_id,
  responsable_id
FROM affaires
WHERE statut = 'A_planifier'
ORDER BY created_at DESC;

-- 4. Vérifier les lots financiers
SELECT 
  id,
  affaire_id,
  libelle,
  montant_ht
FROM affaires_lots_financiers
LIMIT 10;

