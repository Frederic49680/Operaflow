-- Migration pour créer la table des demandes d'accès
-- et les fonctions associées

-- Table pour stocker les demandes d'accès
CREATE TABLE IF NOT EXISTS access_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  prenom TEXT NOT NULL,
  nom TEXT NOT NULL,
  message TEXT,
  statut TEXT CHECK (statut IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  role_id UUID REFERENCES roles(id),
  sites_scope UUID[] DEFAULT '{}',
  processed_by UUID REFERENCES app_users(id),
  processed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_access_requests_email ON access_requests(email);
CREATE INDEX IF NOT EXISTS idx_access_requests_statut ON access_requests(statut);
CREATE INDEX IF NOT EXISTS idx_access_requests_created_at ON access_requests(created_at);

-- Fonction pour approuver une demande d'accès
CREATE OR REPLACE FUNCTION approve_access_request(
  p_request_id UUID,
  p_role_id UUID DEFAULT NULL,
  p_sites_scope UUID[] DEFAULT '{}',
  p_processed_by UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request access_requests%ROWTYPE;
  v_temporary_password TEXT;
  v_activation_token TEXT;
  v_result JSON;
BEGIN
  -- Récupérer la demande
  SELECT * INTO v_request
  FROM access_requests
  WHERE id = p_request_id AND statut = 'pending';
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Demande non trouvée ou déjà traitée'
    );
  END IF;
  
  -- Générer un mot de passe temporaire et un token
  v_temporary_password := substring(md5(random()::text) from 1 for 12);
  v_activation_token := substring(md5(random()::text) from 1 for 32);
  
  -- Créer l'utilisateur dans Supabase Auth (via l'API)
  -- Note: Cette partie sera gérée par l'API Next.js
  
  -- Mettre à jour la demande
  UPDATE access_requests
  SET 
    statut = 'approved',
    role_id = COALESCE(p_role_id, role_id),
    sites_scope = COALESCE(p_sites_scope, sites_scope),
    processed_by = p_processed_by,
    processed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_request_id;
  
  -- Retourner les informations pour l'envoi d'email
  v_result := json_build_object(
    'success', true,
    'message', 'Demande approuvée avec succès',
    'user_data', json_build_object(
      'email', v_request.email,
      'prenom', v_request.prenom,
      'nom', v_request.nom,
      'temporary_password', v_temporary_password,
      'activation_token', v_activation_token
    )
  );
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Erreur lors de l''approbation: ' || SQLERRM
    );
END;
$$;

-- Fonction pour rejeter une demande d'accès
CREATE OR REPLACE FUNCTION reject_access_request(
  p_request_id UUID,
  p_rejection_reason TEXT,
  p_processed_by UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request access_requests%ROWTYPE;
BEGIN
  -- Récupérer la demande
  SELECT * INTO v_request
  FROM access_requests
  WHERE id = p_request_id AND statut = 'pending';
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Demande non trouvée ou déjà traitée'
    );
  END IF;
  
  -- Mettre à jour la demande
  UPDATE access_requests
  SET 
    statut = 'rejected',
    rejection_reason = p_rejection_reason,
    processed_by = p_processed_by,
    processed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_request_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Demande rejetée avec succès',
    'user_data', json_build_object(
      'email', v_request.email,
      'prenom', v_request.prenom,
      'nom', v_request.nom,
      'rejection_reason', p_rejection_reason
    )
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Erreur lors du rejet: ' || SQLERRM
    );
END;
$$;

-- Fonction pour obtenir les statistiques des demandes
CREATE OR REPLACE FUNCTION get_access_request_stats()
RETURNS TABLE (
  total_requests BIGINT,
  pending_requests BIGINT,
  approved_requests BIGINT,
  rejected_requests BIGINT,
  approval_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_requests,
    COUNT(*) FILTER (WHERE statut = 'pending') as pending_requests,
    COUNT(*) FILTER (WHERE statut = 'approved') as approved_requests,
    COUNT(*) FILTER (WHERE statut = 'rejected') as rejected_requests,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(*) FILTER (WHERE statut = 'approved')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
      ELSE 0
    END as approval_rate
  FROM access_requests;
END;
$$;

-- RLS pour la table access_requests
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

-- Politique pour les admins seulement
CREATE POLICY "Admins can manage access requests" ON access_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.code = 'admin'
    )
  );

-- Politique pour permettre la création de demandes (sans authentification)
CREATE POLICY "Anyone can create access requests" ON access_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_access_request_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_access_request_updated_at
  BEFORE UPDATE ON access_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_access_request_updated_at();

-- Commentaires pour la documentation
COMMENT ON TABLE access_requests IS 'Demandes d''accès à l''application';
COMMENT ON FUNCTION approve_access_request IS 'Approuve une demande d''accès et crée l''utilisateur';
COMMENT ON FUNCTION reject_access_request IS 'Rejette une demande d''accès avec une raison';
COMMENT ON FUNCTION get_access_request_stats IS 'Retourne les statistiques des demandes d''accès';
