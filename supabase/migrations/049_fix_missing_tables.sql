-- ============================================================================
-- Migration 049 : Correction des tables manquantes
-- ============================================================================
-- Auteur : Fred Baudry
-- Date : 2025-01-20
-- Description : Créer les tables manquantes pour éviter les erreurs 404/400
-- ============================================================================

-- ============================================================================
-- TABLE : competencies (si elle n'existe pas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS competencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom TEXT NOT NULL,
    description TEXT,
    categorie TEXT,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_competencies_nom ON competencies(nom);
CREATE INDEX IF NOT EXISTS idx_competencies_actif ON competencies(actif);

-- RLS
ALTER TABLE competencies ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read access" ON competencies FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert access" ON competencies FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update access" ON competencies FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete access" ON competencies FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================================
-- TABLE : taches_ressources (si elle n'existe pas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS taches_ressources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tache_id UUID REFERENCES planning_taches(id) ON DELETE CASCADE,
    ressource_id UUID REFERENCES ressources(id) ON DELETE CASCADE,
    charge_h NUMERIC DEFAULT 0,
    taux_affectation NUMERIC DEFAULT 100,
    competence TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_taches_ressources_tache ON taches_ressources(tache_id);
CREATE INDEX IF NOT EXISTS idx_taches_ressources_ressource ON taches_ressources(ressource_id);

-- RLS
ALTER TABLE taches_ressources ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read access" ON taches_ressources FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert access" ON taches_ressources FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update access" ON taches_ressources FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete access" ON taches_ressources FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================================
-- INSÉRER DES DONNÉES DE BASE POUR COMPETENCIES
-- ============================================================================
INSERT INTO competencies (nom, description, categorie) VALUES
('Électricité', 'Compétences en électricité générale', 'Technique'),
('CVC', 'Chauffage, Ventilation, Climatisation', 'Technique'),
('Plomberie', 'Installation et maintenance plomberie', 'Technique'),
('Sécurité', 'Sécurité au travail et prévention', 'Sécurité'),
('Management', 'Encadrement d''équipe', 'Management')
ON CONFLICT (nom) DO NOTHING;

-- ============================================================================
-- COMMENTAIRES
-- ============================================================================
COMMENT ON TABLE competencies IS 'Table des compétences disponibles';
COMMENT ON TABLE taches_ressources IS 'Table de liaison entre tâches et ressources';

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Tables manquantes créées avec succès !';
  RAISE NOTICE 'Tables créées : competencies, taches_ressources';
END $$;
