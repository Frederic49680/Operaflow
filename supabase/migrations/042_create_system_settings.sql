-- Création de la table system_settings
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category text NOT NULL, -- 'general', 'rh', 'notifications', 'security', 'system'
  setting_key text NOT NULL,
  setting_value text NOT NULL,
  setting_type text DEFAULT 'string', -- 'string', 'number', 'boolean'
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(category, setting_key)
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);

-- RLS (Row Level Security)
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Politique : tous les utilisateurs authentifiés peuvent lire/écrire pour l'instant
-- TODO: Restreindre aux admins quand le système de rôles sera implémenté
CREATE POLICY "Authenticated users can manage system settings" ON system_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Fonction pour obtenir une valeur de paramètre
CREATE OR REPLACE FUNCTION get_setting(category_name text, key_name text, default_value text DEFAULT NULL)
RETURNS text AS $$
DECLARE
  result text;
BEGIN
  SELECT setting_value INTO result
  FROM system_settings
  WHERE category = category_name AND setting_key = key_name;
  
  RETURN COALESCE(result, default_value);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour définir une valeur de paramètre
CREATE OR REPLACE FUNCTION set_setting(category_name text, key_name text, value text, description_text text DEFAULT NULL)
RETURNS void AS $$
BEGIN
  INSERT INTO system_settings (category, setting_key, setting_value, description)
  VALUES (category_name, key_name, value, description_text)
  ON CONFLICT (category, setting_key)
  DO UPDATE SET 
    setting_value = EXCLUDED.setting_value,
    description = COALESCE(EXCLUDED.description, system_settings.description),
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insertion des paramètres par défaut
INSERT INTO system_settings (category, setting_key, setting_value, setting_type, description) VALUES
-- Paramètres généraux
('general', 'nom_entreprise', 'OperaFlow', 'string', 'Nom de l''entreprise'),
('general', 'adresse', '123 Rue de l''Innovation, 75001 Paris', 'string', 'Adresse de l''entreprise'),
('general', 'telephone', '01 23 45 67 89', 'string', 'Téléphone de l''entreprise'),
('general', 'email', 'contact@operaflow.fr', 'string', 'Email de contact'),
('general', 'site_web', 'https://www.operaflow.fr', 'string', 'Site web de l''entreprise'),

-- Paramètres RH
('rh', 'duree_contrat_essai', '3', 'number', 'Durée du contrat d''essai en mois'),
('rh', 'delai_preavis', '1', 'number', 'Délai de préavis en mois'),
('rh', 'taux_absenteisme_max', '5', 'number', 'Taux d''absentéisme maximum autorisé (%)'),
('rh', 'duree_formation_max', '40', 'number', 'Durée maximale de formation par an (heures)'),

-- Paramètres notifications
('notifications', 'notifications_email', 'true', 'boolean', 'Activer les notifications par email'),
('notifications', 'notifications_push', 'true', 'boolean', 'Activer les notifications push'),
('notifications', 'rappel_formation', '7', 'number', 'Rappel formation (jours avant)'),
('notifications', 'alerte_fin_contrat', '30', 'number', 'Alerte fin de contrat (jours avant)'),

-- Paramètres sécurité
('security', 'mot_de_passe_complexe', 'true', 'boolean', 'Exiger des mots de passe complexes'),
('security', 'double_authentification', 'false', 'boolean', 'Activer la double authentification'),
('security', 'duree_session', '8', 'number', 'Durée de session en heures'),
('security', 'tentatives_connexion', '3', 'number', 'Nombre maximum de tentatives de connexion'),

-- Paramètres système
('system', 'sauvegarde_auto', 'true', 'boolean', 'Sauvegarde automatique activée'),
('system', 'frequence_sauvegarde', 'quotidienne', 'string', 'Fréquence des sauvegardes'),
('system', 'retention_donnees', '5', 'number', 'Rétention des données en années'),
('system', 'maintenance_mode', 'false', 'boolean', 'Mode maintenance activé');

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_system_settings_updated_at();
