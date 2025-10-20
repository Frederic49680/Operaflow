# 📊 Flux des données - Module Gantt

## Date : 20/10/2025

## Tables impliquées

### 1. Table principale : `planning_taches` ✅

C'est la table principale qui contient toutes les tâches du Gantt.

**Structure** :
```sql
CREATE TABLE planning_taches (
  id uuid PRIMARY KEY,
  libelle_tache text NOT NULL,
  affaire_id uuid REFERENCES affaires(id),
  lot_id uuid REFERENCES affaires_lots(id),
  site_id uuid REFERENCES sites(id),
  type_tache text,
  date_debut_plan date,
  date_fin_plan date,
  date_debut_reelle date,
  date_fin_reelle date,
  effort_plan_h numeric,
  effort_reel_h numeric,
  avancement_pct numeric DEFAULT 0,
  statut text DEFAULT 'Non lancé',
  competence text,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);
```

**Données actuelles** : **14 tâches**

### 2. Tables liées (relations)

#### `affaires`
```sql
CREATE TABLE affaires (
  id uuid PRIMARY KEY,
  code_affaire text UNIQUE NOT NULL,
  nom text,
  site_id uuid REFERENCES sites(id),
  responsable_id uuid REFERENCES ressources(id),
  type_contrat text,
  montant_total_ht numeric,
  statut text,
  -- ...
);
```

#### `affaires_lots`
```sql
CREATE TABLE affaires_lots (
  id uuid PRIMARY KEY,
  affaire_id uuid REFERENCES affaires(id),
  libelle_lot text,
  budget_ht numeric,
  cout_estime numeric,
  marge_prevue numeric,
  -- ...
);
```

#### `sites`
```sql
CREATE TABLE sites (
  id uuid PRIMARY KEY,
  code_site text UNIQUE NOT NULL,
  nom text,
  responsable_id uuid REFERENCES ressources(id),
  statut text DEFAULT 'Actif',
  -- ...
);
```

## Flux de données

### 1. Chargement (Page Gantt)

```
app/gantt/page.tsx
  ↓
  loadTasks()
  ↓
  fetch("/api/gantt/tasks")
  ↓
  app/api/gantt/tasks/route.ts
```

### 2. API (route.ts)

```typescript
// Requête Supabase
supabase
  .from("planning_taches")  // ← TABLE PRINCIPALE
  .select(`
    *,
    affaires (code_affaire, nom),
    sites (nom)
  `)
  .order("date_debut_plan")
```

**Tables interrogées** :
- ✅ `planning_taches` (table principale)
- ✅ `affaires` (jointure)
- ✅ `sites` (jointure)

### 3. Transformation des données

```typescript
const formattedData = data?.map((task: any) => ({
  ...task,
  code_affaire: task.affaires?.code_affaire || 'N/A',
  site_nom: task.sites?.nom || 'N/A',
})) || []
```

### 4. Affichage (GanttInteractive)

```
app/gantt/page.tsx
  ↓
  setTasks(result.data)
  ↓
  <GanttInteractive tasks={filteredTasks} />
  ↓
  components/gantt/GanttInteractive.tsx
  ↓
  convertToGanttTasks(tasks)
  ↓
  Frappe-Gantt
```

## Résumé

### Table principale
- **`planning_taches`** : Contient les 14 tâches

### Tables liées (jointures)
- **`affaires`** : Informations sur les affaires (code, nom)
- **`sites`** : Informations sur les sites (nom)
- **`affaires_lots`** : Lots financiers (optionnel)

### Données actuelles
- **14 tâches** dans `planning_taches`
- **4 affaires** (AFF-2025-001 à 004)
- **4 sites** (E-03A, DAM, PDC_FBA, Site de test générique)
- **Lots** : Liés aux tâches via `lot_id`

## Exemple de données

### Tâche dans planning_taches
```json
{
  "id": "c63a9eda-7310-4b53-a190-72757c9413a2",
  "libelle_tache": "Étude technique",
  "affaire_id": "29f28ffc-26f0-48f6-b26b-ba1031bedbe2",
  "lot_id": "b3975660-0d70-4974-9c54-24add522080d",
  "site_id": "ccbc06a7-471e-4cf4-8e7e-46ace5920edb",
  "type_tache": "Préparation",
  "date_debut_plan": "2025-10-05",
  "date_fin_plan": "2025-10-10",
  "avancement_pct": 100,
  "statut": "Terminé"
}
```

### Avec les jointures
```json
{
  "id": "c63a9eda-7310-4b53-a190-72757c9413a2",
  "libelle_tache": "Étude technique",
  "affaire_id": "29f28ffc-26f0-48f6-b26b-ba1031bedbe2",
  "lot_id": "b3975660-0d70-4974-9c54-24add522080d",
  "site_id": "ccbc06a7-471e-4cf4-8e7e-46ace5920edb",
  "affaires": {
    "code_affaire": "AFF-2025-004",
    "nom": "Affaire 4"
  },
  "sites": {
    "nom": "Site de test générique"
  }
}
```

### Après transformation
```json
{
  "id": "c63a9eda-7310-4b53-a190-72757c9413a2",
  "libelle_tache": "Étude technique",
  "affaire_id": "29f28ffc-26f0-48f6-b26b-ba1031bedbe2",
  "lot_id": "b3975660-0d70-4974-9c54-24add522080d",
  "site_id": "ccbc06a7-471e-4cf4-8e7e-46ace5920edb",
  "code_affaire": "AFF-2025-004",
  "site_nom": "Site de test générique",
  "type_tache": "Préparation",
  "date_debut_plan": "2025-10-05",
  "date_fin_plan": "2025-10-10",
  "avancement_pct": 100,
  "statut": "Terminé"
}
```

## Requêtes SQL utiles

### Voir toutes les tâches
```sql
SELECT * FROM planning_taches;
```

### Voir les tâches avec leurs relations
```sql
SELECT 
    t.id,
    t.libelle_tache,
    t.affaire_id,
    a.code_affaire,
    t.site_id,
    s.nom as site_nom,
    t.date_debut_plan,
    t.date_fin_plan,
    t.statut
FROM planning_taches t
LEFT JOIN affaires a ON t.affaire_id = a.id
LEFT JOIN sites s ON t.site_id = s.id
ORDER BY t.date_debut_plan;
```

### Compter les tâches par statut
```sql
SELECT 
    statut,
    COUNT(*) as nombre
FROM planning_taches
GROUP BY statut;
```

### Compter les tâches par site
```sql
SELECT 
    s.nom as site,
    COUNT(t.id) as nb_taches
FROM sites s
LEFT JOIN planning_taches t ON s.id = t.site_id
GROUP BY s.nom;
```

## Fichiers impliqués

### Backend
- `app/api/gantt/tasks/route.ts` : API qui charge les données

### Frontend
- `app/gantt/page.tsx` : Page Gantt qui affiche les données
- `components/gantt/GanttInteractive.tsx` : Composant Gantt interactif
- `components/gantt/GanttTable.tsx` : Tableau des tâches

### Base de données
- `supabase/migrations/` : Migrations SQL

## Prochaines étapes

Pour ajouter/modifier/supprimer des tâches :
- **Ajouter** : Utiliser le formulaire "Nouvelle tâche"
- **Modifier** : Utiliser le bouton "Modifier" dans le tableau
- **Supprimer** : Utiliser le bouton "Supprimer" dans le tableau

Toutes les opérations modifient la table **`planning_taches`**.

---

**Dernière mise à jour** : 20/10/2025

