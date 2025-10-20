# 📖 README - Module Affaires ↔ Gantt

## 🎉 Implémentation terminée !

**Date de complétion :** 20/10/2025  
**Statut :** ✅ Phase 1 & 2 TERMINÉES

---

## 📋 Vue d'ensemble

Ce module permet de gérer la transition entre les affaires, le Gantt et la facturation. Il inclut :

- ✅ Gestion des lots financiers
- ✅ Déclaration de planification
- ✅ Création automatique de jalons
- ✅ Alertes de facturation

---

## 🗂️ Structure du projet

### Backend (Supabase)

```
supabase/migrations/
├── 032_create_affaires_lots_financiers.sql
├── 033_update_affaires_statuts_simple.sql
├── 034_update_planning_taches_jalons.sql
└── 035_functions_affaires_gantt.sql
```

### Frontend (Next.js)

```
app/api/affaires/
├── lots/route.ts
├── a-planifier/route.ts
└── declare-planification/route.ts

components/affaires/
├── LotsFinanciersTable.tsx
├── LotFormModal.tsx
├── DeclarePlanificationModal.tsx
├── FacturationAlert.tsx
└── AffaireDetailModal.tsx (modifié)

components/gantt/
└── GanttPendingCard.tsx

app/
├── gantt/page.tsx (modifié)
└── affaires/page.tsx
```

---

## 🚀 Démarrage rapide

### 1. Vérifier les migrations

```bash
# Les migrations 032, 033, 034, 035 doivent être appliquées
# Vérifier dans Supabase Dashboard > Database > Migrations
```

### 2. Démarrer le serveur

```bash
npm run dev
```

### 3. Accéder à l'application

```
http://localhost:3000
```

---

## 📖 Guide d'utilisation

### 1. Créer un lot financier

