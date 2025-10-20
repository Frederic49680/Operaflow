-- Migration: Module Absences & Disponibilités
-- Description: Gestion des absences et calcul des disponibilités
-- Date: 2025-01-18
-- PRD #4

-- Table: absences
CREATE TABLE IF NOT EXISTS absences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ressource_id UUID NOT NULL REFERENCES ressources(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('CP', 'Maladie', 'Formation', 'Mission', 'Autre')),
    site TEXT,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    motif TEXT,
    statut TEXT NOT NULL CHECK (statut IN ('à venir', 'en cours', 'passée')),
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes
    CONSTRAINT check_dates CHECK (date_fin >= date_debut)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_absences_ressource ON absences(ressource_id);
CREATE INDEX IF NOT EXISTS idx_absences_type ON absences(type);
CREATE INDEX IF NOT EXISTS idx_absences_statut ON absences(statut);
CREATE INDEX IF NOT EXISTS idx_absences_dates ON absences(date_debut, date_fin);

-- Table: alerts (alertes et notifications)
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cible TEXT NOT NULL CHECK (cible IN ('RH', 'Responsable')),
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    date_envoi TIMESTAMPTZ DEFAULT NOW(),
    statut TEXT NOT NULL CHECK (statut IN ('envoyé', 'lu')) DEFAULT 'envoyé',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_alerts_cible ON alerts(cible);
CREATE INDEX IF NOT EXISTS idx_alerts_statut ON alerts(statut);

-- Fonction pour calculer le statut automatiquement
CREATE OR REPLACE FUNCTION update_absence_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Mise à jour du statut selon la date du jour
    IF NEW.date_debut > CURRENT_DATE THEN
        NEW.statut := 'à venir';
    ELSIF NEW.date_debut <= CURRENT_DATE AND NEW.date_fin >= CURRENT_DATE THEN
        NEW.statut := 'en cours';
    ELSE
        NEW.statut := 'passée';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le statut automatiquement
CREATE TRIGGER trigger_update_absence_status
    BEFORE INSERT OR UPDATE ON absences
    FOR EACH ROW
    EXECUTE FUNCTION update_absence_status();

-- Fonction pour vérifier les chevauchements d'absences
CREATE OR REPLACE FUNCTION check_absence_overlap()
RETURNS TRIGGER AS $$
DECLARE
    overlap_count INTEGER;
BEGIN
    -- Vérifier s'il existe déjà une absence qui chevauche
    SELECT COUNT(*)
    INTO overlap_count
    FROM absences
    WHERE ressource_id = NEW.ressource_id
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND (
          (date_debut <= NEW.date_debut AND date_fin >= NEW.date_debut) OR
          (date_debut <= NEW.date_fin AND date_fin >= NEW.date_fin) OR
          (date_debut >= NEW.date_debut AND date_fin <= NEW.date_fin)
      );
    
    IF overlap_count > 0 THEN
        RAISE EXCEPTION 'Chevauchement détecté : cette ressource a déjà une absence sur cette période';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour vérifier les chevauchements
CREATE TRIGGER trigger_check_absence_overlap
    BEFORE INSERT OR UPDATE ON absences
    FOR EACH ROW
    EXECUTE FUNCTION check_absence_overlap();

-- Fonction pour créer une alerte si absence > 15 jours
CREATE OR REPLACE FUNCTION check_long_absence()
RETURNS TRIGGER AS $$
DECLARE
    absence_duration INTEGER;
BEGIN
    absence_duration := NEW.date_fin - NEW.date_debut;
    
    IF absence_duration > 15 THEN
        INSERT INTO alerts (cible, type, message)
        VALUES (
            'RH',
            'Absence longue',
            'Absence de ' || absence_duration || ' jours détectée pour la ressource ' || NEW.ressource_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour les absences longues
CREATE TRIGGER trigger_check_long_absence
    AFTER INSERT ON absences
    FOR EACH ROW
    EXECUTE FUNCTION check_long_absence();

-- RLS (Row Level Security)
ALTER TABLE absences ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Policies pour absences
CREATE POLICY "Lecture publique des absences"
    ON absences FOR SELECT
    USING (true);

CREATE POLICY "Insertion absences admin"
    ON absences FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Modification absences admin"
    ON absences FOR UPDATE
    USING (true);

CREATE POLICY "Suppression absences admin"
    ON absences FOR DELETE
    USING (true);

-- Policies pour alerts
CREATE POLICY "Lecture publique des alertes"
    ON alerts FOR SELECT
    USING (true);

-- Commentaires
COMMENT ON TABLE absences IS 'Table des absences des collaborateurs';
COMMENT ON TABLE alerts IS 'Table des alertes et notifications système';

-- Vue pour les absences avec informations de la ressource
CREATE OR REPLACE VIEW v_absences_ressources AS
SELECT 
    a.id,
    a.ressource_id,
    r.nom as ressource_nom,
    r.prenom as ressource_prenom,
    a.type,
    a.site,
    a.date_debut,
    a.date_fin,
    a.motif,
    a.statut,
    a.created_at
FROM absences a
JOIN ressources r ON a.ressource_id = r.id;

COMMENT ON VIEW v_absences_ressources IS 'Vue des absences avec informations des ressources';

-- Fonction pour calculer la disponibilité d'une ressource sur une période
CREATE OR REPLACE FUNCTION calculate_disponibilite(
    p_ressource_id UUID,
    p_date_debut DATE,
    p_date_fin DATE
)
RETURNS BOOLEAN AS $$
DECLARE
    has_absence BOOLEAN;
BEGIN
    -- Vérifier s'il y a une absence sur la période
    SELECT EXISTS(
        SELECT 1
        FROM absences
        WHERE ressource_id = p_ressource_id
          AND statut IN ('à venir', 'en cours')
          AND (
              (date_debut <= p_date_debut AND date_fin >= p_date_debut) OR
              (date_debut <= p_date_fin AND date_fin >= p_date_fin) OR
              (date_debut >= p_date_debut AND date_fin <= p_date_fin)
          )
    ) INTO has_absence;
    
    RETURN NOT has_absence;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_disponibilite IS 'Calcule si une ressource est disponible sur une période donnée';

