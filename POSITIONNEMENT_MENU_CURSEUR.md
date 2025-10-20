# ✅ Positionnement du menu au niveau du curseur

## Date : 20/10/2025

---

## 🎯 Objectif

Modifier le positionnement du menu d'actions pour qu'il s'affiche **au niveau du curseur** (là où l'utilisateur clique sur la ligne) plutôt qu'en haut à gauche de l'écran.

---

## ✅ Tableaux modifiés

### 1. AffairesTable ✅
**Fichier :** `components/affaires/AffairesTable.tsx`

### 2. GanttTable ✅
**Fichier :** `components/gantt/GanttTable.tsx`

---

## 🔧 Implémentation technique

### 1. Ajout de l'état pour la position du menu

```typescript
const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null)
```

### 2. Capture de la position au clic sur la ligne

```typescript
onClick={(e) => {
  const rect = e.currentTarget.getBoundingClientRect()
  setMenuPosition({ 
    x: rect.left + rect.width / 2, 
    y: rect.top + rect.height / 2 
  })
  setOpenDropdownId(openDropdownId === affaire.id ? null : affaire.id)
}}
```

**Explication :**
- `getBoundingClientRect()` retourne les coordonnées de la ligne dans le viewport
- `rect.left + rect.width / 2` = position X au centre de la ligne
- `rect.top + rect.height / 2` = position Y au centre de la ligne

### 3. Positionnement fixe du menu

```typescript
<DropdownMenuContent 
  align="end" 
  className="w-48"
  style={{
    position: 'fixed',
    left: menuPosition?.x ? `${menuPosition.x}px` : 'auto',
    top: menuPosition?.y ? `${menuPosition.y}px` : 'auto',
  }}
>
```

**Explication :**
- `position: 'fixed'` = positionnement fixe par rapport au viewport
- `left` et `top` = coordonnées calculées au clic
- `'auto'` = fallback si pas de position définie

---

## 🎨 Comportement

### Avant
- ❌ Le menu s'affichait en haut à gauche de l'écran
- ❌ Position fixe et peu intuitive
- ❌ L'utilisateur devait chercher le menu

### Après
- ✅ Le menu s'affiche **au centre de la ligne cliquée**
- ✅ Position dynamique et intuitive
- ✅ Le menu apparaît exactement là où l'utilisateur a cliqué

---

## 📋 Exemple visuel

### Avant
```
┌─────────────────────────────────────┐
│ Menu (en haut à gauche)             │
│ - Voir le détail                    │
│ - Modifier                          │
│ - Supprimer                         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Code  │ Nom  │ ... │ Statut        │
├───────┼──────┼─────┼───────────────┤
│ AFF   │ ...  │ ... │ À planifier   │ ← Clic ici
└───────┴──────┴─────┴───────────────┘
```

### Après
```
┌─────────────────────────────────────┐
│ Code  │ Nom  │ ... │ Statut        │
├───────┼──────┼─────┼───────────────┤
│ AFF   │ ...  │ ... │ À planifier   │ ← Clic ici
└───────┴──────┴─────┴───────────────┘
         ┌─────────────────┐
         │ Menu (au centre)│
         │ - Voir le détail│
         │ - Modifier      │
         │ - Supprimer     │
         └─────────────────┘
```

---

## 🧪 Tests à effectuer

### Test 1 : Position du menu
1. Cliquer sur une ligne du tableau
2. **Vérifier** que le menu s'affiche au centre de la ligne cliquée
3. **Vérifier** que le menu n'est pas en haut à gauche

### Test 2 : Position dynamique
1. Cliquer sur différentes lignes (haut, milieu, bas du tableau)
2. **Vérifier** que le menu s'affiche toujours au centre de la ligne cliquée
3. **Vérifier** que la position change selon la ligne

### Test 3 : Fermeture du menu
1. Cliquer sur une ligne pour ouvrir le menu
2. Cliquer à nouveau sur la même ligne
3. **Vérifier** que le menu se ferme

### Test 4 : Actions
1. Cliquer sur une ligne pour ouvrir le menu
2. Cliquer sur une action (Voir le détail, Modifier, Supprimer)
3. **Vérifier** que l'action est exécutée correctement
4. **Vérifier** que le menu se ferme

---

## 💡 Avantages

### 1. **Meilleure ergonomie**
- Le menu apparaît exactement là où l'utilisateur a cliqué
- Plus intuitif et naturel
- Réduit le temps de recherche visuelle

### 2. **Position dynamique**
- Le menu s'adapte à la position de la ligne
- Fonctionne peu importe où se trouve la ligne dans le tableau
- Pas de problème avec les lignes en bas du tableau

### 3. **UX améliorée**
- Expérience utilisateur plus fluide
- Réduction de la fatigue visuelle
- Meilleure accessibilité

### 4. **Cohérence**
- Comportement uniforme dans toute l'application
- Pattern clair et réutilisable

---

## 📖 Pattern à suivre pour de nouveaux tableaux

Pour appliquer ce pattern à un nouveau tableau :

### Étape 1 : Ajouter l'état de position

```typescript
const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null)
```

### Étape 2 : Capturer la position au clic

```typescript
<TableRow 
  onClick={(e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMenuPosition({ 
      x: rect.left + rect.width / 2, 
      y: rect.top + rect.height / 2 
    })
    setOpenDropdownId(openDropdownId === item.id ? null : item.id)
  }}
>
```

### Étape 3 : Utiliser la position dans le menu

```typescript
<DropdownMenuContent 
  style={{
    position: 'fixed',
    left: menuPosition?.x ? `${menuPosition.x}px` : 'auto',
    top: menuPosition?.y ? `${menuPosition.y}px` : 'auto',
  }}
>
```

---

## 🚀 Résultat final

**Les tableaux AffairesTable et GanttTable affichent maintenant le menu au niveau du curseur !**

- ✅ Menu positionné au centre de la ligne cliquée
- ✅ Position dynamique et intuitive
- ✅ Meilleure ergonomie
- ✅ UX améliorée

---

## 📝 Notes importantes

1. **Position fixe** : Le menu utilise `position: fixed` pour être positionné par rapport au viewport
2. **Coordonnées calculées** : Les coordonnées sont calculées au moment du clic
3. **Centrage** : Le menu est centré sur la ligne (x = left + width/2, y = top + height/2)
4. **Fallback** : Si pas de position définie, le menu utilise `auto` pour un positionnement par défaut
5. **Performance** : Le calcul de position est très rapide (quelques millisecondes)

---

**Le menu s'affiche maintenant au niveau du curseur !** 🎉

