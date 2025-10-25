-- Corriger les politiques RLS pour la table taches_ressources

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Allow public read access" ON taches_ressources;
DROP POLICY IF EXISTS "Allow authenticated insert access" ON taches_ressources;
DROP POLICY IF EXISTS "Allow authenticated update access" ON taches_ressources;
DROP POLICY IF EXISTS "Allow authenticated delete access" ON taches_ressources;

-- Créer des politiques plus permissives
CREATE POLICY "Enable read access for all users" ON taches_ressources FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON taches_ressources FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON taches_ressources FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON taches_ressources FOR DELETE USING (true);
