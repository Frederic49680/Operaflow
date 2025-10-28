-- Migration pour créer une fonction qui contourne RLS pour les demandes d'accès
-- Cette fonction sera appelée avec les privilèges du créateur (SECURITY DEFINER)

CREATE OR REPLACE FUNCTION create_access_request(
  p_email text,
  p_prenom text,
  p_nom text,
  p_message text DEFAULT 'Demande d''accès à OperaFlow'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request_id uuid;
BEGIN
  -- Vérifier si une demande existe déjà pour cet email
  IF EXISTS (
    SELECT 1 FROM access_requests 
    WHERE email = p_email 
    AND statut IN ('pending', 'approved')
  ) THEN
    RAISE EXCEPTION 'Une demande existe déjà pour cet email';
  END IF;

  -- Créer la demande d'accès
  INSERT INTO access_requests (email, prenom, nom, message, statut, created_at)
  VALUES (p_email, p_prenom, p_nom, p_message, 'pending', NOW())
  RETURNING id INTO v_request_id;

  RETURN v_request_id;
END;
$$;

-- Donner les permissions d'exécution à tous les utilisateurs
GRANT EXECUTE ON FUNCTION create_access_request(text, text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION create_access_request(text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION create_access_request(text, text, text, text) TO service_role;
