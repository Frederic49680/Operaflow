-- Migration 057: Forcer l'insertion des données de base

-- Vérifier et insérer les rôles si nécessaire
DO $$
BEGIN
    -- Vérifier si la table roles existe et est vide
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles') THEN
        -- Insérer les rôles s'ils n'existent pas
        INSERT INTO roles (code, label, system, seniority_rank) VALUES
        ('admin', 'Administrateur', true, 1),
        ('planificateur', 'Planificateur', true, 2),
        ('ca', 'Chargé d''Affaires', true, 3),
        ('resp_site', 'Responsable de site', true, 4),
        ('maintenance', 'Maintenance', true, 5),
        ('rh', 'RH', true, 6),
        ('direction', 'Direction/PMO', true, 7)
        ON CONFLICT (code) DO NOTHING;
        
        RAISE NOTICE 'Rôles vérifiés/insérés';
    ELSE
        RAISE NOTICE 'Table roles n''existe pas';
    END IF;
END $$;

-- Vérifier et insérer les permissions si nécessaire
DO $$
BEGIN
    -- Vérifier si la table permissions existe et est vide
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'permissions') THEN
        -- Insérer les permissions si elles n'existent pas
        INSERT INTO permissions (code, label) VALUES
        -- Permissions générales
        ('page.dashboard.read', 'Lire le dashboard'),
        ('page.dashboard.write', 'Écrire le dashboard'),
        ('page.affaires.read', 'Lire les affaires'),
        ('page.affaires.write', 'Écrire les affaires'),
        ('page.planning.read', 'Lire le planning'),
        ('page.planning.write', 'Écrire le planning'),
        ('page.gantt.read', 'Lire le Gantt'),
        ('page.gantt.write', 'Écrire le Gantt'),
        ('page.rh.read', 'Lire le module RH'),
        ('page.rh.write', 'Écrire le module RH'),
        ('page.sites.read', 'Lire les sites'),
        ('page.sites.write', 'Écrire les sites'),
        ('page.maintenance.read', 'Lire la maintenance'),
        ('page.maintenance.write', 'Écrire la maintenance'),
        ('page.claims.read', 'Lire les claims'),
        ('page.claims.write', 'Écrire les claims'),
        ('page.terrain.read', 'Lire les remontées terrain'),
        ('page.terrain.write', 'Écrire les remontées terrain'),
        -- Permissions admin
        ('admin.users.read', 'Lire les utilisateurs'),
        ('admin.users.write', 'Écrire les utilisateurs'),
        ('admin.roles.read', 'Lire les rôles'),
        ('admin.roles.write', 'Écrire les rôles'),
        -- Permissions composants
        ('comp.claims.validate', 'Valider les claims'),
        ('comp.gantt.financeCard', 'Voir la carte finance Gantt'),
        ('comp.dashboard.export', 'Exporter le dashboard')
        ON CONFLICT (code) DO NOTHING;
        
        RAISE NOTICE 'Permissions vérifiées/insérées';
    ELSE
        RAISE NOTICE 'Table permissions n''existe pas';
    END IF;
END $$;

-- Vérifier et insérer les permissions des rôles si nécessaire
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
