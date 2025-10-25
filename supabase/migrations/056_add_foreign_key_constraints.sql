-- Migration 056: Ajouter les contraintes de clé étrangère pour role_permissions

-- Ajouter les contraintes de clé étrangère seulement si les tables et colonnes existent
DO $$
BEGIN
    -- Vérifier que la table role_permissions existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'role_permissions') THEN
        
        -- Ajouter la contrainte pour role_id si la table roles existe et a une colonne id
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles') 
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roles' AND column_name = 'id') THEN
            
            -- S'assurer que la colonne id est unique
            BEGIN
                ALTER TABLE roles ADD CONSTRAINT roles_id_unique UNIQUE (id);
                RAISE NOTICE 'Contrainte unique ajoutée à roles.id';
            EXCEPTION
                WHEN duplicate_object THEN
                    RAISE NOTICE 'Contrainte unique sur roles.id existe déjà';
            END;
            
            -- Maintenant ajouter la contrainte de clé étrangère
            BEGIN
                ALTER TABLE role_permissions ADD CONSTRAINT fk_role_permissions_role_id FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE;
                RAISE NOTICE 'Contrainte fk_role_permissions_role_id ajoutée';
            EXCEPTION
                WHEN duplicate_object THEN
                    RAISE NOTICE 'Contrainte fk_role_permissions_role_id existe déjà';
            END;
        ELSE
            RAISE NOTICE 'Table roles ou colonne id manquante, contrainte role_id non ajoutée';
        END IF;

        -- Ajouter la contrainte pour permission_id si la table permissions existe et a une colonne id
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'permissions') 
           AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'permissions' AND column_name = 'id') THEN
            
            -- S'assurer que la colonne id est unique
            BEGIN
                ALTER TABLE permissions ADD CONSTRAINT permissions_id_unique UNIQUE (id);
                RAISE NOTICE 'Contrainte unique ajoutée à permissions.id';
            EXCEPTION
                WHEN duplicate_object THEN
                    RAISE NOTICE 'Contrainte unique sur permissions.id existe déjà';
            END;
            
            -- Maintenant ajouter la contrainte de clé étrangère
            BEGIN
                ALTER TABLE role_permissions ADD CONSTRAINT fk_role_permissions_permission_id FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE;
                RAISE NOTICE 'Contrainte fk_role_permissions_permission_id ajoutée';
            EXCEPTION
                WHEN duplicate_object THEN
                    RAISE NOTICE 'Contrainte fk_role_permissions_permission_id existe déjà';
            END;
        ELSE
            RAISE NOTICE 'Table permissions ou colonne id manquante, contrainte permission_id non ajoutée';
        END IF;
    ELSE
        RAISE NOTICE 'Table role_permissions n''existe pas';
    END IF;
END $$;
