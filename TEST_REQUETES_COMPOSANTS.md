# 🧪 TEST DES REQUÊTES - Vérification Composants

Date: 2025-01-20
Objectif: Vérifier que toutes les requêtes envoient vers les bonnes tables et colonnes

---

## 📋 RÉSUMÉ

| Composant | Requêtes testées | Statut |
|-----------|------------------|--------|
| CollaborateursTable | 1 | ⏳ À tester |
| AbsencesTable | 1 | ⏳ À tester |
| ClaimsTable | 1 | ⏳ À tester |
| MaintenanceTable | 1 | ⏳ À tester |
| FormsTable | 1 | ⏳ À tester |
| InterlocuteursTable | 1 | ⏳ À tester |
| RemonteesTable | 1 | ⏳ À tester |
| GanttTable | 1 | ⏳ À tester |
| SitesTable | 1 | ⏳ À tester |
| **TOTAL** | **9** | **⏳ À tester** |

---

## 1️⃣ CollaborateursTable.tsx

### Requête utilisée:
```typescript
const { data, error } = await supabase
  .from('ressources')
  .select(`
    *,
    site_id:sites (
      code_site,
      nom
    )
  `)
  .order('nom')
```

### ✅ Vérification:
- [x] Table `ressources` existe (migration 002)
- [x] Colonne `site_id` existe dans `ressources`
- [x] Table `sites` existe (migration 001)
- [x] Colonnes `code_site` et `nom` existent dans `sites`
- [x] Relation `site_id → sites(id)` est définie

### 🧪 Test à effectuer:
```sql
-- Test de la requête
SELECT 
  r.*,
  s.code_site,
  s.nom
FROM ressources r
LEFT JOIN sites s ON r.site_id = s.id
ORDER BY r.nom;
```

---

## 2️⃣ AbsencesTable.tsx

### Requête utilisée:
```typescript
const { data, error } = await supabase
  .from('absences')
  .select(`
    *,
    ressource_id:ressources (
      nom,
      prenom
    )
  `)
  .order('date_debut', { ascending: false })
```

### ✅ Vérification:
- [x] Table `absences` existe (migration 003)
- [x] Colonne `ressource_id` existe dans `absences`
- [x] Table `ressources` existe (migration 002)
- [x] Colonnes `nom` et `prenom` existent dans `ressources`
- [x] Relation `ressource_id → ressources(id)` est définie

### 🧪 Test à effectuer:
```sql
-- Test de la requête
SELECT 
  a.*,
  r.nom,
  r.prenom
FROM absences a
LEFT JOIN ressources r ON a.ressource_id = r.id
ORDER BY a.date_debut DESC;
```

---

## 3️⃣ ClaimsTable.tsx

### Requête utilisée:
```typescript
const { data, error } = await supabase
  .from('claims')
  .select(`
    *,
    affaire_id:affaires (
      code_affaire,
      client_id:clients (
        nom_client
      )
    )
  `)
  .order('date_detection', { ascending: false })
```

### ✅ Vérification:
- [x] Table `claims` existe (migration 008)
- [x] Colonne `affaire_id` existe dans `claims`
- [x] Table `affaires` existe (migration 004)
- [x] Colonne `code_affaire` existe dans `affaires`
- [x] Colonne `client_id` existe dans `affaires`
- [x] Table `clients` existe (migration 004)
- [x] Colonne `nom_client` existe dans `clients`
- [x] Relations définies: `affaire_id → affaires(id)`, `client_id → clients(id)`

### 🧪 Test à effectuer:
```sql
-- Test de la requête
SELECT 
  c.*,
  a.code_affaire,
  cl.nom_client
FROM claims c
LEFT JOIN affaires a ON c.affaire_id = a.id
LEFT JOIN clients cl ON a.client_id = cl.id
ORDER BY c.date_detection DESC;
```

---

## 4️⃣ MaintenanceTable.tsx

### Requête utilisée:
```typescript
const { data, error } = await supabase
  .from('maintenance_journal')
  .select('*')
  .order('date_jour', { ascending: false })
```

### ✅ Vérification:
- [x] Table `maintenance_journal` existe (migration 006)
- [x] Toutes les colonnes existent

### 🧪 Test à effectuer:
```sql
-- Test de la requête
SELECT *
FROM maintenance_journal
ORDER BY date_jour DESC;
```

---

## 5️⃣ FormsTable.tsx

### Requête utilisée:
```typescript
const { data, error } = await supabase
  .from('forms')
  .select('*')
  .order('created_at', { ascending: false })
```

### ✅ Vérification:
- [x] Table `forms` existe (migration 010)
- [x] Toutes les colonnes existent

### 🧪 Test à effectuer:
```sql
-- Test de la requête
SELECT *
FROM forms
ORDER BY created_at DESC;
```

---

## 6️⃣ InterlocuteursTable.tsx

### Requête utilisée:
```typescript
const { data, error } = await supabase
  .from('interlocuteurs')
  .select(`
    *,
    client_id:clients (
      nom_client
    ),
    site_id:sites (
      nom
    )
  `)
  .order('nom')
```

