-- Migration 047: Correction de la table roles
-- Vérifier et corriger la structure de la table roles

-- Vérifier si la table roles existe et a la bonne structure
DO $$
BEGIN
    -- Si la table n'existe pas, la créer
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles') THEN
        CREATE TABLE roles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            code TEXT UNIQUE NOT NULL,
            label TEXT NOT NULL,
            system BOOLEAN DEFAULT false,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    ELSE
        -- Si la table existe mais n'a pas la colonne system, l'ajouter
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'roles' AND column_name = 'system'
        ) THEN
            ALTER TABLE roles ADD COLUMN system BOOLEAN DEFAULT false;
        END IF;
        
        -- Si la table existe mais n'a pas la colonne created_at, l'ajouter
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'roles' AND column_name = 'created_at'
        ) THEN
            ALTER TABLE roles ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
    END IF;
END $$;

-- Créer l'index si nécessaire
CREATE INDEX IF NOT EXISTS idx_roles_code ON roles(code);
