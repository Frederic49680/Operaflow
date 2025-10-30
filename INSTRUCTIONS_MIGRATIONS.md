# 📋 Instructions pour appliquer les migrations 088-091 sur Supabase local (port 3001)

## 🎯 Objectif

Appliquer les migrations de séparation des rôles app vs fonctions métier sur votre base Supabase locale.

## 🚀 Méthode manuelle (recommandée)

### Étape 1 : Ouvrir Supabase Studio

1. Ouvrez votre navigateur
2. Allez sur http://localhost:3001 (ou le port que vous utilisez pour Supabase local)
3. Connectez-vous si nécessaire

### Étape 2 : Aller dans SQL Editor

1. Dans le menu de gauche, cliquez sur **SQL Editor**
2. Cliquez sur **New query**

### Étape 3 : Appliquer les migrations dans l'ordre

Exécutez chaque fichier de migration **dans l'ordre** ci-dessous :

#### Migration 088 : `supabase/migrations/088_create_job_functions_table.sql`
```
Copiez tout le contenu du fichier 088 et exécutez
```

#### Migration 089 : `supabase/migrations/089_clarify_roles_and_job_functions.sql`
```
Copiez tout le contenu du fichier 089 et exécutez
```

#### Migration 090 : `supabase/migrations/090_fix_role_references_to_job_functions.sql`
```
Copiez tout le contenu du fichier 090 et exécutez
```

#### Migration 091 : `supabase/migrations/091_create_roles_clarification_views.sql`
```
Copiez tout le contenu du fichier 091 et exécutez
```

### Étape 4 : Vérifications

Une fois les 4 migrations appliquées, vérifiez que tout fonctionne :

```sql
-- 1. Vérifier que les tables existent
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('job_functions', 'resource_job_functions')
ORDER BY table_name;

-- 2. Vérifier les fonctions métier insérées
SELECT * FROM job_functions ORDER BY seniority_rank, code;

-- 3. Vérifier les vues
SELECT * FROM v_roles_clarification ORDER BY type, seniority_rank NULLS LAST, code;

-- 4. Vérifier les utilisateurs et leurs rôles/fonctions
SELECT * FROM v_users_roles_and_functions ORDER BY email, liaison_type;
```

## ✅ Résultat attendu

- ✅ Table `job_functions` créée avec toutes les fonctions (N1-N8, NA-NC, DIR, etc.)
- ✅ Table `resource_job_functions` créée
- ✅ Migrations des données effectuées
- ✅ Index et RLS configurés
- ✅ Vues `v_roles_clarification` et `v_users_roles_and_functions` créées
- ✅ Pas d'erreur dans les logs

## ⚠️ Notes importantes

1. Exécutez les migrations **dans l'ordre** (088 → 089 → 090 → 091)
2. Si une migration échoue, lisez le message d'erreur et corrigez
3. N'hésitez pas à consulter la documentation dans `docs/`

## 📚 Documentation

Consultez :
- `docs/ROLES_VS_JOB_FUNCTIONS.md` : Explication de la séparation
- `docs/HOW_TO_APPLY_ROLES_MIGRATIONS.md` : Guide détaillé
- `docs/SUMMARY_ROLES_CLARIFICATION.md` : Résumé global

## 🆘 Dépannage

Si vous rencontrez des erreurs :

1. **Erreur "column already exists"** : La table existe déjà, c'est normal
2. **Erreur "policy already exists"** : Les DROP POLICY IF EXISTS devraient gérer cela
3. **Erreur "foreign key constraint"** : Vérifiez que les tables référencées existent

Pour toute question, consultez les logs Supabase ou les fichiers de migration.
