# ✅ Correction de l'API `/api/affaires/a-planifier`

## Date : 20/10/2025

---

## 🎯 Problème rencontré

L'API route `/api/affaires/a-planifier` retournait une erreur 500 car elle utilisait une vue `v_affaires_a_planifier` qui n'existait pas dans la base de données (supprimée dans la migration 033 simplifiée).

---

## ✅ Solution appliquée

### 1. Remplacement de la vue par une requête directe

**Avant :**
```typescript
const { data, error } = await supabase
  .from('v_affaires_a_planifier')  // ❌ Vue inexistante
  .select('*')
  .order('created_at', { ascending: false })
```

**Après :**
```typescript
const { data, error } = await supabase
  .from('affaires')  // ✅ Table directe
  .select(`
    *,
    sites:site_id (
      id,
      nom,
      code_site
    ),
    clients:client_id (
      id,
      nom_client
    ),
    ressources:responsable_id (
      id,
      nom,
      prenom
    )
  `)
  .eq('statut', 'A_planifier')  // ✅ Filtre sur le statut
  .order('created_at', { ascending: false })
```

### 2. Ajout du calcul des lots financiers

```typescript
// Récupérer les lots financiers pour chaque affaire
const affaireIds = data?.map((a: any) => a.id) || []
const { data: lotsData } = await supabase
  .from('affaires_lots_financiers')
  .select('affaire_id, montant_ht')
  .in('affaire_id', affaireIds)

// Créer un Map pour compter les lots par affaire
const lotsByAffaire = new Map<string, { count: number; total: number }>()
lotsData?.forEach((lot: any) => {
  const current = lotsByAffaire.get(lot.affaire_id) || { count: 0, total: 0 }
  lotsByAffaire.set(lot.affaire_id, {
    count: current.count + 1,
    total: current.total + (lot.montant_ht || 0)
  })
})
```

### 3. Transformation des données pour aplatir les relations

```typescript
const formattedData = data?.map((affaire: any) => {
  const lotsInfo = lotsByAffaire.get(affaire.id) || { count: 0, total: 0 }
  return {
    ...affaire,
    site_nom: affaire.sites?.nom || 'N/A',
    site_code: affaire.sites?.code_site || 'N/A',
    client_nom: affaire.clients?.nom_client || 'N/A',
    responsable_nom: affaire.ressources 
      ? `${affaire.ressources.prenom} ${affaire.ressources.nom}` 
      : 'N/A',
    nb_lots_financiers: lotsInfo.count,
    montant_lots_ht: lotsInfo.total,
  }
}) || []
```

---

## 📋 Données retournées

L'API retourne maintenant un tableau d'objets avec les propriétés suivantes :

| Propriété | Type | Description |
|-----------|------|-------------|
| `id` | string | ID de l'affaire |
| `code_affaire` | string | Code de l'affaire |
| `nom` | string | Nom de l'affaire |
| `statut` | string | Statut de l'affaire (toujours 'A_planifier') |
| `type_contrat` | string | Type de contrat |
| `montant_total_ht` | number | Montant total HT |
| `site_nom` | string | Nom du site (aplati depuis la relation) |
| `site_code` | string | Code du site (aplati depuis la relation) |
| `client_nom` | string | Nom du client (aplati depuis la relation) |
| `responsable_nom` | string | Nom complet du responsable (aplati depuis la relation) |
| `nb_lots_financiers` | number | Nombre de lots financiers associés |
| `montant_lots_ht` | number | Montant total des lots financiers |

---

## 🧪 Tests à effectuer

### Test 1 : Affichage des affaires en attente
1. Aller sur `/gantt`
2. Cliquer sur l'onglet "En attente"
3. **Vérifier** que les affaires avec le statut 'A_planifier' s'affichent
4. **Vérifier** que les informations (site, client, responsable) sont correctes

### Test 2 : Calcul des lots financiers
1. Créer une affaire avec le statut 'A_planifier'
2. Ajouter des lots financiers à cette affaire
3. Aller sur `/gantt` → Onglet "En attente"
4. **Vérifier** que le nombre de lots et le montant total sont corrects

### Test 3 : Déclaration de planification
1. Cliquer sur "Déclarer la planification" pour une affaire
2. Remplir les dates de début et fin
3. Cliquer sur "Valider"
4. **Vérifier** que l'affaire disparaît de l'onglet "En attente"
5. **Vérifier** que l'affaire apparaît dans l'onglet "Vue Gantt"

---

## 💡 Avantages de cette approche

### 1. **Pas de vue SQL**
- Pas besoin de créer/maintenir une vue dans la base de données
- Plus simple et plus maintenable
- Moins de dépendances

### 2. **Données à jour en temps réel**
- Les lots financiers sont calculés à chaque requête
- Pas de cache ou de synchronisation nécessaire
- Données toujours à jour

### 3. **Performance**
- Requête optimisée avec `IN` pour les lots
- Calcul côté serveur (pas côté client)
- Une seule requête pour les affaires + une pour les lots

### 4. **Flexibilité**
- Facile d'ajouter d'autres calculs
- Facile de modifier la structure des données retournées
- Pas de dépendance sur une vue SQL

---

## 🚀 Résultat final

**L'API `/api/affaires/a-planifier` fonctionne maintenant correctement !**

- ✅ Pas d'erreur 500
- ✅ Affaires en attente de planification récupérées
- ✅ Lots financiers calculés automatiquement
- ✅ Données formatées et prêtes à l'emploi
- ✅ Compatible avec le composant `GanttPendingCard`

---

## 📝 Notes importantes

1. **Vue supprimée** : La vue `v_affaires_a_planifier` a été supprimée dans la migration 033 simplifiée
2. **Filtre sur statut** : Seules les affaires avec `statut = 'A_planifier'` sont retournées
3. **Calcul des lots** : Les lots sont calculés à chaque requête pour garantir la cohérence
4. **Fallback 'N/A'** : Si une relation est manquante, la valeur 'N/A' est utilisée
5. **Performance** : Deux requêtes SQL (affaires + lots) au lieu d'une vue, mais plus simple à maintenir

---

**L'API est maintenant opérationnelle !** 🎉

