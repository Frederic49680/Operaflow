# ✅ Correction du modal de modification d'affaire

## 🎯 Problèmes résolus

### 1. ❌ Les champs Site, Client et Responsable ne se rechargent pas
**Symptôme :** Lors de la modification d'une affaire, les champs Select affichaient "Sélectionner..." au lieu des valeurs existantes.

**Cause :** Les données de l'affaire étaient chargées depuis l'API, mais les états des champs Select (`selectedSite`, `selectedClient`, `selectedResponsable`, etc.) n'étaient pas mis à jour.

**Solution :** Ajout de setters pour tous les champs du formulaire après le chargement des données.

### 2. ❌ Le découpage financier ne permet aucune action
**Symptôme :** L'onglet "Lots financiers" affichait des exemples statiques avec des boutons "À venir" grisés, sans possibilité d'ajouter, modifier ou supprimer des lots.

**Cause :** Le composant `LotsFinanciersTable` n'était pas intégré dans `AffaireFormModal`.

**Solution :** Importation et intégration de `LotsFinanciersTable` dans l'onglet "Lots financiers".

---

## 🔧 Modifications apportées

### Fichier : `components/affaires/AffaireFormModal.tsx`

#### 1. Import du composant `LotsFinanciersTable`

```typescript
import { LotsFinanciersTable } from "./LotsFinanciersTable"
```

#### 2. Mise à jour complète des champs lors du chargement des données

**Avant :**
```typescript
if (affaireId) {
  const response = await fetch(`/api/affaires/${affaireId}`)
  if (response.ok) {
    const affaire = await response.json()
    setAffaireData(affaire)
    setTypeAffaire(affaire.type_affaire || "Forfait")
    if (affaire.type_affaire === "BPU") {
      setNbRessources(affaire.nb_ressources_ref || 2)
      setHeuresSemaine(affaire.heures_semaine_ref || 35)
      setPeriodeDebut(affaire.periode_debut || "")
      setPeriodeFin(affaire.periode_fin || "")
    }
  }
}
```

**Après :**
```typescript
if (affaireId) {
  const response = await fetch(`/api/affaires/${affaireId}`)
  if (response.ok) {
    const affaire = await response.json()
    setAffaireData(affaire)
    
    // Mettre à jour tous les champs du formulaire
    setNom(affaire.nom || "")
    setCodeAffaire(affaire.code_affaire || "")
    setNumCommande(affaire.num_commande || "")
    setMontant(affaire.montant_total_ht?.toString() || "")
    setDateDebut(affaire.date_debut || "")
    setDateFin(affaire.date_fin_prevue || "")
    setSelectedSite(affaire.site_id || "")
    setSelectedClient(affaire.client_id || "")
    setSelectedResponsable(affaire.responsable_id || "")
    setSelectedCompetence(affaire.competence_principale || "")
    setSelectedStatut(affaire.statut || "Brouillon")
    setTypeAffaire(affaire.type_affaire || "Forfait")
    
    if (affaire.type_affaire === "BPU") {
      setNbRessources(affaire.nb_ressources_ref || 2)
      setHeuresSemaine(affaire.heures_semaine_ref || 35)
      setPeriodeDebut(affaire.periode_debut || "")
      setPeriodeFin(affaire.periode_fin || "")
    }
  }
}
```

#### 3. Intégration de `LotsFinanciersTable` dans l'onglet "Lots financiers"

**Avant :**
```typescript
<TabsContent value="lots" className="space-y-4 mt-4">
  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
    <h3 className="font-semibold text-slate-800 mb-3">Découpage financier</h3>
    <p className="text-sm text-slate-600 mb-4">
      Définissez les lots financiers de l'affaire. Les lots seront créés après la création de l'affaire.
    </p>
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
        <div>
          <p className="font-medium text-slate-800">Lot 1 - Études</p>
          <p className="text-sm text-slate-600">Budget : 50 000 €</p>
        </div>
        <Badge variant="outline">À venir</Badge>
      </div>
      {/* ... autres lots statiques ... */}
    </div>
    <p className="text-xs text-slate-500 mt-3">
      💡 Vous pourrez ajouter et gérer les lots après la création de l'affaire
    </p>
  </div>
</TabsContent>
```

