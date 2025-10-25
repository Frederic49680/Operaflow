-- Migration 053: Insérer les permissions par défaut pour les rôles

-- Insérer les permissions seulement si les tables existent
DO $$
DECLARE
    admin_role_id UUID;
    planificateur_role_id UUID;
    ca_role_id UUID;
    resp_site_role_id UUID;
    maintenance_role_id UUID;
    rh_role_id UUID;
    direction_role_id UUID;
BEGIN
    -- Vérifier que les tables existent
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles') THEN
        RAISE NOTICE 'Table roles n''existe pas, arrêt de la migration';
        RETURN;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'permissions') THEN
        RAISE NOTICE 'Table permissions n''existe pas, arrêt de la migration';
        RETURN;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'role_permissions') THEN
        RAISE NOTICE 'Table role_permissions n''existe pas, arrêt de la migration';
        RETURN;
    END IF;

    -- Récupérer les IDs des rôles
    SELECT id INTO admin_role_id FROM roles WHERE code = 'admin' LIMIT 1;
    SELECT id INTO planificateur_role_id FROM roles WHERE code = 'planificateur' LIMIT 1;
    SELECT id INTO ca_role_id FROM roles WHERE code = 'ca' LIMIT 1;
    SELECT id INTO resp_site_role_id FROM roles WHERE code = 'resp_site' LIMIT 1;
    SELECT id INTO maintenance_role_id FROM roles WHERE code = 'maintenance' LIMIT 1;
    SELECT id INTO rh_role_id FROM roles WHERE code = 'rh' LIMIT 1;
    SELECT id INTO direction_role_id FROM roles WHERE code = 'direction' LIMIT 1;

    -- Permissions pour l'admin (toutes les permissions)
    IF admin_role_id IS NOT NULL THEN
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT admin_role_id, p.id
        FROM permissions p
        ON CONFLICT (role_id, permission_id) DO NOTHING;
        
        RAISE NOTICE 'Permissions admin ajoutées';
    END IF;

    -- Permissions pour le planificateur
    IF planificateur_role_id IS NOT NULL THEN
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT planificateur_role_id, p.id
        FROM permissions p
        WHERE p.code IN (
            'page.dashboard.read',
            'page.planning.read',
            'page.planning.write',
            'page.gantt.read',
            'page.gantt.write',
            'page.affaires.read',
            'page.sites.read'
        )
        ON CONFLICT (role_id, permission_id) DO NOTHING;
        
        RAISE NOTICE 'Permissions planificateur ajoutées';
    END IF;

    -- Permissions pour le CA
    IF ca_role_id IS NOT NULL THEN
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT ca_role_id, p.id
        FROM permissions p
        WHERE p.code IN (
            'page.dashboard.read',
            'page.affaires.read',
            'page.affaires.write',
            'page.claims.read',
            'page.claims.write'
        )
        ON CONFLICT (role_id, permission_id) DO NOTHING;
        
        RAISE NOTICE 'Permissions CA ajoutées';
    END IF;

    -- Permissions pour le responsable de site
    IF resp_site_role_id IS NOT NULL THEN
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT resp_site_role_id, p.id
        FROM permissions p
        WHERE p.code IN (
            'page.dashboard.read',
            'page.terrain.read',
            'page.terrain.write',
            'page.maintenance.read',
            'page.maintenance.write'
        )
        ON CONFLICT (role_id, permission_id) DO NOTHING;
        
        RAISE NOTICE 'Permissions resp_site ajoutées';
    END IF;

    -- Permissions pour la maintenance
    IF maintenance_role_id IS NOT NULL THEN
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT maintenance_role_id, p.id
        FROM permissions p
        WHERE p.code IN (
            'page.maintenance.read',
            'page.maintenance.write'
        )
        ON CONFLICT (role_id, permission_id) DO NOTHING;
        
        RAISE NOTICE 'Permissions maintenance ajoutées';
    END IF;

    -- Permissions pour RH
    IF rh_role_id IS NOT NULL THEN
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT rh_role_id, p.id
        FROM permissions p
        WHERE p.code IN (
            'page.rh.read',
            'page.rh.write',
            'page.sites.read'
        )
        ON CONFLICT (role_id, permission_id) DO NOTHING;
        
        RAISE NOTICE 'Permissions RH ajoutées';
    END IF;

    -- Permissions pour la direction
    IF direction_role_id IS NOT NULL THEN
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT direction_role_id, p.id
        FROM permissions p
        WHERE p.code IN (
            'page.dashboard.read',
            'page.affaires.read',
            'page.claims.read'
        )
        ON CONFLICT (role_id, permission_id) DO NOTHING;
        
        RAISE NOTICE 'Permissions direction ajoutées';
    END IF;

END $$;
