# Résumé Migrations BPU - Module Bordereau de Prix Unitaire

**Date :** 2025-01-19  
**PRD :** prdmajmaintenancebpu.mdc  
**Version :** 1.1

---

## ✅ Migrations Créées

### Migration 020 : Tables BPU
**Fichier :** `supabase/migrations/020_create_bpu_tables.sql`

#### Tables Créées

##### 1. `affaire_bpu_lignes`
Lignes du BPU avec :
- **Identification** : code_bpu, libelle, systeme_elementaire
- **Quantité & Prix** : quantite, unite, pu, pu_horaire, heures_equiv_unitaire
- **Statut** : proposee, vendue, annulee
- **Livraison** : delivered_qty, delivered_hours, montant_reconnu
- **Contraintes** : delivered_qty ≤ quantite, delivered_hours ≥ 0, montant_reconnu ≥ 0

##### 2. `affaire_bpu_calendrier`
Calendrier des semaines actives :
- **Période** : annee, semaine, date_debut, date_fin
- **Statut** : active (true/false)
- **Unicité** : (affaire_id, annee, semaine)

#### Tables Modifiées

##### 1. `affaires`
Nouvelles colonnes :
- `type_affaire` : BPU, Forfait, Maintenance, Autre
- `nb_ressources_ref` : Nombre de ressources (défaut: 2)
- `heures_semaine_ref` : Heures par semaine (défaut: 35)
- `periode_debut` / `periode_fin` : Période BPU

##### 2. `planning_taches`
Nouvelle colonne :
- `is_parapluie_bpu` : Indique si c'est une tâche parapluie BPU

##### 3. `maintenance_journal`
Nouvelles colonnes :
- `affaire_id` : Lien vers l'affaire (si réalisation BPU)
- `bpu_ligne_id` : Lien vers la ligne BPU concernée

#### Vues Créées

##### 1. `V_Affaire_BPU_Suivi`
Suivi complet des affaires BPU :
- **Capacité** : heures_capacite (ressources × heures/sem × semaines actives)
- **Vendu** : heures_vendues (somme lignes vendues)
- **Consommé** : heures_consommes (somme heures métal)
- **Reconnu** : montant_reconnu (€)
- **Écarts** : ecart_heures
- **KPI** : taux_remplissage_pct, taux_realisation_pct

##### 2. `V_Affaire_BPU_Livraisons`
Journal des réalisations BPU :
- Détails de chaque réalisation
- Informations ligne BPU (code, libelle, pu)
- Montant reconnu par réalisation
- Informations affaire et site

##### 3. `V_BPU_Lignes_Disponibles`
Lignes BPU disponibles pour réalisation :
- Lignes vendues non soldées
- Quantité disponible
- Statut disponibilité

##### 4. `V_BPU_Parapluies_Actifs`
Tâches parapluie BPU actives :
- Informations tâche
- Suivi BPU (capacité, vendu, consommé, reconnu)
- KPI

---

### Migration 021 : Fonctions BPU
**Fichier :** `supabase/migrations/021_create_bpu_functions.sql`

#### Fonctions Créées

##### 1. `fn_create_bpu_parapluie_task(p_affaire_id UUID)`
**Description :** Crée une tâche parapluie BPU dans le Gantt  
**Paramètres :** ID de l'affaire  
**Retour :** ID de la tâche créée  
**Utilisation :** Automatique lors de la validation d'une affaire BPU

##### 2. `fn_bpu_on_realisation_terminee(p_maintenance_id UUID)`
**Description :** Traite une réalisation BPU terminée  
**Actions :**
- Calcule le montant selon type BPU (heure/unitaire)
- Met à jour delivered_qty ou delivered_hours
- Met à jour montant_reconnu
- Empêche sur-livraison

##### 3. `fn_bpu_on_realisation_reportee(p_maintenance_id UUID)`
**Description :** Traite une réalisation BPU reportée  
**Actions :**
- Vérifie que le motif est renseigné
- Aucune monétisation

##### 4. `fn_calculate_bpu_avancement_weekly()`
**Description :** Calcule l'avancement hebdomadaire des parapluies  
**Formule :** %avancement = min(100, Consommé/Capacité × 100)  
**Utilisation :** Cron hebdo (Lundi 00:05)

##### 5. `fn_agg_bpu_affaire_totaux()`
**Description :** Agrégation nightly des totaux BPU  
**Utilisation :** Cron nightly (01:00)

##### 6. `fn_generate_bpu_calendrier(p_affaire_id, p_annee, p_semaines_actives)`
**Description :** Génère le calendrier BPU pour une année  
**Paramètres :**
- ID de l'affaire
- Année
- Tableau des semaines actives (ex: [1,2,3,...,45])

