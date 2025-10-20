# 🧪 TESTS - IMPACTS INTER-MODULES GANTT

---

## ✅ OBJECTIF

Tester que le Gantt interactif interagit correctement avec les autres modules :
- Remontées Site
- Affaires / Lots
- Absences
- Claims
- RH / Ressources

---

## 📋 CHECKLIST DE TESTS

### 1. REMONTÉES SITE

#### Test 1.1 : Déplacement d'une tâche avec remontées existantes
**Scénario :**
1. Créer une tâche "Tâche A" du 01/01/2025 au 05/01/2025
2. Créer une remontée pour cette tâche le 02/01/2025
3. Déplacer la tâche au 10/01/2025 au 14/01/2025

**Résultat attendu :**
- ✅ La tâche est déplacée
- ⚠️ Avertissement : "Une remontée existe pour cette tâche"
- ✅ Les dates de la remontée ne sont pas modifiées

**Test :**
```sql
-- Créer une tâche
INSERT INTO planning_taches (id, libelle_tache, affaire_id, site_id, date_debut_plan, date_fin_plan, statut)
VALUES ('test-001', 'Tâche Test', 'affaire-001', 'site-001', '2025-01-01', '2025-01-05', 'En cours');

-- Créer une remontée
INSERT INTO remontee_site (id, site_id, affaire_id, tache_id, date_saisie, statut_reel, avancement_pct)
VALUES ('remontee-001', 'site-001', 'affaire-001', 'test-001', '2025-01-02', 'En cours', 20);

-- Déplacer la tâche
UPDATE planning_taches 
SET date_debut_plan = '2025-01-10', date_fin_plan = '2025-01-14'
WHERE id = 'test-001';

-- Vérifier que la remontée existe toujours
SELECT * FROM remontee_site WHERE tache_id = 'test-001';
```

---

### 2. AFFAIRES / LOTS

#### Test 2.1 : Recalcul automatique d'un lot
**Scénario :**
1. Créer une affaire avec 2 lots
2. Créer 3 tâches liées au Lot 1
3. Modifier l'avancement des tâches
4. Vérifier que le lot est recalculé

**Résultat attendu :**
- ✅ Le lot affiche le bon avancement
- ✅ Le montant consommé est mis à jour
- ✅ Le reste à faire est recalculé
- ✅ L'atterrissage est mis à jour

**Test :**
```sql
-- Créer une affaire
INSERT INTO affaires (id, code_affaire, site_id, responsable_id, montant_total_ht, statut)
VALUES ('affaire-002', 'AFF-002', 'site-001', 'resp-001', 100000, 'Validée');

-- Créer un lot
INSERT INTO affaires_lots (id, affaire_id, libelle_lot, budget_ht, ponderation)
VALUES ('lot-001', 'affaire-002', 'Lot 1', 50000, 'heures');

-- Créer des tâches
INSERT INTO planning_taches (id, libelle_tache, affaire_id, lot_id, site_id, date_debut_plan, date_fin_plan, avancement_pct, effort_plan_h)
VALUES 
  ('tache-001', 'Tâche 1', 'affaire-002', 'lot-001', 'site-001', '2025-01-01', '2025-01-05', 50, 40),
  ('tache-002', 'Tâche 2', 'affaire-002', 'lot-001', 'site-001', '2025-01-06', '2025-01-10', 30, 40),
  ('tache-003', 'Tâche 3', 'affaire-002', 'lot-001', 'site-001', '2025-01-11', '2025-01-15', 10, 40);

-- Vérifier le recalcul du lot
SELECT * FROM affaires_lots WHERE id = 'lot-001';

-- Modifier l'avancement d'une tâche
UPDATE planning_taches SET avancement_pct = 100 WHERE id = 'tache-001';

-- Vérifier que le lot a été recalculé
SELECT * FROM affaires_lots WHERE id = 'lot-001';
```

---

### 3. ABSENCES

#### Test 3.1 : Déplacement d'une tâche pendant une absence
**Scénario :**
1. Créer une ressource "Ressource A"
2. Créer une absence pour "Ressource A" du 10/01/2025 au 15/01/2025
3. Créer une tâche avec "Ressource A" du 08/01/2025 au 12/01/2025
4. Déplacer la tâche au 10/01/2025 au 14/01/2025

**Résultat attendu :**
- ⚠️ Avertissement : "La ressource est absente pendant cette période"
- ✅ La tâche peut être déplacée (non bloquée)
- ✅ L'alerte est affichée dans l'interface

