-- Migration 048: Données de base pour la gestion des utilisateurs
-- Basé sur le PRD1.mdc

-- Insérer les rôles par défaut
INSERT INTO roles (code, label, system) VALUES
('admin', 'Administrateur', true),
('planificateur', 'Planificateur', true),
('ca', 'Chargé d''Affaires', true),
('resp_site', 'Responsable de site', true),
('maintenance', 'Maintenance', true),
('rh', 'RH', true),
('direction', 'Direction/PMO', true)
ON CONFLICT (code) DO NOTHING;

-- Insérer les permissions
INSERT INTO permissions (code, label) VALUES
-- Permissions générales
('page.dashboard.read', 'Lire le dashboard'),
('page.dashboard.write', 'Écrire le dashboard'),
('page.affaires.read', 'Lire les affaires'),
('page.affaires.write', 'Écrire les affaires'),
('page.planning.read', 'Lire le planning'),
('page.planning.write', 'Écrire le planning'),
('page.rh.read', 'Lire le module RH'),
('page.rh.write', 'Écrire le module RH'),
('page.sites.read', 'Lire les sites'),
('page.sites.write', 'Écrire les sites'),
('page.maintenance.read', 'Lire la maintenance'),
('page.maintenance.write', 'Écrire la maintenance'),
('page.claims.read', 'Lire les claims'),
('page.claims.write', 'Écrire les claims'),
('page.terrain.read', 'Lire les remontées terrain'),
('page.terrain.write', 'Écrire les remontées terrain'),
-- Permissions admin
('admin.users.read', 'Lire les utilisateurs'),
('admin.users.write', 'Écrire les utilisateurs'),
('admin.roles.read', 'Lire les rôles'),
('admin.roles.write', 'Écrire les rôles'),
-- Permissions composants
('comp.claims.validate', 'Valider les claims'),
('comp.gantt.financeCard', 'Voir la carte finance Gantt'),
('comp.dashboard.export', 'Exporter le dashboard')
ON CONFLICT (code) DO NOTHING;

-- Assigner les permissions aux rôles
-- Admin : toutes les permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Planificateur : Gantt, adéquation, lecture RH, écriture planif
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'planificateur'
AND p.code IN (
    'page.dashboard.read',
    'page.planning.read',
    'page.planning.write',
    'page.rh.read',
    'page.sites.read',
    'page.affaires.read',
    'comp.gantt.financeCard'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Chargé d'Affaires : Affaires, lots, reporting finance, claims
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'ca'
AND p.code IN (
    'page.dashboard.read',
    'page.affaires.read',
    'page.affaires.write',
    'page.claims.read',
    'page.claims.write',
    'page.planning.read',
    'comp.claims.validate'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Responsable de site : vues site, remontées, maintenance
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'resp_site'
AND p.code IN (
    'page.dashboard.read',
    'page.sites.read',
    'page.terrain.read',
    'page.terrain.write',
    'page.maintenance.read',
    'page.maintenance.write',
    'page.planning.read'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Maintenance : journal soir, batteries
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'maintenance'
AND p.code IN (
    'page.maintenance.read',
    'page.maintenance.write',
    'page.dashboard.read'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- RH : module RH/absences, lecture planif
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'rh'
AND p.code IN (
    'page.rh.read',
    'page.rh.write',
    'page.planning.read',
    'page.dashboard.read'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Direction/PMO : dashboard global, exports
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'direction'
AND p.code IN (
    'page.dashboard.read',
    'page.dashboard.write',
    'page.affaires.read',
    'page.planning.read',
    'page.rh.read',
    'page.sites.read',
    'page.maintenance.read',
    'page.claims.read',
    'comp.dashboard.export'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Règles d'accès par page
INSERT INTO page_access_rules (route, role_id, access)
SELECT '/dashboard', r.id, 'read'
FROM roles r
WHERE r.code IN ('admin', 'planificateur', 'ca', 'resp_site', 'maintenance', 'rh', 'direction')
ON CONFLICT (route, role_id) DO NOTHING;

INSERT INTO page_access_rules (route, role_id, access)
SELECT '/affaires', r.id, 'write'
FROM roles r
WHERE r.code IN ('admin', 'ca')
ON CONFLICT (route, role_id) DO NOTHING;

INSERT INTO page_access_rules (route, role_id, access)
SELECT '/planning', r.id, 'write'
FROM roles r
WHERE r.code IN ('admin', 'planificateur')
ON CONFLICT (route, role_id) DO NOTHING;

INSERT INTO page_access_rules (route, role_id, access)
SELECT '/maintenance', r.id, 'write'
FROM roles r
WHERE r.code IN ('admin', 'resp_site', 'maintenance')
ON CONFLICT (route, role_id) DO NOTHING;

INSERT INTO page_access_rules (route, role_id, access)
SELECT '/admin/users', r.id, 'write'
FROM roles r
WHERE r.code = 'admin'
ON CONFLICT (route, role_id) DO NOTHING;
