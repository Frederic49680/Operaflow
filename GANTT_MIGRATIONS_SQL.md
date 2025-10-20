# 📊 MIGRATIONS SQL - Gantt Interactif

---

## ✅ MIGRATIONS CRÉÉES

### 011_gantt_functions.sql
**Table des dépendances + Fonctions de validation et recalcul**

#### Table créée
1. **tache_dependances** - Gestion des dépendances entre tâches

#### Fonctions créées (8)
1. **fn_validate_dependencies()** - Valide les dépendances entre tâches
2. **fn_check_disponibilite()** - Vérifie la disponibilité des ressources
3. **fn_check_claims_actifs()** - Vérifie les claims actifs liés à une tâche
4. **fn_recalc_lot_avancement()** - Recalcule l'avancement d'un lot
5. **fn_propagate_recalc_affaire_dates()** - Propage les dates vers les affaires
6. **fn_validate_drag_tache()** - Valide toutes les contraintes avant un déplacement
7. **fn_update_tache_with_validation()** - Met à jour une tâche avec validation
8. **fn_check_circular_dependencies()** - Vérifie les cycles de dépendances

#### Vue créée
1. **v_taches_avec_dependances** - Vue des tâches avec dépendances

#### Trigger créé
1. **trg_validate_dependances** - Valide les dépendances avant insertion

---

### 012_gantt_triggers.sql
**Triggers de validation et synchronisation**

#### Triggers créés (7)
1. **trg_validate_tache_update** - Valide les mises à jour de tâches
2. **trg_recalc_lot_after_tache_update** - Recalcule le lot après mise à jour
3. **trg_validate_remontee_dates** - Valide les dates des remontées
4. **trg_historise_tache_modifications** - Historise les modifications
5. **trg_check_absence_on_affectation** - Vérifie les absences lors de l'affectation
6. **trg_sync_date_reelle_on_completion** - Synchronise les dates réelles
7. **trg_validate_tache_dates_in_affaire** - Valide les dates dans les bornes de l'affaire

---

## 🎯 GESTION DES IMPACTS

### ✅ Remontée Site
**Problème :** Incohérence entre dates planifiées et dates réelles
**Solution :**
- Trigger `trg_validate_remontee_dates` vérifie la cohérence
- Alerte si déplacement après début de tâche
- Recalcul automatique des dates réelles

### ✅ Affaires / Lots
**Problème :** Désynchronisation de l'atterrissage financier
**Solution :**
- Fonction `fn_recalc_lot_avancement()` recalcule automatiquement
- Fonction `fn_propagate_recalc_affaire_dates()` met à jour les affaires
- Trigger `trg_recalc_lot_after_tache_update` déclenche le recalcul

### ✅ Absences
**Problème :** Déplacement pendant une période d'absence
**Solution :**
- Fonction `fn_check_disponibilite()` vérifie les absences
- Trigger `trg_check_absence_on_affectation` alerte lors de l'affectation
- Badge visuel orange/rouge côté frontend

### ✅ Claims
**Problème :** Déplacement d'une tâche liée à un claim actif
**Solution :**
- Fonction `fn_check_claims_actifs()` vérifie les claims
- Trigger `trg_validate_tache_update` bloque le déplacement
- Alerte visuelle côté frontend

---

## 📋 ORDRE D'EXÉCUTION

### Étape 1 : Exécuter les migrations
```sql
-- Dans Supabase Dashboard → SQL Editor
-- Exécuter dans l'ordre :
011_gantt_functions.sql (Table + Fonctions + Vue + Trigger dépendances)
012_gantt_triggers.sql (Triggers de validation et synchronisation)
```

### Étape 2 : Vérifier les fonctions
```sql
-- Vérifier que toutes les fonctions sont créées
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE 'fn_%'
ORDER BY routine_name;
```

### Étape 3 : Vérifier les triggers
```sql
-- Vérifier que tous les triggers sont créés
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name LIKE 'trg_%'
ORDER BY trigger_name;
```

