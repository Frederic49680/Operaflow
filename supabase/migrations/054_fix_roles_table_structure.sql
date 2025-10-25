-- Migration 054: Corriger la structure de la table roles

-- Vérifier et corriger la table roles
DO $$
BEGIN
    -- Vérifier si la table roles existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles') THEN
        -- Vérifier si la colonne id existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roles' AND column_name = 'id') THEN
            -- Vérifier s'il y a déjà une clé primaire
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE table_name = 'roles' AND constraint_type = 'PRIMARY KEY'
            ) THEN
                -- Ajouter la colonne id avec clé primaire
                ALTER TABLE roles ADD COLUMN id UUID PRIMARY KEY DEFAULT gen_random_uuid();
                RAISE NOTICE 'Colonne id ajoutée à la table roles avec clé primaire';
            ELSE
                -- Ajouter la colonne id sans clé primaire
                ALTER TABLE roles ADD COLUMN id UUID DEFAULT gen_random_uuid();
                RAISE NOTICE 'Colonne id ajoutée à la table roles (clé primaire existante)';
            END IF;
        END IF;
        
        -- Vérifier si la colonne code existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roles' AND column_name = 'code') THEN
            -- Ajouter la colonne code si elle n'existe pas
            ALTER TABLE roles ADD COLUMN code TEXT UNIQUE;
            RAISE NOTICE 'Colonne code ajoutée à la table roles';
        END IF;
        
        -- Vérifier si la colonne label existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roles' AND column_name = 'label') THEN
            -- Ajouter la colonne label si elle n'existe pas
            ALTER TABLE roles ADD COLUMN label TEXT;
            RAISE NOTICE 'Colonne label ajoutée à la table roles';
        END IF;
    ELSE
        RAISE NOTICE 'Table roles n''existe pas';
    END IF;
END $$;

-- Vérifier et corriger la table permissions
DO $$
BEGIN
    -- Vérifier si la table permissions existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'permissions') THEN
        -- Vérifier si la colonne id existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'permissions' AND column_name = 'id') THEN
            -- Vérifier s'il y a déjà une clé primaire
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE table_name = 'permissions' AND constraint_type = 'PRIMARY KEY'
            ) THEN
                -- Ajouter la colonne id avec clé primaire
                ALTER TABLE permissions ADD COLUMN id UUID PRIMARY KEY DEFAULT gen_random_uuid();
                RAISE NOTICE 'Colonne id ajoutée à la table permissions avec clé primaire';
            ELSE
                -- Ajouter la colonne id sans clé primaire
                ALTER TABLE permissions ADD COLUMN id UUID DEFAULT gen_random_uuid();
                RAISE NOTICE 'Colonne id ajoutée à la table permissions (clé primaire existante)';
            END IF;
        END IF;
        
        -- Vérifier si la colonne code existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'permissions' AND column_name = 'code') THEN
            -- Ajouter la colonne code si elle n'existe pas
            ALTER TABLE permissions ADD COLUMN code TEXT UNIQUE;
            RAISE NOTICE 'Colonne code ajoutée à la table permissions';
        END IF;
        
        -- Vérifier si la colonne label existe
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'permissions' AND column_name = 'label') THEN
            -- Ajouter la colonne label si elle n'existe pas
            ALTER TABLE permissions ADD COLUMN label TEXT;
            RAISE NOTICE 'Colonne label ajoutée à la table permissions';
        END IF;
    ELSE
        RAISE NOTICE 'Table permissions n''existe pas';
    END IF;
END $$;
