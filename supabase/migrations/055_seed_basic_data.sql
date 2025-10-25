-- Migration 055: Insérer les données de base pour roles et permissions

-- Insérer les rôles de base si la table existe et est vide
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles') THEN
        -- Vérifier si la table est vide
        IF NOT EXISTS (SELECT 1 FROM roles LIMIT 1) THEN
            INSERT INTO roles (code, label, system, seniority_rank) VALUES
            ('admin', 'Administrateur', true, 1),
            ('planificateur', 'Planificateur', true, 2),
            ('ca', 'Chargé d''Affaires', true, 3),
            ('resp_site', 'Responsable de site', true, 4),
            ('maintenance', 'Maintenance', true, 5),
            ('rh', 'RH', true, 6),
            ('direction', 'Direction/PMO', true, 7)
            ON CONFLICT (code) DO NOTHING;
            
            RAISE NOTICE 'Rôles de base insérés';
        ELSE
            RAISE NOTICE 'Table roles contient déjà des données';
        END IF;
    ELSE
        RAISE NOTICE 'Table roles n''existe pas';
    END IF;
END $$;

-- Insérer les permissions de base si la table existe et est vide
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'permissions') THEN
        -- Vérifier si la table est vide
        IF NOT EXISTS (SELECT 1 FROM permissions LIMIT 1) THEN
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
            
            RAISE NOTICE 'Permissions de base insérées';
        ELSE
            RAISE NOTICE 'Table permissions contient déjà des données';
        END IF;
    ELSE
        RAISE NOTICE 'Table permissions n''existe pas';
    END IF;
END $$;
