# ✅ Actualisation automatique du Gantt après création d'affaire BPU

## 🎯 Problème résolu

Après la création d'une affaire BPU, le trigger automatique créait bien la tâche parapluie en base et changeait le statut de l'affaire, **MAIS** l'interface frontend ne se rafraîchissait pas automatiquement.

### Symptômes observés :
- ❌ La vue tableau du Gantt ne s'actualisait pas
- ❌ Le Gantt graphique ne s'actualisait pas
- ✅ Le changement de statut apparaissait bien dans l'affaire (donc les données étaient bien enregistrées)

---

## 🔧 Solution appliquée

### 1. Événement `affaire-created` déjà déclenché

Le composant `AffaireFormModal` déclenchait déjà un événement personnalisé `affaire-created` après la création d'une affaire (ligne 331) :

```typescript
window.dispatchEvent(new Event('affaire-created'))
```

### 2. Ajout de listeners dans les composants concernés

#### 📄 `app/gantt/page.tsx`

Ajout d'un `useEffect` pour écouter l'événement `affaire-created` :

```typescript
// Écouter l'événement de création d'affaire pour rafraîchir les tâches
useEffect(() => {
  const handleAffaireCreated = () => {
    console.log('🔄 Événement affaire-created détecté, rafraîchissement des tâches...')
    loadTasks()
    loadAffairesAPlanifier()
  }

  window.addEventListener('affaire-created', handleAffaireCreated)
  
  return () => {
    window.removeEventListener('affaire-created', handleAffaireCreated)
  }
}, [])
```

**Effet :** Recharge automatiquement les tâches ET les affaires en attente de planification.

#### 📄 `components/gantt/GanttTable.tsx`

Ajout d'un `useEffect` similaire :

```typescript
// Écouter l'événement de création d'affaire pour rafraîchir les tâches
useEffect(() => {
  const handleAffaireCreated = () => {
    console.log('🔄 GanttTable: Événement affaire-created détecté, rafraîchissement...')
    loadTaches()
  }

  window.addEventListener('affaire-created', handleAffaireCreated)
  
  return () => {
    window.removeEventListener('affaire-created', handleAffaireCreated)
  }
}, [])
```

**Effet :** La vue tableau se rafraîchit automatiquement.

#### 📄 `components/gantt/GanttInteractive.tsx`

✅ **Aucune modification nécessaire** : Ce composant reçoit les tâches en props et se met à jour automatiquement via le `useEffect` existant qui synchronise `localTasks` avec `tasks`.

---

## 🔄 Workflow complet

```
1. Utilisateur crée une affaire BPU
        ↓
2. AffaireFormModal envoie les données à l'API
        ↓
3. L'affaire est insérée en base avec statut='A_planifier'
        ↓
4. Trigger trg_auto_plan_bpu_affaire détecte l'affaire BPU
        ↓
5. Fonction fn_auto_plan_bpu_affaire() s'exécute :
   - Crée la tâche parapluie dans planning_taches
   - Change le statut de l'affaire en 'Validee'
        ↓
6. AffaireFormModal déclenche l'événement 'affaire-created'
        ↓
7. Les listeners dans GanttPage et GanttTable détectent l'événement
        ↓
8. loadTasks() et loadAffairesAPlanifier() sont appelées
        ↓
9. Les nouvelles tâches sont récupérées depuis l'API
        ↓
10. GanttInteractive reçoit les nouvelles tâches via props
        ↓
11. Le Gantt se met à jour automatiquement ✅
```

---

## ✅ Résultat

### Avant :
- ❌ Création affaire BPU → Tâche créée en base → Interface ne se rafraîchit pas

### Après :
- ✅ Création affaire BPU → Tâche créée en base → Interface se rafraîchit automatiquement
- ✅ La tâche parapluie apparaît immédiatement dans le Gantt
- ✅ La vue tableau affiche la nouvelle tâche
- ✅ L'affaire disparaît de la liste "En attente de planification"

---

## 🧪 Test

Pour tester la fonctionnalité :

1. Aller sur la page **Affaires**
2. Cliquer sur **"+ Nouvelle affaire"**
3. Remplir le formulaire avec :
   - Type : **BPU**
   - Statut : **À planifier** (par défaut)
   - Période début et fin
4. Cliquer sur **Valider**
5. **Vérifier :**
   - ✅ Le modal se ferme
   - ✅ Un message de succès s'affiche
   - ✅ Dans la console : "🔄 Événement affaire-created détecté..."
   - ✅ Aller sur la page **Gantt**
   - ✅ La tâche parapluie "Contrat {Nom} — Décharge batterie" apparaît dans le Gantt
   - ✅ La vue tableau affiche la nouvelle tâche
   - ✅ L'affaire n'apparaît plus dans "En attente de planification"

---

## 📝 Notes techniques

- **Événement personnalisé** : `window.dispatchEvent(new Event('affaire-created'))`
- **Nettoyage** : Les listeners sont correctement retirés dans les fonctions de cleanup (`return () => { ... }`)
- **Console logs** : Des logs ont été ajoutés pour faciliter le débogage
- **Pas de dépendances** : Les `useEffect` n'ont pas de dépendances pour éviter les re-renders inutiles

---

## 🎉 Conclusion

Le système de planification automatique des affaires BPU est maintenant **100% fonctionnel** :
- ✅ Trigger automatique en base
- ✅ Actualisation automatique de l'interface
- ✅ Expérience utilisateur fluide et transparente