### ✅ Vérification:
- [x] Table `interlocuteurs` existe (migration 007)
- [x] Colonne `client_id` existe dans `interlocuteurs`
- [x] Colonne `site_id` existe dans `interlocuteurs`
- [x] Table `clients` existe (migration 004)
- [x] Colonne `nom_client` existe dans `clients`
- [x] Table `sites` existe (migration 001)
- [x] Colonne `nom` existe dans `sites`
- [x] Relations définies: `client_id → clients(id)`, `site_id → sites(id)`

### 🧪 Test à effectuer:
```sql
-- Test de la requête
SELECT 
  i.*,
  c.nom_client,
  s.nom
FROM interlocuteurs i
LEFT JOIN clients c ON i.client_id = c.id
LEFT JOIN sites s ON i.site_id = s.id
ORDER BY i.nom;
```

---

## 7️⃣ RemonteesTable.tsx

### Requête utilisée:
```typescript
const { data, error } = await supabase
  .from('remontee_site')
  .select(`
    *,
    tache_id:planning_taches (
      libelle_tache
    ),
    affaire_id:affaires (
      code_affaire
    ),
    site_id:sites (
      nom
    )
  `)
  .order('date_saisie', { ascending: false })
```

### ✅ Vérification:
- [x] Table `remontee_site` existe (migration 006)
- [x] Colonne `tache_id` existe dans `remontee_site`
- [x] Colonne `affaire_id` existe dans `remontee_site`
- [x] Colonne `site_id` existe dans `remontee_site`
- [x] Table `planning_taches` existe (migration 005)
- [x] Colonne `libelle_tache` existe dans `planning_taches`
- [x] Table `affaires` existe (migration 004)
- [x] Colonne `code_affaire` existe dans `affaires`
- [x] Table `sites` existe (migration 001)
- [x] Colonne `nom` existe dans `sites`
- [x] Relations définies: `tache_id → planning_taches(id)`, `affaire_id → affaires(id)`, `site_id → sites(id)`

### 🧪 Test à effectuer:
```sql
-- Test de la requête
SELECT 
  rs.*,
  pt.libelle_tache,
  a.code_affaire,
  s.nom
FROM remontee_site rs
LEFT JOIN planning_taches pt ON rs.tache_id = pt.id
LEFT JOIN affaires a ON rs.affaire_id = a.id
LEFT JOIN sites s ON rs.site_id = s.id
ORDER BY rs.date_saisie DESC;
```

---

## 8️⃣ GanttTable.tsx

### Requête utilisée:
```typescript
const { data, error } = await supabase
  .from('planning_taches')
  .select(`
    *,
    affaire_id:affaires (
      code_affaire
    ),
    lot_id:affaires_lots (
      libelle_lot
    ),
    site_id:sites (
      nom
    )
  `)
  .order('date_debut_plan')
```

### ✅ Vérification:
- [x] Table `planning_taches` existe (migration 005)
- [x] Colonne `affaire_id` existe dans `planning_taches`
- [x] Colonne `lot_id` existe dans `planning_taches`
- [x] Colonne `site_id` existe dans `planning_taches`
- [x] Table `affaires` existe (migration 004)
- [x] Colonne `code_affaire` existe dans `affaires`
- [x] Table `affaires_lots` existe (migration 004)
- [x] Colonne `libelle_lot` existe dans `affaires_lots`
- [x] Table `sites` existe (migration 001)
- [x] Colonne `nom` existe dans `sites`
- [x] Relations définies: `affaire_id → affaires(id)`, `lot_id → affaires_lots(id)`, `site_id → sites(id)`

### 🧪 Test à effectuer:
```sql
-- Test de la requête
SELECT 
  pt.*,
  a.code_affaire,
  al.libelle_lot,
  s.nom
FROM planning_taches pt
LEFT JOIN affaires a ON pt.affaire_id = a.id
LEFT JOIN affaires_lots al ON pt.lot_id = al.id
LEFT JOIN sites s ON pt.site_id = s.id
ORDER BY pt.date_debut_plan;
```

---

## 9️⃣ SitesTable.tsx

### Requête utilisée:
```typescript
const { data, error } = await supabase
  .from('sites')
  .select(`
    id,
    code_site,
    nom,
    statut,
    responsable_id:ressources (
      nom,
      prenom
    )
  `)
  .order('nom')
```

### ✅ Vérification:
- [x] Table `sites` existe (migration 001)
- [x] Colonnes `id`, `code_site`, `nom`, `statut` existent dans `sites`
- [x] Colonne `responsable_id` existe dans `sites`
- [x] Table `ressources` existe (migration 002)
- [x] Colonnes `nom` et `prenom` existent dans `ressources`
- [x] Relation `responsable_id → ressources(id)` est définie

### 🧪 Test à effectuer:
```sql
-- Test de la requête
SELECT 
  s.id,
  s.code_site,
  s.nom,
  s.statut,
  r.nom,
  r.prenom
FROM sites s
LEFT JOIN ressources r ON s.responsable_id = r.id
ORDER BY s.nom;
```

---

## 🔧 SCRIPT DE TEST SQL COMPLET

