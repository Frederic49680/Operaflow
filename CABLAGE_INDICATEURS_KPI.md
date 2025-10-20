# ✅ Câblage des indicateurs KPI - Page Gantt

## Date : 20/10/2025

## Résumé

Les indicateurs KPI (Key Performance Indicators) de la page Gantt sont maintenant câblés et affichent les vraies valeurs calculées depuis les données.

## Indicateurs câblés

### 1. Tâches actives ✅
- **Description** : Nombre de tâches en cours
- **Calcul** : `tasks.filter(t => t.statut === "En cours").length`
- **Affichage** : `{tachesActives}`
- **Couleur** : Teal (bleu-vert)

### 2. Taux de couverture ✅
- **Description** : Pourcentage de couverture des ressources
- **Calcul** : `(tâches actives / total tâches) * 100`
- **Affichage** : `{tauxCouverture}%`
- **Couleur** : Vert

### 3. Retard moyen ✅
- **Description** : Nombre moyen de jours de retard
- **Calcul** : Moyenne des jours de retard des tâches en cours
  ```typescript
  const retards = tasks
    .filter(t => t.date_fin_plan && t.statut === "En cours")
    .map(t => {
      const finPlan = new Date(t.date_fin_plan)
      const diff = Math.floor((today - finPlan) / (1000 * 60 * 60 * 24))
      return diff > 0 ? diff : 0
    })
  const retardMoy = retards.length > 0 
    ? Math.round(retards.reduce((a, b) => a + b, 0) / retards.length)
    : 0
  ```
- **Affichage** : `{retardMoyen}j`
- **Couleur** : Orange

### 4. Suraffectations ✅
- **Description** : Nombre de ressources en surcharge
- **Calcul** : `tasks.filter(t => t.avancement_pct > 100).length`
- **Affichage** : `{suraffectations}`
- **Couleur** : Rouge

## Implémentation technique

### États ajoutés
```typescript
const [tachesActives, setTachesActives] = useState(0)
const [tauxCouverture, setTauxCouverture] = useState(0)
const [retardMoyen, setRetardMoyen] = useState(0)
const [suraffectations, setSuraffectations] = useState(0)
```

### Fonction de calcul
```typescript
const calculateKPIs = () => {
  // 1. Tâches actives
  const actives = tasks.filter((t) => t.statut === "En cours").length
  setTachesActives(actives)

  // 2. Taux de couverture
  const totalTaches = tasks.length
  const couverture = totalTaches > 0 
    ? Math.round((actives / totalTaches) * 100) 
    : 0
  setTauxCouverture(couverture)

  // 3. Retard moyen
  const today = new Date()
  const retards = tasks
    .filter((t) => t.date_fin_plan && t.statut === "En cours")
    .map((t) => {
      const finPlan = new Date(t.date_fin_plan)
      const diff = Math.floor((today.getTime() - finPlan.getTime()) / (1000 * 60 * 60 * 24))
      return diff > 0 ? diff : 0
    })
  
  const retardMoy = retards.length > 0 
    ? Math.round(retards.reduce((a, b) => a + b, 0) / retards.length)
    : 0
  setRetardMoyen(retardMoy)

  // 4. Suraffectations
  const surcharge = tasks.filter((t) => t.avancement_pct > 100).length
  setSuraffectations(surcharge)
}
```

### Déclenchement du calcul
```typescript
useEffect(() => {
  calculateKPIs()
}, [tasks])
```

## Interface utilisateur

### Structure des cartes KPI
```tsx
<Card>
  <CardHeader>
    <CardTitle>Tâches actives</CardTitle>
    <Icon />
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold">{tachesActives}</div>
    <p className="text-xs">En cours</p>
  </CardContent>
</Card>
```

### Ordre d'affichage
1. **Tâches actives** (Teal) - Gauche
2. **Taux de couverture** (Vert) - Centre gauche
3. **Retard moyen** (Orange) - Centre droit
4. **Suraffectations** (Rouge) - Droite

## Exemple de résultats

### Avec 10 tâches dont 4 en cours :
- **Tâches actives** : 4
- **Taux de couverture** : 40%
- **Retard moyen** : 2j (si 2 tâches ont 1 et 3 jours de retard)
- **Suraffectations** : 0

### Avec des tâches terminées :
- **Tâches actives** : 0
- **Taux de couverture** : 0%
- **Retard moyen** : 0j
- **Suraffectations** : 0

## Mise à jour en temps réel

Les KPI se mettent à jour automatiquement quand :
- Les tâches sont chargées
- Une tâche est modifiée
- Une tâche est ajoutée/supprimée
- Le statut d'une tâche change

## Prochaines améliorations

- [ ] Calculer le taux de couverture basé sur les ressources réelles
- [ ] Améliorer le calcul des suraffectations (basé sur les ressources)
- [ ] Ajouter des graphiques pour visualiser l'évolution
- [ ] Ajouter des alertes si les KPI dépassent des seuils
- [ ] Ajouter des comparaisons avec les périodes précédentes

## Fichiers modifiés

- `app/gantt/page.tsx` : Ajout des états, fonction de calcul et câblage des valeurs

## Test

Pour vérifier :
1. Aller sur http://localhost:3000/gantt
2. Vérifier que les KPI affichent des valeurs (pas 0)
3. Créer/modifier une tâche et vérifier que les KPI se mettent à jour

---

**Statut** : ✅ Câblé et fonctionnel  
**Dernière mise à jour** : 20/10/2025