**Après :**
```typescript
<TabsContent value="lots" className="space-y-4 mt-4">
  {affaireId ? (
    <LotsFinanciersTable affaireId={affaireId} />
  ) : (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
      <h3 className="font-semibold text-slate-800 mb-3">Découpage financier</h3>
      <p className="text-sm text-slate-600 mb-4">
        Définissez les lots financiers de l'affaire. Les lots seront créés après la création de l'affaire.
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 flex items-center gap-2">
          <span className="text-blue-600">💡</span>
          Vous pourrez ajouter et gérer les lots après la création de l'affaire
        </p>
      </div>
    </div>
  )}
</TabsContent>
```

---

## ✅ Résultats

### En mode création (sans `affaireId`) :
- ✅ Message informatif : "Vous pourrez ajouter et gérer les lots après la création de l'affaire"
- ✅ Pas de gestion des lots (normal, l'affaire n'existe pas encore)

### En mode modification (avec `affaireId`) :
- ✅ **Champs pré-remplis** : Site, Client, Responsable, Compétence, etc.
- ✅ **Gestion complète des lots** :
  - Bouton "Ajouter un lot"
  - Boutons modifier (icône crayon) et supprimer (icône poubelle) pour chaque lot
  - Affichage des montants, modes de facturation, échéances
  - Badges de statut (À venir, À échéance, En retard)
  - Total des lots financiers

---

## 🧪 Test

### Test 1 : Modification d'une affaire existante

1. Aller sur la page **Affaires**
2. Cliquer sur une affaire existante (bouton "Voir détails")
3. Cliquer sur **"Modifier l'affaire"**
4. **Vérifier :**
   - ✅ Tous les champs sont pré-remplis (Site, Client, Responsable, etc.)
   - ✅ Le message d'alerte "Champs obligatoires manquants" n'apparaît plus
   - ✅ L'onglet "Informations" affiche toutes les données

### Test 2 : Gestion des lots financiers

1. Dans le modal de modification, cliquer sur l'onglet **"Lots financiers"**
2. **Vérifier :**
   - ✅ Tableau des lots existants (si l'affaire a des lots)
   - ✅ Bouton **"Ajouter un lot"** visible et actif
   - ✅ Pour chaque lot : boutons **Modifier** et **Supprimer** actifs
3. **Tester l'ajout :**
   - Cliquer sur "Ajouter un lot"
   - Remplir le formulaire (Libellé, Montant HT, Échéance prévue)
   - Cliquer sur "Valider"
   - ✅ Le lot apparaît dans le tableau
4. **Tester la modification :**
   - Cliquer sur l'icône crayon d'un lot
   - Modifier le montant
   - Cliquer sur "Valider"
   - ✅ Le lot est mis à jour
5. **Tester la suppression :**
   - Cliquer sur l'icône poubelle d'un lot
   - Confirmer la suppression
   - ✅ Le lot est supprimé du tableau

---

## 📊 Fonctionnalités disponibles dans l'onglet "Lots financiers"

| Fonctionnalité | Disponible |
|----------------|------------|
| Voir les lots existants | ✅ |
| Ajouter un lot | ✅ |
| Modifier un lot | ✅ |
| Supprimer un lot | ✅ |
| Voir le total des lots | ✅ |
| Badges de statut (échéance) | ✅ |
| Modes de facturation | ✅ |
| Numéros de commande | ✅ |

---

## 🎉 Conclusion

Le modal de modification d'affaire est maintenant **100% fonctionnel** :
- ✅ Tous les champs se rechargent correctement
- ✅ Gestion complète des lots financiers
- ✅ Expérience utilisateur fluide et intuitive
- ✅ Validation des champs obligatoires fonctionnelle

