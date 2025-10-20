# 🔍 Debug - Problème "undefined" dans le Gantt

## Date : 20/10/2025

## Comment vérifier le problème

### 1. Ouvrir la console du navigateur
1. Aller sur http://localhost:3000/gantt
2. Ouvrir la console (F12)
3. Chercher les logs suivants

### 2. Logs à vérifier

#### A. Chargement des tâches (Page Gantt)
```
📥 Tâches chargées depuis l'API: [...]
📊 Nombre de tâches: 14
📋 Première tâche: {...}
```
**Vérifier** :
- ✅ Le nombre de tâches est correct (14)
- ✅ La première tâche a bien un `libelle_tache`

#### B. Réception dans GanttInteractive
```
📥 Tâches reçues dans GanttInteractive: [...]
📊 Nombre de tâches: 14
```
**Vérifier** :
- ✅ Le nombre de tâches est le même que chargé
- ✅ Les tâches ont bien toutes les propriétés

#### C. Conversion des tâches
```
🔄 Conversion des tâches, nombre total: 14
✅ Tâches valides après filtrage: 14
📋 Tâche convertie: { id: "...", text: "...", ... }
📋 Tâche convertie: { id: "...", text: "...", ... }
...
```
**Vérifier** :
- ✅ Le nombre de tâches valides est correct
- ✅ Chaque tâche convertie a bien un `text` (pas undefined)

#### D. Création du Gantt
```
📊 Tâches Gantt: [...]
```
**Vérifier** :
- ✅ Le tableau contient les tâches converties
- ✅ Chaque tâche a bien un `text`

### 3. Problèmes possibles

#### Problème 1 : Tâches non chargées
**Symptôme** :
```
📊 Nombre de tâches: 0
```
**Solution** : Vérifier l'API `/api/gantt/tasks`

#### Problème 2 : Tâches perdues lors du passage au composant
**Symptôme** :
```
📥 Tâches chargées depuis l'API: 14
📥 Tâches reçues dans GanttInteractive: 0
```
**Solution** : Vérifier le passage des props au composant

#### Problème 3 : Tâches filtrées lors de la conversion
**Symptôme** :
```
🔄 Conversion des tâches, nombre total: 14
✅ Tâches valides après filtrage: 0
```
**Solution** : Vérifier que les tâches ont bien :
- `date_debut_plan`
- `date_fin_plan`
- `libelle_tache`

#### Problème 4 : Tâches converties avec text undefined
**Symptôme** :
```
📋 Tâche convertie: { id: "...", text: undefined, ... }
```
**Solution** : Vérifier que `task.libelle_tache` existe dans les données

#### Problème 5 : Gantt non créé
**Symptôme** :
```
📊 Tâches Gantt: [...]  ← OK
Mais rien n'apparaît dans le Gantt
```
**Solution** : Vérifier que Frappe-Gantt est bien chargé

### 4. Vérification rapide

Ouvrir la console et exécuter :
```javascript
// Vérifier les données dans la page
console.log('Tasks:', tasks)
console.log('Filtered tasks:', filteredTasks)

// Vérifier le conteneur du Gantt
const ganttContainer = document.querySelector('.gantt-container')
console.log('Gantt container:', ganttContainer)
console.log('Gantt content:', ganttContainer?.innerHTML)
```

### 5. Test de l'API

Exécuter dans le terminal :
```bash
node test_api_gantt.js
```

**Résultat attendu** :
```
✅ Réponse API: SUCCESS
📊 Nombre de tâches: 14
✅ Aucun problème détecté
```

## Données attendues

### Structure d'une tâche
```javascript
{
  id: "uuid",
  libelle_tache: "Étude technique",  // ← Doit être présent
  affaire_id: "uuid",
  site_id: "uuid",
  code_affaire: "AFF-2025-004",
  site_nom: "Site de test générique",
  date_debut_plan: "2025-10-05",
  date_fin_plan: "2025-10-10",
  avancement_pct: 100,
  statut: "Terminé",
  // ...
}
```

### Structure d'une tâche Gantt
```javascript
{
  id: "uuid",
  text: "Étude technique",  // ← Doit être présent
  start_date: "2025-10-05",
  duration: 5,
  progress: 1,
  type: "task",
  parent: "uuid",
  open: true
}
```

## Commandes utiles

### Vérifier les données dans Supabase
```sql
SELECT 
    id,
    libelle_tache,
    affaire_id,
    site_id,
    date_debut_plan,
    date_fin_plan,
    statut
FROM planning_taches
ORDER BY date_debut_plan DESC
LIMIT 5;
```

### Tester l'API
```bash
node test_api_gantt.js
```

### Vérifier la console du navigateur
1. Ouvrir http://localhost:3000/gantt
2. F12 → Console
3. Chercher les logs avec 📥 📊 📋

## Prochaines étapes

Si le problème persiste après avoir vérifié les logs :
1. Copier les logs de la console
2. Vérifier quel log ne s'affiche pas
3. Identifier où les données se perdent

---

**Statut** : 🔍 En attente de vérification  
**Dernière mise à jour** : 20/10/2025