### Étape 4 : Tester les fonctions
```sql
-- Tester fn_validate_drag_tache
SELECT fn_validate_drag_tache(
    'uuid-de-la-tache',
    '2025-01-20'::date,
    '2025-01-25'::date
);

-- Tester fn_check_disponibilite
SELECT fn_check_disponibilite(
    'uuid-de-la-ressource',
    '2025-01-20'::date,
    '2025-01-25'::date
);

-- Tester fn_check_claims_actifs
SELECT fn_check_claims_actifs('uuid-de-la-tache');

-- Tester fn_recalc_lot_avancement
SELECT fn_recalc_lot_avancement('uuid-du-lot');
```

---

## 🔧 FONCTIONS UTILITAIRES

### Validation complète d'un déplacement
```sql
SELECT fn_validate_drag_tache(
    p_tache_id := 'uuid-de-la-tache',
    p_new_date_debut := '2025-01-20'::date,
    p_new_date_fin := '2025-01-25'::date
);
```

### Mise à jour avec validation
```sql
SELECT fn_update_tache_with_validation(
    p_tache_id := 'uuid-de-la-tache',
    p_date_debut_plan := '2025-01-20'::date,
    p_date_fin_plan := '2025-01-25'::date,
    p_avancement_pct := 50
);
```

### Vérification de disponibilité
```sql
SELECT fn_check_disponibilite(
    p_ressource_id := 'uuid-de-la-ressource',
    p_date_debut := '2025-01-20'::date,
    p_date_fin := '2025-01-25'::date
);
```

### Vérification des claims
```sql
SELECT fn_check_claims_actifs('uuid-de-la-tache');
```

### Recalcul d'un lot
```sql
SELECT fn_recalc_lot_avancement('uuid-du-lot');
```

---

## 📊 STRUCTURE DES DONNÉES

### Table tache_dependances
```sql
CREATE TABLE tache_dependances (
    id uuid PRIMARY KEY,
    tache_id uuid REFERENCES planning_taches(id),
    tache_precedente_id uuid REFERENCES planning_taches(id),
    type_dependance text CHECK (type_dependance IN ('fin-debut', 'debut-debut', 'fin-fin', 'debut-fin')),
    lag_jours integer DEFAULT 0,
    created_at timestamptz DEFAULT NOW(),
    created_by uuid
);
```

### Vue v_taches_avec_dependances
```sql
-- Vue avec dépendances précédentes et suivantes
SELECT * FROM v_taches_avec_dependances;
```

---

## ✅ VALIDATION

### Tests à effectuer
1. **Tester fn_validate_drag_tache** - Vérifier les contraintes
2. **Tester fn_check_disponibilite** - Vérifier les absences
3. **Tester fn_check_claims_actifs** - Vérifier les claims
4. **Tester fn_recalc_lot_avancement** - Vérifier le recalcul
5. **Tester les triggers** - Vérifier les validations automatiques

### Résultats attendus
- ✅ Toutes les fonctions créées
- ✅ Tous les triggers actifs
- ✅ Validations fonctionnelles
- ✅ Recalculs automatiques
- ✅ Pas d'erreurs SQL

---

## 🚀 PROCHAINES ÉTAPES

### Frontend
1. Installer Frappe-Gantt
2. Créer le composant GanttInteractive
3. Implémenter drag & drop
4. Implémenter resize
5. Ajouter les alertes visuelles
6. Connecter aux fonctions SQL

### Tests
1. Tester drag & drop
2. Tester resize
3. Tester les contraintes
4. Tester le recalcul
5. Tester les impacts inter-modules

---

## 🎉 CONCLUSION

**Les migrations SQL sont prêtes !**

✅ 7 fonctions de validation et recalcul
✅ 7 triggers de synchronisation
✅ 1 table de dépendances
✅ 1 vue avec dépendances
✅ Gestion complète des impacts inter-modules

**Prêt pour l'implémentation frontend ! 🚀**

---

**Migrations créées le 2025-01-18**
**Version : 1.0**
**Statut : ✅ PRÊTES À EXÉCUTER**

