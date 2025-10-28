-- Migration pour corriger la politique d'insertion anonyme
-- Le problème : la politique "Allow anonymous insert" ne fonctionne pas avec l'API REST

-- Supprimer la politique problématique
DROP POLICY IF EXISTS "Allow anonymous insert" ON access_requests;

-- Créer une politique plus permissive pour l'insertion
CREATE POLICY "Allow public insert" ON access_requests
  FOR INSERT
  WITH CHECK (true);

-- Vérifier que la politique est bien créée
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'access_requests'
ORDER BY policyname;
