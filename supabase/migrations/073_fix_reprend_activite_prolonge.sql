-- Migration 073: Correction fonction reprend_activite pour accepter le statut "Prolongé"
-- Date: 2025-01-27
-- Description: Mettre à jour la fonction reprend_activite pour accepter les tâches avec statut "Prolongé"

-- Recréer la fonction reprend_activite avec le statut "Prolongé" inclus
CREATE OR REPLACE FUNCTION reprend_activite(tache_id UUID, commentaire TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    tache_record RECORD;
BEGIN
    -- Récupérer les informations de la tâche
    SELECT * INTO tache_record 
    FROM planning_taches 
    WHERE id = tache_id;
    
    -- Vérifier que la tâche existe et est dans le bon statut
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tâche non trouvée';
    END IF;
    
    IF tache_record.statut NOT IN ('Suspendu', 'Reporté', 'Prolongé') THEN
        RAISE EXCEPTION 'La tâche doit être suspendue, reportée ou prolongée pour être reprise';
    END IF;
    
    -- Mettre à jour la tâche
    UPDATE planning_taches 
    SET 
        statut = 'En cours',
        date_reprise = NOW(),
        updated_at = NOW()
    WHERE id = tache_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Migration 073 terminée avec succès !';
  RAISE NOTICE 'Fonction reprend_activite mise à jour pour accepter le statut "Prolongé"';
  RAISE NOTICE 'Les tâches prolongées peuvent maintenant être reprises';
END $$;
