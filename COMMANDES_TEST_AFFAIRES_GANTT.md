# 🧪 Commandes de test - Affaires ↔ Gantt

## Date : 20/10/2025

## 🎯 Objectif

Ce document contient toutes les commandes nécessaires pour tester l'implémentation complète du module Affaires ↔ Gantt.

---

## 📋 Prérequis

### 1. Vérifier que le serveur est démarré

```bash
# Dans le terminal, vérifier que le serveur Next.js est en cours d'exécution
# Port par défaut : 3000 ou 3002
```

### 2. Vérifier la connexion à Supabase

```bash
# Vérifier que les variables d'environnement sont configurées
cat .env.local
```

---

## 🗄️ Tests Backend (Supabase)

### 1. Exécuter le script de test SQL

```bash
# Se connecter à Supabase et exécuter le script
psql -h rrmvejpwbkwlmyjhnxaz.supabase.co -U postgres -d postgres -f test_affaires_gantt.sql
```

**Ou via l'interface Supabase :**
1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Aller dans "SQL Editor"
4. Copier/coller le contenu de `test_affaires_gantt.sql`
5. Cliquer sur "Run"

### 2. Vérifier les tables

```sql
-- Vérifier la table affaires_lots_financiers
SELECT * FROM affaires_lots_financiers;

-- Vérifier les colonnes ajoutées à planning_taches
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'planning_taches' 
AND column_name IN ('lot_financier_id', 'type', 'is_parapluie_bpu');
```

### 3. Vérifier les fonctions

```sql
-- Lister les fonctions créées
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE 'fn_%'
ORDER BY routine_name;
```

### 4. Vérifier les triggers

```sql
-- Lister les triggers
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_name IN ('trg_affaire_status_created', 'trg_jalon_completion_check');
```

### 5. Vérifier les vues

```sql
-- Lister les vues
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name LIKE 'v_%'
ORDER BY table_name;
```

---

## 🌐 Tests Frontend (Next.js)

### 1. Tester l'API `/api/affaires/lots`

#### GET - Récupérer les lots d'une affaire

```bash
# Remplacer {affaire_id} par un ID d'affaire existant
curl -X GET "http://localhost:3000/api/affaires/lots?affaire_id={affaire_id}"
```

#### POST - Créer un lot

```bash
curl -X POST "http://localhost:3000/api/affaires/lots" \
  -H "Content-Type: application/json" \
  -d '{
    "affaire_id": "{affaire_id}",
    "libelle": "Lot Test - Étude",
    "montant_ht": 50000,
    "mode_facturation": "a_l_avancement",
    "echeance_prevue": "2025-12-31",
    "numero_commande": "CMD-TEST-001",
    "commentaire": "Lot de test"
  }'
```

#### PUT - Mettre à jour un lot

```bash
curl -X PUT "http://localhost:3000/api/affaires/lots" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "{lot_id}",
    "libelle": "Lot Test - Étude (modifié)",
    "montant_ht": 60000
  }'
```

#### DELETE - Supprimer un lot

```bash
# Remplacer {lot_id} par un ID de lot existant
curl -X DELETE "http://localhost:3000/api/affaires/lots?id={lot_id}"
```

### 2. Tester l'API `/api/affaires/a-planifier`

```bash
curl -X GET "http://localhost:3000/api/affaires/a-planifier"
```

### 3. Tester l'API `/api/affaires/declare-planification`

```bash
curl -X POST "http://localhost:3000/api/affaires/declare-planification" \
  -H "Content-Type: application/json" \
  -d '{
    "affaire_id": "{affaire_id}",
    "date_debut": "2025-11-01",
    "date_fin": "2025-12-31"
  }'
```

---

## 🖥️ Tests Interface Utilisateur

### 1. Tester la création d'un lot

1. Ouvrir http://localhost:3000/affaires
2. Cliquer sur une affaire
3. Aller dans l'onglet "Lots financiers"
4. Cliquer sur "Ajouter un lot"
5. Remplir le formulaire :
   - Libellé : "Lot Test - Étude"
   - Montant HT : 50000
   - Mode de facturation : À l'avancement
   - Échéance prévue : 2025-12-31
   - N° commande : CMD-TEST-001
6. Cliquer sur "Créer"
7. ✅ Vérifier que le lot apparaît dans la liste

### 2. Tester la modification d'un lot

1. Dans la liste des lots, cliquer sur l'icône "Modifier"
2. Modifier le montant à 60000
3. Cliquer sur "Modifier"
4. ✅ Vérifier que le lot est mis à jour

### 3. Tester la suppression d'un lot

1. Dans la liste des lots, cliquer sur l'icône "Supprimer"
2. Confirmer la suppression
3. ✅ Vérifier que le lot est supprimé

### 4. Tester la déclaration de planification

1. Ouvrir http://localhost:3000/gantt
2. Cliquer sur l'onglet "En attente"
3. Vérifier qu'une affaire avec des lots apparaît
4. Cliquer sur "Déclarer la planification"
5. Remplir :
   - Date début : 2025-11-01
   - Date fin : 2025-12-31
