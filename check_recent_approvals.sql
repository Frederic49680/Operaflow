-- Vérifier l'état après approbation d'une demande
SELECT 'État après approbation:' as status;

-- 1. Vérifier les utilisateurs récemment créés dans auth.users
SELECT 
  'auth.users récents' as table_name,
  id,
  email,
  created_at,
  CASE 
    WHEN created_at > NOW() - INTERVAL '1 hour' THEN '🆕 Récent'
    ELSE '⏰ Ancien'
  END as age
FROM auth.users 
WHERE email LIKE '%@%'
ORDER BY created_at DESC
LIMIT 5;

-- 2. Vérifier les profils app_users récents
SELECT 
  'app_users récents' as table_name,
  id,
  email,
  prenom,
  nom,
  created_at,
  CASE 
    WHEN created_at > NOW() - INTERVAL '1 hour' THEN '🆕 Récent'
    ELSE '⏰ Ancien'
  END as age
FROM app_users 
ORDER BY created_at DESC
LIMIT 5;

-- 3. Vérifier les rôles assignés récemment
SELECT 
  'user_roles récents' as table_name,
  ur.user_id,
  ur.role_id,
  au.email,
  r.code as role_code,
  ur.created_at,
  CASE 
    WHEN ur.created_at > NOW() - INTERVAL '1 hour' THEN '🆕 Récent'
    ELSE '⏰ Ancien'
  END as age
FROM user_roles ur
JOIN auth.users au ON ur.user_id = au.id
LEFT JOIN roles r ON ur.role_id = r.id
ORDER BY ur.created_at DESC
LIMIT 5;

-- 4. Vérifier les demandes d'accès récentes
SELECT 
  'access_requests récents' as table_name,
  id,
  email,
  prenom,
  nom,
  statut,
  processed_at,
  CASE 
    WHEN processed_at > NOW() - INTERVAL '1 hour' THEN '🆕 Récent'
    ELSE '⏰ Ancien'
  END as age
FROM access_requests 
ORDER BY created_at DESC
LIMIT 5;

