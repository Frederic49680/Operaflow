# 🚀 Guide de Démarrage - Module RH Formations

## 📋 Prérequis

1. ✅ Migrations SQL appliquées (027 et 028)
2. ✅ Serveur Next.js démarré
3. ✅ Connexion Supabase fonctionnelle

---

## 🔧 Installation

### 1️⃣ Appliquer les migrations SQL

**Dans Supabase SQL Editor** :

```sql
-- Migration 027 : Tables
-- Copier-coller le contenu de supabase/migrations/027_create_rh_formations.sql
-- Cliquer sur "Run"

-- Migration 028 : Vues et fonctions
-- Copier-coller le contenu de supabase/migrations/028_create_formations_views.sql
-- Cliquer sur "Run"
```

### 2️⃣ Vérifier les tables créées

Dans Supabase, aller dans **Table Editor** et vérifier :
- ✅ `organismes_formation`
- ✅ `formations_catalogue`
- ✅ `formations_tarifs`
- ✅ `formations_sessions`
- ✅ `plan_formation_ressource`
- ✅ `formations`

### 3️⃣ Vérifier les vues créées

Dans Supabase, aller dans **SQL Editor** et exécuter :
```sql
SELECT * FROM V_Budget_Formations_Annuel LIMIT 1;
SELECT * FROM V_Formation_Indispo_Planning LIMIT 1;
SELECT * FROM V_Habilitations_A_Renouveler LIMIT 1;
SELECT * FROM V_Formations_Prochaines LIMIT 1;
```

---

## 🎯 Accès aux pages

### URLs du module

| Page | URL | Description |
|------|-----|-------------|
| **Organismes** | `/rh/formations/organismes` | Gestion des organismes de formation |
| **Catalogue** | `/rh/formations/catalogue` | Catalogue des formations |
| **Plan** | `/rh/formations/plan` | Plan prévisionnel |
| **Budget** | `/rh/formations/budget` | Budget annuel |

---

## 🧪 Tests rapides

### Test 1 : Créer un organisme

1. **Aller sur** `/rh/formations/organismes`
2. **Cliquer** sur "Nouvel organisme"
3. **Remplir** :
   - Nom : "AFPA Formation"
   - SIRET : "12345678901234"
   - Contact : "Jean Dupont"
   - Email : "contact@afpa.fr"
   - Téléphone : "+33 1 23 45 67 89"
   - Adresse : "123 rue de la Formation"
   - Code Postal : "75001"
   - Ville : "Paris"
   - Domaines : Cliquer "Ajouter" pour ajouter "Électricité", "CVC"
   - Agrément : "12345678901"
4. **Cliquer** "Enregistrer"
5. ✅ Toast de succès affiché
6. ✅ Organisme apparaît dans la liste

---

### Test 2 : Créer une formation

1. **Aller sur** `/rh/formations/catalogue`
2. **Cliquer** sur "Nouvelle formation"
3. **Remplir** :
   - Code : "FORM-001"
   - Libellé : "Formation Électricité HTA"
   - Type : "Habilitante"
   - Durée (heures) : 35
   - Durée (jours) : 5
   - Validité (mois) : 36
   - Modalité : "Présentiel"
   - Organisme par défaut : Sélectionner "AFPA Formation"
   - Prérequis : "Niveau CAP minimum"
   - Compétences : Cliquer "Ajouter" pour ajouter "Électricité", "HTA"
4. **Cliquer** "Enregistrer"
5. ✅ Toast de succès affiché
6. ✅ Formation apparaît dans la liste

---

### Test 3 : Poser une semaine de formation

1. **Aller sur** `/rh/formations/plan`
2. **Cliquer** sur "Poser une semaine"
3. **Remplir** :
   - Ressource : Sélectionner une ressource active
   - Formation : Sélectionner "FORM-001 - Formation Électricité HTA"
   - Organisme : Sélectionner "AFPA Formation"
   - Semaine ISO : "2025-05"
   - Date début : 01/05/2025
   - Date fin : 05/05/2025
   - Modalité : "Présentiel"
   - Statut : "Prévisionnel"
   - Coût prévu HT : 1500
4. **Cliquer** "Enregistrer"
5. ✅ Toast de succès affiché
6. ✅ Semaine apparaît dans la liste

---

### Test 4 : Voir le budget

