-- Migration: Module Base Affaires (socle métier)
-- Description: Gestion des affaires avec découpage financier par lots
-- Date: 2025-01-18
-- PRD #5

-- Table: clients
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom_client TEXT NOT NULL,
    siret TEXT,
    adresse TEXT,
    code_postal TEXT,
    ville TEXT,
    telephone TEXT,
    email TEXT,
    categorie TEXT CHECK (categorie IN ('MOA', 'MOE', 'Exploitant', 'Maintenance', 'Autre')),
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID
);

-- Index
CREATE INDEX IF NOT EXISTS idx_clients_nom ON clients(nom_client);
CREATE INDEX IF NOT EXISTS idx_clients_actif ON clients(actif);

-- Table: affaires
CREATE TABLE IF NOT EXISTS affaires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code_affaire TEXT NOT NULL UNIQUE,
    site_id UUID REFERENCES sites(id),
    responsable_id UUID REFERENCES ressources(id),
    client_id UUID REFERENCES clients(id),
    num_commande TEXT,
    competence_principale TEXT,
    type_contrat TEXT NOT NULL CHECK (type_contrat IN ('Forfait', 'Régie', 'Autre')),
    montant_total_ht NUMERIC(12, 2),
    
    -- Statut
    statut TEXT NOT NULL CHECK (statut IN ('Brouillon', 'Soumise', 'Validée', 'Clôturée')) DEFAULT 'Brouillon',
    
    -- Dates
    date_debut DATE,
    date_fin_prevue DATE,
    date_fin_reelle DATE,
    
    -- Calculs financiers (mis à jour par triggers/functions)
    avancement_pct NUMERIC(5, 2) DEFAULT 0,
    montant_consomme NUMERIC(12, 2) DEFAULT 0,
    reste_a_faire NUMERIC(12, 2),
    atterrissage NUMERIC(12, 2),
    marge_prevue NUMERIC(12, 2),
    marge_reelle NUMERIC(12, 2),
    
    -- Métadonnées
    date_creation TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_affaires_code ON affaires(code_affaire);
CREATE INDEX IF NOT EXISTS idx_affaires_site ON affaires(site_id);
CREATE INDEX IF NOT EXISTS idx_affaires_responsable ON affaires(responsable_id);
CREATE INDEX IF NOT EXISTS idx_affaires_client ON affaires(client_id);
CREATE INDEX IF NOT EXISTS idx_affaires_statut ON affaires(statut);

-- Table: affaires_lots (découpage financier)
CREATE TABLE IF NOT EXISTS affaires_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affaire_id UUID NOT NULL REFERENCES affaires(id) ON DELETE CASCADE,
    libelle_lot TEXT NOT NULL,
    
    -- Budget
    budget_ht NUMERIC(12, 2) NOT NULL,
    cout_estime NUMERIC(12, 2),
    marge_prevue NUMERIC(12, 2),
    
    -- Pondération
    ponderation TEXT CHECK (ponderation IN ('heures', 'budget')) DEFAULT 'heures',
    
    -- Calculs (mis à jour par triggers/functions)
    avancement_pct NUMERIC(5, 2) DEFAULT 0,
    montant_consomme NUMERIC(12, 2) DEFAULT 0,
    reste_a_faire NUMERIC(12, 2),
    atterrissage NUMERIC(12, 2),
    
    -- Dates réelles
    date_debut_reelle DATE,
    date_fin_reelle DATE,
    
    -- Métadonnées
    date_maj TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_affaires_lots_affaire ON affaires_lots(affaire_id);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_affaires_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_affaires_updated_at
    BEFORE UPDATE ON affaires
    FOR EACH ROW
    EXECUTE FUNCTION update_affaires_updated_at();

CREATE TRIGGER trigger_affaires_lots_updated_at
    BEFORE UPDATE ON affaires_lots
    FOR EACH ROW
    EXECUTE FUNCTION update_affaires_updated_at();

-- Fonction pour calculer le reste à faire d'un lot
CREATE OR REPLACE FUNCTION calculate_lot_raf()
RETURNS TRIGGER AS $$
BEGIN
    NEW.reste_a_faire := GREATEST(NEW.budget_ht - NEW.montant_consomme, 0);
    NEW.atterrissage := NEW.montant_consomme + NEW.reste_a_faire;
    NEW.date_maj := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_lot_raf
    BEFORE INSERT OR UPDATE ON affaires_lots
    FOR EACH ROW
    EXECUTE FUNCTION calculate_lot_raf();

