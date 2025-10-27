-- Migration 064: Désactiver temporairement tous les triggers sur planning_taches
-- Date: 2025-01-26
-- Description: Désactiver les triggers qui causent stack overflow pour permettre la création de sous-tâches

-- Désactiver tous les triggers sur planning_taches
ALTER TABLE planning_taches DISABLE TRIGGER ALL;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Tous les triggers sur planning_taches ont été désactivés temporairement';
    RAISE NOTICE 'Cela permettra la création de sous-tâches sans erreur de stack overflow';
END $$;
