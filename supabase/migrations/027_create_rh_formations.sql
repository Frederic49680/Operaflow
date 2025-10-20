-- ============================================================================
-- Migration 027 : Module RH Formations v1.1
-- ============================================================================
-- Auteur : Fred Baudry
-- Date : 2025-01-21
-- Description : Création du module RH Formations (organismes, catalogue, plan, budget)
-- PRD : prdajoutformation.mdc
-- ============================================================================

-- ============================================================================
-- TABLE : organismes_formation
-- ============================================================================

CREATE TABLE IF NOT EXISTS organismes_formation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom TEXT NOT NULL,
    siret TEXT,
    contact TEXT,
    email TEXT,
    telephone TEXT,
    adresse TEXT,
    code_postal TEXT,
    ville TEXT,
    domaines TEXT[],
    agrement TEXT,
    actif BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID
);

-- Index
CREATE INDEX IF NOT EXISTS idx_organismes_nom ON organismes_formation(nom);
CREATE INDEX IF NOT EXISTS idx_organismes_actif ON organismes_formation(actif);
CREATE INDEX IF NOT EXISTS idx_organismes_domaines ON organismes_formation USING GIN(domaines);

-- ============================================================================
-- TABLE : formations_catalogue
-- ============================================================================

CREATE TABLE IF NOT EXISTS formations_catalogue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    libelle TEXT NOT NULL,
    type_formation TEXT CHECK (type_formation IN ('Habilitante', 'Technique', 'QSE', 'CACES', 'SST', 'Autre')),
    duree_heures NUMERIC,
    duree_jours NUMERIC,
    validite_mois INTEGER,
    modalite TEXT CHECK (modalite IN ('Présentiel', 'Distanciel', 'E-learning', 'Mixte')),
    prerequis TEXT,
    competences TEXT[],
    organisme_defaut_id UUID REFERENCES organismes_formation(id),
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID
);

-- Index
CREATE INDEX IF NOT EXISTS idx_formations_code ON formations_catalogue(code);
CREATE INDEX IF NOT EXISTS idx_formations_type ON formations_catalogue(type_formation);
CREATE INDEX IF NOT EXISTS idx_formations_organisme ON formations_catalogue(organisme_defaut_id);
CREATE INDEX IF NOT EXISTS idx_formations_actif ON formations_catalogue(actif);
CREATE INDEX IF NOT EXISTS idx_formations_competences ON formations_catalogue USING GIN(competences);

-- ============================================================================
-- TABLE : formations_tarifs
-- ============================================================================

CREATE TABLE IF NOT EXISTS formations_tarifs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    formation_id UUID NOT NULL REFERENCES formations_catalogue(id) ON DELETE CASCADE,
    organisme_id UUID NOT NULL REFERENCES organismes_formation(id) ON DELETE CASCADE,
    modalite TEXT CHECK (modalite IN ('Présentiel', 'Distanciel', 'E-learning', 'Mixte')),
    site_id UUID REFERENCES sites(id),
    cout_unitaire NUMERIC,
    cout_session NUMERIC,
    cout_elearning NUMERIC,
    frais_deplacement NUMERIC,
    tva NUMERIC DEFAULT 20,
    date_debut DATE NOT NULL,
    date_fin DATE,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    UNIQUE(formation_id, organisme_id, modalite, site_id, date_debut)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_tarifs_formation ON formations_tarifs(formation_id);
CREATE INDEX IF NOT EXISTS idx_tarifs_organisme ON formations_tarifs(organisme_id);
CREATE INDEX IF NOT EXISTS idx_tarifs_site ON formations_tarifs(site_id);
CREATE INDEX IF NOT EXISTS idx_tarifs_dates ON formations_tarifs(date_debut, date_fin);

-- ============================================================================
-- TABLE : formations_sessions
-- ============================================================================

CREATE TABLE IF NOT EXISTS formations_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    formation_id UUID NOT NULL REFERENCES formations_catalogue(id),
    organisme_id UUID NOT NULL REFERENCES organismes_formation(id),
    site_id UUID REFERENCES sites(id),
    lieu TEXT,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    capacite INTEGER DEFAULT 10,
    cout_session_ht NUMERIC,
    statut TEXT CHECK (statut IN ('Ouverte', 'Fermée', 'Réalisée', 'Annulée')) DEFAULT 'Ouverte',
    documents JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID
);

-- Index
CREATE INDEX IF NOT EXISTS idx_sessions_formation ON formations_sessions(formation_id);
CREATE INDEX IF NOT EXISTS idx_sessions_organisme ON formations_sessions(organisme_id);
CREATE INDEX IF NOT EXISTS idx_sessions_site ON formations_sessions(site_id);
CREATE INDEX IF NOT EXISTS idx_sessions_dates ON formations_sessions(date_debut, date_fin);
CREATE INDEX IF NOT EXISTS idx_sessions_statut ON formations_sessions(statut);

-- ============================================================================
-- TABLE : plan_formation_ressource
-- ============================================================================

