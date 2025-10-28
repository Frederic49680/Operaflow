-- Vérifier les rôles disponibles
SELECT 'Rôles disponibles:' as status;
SELECT id, code, label FROM roles ORDER BY code;

-- Vérifier les utilisateurs récents sans rôle
SELECT 
  'Utilisateurs sans rôle:' as status,
  au.id as user_id,
  au.email,
  au.created_at,
  '❌ Pas de rôle assigné' as role_status
FROM auth.users au
LEFT JOIN user_roles ur ON au.id = ur.user_id
WHERE ur.user_id IS NULL
  AND au.email != 'admin@operaflow.com'
ORDER BY au.created_at DESC;

-- Vérifier les utilisateurs avec rôle
SELECT 
  'Utilisateurs avec rôle:' as status,
  ur.user_id,
  au.email,
  r.code as role_code,
  r.label as role_label
FROM user_roles ur
JOIN auth.users au ON ur.user_id = au.id
JOIN roles r ON ur.role_id = r.id
ORDER BY ur.created_at DESC;
