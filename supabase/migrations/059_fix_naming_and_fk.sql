-- Migration 059: Correction des anomalies de nommage et FK manquante
-- Date: 2025-01-25
-- Description: Corriger le nom de colonne avec accent et ajouter FK manquante

-- 1. Renommer la colonne avec accent
ALTER TABLE sites 
RENAME COLUMN remplaçant_id TO remplacant_id;

-- 2. Ajouter la contrainte FK manquante pour responsable_id
-- (Vérifier d'abord si elle n'existe pas déjà)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'fk_sites_responsable'
    ) THEN
        ALTER TABLE sites 
        ADD CONSTRAINT fk_sites_responsable 
        FOREIGN KEY (responsable_id) REFERENCES ressources(id);
    END IF;
END $$;

-- 3. Ajouter aussi la FK pour remplacant_id si nécessaire
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'fk_sites_remplacant'
    ) THEN
        ALTER TABLE sites 
        ADD CONSTRAINT fk_sites_remplacant 
        FOREIGN KEY (remplacant_id) REFERENCES ressources(id);
    END IF;
END $$;

-- Commentaires pour documentation
COMMENT ON COLUMN sites.responsable_id IS 'Responsable principal du site (FK vers ressources)';
COMMENT ON COLUMN sites.remplacant_id IS 'Remplaçant du responsable (FK vers ressources)';

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Migration 059 terminée : corrections de nommage appliquées ✅';
END $$;
