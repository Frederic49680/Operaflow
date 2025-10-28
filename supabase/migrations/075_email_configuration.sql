-- Migration pour configurer les templates d'email Supabase
-- et les paramètres d'authentification

-- Configuration des templates d'email personnalisés
-- Note: Ces configurations doivent être faites dans le dashboard Supabase
-- mais on peut documenter les paramètres ici

-- Template pour la réinitialisation de mot de passe
-- Subject: 🔒 Réinitialisation de votre mot de passe OperaFlow
-- Body HTML: Utiliser le template de lib/email.ts

-- Template pour la confirmation d'email
-- Subject: 🎉 Confirmez votre compte OperaFlow
-- Body HTML: Utiliser le template de lib/email.ts

-- Configuration des URLs de redirection
-- Ces URLs doivent être configurées dans le dashboard Supabase :
-- - Site URL: https://operaflow-ten.vercel.app
-- - Redirect URLs: 
--   - https://operaflow-ten.vercel.app/auth/reset-password
--   - https://operaflow-ten.vercel.app/auth/activate
--   - https://operaflow-ten.vercel.app/dashboard

-- Configuration des paramètres d'email
-- - SMTP Host: À configurer dans le dashboard Supabase
-- - SMTP Port: 587 (TLS) ou 465 (SSL)
-- - SMTP User: Votre utilisateur SMTP
-- - SMTP Pass: Votre mot de passe SMTP
-- - SMTP Admin Email: admin@operaflow.com

-- Création d'une fonction pour envoyer des emails personnalisés
CREATE OR REPLACE FUNCTION send_custom_email(
  p_to_email TEXT,
  p_subject TEXT,
  p_html_content TEXT,
  p_text_content TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result BOOLEAN := FALSE;
BEGIN
  -- Cette fonction utilise le service d'email de Supabase
  -- Pour l'instant, on log les emails (à remplacer par l'envoi réel)
  
  INSERT INTO email_log (
    to_email,
    subject,
    html_content,
    text_content,
    sent_at,
    status
  ) VALUES (
    p_to_email,
    p_subject,
    p_html_content,
    p_text_content,
    NOW(),
    'sent'
  );
  
  -- TODO: Intégrer avec le service d'email réel de Supabase
  -- ou un service externe comme SendGrid, Mailgun, etc.
  
  v_result := TRUE;
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log l'erreur
    INSERT INTO email_log (
      to_email,
      subject,
      html_content,
      text_content,
      sent_at,
      status,
      error_message
    ) VALUES (
      p_to_email,
      p_subject,
      p_html_content,
      p_text_content,
      NOW(),
      'failed',
      SQLERRM
    );
    
    RETURN FALSE;
END;
$$;

-- Table pour logger les emails envoyés
CREATE TABLE IF NOT EXISTS email_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT,
  text_content TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT CHECK (status IN ('sent', 'failed', 'pending')) DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les recherches par email et date
CREATE INDEX IF NOT EXISTS idx_email_log_to_email ON email_log(to_email);
CREATE INDEX IF NOT EXISTS idx_email_log_sent_at ON email_log(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_log_status ON email_log(status);

-- Fonction pour nettoyer les anciens logs d'email (plus de 30 jours)
CREATE OR REPLACE FUNCTION cleanup_old_email_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM email_log 
  WHERE sent_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$;

-- Fonction pour obtenir les statistiques d'emails
CREATE OR REPLACE FUNCTION get_email_stats(days_back INTEGER DEFAULT 7)
RETURNS TABLE (
  total_emails BIGINT,
  successful_emails BIGINT,
  failed_emails BIGINT,
  success_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_emails,
    COUNT(*) FILTER (WHERE status = 'sent') as successful_emails,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_emails,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(*) FILTER (WHERE status = 'sent')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
      ELSE 0
    END as success_rate
  FROM email_log
  WHERE sent_at >= NOW() - (days_back || ' days')::INTERVAL;
END;
$$;

-- RLS pour la table email_log
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

-- Politique pour les admins seulement
CREATE POLICY "Admins can view all email logs" ON email_log
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

-- Commentaires pour la documentation
COMMENT ON TABLE email_log IS 'Log des emails envoyés par l''application';
COMMENT ON FUNCTION send_custom_email IS 'Fonction pour envoyer des emails personnalisés';
COMMENT ON FUNCTION cleanup_old_email_logs IS 'Nettoie les anciens logs d''email (plus de 30 jours)';
COMMENT ON FUNCTION get_email_stats IS 'Retourne les statistiques d''envoi d''emails';
