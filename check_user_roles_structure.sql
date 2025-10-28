-- Vérifier la structure des tables user_roles et roles
SELECT 'Vérification structure des tables:' as status;

-- 1. Structure de la table roles
SELECT 
  'roles' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'roles'
ORDER BY ordinal_position;

-- 2. Structure de la table user_roles
SELECT 
  'user_roles' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_roles'
ORDER BY ordinal_position;

-- 3. Vérifier les contraintes de clés étrangères
SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND (tc.table_name = 'user_roles' OR tc.table_name = 'roles');

-- 4. Vérifier les données dans user_roles pour l'admin
SELECT 
  'user_roles data' as info,
  ur.user_id,
  ur.role_id,
  r.code as role_code,
  r.label as role_label
FROM user_roles ur
LEFT JOIN roles r ON ur.role_id = r.id
JOIN auth.users au ON ur.user_id = au.id
WHERE au.email = 'admin@operaflow.com';
