-- Vérifier la structure des tables pour identifier les bonnes colonnes
-- Exécutez ce script pour voir la structure des tables

-- 1. Vérifier la structure de la table assignments
SELECT 'Structure de la table assignments:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'assignments' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Vérifier la structure de la table provisional_assignments
SELECT 'Structure de la table provisional_assignments:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'provisional_assignments' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Vérifier la structure de la table assignment_logs
SELECT 'Structure de la table assignment_logs:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'assignment_logs' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Vérifier la structure de la table substitution_rules
SELECT 'Structure de la table substitution_rules:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'substitution_rules' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Vérifier la structure de la table resource_competency_roles
SELECT 'Structure de la table resource_competency_roles:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'resource_competency_roles' 
AND table_schema = 'public'
ORDER BY ordinal_position;
