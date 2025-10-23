-- Migration 040: Système Rôles, Compétences & Affectations
-- Création des tables de base pour le système d'affectation avancé

-- 1. Table des rôles hiérarchiques
CREATE TABLE IF NOT EXISTS roles (
    code TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    seniority_rank INTEGER NOT NULL,
    description TEXT,
    is_special BOOLEAN DEFAULT FALSE, -- Pour NA, NB, NC
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table des compétences
CREATE TABLE IF NOT EXISTS competencies (
    code TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table des rôles par ressource (multi-rôles)
CREATE TABLE IF NOT EXISTS resource_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES ressources(id) ON DELETE CASCADE,
    role_code TEXT NOT NULL REFERENCES roles(code) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(resource_id, role_code)
    -- Contrainte unique_primary_role sera gérée par un trigger
);

-- 4. Table des compétences par ressource
CREATE TABLE IF NOT EXISTS resource_competencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES ressources(id) ON DELETE CASCADE,
    competency_code TEXT NOT NULL REFERENCES competencies(code) ON DELETE CASCADE,
    level INTEGER NOT NULL CHECK (level >= 1 AND level <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(resource_id, competency_code)
);

-- 5. Table des associations naturelles compétence → rôle
CREATE TABLE IF NOT EXISTS resource_competency_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES ressources(id) ON DELETE CASCADE,
    competency_code TEXT NOT NULL REFERENCES competencies(code) ON DELETE CASCADE,
    role_code TEXT NOT NULL REFERENCES roles(code) ON DELETE CASCADE,
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(resource_id, competency_code, role_code)
);

-- 6. Table des règles de substitution
CREATE TABLE IF NOT EXISTS substitution_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    can_play_role TEXT NOT NULL REFERENCES roles(code) ON DELETE CASCADE,
    when_missing_role TEXT NOT NULL REFERENCES roles(code) ON DELETE CASCADE,
    max_days INTEGER DEFAULT 5,
    requires_approval_level TEXT REFERENCES roles(code) ON DELETE SET NULL,
    penalty_score INTEGER DEFAULT 20,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Table des affectations confirmées
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES planning_taches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES ressources(id) ON DELETE CASCADE,
    role_expected TEXT NOT NULL REFERENCES roles(code) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'CANCELLED')),
    source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'auto')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Table des affectations provisoires
