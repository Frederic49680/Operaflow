-- Migration: Module Claims (Réclamations)
-- Description: Gestion des réclamations internes et clients
-- Date: 2025-01-18
-- PRD #10

-- Table: claims (réclamations)
CREATE TABLE IF NOT EXISTS claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Liens
    affaire_id UUID REFERENCES affaires(id),
    site_id UUID REFERENCES sites(id),
    tache_id UUID REFERENCES planning_taches(id),
    interlocuteur_id UUID REFERENCES interlocuteurs(id),
    
    -- Informations de base
    type TEXT NOT NULL CHECK (type IN ('Interne', 'Client', 'Sous-traitant')),
    titre TEXT NOT NULL,
    description TEXT NOT NULL,
    categorie TEXT,
    
    -- Montants
    montant_estime NUMERIC(12, 2) NOT NULL,
    montant_final NUMERIC(12, 2),
    
    -- Impact
    impact_financier BOOLEAN DEFAULT false,
    impact_planning BOOLEAN DEFAULT false,
    
    -- Responsable et statut
    responsable TEXT,
    statut TEXT NOT NULL CHECK (statut IN ('Ouvert', 'En analyse', 'Validé', 'Transmis', 'Clos')) DEFAULT 'Ouvert',
    
    -- Dates
    date_detection DATE NOT NULL,
    date_cloture DATE,
    
    -- Autres
    code_ana TEXT,
    fichiers JSONB[],
    commentaire_interne TEXT,
    
    -- Métadonnées
    created_by UUID,
    date_creation TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_claims_affaire ON claims(affaire_id);
CREATE INDEX IF NOT EXISTS idx_claims_site ON claims(site_id);
CREATE INDEX IF NOT EXISTS idx_claims_statut ON claims(statut);
CREATE INDEX IF NOT EXISTS idx_claims_type ON claims(type);
CREATE INDEX IF NOT EXISTS idx_claims_date_detection ON claims(date_detection);

-- Table: claim_history (historique des claims)
CREATE TABLE IF NOT EXISTS claim_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    ancien_statut TEXT,
    nouveau_statut TEXT,
    valeur_avant JSONB,
    valeur_apres JSONB,
    date_action TIMESTAMPTZ DEFAULT NOW(),
    acteur_id UUID
);

-- Index
CREATE INDEX IF NOT EXISTS idx_claim_history_claim ON claim_history(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_history_date ON claim_history(date_action DESC);

-- Table: claim_comments (commentaires sur les claims)
CREATE TABLE IF NOT EXISTS claim_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
    auteur_id UUID,
    message TEXT NOT NULL,
    fichier_url TEXT,
    date_commentaire TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_claim_comments_claim ON claim_comments(claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_comments_date ON claim_comments(date_commentaire DESC);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_claims_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_claims_updated_at
    BEFORE UPDATE ON claims
    FOR EACH ROW
    EXECUTE FUNCTION update_claims_updated_at();

-- Trigger pour l'historique automatique
CREATE OR REPLACE FUNCTION log_claim_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO claim_history (claim_id, action, ancien_statut, nouveau_statut, valeur_avant, valeur_apres, acteur_id)
        VALUES (
            NEW.id,
            'maj',
            OLD.statut,
            NEW.statut,
            to_jsonb(OLD),
            to_jsonb(NEW),
            NEW.created_by
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_claim_changes
    AFTER UPDATE ON claims
    FOR EACH ROW
    EXECUTE FUNCTION log_claim_changes();

-- RLS (Row Level Security)
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_comments ENABLE ROW LEVEL SECURITY;

-- Policies pour claims
CREATE POLICY "Lecture publique des claims"
    ON claims FOR SELECT
    USING (true);

CREATE POLICY "Insertion claims admin"
    ON claims FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Modification claims admin"
    ON claims FOR UPDATE
    USING (true);

-- Policies pour claim_history
CREATE POLICY "Lecture publique de l'historique"
    ON claim_history FOR SELECT
    USING (true);

-- Policies pour claim_comments
CREATE POLICY "Lecture publique des commentaires"
    ON claim_comments FOR SELECT
    USING (true);

CREATE POLICY "Insertion commentaires admin"
    ON claim_comments FOR INSERT
    WITH CHECK (true);

-- Commentaires
COMMENT ON TABLE claims IS 'Réclamations (internes, clients, sous-traitants)';
COMMENT ON TABLE claim_history IS 'Historique des modifications de claims';
COMMENT ON TABLE claim_comments IS 'Commentaires et discussions sur les claims';

-- Vue pour les claims avec informations complètes
CREATE OR REPLACE VIEW v_claims_complets AS
SELECT 
    c.id,
    c.affaire_id,
    a.code_affaire,
    cl.nom_client,
    c.site_id,
    s.nom as site_nom,
    c.tache_id,
    pt.libelle_tache,
    c.interlocuteur_id,
    i.nom as interlocuteur_nom,
    i.prenom as interlocuteur_prenom,
    c.type,
    c.titre,
    c.description,
    c.categorie,
    c.montant_estime,
    c.montant_final,
    c.impact_financier,
    c.impact_planning,
    c.responsable,
    c.statut,
    c.date_detection,
    c.date_cloture,
    c.code_ana,
    c.fichiers,
    c.commentaire_interne,
    c.created_by,
    c.date_creation,
    c.updated_at
FROM claims c
LEFT JOIN affaires a ON c.affaire_id = a.id
LEFT JOIN clients cl ON a.client_id = cl.id
LEFT JOIN sites s ON c.site_id = s.id
LEFT JOIN planning_taches pt ON c.tache_id = pt.id
LEFT JOIN interlocuteurs i ON c.interlocuteur_id = i.id;

COMMENT ON VIEW v_claims_complets IS 'Vue des claims avec toutes les informations liées';

