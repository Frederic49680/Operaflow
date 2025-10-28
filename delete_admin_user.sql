-- Supprimer l'utilisateur admin existant pour retester
-- ATTENTION : Cela supprimera définitivement l'utilisateur

-- 1. Supprimer les rôles associés
DELETE FROM user_roles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@operaflow.com');

-- 2. Supprimer le profil app_users
DELETE FROM app_users 
WHERE email = 'admin@operaflow.com';

-- 3. Supprimer l'utilisateur Auth (nécessite service_role)
-- Cette commande doit être exécutée avec les droits admin
-- DELETE FROM auth.users WHERE email = 'admin@operaflow.com';

-- Vérifier que l'utilisateur n'existe plus
SELECT 'Vérification suppression:' as status;
SELECT COUNT(*) as users_count FROM auth.users WHERE email = 'admin@operaflow.com';
SELECT COUNT(*) as app_users_count FROM app_users WHERE email = 'admin@operaflow.com';
SELECT COUNT(*) as user_roles_count FROM user_roles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@operaflow.com');
