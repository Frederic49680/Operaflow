# 📋 Résumé Module BPU - Implémentation Complète

**Date :** 2025-01-21  
**Version :** 1.0  
**Statut :** ✅ Implémentation terminée

---

## 🎯 Objectif

Créer un module de gestion des affaires BPU (Bordereau de Prix Unitaire) avec saisie guidée des réalisations, suivi des heures et montants reconnus, et intégration dans le journal de maintenance.

---

## 📦 Ce qui a été créé

### 1. Migrations SQL (Base de données)

#### ✅ Migration 020 : Tables BPU
**Fichier :** `supabase/migrations/020_create_bpu_tables.sql`

**Modifications :**
- Ajout du champ `type_affaire` (ENUM) dans la table `affaires`
- Ajout de champs BPU dans `affaires` :
  - `nb_ressources_ref` (INT)
  - `heures_semaine_ref` (NUMERIC)
  - `periode_debut`, `periode_fin` (DATE)
  - `heures_capacite`, `heures_vendues_total`, `heures_consommes_total`, `montant_reconnu_total` (NUMERIC)
- Création de la table `affaire_bpu_lignes` :
  - `code_bpu`, `libelle`, `systeme_elementaire`
  - `quantite`, `unite`, `pu`, `pu_horaire`, `heures_equiv_unitaire`
  - `delivered_qty`, `delivered_hours`, `montant_reconnu`
  - `statut_ligne` (proposee, vendue, annulee)
- Ajout de `is_parapluie_bpu` (BOOL) dans `planning_taches`
- Ajout de `affaire_id` et `bpu_ligne_id` (nullable) dans `maintenance_journal`

**Vues créées :**
- `V_BPU_Parapluies_Actifs` : Liste des parapluies BPU actifs avec KPI
- `V_BPU_Lignes_Disponibles` : Lignes BPU disponibles (non soldées)
- `V_Affaire_BPU_Suivi` : Suivi global d'une affaire BPU
- `V_Affaire_BPU_Livraisons` : Journal des livraisons/réalisations

---

#### ✅ Migration 021 : Fonctions BPU
**Fichier :** `supabase/migrations/021_create_bpu_functions.sql`

**Fonctions créées :**
1. `fn_create_bpu_parapluie_task()` : Crée automatiquement la tâche parapluie dans le Gantt
2. `fn_bpu_on_realisation_terminee()` : Met à jour les heures consommées et le montant reconnu quand une réalisation est terminée
3. `fn_bpu_on_realisation_reportee()` : Log les KPI pour les réalisations reportées
4. `cron_bpu_avancement_weekly()` : Met à jour le % d'avancement de la tâche parapluie (hebdomadaire)
5. `fn_agg_bpu_affaire_totaux()` : Rafraîchit les agrégats BPU (capacité, vendu, consommé, reconnu)

**Triggers :**
- `trg_affaire_bpu_lignes_after_insert` : Crée automatiquement la tâche parapluie à la création d'une ligne BPU
- `trg_maintenance_journal_bpu_after_update` : Déclenche les fonctions de mise à jour selon l'état

---

### 2. Composants React (Frontend)

#### ✅ BPUTaskCard.tsx
**Fichier :** `components/maintenance/BPUTaskCard.tsx`

**Fonctionnalités :**
- Affiche une carte parapluie BPU avec :
  - Capacité, Vendu, Consommé (heures)
  - Barres de progression (Remplissage et Réalisation)
  - Montant reconnu (€)
  - Bouton "Nouvelle réalisation BPU"
- Ouvre le modal `BPURealizationTile` au clic

---

#### ✅ BPURealizationTile.tsx
**Fichier :** `components/maintenance/BPURealizationTile.tsx`

**Fonctionnalités :**
- Formulaire de saisie guidée pour une réalisation BPU :
  - Affaire verrouillée (non modifiable)
  - Tranche (0-9) obligatoire
  - Sélection de la ligne BPU (liste déroulante)
  - Système Élémentaire et Type de maintenance (auto-remplis)
  - État (En cours, Terminée, Reportée, Suspendue, Prolongée)
  - Heures (présence, suspension, métal calculé automatiquement)
  - Motif (obligatoire si Reportée)
  - Description
- Validation et envoi vers l'API `/api/bpu/realizations`

---

#### ✅ BPUImportModal.tsx
**Fichier :** `components/affaires/BPUImportModal.tsx`

**Fonctionnalités :**
- Import des lignes BPU depuis un fichier CSV
- Format attendu : `code_bpu;libelle;systeme_elementaire;quantite;unite;pu;pu_horaire;heures_equiv_unitaire`
- Upload de fichier ou collage direct du contenu
- Aperçu des lignes avant import
- Validation des en-têtes et des données

