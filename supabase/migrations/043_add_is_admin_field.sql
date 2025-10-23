-- Ajouter un champ is_admin à la table ressources
ALTER TABLE ressources 
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Marquer le premier utilisateur comme admin (celui créé le plus récemment)
UPDATE ressources 
SET is_admin = TRUE 
WHERE id = (
  SELECT id 
  FROM ressources 
  ORDER BY date_creation DESC 
  LIMIT 1
);

-- Créer un index pour optimiser les requêtes
CREATE INDEX idx_ressources_is_admin ON ressources(is_admin);
