-- Script pour créer un utilisateur admin complet
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer l'utilisateur dans auth.users (via l'interface Supabase d'abord)
-- Puis exécuter ce script :

DO $$
DECLARE
    v_user_id UUID;
    v_role_id UUID;
BEGIN
    -- Récupérer l'ID de l'utilisateur admin
    SELECT id INTO v_user_id 
    FROM auth.users 
    WHERE email = 'admin@operaflow.com';
    
    -- Vérifier que l'utilisateur existe
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Utilisateur admin@operaflow.com non trouvé dans auth.users';
    END IF;
    
    -- Récupérer l'ID du rôle ADMIN
    SELECT id INTO v_role_id 
    FROM roles 
    WHERE code = 'ADMIN';
    
    -- Vérifier que le rôle existe
    IF v_role_id IS NULL THEN
        RAISE EXCEPTION 'Rôle ADMIN non trouvé';
    END IF;
    
    -- Créer le profil dans app_users
    INSERT INTO app_users (
        id,
        email,
        prenom,
        nom,
        active,
        email_verified,
        force_pwd_change,
        created_at
    ) VALUES (
        v_user_id,
        'admin@operaflow.com',
        'Admin',
        'OperaFlow',
        true,
        true,
        false,
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        prenom = EXCLUDED.prenom,
        nom = EXCLUDED.nom,
        active = EXCLUDED.active,
        email_verified = EXCLUDED.email_verified,
        force_pwd_change = EXCLUDED.force_pwd_change;
    
    -- Assigner le rôle admin
    INSERT INTO user_roles (user_id, role_id)
    VALUES (v_user_id, v_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
    
    RAISE NOTICE 'Utilisateur admin créé avec succès !';
    RAISE NOTICE 'Email: admin@operaflow.com';
    RAISE NOTICE 'User ID: %', v_user_id;
    RAISE NOTICE 'Role ID: %', v_role_id;
    
END $$;
