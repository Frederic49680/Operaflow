# 🔍 ANALYSE - Module Terrain : Vue Liste & Tuiles interactives

---

## ✅ OBJECTIF

Implémenter le module "Vue Liste & Tuiles interactives" pour le terrain selon le PRD `prbmajsuivis.mdc`.

---

## 📋 FONCTIONNALITÉS À IMPLÉMENTER

### 1. Vue Liste des affaires
- Liste des affaires planifiées / en suivi
- Colonnes : Affaire, Responsable, % avancement, Nb tâches, Statut global
- Bouton "Ouvrir" → vue tuiles
- Recherche et filtres

### 2. Vue Tuiles interactives
- Tuiles pour chaque tâche
- États : À lancer, En cours, Suspendu, Reporté, Prolongé, Terminé
- Actions rapides : Lancer, Suspendre, Reporter, Prolonger, Terminer
- Notes et commentaires
- Historique

### 3. Confirmation quotidienne
- Table `confirmation_queue`
- Cron à 06h30
- Badge "Réponse attendue"

### 4. Blocage général
- Table `site_blocages`
- Menu "Blocage général"
- Effets visuels sur Gantt

### 5. Reprise après reporté
- Fonction `fn_resume_from_report()`
- Choix d'impact : Aucun, Total, Partiel, Valeur

---

## 🔄 ANALYSE DES IMPACTS

### 1. MODULE TERRAIN (Remontées)

#### Impact : ✅ MAJEUR
**Changements :**
- ✅ Ajout de la table `site_blocages`
- ✅ Ajout de la table `confirmation_queue`
- ✅ Ajout de `responsable_execution_id` dans `planning_taches`
- ✅ Ajout de `descendu_vers_execution` dans `planning_taches`
- ✅ Ajout de `date_transfert_execution` dans `planning_taches`
- ✅ Ajout des fonctions automatiques

**Conflits potentiels :**
- ❌ Aucun conflit détecté

**Actions requises :**
- ✅ Migration SQL à créer (015_terrain_tuiles.sql)
- ⏳ Composant `AffairesListWithTiles` à créer
- ⏳ Composant `TaskTile` à créer
- ⏳ Composant `BlocageGeneralModal` à créer
- ⏳ Mise à jour de la page terrain/remontee

---

### 2. MODULE GANTT

#### Impact : ✅ POSITIF
**Changements :**
- ✅ Ajout de `responsable_execution_id` dans `planning_taches`
- ✅ Ajout de `descendu_vers_execution` dans `planning_taches`
- ✅ Ajout de `date_transfert_execution` dans `planning_taches`
- ✅ Affichage des blocages sur le Gantt (bande grisée)

**Conflits potentiels :**
- ❌ Aucun conflit détecté

**Actions requises :**
- ✅ Migration SQL à créer
- ⏳ Mise à jour du composant Gantt pour afficher les blocages

---

### 3. MODULE AFFAIRES

#### Impact : ✅ POSITIF
**Changements :**
- ✅ Passage automatique à "En suivi" lors de la première remontée (déjà implémenté)

**Conflits potentiels :**
- ❌ Aucun conflit détecté

**Actions requises :**
- ❌ Aucune action requise (déjà implémenté)

---

### 4. MODULE DASHBOARD

#### Impact : ✅ POSITIF
**Changements :**
- ✅ Ajout des métriques "Tâches prolongées" et "Suspensions actives"

**Conflits potentiels :**
- ❌ Aucun conflit détecté

**Actions requises :**
- ⏳ Mise à jour du Dashboard avec les nouvelles métriques

---

### 5. MODULE MAINTENANCE

#### Impact : ✅ POSITIF
**Changements :**
- ✅ Utilisation des mêmes états que les remontées

**Conflits potentiels :**
- ❌ Aucun conflit détecté

**Actions requises :**
- ❌ Aucune action requise (déjà implémenté)

---

## 🧩 NOUVELLES TABLES

### 1. `site_blocages`
**Colonnes :**
- `id` - UUID
- `site_id` - UUID FK
- `affaire_id` - UUID FK (nullable)
- `cause` - Text
- `start_at` - Timestamptz
- `end_at` - Timestamptz
- `scope_level` - Text ('site' / 'affaire')
- `created_by` - UUID
- `created_at` - Timestamptz

### 2. `confirmation_queue`
**Colonnes :**
- `id` - UUID
- `tache_id` - UUID FK
- `date_question` - Date
- `reponse` - Boolean (nullable)
- `date_reponse` - Timestamptz (nullable)
- `created_at` - Timestamptz

---

## 🔧 NOUVELLES FONCTIONS

### 1. `fn_auto_descente_realisation()`
- À 06h00
- Transfert des tâches du jour vers exécution
- Met à jour `descendu_vers_execution` et `date_transfert_execution`

### 2. `fn_apply_site_blocage()`
- Applique le gel aux tâches en cours / à lancer
- Crée des `tache_suspensions`
- Crée un `site_blocages` record

### 3. `fn_resume_from_report()`
- Ajuste la fin à la reprise
- Paramètres : `tache_id`, `mode`, `value`
- Modes : 'aucun', 'total', 'partiel', 'valeur'

### 4. `fn_auto_close_suspension()`
- Ferme les suspensions à la reprise
- Met à jour `suspension_end`

---

## 🎨 COMPOSANTS À CRÉER

### 1. `AffairesListWithTiles`
- Liste des affaires
- Bouton "Ouvrir" → vue tuiles
- Recherche et filtres

### 2. `TaskTile`
- Tuile pour chaque tâche
- Badge de statut
- Actions rapides
- Notes et commentaires
- Historique

### 3. `BlocageGeneralModal`
- Formulaire de déclaration de blocage
- Sélection site/affaire
- Motif et dates
- Validation

### 4. `ConfirmationQueueBadge`
- Badge "Réponse attendue"
- Bouton de confirmation

---

## 📊 STATISTIQUES

### Backend
```
Tables à créer : 2
Fonctions à créer : 4
Triggers à créer : 3
Crons à créer : 1
```

### Frontend
```
Composants à créer : 4
Pages à modifier : 1
API Routes à créer : 3
```

---

## 🚨 CONFLITS POTENTIELS

### 1. Conflit avec les statuts existants
**Risque :** Les nouveaux statuts pourraient entrer en conflit avec les statuts existants.

**Solution :** ✅ Les statuts sont déjà définis dans la migration 006.

### 2. Conflit avec les permissions
**Risque :** Les règles de visibilité par rôle pourraient entrer en conflit.

**Solution :** ✅ Les règles de visibilité sont appliquées au niveau de la vue.

### 3. Conflit avec les triggers existants
**Risque :** Les triggers existants pourraient entrer en conflit.

**Solution :** ✅ Les triggers sont créés avec `DROP TRIGGER IF EXISTS`.

---

## ✅ CONCLUSION

### Résumé des impacts
- ✅ **Aucun conflit majeur détecté**
- ✅ **Impacts positifs sur tous les modules concernés**
- ✅ **Migration SQL à créer**
- ⏳ **Composants frontend à créer**

### Prochaines étapes
1. ✅ Créer la migration SQL 015
2. ⏳ Créer les composants frontend
3. ⏳ Mettre à jour la page terrain/remontee
4. ⏳ Tester le cycle complet

---

**Date :** 2025-01-18
**Version :** 1.0
**Statut :** ✅ ANALYSE COMPLÈTE

