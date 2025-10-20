# 📥📤 Guide Import/Export Affaires

## 🎯 Fonctionnalités

### ✅ Export CSV
- Exporte toutes les affaires (ou filtrées selon les critères actifs)
- Format compatible Excel avec BOM UTF-8
- Colonnes : Code Affaire, Nom, Client, Site, Responsable, N° Commande, Type Contrat, Montant HT, Statut, Avancement %

### ✅ Import CSV
- Import en masse d'affaires depuis un fichier CSV
- Upsert par `code_affaire` (crée ou met à jour)
- Mapping automatique des références (Site, Responsable, Client)
- Validation et compteurs de succès/erreurs

---

## 📋 Format CSV

### Colonnes obligatoires
```csv
Code Affaire,Nom,Client,Site,Responsable,N° Commande,Type Contrat,Montant HT,Statut,Avancement %
```

### Colonnes optionnelles
- **N° Commande** : Peut être vide
- **Montant HT** : Défaut = 0
- **Statut** : Défaut = "Brouillon"
- **Avancement %** : Défaut = 0

---

## 🔧 Utilisation

### 1️⃣ Export

#### Étape 1 : Filtrer (optionnel)
```
[Rechercher...] [Filtres] [Masquer clôturées] [Exporter]
```

#### Étape 2 : Cliquer "Exporter"
- Génère un fichier `affaires_YYYY-MM-DD_HH-MM-SS.csv`
- Téléchargement automatique

#### Étape 3 : Ouvrir dans Excel
- Le fichier s'ouvre directement dans Excel
- Toutes les données sont formatées correctement

---

### 2️⃣ Import

#### Étape 1 : Préparer le CSV
Utilise le fichier `exemple_import_affaires.csv` comme modèle :

```csv
Code Affaire,Nom,Client,Site,Responsable,N° Commande,Type Contrat,Montant HT,Statut,Avancement %
AFF-2025-001,Modernisation poste HTA,EDF Réseaux,E-03A,Jean Dupont,CMD-2025-001,Forfait,150000,Validée,0
AFF-2025-002,Installation CTA-2,Engie,DAM,Marc Leroy,CMD-2025-002,Régie,85000,En cours,45
```

#### Étape 2 : Vérifier les références
**IMPORTANT** : Les valeurs suivantes doivent exister dans la base :
- **Client** : Nom exact du client dans la table `clients`
- **Site** : Nom exact du site dans la table `sites`
- **Responsable** : Prénom + Nom exact du responsable dans la table `ressources`

#### Étape 3 : Cliquer "Importer"
- Sélectionne le fichier CSV
- L'import démarre automatiquement

#### Étape 4 : Vérifier les résultats
```
✅ 5 affaire(s) importée(s) avec succès !
❌ 2 affaire(s) n'ont pas pu être importée(s)
```

---

## 🔍 Mapping automatique

### Sites
```javascript
const site = sitesData?.find(s => s.nom === site_nom)
```
→ Recherche par nom exact (insensible à la casse)

### Responsables
```javascript
const responsable = ressourcesData?.find(r => 
  `${r.prenom} ${r.nom}`.trim().toLowerCase() === responsable_nom.toLowerCase()
)
```
→ Recherche par "Prénom Nom" (insensible à la casse)

### Clients
```javascript
const client = clientsData?.find(c => c.nom_client === nom_client)
```
→ Recherche par nom exact (insensible à la casse)

---

## ⚠️ Règles de validation

### Champs obligatoires
- ✅ Code Affaire
- ✅ Nom
- ✅ Client (doit exister)
- ✅ Site (doit exister)
- ✅ Responsable (doit exister)
- ✅ Type Contrat

### Valeurs par défaut
- **N° Commande** : `null` si vide
- **Type Contrat** : `"Forfait"` si vide
- **Montant HT** : `0` si vide ou invalide
- **Statut** : `"Brouillon"` si vide
- **Avancement %** : `0` si vide ou invalide

---

## 🚨 Gestion des erreurs

### Erreur 1 : Fichier vide
```
❌ Le fichier CSV est vide ou invalide
```
**Solution** : Vérifiez que le fichier contient au moins 2 lignes (en-têtes + données)

