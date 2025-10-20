# 🧭 Plan d'implémentation - Transition Affaires ↔ Gantt

## Date : 20/10/2025

## Objectif
Intégrer les fonctionnalités de transition entre les modules Affaires, Gantt et Facturation selon le PRD `prdmajaffairesgantt.mdc`.

## Étapes d'implémentation

### Phase 1 : Base de données (Backend)

#### Étape 1 : Table affaires_lots_financiers ✅
**Fichier** : `supabase/migrations/032_create_affaires_lots_financiers.sql`

**Champs** :
- `id` (uuid pk)
- `affaire_id` (uuid fk → affaires)
- `libelle` (text)
- `montant_ht` (numeric)
- `mode_facturation` (text)
- `echeance_prevue` (date)
- `numero_commande` (text)
- `commentaire` (text)
- `created_at`, `updated_at`

#### Étape 2 : Modification table affaires
**Fichier** : `supabase/migrations/033_update_affaires_statuts.sql`

**Modifications** :
- Ajouter le statut `'A_planifier'` dans les statuts possibles
- Remplacer `'Soumise'` par `'A_planifier'`

#### Étape 3 : Modification table planning_taches
**Fichier** : `supabase/migrations/034_update_planning_taches_jalons.sql`

**Ajouts** :
- `lot_financier_id` (uuid nullable fk → affaires_lots_financiers)
- `type` (text : 'tache' ou 'jalon')
- `is_parapluie_bpu` (bool)
- `requiert_reception` (bool)

#### Étape 4 : Fonctions et triggers
**Fichier** : `supabase/migrations/035_functions_affaires_gantt.sql`

**Fonctions** :
1. `fn_affaire_status_created()` : Définit le statut par défaut à 'A_planifier'
2. `fn_declare_planification(affaire_id, date_debut, date_fin)` : Déclare une planification
3. `fn_create_jalons_from_lots(affaire_id)` : Crée les jalons à partir des lots
4. `fn_check_jalon_completion(jalon_id)` : Vérifie si un jalon est terminé
5. `fn_alert_facturation_ca(affaire_id, lot_id)` : Envoie l'alerte de facturation

**Triggers** :
- `trg_affaire_status_default` : Définit le statut par défaut
- `trg_jalon_completion_check` : Vérifie la complétion des jalons

### Phase 2 : Interface utilisateur (Frontend)

#### Étape 5 : Page Affaires - Gestion des lots
**Fichier** : `app/affaires/page.tsx`

**Ajouts** :
- Section "Lots Financiers" dans le formulaire d'édition
- Composant `LotsFinanciersTable` pour lister les lots
- Composant `LotFormModal` pour ajouter/modifier un lot
- Bouton "Ajouter un lot"
- Bouton "Supprimer un lot"

#### Étape 6 : Page Gantt - Bloc "En attente"
**Fichier** : `app/gantt/page.tsx`

**Ajouts** :
- Composant `GanttPendingCard` pour afficher les affaires en attente
- Liste des affaires avec `statut = 'A_planifier'`
- Bouton "Déclarer la planification" sur chaque carte

#### Étape 7 : Modale de déclaration de planification
**Fichier** : `components/affaires/DeclarePlanificationModal.tsx`

**Champs** :
- Date début
- Date fin
- Responsable planification
- Bouton "Valider"

**Actions** :
- Appelle `fn_declare_planification()`
- Crée les tâches/jalons
- Change le statut en 'Validée'

#### Étape 8 : Affichage des jalons dans le Gantt
**Fichier** : `components/gantt/GanttInteractive.tsx`

**Modifications** :
- Détecter les tâches de type 'jalon'
- Afficher les jalons avec un style différent (diamant)
- Afficher le montant et le numéro de commande

#### Étape 9 : Alerte de facturation
**Fichier** : `components/affaires/FacturationAlert.tsx`

**Fonctionnalités** :
- Notification interne (badge, toast)
- Mail SMTP (optionnel)
- Affichage dans la page Affaires

### Phase 3 : Intégrations

#### Étape 10 : API Routes
**Fichiers** :
- `app/api/affaires/lots/route.ts` : CRUD lots financiers
- `app/api/affaires/declare-planification/route.ts` : Déclaration de planification
- `app/api/affaires/jalons/route.ts` : Gestion des jalons

#### Étape 11 : Tests et validation
- Tester l'ajout de lots financiers
- Tester la déclaration de planification
- Tester la création automatique des jalons
- Tester l'alerte de facturation

## Ordre d'exécution

### Backend (Supabase)
1. ✅ Créer la table `affaires_lots_financiers`
2. ✅ Modifier la table `affaires` (statuts)
3. ✅ Modifier la table `planning_taches` (jalons)
4. ✅ Créer les fonctions et triggers

### Frontend (Next.js)
5. ✅ Interface de gestion des lots dans Affaires
6. ✅ Bloc "En attente" dans le Gantt
7. ✅ Modale de déclaration de planification
8. ✅ Affichage des jalons dans le Gantt
9. ✅ Alerte de facturation

### Tests
10. ✅ Tests d'intégration
11. ✅ Tests de validation

## Critères d'acceptation

- [ ] AFF-GNT-01 : Statut "Soumise" remplacé par "À planifier"
- [ ] AFF-GNT-02 : Affaires "À planifier" affichées dans Gantt
- [ ] AFF-GNT-03 : Bouton "Déclarer planification" crée tâche + dates
- [ ] AFF-GNT-04 : Statut passe "Validée" après planif
- [ ] AFF-GNT-05 : Cas BPU → tâche parapluie auto
- [ ] AFF-GNT-06 : Chaque lot = jalon Gantt
- [ ] AFF-GNT-07 : Jalon 100% + tâches précédentes OK → Alerte CA

## Fichiers à créer/modifier

### Migrations SQL
- `supabase/migrations/032_create_affaires_lots_financiers.sql`
- `supabase/migrations/033_update_affaires_statuts.sql`
- `supabase/migrations/034_update_planning_taches_jalons.sql`
- `supabase/migrations/035_functions_affaires_gantt.sql`

### Composants React
- `components/affaires/LotsFinanciersTable.tsx`
- `components/affaires/LotFormModal.tsx`
- `components/affaires/DeclarePlanificationModal.tsx`
- `components/affaires/FacturationAlert.tsx`
- `components/gantt/GanttPendingCard.tsx`

### Pages
- `app/affaires/page.tsx` (modifier)
- `app/gantt/page.tsx` (modifier)

### API Routes
- `app/api/affaires/lots/route.ts`
- `app/api/affaires/declare-planification/route.ts`
- `app/api/affaires/jalons/route.ts`

---

**Dernière mise à jour** : 20/10/2025