CREATE TABLE IF NOT EXISTS provisional_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES planning_taches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES ressources(id) ON DELETE CASCADE,
    acting_as_role TEXT NOT NULL REFERENCES roles(code) ON DELETE CASCADE,
    user_primary_role TEXT NOT NULL REFERENCES roles(code) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    substitution_rule_id UUID REFERENCES substitution_rules(id) ON DELETE SET NULL,
    penalty_score INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED')),
    requested_by UUID REFERENCES ressources(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES ressources(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Table des logs d'audit
CREATE TABLE IF NOT EXISTS assignment_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID, -- Peut être NULL pour les logs généraux
    action TEXT NOT NULL,
    details JSONB,
    actor_id UUID REFERENCES ressources(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertion des rôles de base
INSERT INTO roles (code, label, seniority_rank, description, is_special) VALUES
('N1', 'Intervenant', 1, 'Exécution terrain', FALSE),
('N2', 'Chargé de Travaux', 2, 'Opérationnel', FALSE),
('N3', 'Chef de Chantier', 3, 'Superviseur de site', FALSE),
('N4', 'Conducteur de Travaux', 4, 'Coordination multi-chantier', FALSE),
('N5', 'Chargé d''Affaire', 5, 'Gestion technique & financière', FALSE),
('N6', 'Responsable d''Activités', 6, 'Pilotage multi-affaires', FALSE),
('N7', 'Responsable d''Agence', 7, 'Niveau local', FALSE),
('N8', 'Responsable Régional', 8, 'Niveau direction', FALSE),
('NA', 'Administratif', 0, 'Hors hiérarchie', TRUE),
('NB', 'Magasinier', 0, 'Hors hiérarchie', TRUE),
('NC', 'Chargé d''Étude', 0, 'Hors hiérarchie', TRUE)
ON CONFLICT (code) DO NOTHING;

-- Insertion des compétences de base
INSERT INTO competencies (code, label, description) VALUES
('AUTO', 'Automatisme', 'Systèmes automatisés et contrôle'),
('IEG', 'Électricité Générale', 'Installations électriques générales'),
('IES', 'Électricité Spécialisée', 'Installations électriques spécialisées'),
('CVC', 'Chauffage Ventilation Climatisation', 'Systèmes CVC'),
('PLB', 'Plomberie', 'Installations sanitaires'),
('SEC', 'Sécurité', 'Systèmes de sécurité et sûreté'),
('TEL', 'Télécoms', 'Réseaux de télécommunications'),
('GEN', 'Génie Civil', 'Travaux de génie civil')
ON CONFLICT (code) DO NOTHING;

-- Règles de substitution par défaut
INSERT INTO substitution_rules (can_play_role, when_missing_role, max_days, requires_approval_level, penalty_score, description) VALUES
-- N4 peut remplacer N3
('N4', 'N3', 5, 'N6', 20, 'Conducteur de Travaux peut couvrir Chef de Chantier'),
-- N3 peut remplacer N2
('N3', 'N2', 3, 'N5', 15, 'Chef de Chantier peut couvrir Chargé de Travaux'),
-- N2 peut remplacer N1
('N2', 'N1', 2, 'N4', 10, 'Chargé de Travaux peut couvrir Intervenant'),
-- N5 peut remplacer N4
('N5', 'N4', 7, 'N7', 25, 'Chargé d''Affaire peut couvrir Conducteur de Travaux'),
-- NB peut remplacer NA (même agence)
('NB', 'NA', 10, NULL, 5, 'Magasinier peut couvrir Administratif (même agence)')
ON CONFLICT DO NOTHING;

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_resource_roles_resource_id ON resource_roles(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_roles_role_code ON resource_roles(role_code);
CREATE INDEX IF NOT EXISTS idx_resource_competencies_resource_id ON resource_competencies(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_competencies_competency_code ON resource_competencies(competency_code);
CREATE INDEX IF NOT EXISTS idx_assignments_task_id ON assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_assignments_user_id ON assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_provisional_assignments_task_id ON provisional_assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_provisional_assignments_user_id ON provisional_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_provisional_assignments_status ON provisional_assignments(status);
CREATE INDEX IF NOT EXISTS idx_provisional_assignments_expires_at ON provisional_assignments(expires_at);

-- RLS Policies
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_competency_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE substitution_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE provisional_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_logs ENABLE ROW LEVEL SECURITY;

-- Politiques de lecture pour tous
CREATE POLICY "Lecture publique des rôles" ON roles FOR SELECT USING (true);
CREATE POLICY "Lecture publique des compétences" ON competencies FOR SELECT USING (true);
CREATE POLICY "Lecture publique des rôles ressources" ON resource_roles FOR SELECT USING (true);
CREATE POLICY "Lecture publique des compétences ressources" ON resource_competencies FOR SELECT USING (true);
CREATE POLICY "Lecture publique des associations compétence-rôle" ON resource_competency_roles FOR SELECT USING (true);
CREATE POLICY "Lecture publique des règles de substitution" ON substitution_rules FOR SELECT USING (true);
CREATE POLICY "Lecture publique des affectations" ON assignments FOR SELECT USING (true);
CREATE POLICY "Lecture publique des affectations provisoires" ON provisional_assignments FOR SELECT USING (true);
CREATE POLICY "Lecture publique des logs d'audit" ON assignment_logs FOR SELECT USING (true);

-- Politiques d'écriture (à adapter selon les rôles)
CREATE POLICY "Modification des rôles ressources" ON resource_roles FOR ALL USING (true);
CREATE POLICY "Modification des compétences ressources" ON resource_competencies FOR ALL USING (true);
CREATE POLICY "Modification des associations compétence-rôle" ON resource_competency_roles FOR ALL USING (true);
CREATE POLICY "Modification des affectations" ON assignments FOR ALL USING (true);
CREATE POLICY "Modification des affectations provisoires" ON provisional_assignments FOR ALL USING (true);
CREATE POLICY "Insertion des logs d'audit" ON assignment_logs FOR INSERT WITH CHECK (true);

-- Fonction pour calculer le score de candidature
CREATE OR REPLACE FUNCTION calculate_candidate_score(
    p_resource_id UUID,
    p_required_role TEXT,
    p_required_competency TEXT,
    p_competency_level INTEGER DEFAULT 1
) RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    resource_primary_role TEXT;
    resource_competency_level INTEGER;
    has_natural_role BOOLEAN := FALSE;
    substitution_penalty INTEGER := 0;
BEGIN
    -- Récupérer le rôle principal de la ressource
    SELECT role_code INTO resource_primary_role
    FROM resource_roles 
    WHERE resource_id = p_resource_id AND is_primary = TRUE;
    
    -- Récupérer le niveau de compétence
    SELECT level INTO resource_competency_level
    FROM resource_competencies 
    WHERE resource_id = p_resource_id AND competency_code = p_required_competency;
    
    -- Score de base : match parfait = 0
    IF resource_primary_role = p_required_role THEN
        score := 0;
    ELSE
        -- Vérifier si la ressource a un rôle naturel pour cette compétence
        SELECT EXISTS(
            SELECT 1 FROM resource_competency_roles 
            WHERE resource_id = p_resource_id 
            AND competency_code = p_required_competency 
            AND role_code = p_required_role
        ) INTO has_natural_role;
        
        IF has_natural_role THEN
            score := 10; -- Rôle naturel
        ELSE
            -- Calculer la pénalité de substitution
            SELECT penalty_score INTO substitution_penalty
            FROM substitution_rules 
            WHERE can_play_role = resource_primary_role 
            AND when_missing_role = p_required_role;
            
            IF substitution_penalty IS NOT NULL THEN
                score := substitution_penalty;
            ELSE
                score := 100; -- Pas de règle de substitution
            END IF;
        END IF;
    END IF;
    
    -- Pénalité si niveau de compétence insuffisant
    IF resource_competency_level < p_competency_level THEN
        score := score + (p_competency_level - resource_competency_level) * 10;
    END IF;
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour proposer les candidats
CREATE OR REPLACE FUNCTION get_task_candidates(
    p_task_id UUID,
    p_required_role TEXT,
    p_required_competency TEXT,
    p_competency_level INTEGER DEFAULT 1,
    p_limit INTEGER DEFAULT 5
) RETURNS TABLE (
    resource_id UUID,
    full_name TEXT,
    primary_role TEXT,
    competency_level INTEGER,
    score INTEGER,
    match_type TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id as resource_id,
        CONCAT(r.prenom, ' ', r.nom) as full_name,
        rr.role_code as primary_role,
        rc.level as competency_level,
        calculate_candidate_score(r.id, p_required_role, p_required_competency, p_competency_level) as score,
        CASE 
            WHEN rr.role_code = p_required_role THEN 'Match direct'
            WHEN EXISTS(
                SELECT 1 FROM resource_competency_roles rcr 
                WHERE rcr.resource_id = r.id 
                AND rcr.competency_code = p_required_competency 
                AND rcr.role_code = p_required_role
            ) THEN 'Rôle naturel'
            WHEN EXISTS(
                SELECT 1 FROM substitution_rules sr 
                WHERE sr.can_play_role = rr.role_code 
                AND sr.when_missing_role = p_required_role
            ) THEN 'Substitution'
            ELSE 'Incompatible'
        END as match_type
    FROM ressources r
    JOIN resource_roles rr ON r.id = rr.resource_id AND rr.is_primary = TRUE
    JOIN resource_competencies rc ON r.id = rc.resource_id AND rc.competency_code = p_required_competency
    WHERE r.actif = TRUE
    AND rc.level >= p_competency_level
    ORDER BY score ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_candidate_score IS 'Calcule le score de candidature d''une ressource pour une tâche';
COMMENT ON FUNCTION get_task_candidates IS 'Propose les meilleurs candidats pour une tâche donnée';

-- Trigger pour s'assurer qu'une ressource n'a qu'un seul rôle principal
CREATE OR REPLACE FUNCTION check_unique_primary_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Si on essaie de définir is_primary = TRUE
    IF NEW.is_primary = TRUE THEN
        -- Vérifier s'il existe déjà un rôle principal pour cette ressource
        IF EXISTS (
            SELECT 1 FROM resource_roles 
            WHERE resource_id = NEW.resource_id 
            AND is_primary = TRUE 
            AND id != NEW.id
        ) THEN
            RAISE EXCEPTION 'Une ressource ne peut avoir qu''un seul rôle principal';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_unique_primary_role
    BEFORE INSERT OR UPDATE ON resource_roles
    FOR EACH ROW
    EXECUTE FUNCTION check_unique_primary_role();