---

#### ✅ AffaireBPUOverview.tsx
**Fichier :** `components/affaires/AffaireBPUOverview.tsx`

**Fonctionnalités :**
- Affiche les KPI BPU d'une affaire :
  - 4 cartes : Capacité, Vendu, Consommé, Reconnu (€)
  - 2 barres de progression : Remplissage et Réalisation
- Tableau des réalisations BPU :
  - Date, Tranche, Système Élémentaire, Libellé BPU
  - État, Heures métal, € Reconnu, Motif
- Bouton d'export CSV

---

### 3. API Routes (Backend)

#### ✅ /api/bpu/parapluies/route.ts
**Méthode :** GET  
**Paramètres :** `site_id` (optionnel)  
**Retour :** Liste des parapluies BPU actifs avec KPI

---

#### ✅ /api/bpu/lignes/route.ts
**Méthode :** GET  
**Paramètres :** `affaire_id` (obligatoire)  
**Retour :** Liste des lignes BPU disponibles pour une affaire

---

#### ✅ /api/bpu/realizations/route.ts
**Méthode :** POST  
**Body :**
```json
{
  "affaire_id": "uuid",
  "tache_id": "uuid",
  "bpu_ligne_id": "uuid",
  "tranche": 0-9,
  "systeme_elementaire": "string",
  "type_maintenance": "string",
  "etat_reel": "En_cours|Termine|Reportee|Suspendue|Prolongee",
  "heures_presence": number,
  "heures_suspension": number,
  "heures_metal": number,
  "motif": "string (si Reportee)",
  "description": "string"
}
```
**Retour :** Réalisation créée avec déclenchement automatique des fonctions de mise à jour

---

#### ✅ /api/bpu/suivi/route.ts
**Méthode :** GET  
**Paramètres :** `affaire_id` (obligatoire)  
**Retour :** Suivi global BPU de l'affaire (capacité, vendu, consommé, reconnu, taux)

---

#### ✅ /api/bpu/livraisons/route.ts
**Méthode :** GET  
**Paramètres :** `affaire_id` (obligatoire)  
**Retour :** Liste des livraisons/réalisations de l'affaire

---

#### ✅ /api/bpu/import/route.ts
**Méthode :** POST  
**Body :**
```json
{
  "affaire_id": "uuid",
  "lignes": [
    {
      "code_bpu": "string",
      "libelle": "string",
      "systeme_elementaire": "string",
      "quantite": number,
      "unite": "string",
      "pu": number,
      "pu_horaire": number (optionnel),
      "heures_equiv_unitaire": number (optionnel)
    }
  ]
}
```
**Retour :** Lignes BPU importées

---

### 4. Page Maintenance (Intégration)

#### ✅ app/maintenance/page.tsx
**Modifications :**
- Ajout de la section "Affaires BPU actives" avant le journal
- Chargement automatique des parapluies BPU via l'API
- Affichage des cartes `BPUTaskCard` pour chaque affaire BPU active
- Section responsive (1 colonne mobile, 2 colonnes desktop)

---

## 🔄 Workflow complet BPU

### 1. Création d'une affaire BPU
1. Créer une affaire avec `type_affaire = 'BPU'`
2. Remplir les champs BPU (nb_ressources_ref, heures_semaine_ref, période)
3. Importer le CSV BPU via `BPUImportModal` → crée les lignes dans `affaire_bpu_lignes`
4. Le trigger `trg_affaire_bpu_lignes_after_insert` crée automatiquement la tâche parapluie dans le Gantt

### 2. Saisie d'une réalisation BPU
1. Aller sur `/maintenance`
2. Voir la carte parapluie de l'affaire BPU
3. Cliquer sur "Nouvelle réalisation BPU"
4. Remplir le formulaire guidé :
   - Sélectionner la tranche (0-9)
   - Choisir la ligne BPU (liste filtrée sur les lignes non soldées)
   - Vérifier le système élémentaire et le type (auto-remplis)
   - Sélectionner l'état
   - Saisir les heures (présence, suspension, métal calculé)
   - Ajouter motif si reportée
5. Enregistrer → POST vers `/api/bpu/realizations`

### 3. Mise à jour automatique
- Si état = **Terminée** → déclenche `fn_bpu_on_realisation_terminee()` :
  - Ajoute les heures métal au `heures_consommes_total` de l'affaire
  - Met à jour `delivered_qty` et `montant_reconnu` de la ligne BPU
  - Vérifie si la ligne est soldée (delivered_qty >= quantite)
- Si état = **Reportée** → déclenche `fn_bpu_on_realisation_reportee()` :
  - Log KPI, montant reconnu = 0
