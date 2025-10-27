-- Migration 063: Correction de la validation des cycles hiérarchiques
-- Date: 2025-01-26
-- Description: Corriger la validation pour autoriser les relations parent-enfant valides

-- Supprimer l'ancien trigger
DROP TRIGGER IF EXISTS trigger_validate_task_hierarchy ON planning_taches;

-- Recréer la fonction avec une logique simplifiée (sans récursion)
CREATE OR REPLACE FUNCTION fn_validate_task_hierarchy()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier que le niveau ne dépasse pas 3
    IF NEW.level > 3 THEN
        RAISE EXCEPTION 'Impossible d''indenter au-delà du 4ème niveau (level > 3)';
    END IF;
    
    -- Vérifier que le parent existe et est valide
    IF NEW.parent_id IS NOT NULL THEN
        -- Vérifier que le parent existe
        IF NOT EXISTS (SELECT 1 FROM planning_taches WHERE id = NEW.parent_id) THEN
            RAISE EXCEPTION 'Tâche parent inexistante';
        END IF;
        
        -- Vérifier qu'on ne crée pas une tâche parent d'elle-même
        IF NEW.parent_id = NEW.id THEN
            RAISE EXCEPTION 'Une tâche ne peut pas être parent d''elle-même';
        END IF;
        
        -- Pour simplifier et éviter la récursion infinie,
        -- on utilise une requête SQL récursive native qui est mieux optimisée
        IF EXISTS (
            WITH RECURSIVE parent_chain AS (
                -- Point de départ: le parent direct
                SELECT id, parent_id, 1 as depth
                FROM planning_taches
                WHERE id = NEW.parent_id
                
                UNION ALL
                
                -- Remonter la chaîne des parents
                SELECT t.id, t.parent_id, pc.depth + 1
                FROM planning_taches t
                INNER JOIN parent_chain pc ON t.id = pc.parent_id
                WHERE pc.depth < 10  -- Limiter à 10 niveaux
            )
            -- Vérifier si on tombe sur NEW.id (cycle détecté)
            SELECT 1 FROM parent_chain WHERE id = NEW.id
        ) THEN
            RAISE EXCEPTION 'Cycle détecté dans la hiérarchie des tâches';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recréer le trigger
CREATE TRIGGER trigger_validate_task_hierarchy
    BEFORE INSERT OR UPDATE ON planning_taches
    FOR EACH ROW
    EXECUTE FUNCTION fn_validate_task_hierarchy();

COMMENT ON FUNCTION fn_validate_task_hierarchy IS 'Valide la hiérarchie des tâches et détecte les cycles réels (pas les relations parent-enfant normales)';
