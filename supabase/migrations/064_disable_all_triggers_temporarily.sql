-- Migration 064: Désactiver temporairement tous les triggers sur planning_taches
-- Date: 2025-01-26
-- Description: Désactiver les triggers qui causent stack overflow pour permettre la création de sous-tâches

-- Désactiver les triggers applicatifs spécifiquement (pas les triggers système RI_ConstraintTrigger)
-- Ces triggers causent le stack overflow lors de la création de sous-tâches

DO $$
DECLARE
    trigger_name TEXT;
    trigger_list TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Lister tous les triggers applicatifs sur planning_taches
    FOR trigger_name IN 
        SELECT tgname 
        FROM pg_trigger 
        WHERE tgrelid = 'planning_taches'::regclass
        AND tgname NOT LIKE 'RI_ConstraintTrigger%'
    LOOP
        -- Ajouter le trigger à la liste
        trigger_list := trigger_list || trigger_name;
        
        -- Désactiver le trigger
        EXECUTE format('ALTER TABLE planning_taches DISABLE TRIGGER %I', trigger_name);
        
        RAISE NOTICE 'Trigger désactivé: %', trigger_name;
    END LOOP;
    
    IF array_length(trigger_list, 1) IS NULL THEN
        RAISE NOTICE 'Aucun trigger applicatif trouvé sur planning_taches';
    ELSE
        RAISE NOTICE 'Triggers désactivés: %', array_to_string(trigger_list, ', ');
    END IF;
END $$;
