# 📋 Guide d'application des migrations de séparation Rôles App vs Fonctions Métier

## 🎯 Objectif

Séparer clairement les **rôles applicatifs** (droits d'accès) des **fonctions métier** (hiérarchie).

## 📚 Documentation

- `docs/ROLES_VS_JOB_FUNCTIONS.md` : Explication complète de la séparation
- `docs/MIGRATION_ROLES_SEPARATION.md` : Résumé des migrations

## 🚀 Application des migrations

### Étape 1 : Appliquer les migrations dans Supabase

Dans Supabase, aller dans **SQL Editor** et appliquer dans l'ordre :

1. **Migration 088** : `supabase/migrations/088_create_job_functions_table.sql`
   - Crée `job_functions` et `resource_job_functions`
   - Insère les fonctions métier de base

2. **Migration 089** : `supabase/migrations/089_clarify_roles_and_job_functions.sql`
   - Migre les données de `resource_roles` vers `resource_job_functions`
   - Corrige les index et RLS

3. **Migration 090** : `supabase/migrations/090_fix_role_references_to_job_functions.sql`
   - Corrige les FK pour pointer vers `job_functions`
   - Met à jour : `assignments`, `provisional_assignments`, `substitution_rules`, `resource_roles`

4. **Migration 091** : `supabase/migrations/091_create_roles_clarification_views.sql`
   - Crée les vues `v_roles_clarification` et `v_users_roles_and_functions`

### Étape 2 : Vérifications post-migration

Exécuter ces requêtes pour vérifier que tout fonctionne :

```sql
-- 1. Vérifier la séparation des données
SELECT * FROM v_roles_clarification ORDER BY type, code;

-- 2. Vérifier les utilisateurs et leurs rôles/fonctions
SELECT * FROM v_users_roles_and_functions 
ORDER BY email, liaison_type;

-- 3. Vérifier les FK corrigées
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('assignments', 'provisional_assignments', 'substitution_rules', 'resource_roles', 'resource_job_functions')
ORDER BY tc.table_name, kcu.column_name;
```

## ✅ Résultat attendu

- ✅ `roles` contient uniquement les **rôles app** (ADMIN, PLANIFICATEUR, CA, etc.)
- ✅ `job_functions` contient uniquement les **fonctions métier** (N1-N8, NA-NC, etc.)
- ✅ Les FK pointent vers la bonne table selon le contexte
- ✅ Les vues fonctionnent correctement
- ✅ Pas d'erreur dans les logs Supabase

## ⚠️ Notes importantes

1. **Ne pas supprimer** la table `roles` existante
2. **Ne pas supprimer** la table `resource_roles` (encore utilisée temporairement)
3. Les données seront **migrées** automatiquement dans les nouvelles tables
4. Les **FK seront mises à jour** vers les bonnes tables

## 🔄 Si vous avez des questions

Consulter les fichiers :
- `docs/ROLES_VS_JOB_FUNCTIONS.md` pour comprendre la séparation
- `check_roles_current_state.sql` pour diagnostiquer l'état actuel
- Les logs Supabase pour les erreurs éventuelles

## 🆘 Rollback

Si besoin de revenir en arrière :

1. Ne pas appliquer les migrations 088-091
2. Supprimer manuellement les tables créées :
   ```sql
   DROP VIEW IF EXISTS v_roles_clarification CASCADE;
   DROP VIEW IF EXISTS v_users_roles_and_functions CASCADE;
   DROP TABLE IF EXISTS resource_job_functions CASCADE;
   DROP TABLE IF EXISTS job_functions CASCADE;
   ```
3. Les anciennes tables `roles` et `resource_roles` seront toujours là
