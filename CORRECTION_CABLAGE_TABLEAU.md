# ✅ Correction du câblage du tableau Gantt

## Date : 20/10/2025

## Problèmes identifiés

### 1. Requête Supabase incorrecte ❌
La requête utilisait une syntaxe incorrecte pour récupérer les relations :
```typescript
// ❌ AVANT (incorrect)
affaire_id:affaires (
  code_affaire
)
// Accès : tache.affaire_id?.[0]?.code_affaire
```

### 2. Affichage des "N/A" ❌
Les colonnes "Affaire" et "Site" n'avaient pas la même couleur pour les valeurs "N/A".

## Corrections appliquées

### 1. Requête Supabase corrigée ✅
```typescript
// ✅ APRÈS (correct)
affaires!inner (
  code_affaire
),
sites!inner (
  nom
)
// Accès : tache.affaires?.code_affaire
```

**Changements** :
- Utilisation de `!inner` pour les jointures obligatoires
- Accès direct aux objets (pas de `[0]`)
- Valeurs par défaut : `'N/A'` pour affaire/site, `'-'` pour lot

### 2. Couleurs cohérentes ✅
```typescript
// ✅ Colonne Affaire
<TableCell className="font-mono text-sm text-blue-600">
  {tache.code_affaire}
</TableCell>

// ✅ Colonne Site
<TableCell className="text-blue-600">
  {tache.site_nom}
</TableCell>
```

**Résultat** : Les "N/A" sont maintenant affichés en bleu dans les deux colonnes.

### 3. Valeurs par défaut ajoutées ✅
```typescript
const formattedData = data?.map((tache: any) => ({
  id: tache.id,
  libelle_tache: tache.libelle_tache,
  code_affaire: tache.affaires?.code_affaire || 'N/A',
  libelle_lot: tache.affaires_lots?.libelle_lot || '-',
  site_nom: tache.sites?.nom || 'N/A',
  type_tache: tache.type_tache,
  date_debut_plan: tache.date_debut_plan,
  date_fin_plan: tache.date_fin_plan,
  avancement_pct: tache.avancement_pct || 0,
  statut: tache.statut,
  ressource_ids: tache.ressource_ids,
})) || []
```

## Structure des données

### Colonnes du tableau
| Colonne | Source | Format | Valeur par défaut |
|---------|--------|--------|-------------------|
| Tâche | `libelle_tache` | Texte | - |
| Affaire | `affaires.code_affaire` | Texte (bleu) | 'N/A' |
| Lot | `affaires_lots.libelle_lot` | Texte | '-' |
| Site | `sites.nom` | Texte (bleu) | 'N/A' |
| Type | `type_tache` | Texte | - |
| Début | `date_debut_plan` | Date FR | - |
| Fin | `date_fin_plan` | Date FR | - |
| Avancement | `avancement_pct` | Pourcentage + barre | 0 |
| Statut | `statut` | Badge coloré | - |
| Actions | - | Dropdown | - |

## Fonctionnalités vérifiées

### ✅ Affichage des données
- Toutes les colonnes affichent correctement les données
- Les dates sont formatées en français (ex: "30 septembre 2025")
- Les barres de progression sont dynamiques
- Les badges de statut sont colorés correctement

### ✅ Barre de progression
- Barre verte avec gradient (bleu → vert)
- Largeur dynamique selon le pourcentage
- Affichage du pourcentage à côté

### ✅ Badges de statut
- **Terminé** : Badge vert (avancement = 100%)
- **En cours** : Badge bleu (avancement 1-99%)
- **Non lancé** : Badge gris (avancement = 0%)
- **Bloqué** : Badge rouge
- **Reporté** : Badge jaune

### ✅ Actions
- Dropdown avec 3 points (...)
- Bouton "Modifier" (à implémenter)
- Bouton "Supprimer" (fonctionnel)

### ✅ Fonction formatDate
```typescript
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
```
**Résultat** : "30 septembre 2025" au lieu de "2025-09-30"

## Fichiers modifiés

- `components/gantt/GanttTable.tsx` : Requête Supabase et affichage corrigés

## Test

Pour vérifier :
1. Aller sur http://localhost:3000/gantt
2. Cliquer sur l'onglet "Vue Tableau"
3. Vérifier que :
   - Les "N/A" sont en bleu
   - Les dates sont en français
   - Les barres de progression fonctionnent
   - Les badges de statut sont colorés

## Prochaines étapes

- [ ] Implémenter complètement la modification de tâche
- [ ] Ajouter des liens cliquables sur "Affaire" et "Site"
- [ ] Ajouter des filtres avancés
- [ ] Améliorer la gestion des erreurs

---

**Statut** : ✅ Corrigé  
**Dernière mise à jour** : 20/10/2025

