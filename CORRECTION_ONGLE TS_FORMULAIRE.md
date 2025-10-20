# 🔧 Correction - Données effacées lors du changement d'onglet

## Date : 20/10/2025

---

## ❌ Problème rencontré

Lors de la création d'une affaire, quand on change d'onglet de "Informations" à "Lots financiers", les données saisies dans l'onglet "Informations" sont **effacées**.

### Cause

Les champs du formulaire utilisaient `defaultValue` au lieu de `value` contrôlés. Quand on change d'onglet, le composant se re-render et les valeurs saisies sont perdues car elles n'étaient pas stockées dans des états React.

```typescript
// ❌ AVANT - Les valeurs sont perdues lors du changement d'onglet
<Input
  name="nom"
  defaultValue={affaireData?.nom}  // ❌ defaultValue ne persiste pas
/>
```

---

## ✅ Solution appliquée

### 1. Ajout d'états pour tous les champs

```typescript
// États pour les valeurs des Input
const [nom, setNom] = useState<string>("")
const [codeAffaire, setCodeAffaire] = useState<string>("")
const [numCommande, setNumCommande] = useState<string>("")
const [montant, setMontant] = useState<string>("")
const [dateDebut, setDateDebut] = useState<string>("")
const [dateFin, setDateFin] = useState<string>("")
```

### 2. Modification des Input pour utiliser value et onChange

```typescript
// ✅ APRÈS - Les valeurs persistent lors du changement d'onglet
<Input
  name="nom"
  value={nom}
  onChange={(e) => setNom(e.target.value)}
/>
```

### 3. Modification de handleSubmit pour utiliser les états

```typescript
// ✅ Utiliser les états au lieu de FormData
const data = {
  code_affaire: codeAffaire,
  nom: nom,
  site_id: selectedSite,
  responsable_id: selectedResponsable,
  client_id: selectedClient,
  competence_principale: selectedCompetence,
  num_commande: numCommande,
  type_affaire: typeAffaire,
  montant_total_ht: montant ? parseFloat(montant) : null,
  date_debut: typeAffaire === "BPU" ? periodeDebut : dateDebut,
  date_fin_prevue: typeAffaire === "BPU" ? periodeFin : dateFin,
  statut: selectedStatut,
}
```

### 4. Réinitialisation des états quand le modal se ferme

```typescript
// Réinitialiser les états quand le modal se ferme
useEffect(() => {
  if (!open) {
    setNom("")
    setCodeAffaire("")
    setNumCommande("")
    setMontant("")
    setDateDebut("")
    setDateFin("")
    setSelectedSite("")
    setSelectedClient("")
    setSelectedResponsable("")
    setSelectedCompetence("")
    setSelectedStatut("Brouillon")
    setTypeAffaire("Forfait")
    setNbRessources(2)
    setHeuresSemaine(35)
    setPeriodeDebut("")
    setPeriodeFin("")
    setAffaireData(null)
  }
}, [open])
```

### 5. Chargement des données en mode édition

```typescript
// Charger les données de l'affaire en mode édition
useEffect(() => {
  if (!open || !affaireId) return
  
  const loadAffaire = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('affaires')
      .select('*')
      .eq('id', affaireId)
      .single()
    
    if (data && !error) {
      // Pré-remplir tous les champs avec les données
      setNom(data.nom || "")
      setCodeAffaire(data.code_affaire || "")
      // ... etc
    }
  }
  
  loadAffaire()
}, [open, affaireId])
```

---

## 📋 Champs modifiés

| Champ | État | Fonction |
|-------|------|----------|
| Nom | `nom` | `setNom` |
| Code affaire | `codeAffaire` | `setCodeAffaire` |
| N° commande | `numCommande` | `setNumCommande` |
| Montant | `montant` | `setMontant` |
| Date début | `dateDebut` | `setDateDebut` |
| Date fin | `dateFin` | `setDateFin` |
| Site | `selectedSite` | `setSelectedSite` |
| Client | `selectedClient` | `setSelectedClient` |
| Responsable | `selectedResponsable` | `setSelectedResponsable` |
| Compétence | `selectedCompetence` | `setSelectedCompetence` |
| Statut | `selectedStatut` | `setSelectedStatut` |

---

## 🧪 Test

Vous pouvez maintenant tester :

1. Aller sur `/affaires`
2. Cliquer sur "Nouvelle affaire"
3. Remplir l'onglet "Informations" :
   - Nom de l'affaire
   - Code affaire
   - Site, Client, Responsable
   - Montant
   - Dates
4. **Changer d'onglet** vers "Lots financiers"
5. **Revenir** à l'onglet "Informations"

**Résultat attendu :**
- ✅ Toutes les données saisies sont **conservées**
- ✅ Les valeurs sont **toujours visibles**
- ✅ Le formulaire fonctionne correctement

---

## 📖 Documentation

### Pourquoi defaultValue ne fonctionne pas avec les onglets ?

`defaultValue` ne fonctionne qu'au premier rendu du composant. Quand on change d'onglet, le composant se re-render et les valeurs saisies sont perdues car elles ne sont pas stockées dans des états React.

**Solution :** Utiliser des états React (`useState`) pour gérer toutes les valeurs, puis utiliser `value` et `onChange` pour les champs.

### Pattern à suivre pour les formulaires avec onglets

```typescript
// 1. Créer des états pour tous les champs
const [field1, setField1] = useState<string>("")
const [field2, setField2] = useState<string>("")

// 2. Utiliser value et onChange
<Input
  value={field1}
  onChange={(e) => setField1(e.target.value)}
/>

// 3. Utiliser les états dans la soumission
const data = {
  field1: field1,
  field2: field2,
}

// 4. Réinitialiser les états quand le modal se ferme
useEffect(() => {
  if (!open) {
    setField1("")
    setField2("")
  }
}, [open])
```

---

## ✅ Vérification

Après la correction, vérifiez que :

1. ✅ Les données persistent lors du changement d'onglet
2. ✅ Les valeurs sont correctement envoyées à l'API
3. ✅ L'affaire est créée avec succès
4. ✅ Le formulaire est réinitialisé après fermeture

---

**Le formulaire est maintenant corrigé et fonctionne correctement !** 🚀