### Erreur 2 : Référence introuvable
```
❌ 3 affaire(s) n'ont pas pu être importée(s)
```
**Causes possibles** :
- Client inexistant dans la base
- Site inexistant dans la base
- Responsable inexistant dans la base
- Format du nom incorrect (prénom/nom inversés)

**Solution** : Exportez d'abord les listes de référence :
1. Exportez les clients (`/clients`)
2. Exportez les sites (`/sites`)
3. Exportez les collaborateurs (`/rh/collaborateurs`)
4. Utilisez les noms exacts dans votre CSV

### Erreur 3 : Code affaire dupliqué
```
✅ 5 affaire(s) importée(s) avec succès !
```
**Comportement** : L'upsert met à jour l'affaire existante (pas d'erreur)

---

## 📊 Exemple complet

### CSV source
```csv
Code Affaire,Nom,Client,Site,Responsable,N° Commande,Type Contrat,Montant HT,Statut,Avancement %
AFF-2025-001,Modernisation poste HTA,EDF Réseaux,E-03A,Jean Dupont,CMD-2025-001,Forfait,150000,Validée,0
AFF-2025-002,Installation CTA-2,Engie,DAM,Marc Leroy,CMD-2025-002,Régie,85000,En cours,45
```

### Résultat dans la base
```sql
SELECT code_affaire, nom, nom_client, site_nom, responsable_nom, type_contrat, montant_total_ht, statut, avancement_pct
FROM affaires
ORDER BY code_affaire;
```

| code_affaire | nom | nom_client | site_nom | responsable_nom | type_contrat | montant_total_ht | statut | avancement_pct |
|--------------|-----|------------|----------|-----------------|--------------|------------------|--------|----------------|
| AFF-2025-001 | Modernisation poste HTA | EDF Réseaux | E-03A | Jean Dupont | Forfait | 150000 | Validée | 0 |
| AFF-2025-002 | Installation CTA-2 | Engie | DAM | Marc Leroy | Régie | 85000 | En cours | 45 |

---

## 🎨 Interface

### Boutons
```
[Rechercher...] [Filtres] [Masquer clôturées] [📤 Importer] [📥 Exporter] [➕ Nouvelle affaire]
```

### Toasts
```
✅ Export CSV réussi !
✅ 5 affaire(s) importée(s) avec succès !
❌ 3 affaire(s) n'ont pas pu être importée(s)
```

---

## 🧪 Tests

### Test 1 : Export simple
1. Va sur `/affaires`
2. Clique "Exporter"
3. ✅ Le fichier CSV se télécharge
4. Ouvre-le dans Excel
5. ✅ Toutes les colonnes sont présentes

### Test 2 : Export filtré
1. Active le filtre "Masquer clôturées"
2. Clique "Exporter"
3. ✅ Le CSV ne contient pas les affaires clôturées

### Test 3 : Import réussi
1. Utilise `exemple_import_affaires.csv`
2. Clique "Importer"
3. Sélectionne le fichier
4. ✅ Toast de succès affiché
5. ✅ Les affaires apparaissent dans la liste

### Test 4 : Import avec erreurs
1. Modifie le CSV pour ajouter un client inexistant
2. Clique "Importer"
3. ✅ Toast d'erreur affiché
4. ✅ Les affaires valides sont importées

---

## 📝 Notes techniques

### Upsert
```javascript
.upsert({
  code_affaire,
  nom,
  site_id: site.id,
  responsable_id: responsable.id,
  client_id: client.id,
  num_commande: num_commande || null,
  type_contrat: type_contrat || 'Forfait',
  montant_total_ht: parseFloat(montant_ht) || 0,
  statut: statut || 'Brouillon',
  avancement_pct: parseFloat(avancement_pct) || 0
}, {
  onConflict: 'code_affaire'
})
```

### BOM UTF-8 pour Excel
```javascript
const BOM = '\uFEFF'
const csv = BOM + csvContent
```

### Rafraîchissement automatique
```javascript
loadStats()
window.dispatchEvent(new Event('affaire-created'))
```

---

## 🎯 Prochaines améliorations (optionnel)

- [ ] Import avec validation en temps réel (avant upload)
- [ ] Export avec sélection de colonnes
- [ ] Import depuis Excel (.xlsx)
- [ ] Template CSV téléchargeable
- [ ] Historique des imports/exports
- [ ] Rollback en cas d'erreur

---

**Les fonctions d'import/export sont maintenant opérationnelles !** 🚀✨

