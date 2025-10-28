-- Vérifier l'état après suppression
SELECT 'État après suppression:' as status;

-- Vérifier auth.users
SELECT 
  'auth.users' as table_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ Supprimé'
    ELSE '❌ Encore présent'
  END as status
FROM auth.users 
WHERE email = 'admin@operaflow.com';

-- Vérifier app_users
SELECT 
  'app_users' as table_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ Supprimé'
    ELSE '❌ Encore présent'
  END as status
FROM app_users 
WHERE email = 'admin@operaflow.com';

-- Vérifier user_roles
SELECT 
  'user_roles' as table_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ Supprimé'
    ELSE '❌ Encore présent'
  END as status
FROM user_roles ur
JOIN auth.users au ON ur.user_id = au.id
WHERE au.email = 'admin@operaflow.com';
