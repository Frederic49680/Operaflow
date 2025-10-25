-- Migration 048: Données de base pour la gestion des utilisateurs (version simple)
-- Insère seulement les données essentielles

-- Insérer les rôles par défaut (sans la colonne system si elle n'existe pas)
DO $$
BEGIN
    -- Vérifier si la colonne system existe
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'roles' AND column_name = 'system'
    ) THEN
        -- Insérer avec la colonne system
        INSERT INTO roles (code, label, system) VALUES
        ('admin', 'Administrateur', true),
        ('planificateur', 'Planificateur', true),
        ('ca', 'Chargé d''Affaires', true),
        ('resp_site', 'Responsable de site', true),
        ('maintenance', 'Maintenance', true),
        ('rh', 'RH', true),
        ('direction', 'Direction/PMO', true)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        -- Insérer sans la colonne system
        INSERT INTO roles (code, label) VALUES
        ('admin', 'Administrateur'),
        ('planificateur', 'Planificateur'),
        ('ca', 'Chargé d''Affaires'),
        ('resp_site', 'Responsable de site'),
        ('maintenance', 'Maintenance'),
        ('rh', 'RH'),
        ('direction', 'Direction/PMO')
        ON CONFLICT (code) DO NOTHING;
    END IF;
END $$;

-- Insérer les permissions seulement si la table existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'permissions') THEN
        INSERT INTO permissions (code, label) VALUES
        -- Permissions générales
        ('page.dashboard.read', 'Lire le dashboard'),
        ('page.dashboard.write', 'Écrire le dashboard'),
        ('page.affaires.read', 'Lire les affaires'),
        ('page.affaires.write', 'Écrire les affaires'),
        ('page.planning.read', 'Lire le planning'),
        ('page.planning.write', 'Écrire le planning'),
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
    END IF;
END $$;
