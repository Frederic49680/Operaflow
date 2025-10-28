-- Vérifier les permissions du rôle ADMIN
SELECT 
    r.code as role_code,
    r.label as role_label,
    p.code as permission_code,
    p.label as permission_label
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.code = 'ADMIN'
ORDER BY p.code;

-- Si aucune permission trouvée, créer toutes les permissions pour ADMIN
DO $$
DECLARE
    v_role_id UUID;
    v_permission_id UUID;
    permission_record RECORD;
BEGIN
    -- Récupérer l'ID du rôle ADMIN
    SELECT id INTO v_role_id 
    FROM roles 
    WHERE code = 'ADMIN';
    
    IF v_role_id IS NULL THEN
        RAISE EXCEPTION 'Rôle ADMIN non trouvé';
    END IF;
    
    -- Assigner toutes les permissions au rôle ADMIN
    FOR permission_record IN 
        SELECT id, code FROM permissions ORDER BY code
    LOOP
        -- Vérifier si la permission est déjà assignée
        IF NOT EXISTS (
            SELECT 1 FROM role_permissions 
            WHERE role_id = v_role_id AND permission_id = permission_record.id
        ) THEN
            INSERT INTO role_permissions (role_id, permission_id)
            VALUES (v_role_id, permission_record.id);
            
            RAISE NOTICE 'Permission assignée: %', permission_record.code;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Toutes les permissions ont été assignées au rôle ADMIN';
END $$;
