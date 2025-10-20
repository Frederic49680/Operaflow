# ✅ Migration 033 FINAL - Prête à appliquer

## Date : 20/10/2025

## Problème résolu

L'erreur de syntaxe `RAISE NOTICE` a été corrigée. La version FINAL ne contient plus de `RAISE NOTICE` en dehors des blocs `DO $$ ... $$`.

## Fichier

**`supabase/migrations/033_update_affaires_statuts_final.sql`** ✅

## Contenu

1. ✅ Suppression de TOUTES les contraintes CHECK sur `affaires`
2. ✅ Mise à jour des statuts existants (mapping)
3. ✅ Création de la nouvelle contrainte CHECK
4. ✅ Définition du statut par défaut
5. ✅ Fonction et trigger pour gérer le statut
6. ✅ Vues pour les affaires en attente et validées

## Application

### Via l'éditeur SQL Supabase (RECOMMANDÉ)

1. **Ouvrir l'éditeur SQL**
   - https://supabase.com/dashboard/project/[votre-projet]/sql/new

2. **Copier le contenu**
   - Ouvrir : `supabase/migrations/033_update_affaires_statuts_final.sql`
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

### 4. Vérifier les vues

```sql
-- Voir les affaires en attente
SELECT * FROM v_affaires_a_planifier;

-- Voir les affaires validées
SELECT * FROM v_affaires_validees;
```

## Ordre d'application des migrations

```bash
032 → 033 FINAL → 034 → 035
```

## Fichiers disponibles

- ✅ `033_update_affaires_statuts_final.sql` : Version FINAL (à utiliser)
- ⚠️ `033_update_affaires_statuts_v2.sql` : Version avec RAISE NOTICE (ne pas utiliser)
- ⚠️ `033_update_affaires_statuts.sql` : Version originale (ne pas utiliser)

---

**La migration 033 FINAL est maintenant prête à être appliquée !** 🎉

