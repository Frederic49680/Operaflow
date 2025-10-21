-- Migration: Module Tuiles Tâches v2 (4 niveaux, drag & drop, templates)
-- Description: Remplacement du module Gantt par un système de tuiles hiérarchiques
-- Date: 2025-01-18
-- PRD: prdmajgantt.mdc

-- 1. Mise à jour de la table planning_taches pour supporter la hiérarchie
ALTER TABLE planning_taches 
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 0 CHECK (level >= 0 AND level <= 3),
ADD COLUMN IF NOT EXISTS template_origin_id UUID,
ADD COLUMN IF NOT EXISTS is_milestone BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS manual BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS order_index NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES planning_taches(id);

-- Index pour la hiérarchie
CREATE INDEX IF NOT EXISTS idx_planning_taches_level ON planning_taches(level);
CREATE INDEX IF NOT EXISTS idx_planning_taches_parent ON planning_taches(parent_id);
CREATE INDEX IF NOT EXISTS idx_planning_taches_order ON planning_taches(parent_id, order_index);

-- 2. Table des templates de tâches
CREATE TABLE IF NOT EXISTS task_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    max_level INTEGER DEFAULT 3 CHECK (max_level >= 0 AND max_level <= 3),
    default_calendar_id UUID,
    structure JSONB NOT NULL DEFAULT '{"items": []}',
    defaults JSONB DEFAULT '{"status": "Non lancé", "work_days_only": true}',
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les templates
CREATE INDEX IF NOT EXISTS idx_task_templates_name ON task_templates(name);
CREATE INDEX IF NOT EXISTS idx_task_templates_created_by ON task_templates(created_by);

-- 3. Table des liens entre tâches
CREATE TABLE IF NOT EXISTS task_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_task_id UUID NOT NULL REFERENCES planning_taches(id) ON DELETE CASCADE,
    to_task_id UUID NOT NULL REFERENCES planning_taches(id) ON DELETE CASCADE,
    link_type TEXT NOT NULL CHECK (link_type IN ('FS', 'SS', 'FF', 'SF')),
    lag_days INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contrainte d'unicité pour éviter les doublons
    UNIQUE(from_task_id, to_task_id)
);

-- Index pour les liens
CREATE INDEX IF NOT EXISTS idx_task_links_from ON task_links(from_task_id);
CREATE INDEX IF NOT EXISTS idx_task_links_to ON task_links(to_task_id);
CREATE INDEX IF NOT EXISTS idx_task_links_type ON task_links(link_type);

-- 4. Table des mappings de templates (optionnelle)
CREATE TABLE IF NOT EXISTS task_template_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES task_templates(id) ON DELETE CASCADE,
    affaire_field TEXT NOT NULL, -- ex: 'lot_name', 'date_commande'
    task_field TEXT NOT NULL,    -- ex: 'libelle_tache', 'date_debut_plan'
    mapping_type TEXT NOT NULL CHECK (mapping_type IN ('direct', 'transform', 'default')),
    transform_rule JSONB, -- pour les transformations complexes
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les mappings
CREATE INDEX IF NOT EXISTS idx_template_mappings_template ON task_template_mappings(template_id);

-- 5. Table des conflits de ressources (pour la détection de sur-affectation)
CREATE TABLE IF NOT EXISTS resource_conflicts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ressource_id UUID NOT NULL,
    task_id UUID NOT NULL REFERENCES planning_taches(id) ON DELETE CASCADE,
    conflict_type TEXT NOT NULL CHECK (conflict_type IN ('overallocation', 'absence', 'competence_mismatch')),
    conflict_details JSONB,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Index pour les conflits
CREATE INDEX IF NOT EXISTS idx_resource_conflicts_ressource ON resource_conflicts(ressource_id);
CREATE INDEX IF NOT EXISTS idx_resource_conflicts_task ON resource_conflicts(task_id);
CREATE INDEX IF NOT EXISTS idx_resource_conflicts_severity ON resource_conflicts(severity);
CREATE INDEX IF NOT EXISTS idx_resource_conflicts_resolved ON resource_conflicts(resolved);

-- 6. Fonction pour valider la hiérarchie (max 4 niveaux)
CREATE OR REPLACE FUNCTION fn_validate_task_hierarchy()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier que le niveau ne dépasse pas 3
    IF NEW.level > 3 THEN
        RAISE EXCEPTION 'Impossible d''indenter au-delà du 4ème niveau (level > 3)';
    END IF;
    
    -- Vérifier que le parent existe et est valide
    IF NEW.parent_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM planning_taches WHERE id = NEW.parent_id) THEN
            RAISE EXCEPTION 'Tâche parent inexistante';
        END IF;
        
        -- Vérifier que le parent n'est pas un descendant (éviter les cycles)
        IF EXISTS (
            WITH RECURSIVE task_hierarchy AS (
                SELECT id, parent_id, 0 as depth
                FROM planning_taches 
                WHERE id = NEW.parent_id
                UNION ALL
                SELECT t.id, t.parent_id, th.depth + 1
                FROM planning_taches t
                JOIN task_hierarchy th ON t.parent_id = th.id
                WHERE th.depth < 10 -- protection contre les boucles infinies
            )
            SELECT 1 FROM task_hierarchy WHERE id = NEW.id
        ) THEN
            RAISE EXCEPTION 'Cycle détecté dans la hiérarchie des tâches';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour valider la hiérarchie
