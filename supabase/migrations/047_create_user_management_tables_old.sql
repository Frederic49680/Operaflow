-- Migration 047: Création des tables de gestion des utilisateurs
-- Basé sur le PRD1.mdc

-- Table des utilisateurs de l'application
CREATE TABLE IF NOT EXISTS app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    prenom TEXT NOT NULL,
    nom TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    force_pwd_change BOOLEAN DEFAULT true,
    twofa_enabled BOOLEAN DEFAULT false,
    sites_scope UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des rôles
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    system BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des permissions
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL
);

-- Table de liaison rôles-permissions
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE(role_id, permission_id)
);

-- Table de liaison utilisateurs-rôles
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE(user_id, role_id)
);

-- Table des règles d'accès par page
CREATE TABLE IF NOT EXISTS page_access_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route TEXT NOT NULL,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    access TEXT CHECK (access IN ('none', 'read', 'write')),
    UNIQUE(route, role_id)
);

-- Table des flags de composants
CREATE TABLE IF NOT EXISTS component_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component_key TEXT NOT NULL,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT true,
    UNIQUE(component_key, role_id)
);

-- Table des tokens utilisateur (activation/reset)
CREATE TABLE IF NOT EXISTS user_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('activation', 'reset')),
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ
);

-- Table d'audit
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES app_users(id),
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id UUID,
    meta JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajouter le champ titulaire_id aux tâches planning (si la table existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'planning_taches') THEN
        ALTER TABLE planning_taches ADD COLUMN IF NOT EXISTS titulaire_id UUID REFERENCES app_users(id);
    END IF;
END $$;

-- Ajouter le champ titulaire_id aux remontées site (si la table existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'remontee_site') THEN
        ALTER TABLE remontee_site ADD COLUMN IF NOT EXISTS titulaire_id UUID REFERENCES app_users(id);
    END IF;
END $$;

-- Ajouter le champ titulaire_id au journal maintenance (si la table existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'maintenance_journal') THEN
        ALTER TABLE maintenance_journal ADD COLUMN IF NOT EXISTS titulaire_id UUID REFERENCES app_users(id);
    END IF;
END $$;

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);
CREATE INDEX IF NOT EXISTS idx_app_users_active ON app_users(active);
CREATE INDEX IF NOT EXISTS idx_roles_code ON roles(code);
CREATE INDEX IF NOT EXISTS idx_permissions_code ON permissions(code);

-- Index conditionnels pour les titulaires
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'planning_taches') THEN
        CREATE INDEX IF NOT EXISTS idx_planning_taches_titulaire ON planning_taches(titulaire_id);
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'remontee_site') THEN
        CREATE INDEX IF NOT EXISTS idx_remontee_site_titulaire ON remontee_site(titulaire_id);
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'maintenance_journal') THEN
        CREATE INDEX IF NOT EXISTS idx_maintenance_journal_titulaire ON maintenance_journal(titulaire_id);
    END IF;
END $$;

-- RLS (Row Level Security)
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_access_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Politiques RLS permissives pour le développement
CREATE POLICY "Enable all access for app_users" ON app_users FOR ALL USING (true);
CREATE POLICY "Enable all access for roles" ON roles FOR ALL USING (true);
CREATE POLICY "Enable all access for permissions" ON permissions FOR ALL USING (true);
CREATE POLICY "Enable all access for role_permissions" ON role_permissions FOR ALL USING (true);
CREATE POLICY "Enable all access for user_roles" ON user_roles FOR ALL USING (true);
CREATE POLICY "Enable all access for page_access_rules" ON page_access_rules FOR ALL USING (true);
CREATE POLICY "Enable all access for component_flags" ON component_flags FOR ALL USING (true);
CREATE POLICY "Enable all access for user_tokens" ON user_tokens FOR ALL USING (true);
CREATE POLICY "Enable all access for audit_log" ON audit_log FOR ALL USING (true);