6. Cliquer sur "Déclarer la planification"
7. ✅ Vérifier que :
   - L'affaire disparaît de "En attente"
   - Une tâche parapluie est créée dans le Gantt
   - Des jalons sont créés (1 par lot)
   - Le statut de l'affaire passe à "Validée"

### 5. Tester l'affichage des jalons

1. Aller sur http://localhost:3000/gantt
2. Cliquer sur l'onglet "Vue Gantt"
3. ✅ Vérifier que :
   - La tâche parapluie est visible
   - Les jalons sont visibles sous la tâche parapluie
   - Les jalons ont le bon libellé

### 6. Tester l'alerte de facturation

1. Dans le Gantt, cliquer sur un jalon
2. Mettre l'avancement à 100%
3. Sauvegarder
4. ✅ Vérifier qu'une alerte de facturation apparaît

---

## 🔍 Vérifications de console

### 1. Ouvrir la console du navigateur

```javascript
// Dans la console du navigateur (F12), vérifier les logs

// Vérifier que les affaires en attente sont chargées
console.log('Affaires en attente:', affairesAPlanifier);

// Vérifier que les lots sont chargés
console.log('Lots:', lots);

// Vérifier que les jalons sont chargés
console.log('Jalons:', jalons);
```

---

## 📊 Vérifications de base de données

### 1. Vérifier les affaires en attente

```sql
SELECT 
    id,
    code_affaire,
    nom,
    statut
FROM affaires
WHERE statut = 'A_planifier';
```

### 2. Vérifier les lots d'une affaire

```sql
SELECT 
    id,
    libelle,
    montant_ht,
    mode_facturation,
    echeance_prevue,
    numero_commande
FROM affaires_lots_financiers
WHERE affaire_id = '{affaire_id}';
```

### 3. Vérifier les jalons créés

```sql
SELECT 
    t.id,
    t.libelle_tache,
    t.type,
    t.lot_financier_id,
    l.libelle as lot_libelle,
    l.montant_ht as lot_montant,
    t.date_debut_plan,
    t.date_fin_plan,
    t.avancement_pct,
    t.statut
FROM planning_taches t
LEFT JOIN affaires_lots_financiers l ON t.lot_financier_id = l.id
WHERE t.type = 'jalon'
ORDER BY t.date_fin_plan;
```

### 4. Vérifier les tâches parapluie

```sql
SELECT 
    id,
    libelle_tache,
    type,
    is_parapluie_bpu,
    date_debut_plan,
    date_fin_plan,
    avancement_pct,
    statut
FROM planning_taches
WHERE is_parapluie_bpu = true;
```

---

## 🐛 Dépannage

### Problème : Les affaires en attente ne s'affichent pas

```sql
-- Vérifier que des affaires ont le statut 'A_planifier'
SELECT COUNT(*) FROM affaires WHERE statut = 'A_planifier';

-- Si 0, créer une affaire de test
INSERT INTO affaires (code_affaire, nom, site_id, responsable_id, client_id, statut)
VALUES ('TEST-001', 'Affaire de test', '{site_id}', '{responsable_id}', '{client_id}', 'A_planifier');
```

### Problème : Les lots ne s'affichent pas

```sql
-- Vérifier que des lots existent pour une affaire
SELECT COUNT(*) FROM affaires_lots_financiers WHERE affaire_id = '{affaire_id}';

-- Si 0, créer un lot de test
INSERT INTO affaires_lots_financiers (affaire_id, libelle, montant_ht, mode_facturation, echeance_prevue)
VALUES ('{affaire_id}', 'Lot Test', 50000, 'a_l_avancement', '2025-12-31');
```

### Problème : Les jalons ne sont pas créés

```sql
-- Vérifier que la fonction fn_create_jalons_from_lots existe
SELECT routine_name FROM information_schema.routines WHERE routine_name = 'fn_create_jalons_from_lots';

-- Si elle n'existe pas, exécuter la migration 035
```

### Problème : Erreur 500 sur les API

```bash
# Vérifier les logs du serveur Next.js
# Dans le terminal où le serveur est lancé, chercher les erreurs

# Vérifier que les variables d'environnement sont correctes
cat .env.local
```

---

## ✅ Checklist finale

- [ ] Toutes les tables existent
- [ ] Toutes les fonctions existent
- [ ] Tous les triggers existent
- [ ] Toutes les vues existent
- [ ] L'API `/api/affaires/lots` fonctionne (GET, POST, PUT, DELETE)
- [ ] L'API `/api/affaires/a-planifier` fonctionne (GET)
- [ ] L'API `/api/affaires/declare-planification` fonctionne (POST)
- [ ] La création d'un lot fonctionne
- [ ] La modification d'un lot fonctionne
- [ ] La suppression d'un lot fonctionne
- [ ] La déclaration de planification fonctionne
- [ ] Les jalons sont créés correctement
- [ ] L'alerte de facturation s'affiche

---

## 📚 Documentation

- `CHECK_FONCTIONNALITES_AFFAIRES_GANTT.md` : Checklist détaillée
- `RESUME_FINAL_AFFAIRES_GANTT.md` : Résumé complet
- `test_affaires_gantt.sql` : Script de test SQL

---

**Bon test ! 🚀**

