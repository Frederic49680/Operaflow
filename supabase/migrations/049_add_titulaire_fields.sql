-- Migration 049: Ajouter les champs titulaire aux tables existantes
-- Cette migration s'exécute après que les tables app_users soient créées

-- Ajouter le champ titulaire_id aux tâches planning (si la table existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'planning_taches') THEN
        ALTER TABLE planning_taches ADD COLUMN IF NOT EXISTS titulaire_id UUID;
        -- Ajouter la contrainte de clé étrangère seulement si la colonne n'existe pas déjà
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'planning_taches_titulaire_id_fkey'
        ) THEN
            ALTER TABLE planning_taches 
            ADD CONSTRAINT planning_taches_titulaire_id_fkey 
            FOREIGN KEY (titulaire_id) REFERENCES app_users(id);
        END IF;
        -- Créer l'index
        CREATE INDEX IF NOT EXISTS idx_planning_taches_titulaire ON planning_taches(titulaire_id);
    END IF;
END $$;

-- Ajouter le champ titulaire_id aux remontées site (si la table existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'remontee_site') THEN
        ALTER TABLE remontee_site ADD COLUMN IF NOT EXISTS titulaire_id UUID;
        -- Ajouter la contrainte de clé étrangère seulement si la colonne n'existe pas déjà
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'remontee_site_titulaire_id_fkey'
        ) THEN
            ALTER TABLE remontee_site 
            ADD CONSTRAINT remontee_site_titulaire_id_fkey 
            FOREIGN KEY (titulaire_id) REFERENCES app_users(id);
        END IF;
        -- Créer l'index
        CREATE INDEX IF NOT EXISTS idx_remontee_site_titulaire ON remontee_site(titulaire_id);
    END IF;
END $$;

-- Ajouter le champ titulaire_id au journal maintenance (si la table existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'maintenance_journal') THEN
        ALTER TABLE maintenance_journal ADD COLUMN IF NOT EXISTS titulaire_id UUID;
        -- Ajouter la contrainte de clé étrangère seulement si la colonne n'existe pas déjà
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'maintenance_journal_titulaire_id_fkey'
        ) THEN
            ALTER TABLE maintenance_journal 
            ADD CONSTRAINT maintenance_journal_titulaire_id_fkey 
            FOREIGN KEY (titulaire_id) REFERENCES app_users(id);
        END IF;
        -- Créer l'index
        CREATE INDEX IF NOT EXISTS idx_maintenance_journal_titulaire ON maintenance_journal(titulaire_id);
    END IF;
END $$;
