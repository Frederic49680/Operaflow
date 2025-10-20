-- Migration: Création de la table sites
-- Description: Module Sites - Gestion des sites opérationnels
-- Date: 2025-01-18

-- Création de la table sites
CREATE TABLE IF NOT EXISTS sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code_site TEXT NOT NULL UNIQUE,
    nom TEXT NOT NULL,
    responsable_id UUID,
    remplaçant_id UUID,
    statut TEXT NOT NULL CHECK (statut IN ('Actif', 'En pause', 'Fermé')),
    commentaires TEXT,
    date_creation TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_sites_code ON sites(code_site);
CREATE INDEX IF NOT EXISTS idx_sites_statut ON sites(statut);
CREATE INDEX IF NOT EXISTS idx_sites_responsable ON sites(responsable_id);

-- Commentaires sur les colonnes
COMMENT ON TABLE sites IS 'Table des sites opérationnels - clé hiérarchique du système';
COMMENT ON COLUMN sites.code_site IS 'Code unique du site (ex: E-03A)';
COMMENT ON COLUMN sites.nom IS 'Nom complet du site';
COMMENT ON COLUMN sites.responsable_id IS 'Responsable principal du site';
COMMENT ON COLUMN sites.remplaçant_id IS 'Remplaçant du responsable';
COMMENT ON COLUMN sites.statut IS 'Statut opérationnel du site';
COMMENT ON COLUMN sites.commentaires IS 'Notes internes sur le site';

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_sites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sites_updated_at
    BEFORE UPDATE ON sites
    FOR EACH ROW
    EXECUTE FUNCTION update_sites_updated_at();

-- RLS (Row Level Security)
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

-- Policy: Tout le monde peut lire les sites
CREATE POLICY "Lecture publique des sites"
    ON sites FOR SELECT
    USING (true);

-- Policy: Seuls les admins peuvent insérer
CREATE POLICY "Insertion sites admin"
    ON sites FOR INSERT
    WITH CHECK (true); -- À affiner avec l'auth plus tard

-- Policy: Seuls les admins peuvent modifier
CREATE POLICY "Modification sites admin"
    ON sites FOR UPDATE
    USING (true); -- À affiner avec l'auth plus tard

-- Policy: Seuls les admins peuvent supprimer
CREATE POLICY "Suppression sites admin"
    ON sites FOR DELETE
    USING (true); -- À affiner avec l'auth plus tard

