-- Migration : Ajouter les foreign keys pour la table sites
-- Date : 2025-01-18
-- Description : Ajoute les contraintes de clé étrangère pour responsable_id et remplaçant_id

-- Ajouter la foreign key pour responsable_id
ALTER TABLE sites
ADD CONSTRAINT sites_responsable_id_fkey
FOREIGN KEY (responsable_id)
REFERENCES ressources(id)
ON DELETE SET NULL;

-- Ajouter la foreign key pour remplaçant_id
ALTER TABLE sites
ADD CONSTRAINT sites_remplaçant_id_fkey
FOREIGN KEY (remplaçant_id)
REFERENCES ressources(id)
ON DELETE SET NULL;

-- Ajouter des index pour améliorer les performances des jointures
CREATE INDEX IF NOT EXISTS idx_sites_responsable_fkey ON sites(responsable_id);
CREATE INDEX IF NOT EXISTS idx_sites_remplaçant_fkey ON sites(remplaçant_id);

-- Commentaires
COMMENT ON CONSTRAINT sites_responsable_id_fkey ON sites IS 'Lien vers le responsable principal du site';
COMMENT ON CONSTRAINT sites_remplaçant_id_fkey ON sites IS 'Lien vers le remplaçant du responsable';

