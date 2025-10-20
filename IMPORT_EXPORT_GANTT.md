# ✅ Import/Export et Recherche - Page Gantt

## Date : 20/10/2025

## Résumé des modifications

La page Gantt a été améliorée avec les fonctionnalités d'import/export et de recherche en temps réel.

## Nouvelles fonctionnalités

### 1. Recherche en temps réel ✅
- **Champ de recherche** : Filtrer les tâches par nom, affaire ou site
- **Filtrage instantané** : Les résultats se mettent à jour en temps réel
- **Compteur de résultats** : Affiche "X tâche(s) trouvée(s) sur Y total"
- **Placeholder amélioré** : "Rechercher une tâche, affaire ou site..."

### 2. Export CSV ✅
- **Bouton "Exporter"** : Télécharge les tâches filtrées au format CSV
- **Nom de fichier** : `gantt-taches-YYYY-MM-DD.csv`
- **Colonnes exportées** :
  - Tâche
  - Affaire
  - Site
  - Type
  - Début
  - Fin
  - Avancement
  - Statut
- **Notification** : Toast de succès après export

### 3. Import CSV ✅
- **Bouton "Importer"** : Importe des tâches depuis un fichier CSV
- **Format attendu** : CSV avec les mêmes colonnes que l'export
- **Validation** : Vérifie le format du fichier
- **Insertion** : Ajoute les tâches dans Supabase
- **Notification** : Affiche le nombre de tâches importées
- **Rafraîchissement** : Met à jour la liste après import

## Structure des données

### Format CSV
```csv
Tâche,Affaire,Site,Type,Début,Fin,Avancement,Statut
Installation électrique,AFF001,Site A,Exécution,2025-01-01,2025-01-15,50%,En cours
Câblage réseau,AFF002,Site B,Exécution,2025-01-10,2025-01-20,25%,Non lancé
```

## Fonctionnalités techniques

### États ajoutés
```typescript
const [searchTerm, setSearchTerm] = useState("")
const [filteredTasks, setFilteredTasks] = useState<any[]>([])
```

### Fonctions ajoutées

#### `handleExport()`
- Génère un fichier CSV à partir des tâches filtrées
- Télécharge le fichier automatiquement
- Affiche une notification de succès

#### `handleImport()`
- Ouvre un sélecteur de fichier
- Parse le fichier CSV
- Valide les données
- Insère les tâches dans Supabase
- Rafraîchit la liste

#### Filtrage automatique
- Utilise `useEffect` pour filtrer les tâches
- Filtre par : nom de tâche, code affaire, nom de site
- Insensible à la casse

## Interface utilisateur

### Barre d'outils
```
[🔍 Rechercher...] [📤 Importer] [📥 Exporter] [➕ Nouvelle tâche]
```

### Compteur de résultats
```
X tâche(s) trouvée(s) sur Y total
```

## Exemple d'utilisation

### 1. Rechercher une tâche
1. Cliquer dans le champ de recherche
2. Taper le nom de la tâche, affaire ou site
3. Les résultats se filtrent automatiquement

### 2. Exporter les tâches
1. Cliquer sur "Exporter"
2. Le fichier CSV se télécharge automatiquement
3. Notification de succès

### 3. Importer des tâches
1. Cliquer sur "Importer"
2. Sélectionner un fichier CSV
3. Les tâches sont importées et affichées
4. Notification avec le nombre de tâches importées

## Fichiers modifiés

- `app/gantt/page.tsx` : Page principale du Gantt

## Packages utilisés

- `sonner` : Pour les notifications toast
- `lucide-react` : Pour les icônes (Upload, Download, Search)

## Prochaines étapes

- [ ] Améliorer le parser CSV (gérer les virgules dans les champs)
- [ ] Ajouter un template CSV téléchargeable
- [ ] Améliorer la validation des données importées
- [ ] Ajouter un mode d'aperçu avant import
- [ ] Ajouter des filtres avancés (par date, statut, etc.)

## Notes

- Le filtre s'applique uniquement sur la vue Gantt
- L'export inclut toutes les tâches filtrées
- L'import ajoute les tâches sans supprimer les existantes
- Les notifications utilisent le package `sonner`

---

**Statut** : ✅ Fonctionnel  
**Page** : `/gantt`  
**Dernière mise à jour** : 20/10/2025

