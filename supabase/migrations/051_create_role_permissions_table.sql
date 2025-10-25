-- Migration 051: Créer la table role_permissions pour lier les rôles aux permissions

-- Table de liaison entre rôles et permissions
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);

-- RLS (Row Level Security)
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour role_permissions
CREATE POLICY "Allow all authenticated read access to role_permissions" ON role_permissions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin write access to role_permissions" ON role_permissions FOR ALL USING (auth.role() = 'admin') WITH CHECK (auth.role() = 'admin');

-- Insérer quelques permissions par défaut pour les rôles système
DO $$
BEGIN
    -- Permissions pour l'admin (toutes les permissions)
    IF EXISTS (SELECT 1 FROM roles WHERE code = 'admin') AND EXISTS (SELECT 1 FROM permissions WHERE code = 'admin.users.read') THEN
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT roles_table.id, permissions_table.id
        FROM roles roles_table
        CROSS JOIN permissions permissions_table
        WHERE roles_table.code = 'admin'
        ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;

    -- Permissions pour le planificateur
    IF EXISTS (SELECT 1 FROM roles WHERE code = 'planificateur') THEN
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT roles_table.id, permissions_table.id
        FROM roles roles_table
        CROSS JOIN permissions permissions_table
        WHERE roles_table.code = 'planificateur'
        AND permissions_table.code IN (
            'page.dashboard.read',
            'page.planning.read',
            'page.planning.write',
            'page.gantt.read',
            'page.gantt.write',
            'page.affaires.read',
            'page.sites.read'
        )
        ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;

    -- Permissions pour le CA
    IF EXISTS (SELECT 1 FROM roles WHERE code = 'ca') THEN
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT roles_table.id, permissions_table.id
        FROM roles roles_table
        CROSS JOIN permissions permissions_table
        WHERE roles_table.code = 'ca'
        AND permissions_table.code IN (
            'page.dashboard.read',
            'page.affaires.read',
            'page.affaires.write',
            'page.claims.read',
            'page.claims.write'
        )
        ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;

    -- Permissions pour le responsable de site
    IF EXISTS (SELECT 1 FROM roles WHERE code = 'resp_site') THEN
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT roles_table.id, permissions_table.id
        FROM roles roles_table
        CROSS JOIN permissions permissions_table
        WHERE roles_table.code = 'resp_site'
        AND permissions_table.code IN (
            'page.dashboard.read',
            'page.terrain.read',
            'page.terrain.write',
            'page.maintenance.read',
            'page.maintenance.write'
        )
        ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;

    -- Permissions pour la maintenance
    IF EXISTS (SELECT 1 FROM roles WHERE code = 'maintenance') THEN
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT roles_table.id, permissions_table.id
        FROM roles roles_table
        CROSS JOIN permissions permissions_table
        WHERE roles_table.code = 'maintenance'
        AND permissions_table.code IN (
            'page.maintenance.read',
            'page.maintenance.write'
        )
        ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;

    -- Permissions pour RH
    IF EXISTS (SELECT 1 FROM roles WHERE code = 'rh') THEN
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT roles_table.id, permissions_table.id
        FROM roles roles_table
        CROSS JOIN permissions permissions_table
        WHERE roles_table.code = 'rh'
        AND permissions_table.code IN (
            'page.rh.read',
            'page.rh.write',
            'page.sites.read'
        )
        ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;

    -- Permissions pour la direction
    IF EXISTS (SELECT 1 FROM roles WHERE code = 'direction') THEN
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT roles_table.id, permissions_table.id
        FROM roles roles_table
        CROSS JOIN permissions permissions_table
        WHERE roles_table.code = 'direction'
        AND permissions_table.code IN (
            'page.dashboard.read',
            'page.affaires.read',
            'page.claims.read'
        )
        ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;
END $$;
