# ✅ Corrections appliquées - Migration 034

## Date : 20/10/2025

## Problème

**Erreur** :
```
ERROR: 42703: column t.created_at does not exist
LINE 98:   t.created_at,
```

## Solution

Suppression des colonnes `created_at` et `updated_at` des vues car elles n'existent pas dans la table `planning_taches`.

## Fichier corrigé

**`supabase/migrations/034_update_planning_taches_jalons.sql`** ✅

## Modifications apportées

### Vue v_planning_jalons

**Avant** :
```sql
SELECT 
  t.id,
  ...
  t.requiert_reception,
  t.created_at,      -- ❌ N'existe pas
  t.updated_at       -- ❌ N'existe pas
FROM planning_taches t
```

**Après** :
```sql
SELECT 
  t.id,
  ...
  t.requiert_reception
FROM planning_taches t
```

### Vue v_planning_taches_operatives

**Avant** :
```sql
SELECT 
  t.id,
  ...
  t.is_parapluie_bpu,
  t.created_at,      -- ❌ N'existe pas
  t.updated_at       -- ❌ N'existe pas
FROM planning_taches t
```

**Après** :
```sql
SELECT 
  t.id,
  ...
  t.is_parapluie_bpu
FROM planning_taches t
```

## État actuel

### Migrations prêtes

| Migration | Fichier | Statut |
|-----------|---------|--------|
| 032 | `affaires_lots_financiers` | ✅ Prête |
| 033 | `affaires_statuts_simple` | ✅ Prête |
| 034 | `planning_taches_jalons` | ✅ Corrigée |
| 035 | `functions_affaires_gantt` | ✅ Prête |

### Ordre d'application

```bash
032 → 033 SIMPLE → 034 → 035
```

## Application

### Via l'éditeur SQL Supabase

1. **Ouvrir l'éditeur SQL**
   - https://supabase.com/dashboard/project/[votre-projet]/sql/new

2. **Copier le contenu**
   - Ouvrir : `supabase/migrations/034_update_planning_taches_jalons.sql`
   - Copier tout le contenu (Ctrl+A, Ctrl+C)

3. **Coller et exécuter**
   - Coller dans l'éditeur
   - Cliquer sur "Run"

4. **Vérifier**
   - Vous devriez voir : "Success. No rows returned"

## Vérification après application

### 1. Vérifier les nouvelles colonnes

```sql
-- Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'planning_taches' 
AND column_name IN ('lot_financier_id', 'type', 'is_parapluie_bpu', 'requiert_reception', 'montant');
```

**Résultat attendu** : 5 colonnes

### 2. Vérifier les index

```sql
-- Vérifier que les index ont été créés
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'planning_taches' 
AND indexname LIKE '%lot_financier%' OR indexname LIKE '%type%';
```

### 3. Vérifier les vues

```sql
-- Voir les jalons
SELECT * FROM v_planning_jalons;

-- Voir les tâches opératives
SELECT * FROM v_planning_taches_operatives;
```

### 4. Vérifier la mise à jour des tâches existantes

```sql
-- Vérifier que toutes les tâches ont type = 'tache'
SELECT type, COUNT(*) 
FROM planning_taches 
GROUP BY type;
```

**Résultat attendu** : Toutes les tâches doivent avoir `type = 'tache'`

## Documentation

- ✅ `RESUME_CORRECTIONS_034.md` : Ce fichier
- ✅ `MIGRATION_033_SIMPLE.md` : Instructions migration 033
- ✅ `ETAT_MIGRATIONS_AFFAIRES_GANTT.md` : État global

---

**La migration 034 est maintenant prête à être appliquée !** 🎉

