# 🔧 Application de la migration 033 (Version 2)

## Date : 20/10/2025

## Problème

L'erreur persiste :
```
ERROR: 23514: new row for relation "affaires" violates check constraint "affaires_statut_check"
```

## Solution

J'ai créé une **version 2** de la migration 033 qui :
1. ✅ Affiche un diagnostic des contraintes actuelles
2. ✅ Supprime TOUTES les contraintes CHECK avec CASCADE
3. ✅ Met à jour les statuts existants
4. ✅ Crée la nouvelle contrainte CHECK
5. ✅ Affiche une vérification finale

## Fichier

**Nouveau fichier** : `supabase/migrations/033_update_affaires_statuts_v2.sql`

## Méthode d'application

### Option 1 : Via l'éditeur SQL Supabase (RECOMMANDÉ)

1. **Aller dans l'éditeur SQL de Supabase**
   - https://supabase.com/dashboard/project/[votre-projet]/sql/new

2. **Copier le contenu du fichier**
   - Ouvrir : `supabase/migrations/033_update_affaires_statuts_v2.sql`
   - Copier tout le contenu

3. **Coller dans l'éditeur SQL**
   - Coller le contenu
   - Cliquer sur "Run"

4. **Vérifier les messages**
   - Vous devriez voir des messages `RAISE NOTICE` dans les logs
   - Notamment : "=== MIGRATION TERMINÉE AVEC SUCCÈS ==="

### Option 2 : Via le terminal (psql)

```bash
# Se connecter à Supabase
psql "postgresql://postgres:[MOT_DE_PASSE]@db.rrmvejpwbkwlmyjhnxaz.supabase.co:5432/postgres"

# Appliquer la migration
\i supabase/migrations/033_update_affaires_statuts_v2.sql
```

### Option 3 : Via Supabase CLI

```bash
# Si vous utilisez Supabase CLI
supabase db reset
```

## Vérification après application

### 1. Vérifier les contraintes

```sql
-- Voir toutes les contraintes CHECK
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'affaires'::regclass
AND contype = 'c';
```

**Résultat attendu** : Une seule contrainte nommée `affaires_statut_check`

### 2. Vérifier les statuts

```sql
-- Voir les statuts distincts
SELECT DISTINCT statut FROM affaires;

-- Voir les affaires en attente
SELECT * FROM v_affaires_a_planifier;

-- Voir les affaires validées
SELECT * FROM v_affaires_validees;
```

**Résultat attendu** : Les statuts doivent être parmi : Brouillon, A_planifier, Validee, Cloturee, Annulee

### 3. Tester l'insertion

```sql
-- Tester l'insertion d'une nouvelle affaire
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

**Résultat attendu** : L'insertion doit réussir sans erreur

## Si l'erreur persiste

### Diagnostic manuel

1. **Exécuter le script de diagnostic**
   ```sql
   \i supabase/diagnostic_constraints.sql
   ```

2. **Vérifier les contraintes manuellement**
   ```sql
   SELECT 
       conname as constraint_name,
       pg_get_constraintdef(oid) as constraint_definition
   FROM pg_constraint
   WHERE conrelid = 'affaires'::regclass
   AND contype = 'c';
   ```

3. **Supprimer toutes les contraintes manuellement**
   ```sql
   -- Remplacer [nom_constrainte] par le nom réel
   ALTER TABLE affaires DROP CONSTRAINT [nom_constrainte] CASCADE;
   ```

4. **Recréer la contrainte**
   ```sql
   ALTER TABLE affaires 
     ADD CONSTRAINT affaires_statut_check 
     CHECK (statut IN ('Brouillon', 'A_planifier', 'Validee', 'Cloturee', 'Annulee'));
   ```

## Fichiers créés

- ✅ `supabase/migrations/033_update_affaires_statuts_v2.sql` : Migration corrigée
- ✅ `supabase/diagnostic_constraints.sql` : Script de diagnostic
- ✅ `APPLIER_MIGRATION_033.md` : Ce fichier

---

**Prochaine étape** : Appliquer la migration 033 V2, puis continuer avec les migrations 034 et 035