DROP TRIGGER IF EXISTS trigger_validate_task_hierarchy ON planning_taches;
CREATE TRIGGER trigger_validate_task_hierarchy
    BEFORE INSERT OR UPDATE ON planning_taches
    FOR EACH ROW
    EXECUTE FUNCTION fn_validate_task_hierarchy();

-- 7. Fonction pour recalculer l'ordre des tâches
CREATE OR REPLACE FUNCTION fn_reorder_tasks()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculer l'order_index pour les tâches du même parent
    UPDATE planning_taches 
    SET order_index = subquery.new_order
    FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY order_index, created_at) * 1000 as new_order
        FROM planning_taches 
        WHERE parent_id = COALESCE(NEW.parent_id, OLD.parent_id)
    ) subquery
    WHERE planning_taches.id = subquery.id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger pour recalculer l'ordre
DROP TRIGGER IF EXISTS trigger_reorder_tasks ON planning_taches;
CREATE TRIGGER trigger_reorder_tasks
    AFTER INSERT OR UPDATE OR DELETE ON planning_taches
    FOR EACH ROW
    EXECUTE FUNCTION fn_reorder_tasks();

-- 8. Fonction pour détecter les conflits de ressources
CREATE OR REPLACE FUNCTION fn_detect_resource_conflicts()
RETURNS TRIGGER AS $$
DECLARE
    conflict_count INTEGER;
    total_hours NUMERIC;
    capacity_hours NUMERIC;
BEGIN
    -- Supprimer les anciens conflits pour cette tâche
    DELETE FROM resource_conflicts WHERE task_id = NEW.id;
    
    -- Vérifier la sur-affectation pour chaque ressource
    FOR conflict_count IN 
        SELECT COUNT(*) 
        FROM (
            SELECT ressource_id, 
                   SUM(EXTRACT(EPOCH FROM (date_fin_plan - date_debut_plan)) / 3600 / 8) as total_hours
            FROM planning_taches pt
            CROSS JOIN UNNEST(pt.ressource_ids) as ressource_id
            WHERE pt.id != NEW.id 
              AND pt.date_debut_plan <= NEW.date_fin_plan 
              AND pt.date_fin_plan >= NEW.date_debut_plan
              AND pt.statut IN ('Non lancé', 'En cours')
            GROUP BY ressource_id
            HAVING SUM(EXTRACT(EPOCH FROM (date_fin_plan - date_debut_plan)) / 3600 / 8) > 1.0
        ) over_allocated
    LOOP
        -- Insérer un conflit de sur-affectation
        INSERT INTO resource_conflicts (ressource_id, task_id, conflict_type, severity)
        SELECT ressource_id, NEW.id, 'overallocation', 'high'
        FROM (
            SELECT ressource_id, 
                   SUM(EXTRACT(EPOCH FROM (date_fin_plan - date_debut_plan)) / 3600 / 8) as total_hours
            FROM planning_taches pt
            CROSS JOIN UNNEST(pt.ressource_ids) as ressource_id
            WHERE pt.id != NEW.id 
              AND pt.date_debut_plan <= NEW.date_fin_plan 
              AND pt.date_fin_plan >= NEW.date_debut_plan
              AND pt.statut IN ('Non lancé', 'En cours')
            GROUP BY ressource_id
            HAVING SUM(EXTRACT(EPOCH FROM (date_fin_plan - date_debut_plan)) / 3600 / 8) > 1.0
        ) over_allocated;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour détecter les conflits
DROP TRIGGER IF EXISTS trigger_detect_resource_conflicts ON planning_taches;
CREATE TRIGGER trigger_detect_resource_conflicts
    AFTER INSERT OR UPDATE ON planning_taches
    FOR EACH ROW
    EXECUTE FUNCTION fn_detect_resource_conflicts();

-- 9. RLS Policies
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_template_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_conflicts ENABLE ROW LEVEL SECURITY;

-- Policies pour task_templates
CREATE POLICY "Users can view task templates" ON task_templates
    FOR SELECT USING (true);

CREATE POLICY "Users can create task templates" ON task_templates
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own templates" ON task_templates
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own templates" ON task_templates
    FOR DELETE USING (auth.uid() = created_by);

-- Policies pour task_links
CREATE POLICY "Users can view task links" ON task_links
    FOR SELECT USING (true);

CREATE POLICY "Users can manage task links" ON task_links
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Policies pour task_template_mappings
CREATE POLICY "Users can view template mappings" ON task_template_mappings
    FOR SELECT USING (true);

