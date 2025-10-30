-- Migration 047: Création des tables de gestion des utilisateurs (version 2)
-- Création des tables de base sans contraintes de clé étrangère

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

-- Table des rôles applicatifs (droits d'accès dans l'application)
-- ATTENTION: Cette table est pour les RÔLES APP (ADMIN, PLANIFICATEUR, etc.)
-- Pour les fonctions métier (N1-N8, NA-NC), utiliser la table job_functions
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

-- Table de liaison rôles-permissions (sans contrainte FK pour l'instant)
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID,
    permission_id UUID,
    UNIQUE(role_id, permission_id)
);

-- Table de liaison utilisateurs-rôles (sans contrainte FK pour l'instant)
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    role_id UUID,
    UNIQUE(user_id, role_id)
);

-- Table des règles d'accès par page (sans contrainte FK pour l'instant)
CREATE TABLE IF NOT EXISTS page_access_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route TEXT NOT NULL,
    role_id UUID,
    access TEXT CHECK (access IN ('none', 'read', 'write')),
    UNIQUE(route, role_id)
);

-- Table des flags de composants (sans contrainte FK pour l'instant)
CREATE TABLE IF NOT EXISTS component_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component_key TEXT NOT NULL,
    role_id UUID,
    enabled BOOLEAN DEFAULT true,
    UNIQUE(component_key, role_id)
);

-- Table des tokens utilisateur (sans contrainte FK pour l'instant)
CREATE TABLE IF NOT EXISTS user_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    type TEXT CHECK (type IN ('activation', 'reset')),
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ
);

-- Table d'audit (sans contrainte FK pour l'instant)
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id UUID,
    meta JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);
CREATE INDEX IF NOT EXISTS idx_app_users_active ON app_users(active);
CREATE INDEX IF NOT EXISTS idx_roles_code ON roles(code);
CREATE INDEX IF NOT EXISTS idx_permissions_code ON permissions(code);

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
