-- Migration 060: Ajouter une colonne role calculée à app_users
-- Cette colonne sera mise à jour automatiquement via un trigger

-- Ajouter la colonne role à app_users
ALTER TABLE app_users 
ADD COLUMN IF NOT EXISTS role TEXT;

-- Créer une fonction pour mettre à jour le role d'un utilisateur
CREATE OR REPLACE FUNCTION update_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le role de l'utilisateur basé sur son premier rôle actif
  UPDATE app_users 
  SET role = (
    SELECT r.code 
    FROM roles r 
    JOIN user_roles ur ON r.id = ur.role_id 
    WHERE ur.user_id = COALESCE(NEW.user_id, OLD.user_id)
    ORDER BY r.seniority_rank ASC 
    LIMIT 1
  )
  WHERE id = COALESCE(NEW.user_id, OLD.user_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour user_roles
DROP TRIGGER IF EXISTS trigger_update_user_role ON user_roles;
CREATE TRIGGER trigger_update_user_role
  AFTER INSERT OR UPDATE OR DELETE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_role();

-- Mettre à jour tous les utilisateurs existants
UPDATE app_users 
SET role = (
  SELECT r.code 
  FROM roles r 
  JOIN user_roles ur ON r.id = ur.role_id 
  WHERE ur.user_id = app_users.id
  ORDER BY r.seniority_rank ASC 
  LIMIT 1
);

-- Ajouter un index sur la colonne role
CREATE INDEX IF NOT EXISTS idx_app_users_role ON app_users(role);
