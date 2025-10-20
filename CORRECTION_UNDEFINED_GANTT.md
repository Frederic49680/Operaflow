# ✅ Correction - Boutons "undefined" dans le Gantt

## Date : 20/10/2025

## Problème identifié

Les tâches affichaient "undefined" dans le Gantt interactif au lieu du libellé de la tâche.

### Symptômes
- ❌ Rectangles gris avec le texte "undefined"
- ❌ Tâches non identifiables
- ❌ Impossible de voir les informations des tâches

### Cause
1. **Vue inexistante** : L'API utilisait la vue `v_planning_taches_completes` qui n'existe pas dans la base de données
2. **Données manquantes** : Les tâches n'avaient pas toutes les propriétés nécessaires
3. **Filtrage insuffisant** : Le composant GanttInteractive n'excluait pas les tâches sans libellé

## Solution appliquée

### 1. Correction de l'API `/api/gantt/tasks` ✅

**Avant** :
```typescript
let query = supabase
  .from("v_planning_taches_completes")  // ❌ Vue inexistante
  .select("*")
  .order("date_debut_plan", { ascending: true })
```

**Après** :
```typescript
let query = supabase
  .from("planning_taches")  // ✅ Table directe
  .select(`
    *,
    affaires (
      code_affaire,
      nom
    ),
    sites (
      nom
    )
  `)
  .order("date_debut_plan", { ascending: true })

// Transformer les données pour inclure les informations des relations
const formattedData = data?.map((task: any) => ({
  ...task,
  code_affaire: task.affaires?.code_affaire || 'N/A',
  site_nom: task.sites?.nom || 'N/A',
})) || []
```

### 2. Amélioration du composant GanttInteractive ✅

**Avant** :
```typescript
const validTasks = tasks.filter(task => 
  task.date_debut_plan && 
  task.date_fin_plan &&
  !isNaN(new Date(task.date_debut_plan).getTime()) &&
  !isNaN(new Date(task.date_fin_plan).getTime())
)

return validTasks.map((task) => ({
  id: task.id,
  text: task.libelle_tache,  // ❌ Peut être undefined
  // ...
}))
```

**Après** :
```typescript
const validTasks = tasks.filter(task => 
  task.date_debut_plan && 
  task.date_fin_plan &&
  task.libelle_tache &&  // ✅ Vérification du libellé
  !isNaN(new Date(task.date_debut_plan).getTime()) &&
  !isNaN(new Date(task.date_fin_plan).getTime())
)

return validTasks.map((task) => ({
  id: task.id,
  text: task.libelle_tache || `Tâche ${task.id}`,  // ✅ Fallback
  // ...
}))
```

## Fonctionnalités du Gantt

### Affichage des tâches
- **Format** : Barres horizontales avec le libellé de la tâche
- **Position** : Basé sur les dates de début et fin
- **Durée** : Calculée automatiquement en jours
- **Avancement** : Barre de progression visuelle (0-100%)
- **Type** : 
  - Tâche normale
  - Milestone (si statut = "Terminé")

### Interactions
- **Drag & Drop** : Déplacer les tâches sur la timeline
- **Resize** : Redimensionner les tâches (modifier la durée)
- **Undo/Redo** : Annuler/Refaire les modifications (Ctrl+Z / Ctrl+Y)
- **Zoom** : Zoomer pour voir plus ou moins de détails

### Boutons du Gantt
1. **Undo** (↶) : Annuler la dernière action
2. **Redo** (↷) : Refaire l'action annulée

### Raccourcis clavier
- **Ctrl+Z** : Annuler
- **Ctrl+Y** : Refaire
- **Ctrl+S** : Sauvegarder

## Structure des données

### Format des tâches (Supabase)
```typescript
{
  id: string,
  libelle_tache: string,
  affaire_id: string,
  lot_id: string | null,
  site_id: string,
  type_tache: string,
  date_debut_plan: string,
  date_fin_plan: string,
  effort_plan_h: number,
  competence: string | null,
  avancement_pct: number,
  statut: string,
  // Relations
  affaires: {
    code_affaire: string,
    nom: string
  },
  sites: {
    nom: string
  }
}
```

### Format Frappe-Gantt
```typescript
{
  id: string,
  text: string,  // Libellé de la tâche
  start_date: string,  // Date de début (ISO)
  duration: number,  // Durée en jours
  progress: number,  // Progression (0-1)
  type: "task" | "milestone",
  parent: string | null,  // ID du lot parent
  open: boolean
}
```

## Fichiers modifiés

### `app/api/gantt/tasks/route.ts`
- ✅ Remplacement de la vue inexistante par la table directe
- ✅ Ajout des jointures vers `affaires` et `sites`
- ✅ Transformation des données pour inclure les relations

### `components/gantt/GanttInteractive.tsx`
- ✅ Ajout de la vérification du libellé dans le filtre
- ✅ Ajout d'un fallback si le libellé est manquant
- ✅ Amélioration de la robustesse du composant

## Test

Pour vérifier :
1. Aller sur http://localhost:3000/gantt
2. Vérifier que les tâches s'affichent avec leur libellé
3. Vérifier que les barres sont positionnées correctement
4. Tester le drag & drop
5. Tester le zoom
6. Tester undo/redo

## Exemple de rendu

**Avant** :
```
┌─────────────┐
│  undefined  │  ← Tâche non identifiable
└─────────────┘
```

**Après** :
```
┌─────────────────────────────┐
│ Études préliminaires        │  ← Libellé visible
│ ████████░░░░░░░░ 50%        │  ← Progression
└─────────────────────────────┘
```

## Prochaines améliorations

- [ ] Ajouter des tooltips avec plus d'informations
- [ ] Ajouter des couleurs selon le statut
- [ ] Ajouter des icônes selon le type de tâche
- [ ] Implémenter le drag & drop entre lots
- [ ] Ajouter des dépendances entre tâches
- [ ] Ajouter un mode critique path

---

**Statut** : ✅ Corrigé  
**Dernière mise à jour** : 20/10/2025

