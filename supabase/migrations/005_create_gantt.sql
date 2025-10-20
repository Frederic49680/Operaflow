-- Migration: Module Gantt (Planification)
-- Description: Gestion des tâches et affectations
-- Date: 2025-01-18
-- PRD #6

-- Table: planning_taches
CREATE TABLE IF NOT EXISTS planning_taches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Liens
    affaire_id UUID REFERENCES affaires(id),
    lot_id UUID REFERENCES affaires_lots(id),
    site_id UUID REFERENCES sites(id),
    
    -- Informations de base
    libelle_tache TEXT NOT NULL,
    type_tache TEXT CHECK (type_tache IN ('Préparation', 'Exécution', 'Contrôle', 'Autre')),
    competence TEXT,
    
    -- Dates planifiées
    date_debut_plan DATE NOT NULL,
    date_fin_plan DATE NOT NULL,
    
    -- Dates réelles
    date_debut_reelle DATE,
    date_fin_reelle DATE,
    
    -- Effort
    effort_plan_h NUMERIC(8, 2),
    effort_reel_h NUMERIC(8, 2),
    
    -- Avancement
    avancement_pct NUMERIC(5, 2) DEFAULT 0 CHECK (avancement_pct >= 0 AND avancement_pct <= 100),
    
    -- Statut
    statut TEXT NOT NULL CHECK (statut IN ('Non lancé', 'En cours', 'Terminé', 'Bloqué', 'Reporté')) DEFAULT 'Non lancé',
    
    -- Affectations (tableau de ressources)
    ressource_ids UUID[],
    
    -- Métadonnées
    created_by UUID,
    date_creation TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes
    CONSTRAINT check_dates CHECK (date_fin_plan >= date_debut_plan)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_planning_taches_affaire ON planning_taches(affaire_id);
CREATE INDEX IF NOT EXISTS idx_planning_taches_lot ON planning_taches(lot_id);
CREATE INDEX IF NOT EXISTS idx_planning_taches_site ON planning_taches(site_id);
CREATE INDEX IF NOT EXISTS idx_planning_taches_statut ON planning_taches(statut);
CREATE INDEX IF NOT EXISTS idx_planning_taches_dates ON planning_taches(date_debut_plan, date_fin_plan);
CREATE INDEX IF NOT EXISTS idx_planning_taches_ressources ON planning_taches USING GIN (ressource_ids);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_planning_taches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_planning_taches_updated_at
    BEFORE UPDATE ON planning_taches
    FOR EACH ROW
    EXECUTE FUNCTION update_planning_taches_updated_at();

-- Trigger pour mettre à jour les dates réelles si avancement > 0
CREATE OR REPLACE FUNCTION update_dates_reelles()
RETURNS TRIGGER AS $$
BEGIN
    -- Si avancement > 0, mettre à jour la date de début réelle
    IF NEW.avancement_pct > 0 AND OLD.avancement_pct = 0 THEN
        NEW.date_debut_reelle := CURRENT_DATE;
    END IF;
    
    -- Si avancement = 100%, mettre à jour la date de fin réelle
    IF NEW.avancement_pct = 100 AND OLD.avancement_pct < 100 THEN
        NEW.date_fin_reelle := CURRENT_DATE;
        NEW.statut := 'Terminé';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_dates_reelles
    BEFORE UPDATE ON planning_taches
    FOR EACH ROW
    EXECUTE FUNCTION update_dates_reelles();

-- RLS (Row Level Security)
ALTER TABLE planning_taches ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Lecture publique des tâches"
    ON planning_taches FOR SELECT
    USING (true);

CREATE POLICY "Insertion tâches admin"
    ON planning_taches FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Modification tâches admin"
    ON planning_taches FOR UPDATE
    USING (true);

CREATE POLICY "Suppression tâches admin"
    ON planning_taches FOR DELETE
    USING (true);

-- Commentaires
COMMENT ON TABLE planning_taches IS 'Table des tâches de planification Gantt';
COMMENT ON COLUMN planning_taches.ressource_ids IS 'Tableau des IDs des ressources affectées';

-- Vue pour les tâches avec informations complètes
CREATE OR REPLACE VIEW v_planning_taches_completes AS
SELECT 
    pt.id,
    pt.affaire_id,
    a.code_affaire,
    c.nom_client,
    pt.lot_id,
    al.libelle_lot,
    pt.site_id,
    s.nom as site_nom,
    s.code_site as site_code,
    pt.libelle_tache,
    pt.type_tache,
    pt.competence,
    pt.date_debut_plan,
    pt.date_fin_plan,
    pt.date_debut_reelle,
    pt.date_fin_reelle,
    pt.effort_plan_h,
    pt.effort_reel_h,
    pt.avancement_pct,
    pt.statut,
    pt.ressource_ids,
    pt.date_creation,
    pt.updated_at
FROM planning_taches pt
LEFT JOIN affaires a ON pt.affaire_id = a.id
LEFT JOIN clients c ON a.client_id = c.id
LEFT JOIN affaires_lots al ON pt.lot_id = al.id
LEFT JOIN sites s ON pt.site_id = s.id;

COMMENT ON VIEW v_planning_taches_completes IS 'Vue des tâches avec toutes les informations liées';