1. Aller sur **Affaires** (`/affaires`)
2. Cliquer sur une affaire
3. Aller dans l'onglet **"Lots financiers"**
4. Cliquer sur **"Ajouter un lot"**
5. Remplir le formulaire :
   - Libellé du lot
   - Montant HT
   - Mode de facturation (À l'avancement / À la réception / Échéancier)
   - Échéance prévue
   - N° commande (optionnel)
   - Commentaire (optionnel)
6. Cliquer sur **"Créer"**

### 2. Déclarer la planification

1. Aller sur **Gantt** (`/gantt`)
2. Cliquer sur l'onglet **"En attente"**
3. Voir les affaires avec des lots financiers
4. Cliquer sur **"Déclarer la planification"**
5. Remplir :
   - Date de début
   - Date de fin
6. Cliquer sur **"Déclarer la planification"**

**Résultat :**
- ✅ Une tâche parapluie est créée
- ✅ Des jalons sont créés (1 par lot)
- ✅ L'affaire passe au statut "Validée"

### 3. Suivre les jalons

1. Aller sur **Gantt** (`/gantt`)
2. Cliquer sur l'onglet **"Vue Gantt"**
3. Voir les jalons sous la tâche parapluie
4. Mettre à jour l'avancement des jalons

**Quand un jalon atteint 100% :**
- ✅ Une alerte de facturation apparaît
- ✅ Le Chargé d'Affaires est notifié

---

## 🔧 Configuration

### Variables d'environnement

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://rrmvejpwbkwlmyjhnxaz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Base de données

Les migrations créent automatiquement :
- Table `affaires_lots_financiers`
- Colonnes dans `planning_taches`
- Fonctions PostgreSQL
- Triggers
- Vues

---

## 📊 Modèle de données

### Table `affaires_lots_financiers`

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | Identifiant unique |
| affaire_id | uuid | FK vers affaires |
| libelle | text | Libellé du lot |
| montant_ht | numeric | Montant HT |
| mode_facturation | text | Mode de facturation |
| echeance_prevue | date | Échéance prévue |
| numero_commande | text | N° commande client |
| commentaire | text | Commentaire |

### Colonnes ajoutées à `planning_taches`

| Colonne | Type | Description |
|---------|------|-------------|
| lot_financier_id | uuid | FK vers affaires_lots_financiers |
| type | text | Type (tache, jalon) |
| is_parapluie_bpu | boolean | Tâche parapluie BPU |
| requiert_reception | boolean | Requiert réception |
| montant | numeric | Montant associé |

---

## 🧪 Tests

### Tests Backend

```bash
# Exécuter le script de test SQL
psql -h rrmvejpwbkwlmyjhnxaz.supabase.co -U postgres -d postgres -f test_affaires_gantt.sql
```

### Tests Frontend

1. Ouvrir http://localhost:3000/affaires
2. Créer un lot
3. Aller sur http://localhost:3000/gantt
4. Déclarer la planification
5. Vérifier les jalons

### Tests API

```bash
# Tester l'API des lots
curl -X GET "http://localhost:3000/api/affaires/lots?affaire_id={affaire_id}"

# Tester l'API des affaires en attente
curl -X GET "http://localhost:3000/api/affaires/a-planifier"

# Tester la déclaration de planification
curl -X POST "http://localhost:3000/api/affaires/declare-planification" \
  -H "Content-Type: application/json" \
  -d '{"affaire_id": "{affaire_id}", "date_debut": "2025-11-01", "date_fin": "2025-12-31"}'
```

---

## 🐛 Dépannage

### Les affaires en attente ne s'affichent pas

```sql
-- Vérifier que des affaires ont le statut 'A_planifier'
SELECT COUNT(*) FROM affaires WHERE statut = 'A_planifier';
```

### Les lots ne s'affichent pas

```sql
-- Vérifier que des lots existent
SELECT COUNT(*) FROM affaires_lots_financiers;
```

### Les jalons ne sont pas créés

```sql
-- Vérifier que la fonction existe
SELECT routine_name FROM information_schema.routines WHERE routine_name = 'fn_create_jalons_from_lots';
```

### Erreur 500 sur les API

```bash
# Vérifier les logs du serveur
# Vérifier les variables d'environnement
cat .env.local
```

---

## 📚 Documentation

### Fichiers de documentation

- `README_AFFAIRES_GANTT.md` : Ce fichier
- `CHECK_FONCTIONNALITES_AFFAIRES_GANTT.md` : Checklist détaillée
- `RESUME_FINAL_AFFAIRES_GANTT.md` : Résumé complet
- `COMMANDES_TEST_AFFAIRES_GANTT.md` : Commandes de test
- `PLAN_IMPL_AFFAIRES_GANTT.md` : Plan d'implémentation
- `PHASE_1_TERMINEE.md` : Résumé Phase 1

### Scripts de test

- `test_affaires_gantt.sql` : Script de test SQL

---

## 🎯 Fonctionnalités

### ✅ Implémentées

- [x] Création de lots financiers
- [x] Modification de lots financiers
- [x] Suppression de lots financiers
- [x] Affichage des affaires en attente
- [x] Déclaration de planification
- [x] Création automatique de jalons
- [x] Affichage des jalons dans le Gantt
- [x] Alerte de facturation

### 🔜 À venir

- [ ] Export des lots en CSV/Excel
- [ ] Historique des modifications
- [ ] Validation des échéances
- [ ] Filtrage des jalons
- [ ] Style différent pour les jalons (diamant)

---

## 👥 Contribution

### Ajout de nouvelles fonctionnalités

1. Créer une branche Git
2. Développer la fonctionnalité
3. Tester la fonctionnalité
4. Créer une pull request

### Rapporter un bug

1. Ouvrir une issue sur GitHub
2. Décrire le problème
3. Ajouter des captures d'écran si nécessaire

---

## 📞 Support

Pour toute question ou problème :
- 📧 Email : support@operaflow.com
- 💬 Slack : #operaflow-support
- 📖 Documentation : https://docs.operaflow.com

---

## 📜 Licence

Copyright © 2025 OperaFlow. Tous droits réservés.

---

**Version :** 1.0  
**Dernière mise à jour :** 20/10/2025  
**Statut :** ✅ Production Ready

