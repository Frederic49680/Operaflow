-- Migration 058: Nettoyer les anciens rôles non utilisés

-- Supprimer les anciens rôles qui n'ont pas de permissions assignées
-- et qui ne sont pas des rôles système
DO $$
BEGIN
    -- Supprimer les rôles qui n'ont pas de permissions et qui ne sont pas des rôles système
    DELETE FROM roles 
    WHERE id NOT IN (
        SELECT DISTINCT role_id FROM role_permissions
    )
    AND system = false
    AND code NOT IN ('admin', 'planificateur', 'ca', 'resp_site', 'maintenance', 'rh', 'direction');
    
    RAISE NOTICE 'Anciens rôles non utilisés supprimés';
END $$;

-- Vérifier le résultat
DO $$
DECLARE
    role_count INTEGER;
    rec RECORD;
BEGIN
    SELECT COUNT(*) INTO role_count FROM roles;
    RAISE NOTICE 'Nombre de rôles restants: %', role_count;
    
    -- Afficher les rôles restants
    FOR rec IN 
        SELECT code, label, system, 
               (SELECT COUNT(*) FROM role_permissions WHERE role_id = roles.id) as permission_count
        FROM roles 
        ORDER BY system DESC, seniority_rank
    LOOP
        RAISE NOTICE 'Rôle: % (%) - Système: % - Permissions: %', 
            rec.code, rec.label, rec.system, rec.permission_count;
    END LOOP;
END $$;