-- Fonction pour agréger les lots vers l'affaire
CREATE OR REPLACE FUNCTION aggregate_affaire_from_lots()
RETURNS TRIGGER AS $$
DECLARE
    total_budget NUMERIC(12, 2);
    total_consomme NUMERIC(12, 2);
    total_atterrissage NUMERIC(12, 2);
    avg_avancement NUMERIC(5, 2);
    min_debut DATE;
    max_fin DATE;
BEGIN
    -- Calculer les totaux
    SELECT 
        SUM(budget_ht),
        SUM(montant_consomme),
        SUM(atterrissage),
        AVG(avancement_pct),
        MIN(date_debut_reelle),
        MAX(date_fin_reelle)
    INTO 
        total_budget,
        total_consomme,
        total_atterrissage,
        avg_avancement,
        min_debut,
        max_fin
    FROM affaires_lots
    WHERE affaire_id = COALESCE(NEW.affaire_id, OLD.affaire_id);
    
    -- Mettre à jour l'affaire
    UPDATE affaires
    SET 
        avancement_pct = COALESCE(avg_avancement, 0),
        montant_consomme = COALESCE(total_consomme, 0),
        reste_a_faire = GREATEST(COALESCE(total_budget, 0) - COALESCE(total_consomme, 0), 0),
        atterrissage = COALESCE(total_atterrissage, 0),
        date_debut_reelle = min_debut,
        date_fin_reelle = max_fin,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.affaire_id, OLD.affaire_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_aggregate_affaire_from_lots
    AFTER INSERT OR UPDATE OR DELETE ON affaires_lots
    FOR EACH ROW
    EXECUTE FUNCTION aggregate_affaire_from_lots();

-- RLS (Row Level Security)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE affaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE affaires_lots ENABLE ROW LEVEL SECURITY;

-- Policies pour clients
CREATE POLICY "Lecture publique des clients"
    ON clients FOR SELECT
    USING (true);

CREATE POLICY "Insertion clients admin"
    ON clients FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Modification clients admin"
    ON clients FOR UPDATE
    USING (true);

-- Policies pour affaires
CREATE POLICY "Lecture publique des affaires"
    ON affaires FOR SELECT
    USING (true);

CREATE POLICY "Insertion affaires admin"
    ON affaires FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Modification affaires admin"
    ON affaires FOR UPDATE
    USING (true);

-- Policies pour affaires_lots
CREATE POLICY "Lecture publique des lots"
    ON affaires_lots FOR SELECT
    USING (true);

CREATE POLICY "Insertion lots admin"
    ON affaires_lots FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Modification lots admin"
    ON affaires_lots FOR UPDATE
    USING (true);

-- Commentaires
COMMENT ON TABLE clients IS 'Table des clients (entreprises)';
COMMENT ON TABLE affaires IS 'Table des affaires - socle métier et financier';
COMMENT ON TABLE affaires_lots IS 'Découpage financier des affaires par lots/phases';

-- Vue pour les affaires avec informations complètes
CREATE OR REPLACE VIEW v_affaires_completes AS
SELECT 
    a.id,
    a.code_affaire,
    a.site_id,
    s.nom as site_nom,
    s.code_site as site_code,
    a.responsable_id,
    r.nom as responsable_nom,
    r.prenom as responsable_prenom,
    a.client_id,
    c.nom_client,
    a.num_commande,
    a.competence_principale,
    a.type_contrat,
    a.montant_total_ht,
    a.statut,
    a.date_debut,
    a.date_fin_prevue,
    a.date_fin_reelle,
    a.avancement_pct,
    a.montant_consomme,
    a.reste_a_faire,
    a.atterrissage,
    a.marge_prevue,
    a.marge_reelle,
    a.date_creation,
    a.updated_at
FROM affaires a
LEFT JOIN sites s ON a.site_id = s.id
LEFT JOIN ressources r ON a.responsable_id = r.id
LEFT JOIN clients c ON a.client_id = c.id;

COMMENT ON VIEW v_affaires_completes IS 'Vue des affaires avec toutes les informations liées';

