# 🎯 PLAN D'IMPLÉMENTATION - Gantt Drag & Drop

---

## 📋 OBJECTIF

Implémenter le module Gantt interactif selon le PRD `prdganttmaj.mdc` avec gestion complète des impacts inter-modules.

---

## 🗂️ PHASE 1 : FONCTIONS SQL (Supabase)

### 1.1 Fonction de validation des dépendances
```sql
-- fn_validate_dependencies()
-- Vérifie que les dépendances sont respectées
```

### 1.2 Fonction de recalcul des lots
```sql
-- fn_recalc_lot_avancement() (étendue)
-- Recalcule l'avancement, les dates et l'atterrissage des lots
```

### 1.3 Fonction de vérification de disponibilité
```sql
-- fn_check_disponibilite()
-- Vérifie les conflits avec les absences
```

### 1.4 Fonction de propagation des dates d'affaires
```sql
-- fn_propagate_recalc_affaire_dates()
-- Met à jour les dates d'affaires depuis les lots
```

### 1.5 Trigger de validation des drags
```sql
-- trigger_validate_drag_tache()
-- Bloque les déplacements invalides (remontées, claims)
```

---

## 🎨 PHASE 2 : COMPOSANTS FRONTEND

### 2.1 Composant Gantt interactif
- Utilisation de Frappe-Gantt ou D3.js
- Gestion du drag & drop
- Gestion du resize
- Gestion des dépendances visuelles

### 2.2 Composant de validation
- Alertes visuelles (conflits, absences, claims)
- Messages d'erreur contextuels
- Confirmations pour actions sensibles

### 2.3 Composant de recalcul
- Indicateur de synchronisation
- Feedback de calcul en cours
- Historique des modifications

---

## 🔧 PHASE 3 : GESTION DES IMPACTS

### 3.1 Remontée Site
- ✅ Trigger de validation des dates
- ✅ Alerte si tâche déjà commencée
- ✅ Recalcul des dates réelles

### 3.2 Affaires / Lots
- ✅ Recalcul automatique des dates de lots
- ✅ Mise à jour de l'atterrissage financier
- ✅ Propagation vers les affaires

### 3.3 Absences
- ✅ Vérification de disponibilité
- ✅ Alerte visuelle (badge orange/rouge)
- ✅ Blocage si ressource absente

### 3.4 Claims
- ✅ Vérification des claims actifs
- ✅ Blocage si claim ouvert
- ✅ Alerte avant déplacement

---

## 📊 PHASE 4 : FEATURES AVANCÉES

### 4.1 Undo/Redo
- Historique local des modifications
- Ctrl+Z / Ctrl+Y
- Limite de 50 actions

### 4.2 Auto-save
- Sauvegarde automatique toutes les 30s
- Sauvegarde après chaque drag/drop
- Indicateur de synchronisation

### 4.3 Realtime
- Synchronisation multi-utilisateurs
- Verrouillage collaboratif
- Notifications de modifications

---

## 🚀 ORDRE D'EXÉCUTION

### Étape 1 : Migrations SQL (30 min)
1. Exécuter 011_gantt_functions.sql (Table + Fonctions + Vue + Trigger)
2. Exécuter 012_gantt_triggers.sql (Triggers de validation)
3. Tester les contraintes

### Étape 2 : Composant Gantt (1h)
1. Installer Frappe-Gantt
2. Créer le composant de base
3. Implémenter drag & drop
4. Implémenter resize

### Étape 3 : Validation & Alertes (45 min)
1. Ajouter les alertes visuelles
2. Implémenter les messages d'erreur
3. Tester les contraintes

### Étape 4 : Recalcul & Sync (30 min)
1. Connecter aux fonctions SQL
2. Implémenter le recalcul automatique
3. Ajouter l'auto-save

### Étape 5 : Features avancées (1h)
1. Undo/Redo
2. Realtime
3. Verrouillage collaboratif

---

## 📁 FICHIERS À CRÉER/MODIFIER

### SQL
- `supabase/migrations/011_gantt_functions.sql` (Table + Fonctions + Vue + Trigger dépendances)
- `supabase/migrations/012_gantt_triggers.sql` (Triggers de validation et synchronisation)

### Frontend
- `app/gantt/page.tsx` (modifier)
- `components/gantt/GanttInteractive.tsx` (créer)
- `components/gantt/GanttToolbar.tsx` (créer)
- `components/gantt/GanttValidation.tsx` (créer)
- `components/gantt/GanttAlert.tsx` (créer)
- `lib/gantt/validation.ts` (créer)
- `lib/gantt/recalc.ts` (créer)

---

## ✅ CRITÈRES DE VALIDATION

### Fonctionnels
- [ ] Drag & drop fonctionne
- [ ] Resize fonctionne
- [ ] Dépendances respectées
- [ ] Contraintes appliquées
- [ ] Recalcul automatique

### Techniques
- [ ] Performance < 150ms
- [ ] Auto-save fiable
- [ ] Realtime fonctionne
- [ ] Undo/Redo opérationnel

### Métier
- [ ] Remontées cohérentes
- [ ] Atterrissage à jour
- [ ] Absences détectées
- [ ] Claims protégés

---

## 🎉 RÉSULTAT ATTENDU

Un Gantt interactif, performant et cohérent avec tous les modules existants, permettant :
- Déplacement fluide des tâches
- Resize intuitif
- Validation automatique des contraintes
- Recalcul en temps réel
- Synchronisation multi-utilisateurs

---

**Plan créé le 2025-01-18**
**Version : 1.0**
**Statut : ✅ PRÊT À IMPLÉMENTER**

