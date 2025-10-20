# ✅ Migration 033 SIMPLE - Version simplifiée

## Date : 20/10/2025

## Problème

Les colonnes `created_at` et `date_debut_prevue` n'existent pas dans la table `affaires`, ce qui empêche la création des vues.

## Solution

J'ai créé une **version SIMPLE** de la migration 033 qui fait uniquement les modifications essentielles :

1. ✅ Suppression des contraintes CHECK existantes
2. ✅ Mise à jour des statuts existants
3. ✅ Création de la nouvelle contrainte CHECK
4. ✅ Définition du statut par défaut
5. ✅ Fonction et trigger pour gérer le statut
6. ⏳ Vues (seront créées dans une migration séparée)

## Fichier

**`supabase/migrations/033_update_affaires_statuts_simple.sql`** ✅

## Application

### Via l'éditeur SQL Supabase (RECOMMANDÉ)

1. **Ouvrir l'éditeur SQL**
   - https://supabase.com/dashboard/project/[votre-projet]/sql/new

2. **Copier le contenu**
   - Ouvrir : `supabase/migrations/033_update_affaires_statuts_simple.sql`
   - Copier tout le contenu (Ctrl+A, Ctrl+C)

3. **Coller et exécuter**
   - Coller dans l'éditeur
   - Cliquer sur "Run"

4. **Vérifier**
   - Vous devriez voir : "Success. No rows returned"

## Vérification après application

### 1. Vérifier les contraintes

```sql
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'affaires'::regclass
AND contype = 'c';
```

**Résultat attendu** : Une seule contrainte `affaires_statut_check`

### 2. Vérifier les statuts

```sql
SELECT DISTINCT statut FROM affaires;
```

**Résultat attendu** : Brouillon, A_planifier, Validee, Cloturee, Annulee

### 3. Tester l'insertion

```sql
INSERT INTO affaires (
  code_affaire,
  nom,
  site_id,
  responsable_id,
  client_id,
  numero_commande,
  competence_principale,
  type_contrat,
  montant_total_ht,
  statut
) VALUES (
  'TEST-2025-001',
  'Test insertion',
  (SELECT id FROM sites LIMIT 1),
  (SELECT id FROM ressources LIMIT 1),
  (SELECT id FROM clients LIMIT 1),
  'CMD-TEST-001',
  'Électricité',
  'Forfait',
  10000.00,
  'A_planifier'
);
```

**Résultat attendu** : Insertion réussie ✅

### 4. Vérifier les colonnes

```sql
-- Voir les colonnes de la table affaires
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'affaires'
ORDER BY ordinal_position;
```

## Prochaines étapes

### 1. Vérifier les colonnes de la table affaires

Exécuter le script : `supabase/check_affaires_columns.sql`

### 2. Créer les vues dans une migration séparée

Une fois que nous connaissons les colonnes réelles, nous pourrons créer les vues correctement.

## Ordre d'application des migrations

```bash
032 → 033 SIMPLE → 034 → 035 → (vues dans migration séparée)
```

## Fichiers disponibles

- ✅ `033_update_affaires_statuts_simple.sql` : Version SIMPLE (à utiliser)
- ⚠️ `033_update_affaires_statuts_final.sql` : Version avec vues (ne pas utiliser)
- ⚠️ `033_update_affaires_statuts_v2.sql` : Version avec RAISE NOTICE (ne pas utiliser)
- ⚠️ `033_update_affaires_statuts.sql` : Version originale (ne pas utiliser)

## Documentation

- ✅ `MIGRATION_033_SIMPLE.md` : Ce fichier
- ✅ `RESUME_CORRECTIONS_033.md` : Résumé des corrections
- ✅ `ETAT_MIGRATIONS_AFFAIRES_GANTT.md` : État global

---

**La migration 033 SIMPLE est maintenant prête à être appliquée !** 🎉