##### 7. `fn_import_bpu_affaire(p_affaire_id, p_lignes)`
**Description :** Importe les lignes BPU depuis un JSON  
**Paramètres :**
- ID de l'affaire
- JSONB avec les lignes (CSV parsé)

##### 8. `fn_validate_bpu_lignes(p_affaire_id)`
**Description :** Valide les lignes BPU (proposee → vendue)

##### 9. `fn_cancel_bpu_lignes(p_affaire_id, p_ligne_ids)`
**Description :** Annule les lignes BPU spécifiées

##### 10. `fn_rollback_bpu_realisation(p_maintenance_id)`
**Description :** Annule une réalisation BPU et déduit les montants

#### Triggers Créés

##### `trigger_bpu_maintenance_etat`
**Table :** maintenance_journal  
**Événement :** AFTER UPDATE  
**Condition :** Si etat_reel change  
**Actions :**
- Si passage à Terminée → appelle fn_bpu_on_realisation_terminee()
- Si passage à Reportée → appelle fn_bpu_on_realisation_reportee()

---

## 📊 Structure Complète

### Tables
1. ✅ `affaires` (modifiée)
2. ✅ `affaires_lots` (existante)
3. ✅ `planning_taches` (modifiée)
4. ✅ `maintenance_journal` (modifiée)
5. ✅ `affaire_bpu_lignes` (NOUVELLE)
6. ✅ `affaire_bpu_calendrier` (NOUVELLE)

### Vues
1. ✅ `V_Affaire_BPU_Suivi`
2. ✅ `V_Affaire_BPU_Livraisons`
3. ✅ `V_BPU_Lignes_Disponibles`
4. ✅ `V_BPU_Parapluies_Actifs`

### Fonctions
1. ✅ `fn_create_bpu_parapluie_task()`
2. ✅ `fn_bpu_on_realisation_terminee()`
3. ✅ `fn_bpu_on_realisation_reportee()`
4. ✅ `fn_calculate_bpu_avancement_weekly()`
5. ✅ `fn_agg_bpu_affaire_totaux()`
6. ✅ `fn_generate_bpu_calendrier()`
7. ✅ `fn_import_bpu_affaire()`
8. ✅ `fn_validate_bpu_lignes()`
9. ✅ `fn_cancel_bpu_lignes()`
10. ✅ `fn_rollback_bpu_realisation()`

### Triggers
1. ✅ `trigger_bpu_maintenance_etat`

---

## 🎯 Règles Métier Implémentées

### 1. Code "Vierge"
- Permet d'ajouter des activités non au BPU
- Utilise `pu_horaire` pour multiplier par `heures_metal`
- Pas de limite de quantité

### 2. Système Élémentaire Partagé
- Plusieurs lignes BPU peuvent avoir le même système élémentaire
- Différence : type de décharge (libelle)

### 3. Calendrier Flexible
- Semaines actives/inactives configurables
- Calcul de capacité ajusté automatiquement

### 4. Sur-Livraison
- Empêchée par contrainte : `delivered_qty ≤ quantite`
- Si quantite IS NULL → pas de limite

### 5. Calculs Automatiques
- **BPU horaire** : montant = heures_metal × pu_horaire
- **BPU unitaire** : montant = pu (une seule fois)
- **Équivalence heures** : via heures_equiv_unitaire

---

## 🚀 Prochaines Étapes

### 1. Appliquer les Migrations
```sql
-- Dans Supabase SQL Editor
-- Copier le contenu de 020_create_bpu_tables.sql
-- Copier le contenu de 021_create_bpu_functions.sql
```

### 2. Créer les Composants React
- BPUTaskCard.tsx
- BPURealizationTile.tsx
- AffaireBPUOverview.tsx
- BPUImportModal.tsx

### 3. Créer les API Routes
- /api/bpu/parapluies/route.ts
- /api/bpu/realizations/route.ts
- /api/bpu/lignes/route.ts

### 4. Configurer les Crons
- Lundi 00:05 : fn_calculate_bpu_avancement_weekly()
- 01:00 : fn_agg_bpu_affaire_totaux()

---

## ✅ Validation

- [x] Migration 020 créée
- [x] Migration 021 créée
- [x] Tables définies
- [x] Vues créées
- [x] Fonctions créées
- [x] Triggers créés
- [x] RLS activé
- [ ] Migrations appliquées (à faire)
- [ ] Tests SQL effectués (à faire)
- [ ] Composants React créés (à faire)
- [ ] API Routes créées (à faire)

---

**Statut :** ✅ Migrations SQL prêtes à être appliquées

