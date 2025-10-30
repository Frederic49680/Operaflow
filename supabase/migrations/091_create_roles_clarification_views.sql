-- Vue de synthèse pour vérifier la séparation roles vs job_functions

-- Vue : Séparation des rôles app vs fonctions métier
CREATE OR REPLACE VIEW v_roles_clarification AS
SELECT 
    'ROLES APP' as type,
    'roles' as table_name,
    r.id::text as id,
    r.code,
    r.label,
    r.system,
    NULL::int as seniority_rank,
    NULL::text as category,
    (SELECT COUNT(*) FROM user_roles ur WHERE ur.role_id = r.id) as utilisateurs_lies,
    (SELECT COUNT(*) FROM role_permissions rp WHERE rp.role_id = r.id) as permissions_liees
FROM roles r

UNION ALL

SELECT 
    'FONCTIONS MÉTIER' as type,
    'job_functions' as table_name,
    jf.code::text as id,
    jf.code,
    jf.label,
    jf.is_special as system,
    jf.seniority_rank,
    jf.category,
    (SELECT COUNT(*) FROM resource_job_functions rjf WHERE rjf.job_function_code = jf.code) as utilisateurs_lies,
    NULL::bigint as permissions_liees
FROM job_functions jf

ORDER BY type, seniority_rank NULLS LAST, code;

-- Vue : Utilisateurs et leurs rôles/fonctions
CREATE OR REPLACE VIEW v_users_roles_and_functions AS
-- Rôles app des utilisateurs
SELECT 
    au.id as user_id,
    au.email,
    au.prenom,
    au.nom,
    'ROLE APP' as liaison_type,
    r.code,
    r.label,
    'roles' as source_table
FROM app_users au
JOIN user_roles ur ON au.id = ur.user_id
JOIN roles r ON ur.role_id = r.id

UNION ALL

-- Fonctions métier des ressources
SELECT 
    re.id as user_id,
    CONCAT(re.prenom, ' ', re.nom) as email,
    re.prenom,
    re.nom,
    'FONCTION MÉTIER' as liaison_type,
    jf.code,
    jf.label,
    'job_functions' as source_table
FROM ressources re
JOIN resource_job_functions rjf ON re.id = rjf.resource_id
JOIN job_functions jf ON rjf.job_function_code = jf.code
WHERE rjf.is_primary = true

ORDER BY user_id, liaison_type;

COMMENT ON VIEW v_roles_clarification IS 'Vue de synthèse pour vérifier la séparation entre rôles app et fonctions métier';
COMMENT ON VIEW v_users_roles_and_functions IS 'Vue combinée des rôles app et fonctions métier par utilisateur';
