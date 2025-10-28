-- Assigner le rôle USER à l'utilisateur récemment créé
-- (remplacer USER_ID par l'ID de l'utilisateur créé)

-- 1. Trouver l'ID du rôle USER
SELECT 
  'Rôle USER:' as status,
  id as role_id,
  code,
  label
FROM roles 
WHERE code = 'USER';

-- 2. Assigner le rôle à l'utilisateur récent
-- (remplacer USER_ID par l'ID trouvé dans la requête précédente)
/*
INSERT INTO user_roles (user_id, role_id)
VALUES ('USER_ID', 'ROLE_ID');
*/

-- 3. Vérifier l'assignation
SELECT 
  'Vérification:' as status,
  ur.user_id,
  au.email,
  r.code as role_code,
  r.label as role_label,
  ur.created_at
FROM user_roles ur
JOIN auth.users au ON ur.user_id = au.id
JOIN roles r ON ur.role_id = r.id
WHERE au.email != 'admin@operaflow.com'
ORDER BY ur.created_at DESC;
