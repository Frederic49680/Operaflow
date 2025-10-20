# 📊 Flux des données - Gantt

## Table principale
**`planning_taches`** : Contient les 14 tâches

## Tables liées (jointures)
- **`affaires`** : Code affaire (AFF-2025-001, etc.)
- **`sites`** : Nom du site (E-03A, DAM, etc.)
- **`affaires_lots`** : Lots financiers (optionnel)

## Flux complet

### 1. Chargement
```
Page Gantt
  ↓
  loadTasks()
  ↓
  fetch("/api/gantt/tasks")
  ↓
  API route.ts
```

### 2. Requête Supabase
```typescript
supabase
  .from("planning_taches")  // ← TABLE PRINCIPALE
  .select(`
    *,
    affaires (code_affaire, nom),
    sites (nom)
  `)
```

### 3. Affichage
```
API → Page Gantt → GanttInteractive → Frappe-Gantt
```

## Données actuelles

### planning_taches
- **14 tâches** au total
- Toutes ont un libellé
- Toutes ont des dates valides
- Toutes ont un site et une affaire

### Répartition
- **Terminé** : 3 tâches
- **En cours** : 4 tâches
- **Non lancé** : 7 tâches

## Exemple

### Dans la base
```sql
SELECT * FROM planning_taches;
-- 14 lignes
```

### Dans l'API
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "libelle_tache": "Étude technique",
      "affaire_id": "...",
      "site_id": "...",
      "code_affaire": "AFF-2025-004",
      "site_nom": "Site de test générique",
      "date_debut_plan": "2025-10-05",
      "date_fin_plan": "2025-10-10",
      "statut": "Terminé"
    },
    ...
  ]
}
```

---

**Table principale** : `planning_taches` (14 tâches)

