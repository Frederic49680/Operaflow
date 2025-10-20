# 📊 Guide : Import → Affichage Gantt

## Date : 20/10/2025

## Flux complet

```
1. Import CSV
   ↓
2. Insertion dans planning_taches
   ↓
3. API /api/gantt/tasks
   ↓
4. Page Gantt (app/gantt/page.tsx)
   ↓
5. GanttInteractive
   ↓
6. Frappe-Gantt (graphique visuel)
```

## Étapes détaillées

### 1. Import des données

#### Via l'interface
```
Page Gantt → Bouton "Importer" → Sélectionner CSV → Import automatique
```

#### Via SQL
```sql
INSERT INTO planning_taches (
  id,
  libelle_tache,
  affaire_id,
  site_id,
  type_tache,
  date_debut_plan,
  date_fin_plan,
  avancement_pct,
  statut
) VALUES (
  gen_random_uuid(),
  'Nouvelle tâche',
  '29f28ffc-26f0-48f6-b26b-ba1031bedbe2',
  'ccbc06a7-471e-4cf4-8e7e-46ace5920edb',
  'Exécution',
  '2025-10-15',
  '2025-10-20',
  0,
  'Non lancé'
);
```

### 2. Vérification dans la base

```sql
SELECT COUNT(*) FROM planning_taches;
-- Devrait retourner le nombre de tâches
```

### 3. Chargement automatique

Le Gantt charge automatiquement les données via l'API :

```typescript
// app/gantt/page.tsx
const loadTasks = async () => {
  const response = await fetch('/api/gantt/tasks')
  const result = await response.json()
  
  if (result.success) {
    setTasks(result.data)
    setFilteredTasks(result.data)
  }
}
```

### 4. Affichage dans le graphique

Les données sont converties pour Frappe-Gantt :

```typescript
// components/gantt/GanttInteractive.tsx
const convertToGanttTasks = (tasks: any[]) => {
  return tasks.map((task) => ({
    id: task.id,
    text: task.libelle_tache,           // ← Nom de la tâche
    start_date: task.date_debut_plan,    // ← Date de début
    duration: Math.ceil(                 // ← Durée en jours
      (new Date(task.date_fin_plan).getTime() - 
       new Date(task.date_debut_plan).getTime()) / 
      (1000 * 60 * 60 * 24)
    ),
    progress: (task.avancement_pct || 0) / 100, // ← Avancement
    type: task.statut === "Terminé" ? "milestone" : "task",
    parent: task.lot_id,
    open: true,
  }))
}
```

## Exemple concret

### Données dans la base

```sql
SELECT * FROM planning_taches WHERE libelle_tache = 'Étude technique';
```

**Résultat** :
```
id: c63a9eda-7310-4b53-a190-72757c9413a2
libelle_tache: Étude technique
date_debut_plan: 2025-10-05
date_fin_plan: 2025-10-10
avancement_pct: 100
statut: Terminé
```

### Affichage dans le Gantt

**Barre dans le graphique** :
```
┌─────────────────────────────────────┐
│ Étude technique                     │
│ 2025-10-05 → 2025-10-10 (5 jours)  │
│ ████████████████████░░ 100%         │
└─────────────────────────────────────┘
```

## Règles d'affichage

### 1. Tâches valides

Une tâche est affichée si :
- ✅ `libelle_tache` existe (non vide)
- ✅ `date_debut_plan` existe
- ✅ `date_fin_plan` existe
- ✅ Les dates sont valides (format correct)

### 2. Couleurs selon le statut

| Statut | Couleur | Type |
|--------|---------|------|
| Non lancé | Bleu clair | task |
| En cours | Orange | task |
| Terminé | Vert | milestone |
| Bloqué | Rouge | task |
| Reporté | Gris | task |

### 3. Barre de progression

- **0%** : Barre vide
- **50%** : Barre à moitié remplie
- **100%** : Barre complète (milestone si Terminé)

### 4. Durée

La durée est calculée automatiquement :
```
Durée (jours) = date_fin_plan - date_debut_plan
```

## Ajout manuel d'une tâche

### Via le formulaire

