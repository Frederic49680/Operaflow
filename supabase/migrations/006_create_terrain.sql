-- Migration: Modules Terrain (Remontée Site + Maintenance)
-- Description: Remontées terrain et journal maintenance
-- Date: 2025-01-18
-- PRD #7 & #8

-- Table: remontee_site
CREATE TABLE IF NOT EXISTS remontee_site (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Liens
    site_id UUID REFERENCES sites(id),
    affaire_id UUID REFERENCES affaires(id),
    tache_id UUID REFERENCES planning_taches(id),
    
    -- Informations de base
    date_saisie DATE NOT NULL,
    statut_reel TEXT NOT NULL CHECK (statut_reel IN ('Non lancée', 'En cours', 'Terminée', 'Bloquée', 'Suspendue', 'Reportée', 'Prolongée')),
    avancement_pct NUMERIC(5, 2) DEFAULT 0 CHECK (avancement_pct >= 0 AND avancement_pct <= 100),
    
    -- Effectifs
    nb_present INTEGER,
    nb_planifie INTEGER,
    
    -- Heures
    heures_presence NUMERIC(8, 2),
    heures_metal NUMERIC(8, 2),
    
    -- Motif et commentaire
    motif TEXT,
    commentaire TEXT,
    
    -- Claim
    claim BOOLEAN DEFAULT false,
    claim_type TEXT,
    claim_valeur NUMERIC(12, 2),
    
    -- Blocage intrajournalier
    is_block_event BOOLEAN DEFAULT false,
    block_time TIMESTAMPTZ,
    
    -- Suspension
    suspension_flag BOOLEAN DEFAULT false,
    suspension_start TIMESTAMPTZ,
    suspension_end TIMESTAMPTZ,
    
    -- Confirmation
    etat_confirme BOOLEAN DEFAULT false,
    
    -- Métadonnées
    created_by UUID,
    date_creation TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_remontee_site_site ON remontee_site(site_id);
CREATE INDEX IF NOT EXISTS idx_remontee_site_tache ON remontee_site(tache_id);
CREATE INDEX IF NOT EXISTS idx_remontee_site_date ON remontee_site(date_saisie);
CREATE INDEX IF NOT EXISTS idx_remontee_site_confirme ON remontee_site(etat_confirme);

-- Table: remontee_site_reporting (copie figée des confirmations)
CREATE TABLE IF NOT EXISTS remontee_site_reporting (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    remontee_id UUID REFERENCES remontee_site(id),
    date_report DATE NOT NULL,
    tache_id UUID REFERENCES planning_taches(id),
    site_id UUID REFERENCES sites(id),
    affaire_id UUID REFERENCES affaires(id),
    statut_final TEXT NOT NULL,
    avancement_final NUMERIC(5, 2),
    nb_present INTEGER,
    heures_metal NUMERIC(8, 2),
    motif TEXT,
    claim BOOLEAN DEFAULT false,
    commentaire TEXT,
    confirme_par UUID,
    date_confirmation TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_reporting_date ON remontee_site_reporting(date_report);
CREATE INDEX IF NOT EXISTS idx_reporting_site ON remontee_site_reporting(site_id);

-- Table: tache_suspensions (tracking des suspensions)
CREATE TABLE IF NOT EXISTS tache_suspensions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tache_id UUID REFERENCES planning_taches(id),
    suspension_start TIMESTAMPTZ NOT NULL,
    suspension_end TIMESTAMPTZ,
    motif TEXT,
    created_by UUID,
    date_creation TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_suspensions_tache ON tache_suspensions(tache_id);

-- Table: maintenance_batteries
CREATE TABLE IF NOT EXISTS maintenance_batteries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID REFERENCES sites(id),
    libelle TEXT NOT NULL,
    periode_mois DATE NOT NULL,
    responsable_id UUID REFERENCES ressources(id),
    commentaire TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_maintenance_batteries_site ON maintenance_batteries(site_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_batteries_periode ON maintenance_batteries(periode_mois);

-- Table: maintenance_journal
CREATE TABLE IF NOT EXISTS maintenance_journal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID REFERENCES sites(id),
    date_jour DATE NOT NULL,
    tranche_debut TIMESTAMPTZ NOT NULL,
    tranche_fin TIMESTAMPTZ NOT NULL,
    systeme TEXT,
    elementaire TEXT,
    type_maintenance TEXT CHECK (type_maintenance IN ('Préventive', 'Corrective', 'Contrôle', 'Amélioration')),
    etat_reel TEXT NOT NULL CHECK (etat_reel IN ('Non lancée', 'En cours', 'Terminée', 'Bloquée', 'Reportée', 'Prolongée', 'Suspendue')),
    motif TEXT,
    description TEXT,
    batterie_id UUID REFERENCES maintenance_batteries(id),
    heures_presence NUMERIC(8, 2),
    heures_suspension NUMERIC(8, 2),
    heures_metal NUMERIC(8, 2),
    is_block_event BOOLEAN DEFAULT false,
    etat_confirme BOOLEAN DEFAULT false,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes
    CONSTRAINT check_tranches CHECK (tranche_fin > tranche_debut),
    CONSTRAINT check_heures CHECK (heures_metal >= 0)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_maintenance_journal_site ON maintenance_journal(site_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_journal_date ON maintenance_journal(date_jour);
CREATE INDEX IF NOT EXISTS idx_maintenance_journal_batterie ON maintenance_journal(batterie_id);

-- Table: maintenance_monthly_digest
CREATE TABLE IF NOT EXISTS maintenance_monthly_digest (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID REFERENCES sites(id),
    periode_mois DATE NOT NULL,
    destinataires TEXT[],
    nb_batteries_terminees INTEGER DEFAULT 0,
    nb_batteries_reportees INTEGER DEFAULT 0,
    details JSONB,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_digest_site_periode ON maintenance_monthly_digest(site_id, periode_mois);

-- Trigger pour calculer heures_metal
CREATE OR REPLACE FUNCTION calculate_heures_metal()
RETURNS TRIGGER AS $$
BEGIN
    NEW.heures_metal := GREATEST(COALESCE(NEW.heures_presence, 0) - COALESCE(NEW.heures_suspension, 0), 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_heures_metal
    BEFORE INSERT OR UPDATE ON maintenance_journal
    FOR EACH ROW
    EXECUTE FUNCTION calculate_heures_metal();

-- RLS (Row Level Security)
ALTER TABLE remontee_site ENABLE ROW LEVEL SECURITY;
ALTER TABLE remontee_site_reporting ENABLE ROW LEVEL SECURITY;
ALTER TABLE tache_suspensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_batteries ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_monthly_digest ENABLE ROW LEVEL SECURITY;

-- Policies pour remontee_site
CREATE POLICY "Lecture publique des remontées"
    ON remontee_site FOR SELECT
    USING (true);

CREATE POLICY "Insertion remontées admin"
    ON remontee_site FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Modification remontées admin"
    ON remontee_site FOR UPDATE
    USING (true);

-- Policies pour maintenance_journal
CREATE POLICY "Lecture publique du journal maintenance"
    ON maintenance_journal FOR SELECT
    USING (true);

CREATE POLICY "Insertion journal maintenance admin"
    ON maintenance_journal FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Modification journal maintenance admin"
    ON maintenance_journal FOR UPDATE
    USING (true);

-- Commentaires
COMMENT ON TABLE remontee_site IS 'Remontées d''information terrain quotidiennes';
COMMENT ON TABLE remontee_site_reporting IS 'Copie figée des remontées confirmées';
COMMENT ON TABLE tache_suspensions IS 'Tracking des suspensions de tâches';
COMMENT ON TABLE maintenance_batteries IS 'Batteries de maintenance (groupes d''activités)';
COMMENT ON TABLE maintenance_journal IS 'Journal du soir des interventions maintenance';
COMMENT ON TABLE maintenance_monthly_digest IS 'Traces d''envoi des bilans mensuels';