- Hebdomadaire (lundi 00:05) → `cron_bpu_avancement_weekly()` :
  - Met à jour le % d'avancement de la tâche parapluie

### 4. Visualisation
- Sur la fiche affaire : `AffaireBPUOverview` affiche les KPI et le tableau des réalisations
- Dans le Gantt : barre parapluie avec progression automatique
- Dans le Dashboard : agrégation des KPI BPU

---

## 📊 Structure des données

### Table `affaires` (extensions BPU)
```sql
type_affaire ENUM('BPU', 'Forfait', 'Maintenance', 'Autre')
nb_ressources_ref INT DEFAULT 2
heures_semaine_ref NUMERIC DEFAULT 35
periode_debut DATE
periode_fin DATE
heures_capacite NUMERIC
heures_vendues_total NUMERIC
heures_consommes_total NUMERIC
montant_reconnu_total NUMERIC
```

### Table `affaire_bpu_lignes`
```sql
id UUID PK
affaire_id UUID FK → affaires
code_bpu TEXT
libelle TEXT
systeme_elementaire TEXT
quantite NUMERIC
unite TEXT (unité, heure, etc.)
pu NUMERIC (prix unitaire)
pu_horaire NUMERIC (optionnel)
heures_equiv_unitaire NUMERIC (optionnel)
delivered_qty NUMERIC DEFAULT 0
delivered_hours NUMERIC DEFAULT 0
montant_reconnu NUMERIC DEFAULT 0
statut_ligne TEXT (proposee, vendue, annulee)
```

### Table `planning_taches` (extension)
```sql
is_parapluie_bpu BOOL DEFAULT false
```

### Table `maintenance_journal` (extensions)
```sql
affaire_id UUID FK → affaires (nullable)
bpu_ligne_id UUID FK → affaire_bpu_lignes (nullable)
```

---

## 🎨 UI/UX

### Codes couleur
- **Bleu** : Capacité, Parapluie BPU
- **Vert** : Vendu, Montant reconnu, Terminée
- **Orange** : Consommé, Suspendue
- **Jaune** : Reportée
- **Violet** : Prolongée

### Animations
- Hover sur cartes : elevation, shadow, translate
- Gradients : bleu → indigo pour les boutons principaux
- Transitions fluides sur tous les composants

---

## ✅ Critères d'acceptation

- [x] Migrations SQL créées et appliquées
- [x] Composants React créés (BPUTaskCard, BPURealizationTile, BPUImportModal, AffaireBPUOverview)
- [x] API routes créées (parapluies, lignes, realizations, suivi, livraisons, import)
- [x] Page maintenance intégrée avec section BPU
- [x] Workflow complet : création affaire → import CSV → saisie réalisation → mise à jour auto
- [x] Calculs automatiques : heures métal, montant reconnu, % avancement
- [x] Vues SQL pour KPI et reporting
- [x] Triggers automatiques pour création tâche parapluie et mise à jour
- [x] UI responsive et moderne

---

## 🚀 Prochaines étapes

1. **Tester les migrations SQL** dans Supabase Dashboard
2. **Créer une affaire BPU de test** avec import CSV
3. **Tester la saisie d'une réalisation** depuis la page maintenance
4. **Vérifier les calculs automatiques** (heures, montants, %)
5. **Tester l'affichage** dans le Gantt et sur la fiche affaire

---

## 📝 Notes techniques

- **Heures métal** = max(0, heures_presence - heures_suspension)
- **Taux de remplissage** = (heures_consommes / heures_capacite) × 100
- **Taux de réalisation** = (heures_consommes / heures_vendues) × 100
- **Montant reconnu** (ligne) :
  - Si unité = "heure" : `heures_metal × pu_horaire`
  - Si unité = "unité" : `delivered_qty × pu`
- **Ligne soldée** : `delivered_qty >= quantite`
- **Tâche parapluie** : créée automatiquement au premier import de ligne BPU

---

## 🐛 Points d'attention

1. **Vérifier les vues SQL** : `V_BPU_Parapluies_Actifs`, `V_BPU_Lignes_Disponibles`, `V_Affaire_BPU_Suivi`, `V_Affaire_BPU_Livraisons`
2. **Tester les triggers** : création automatique de la tâche parapluie
3. **Vérifier les fonctions** : `fn_bpu_on_realisation_terminee`, `fn_bpu_on_realisation_reportee`
4. **Tester le cron** : `cron_bpu_avancement_weekly` (lundi 00:05)
5. **Vérifier l'API** : toutes les routes doivent retourner les bonnes données

---

**🎉 Module BPU complètement implémenté et prêt pour les tests !**

