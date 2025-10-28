-- Vérifier et corriger les politiques RLS pour access_requests
-- Cette migration s'assure que les admins peuvent lire toutes les demandes

-- D'abord, vérifier les politiques existantes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'access_requests';

-- Supprimer les politiques existantes pour recommencer proprement
DROP POLICY IF EXISTS "Admins full access" ON access_requests;
DROP POLICY IF EXISTS "Allow anonymous insert" ON access_requests;
DROP POLICY IF EXISTS "Users read own requests" ON access_requests;

-- Créer une politique simple pour les admins : accès complet
CREATE POLICY "Admins full access" ON access_requests
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.code = 'ADMIN'
  )
);

-- Créer une politique pour permettre l'insertion anonyme (formulaire de demande)
CREATE POLICY "Allow anonymous insert" ON access_requests
FOR INSERT
TO anon
WITH CHECK (true);

-- Créer une politique pour que les utilisateurs puissent lire leurs propres demandes
CREATE POLICY "Users read own requests" ON access_requests
FOR SELECT
TO authenticated
USING (
  email = (
    SELECT email FROM auth.users 
    WHERE id = auth.uid()
  )
);

-- Vérifier que RLS est activé
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

-- Test de la politique admin
-- Cette requête devrait retourner toutes les demandes si l'utilisateur est admin
SELECT 'Test politique admin' as test, COUNT(*) as nb_demandes
FROM access_requests;