CREATE POLICY "Users can manage template mappings" ON task_template_mappings
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Policies pour resource_conflicts
CREATE POLICY "Users can view resource conflicts" ON resource_conflicts
    FOR SELECT USING (true);

CREATE POLICY "Users can manage resource conflicts" ON resource_conflicts
    FOR ALL USING (auth.uid() IS NOT NULL);

-- 10. Données de test - Templates prédéfinis
INSERT INTO task_templates (name, description, max_level, structure, defaults) VALUES
(
    'Projet Standard',
    'Template pour un projet standard avec phases de préparation, réalisation et contrôle',
    2,
    '{
        "items": [
            {"title": "Phase 1 - Préparation", "level": 0, "duration_days": 3, "offset_days": 0},
            {"title": "Étude technique", "level": 1, "duration_days": 2, "offset_days": 0, "link_from_prev": "FS"},
            {"title": "Approvisionnement", "level": 1, "duration_days": 1, "offset_days": 1, "link_from_prev": "FS"},
            {"title": "Phase 2 - Réalisation", "level": 0, "duration_days": 5, "offset_days": 3, "link_from_prev": "FS"},
            {"title": "Exécution", "level": 1, "duration_days": 4, "offset_days": 0, "link_from_prev": "FS"},
            {"title": "Contrôle qualité", "level": 1, "duration_days": 1, "offset_days": 4, "link_from_prev": "FS"},
            {"title": "Phase 3 - Finalisation", "level": 0, "duration_days": 1, "offset_days": 8, "link_from_prev": "FS"},
            {"title": "Livraison", "level": 1, "duration_days": 1, "offset_days": 0, "link_from_prev": "FS"}
        ]
    }',
    '{"status": "Non lancé", "work_days_only": true}'
),
(
    'Maintenance Préventive',
    'Template pour une maintenance préventive avec contrôle et rapport',
    1,
    '{
        "items": [
            {"title": "Préparation maintenance", "level": 0, "duration_days": 1, "offset_days": 0},
            {"title": "Contrôle équipement", "level": 1, "duration_days": 2, "offset_days": 0, "link_from_prev": "FS"},
            {"title": "Rapport maintenance", "level": 1, "duration_days": 0.5, "offset_days": 2, "link_from_prev": "FS"}
        ]
    }',
    '{"status": "Non lancé", "work_days_only": true}'
),
(
    'Installation Simple',
    'Template pour une installation simple avec mise en service',
    1,
    '{
        "items": [
            {"title": "Préparation installation", "level": 0, "duration_days": 1, "offset_days": 0},
            {"title": "Installation matériel", "level": 1, "duration_days": 2, "offset_days": 0, "link_from_prev": "FS"},
            {"title": "Mise en service", "level": 1, "duration_days": 1, "offset_days": 2, "link_from_prev": "FS"},
            {"title": "Tests", "level": 1, "duration_days": 0.5, "offset_days": 3, "link_from_prev": "FS"}
        ]
    }',
    '{"status": "Non lancé", "work_days_only": true}'
);

-- 11. Vue pour les tâches avec hiérarchie
CREATE OR REPLACE VIEW v_tasks_hierarchy AS
SELECT 
    pt.*,
    parent.libelle_tache as parent_name,
    COUNT(children.id) as children_count,
    CASE 
        WHEN pt.level = 0 THEN 'Projet'
        WHEN pt.level = 1 THEN 'Phase'
        WHEN pt.level = 2 THEN 'Tâche'
        WHEN pt.level = 3 THEN 'Sous-tâche'
        ELSE 'Autre'
    END as level_name
FROM planning_taches pt
LEFT JOIN planning_taches parent ON pt.parent_id = parent.id
LEFT JOIN planning_taches children ON children.parent_id = pt.id
GROUP BY pt.id, parent.libelle_tache;

-- 12. Vue pour les conflits de ressources
CREATE OR REPLACE VIEW v_resource_conflicts AS
SELECT 
    rc.*,
    pt.libelle_tache,
    r.nom as ressource_nom,
    r.prenom as ressource_prenom
FROM resource_conflicts rc
JOIN planning_taches pt ON rc.task_id = pt.id
LEFT JOIN ressources r ON rc.ressource_id = r.id
WHERE rc.resolved = false;

COMMENT ON TABLE task_templates IS 'Templates de tâches pour génération automatique';
COMMENT ON TABLE task_links IS 'Liens de dépendance entre tâches (FS, SS, FF, SF)';
COMMENT ON TABLE task_template_mappings IS 'Mappings entre champs affaires et champs tâches';
COMMENT ON TABLE resource_conflicts IS 'Conflits de ressources détectés automatiquement';
COMMENT ON VIEW v_tasks_hierarchy IS 'Vue hiérarchique des tâches avec métadonnées';
COMMENT ON VIEW v_resource_conflicts IS 'Vue des conflits de ressources avec détails';
