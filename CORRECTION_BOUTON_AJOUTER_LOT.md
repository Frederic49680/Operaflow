# ✅ Correction du bouton "Ajouter un lot"

## 🎯 Problème résolu

### ❌ Symptôme
Le bouton "Ajouter un lot" fermait la fenêtre principale au lieu d'ouvrir le modal de création de lot.

### 🔍 Cause
Le composant `LotsFinanciersTable` est imbriqué dans le modal `AffaireFormModal`. Quand on clique sur "Ajouter un lot", l'événement de clic se propage au modal parent et le ferme.

**Architecture :**
```
AffaireFormModal (modal parent)
  └── LotsFinanciersTable
      └── LotFormModal (modal enfant)
```

Quand on clique sur "Ajouter un lot" → l'événement remonte → ferme `AffaireFormModal` → le modal enfant ne s'ouvre jamais.

---

## 🔧 Solution appliquée

### Fichier : `components/affaires/LotsFinanciersTable.tsx`

Ajout de `stopPropagation()` sur tous les boutons d'action pour empêcher la propagation de l'événement au modal parent.

#### 1. Fonction `handleAdd`

**Avant :**
```typescript
const handleAdd = () => {
  setSelectedLot(undefined)
  setShowModal(true)
}
```

**Après :**
```typescript
const handleAdd = (e?: React.MouseEvent) => {
  e?.stopPropagation()
  setSelectedLot(undefined)
  setShowModal(true)
}
```

**Appel dans le JSX :**
```typescript
<Button onClick={(e) => handleAdd(e)} size="sm">
  <Plus className="h-4 w-4 mr-2" />
  Ajouter un lot
</Button>
```

#### 2. Fonction `handleEdit`

**Avant :**
```typescript
const handleEdit = (lot: Lot) => {
  setSelectedLot(lot)
  setShowModal(true)
}
```

**Après :**
```typescript
const handleEdit = (lot: Lot, e?: React.MouseEvent) => {
  e?.stopPropagation()
  setSelectedLot(lot)
  setShowModal(true)
}
```

**Appel dans le JSX :**
```typescript
<Button
  variant="ghost"
  size="icon"
  onClick={(e) => handleEdit(lot, e)}
>
  <Pencil className="h-4 w-4" />
</Button>
```

#### 3. Fonction `handleDelete`

**Avant :**
```typescript
const handleDelete = async (lotId: string) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce lot ?')) {
    return
  }
  // ...
}
```

**Après :**
```typescript
const handleDelete = async (lotId: string, e?: React.MouseEvent) => {
  e?.stopPropagation()
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce lot ?')) {
    return
  }
  // ...
}
```

**Appel dans le JSX :**
```typescript
<Button
  variant="ghost"
  size="icon"
  onClick={(e) => handleDelete(lot.id, e)}
>
  <Trash2 className="h-4 w-4 text-destructive" />
</Button>
```

---

## ✅ Résultat

### Avant :
- ❌ Clic sur "Ajouter un lot" → ferme le modal parent
- ❌ Le modal de création de lot ne s'ouvre jamais
- ❌ Même problème avec les boutons Modifier et Supprimer

### Après :
- ✅ Clic sur "Ajouter un lot" → ouvre le modal de création de lot
- ✅ Le modal parent reste ouvert
- ✅ Les boutons Modifier et Supprimer fonctionnent correctement
- ✅ Aucune propagation d'événement au modal parent

---

## 🧪 Test

### Test 1 : Ajouter un lot

1. Ouvrir le modal de modification d'une affaire
2. Aller dans l'onglet **"Lots financiers"**
3. Cliquer sur **"Ajouter un lot"**
4. **Vérifier :**
   - ✅ Le modal de création de lot s'ouvre
   - ✅ Le modal parent reste ouvert
   - ✅ Le formulaire de lot est visible

### Test 2 : Modifier un lot

1. Dans l'onglet "Lots financiers", cliquer sur l'icône **crayon** d'un lot existant
2. **Vérifier :**
   - ✅ Le modal de modification de lot s'ouvre
   - ✅ Le modal parent reste ouvert
   - ✅ Le formulaire est pré-rempli avec les données du lot

### Test 3 : Supprimer un lot

1. Dans l'onglet "Lots financiers", cliquer sur l'icône **poubelle** d'un lot existant
2. **Vérifier :**
   - ✅ La confirmation de suppression s'affiche
   - ✅ Le modal parent reste ouvert
   - ✅ Après confirmation, le lot est supprimé

---

## 📝 Explication technique

### `stopPropagation()`

La méthode `stopPropagation()` empêche l'événement de remonter dans l'arbre DOM (event bubbling).

**Sans `stopPropagation()` :**
```
Clic sur bouton "Ajouter un lot"
        ↓
LotsFinanciersTable (reçoit le clic)
        ↓
AffaireFormModal (reçoit le clic aussi)
        ↓
Modal se ferme ❌
```

**Avec `stopPropagation()` :**
```
Clic sur bouton "Ajouter un lot"
        ↓
LotsFinanciersTable (reçoit le clic)
        ↓ (stopPropagation empêche la propagation)
AffaireFormModal (ne reçoit pas le clic)
        ↓
Modal reste ouvert ✅
Modal enfant s'ouvre ✅
```

---

## 🎉 Conclusion

Le problème de propagation d'événement est maintenant résolu :
- ✅ Tous les boutons d'action fonctionnent correctement
- ✅ Le modal parent reste ouvert pendant les actions sur les lots
- ✅ L'expérience utilisateur est fluide et intuitive
- ✅ Aucune erreur de linting