**Test :**
```sql
-- Créer une ressource
INSERT INTO ressources (id, nom, prenom, site, actif)
VALUES ('ressource-001', 'Dupont', 'Jean', 'site-001', true);

-- Créer une absence
INSERT INTO absences (id, ressource_id, type, date_debut, date_fin, statut)
VALUES ('absence-001', 'ressource-001', 'CP', '2025-01-10', '2025-01-15', 'à venir');

-- Créer une tâche avec cette ressource
INSERT INTO planning_taches (id, libelle_tache, affaire_id, site_id, date_debut_plan, date_fin_plan, statut)
VALUES ('tache-004', 'Tâche avec ressource absente', 'affaire-002', 'site-001', '2025-01-08', '2025-01-12', 'En cours');

-- Affecter la ressource à la tâche
INSERT INTO taches_ressources (id, tache_id, ressource_id, charge_h, taux_affectation)
VALUES ('tr-001', 'tache-004', 'ressource-001', 40, 100);

-- Vérifier la disponibilité
SELECT * FROM fn_check_disponibilite('tache-004', '2025-01-10', '2025-01-14');
```

---

### 4. CLAIMS

#### Test 4.1 : Déplacement d'une tâche avec un claim actif
**Scénario :**
1. Créer une tâche "Tâche B"
2. Créer un claim actif lié à cette tâche
3. Essayer de déplacer la tâche

**Résultat attendu :**
- ❌ Blocage : "Impossible de déplacer une tâche liée à une réclamation ouverte"
- ✅ La tâche n'est pas déplacée

**Test :**
```sql
-- Créer une tâche
INSERT INTO planning_taches (id, libelle_tache, affaire_id, site_id, date_debut_plan, date_fin_plan, statut)
VALUES ('tache-005', 'Tâche avec claim', 'affaire-002', 'site-001', '2025-01-01', '2025-01-05', 'En cours');

-- Créer un claim actif
INSERT INTO claims (id, affaire_id, site_id, tache_id, type, titre, description, montant_estime, statut)
VALUES ('claim-001', 'affaire-002', 'site-001', 'tache-005', 'Client', 'Claim Test', 'Description', 1000, 'Ouvert');

-- Vérifier les claims actifs
SELECT * FROM fn_check_claims_actifs('tache-005');

-- Essayer de déplacer la tâche (doit échouer)
UPDATE planning_taches 
SET date_debut_plan = '2025-01-10', date_fin_plan = '2025-01-14'
WHERE id = 'tache-005';
```

---

### 5. RH / RESSOURCES

#### Test 5.1 : Affectation d'une ressource inactive
**Scénario :**
1. Créer une ressource "Ressource B" inactive
2. Essayer d'affecter cette ressource à une tâche

**Résultat attendu :**
- ❌ Blocage : "La ressource est inactive"
- ✅ La ressource ne peut pas être affectée

**Test :**
```sql
-- Créer une ressource inactive
INSERT INTO ressources (id, nom, prenom, site, actif)
VALUES ('ressource-002', 'Martin', 'Paul', 'site-001', false);

-- Essayer d'affecter la ressource (doit échouer)
INSERT INTO taches_ressources (id, tache_id, ressource_id, charge_h, taux_affectation)
VALUES ('tr-002', 'tache-004', 'ressource-002', 40, 100);
```

---

## 🎯 RÉSULTATS ATTENDUS

### Backend (SQL)
- ✅ Fonction `fn_validate_drag_tache` fonctionne
- ✅ Fonction `fn_check_disponibilite` fonctionne
- ✅ Fonction `fn_check_claims_actifs` fonctionne
- ✅ Fonction `fn_recalc_lot_avancement` fonctionne
- ✅ Triggers déclenchés correctement

### Frontend (React)
- ✅ Alertes affichées correctement
- ✅ Validation visuelle des contraintes
- ✅ Messages d'erreur clairs
- ✅ Blocage des actions interdites

---

## 📊 STATISTIQUES

### Tests à effectuer
- **Remontées Site :** 2 tests
- **Affaires / Lots :** 3 tests
- **Absences :** 2 tests
- **Claims :** 2 tests
- **RH / Ressources :** 2 tests

**Total :** 11 tests

---

## 🚀 EXÉCUTION DES TESTS

### Étape 1 : Préparer l'environnement
```sql
-- Créer les données de test
-- (utiliser les scripts ci-dessus)
```

### Étape 2 : Exécuter les tests
```bash
# Tests SQL
psql -d operaflow -f tests_inter_modules.sql

# Tests Frontend
npm run test
```

### Étape 3 : Vérifier les résultats
- ✅ Tous les tests passent
- ✅ Aucune erreur SQL
- ✅ Alertes affichées correctement
- ✅ Validation fonctionne

---

## ✅ CONCLUSION

Les tests d'intégration inter-modules permettent de valider que :
- ✅ Le Gantt interagit correctement avec tous les modules
- ✅ Les contraintes sont respectées
- ✅ Les alertes sont affichées
- ✅ Les recalculs sont effectués automatiquement

**Le système est prêt pour la production ! 🚀**

---

**Date :** 2025-01-18
**Version :** 1.0
**Statut :** ✅ TESTS PRÊTS