1. **Cliquer sur "Nouvelle tâche"**
2. **Remplir** :
   - Affaire : AFF-2025-001
   - Libellé : Installation panneaux
   - Début : 2025-11-01
   - Fin : 2025-11-05
   - Statut : Non lancé
3. **Cliquer sur "Créer"**
4. ✅ **La tâche apparaît immédiatement dans le Gantt**

### Code exécuté

```typescript
// components/gantt/TacheFormModal.tsx
const handleSubmit = async (e) => {
  const formData = new FormData(e.currentTarget)
  
  const tacheData = {
    libelle_tache: formData.get("libelle"),
    affaire_id: formData.get("affaire"),
    date_debut_plan: formData.get("date_debut"),
    date_fin_plan: formData.get("date_fin"),
    statut: formData.get("statut"),
    // ...
  }
  
  await supabase
    .from('planning_taches')
    .insert([tacheData])
  
  toast.success("Tâche créée avec succès")
  
  if (onSuccess) {
    onSuccess() // ← Recharge les tâches
  }
}
```

## Mise à jour automatique

### Après import
```
Import → planning_taches → Rafraîchissement auto → Gantt mis à jour
```

### Après ajout
```
Formulaire → planning_taches → onSuccess() → loadTasks() → Gantt mis à jour
```

### Après modification
```
Modification → planning_taches → Rechargement → Gantt mis à jour
```

## Vérification

### 1. Vérifier les données dans la base

```sql
-- Compter les tâches
SELECT COUNT(*) FROM planning_taches;

-- Voir les dernières tâches
SELECT * FROM planning_taches 
ORDER BY created_at DESC 
LIMIT 5;
```

### 2. Vérifier l'API

```bash
# Tester l'API
curl http://localhost:3000/api/gantt/tasks
```

### 3. Vérifier l'affichage

```
1. Aller sur http://localhost:3000/gantt
2. Vérifier que les tâches apparaissent
3. Vérifier les couleurs selon les statuts
4. Vérifier les barres de progression
```

## Résolution des problèmes

### Problème : Tâche n'apparaît pas dans le Gantt

**Causes possibles** :
1. ❌ `libelle_tache` vide ou null
2. ❌ Dates invalides
3. ❌ Dates non convertibles
4. ❌ Erreur dans la conversion

**Solution** :
```sql
-- Vérifier les tâches invalides
SELECT 
    id,
    libelle_tache,
    date_debut_plan,
    date_fin_plan,
    CASE 
        WHEN libelle_tache IS NULL OR libelle_tache = '' THEN '❌ Libellé vide'
        WHEN date_debut_plan IS NULL THEN '❌ Date début manquante'
        WHEN date_fin_plan IS NULL THEN '❌ Date fin manquante'
        ELSE '✅ OK'
    END as statut
FROM planning_taches;
```

### Problème : Tâche affichée comme "undefined"

**Cause** : `libelle_tache` est null ou vide

**Solution** :
```sql
-- Corriger les libellés vides
UPDATE planning_taches
SET libelle_tache = 'Tâche sans nom'
WHERE libelle_tache IS NULL OR libelle_tache = '';
```

### Problème : Durée incorrecte

**Cause** : Dates dans le mauvais format

**Solution** :
```sql
-- Vérifier les dates
SELECT 
    id,
    libelle_tache,
    date_debut_plan,
    date_fin_plan,
    date_fin_plan - date_debut_plan as duree_jours
FROM planning_taches
WHERE date_fin_plan < date_debut_plan;
```

## Scripts utiles

### Script de test complet
Voir : `test_import_gantt.sql`

### Script de vérification
Voir : `test_supabase_direct.js`

### Script de test API
Voir : `test_api_gantt.js`

## Exemple complet

### 1. Import CSV
```bash
# Importer le fichier exemple_import_taches.csv
Page Gantt → Importer → Sélectionner le fichier
```

### 2. Vérification SQL
```sql
SELECT COUNT(*) FROM planning_taches;
-- Devrait retourner 14 (ou plus)
```

### 3. Affichage
```
Aller sur http://localhost:3000/gantt
→ Voir les 14 tâches dans le graphique
→ Vérifier les couleurs selon les statuts
→ Vérifier les barres de progression
```

---

**Dernière mise à jour** : 20/10/2025

