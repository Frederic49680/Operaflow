# 📄 Pages Disponibles - OperaFlow

## 🎯 Dashboard Global
**URL** : `http://localhost:3000/dashboard-global`
**Statut** : ✅ Opérationnel
**Description** : Vue synthèse multi-modules avec KPI, graphiques et alertes

---

## 🏢 Module Sites
**URL** : `http://localhost:3000/sites`
**Statut** : ✅ Opérationnel
**Fonctionnalités** :
- ✅ CRUD complet
- ✅ Recherche et filtres
- ✅ Export/Import CSV
- ✅ Toggle sites fermés
- ✅ Statistiques (Actifs, En pause, Fermés)
- ✅ Toasts personnalisés

---

## 👥 Module RH Collaborateurs
**URL** : `http://localhost:3000/rh/collaborateurs`
**Statut** : ✅ Opérationnel
**Fonctionnalités** :
- ✅ CRUD complet
- ✅ Recherche et filtres
- ✅ Export/Import CSV
- ✅ Désactivation avec réassignation
- ✅ Statistiques (Total, Actifs, CDI, À renouveler)
- ✅ Toasts personnalisés

---

## 📅 Module RH Absences
**URL** : `http://localhost:3000/rh/absences`
**Statut** : ✅ Opérationnel
**Fonctionnalités** :
- ✅ CRUD complet
- ✅ Recherche et filtres
- ✅ Export/Import CSV
- ✅ Toggle absences passées
- ✅ Statistiques (Total, En cours, À venir)
- ✅ Alertes absences longues (>30 jours)
- ✅ Toasts personnalisés

---

## 💼 Module Affaires
**URL** : `http://localhost:3000/affaires`
**Statut** : ✅ Opérationnel
**Fonctionnalités** :
- ✅ CRUD complet
- ✅ Recherche et filtres (Site, Statut, Type)
- ✅ Export CSV
- ✅ Toggle affaires clôturées
- ✅ Statistiques (Actives, Budget, Avancement, Marge)
- ✅ Modal de confirmation personnalisé
- ✅ Toasts personnalisés

---

## 📊 Module Gantt
**URL** : `http://localhost:3000/gantt`
**Statut** : ⚠️ En développement
**Fonctionnalités** :
- ⏳ Vue Gantt interactive
- ⏳ Drag & drop
- ⏳ Affectations ressources
- ⏳ Avancement

---

## 🔧 Module Maintenance
**URL** : `http://localhost:3000/maintenance`
**Statut** : ✅ Opérationnel
**Fonctionnalités** :
- ✅ Journal du soir (14h-18h)
- ✅ Tranches horaires
- ✅ Systèmes élémentaires
- ✅ États métier
- ✅ Temps métal
- ✅ Toasts personnalisés

---

## 🎓 Module RH Formations (NOUVEAU)
**Statut** : ✅ Opérationnel (80%)

### Organismes
**URL** : `http://localhost:3000/rh/formations/organismes`
**Fonctionnalités** :
- ✅ CRUD complet
- ✅ Recherche et filtres
- ✅ Export CSV
- ✅ Toggle organismes inactifs
- ✅ Gestion domaines (multi-sélection)
- ✅ Statistiques (Total, Actifs, Inactifs)
- ✅ Toasts personnalisés

### Catalogue
**URL** : `http://localhost:3000/rh/formations/catalogue`
**Fonctionnalités** :
- ✅ CRUD complet
- ✅ Recherche et filtres (Type, Modalité)
- ✅ Export CSV
- ✅ Gestion compétences (multi-sélection)
- ✅ Badges colorés (types, modalités)
- ✅ Statistiques (Total, Habilitantes, Techniques)
- ✅ Toasts personnalisés

### Plan Prévisionnel
**URL** : `http://localhost:3000/rh/formations/plan`
**Fonctionnalités** :
- ✅ CRUD complet
- ✅ Recherche et filtres (Statut, Site)
- ✅ Export CSV
- ✅ Calcul coût prévisionnel
- ✅ Badges colorés (statuts, modalités)
- ✅ Statistiques (Total, Prévisionnel, Validé, Réalisé, Coût)
- ✅ Toasts personnalisés

### Budget Annuel
**URL** : `http://localhost:3000/rh/formations/budget`
**Fonctionnalités** :
- ✅ KPI globaux (Prévu, Réalisé, Écart, Taux)
- ✅ Graphique barres (Budget par site)
- ✅ Graphique camembert (Budget par type)
- ✅ Alerte dérive budgétaire
- ✅ Export CSV
- ✅ Toasts personnalisés

---

## ⚠️ Module Claims
**URL** : `http://localhost:3000/claims`
**Statut** : ⚠️ En développement
**Fonctionnalités** :
- ⏳ CRUD complet
- ⏳ Workflow statuts
- ⏳ Notifications

---

## 👤 Module Clients
**URL** : `http://localhost:3000/clients/interlocuteurs`
**Statut** : ⚠️ En développement
**Fonctionnalités** :
- ⏳ CRUD complet
- ⏳ Liaison affaires
- ⏳ Historique interactions

---

## 🏗️ Module Terrain
**URL** : `http://localhost:3000/terrain/remontee`
**Statut** : ⚠️ En développement
**Fonctionnalités** :
- ⏳ Remontée quotidienne
- ⏳ Tuiles interactives
- ⏳ Confirmation fin de journée

---

## 🔨 Module Builder
**URL** : `http://localhost:3000/builder`
**Statut** : ⚠️ En développement
**Fonctionnalités** :
- ⏳ Form builder
- ⏳ Masques dynamiques
- ⏳ Workflows

---

## 📊 Résumé par statut

### ✅ Opérationnel (7 pages)
- Dashboard Global
- Sites
- RH Collaborateurs
- RH Absences
- Affaires
- Maintenance
- RH Formations (4 sous-pages)

### ⚠️ En développement (5 pages)
- Gantt
- Claims
- Clients
- Terrain
- Builder

---

## 🎨 Design System

### Toasts personnalisés
- ✅ Success (vert)
- ✅ Error (rouge)
- ✅ Animation slide-in
- ✅ Auto-close 5s

### Badges
- ✅ Types formations : Habilitante (purple), Technique (green), QSE (blue), CACES (orange), SST (red)
- ✅ Modalités : Présentiel (blue), Distanciel (indigo), E-learning (cyan), Mixte (violet)
- ✅ Statuts : Prévisionnel (yellow), Validé (green), Réalisé (purple), Annulé (red)

### Graphiques
- ✅ BarChart (Recharts)
- ✅ PieChart (Recharts)
- ✅ Responsive design

---

## 📈 Statistiques

### Pages créées
- **Opérationnelles** : 11 pages
- **En développement** : 5 pages
- **Total** : 16 pages

### Modules complets
- ✅ Sites
- ✅ RH (Collaborateurs + Absences)
- ✅ Affaires
- ✅ Maintenance
- ✅ Formations (80%)

---

**Le serveur est prêt !** 🚀

Accède à `http://localhost:3000` et teste toutes les pages !

