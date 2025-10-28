-- Script de correction pour la fonction send_custom_email
-- À exécuter dans Supabase SQL Editor

-- 1. Supprimer la fonction existante
DROP FUNCTION IF EXISTS send_custom_email(TEXT, TEXT, TEXT, TEXT);

-- 2. Créer la table email_logs si elle n'existe pas
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT,
  text_content TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Créer les index si ils n'existent pas
CREATE INDEX IF NOT EXISTS idx_email_logs_to_email ON email_logs(to_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at);

-- 4. Créer la nouvelle fonction send_custom_email
CREATE OR REPLACE FUNCTION send_custom_email(
  p_to_email TEXT,
  p_subject TEXT,
  p_html_content TEXT,
  p_text_content TEXT DEFAULT ''
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Log de l'email
  INSERT INTO email_logs (
    to_email,
    subject,
    html_content,
    text_content,
    status,
    created_at
  ) VALUES (
    p_to_email,
    p_subject,
    p_html_content,
    p_text_content,
    'sent',
    NOW()
  );
  
  -- Retourner un succès
  result := json_build_object(
    'success', true,
    'message', 'Email logged successfully',
    'to', p_to_email,
    'subject', p_subject
  );
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- En cas d'erreur, logger et retourner l'erreur
    INSERT INTO email_logs (
      to_email,
      subject,
      html_content,
      text_content,
      status,
      error_message,
      created_at
    ) VALUES (
      p_to_email,
      p_subject,
      p_html_content,
      p_text_content,
      'error',
      SQLERRM,
      NOW()
    );
    
    result := json_build_object(
      'success', false,
      'message', 'Error sending email',
      'error', SQLERRM
    );
    
    RETURN result;
END;
$$;

-- 5. Test de la fonction
SELECT send_custom_email(
  'frederic.baudry@outlook.fr',
  'Test OperaFlow',
  '<h1>Test</h1>',
  'Test'
) as test_result;
