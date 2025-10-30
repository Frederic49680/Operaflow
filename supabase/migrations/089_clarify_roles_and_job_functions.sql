-- Migration 089: Clarifier la séparation entre rôles applicatifs et fonctions métier
-- Diagnostic et correction de la confusion entre roles (app) et roles (métier)

-- Créer la table job_functions si elle n'existe pas (sinon, migration 088 l'a déjà fait)
CREATE TABLE IF NOT EXISTS job_functions (
    code TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    seniority_rank INTEGER NOT NULL,
    description TEXT,
    is_special BOOLEAN DEFAULT FALSE,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer resource_job_functions si elle n'existe pas
CREATE TABLE IF NOT EXISTS resource_job_functions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES ressources(id) ON DELETE CASCADE,
    job_function_code TEXT NOT NULL REFERENCES job_functions(code) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(resource_id, job_function_code)
);

-- Migrer les données de resource_roles vers resource_job_functions
-- (si resource_roles existe et utilise des codes de fonctions métier)
INSERT INTO resource_job_functions (resource_id, job_function_code, is_primary, created_at)
SELECT 
    rr.resource_id,
    rr.role_code,
    rr.is_primary,
    rr.created_at
FROM resource_roles rr
WHERE NOT EXISTS (
    SELECT 1 FROM resource_job_functions rjf 
    WHERE rjf.resource_id = rr.resource_id 
    AND rjf.job_function_code = rr.role_code
)
ON CONFLICT (resource_id, job_function_code) DO NOTHING;

-- Insérer les fonctions métier si elles n'existent pas déjà
INSERT INTO job_functions (code, label, seniority_rank, description, is_special, category) VALUES
-- Opérationnels
('N1', 'Intervenant', 1, 'Exécution terrain', FALSE, 'OPERATIONNEL'),
('N2', 'Chargé de Travaux', 2, 'Opérationnel', FALSE, 'OPERATIONNEL'),
('N3', 'Chef de Chantier', 3, 'Superviseur de site', FALSE, 'OPERATIONNEL'),
('N4', 'Conducteur de Travaux', 4, 'Coordination multi-chantier', FALSE, 'OPERATIONNEL'),
('N5', 'Chargé d''Affaire', 5, 'Gestion technique & financière', FALSE, 'OPERATIONNEL'),
('N6', 'Responsable d''Activités', 6, 'Pilotage multi-affaires', FALSE, 'OPERATIONNEL'),
('N7', 'Responsable d''Agence', 7, 'Niveau local', FALSE, 'OPERATIONNEL'),
('N8', 'Responsable Régional', 8, 'Niveau direction', FALSE, 'OPERATIONNEL'),

-- Administratifs
('NA', 'Administratif', 0, 'Hors hiérarchie', TRUE, 'ADMINISTRATIF'),
('NB', 'Magasinier', 0, 'Hors hiérarchie', TRUE, 'ADMINISTRATIF'),
('NC', 'Chargé d''Étude', 0, 'Hors hiérarchie', TRUE, 'ADMINISTRATIF'),

-- Direction
('DIR', 'Directeur', 0, 'Niveau direction', TRUE, 'DIRECTION'),
('MANAGER', 'Manager', 0, 'Manager de projet', TRUE, 'DIRECTION'),
('EXPERT', 'Expert', 0, 'Expert technique', TRUE, 'OPERATIONNEL'),

-- Anciennes fonctions (si déjà utilisées)
('TECH', 'Technicien', 1, 'Technicien de terrain', FALSE, 'OPERATIONNEL'),
('CHEF', 'Chef d''équipe', 2, 'Chef d''équipe technique', FALSE, 'OPERATIONNEL'),
('RESP', 'Responsable', 3, 'Responsable technique', FALSE, 'OPERATIONNEL'),
('CT', 'Chargé de Travaux', 2, 'Chargé de Travaux', FALSE, 'OPERATIONNEL'),
('CC', 'Chef de Chantier', 3, 'Chef de Chantier', FALSE, 'OPERATIONNEL'),
('CDT', 'Conducteur de Travaux', 4, 'Conducteur de Travaux', FALSE, 'OPERATIONNEL'),
('CA', 'Chargé d''Affaire', 5, 'Chargé d''Affaire', FALSE, 'OPERATIONNEL'),
('RA', 'Responsable d''Activités', 6, 'Responsable d''Activités', FALSE, 'OPERATIONNEL'),
('RAG', 'Responsable d''Agence', 7, 'Responsable d''Agence', FALSE, 'OPERATIONNEL'),
('INTER', 'Intervenant', 1, 'Intervenant', FALSE, 'OPERATIONNEL'),
('ETUDE', 'Chargé d''Étude', 0, 'Chargé d''Étude', TRUE, 'ADMINISTRATIF'),
('MAG', 'Magasinier', 0, 'Magasinier', TRUE, 'ADMINISTRATIF'),
('ADMIN', 'Administratif', 0, 'Administratif', TRUE, 'ADMINISTRATIF')
ON CONFLICT (code) DO NOTHING;

-- Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_resource_job_functions_resource_id ON resource_job_functions(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_job_functions_job_function_code ON resource_job_functions(job_function_code);
CREATE INDEX IF NOT EXISTS idx_job_functions_category ON job_functions(category);
CREATE INDEX IF NOT EXISTS idx_job_functions_seniority ON job_functions(seniority_rank);

-- RLS (Row Level Security) pour job_functions
ALTER TABLE job_functions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_job_functions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour lecture publique (compat PG: pas de IF NOT EXISTS sur CREATE POLICY)
DROP POLICY IF EXISTS "Lecture publique des job_functions" ON job_functions;
CREATE POLICY "Lecture publique des job_functions" ON job_functions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lecture publique des resource_job_functions" ON resource_job_functions;
CREATE POLICY "Lecture publique des resource_job_functions" ON resource_job_functions FOR SELECT USING (true);

-- Trigger pour s'assurer qu'une ressource n'a qu'un seul rôle principal
CREATE OR REPLACE FUNCTION check_unique_primary_job_function()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_primary = TRUE THEN
        IF EXISTS (
            SELECT 1 FROM resource_job_functions 
            WHERE resource_id = NEW.resource_id 
            AND is_primary = TRUE 
            AND id != NEW.id
        ) THEN
            RAISE EXCEPTION 'Une ressource ne peut avoir qu''une seule fonction principale';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer le trigger s'il existe et le recréer
DROP TRIGGER IF EXISTS trigger_check_unique_primary_job_function ON resource_job_functions;
CREATE TRIGGER trigger_check_unique_primary_job_function
    BEFORE INSERT OR UPDATE ON resource_job_functions
    FOR EACH ROW
    EXECUTE FUNCTION check_unique_primary_job_function();

-- Commentaires
COMMENT ON TABLE job_functions IS 'Fonctions hiérarchiques de l''entreprise (distinctes des rôles applicatifs de la table roles)';
COMMENT ON TABLE resource_job_functions IS 'Association ressources-fonctions métier';
COMMENT ON COLUMN job_functions.code IS 'Code unique de la fonction (N1-N8, NA-NC, DIR, etc.)';
COMMENT ON COLUMN job_functions.category IS 'Catégorie: OPERATIONNEL, ADMINISTRATIF, DIRECTION';

-- Résumé de la séparation
-- roles = Rôles applicatifs (droits d'accès) pour app_users
-- job_functions = Fonctions métier (hiérarchie) pour ressources
