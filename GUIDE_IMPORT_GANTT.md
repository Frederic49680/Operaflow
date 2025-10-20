# 📥 Guide d'import - Module Gantt

## Date : 20/10/2025

## Méthodes d'import

### Méthode 1 : Via l'interface (CSV) ✅

#### Étapes
1. **Aller sur la page Gantt** : http://localhost:3000/gantt
2. **Cliquer sur le bouton "Importer"** dans la toolbar
3. **Sélectionner un fichier CSV**
4. **Les données sont automatiquement importées**

#### Format du fichier CSV

**Colonnes obligatoires** :
```csv
Tâche,Affaire,Site,Type,Début,Fin,Avancement,Statut
```

**Exemple** :
```csv
Tâche,Affaire,Site,Type,Début,Fin,Avancement,Statut
Étude technique,AFF-2025-001,Site E-03A,Préparation,2025-10-05,2025-10-10,0,Non lancé
Contrôle équipements,AFF-2025-002,Site DAM,Contrôle,2025-10-07,2025-10-10,0,Non lancé
```

**Colonnes** :
- **Tâche** : Libellé de la tâche (obligatoire)
- **Affaire** : Code affaire (ex: AFF-2025-001)
- **Site** : Nom du site
- **Type** : Type de tâche (Préparation, Exécution, Contrôle, Autre)
- **Début** : Date de début (format: YYYY-MM-DD)
- **Fin** : Date de fin (format: YYYY-MM-DD)
- **Avancement** : Pourcentage (0-100)
- **Statut** : Statut (Non lancé, En cours, Terminé, Bloqué, Reporté)

#### Fichier d'exemple
Un fichier `exemple_import_taches.csv` a été créé avec 14 tâches d'exemple.

### Méthode 2 : Via SQL (Supabase)

#### Insertion simple
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
  '29f28ffc-26f0-48f6-b26b-ba1031bedbe2',  -- ID de l'affaire
  'ccbc06a7-471e-4cf4-8e7e-46ace5920edb',  -- ID du site
  'Exécution',
  '2025-10-15',
  '2025-10-20',
  0,
  'Non lancé'
);
```

#### Insertion multiple
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
) VALUES 
  (
    gen_random_uuid(),
    'Tâche 1',
    '29f28ffc-26f0-48f6-b26b-ba1031bedbe2',
    'ccbc06a7-471e-4cf4-8e7e-46ace5920edb',
    'Préparation',
    '2025-10-15',
    '2025-10-20',
    0,
    'Non lancé'
  ),
  (
    gen_random_uuid(),
    'Tâche 2',
    '29f28ffc-26f0-48f6-b26b-ba1031bedbe2',
    'ccbc06a7-471e-4cf4-8e7e-46ace5920edb',
    'Exécution',
    '2025-10-21',
    '2025-10-25',
    0,
    'Non lancé'
  );
```

### Méthode 3 : Via le formulaire (interface)

#### Étapes
1. **Cliquer sur "Nouvelle tâche"**
2. **Remplir le formulaire** :
   - Affaire (obligatoire)
   - Libellé (obligatoire)
   - Dates (obligatoires)
   - Statut (obligatoire)
   - Autres champs (optionnels)
3. **Cliquer sur "Créer"**

## Table de destination

### `planning_taches`

**Champs obligatoires** :
- `id` : UUID (généré automatiquement)
- `libelle_tache` : Libellé de la tâche
- `affaire_id` : ID de l'affaire
- `site_id` : ID du site
- `date_debut_plan` : Date de début
- `date_fin_plan` : Date de fin
- `statut` : Statut

**Champs optionnels** :
- `lot_id` : ID du lot financier
- `type_tache` : Type de tâche
- `effort_plan_h` : Effort prévu en heures
- `effort_reel_h` : Effort réel en heures
- `avancement_pct` : Pourcentage d'avancement
- `competence` : Compétence requise

## Vérification après import

### Via l'interface
1. Aller sur http://localhost:3000/gantt
2. Vérifier que les nouvelles tâches apparaissent
3. Vérifier que les KPI se mettent à jour

### Via SQL
```sql
SELECT 
    libelle_tache,
    code_affaire,
    site_nom,
    date_debut_plan,
    date_fin_plan,
    statut
FROM planning_taches t
LEFT JOIN affaires a ON t.affaire_id = a.id
LEFT JOIN sites s ON t.site_id = s.id
ORDER BY date_debut_plan DESC
LIMIT 10;
```

## Exemples d'utilisation

### Exemple 1 : Import CSV
1. Télécharger `exemple_import_taches.csv`
2. Aller sur http://localhost:3000/gantt
3. Cliquer sur "Importer"
4. Sélectionner le fichier
5. ✅ Les 14 tâches sont importées

### Exemple 2 : Ajout manuel
1. Aller sur http://localhost:3000/gantt
2. Cliquer sur "Nouvelle tâche"
3. Remplir :
   - Affaire : AFF-2025-001
   - Libellé : Installation panneaux
   - Début : 2025-11-01
   - Fin : 2025-11-05
   - Statut : Non lancé
4. Cliquer sur "Créer"
5. ✅ La tâche est ajoutée

### Exemple 3 : Import SQL
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
  'Maintenance préventive',
  (SELECT id FROM affaires WHERE code_affaire = 'AFF-2025-001'),
  (SELECT id FROM sites WHERE nom = 'Site E-03A - Poste HTA'),
  'Contrôle',
  '2025-11-10',
  '2025-11-12',
  0,
  'Non lancé'
);
```

## Fichiers utiles

- `exemple_import_taches.csv` : Fichier CSV d'exemple avec 14 tâches
- `test_api_gantt.js` : Script de test de l'API
- `test_supabase_direct.js` : Script de test direct Supabase

## Troubleshooting

### Problème : Import ne fonctionne pas
**Solution** : Vérifier le format du CSV (virgules, pas de point-virgule)

### Problème : Erreur "Affaire non trouvée"
**Solution** : Vérifier que le code affaire existe dans la table `affaires`

### Problème : Erreur "Site non trouvé"
**Solution** : Vérifier que le nom du site existe dans la table `sites`

### Problème : Dates invalides
**Solution** : Utiliser le format YYYY-MM-DD (ex: 2025-10-15)

---

**Dernière mise à jour** : 20/10/2025