CREATE TABLE IF NOT EXISTS plan_formation_ressource (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collaborateur_id UUID NOT NULL REFERENCES ressources(id),
    formation_id UUID NOT NULL REFERENCES formations_catalogue(id),
    organisme_id UUID NOT NULL REFERENCES organismes_formation(id),
    semaine_iso TEXT,
    date_debut DATE,
    date_fin DATE,
    modalite TEXT CHECK (modalite IN ('Présentiel', 'Distanciel', 'E-learning', 'Mixte')),
    statut TEXT CHECK (statut IN ('Prévisionnel', 'Validé', 'Réalisé', 'Annulé')) DEFAULT 'Prévisionnel',
    cout_prevu_ht NUMERIC,
    cout_realise_ht NUMERIC,
    presence BOOLEAN,
    session_id UUID REFERENCES formations_sessions(id),
    commentaire TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID
);

-- Index
CREATE INDEX IF NOT EXISTS idx_plan_ressource ON plan_formation_ressource(collaborateur_id);
CREATE INDEX IF NOT EXISTS idx_plan_formation ON plan_formation_ressource(formation_id);
CREATE INDEX IF NOT EXISTS idx_plan_organisme ON plan_formation_ressource(organisme_id);
CREATE INDEX IF NOT EXISTS idx_plan_session ON plan_formation_ressource(session_id);
CREATE INDEX IF NOT EXISTS idx_plan_statut ON plan_formation_ressource(statut);
CREATE INDEX IF NOT EXISTS idx_plan_semaine ON plan_formation_ressource(semaine_iso);

-- ============================================================================
-- TABLE : formations (habilitations des collaborateurs)
-- ============================================================================

CREATE TABLE IF NOT EXISTS formations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ressource_id UUID NOT NULL REFERENCES ressources(id) ON DELETE CASCADE,
    formation_id UUID NOT NULL REFERENCES formations_catalogue(id),
    organisme_id UUID REFERENCES organismes_formation(id),
    date_obtention DATE NOT NULL,
    date_expiration DATE,
    statut TEXT CHECK (statut IN ('Valide', 'Expiré', 'À renouveler')) DEFAULT 'Valide',
    attestation_url TEXT,
    commentaire TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID
);

-- Index
CREATE INDEX IF NOT EXISTS idx_formations_ressource ON formations(ressource_id);
CREATE INDEX IF NOT EXISTS idx_formations_formation ON formations(formation_id);
CREATE INDEX IF NOT EXISTS idx_formations_expiration ON formations(date_expiration);
CREATE INDEX IF NOT EXISTS idx_formations_statut ON formations(statut);

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================

ALTER TABLE organismes_formation ENABLE ROW LEVEL SECURITY;
ALTER TABLE formations_catalogue ENABLE ROW LEVEL SECURITY;
ALTER TABLE formations_tarifs ENABLE ROW LEVEL SECURITY;
ALTER TABLE formations_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_formation_ressource ENABLE ROW LEVEL SECURITY;
ALTER TABLE formations ENABLE ROW LEVEL SECURITY;

-- Policies pour organismes_formation
CREATE POLICY "Lecture publique des organismes"
    ON organismes_formation FOR SELECT
    USING (true);

CREATE POLICY "Insertion organismes admin"
    ON organismes_formation FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Modification organismes admin"
    ON organismes_formation FOR UPDATE
    USING (true);

-- Policies pour formations_catalogue
CREATE POLICY "Lecture publique du catalogue"
    ON formations_catalogue FOR SELECT
    USING (true);

CREATE POLICY "Insertion catalogue admin"
    ON formations_catalogue FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Modification catalogue admin"
    ON formations_catalogue FOR UPDATE
    USING (true);

-- Policies pour formations_tarifs
CREATE POLICY "Lecture publique des tarifs"
    ON formations_tarifs FOR SELECT
    USING (true);

CREATE POLICY "Insertion tarifs admin"
    ON formations_tarifs FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Modification tarifs admin"
    ON formations_tarifs FOR UPDATE
    USING (true);

-- Policies pour formations_sessions
CREATE POLICY "Lecture publique des sessions"
    ON formations_sessions FOR SELECT
    USING (true);

CREATE POLICY "Insertion sessions admin"
    ON formations_sessions FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Modification sessions admin"
    ON formations_sessions FOR UPDATE
    USING (true);

-- Policies pour plan_formation_ressource
CREATE POLICY "Lecture publique du plan"
    ON plan_formation_ressource FOR SELECT
    USING (true);

CREATE POLICY "Insertion plan admin"
    ON plan_formation_ressource FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Modification plan admin"
    ON plan_formation_ressource FOR UPDATE
    USING (true);

-- Policies pour formations (habilitations)
CREATE POLICY "Lecture publique des formations"
    ON formations FOR SELECT
    USING (true);

CREATE POLICY "Insertion formations admin"
    ON formations FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Modification formations admin"
    ON formations FOR UPDATE
    USING (true);

-- ============================================================================
-- Commentaires
-- ============================================================================

COMMENT ON TABLE organismes_formation IS 'Référentiel des organismes de formation';
COMMENT ON TABLE formations_catalogue IS 'Catalogue des formations disponibles';
COMMENT ON TABLE formations_tarifs IS 'Grilles tarifaires des formations (multi-modalités)';
COMMENT ON TABLE formations_sessions IS 'Sessions de formation (regroupement)';
COMMENT ON TABLE plan_formation_ressource IS 'Plan prévisionnel des formations par ressource';
COMMENT ON TABLE formations IS 'Habilitations et formations obtenues par les collaborateurs';

