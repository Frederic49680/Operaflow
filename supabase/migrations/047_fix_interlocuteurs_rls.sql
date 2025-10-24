-- Vérifier et corriger les politiques RLS pour les interlocuteurs

-- 1. Activer RLS sur les tables si ce n'est pas déjà fait
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE interlocuteurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer les anciennes politiques s'elles existent
DROP POLICY IF EXISTS "Enable read access for all users" ON clients;
DROP POLICY IF EXISTS "Enable insert access for all users" ON clients;
DROP POLICY IF EXISTS "Enable update access for all users" ON clients;
DROP POLICY IF EXISTS "Enable delete access for all users" ON clients;

DROP POLICY IF EXISTS "Enable read access for all users" ON interlocuteurs;
DROP POLICY IF EXISTS "Enable insert access for all users" ON interlocuteurs;
DROP POLICY IF EXISTS "Enable update access for all users" ON interlocuteurs;
DROP POLICY IF EXISTS "Enable delete access for all users" ON interlocuteurs;

DROP POLICY IF EXISTS "Enable read access for all users" ON sites;
DROP POLICY IF EXISTS "Enable insert access for all users" ON sites;
DROP POLICY IF EXISTS "Enable update access for all users" ON sites;
DROP POLICY IF EXISTS "Enable delete access for all users" ON sites;

-- 3. Créer les nouvelles politiques pour clients
CREATE POLICY "Enable read access for all users" ON clients
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON clients
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON clients
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON clients
    FOR DELETE USING (true);

-- 4. Créer les nouvelles politiques pour interlocuteurs
CREATE POLICY "Enable read access for all users" ON interlocuteurs
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON interlocuteurs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON interlocuteurs
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON interlocuteurs
    FOR DELETE USING (true);

-- 5. Créer les nouvelles politiques pour sites
CREATE POLICY "Enable read access for all users" ON sites
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON sites
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON sites
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON sites
    FOR DELETE USING (true);
