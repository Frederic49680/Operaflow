# Migration de séparation Rôles App vs Fonctions Métier

Cette suite de migrations sépare clairement les **rôles applicatifs** des **fonctions métier**.

## 📋 Résumé des migrations

### Migration 088 : Création de la table `job_functions`
- Crée la table `job_functions` pour les fonctions métier
- Crée la table `resource_job_functions` 
- Insère les fonctions de base (N1-N8, NA-NC, DIR, etc.)
- RLS et triggers

### Migration 089 : Clarification et migration des données
- Crée les tables si elles n'existent pas déjà
- Migre les données de `resource_roles` vers `resource_job_functions`
- Insère les fonctions métier de base
- RLS et triggers

### Migration 090 : Correction des FK
- Corrige les FK de `roles(code)` vers `job_functions(code)`
- Met à jour : `assignments`, `provisional_assignments`, `substitution_rules`, `resource_roles`
- Ajoute des commentaires pour clarifier

## 🔍 Vérifications post-migration

Après application des migrations, exécuter :

\`\`\`sql
-- 1. Vérifier les FK corrigées
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('assignments', 'provisional_assignments', 'substitution_rules', 'resource_roles', 'resource_job_functions')
ORDER BY tc.table_name, kcu.column_name;

-- 2. Vérifier la séparation des données
SELECT 'roles (app)' as type, code, label FROM roles 
UNION ALL
SELECT 'job_functions (métier)' as type, code, label FROM job_functions
ORDER BY type, code;
\`\`\`

## ✅ Résultat attendu

- ✅ `roles` contient uniquement les rôles app (ADMIN, PLANIFICATEUR, CA, etc.)
- ✅ `job_functions` contient uniquement les fonctions métier (N1-N8, NA-NC, etc.)
- ✅ Les FK pointent vers la bonne table selon le contexte
- ✅ Pas de conflit ni de confusion
