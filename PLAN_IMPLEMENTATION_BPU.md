# Plan d'Implémentation - Module BPU (Bordereau de Prix Unitaire)

**Date :** 2025-01-19  
**PRD :** prdmajmaintenancebpu.mdc  
**Version :** 1.1

---

## 📋 Vue d'ensemble

Ajout de la fonctionnalité BPU qui permet de :
1. Créer des affaires BPU avec lignes de prix unitaires
2. Afficher des tâches "parapluie" dans le Gantt
3. Saisir des réalisations BPU depuis Maintenance
4. Calculer automatiquement les heures consommées et € reconnus

---

## 🗂️ Fichiers à Créer/Modifier

### Phase 1 : Base de Données (Migration SQL)

#### 📄 Migration 020 : Tables BPU
**Fichier :** `supabase/migrations/020_create_bpu_tables.sql`

**Contenu :**
- ✅ Créer table `affaire_bpu_lignes`
- ✅ Ajouter colonnes à `affaires` (type_affaire, nb_ressources_ref, heures_semaine_ref, periode_debut, periode_fin)
- ✅ Ajouter colonnes à `planning_taches` (is_parapluie_bpu)
- ✅ Ajouter colonnes à `maintenance_journal` (affaire_id, bpu_ligne_id)
- ✅ Créer index
- ✅ Créer vues : `V_Affaire_BPU_Suivi`, `V_Affaire_BPU_Livraisons`

#### 📄 Migration 021 : Fonctions BPU
**Fichier :** `supabase/migrations/021_create_bpu_functions.sql`

**Contenu :**
- ✅ `fn_create_bpu_parapluie_task()` - Créer tâche parapluie
- ✅ `fn_bpu_on_realisation_terminee()` - Traiter réalisation terminée
- ✅ `fn_bpu_on_realisation_reportee()` - Traiter réalisation reportée
- ✅ `cron_bpu_avancement_weekly()` - Calcul hebdo avancement
- ✅ `fn_agg_bpu_affaire_totaux()` - Agrégation nightly
- ✅ Triggers pour automatiser les calculs

---

### Phase 2 : Composants React

#### 📄 BPUTaskCard.tsx (NOUVEAU)
**Fichier :** `components/maintenance/BPUTaskCard.tsx`

**Fonctionnalités :**
- Carte affichant l'affaire BPU
- Badges : Capacité / Vendu / Consommé
- Clic → ouvre BPURealizationTile
- Animation hover

#### 📄 BPURealizationTile.tsx (NOUVEAU)
**Fichier :** `components/maintenance/BPURealizationTile.tsx`

**Fonctionnalités :**
- Modal tuile pour saisie réalisation BPU
- Affaire verrouillée (non modifiable)
- Tranche 0-9
- Sélecteur système élémentaire depuis BPU
- Type de maintenance
- État (En cours / Reportée / Terminée / Suspendue / Prolongée)
- Heures présence/suspension/métal
- Motif si reportée
- Validation règles métier

#### 📄 AffaireBPUOverview.tsx (NOUVEAU)
**Fichier :** `components/affaires/AffaireBPUOverview.tsx`

**Fonctionnalités :**
- KPI : Capacité, Vendu(h), Consommé(h), Reconnu(€)
- Barres de progression
- Tableau réalisations BPU
- Export CSV

#### 📄 MaintenanceTable.tsx (MODIFIER)
**Fichier :** `components/maintenance/MaintenanceTable.tsx`

**Modifications :**
- Ajouter colonnes : affaire_id, bpu_ligne_id
- Afficher badge "BPU" si réalisation liée
- Filtrer par affaire BPU

#### 📄 page.tsx (MODIFIER)
**Fichier :** `app/maintenance/page.tsx`

**Modifications :**
- Ajouter section "Affaires BPU actives"
- Afficher les cartes BPU par site
- Filtrer selon site courant

---

### Phase 3 : API Routes

#### 📄 route.ts - Parapluies BPU (NOUVEAU)
**Fichier :** `app/api/bpu/parapluies/route.ts`

**Endpoints :**
- GET : Liste des parapluies BPU par site
- Retourne : id, nom, capacité, vendu, consommé

#### 📄 route.ts - Réalisations BPU (NOUVEAU)
**Fichier :** `app/api/bpu/realizations/route.ts`

**Endpoints :**
- POST : Créer réalisation BPU
- PUT : Modifier réalisation BPU
- DELETE : Supprimer réalisation BPU

#### 📄 route.ts - Lignes BPU (NOUVEAU)
**Fichier :** `app/api/bpu/lignes/route.ts`

**Endpoints :**
- GET : Liste lignes BPU vendues non soldées
- Paramètres : affaire_id
- Retourne : liste pour sélecteur

---

## 🎯 Ordre d'Implémentation

