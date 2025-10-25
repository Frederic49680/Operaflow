-- Migration 052: Créer la table role_permissions (version simplifiée)

-- Vérifier d'abord si les tables existent
DO $$
BEGIN
    -- Créer la table role_permissions seulement si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'role_permissions') THEN
        -- Table de liaison entre rôles et permissions
        CREATE TABLE role_permissions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            role_id UUID NOT NULL,
            permission_id UUID NOT NULL,
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
    END IF;
END $$;

-- Les contraintes de clé étrangère seront ajoutées dans une migration ultérieure
-- après que les tables roles et permissions aient été corrigées