Voici un script SQL que vous pouvez exécuter dans Supabase pour tester toutes les requêtes :

```sql
-- ============================================
-- SCRIPT DE TEST COMPLET DES REQUÊTES
-- ============================================

-- Test 1: CollaborateursTable
SELECT 'Test 1: CollaborateursTable' as test_name;
SELECT 
  r.*,
  s.code_site,
  s.nom as site_nom
FROM ressources r
LEFT JOIN sites s ON r.site_id = s.id
ORDER BY r.nom
LIMIT 5;

-- Test 2: AbsencesTable
SELECT 'Test 2: AbsencesTable' as test_name;
SELECT 
  a.*,
  r.nom as ressource_nom,
  r.prenom as ressource_prenom
FROM absences a
LEFT JOIN ressources r ON a.ressource_id = r.id
ORDER BY a.date_debut DESC
LIMIT 5;

-- Test 3: ClaimsTable
SELECT 'Test 3: ClaimsTable' as test_name;
SELECT 
  c.*,
  a.code_affaire,
  cl.nom_client
FROM claims c
LEFT JOIN affaires a ON c.affaire_id = a.id
LEFT JOIN clients cl ON a.client_id = cl.id
ORDER BY c.date_detection DESC
LIMIT 5;

-- Test 4: MaintenanceTable
SELECT 'Test 4: MaintenanceTable' as test_name;
SELECT *
FROM maintenance_journal
ORDER BY date_jour DESC
LIMIT 5;

-- Test 5: FormsTable
SELECT 'Test 5: FormsTable' as test_name;
SELECT *
FROM forms
ORDER BY created_at DESC
LIMIT 5;

-- Test 6: InterlocuteursTable
SELECT 'Test 6: InterlocuteursTable' as test_name;
SELECT 
  i.*,
  c.nom_client,
  s.nom as site_nom
FROM interlocuteurs i
LEFT JOIN clients c ON i.client_id = c.id
LEFT JOIN sites s ON i.site_id = s.id
ORDER BY i.nom
LIMIT 5;

-- Test 7: RemonteesTable
SELECT 'Test 7: RemonteesTable' as test_name;
SELECT 
  rs.*,
  pt.libelle_tache,
  a.code_affaire,
  s.nom as site_nom
FROM remontee_site rs
LEFT JOIN planning_taches pt ON rs.tache_id = pt.id
LEFT JOIN affaires a ON rs.affaire_id = a.id
LEFT JOIN sites s ON rs.site_id = s.id
ORDER BY rs.date_saisie DESC
LIMIT 5;

-- Test 8: GanttTable
SELECT 'Test 8: GanttTable' as test_name;
SELECT 
  pt.*,
  a.code_affaire,
  al.libelle_lot,
  s.nom as site_nom
FROM planning_taches pt
LEFT JOIN affaires a ON pt.affaire_id = a.id
LEFT JOIN affaires_lots al ON pt.lot_id = al.id
LEFT JOIN sites s ON pt.site_id = s.id
ORDER BY pt.date_debut_plan
LIMIT 5;

-- Test 9: SitesTable
SELECT 'Test 9: SitesTable' as test_name;
SELECT 
  s.id,
  s.code_site,
  s.nom,
  s.statut,
  r.nom as responsable_nom,
  r.prenom as responsable_prenom
FROM sites s
LEFT JOIN ressources r ON s.responsable_id = r.id
ORDER BY s.nom
LIMIT 5;
```

---

## 📝 RÉSULTATS ATTENDUS

### Si tout est correct:
- ✅ Chaque requête doit s'exécuter sans erreur
- ✅ Les résultats doivent être cohérents
- ✅ Les relations doivent être correctement jointes

### Si une erreur survient:
- ❌ Vérifier que la table existe
- ❌ Vérifier que les colonnes existent
- ❌ Vérifier que les relations (FK) sont définies
- ❌ Vérifier la syntaxe Supabase pour les joins

---

## 🎯 COMMENT TESTER

### Option 1: Via Supabase Dashboard
1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Aller dans "SQL Editor"
4. Copier-coller le script de test complet
5. Exécuter et vérifier les résultats

### Option 2: Via l'application
1. Ouvrir chaque page de l'application
2. Vérifier que les données se chargent correctement
3. Vérifier la console du navigateur (F12) pour les erreurs

### Option 3: Via API directe
1. Utiliser Postman ou un outil similaire
2. Tester chaque endpoint API
3. Vérifier les réponses

---

## ✅ CHECKLIST DE VÉRIFICATION

- [ ] Tester CollaborateursTable
- [ ] Tester AbsencesTable
- [ ] Tester ClaimsTable
- [ ] Tester MaintenanceTable
- [ ] Tester FormsTable
- [ ] Tester InterlocuteursTable
- [ ] Tester RemonteesTable
- [ ] Tester GanttTable
- [ ] Tester SitesTable
- [ ] Vérifier les logs d'erreur dans la console
- [ ] Vérifier les données affichées dans l'UI

---

**Document généré le**: 2025-01-20
**Statut**: 🧪 Prêt pour les tests

