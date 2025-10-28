-- Migration corrective pour les politiques RLS access_requests
-- Supprimer et recréer les politiques pour éviter les conflits

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Admins can manage access requests" ON access_requests;
DROP POLICY IF EXISTS "Anyone can create access requests" ON access_requests;

-- Désactiver temporairement RLS
ALTER TABLE access_requests DISABLE ROW LEVEL SECURITY;

-- Réactiver RLS
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

-- Recréer les politiques dans le bon ordre
-- 1. Politique pour la création (anonyme)
CREATE POLICY "Allow anonymous insert" ON access_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 2. Politique pour les admins (lecture/écriture complète)
CREATE POLICY "Admins full access" ON access_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = 'admin'
    )
  );

-- 3. Politique pour les utilisateurs authentifiés (lecture de leurs propres demandes)
CREATE POLICY "Users read own requests" ON access_requests
  FOR SELECT
  TO authenticated
  USING (
    email = (
      SELECT email FROM app_users 
      WHERE id = auth.uid()
    )
  );

-- Vérifier que les politiques sont bien créées
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'access_requests'
ORDER BY policyname;
