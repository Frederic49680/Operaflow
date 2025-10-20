# 📊 Résumé des migrations - Affaires ↔ Gantt

## Date : 20/10/2025

## ✅ Phase 1 : Base de données (TERMINÉE)

### Migration 032 : Table affaires_lots_financiers ✅

**Fichier** : `supabase/migrations/032_create_affaires_lots_financiers.sql`

**Contenu** :
- ✅ Création de la table `affaires_lots_financiers`
- ✅ Champs : id, affaire_id, libelle, montant_ht, mode_facturation, echeance_prevue, numero_commande, commentaire
- ✅ Index sur affaire_id et echeance_prevue
- ✅ Trigger pour updated_at
- ✅ Vue `v_affaires_lots_financiers`
- ✅ Commentaires sur les colonnes

**Corrections appliquées** :
- ❌ Suppression de la référence à `app_users` (table n'existe pas encore)
- ❌ Désactivation temporaire du RLS (sera activé avec le module Auth)

### Migration 033 : Statuts d'affaires ✅

**Fichier** : `supabase/migrations/033_update_affaires_statuts.sql`

**Contenu** :
- ✅ Ajout du statut `'A_planifier'`
- ✅ Remplacement de `'Soumise'` par `'A_planifier'`
- ✅ Normalisation des statuts (sans accents)
- ✅ Contrainte CHECK sur les statuts
- ✅ Trigger `trg_affaire_status_created` pour définir le statut par défaut
- ✅ Vue `v_affaires_a_planifier` (affaires en attente)
- ✅ Vue `v_affaires_validees` (affaires validées)

**Corrections appliquées** :
- ✅ Mapping des statuts existants avant de créer la contrainte
- ✅ Gestion des accents (Validée → Validee, Clôturée → Cloturee, etc.)
- ✅ Mapping des statuts inconnus vers 'Brouillon'

### Migration 034 : Jalons dans planning_taches ✅

**Fichier** : `supabase/migrations/034_update_planning_taches_jalons.sql`

**Contenu** :
- ✅ Ajout de `lot_financier_id` (référence vers affaires_lots_financiers)
- ✅ Ajout de `type` (tache ou jalon)
- ✅ Ajout de `is_parapluie_bpu` (booléen)
- ✅ Ajout de `requiert_reception` (booléen)
- ✅ Ajout de `montant` (pour les jalons)
- ✅ Index sur lot_financier_id et type
- ✅ Vue `v_planning_jalons` (jalons avec leurs lots)
- ✅ Vue `v_planning_taches_operatives` (tâches non-jalons)

### Migration 035 : Fonctions et triggers ✅

**Fichier** : `supabase/migrations/035_functions_affaires_gantt.sql`

**Fonctions créées** :
1. ✅ `fn_declare_planification(affaire_id, date_debut, date_fin)` : Déclare une planification
2. ✅ `fn_create_jalons_from_lots(affaire_id)` : Crée les jalons à partir des lots
3. ✅ `fn_check_jalon_completion(jalon_id)` : Vérifie si un jalon est terminé
4. ✅ `fn_alert_facturation_ca(affaire_id, lot_id)` : Envoie l'alerte de facturation

**Triggers créés** :
1. ✅ `trg_jalon_completion_check` : Vérifie la complétion des jalons après mise à jour

**Vues créées** :
1. ✅ `v_affaires_planification` : Vue des affaires avec leurs lots, jalons et tâches

## 📋 Phase 2 : Interface utilisateur (À FAIRE)

### Étape 7 : Interface de gestion des lots financiers ⏳

**Fichiers à créer** :
- `components/affaires/LotsFinanciersTable.tsx` : Tableau des lots
- `components/affaires/LotFormModal.tsx` : Formulaire d'ajout/modification
- `app/affaires/page.tsx` : Modifier pour ajouter la section lots

### Étape 8 : Bloc "En attente" dans le Gantt ⏳

**Fichiers à créer** :
- `components/gantt/GanttPendingCard.tsx` : Carte d'affaire en attente
- `app/gantt/page.tsx` : Modifier pour afficher le bloc

### Étape 9 : Modale de déclaration de planification ⏳

**Fichiers à créer** :
- `components/affaires/DeclarePlanificationModal.tsx` : Modale de déclaration
- `app/api/affaires/declare-planification/route.ts` : API route

### Étape 10 : Alerte de facturation ⏳

**Fichiers à créer** :
- `components/affaires/FacturationAlert.tsx` : Composant d'alerte
- Intégration dans la page Affaires

## 🎯 Critères d'acceptation

- [x] AFF-GNT-01 : Statut "Soumise" remplacé par "À planifier" ✅
- [ ] AFF-GNT-02 : Affaires "À planifier" affichées dans Gantt ⏳
- [ ] AFF-GNT-03 : Bouton "Déclarer planification" crée tâche + dates ⏳
- [ ] AFF-GNT-04 : Statut passe "Validée" après planif ⏳
- [ ] AFF-GNT-05 : Cas BPU → tâche parapluie auto ⏳
- [ ] AFF-GNT-06 : Chaque lot = jalon Gantt ⏳
- [ ] AFF-GNT-07 : Jalon 100% + tâches précédentes OK → Alerte CA ⏳

## 📝 Prochaines étapes

### 1. Appliquer les migrations
```bash
# Les migrations sont prêtes à être appliquées
# Vérifier l'ordre : 032 → 033 → 034 → 035
```

### 2. Tester les fonctions
```sql
-- Tester la déclaration de planification
SELECT fn_declare_planification(
  'affaire_id',
  '2025-11-01',
  '2025-11-30'
);

-- Tester la création de jalons
SELECT fn_create_jalons_from_lots('affaire_id');

-- Tester la vérification de jalon
SELECT fn_check_jalon_completion('jalon_id');
```

### 3. Créer les composants frontend
- Interface de gestion des lots
- Bloc "En attente" dans le Gantt
- Modale de déclaration
- Alerte de facturation

### 4. Créer les API routes
- `/api/affaires/lots` : CRUD lots
- `/api/affaires/declare-planification` : Déclaration
- `/api/affaires/jalons` : Gestion jalons

## 🔧 Corrections appliquées

### Migration 032
- ❌ Suppression de `REFERENCES app_users(id)` → `uuid` simple
- ❌ Désactivation du RLS (sera activé plus tard)

### Migration 033
- ✅ Mapping des statuts existants avant contrainte
- ✅ Gestion des accents (Validée → Validee)
- ✅ Mapping des statuts inconnus vers 'Brouillon'

### Migration 034
- ✅ Utilisation de `DO $$ BEGIN ... END $$` pour vérifier l'existence des colonnes
- ✅ Création de vues pour faciliter les requêtes

### Migration 035
- ✅ Fonctions complètes avec gestion d'erreurs
- ✅ Triggers pour automatisation
- ✅ Vues pour faciliter l'affichage

## 📚 Documentation

- `PLAN_IMPL_AFFAIRES_GANTT.md` : Plan d'implémentation complet
- `RESUME_MIGRATIONS_AFFAIRES_GANTT.md` : Ce fichier

---

**État** : Phase 1 (Backend) terminée ✅  
**Prochaine étape** : Phase 2 (Frontend) ⏳

