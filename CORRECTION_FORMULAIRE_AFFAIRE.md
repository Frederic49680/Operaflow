# 🔧 Correction du formulaire d'ajout d'affaire

## Date : 20/10/2025

---

## ❌ Problème rencontré

Lors de l'ajout d'une affaire, toutes les données envoyées étaient `null` :

```
Données à envoyer: {code_affaire: null, nom: null, site_id: null, responsable_id: null, client_id: null, …}
```

**Résultat :** Erreur 400 - "Champs obligatoires manquants"

---

## 🔍 Cause

Le composant `Select` de Radix UI ne fonctionne pas comme un champ HTML standard (`<select>`). Quand on utilise `name="site"` sur un `<Select>`, la valeur n'est **pas automatiquement ajoutée** au `FormData` lors de la soumission du formulaire.

### Code problématique

```typescript
// ❌ AVANT - Les valeurs des Select ne sont pas récupérées
const formData = new FormData(e.currentTarget)
const data = {
  site_id: formData.get("site"),        // null
  client_id: formData.get("client"),    // null
  responsable_id: formData.get("responsable"), // null
  competence_principale: formData.get("competence"), // null
  statut: formData.get("statut"),       // null
}
```

---

## ✅ Solution appliquée

### 1. Ajout d'états React pour les Select

```typescript
// États pour les valeurs des Select
const [selectedSite, setSelectedSite] = useState<string>("")
const [selectedClient, setSelectedClient] = useState<string>("")
const [selectedResponsable, setSelectedResponsable] = useState<string>("")
const [selectedCompetence, setSelectedCompetence] = useState<string>("")
const [selectedStatut, setSelectedStatut] = useState<string>("Brouillon")
```

### 2. Modification des Select pour utiliser les états

```typescript
// ✅ APRÈS - Les Select utilisent value et onValueChange
<Select 
  name="site" 
  required 
  value={selectedSite}
  onValueChange={setSelectedSite}
>
  <SelectTrigger>
    <SelectValue placeholder="Sélectionner un site" />
  </SelectTrigger>
  <SelectContent>
    {sites.map((site) => (
      <SelectItem key={site.id} value={site.id}>
        {site.code_site} - {site.nom}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### 3. Modification de handleSubmit pour utiliser les états

```typescript
// ✅ APRÈS - Utiliser les états au lieu de FormData
const data = {
  code_affaire: formData.get("code_affaire"),
  nom: formData.get("nom"),
  site_id: selectedSite,              // ✅ Utilise l'état
  responsable_id: selectedResponsable, // ✅ Utilise l'état
  client_id: selectedClient,          // ✅ Utilise l'état
  competence_principale: selectedCompetence, // ✅ Utilise l'état
  num_commande: formData.get("num_commande"),
  type_affaire: typeAffaire,
  montant_total_ht: formData.get("montant") ? parseFloat(formData.get("montant") as string) : null,
  statut: selectedStatut,             // ✅ Utilise l'état
}
```

### 4. Mise à jour des statuts

Les statuts ont été mis à jour pour correspondre aux nouveaux statuts de la base de données :
- "Brouillon" → "Brouillon"
- "Soumise" → "A_planifier" (nouveau statut)
- "Validée" → "Validee"
- "Clôturée" → "Cloturee"

---

## 📋 Selects modifiés

| Select | État | Fonction |
|--------|------|----------|
| Site | `selectedSite` | `setSelectedSite` |
| Client | `selectedClient` | `setSelectedClient` |
| Responsable | `selectedResponsable` | `setSelectedResponsable` |
| Compétence | `selectedCompetence` | `setSelectedCompetence` |
| Statut | `selectedStatut` | `setSelectedStatut` |

---

## 🧪 Test

Vous pouvez maintenant tester l'ajout d'une affaire :

1. Aller sur `/affaires`
2. Cliquer sur "Nouvelle affaire"
3. Remplir le formulaire :
   - Nom de l'affaire
   - Code affaire
   - Site (sélectionner)
   - Client (sélectionner)
   - Responsable (sélectionner)
   - Compétence (sélectionner)
   - Type d'affaire
   - Statut (sélectionner)
4. Cliquer sur "Créer"

**Résultat attendu :**
- ✅ Les valeurs des Select sont correctement envoyées
- ✅ L'affaire est créée avec succès
- ✅ Un message de succès s'affiche

---

## 📖 Documentation

### Pourquoi Radix UI Select ne fonctionne pas avec FormData ?

Radix UI `Select` est un composant contrôlé qui utilise des états React. Il ne fonctionne pas comme un `<select>` HTML natif qui ajoute automatiquement sa valeur au `FormData`.

**Solution :** Utiliser des états React (`useState`) pour gérer les valeurs des Select, puis utiliser ces états dans la fonction de soumission.

### Pattern à suivre pour les Select

```typescript
// 1. Créer un état
const [selectedValue, setSelectedValue] = useState<string>("")

// 2. Utiliser dans le Select
<Select 
  value={selectedValue}
  onValueChange={setSelectedValue}
>
  <SelectTrigger>
    <SelectValue placeholder="Sélectionner" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>

// 3. Utiliser dans la soumission
const data = {
  field: selectedValue, // ✅ Utilise l'état
}
```

---

## ✅ Vérification

Après la correction, vérifiez que :

1. ✅ Les valeurs des Select sont correctement affichées
2. ✅ Les valeurs sont bien envoyées à l'API
3. ✅ L'affaire est créée avec succès
4. ✅ Aucune erreur dans la console

---

**Le formulaire est maintenant corrigé et fonctionnel !** 🚀

