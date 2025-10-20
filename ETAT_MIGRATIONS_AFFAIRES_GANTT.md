# 📊 État des migrations - Affaires ↔ Gantt

## Date : 20/10/2025

## ✅ Migrations créées et corrigées

### Migration 032 : Table affaires_lots_financiers ✅

**Fichier** : `supabase/migrations/032_create_affaires_lots_financiers.sql`

**Statut** : ✅ Prête à appliquer

**Corrections appliquées** :
- ✅ Suppression de la référence à `app_users` (table n'existe pas encore)
- ✅ Désactivation temporaire du RLS (sera activé avec le module Auth)

### Migration 033 : Statuts d'affaires ✅

**Fichier** : `supabase/migrations/033_update_affaires_statuts.sql`

**Statut** : ✅ Prête à appliquer (corrigée)

**Corrections appliquées** :
- ✅ Mapping des statuts existants avant contrainte
- ✅ Suppression de TOUTES les contraintes CHECK existantes sur statut
- ✅ Gestion des accents (Validée → Validee)
- ✅ Mapping des statuts inconnus vers 'Brouillon'
- ✅ Numérotation corrigée

**Problème résolu** :
```
ERREUR: 23514: new row for relation "affaires" violates check constraint "affaires_statut_check"
```
→ **Solution** : Suppression de toutes les contraintes CHECK existantes avant de recréer la bonne

### Migration 034 : Jalons dans planning_taches ✅

**Fichier** : `supabase/migrations/034_update_planning_taches_jalons.sql`

**Statut** : ✅ Prête à appliquer

**Contenu** :
- Ajout de `lot_financier_id`
- Ajout de `type` (tache ou jalon)
- Ajout de `is_parapluie_bpu`
- Ajout de `requiert_reception`
- Ajout de `montant`
- Vues `v_planning_jalons` et `v_planning_taches_operatives`

### Migration 035 : Fonctions et triggers ✅

**Fichier** : `supabase/migrations/035_functions_affaires_gantt.sql`

**Statut** : ✅ Prête à appliquer

**Fonctions** :
- `fn_declare_planification()` : Déclare une planification
- `fn_create_jalons_from_lots()` : Crée les jalons
- `fn_check_jalon_completion()` : Vérifie la complétion
- `fn_alert_facturation_ca()` : Envoie l'alerte

**Triggers** :
- `trg_jalon_completion_check` : Vérifie la complétion après mise à jour

## 📋 Ordre d'application des migrations

```bash
1. Migration 032 : Table affaires_lots_financiers
2. Migration 033 : Statuts d'affaires
3. Migration 034 : Jalons dans planning_taches
4. Migration 035 : Fonctions et triggers
```

## 🔧 Instructions pour appliquer

### Option 1 : Via Supabase CLI

```bash
# Appliquer toutes les migrations
supabase db push

# Ou appliquer une par une
supabase migration up 032
supabase migration up 033
supabase migration up 034
supabase migration up 035
```

### Option 2 : Via l'interface Supabase

1. Aller dans l'éditeur SQL de Supabase
2. Copier/coller le contenu de chaque migration
3. Exécuter dans l'ordre : 032 → 033 → 034 → 035

### Option 3 : Via psql

```bash
psql -h <host> -U <user> -d <database> -f supabase/migrations/032_create_affaires_lots_financiers.sql
psql -h <host> -U <user> -d <database> -f supabase/migrations/033_update_affaires_statuts.sql
psql -h <host> -U <user> -d <database> -f supabase/migrations/034_update_planning_taches_jalons.sql
psql -h <host> -U <user> -d <database> -f supabase/migrations/035_functions_affaires_gantt.sql
```

## ✅ Vérification après application

### 1. Vérifier la table affaires_lots_financiers

```sql
-- Vérifier que la table existe
SELECT * FROM information_schema.tables 
WHERE table_name = 'affaires_lots_financiers';

-- Vérifier les colonnes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'affaires_lots_financiers';
```

### 2. Vérifier les statuts d'affaires

```sql
-- Voir les statuts distincts
SELECT DISTINCT statut FROM affaires;

-- Voir les affaires en attente
SELECT * FROM v_affaires_a_planifier;

-- Voir les affaires validées
SELECT * FROM v_affaires_validees;
```

### 3. Vérifier les colonnes de planning_taches

```sql
-- Vérifier les nouvelles colonnes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'planning_taches' 
AND column_name IN ('lot_financier_id', 'type', 'is_parapluie_bpu', 'requiert_reception', 'montant');
```

### 4. Vérifier les fonctions

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

### 5. Vérifier les triggers

```sql
-- Vérifier que les triggers existent
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_name IN (
  'trg_affaire_status_created',
  'trg_jalon_completion_check'
);
```

## 🎯 Prochaines étapes (Frontend)

### Phase 2 : Interface utilisateur

1. **Interface de gestion des lots financiers**
   - Composant `LotsFinanciersTable`
   - Composant `LotFormModal`
   - Modification de `app/affaires/page.tsx`

2. **Bloc "En attente" dans le Gantt**
   - Composant `GanttPendingCard`
   - Modification de `app/gantt/page.tsx`

3. **Modale de déclaration de planification**
   - Composant `DeclarePlanificationModal`
   - API route `/api/affaires/declare-planification`

4. **Alerte de facturation**
   - Composant `FacturationAlert`
   - Intégration dans la page Affaires

## 📚 Documentation

- `PLAN_IMPL_AFFAIRES_GANTT.md` : Plan d'implémentation complet
- `RESUME_MIGRATIONS_AFFAIRES_GANTT.md` : Résumé des migrations
- `ETAT_MIGRATIONS_AFFAIRES_GANTT.md` : Ce fichier

---

**État** : Phase 1 (Backend) terminée ✅  
**Prochaine étape** : Appliquer les migrations puis Phase 2 (Frontend) ⏳

