# 📊 Import → Affichage Gantt

## Flux automatique

```
1. Import CSV
   ↓
2. planning_taches (base de données)
   ↓
3. API /api/gantt/tasks
   ↓
4. Page Gantt
   ↓
5. GanttInteractive
   ↓
6. Frappe-Gantt (graphique visuel) ✅
```

## Comment ajouter des tâches

### Méthode 1 : Import CSV ✅

1. **Aller sur** : http://localhost:3000/gantt
2. **Cliquer sur "Importer"**
3. **Sélectionner** : `exemple_import_taches.csv`
4. ✅ **Les tâches apparaissent automatiquement dans le graphique**

### Méthode 2 : Formulaire

1. **Cliquer sur "Nouvelle tâche"**
2. **Remplir le formulaire**
3. **Cliquer sur "Créer"**
4. ✅ **La tâche apparaît immédiatement**

### Méthode 3 : SQL

```sql
INSERT INTO planning_taches (
  id, libelle_tache, affaire_id, site_id,
  date_debut_plan, date_fin_plan, statut
) VALUES (
  gen_random_uuid(),
  'Nouvelle tâche',
  '29f28ffc-26f0-48f6-b26b-ba1031bedbe2',
  'ccbc06a7-471e-4cf4-8e7e-46ace5920edb',
  '2025-10-15',
  '2025-10-20',
  'Non lancé'
);
```

## Affichage dans le graphique

### Exemple de barre

```
┌─────────────────────────────────────┐
│ Étude technique                     │
│ 2025-10-05 → 2025-10-10 (5 jours)  │
│ ████████████████████░░ 100%         │
└─────────────────────────────────────┘
```

### Couleurs selon le statut

- 🔵 **Non lancé** : Bleu clair
- 🟠 **En cours** : Orange
- 🟢 **Terminé** : Vert (milestone)
- 🔴 **Bloqué** : Rouge
- ⚪ **Reporté** : Gris

## Vérification

### Dans la base
```sql
SELECT COUNT(*) FROM planning_taches;
-- Retourne le nombre de tâches
```

### Dans le Gantt
```
Aller sur http://localhost:3000/gantt
→ Voir les tâches dans le graphique
```

## Fichiers utiles

- `exemple_import_taches.csv` : Fichier CSV avec 14 tâches
- `test_import_gantt.sql` : Script de vérification SQL
- `GUIDE_AFFICHAGE_GANTT.md` : Documentation complète

---

**Table** : `planning_taches`  
**Affichage** : Automatique après import/ajout

