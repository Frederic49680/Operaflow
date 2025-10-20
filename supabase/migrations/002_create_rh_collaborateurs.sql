-- Migration: Module RH Collaborateurs
-- Description: Gestion des collaborateurs avec suivi RH et historique
-- Date: 2025-01-18
-- PRD #3

-- Table: ressources (collaborateurs)
CREATE TABLE IF NOT EXISTS ressources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    site_id UUID REFERENCES sites(id),
    actif BOOLEAN DEFAULT true,
    type_contrat TEXT NOT NULL CHECK (type_contrat IN ('CDI', 'CDD', 'Intérim', 'Apprenti', 'Autre')),
    email_pro TEXT,
    email_perso TEXT,
    telephone TEXT,
    adresse_postale TEXT,
    competences TEXT[],
    date_entree DATE,
    date_sortie DATE,
    date_creation TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes
    CONSTRAINT check_email CHECK (email_pro IS NOT NULL OR email_perso IS NOT NULL)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_ressources_site ON ressources(site_id);
CREATE INDEX IF NOT EXISTS idx_ressources_actif ON ressources(actif);
CREATE INDEX IF NOT EXISTS idx_ressources_type_contrat ON ressources(type_contrat);
CREATE INDEX IF NOT EXISTS idx_ressources_competences ON ressources USING GIN (competences);

-- Table: suivi_rh (formations, habilitations, visites médicales)
CREATE TABLE IF NOT EXISTS suivi_rh (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ressource_id UUID NOT NULL REFERENCES ressources(id) ON DELETE CASCADE,
    type_suivi TEXT NOT NULL CHECK (type_suivi IN ('Visite médicale', 'Formation', 'Habilitation', 'Autre')),
    date_realisation DATE,
    date_expiration DATE,
    statut TEXT NOT NULL CHECK (statut IN ('Valide', 'Expiré', 'À renouveler')),
    commentaire TEXT,
    date_creation TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_suivi_rh_ressource ON suivi_rh(ressource_id);
CREATE INDEX IF NOT EXISTS idx_suivi_rh_type ON suivi_rh(type_suivi);
CREATE INDEX IF NOT EXISTS idx_suivi_rh_statut ON suivi_rh(statut);

-- Table: historique_actions (audit des modifications)
CREATE TABLE IF NOT EXISTS historique_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    element_type TEXT NOT NULL, -- 'ressource', 'site', etc.
    element_id UUID NOT NULL,
    action TEXT NOT NULL, -- 'ajout', 'modification', 'désactivation', 'suppression'
    valeur_avant JSONB,
    valeur_apres JSONB,
    date_action TIMESTAMPTZ DEFAULT NOW(),
    acteur_id UUID,
    commentaire TEXT
);

-- Index
CREATE INDEX IF NOT EXISTS idx_historique_type ON historique_actions(element_type, element_id);
CREATE INDEX IF NOT EXISTS idx_historique_date ON historique_actions(date_action DESC);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_ressources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ressources_updated_at
    BEFORE UPDATE ON ressources
    FOR EACH ROW
    EXECUTE FUNCTION update_ressources_updated_at();

CREATE TRIGGER trigger_suivi_rh_updated_at
    BEFORE UPDATE ON suivi_rh
    FOR EACH ROW
    EXECUTE FUNCTION update_ressources_updated_at();

-- Trigger pour l'historique des actions sur ressources
CREATE OR REPLACE FUNCTION log_ressource_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO historique_actions (element_type, element_id, action, valeur_apres, acteur_id)
        VALUES ('ressource', NEW.id, 'ajout', to_jsonb(NEW), NEW.created_by);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO historique_actions (element_type, element_id, action, valeur_avant, valeur_apres, acteur_id)
        VALUES ('ressource', NEW.id, 'modification', to_jsonb(OLD), to_jsonb(NEW), NEW.created_by);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO historique_actions (element_type, element_id, action, valeur_avant, acteur_id)
        VALUES ('ressource', OLD.id, 'suppression', to_jsonb(OLD), OLD.created_by);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_ressource_changes
    AFTER INSERT OR UPDATE OR DELETE ON ressources
    FOR EACH ROW
    EXECUTE FUNCTION log_ressource_changes();

-- RLS (Row Level Security)
ALTER TABLE ressources ENABLE ROW LEVEL SECURITY;
ALTER TABLE suivi_rh ENABLE ROW LEVEL SECURITY;
ALTER TABLE historique_actions ENABLE ROW LEVEL SECURITY;

-- Policies pour ressources
CREATE POLICY "Lecture publique des ressources"
    ON ressources FOR SELECT
    USING (true);

CREATE POLICY "Insertion ressources admin"
    ON ressources FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Modification ressources admin"
    ON ressources FOR UPDATE
    USING (true);

CREATE POLICY "Suppression ressources admin"
    ON ressources FOR DELETE
    USING (true);

-- Policies pour suivi_rh
CREATE POLICY "Lecture publique du suivi RH"
    ON suivi_rh FOR SELECT
    USING (true);

CREATE POLICY "Insertion suivi RH admin"
    ON suivi_rh FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Modification suivi RH admin"
    ON suivi_rh FOR UPDATE
    USING (true);

CREATE POLICY "Suppression suivi RH admin"
    ON suivi_rh FOR DELETE
    USING (true);

-- Policies pour historique_actions
CREATE POLICY "Lecture publique de l'historique"
    ON historique_actions FOR SELECT
    USING (true);

-- Commentaires
COMMENT ON TABLE ressources IS 'Table des collaborateurs - base RH du système';
COMMENT ON TABLE suivi_rh IS 'Suivi RH des collaborateurs (formations, habilitations, visites médicales)';
COMMENT ON TABLE historique_actions IS 'Audit des actions sur les ressources et autres entités';

-- Vue pour les ressources avec leur site
CREATE OR REPLACE VIEW v_ressources_sites AS
SELECT 
    r.id,
    r.nom,
    r.prenom,
    r.site_id,
    s.nom as site_nom,
    s.code_site as site_code,
    r.actif,
    r.type_contrat,
    r.email_pro,
    r.email_perso,
    r.telephone,
    r.competences,
    r.date_entree,
    r.date_sortie,
    r.date_creation,
    r.updated_at
FROM ressources r
LEFT JOIN sites s ON r.site_id = s.id;

COMMENT ON VIEW v_ressources_sites IS 'Vue des ressources avec informations du site associé';