### Étape 1 : Base de Données
1. ✅ Créer migration 020 (tables)
2. ✅ Créer migration 021 (fonctions)
3. ✅ Tester les migrations
4. ✅ Vérifier les vues

### Étape 2 : API Routes
1. ✅ Créer route parapluies
2. ✅ Créer route réalisations
3. ✅ Créer route lignes
4. ✅ Tester les endpoints

### Étape 3 : Composants React
1. ✅ Créer BPUTaskCard
2. ✅ Créer BPURealizationTile
3. ✅ Modifier MaintenanceTable
4. ✅ Modifier page.tsx
5. ✅ Tester l'interface

### Étape 4 : Intégration
1. ✅ Intégrer avec Gantt
2. ✅ Tester le workflow complet
3. ✅ Ajuster si nécessaire

---

## 📊 Structure des Données

### Table affaire_bpu_lignes

```sql
CREATE TABLE affaire_bpu_lignes (
    id UUID PRIMARY KEY,
    affaire_id UUID REFERENCES affaires(id),
    code_bpu TEXT NOT NULL,
    libelle TEXT NOT NULL,
    systeme_elementaire TEXT,  -- Pour le sélecteur
    quantite NUMERIC,
    unite TEXT,  -- 'unité', 'heure', 'jour'
    pu NUMERIC,  -- Prix unitaire
    pu_horaire NUMERIC,  -- Si BPU horaire
    heures_equiv_unitaire NUMERIC,  -- Équivalence heures
    
    -- Statut
    statut_ligne TEXT CHECK (statut_ligne IN ('proposee', 'vendue', 'annulee')),
    
    -- Livraison
    delivered_qty NUMERIC DEFAULT 0,
    delivered_hours NUMERIC DEFAULT 0,
    montant_reconnu NUMERIC DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Modifications affaires

```sql
ALTER TABLE affaires ADD COLUMN type_affaire TEXT CHECK (type_affaire IN ('BPU', 'Forfait', 'Maintenance', 'Autre'));
ALTER TABLE affaires ADD COLUMN nb_ressources_ref INTEGER DEFAULT 2;
ALTER TABLE affaires ADD COLUMN heures_semaine_ref NUMERIC DEFAULT 35;
ALTER TABLE affaires ADD COLUMN periode_debut DATE;
ALTER TABLE affaires ADD COLUMN periode_fin DATE;
```

### Modifications planning_taches

```sql
ALTER TABLE planning_taches ADD COLUMN is_parapluie_bpu BOOLEAN DEFAULT false;
```

### Modifications maintenance_journal

```sql
ALTER TABLE maintenance_journal ADD COLUMN affaire_id UUID REFERENCES affaires(id);
ALTER TABLE maintenance_journal ADD COLUMN bpu_ligne_id UUID REFERENCES affaire_bpu_lignes(id);
```

---

## 🔄 Workflow Utilisateur

### 1. Création Affaire BPU
1. Chargé d'affaires crée une affaire
2. Sélectionne type = "BPU"
3. Importe CSV BPU → crée lignes dans `affaire_bpu_lignes`
4. Système crée automatiquement tâche parapluie dans Gantt

### 2. Saisie Maintenance BPU
1. Technicien ouvre /maintenance
2. Voit section "Affaires BPU actives"
3. Clique sur carte parapluie
4. Saisit réalisation :
   - Tranche 0-9
   - Système élémentaire (depuis liste BPU)
   - Type, État, Heures
5. Si Terminée → système met à jour :
   - delivered_qty
   - delivered_hours
   - montant_reconnu
6. Si Reportée → motif obligatoire, 0€

### 3. Calculs Automatiques
- Hebdo : %avancement = Consommé/Capacité
- Nightly : Agrégation totaux par affaire
- Dashboard : KPI BPU

---

## ✅ Critères d'Acceptation

- [ ] Table affaire_bpu_lignes créée
- [ ] Colonnes BPU ajoutées aux tables existantes
- [ ] Fonctions SQL créées et testées
- [ ] Vues BPU créées
- [ ] Carte BPU affichée dans Maintenance
- [ ] Tuile saisie BPU fonctionnelle
- [ ] Sélecteur système élémentaire depuis BPU
- [ ] Validation règles métier
- [ ] Calculs automatiques fonctionnels
- [ ] Intégration Gantt
- [ ] KPI affaire BPU

---

## 📝 Questions en Attente

1. **CSV BPU** : Format exact ? Colonnes ?
2. **Import CSV** : Interface existante ou à créer ?
3. **Permissions** : Qui peut créer/modifier affaires BPU ?
4. **Facturation** : Processus de facturation séparé ?
5. **Reporting** : Besoins spécifiques ?

---

**Prêt à commencer l'implémentation !** 🚀

