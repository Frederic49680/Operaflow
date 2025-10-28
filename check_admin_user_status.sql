-- Vérifier l'état de l'utilisateur admin créé
SELECT 'État actuel de l utilisateur admin:' as status;

-- 1. Vérifier dans auth.users
SELECT 
  'auth.users' as table_name,
  id,
  email,
  email_confirmed_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 'Email confirmé'
    ELSE 'Email non confirmé'
  END as email_status
FROM auth.users 
WHERE email = 'admin@operaflow.com';

-- 2. Vérifier dans app_users
SELECT 
  'app_users' as table_name,
  id,
  email,
  prenom,
  nom,
  active,
  email_verified,
  CASE 
    WHEN active = true THEN 'Actif'
    ELSE 'Inactif'
  END as status
FROM app_users 
WHERE email = 'admin@operaflow.com';

-- 3. Vérifier les rôles assignés
SELECT 
  'user_roles' as table_name,
  ur.user_id,
  r.code as role_code,
  r.label as role_label,
  CASE 
    WHEN r.code = 'ADMIN' THEN 'Rôle admin'
    ELSE 'Autre rôle'
  END as role_status
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
JOIN auth.users au ON ur.user_id = au.id
WHERE au.email = 'admin@operaflow.com';

-- 4. Vérifier les permissions admin
SELECT 
  'permissions' as table_name,
  COUNT(*) as permissions_count,
  CASE 
    WHEN COUNT(*) > 0 THEN 'Permissions assignées'
    ELSE 'Aucune permission'
  END as permissions_status
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN user_roles ur ON ur.role_id = r.id
JOIN auth.users au ON ur.user_id = au.id
WHERE au.email = 'admin@operaflow.com';