1. **Aller sur** `/rh/formations/budget`
2. **Vérifier** :
   - ✅ KPI affichés (Prévu, Réalisé, Écart, Taux)
   - ✅ Graphique barres (Budget par site)
   - ✅ Graphique camembert (Budget par type)
3. **Cliquer** "Exporter"
4. ✅ CSV téléchargé

---

### Test 5 : Export CSV

1. **Aller sur** `/rh/formations/organismes`
2. **Cliquer** sur "Exporter"
3. ✅ Fichier `organismes_YYYY-MM-DD.csv` téléchargé
4. **Ouvrir** dans Excel
5. ✅ Toutes les colonnes présentes
6. ✅ BOM UTF-8 correct (pas de caractères bizarres)

---

## 🎨 Fonctionnalités disponibles

### Organismes
- ✅ CRUD complet
- ✅ Recherche par nom/SIRET/contact/email
- ✅ Filtre actif/inactif
- ✅ Gestion domaines (multi-sélection)
- ✅ Export CSV
- ✅ Statistiques (Total, Actifs, Inactifs)

### Catalogue
- ✅ CRUD complet
- ✅ Recherche par code/libellé
- ✅ Filtres (Type, Modalité)
- ✅ Gestion compétences (multi-sélection)
- ✅ Export CSV
- ✅ Statistiques (Total, Habilitantes, Techniques)

### Plan Prévisionnel
- ✅ CRUD complet
- ✅ Recherche par ressource/formation/organisme
- ✅ Filtres (Statut, Site)
- ✅ Calcul coût prévisionnel
- ✅ Export CSV
- ✅ Statistiques (Total, Prévisionnel, Validé, Réalisé, Coût Total)

### Budget
- ✅ KPI globaux
- ✅ Graphique barres (Budget par site)
- ✅ Graphique camembert (Budget par type)
- ✅ Alerte dérive budgétaire
- ✅ Export CSV

---

## 🔍 Dépannage

### Erreur : "relation does not exist"
**Cause** : Migration non appliquée
**Solution** : Appliquer les migrations 027 et 028 dans Supabase

### Erreur : "permission denied"
**Cause** : RLS non configuré
**Solution** : Vérifier que les policies RLS sont créées (dans les migrations)

### Erreur : "column does not exist"
**Cause** : Vue non créée
**Solution** : Exécuter la migration 028

### Toast ne s'affiche pas
**Cause** : Composant toast manquant
**Solution** : Vérifier que `SuccessToast` et `ErrorToast` existent dans `components/ui/toast.tsx`

### Export CSV vide
**Cause** : Pas de données dans la table
**Solution** : Créer des données de test avec les formulaires

---

## 📊 Données de test

### Organismes
```sql
INSERT INTO organismes_formation (nom, siret, contact, email, telephone, domaines, actif)
VALUES 
  ('AFPA Formation', '12345678901234', 'Jean Dupont', 'contact@afpa.fr', '+33 1 23 45 67 89', ARRAY['Électricité', 'CVC'], true),
  ('CNAM', '98765432109876', 'Marie Martin', 'contact@cnam.fr', '+33 1 98 76 54 32', ARRAY['Technique', 'QSE'], true);
```

### Formations
```sql
INSERT INTO formations_catalogue (code, libelle, type_formation, duree_heures, duree_jours, validite_mois, modalite, actif)
VALUES 
  ('FORM-001', 'Formation Électricité HTA', 'Habilitante', 35, 5, 36, 'Présentiel', true),
  ('FORM-002', 'Formation CACES', 'CACES', 14, 2, 60, 'Présentiel', true),
  ('FORM-003', 'Formation SST', 'SST', 7, 1, 24, 'Présentiel', true);
```

---

## 🎯 Prochaines étapes

1. **Tester** toutes les fonctionnalités
2. **Créer** des données de test
3. **Valider** les exports CSV
4. **Vérifier** les graphiques
5. **Implémenter** les fonctionnalités manquantes :
   - ⏳ Page Sessions
   - ⏳ Page Tarifs
   - ⏳ Alertes automatiques
   - ⏳ Intégration Gantt

---

## 📞 Support

Si tu rencontres un problème :
1. Vérifier les migrations SQL
2. Vérifier les logs du serveur Next.js
3. Vérifier les logs Supabase
4. Me contacter avec les erreurs

---

**Le module est prêt à être utilisé !** 🎉

Bon test ! 🚀

