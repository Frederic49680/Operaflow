-- Création de la table taches_ressources
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

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_taches_ressources_tache ON taches_ressources(tache_id);
CREATE INDEX IF NOT EXISTS idx_taches_ressources_ressource ON taches_ressources(ressource_id);

-- RLS (Row Level Security)
ALTER TABLE taches_ressources ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Allow public read access" ON taches_ressources FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert access" ON taches_ressources FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update access" ON taches_ressources FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete access" ON taches_ressources FOR DELETE USING (auth.role() = 'authenticated');

-- Commentaire
COMMENT ON TABLE taches_ressources IS 'Table de liaison entre tâches et ressources';

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Table taches_ressources créée avec succès !';
END $$;
