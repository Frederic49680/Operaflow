# ✅ Corrections appliquées - Migration 035

## Date : 20/10/2025

## Problème

**Erreur** :
```
ERROR: 42703: column a.date_debut_prevue does not exist
LINE 276:   a.date_debut_prevue,
```

## Solution

Suppression des colonnes `date_debut_prevue` et `date_fin_prevue` car elles n'existent pas dans la table `affaires`.

## Fichier corrigé

**`supabase/migrations/035_functions_affaires_gantt.sql`** ✅

## Modifications apportées

### 1. Fonction fn_declare_planification

**Avant** :
```sql
-- Mettre à jour le statut de l'affaire à 'Validée'
UPDATE affaires 
SET statut = 'Validee',
    date_debut_prevue = p_date_debut,  -- ❌ N'existe pas
    date_fin_prevue = p_date_fin       -- ❌ N'existe pas
WHERE id = p_affaire_id;
```

**Après** :
```sql
-- Mettre à jour le statut de l'affaire à 'Validée'
UPDATE affaires 
SET statut = 'Validee'
WHERE id = p_affaire_id;
```

### 2. Vue v_affaires_planification

**Avant** :
```sql
SELECT 
  a.id,
  a.code_affaire,
  a.nom,
  a.statut,
  a.date_debut_prevue,  -- ❌ N'existe pas
  a.date_fin_prevue,    -- ❌ N'existe pas
  a.montant_total_ht,
  ...
```

**Après** :
```sql
SELECT 
  a.id,
  a.code_affaire,
  a.nom,
  a.statut,
  a.montant_total_ht,
  ...
```

## État actuel

### Migrations prêtes

| Migration | Fichier | Statut |
|-----------|---------|--------|
| 032 | `affaires_lots_financiers` | ✅ Prête |
| 033 | `affaires_statuts_simple` | ✅ Prête |
| 034 | `planning_taches_jalons` | ✅ Prête |
| 035 | `functions_affaires_gantt` | ✅ Corrigée |

### Ordre d'application

```bash
032 → 033 SIMPLE → 034 → 035
```

## Application

### Via l'éditeur SQL Supabase

1. **Ouvrir l'éditeur SQL**
   - https://supabase.com/dashboard/project/[votre-projet]/sql/new

2. **Copier le contenu**
   - Ouvrir : `supabase/migrations/035_functions_affaires_gantt.sql`
   - Copier tout le contenu (Ctrl+A, Ctrl+C)

3. **Coller et exécuter**
   - Coller dans l'éditeur
   - Cliquer sur "Run"

4. **Vérifier**
   - Vous devriez voir : "Success. No rows returned"

## Vérification après application

### 1. Vérifier les fonctions

```sql
-- Vérifier que les fonctions existent
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN (
  'fn_declare_planification',
  'fn_create_jalons_from_lots',
  'fn_check_jalon_completion',
  'fn_alert_facturation_ca'
);
```

**Résultat attendu** : 4 fonctions

### 2. Vérifier les triggers

```sql
-- Vérifier que les triggers existent
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_name = 'trg_jalon_completion_check';
```

**Résultat attendu** : 1 trigger

### 3. Vérifier les vues

```sql
-- Voir les affaires avec leurs lots et jalons
SELECT * FROM v_affaires_planification;
```

### 4. Tester la fonction de déclaration de planification

```sql
-- Tester la fonction (remplacer les UUID par des valeurs réelles)
SELECT fn_declare_planification(
  'affaire_id_ici',
  '2025-11-01',
  '2025-11-30',
  NULL
);
```

## Fonctions créées

1. **`fn_declare_planification(affaire_id, date_debut, date_fin, responsable)`**
   - Déclare la planification d'une affaire
   - Crée une tâche parapluie
   - Crée les jalons à partir des lots
   - Met à jour le statut à 'Validée'

2. **`fn_create_jalons_from_lots(affaire_id)`**
   - Crée les jalons à partir des lots financiers
   - Retourne le nombre de jalons créés

3. **`fn_check_jalon_completion(jalon_id)`**
   - Vérifie si un jalon est complété (100% + toutes les tâches terminées)
   - Retourne true ou false

4. **`fn_alert_facturation_ca(affaire_id, lot_id)`**
   - Envoie une alerte de facturation au CA
   - Retourne un message JSON

## Triggers créés

1. **`trg_jalon_completion_check`**
   - Se déclenche après mise à jour d'un jalon
   - Vérifie si le jalon est complété
   - Envoie une alerte de facturation si nécessaire

## Vues créées

1. **`v_affaires_planification`**
   - Vue des affaires avec leurs lots, jalons et tâches
   - Compte les lots, jalons, jalons terminés et tâches
   - Calcule le montant total des lots

## Documentation

- ✅ `RESUME_CORRECTIONS_035.md` : Ce fichier
- ✅ `RESUME_CORRECTIONS_034.md` : Corrections migration 034
- ✅ `MIGRATION_033_SIMPLE.md` : Instructions migration 033
- ✅ `ETAT_MIGRATIONS_AFFAIRES_GANTT.md` : État global

---

**La migration 035 est maintenant prête à être appliquée !** 🎉

