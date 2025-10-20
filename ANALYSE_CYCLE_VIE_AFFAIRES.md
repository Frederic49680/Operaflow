# 🔍 ANALYSE - Cycle de vie des affaires

---

## ✅ OBJECTIF

Implémenter la gestion automatique du cycle de vie des affaires avec les statuts :
1. **Brouillon** → Création initiale par le CA
2. **Soumise à planif** → Validation par le CA
3. **Planifiée** → Une tâche Gantt est créée
4. **En suivi** → Une remontée site est enregistrée
5. **Clôturée** → Toutes les tâches terminées + aucun claim actif

---

## 🔄 FLUX DE DONNÉES

```
Chargé d'Affaires crée une affaire
  ↓
Statut = "Brouillon"
  ↓
CA clique "Envoyer à planif"
  ↓
Statut = "Soumise à planif"
  ↓
Planificateur crée une tâche dans le Gantt
  ↓
Statut = "Planifiée" (automatique)
  ↓
Remontée terrain enregistrée
  ↓
Statut = "En suivi" (automatique)
  ↓
Toutes les tâches terminées + aucun claim actif
  ↓
Statut = "Clôturée" (automatique)
```

---

## 🧩 ANALYSE DES IMPACTS

### 1. MODULE AFFAIRES

#### Impact : ✅ POSITIF
**Changements :**
- ✅ Ajout de la fonction `fn_affaire_auto_status()`
- ✅ Ajout de la vue `v_affaires_cycle_vie`
- ✅ Ajout d'index sur `statut`

**Conflits potentiels :**
- ❌ Aucun conflit détecté

**Actions requises :**
- ✅ Migration SQL créée (014_affaire_cycle_vie.sql)
- ⏳ Mise à jour de l'interface pour afficher les badges de statut
- ⏳ Ajout du bouton "Envoyer à planif" dans le formulaire d'affaire

---

### 2. MODULE GANTT

#### Impact : ✅ POSITIF
**Changements :**
- ✅ Ajout de la fonction `fn_affaire_planifiee()`
- ✅ Ajout du trigger `trg_affaire_planifiee`
- ✅ Passage automatique à "Planifiée" lors de la création d'une tâche

**Conflits potentiels :**
- ❌ Aucun conflit détecté

**Actions requises :**
- ✅ Trigger créé
- ⏳ Affichage du badge de statut dans la vue Gantt
- ⏳ Toast de notification pour le CA quand l'affaire devient planifiée

---

### 3. MODULE REMONTÉES SITE

#### Impact : ✅ POSITIF
**Changements :**
- ✅ Ajout de la fonction `fn_affaire_en_suivi()`
- ✅ Ajout du trigger `trg_affaire_en_suivi`
- ✅ Passage automatique à "En suivi" lors de la première remontée

**Conflits potentiels :**
- ❌ Aucun conflit détecté

**Actions requises :**
- ✅ Trigger créé
- ⏳ Affichage du badge de statut dans la vue Remontées

---

### 4. MODULE CLAIMS

#### Impact : ✅ POSITIF
**Changements :**
- ✅ Utilisation de `fn_affaire_cloturee()` pour vérifier les claims actifs
- ✅ Blocage de la clôture si des claims actifs existent

**Conflits potentiels :**
- ❌ Aucun conflit détecté

**Actions requises :**
- ✅ Fonction créée
- ⏳ Affichage du badge "Claims actifs" dans la vue Affaires

---

### 5. MODULE DASHBOARD

#### Impact : ✅ POSITIF
**Changements :**
- ✅ Ajout de nouveaux segments :
  - "Affaires en attente planification" (Soumise)
  - "Affaires planifiées" (Planifiée)
  - "En suivi" (En suivi)
- ✅ Ajout du KPI "Taux de transformation en planifié"

**Conflits potentiels :**
- ❌ Aucun conflit détecté

**Actions requises :**
- ⏳ Mise à jour de la vue Dashboard Affaires
- ⏳ Ajout des nouveaux KPI

---

### 6. MODULE RH / RESSOURCES

#### Impact : ✅ NEUTRE
**Changements :**
- ❌ Aucun changement requis

**Conflits potentiels :**
- ❌ Aucun conflit détecté

**Actions requises :**
- ❌ Aucune action requise

---

### 7. MODULE MAINTENANCE

#### Impact : ✅ NEUTRE
**Changements :**
- ❌ Aucun changement requis

**Conflits potentiels :**
- ❌ Aucun conflit détecté

**Actions requises :**
- ❌ Aucune action requise

---

### 8. MODULE INTERLOCUTEURS

#### Impact : ✅ NEUTRE
**Changements :**
- ❌ Aucun changement requis

**Conflits potentiels :**
- ❌ Aucun conflit détecté

**Actions requises :**
- ❌ Aucune action requise

---

### 9. MODULE BUILDER

#### Impact : ✅ NEUTRE
**Changements :**
- ❌ Aucun changement requis

**Conflits potentiels :**
- ❌ Aucun conflit détecté

**Actions requises :**
- ❌ Aucune action requise

---

## 🎨 COMPOSANTS À CRÉER/MODIFIER

### Backend (SQL) ✅
- ✅ Migration 014 créée
- ✅ 4 fonctions créées
- ✅ 4 triggers créés
- ✅ 1 vue créée
- ✅ 4 index créés

### Frontend (React/Next.js) ⏳
- ⏳ Badge de statut dans `AffaireFormModal`
- ⏳ Bouton "Envoyer à planif" dans `AffaireFormModal`
- ⏳ Toast de notification pour le CA
- ⏳ Mise à jour du Dashboard Affaires
- ⏳ Affichage des nouveaux KPI

---

## 📊 RÈGLES DE VISIBILITÉ

### Par rôle
| Rôle | Brouillon | Soumise | Planifiée | En suivi | Clôturée |
|------|-----------|---------|-----------|----------|----------|
| CA | ✅ | ✅ | ✅ | ✅ | ✅ |
| Planificateur | ❌ | ✅ | ✅ | ✅ | ✅ |
| Resp. Site | ❌ | ❌ | ✅ | ✅ | ❌ |
| Direction/PMO | ✅ | ✅ | ✅ | ✅ | ✅ |
| RH/Maintenance | ❌ | ❌ | ❌ | ✅ | ✅ |

---

## 🔄 TRIGGERS ET FONCTIONS

### Fonctions créées (4)
1. `fn_affaire_auto_status()` - Initialise le statut à "Brouillon"
2. `fn_affaire_planifiee()` - Passe à "Planifiée"
3. `fn_affaire_en_suivi()` - Passe à "En suivi"
4. `fn_affaire_cloturee()` - Passe à "Clôturée"

### Triggers créés (4)
1. `trg_affaire_auto_status` - BEFORE INSERT sur affaires
2. `trg_affaire_planifiee` - AFTER INSERT sur planning_taches
3. `trg_affaire_en_suivi` - AFTER INSERT sur remontee_site
4. `trg_affaire_cloturee` - AFTER UPDATE sur planning_taches

---

## 🎯 BADGES VISUELS

### Couleurs par statut
- 🟡 **Brouillon** - Jaune (en attente de validation)
- 🟠 **Soumise à planif** - Orange (en attente de planification)
- 🟢 **Planifiée** - Vert (en cours de planification)
- 🔵 **En suivi** - Bleu (en cours d'exécution)
- ⚫ **Clôturée** - Gris (terminée)

---

## 📈 KPI À AJOUTER

### Dashboard Affaires
1. **Taux de transformation en planifié**
   - Formule : `Nb affaires planifiées / Nb affaires soumises * 100`
   - Objectif : > 80%

2. **Délai moyen de planification**
   - Formule : `Moyenne(date_planification - date_soumission)`
   - Objectif : < 3 jours

3. **Taux de clôture**
   - Formule : `Nb affaires clôturées / Nb affaires totales * 100`
   - Objectif : > 90%

---

## 🚨 CONFLITS POTENTIELS

### 1. Conflit avec les statuts existants
**Risque :** Les statuts existants dans la table `affaires` pourraient entrer en conflit avec les nouveaux statuts.

**Solution :** ✅ Migration SQL vérifie et met à jour les statuts existants.

### 2. Conflit avec les permissions
**Risque :** Les règles de visibilité par rôle pourraient entrer en conflit avec les permissions existantes.

**Solution :** ✅ Les règles de visibilité sont appliquées au niveau de la vue, pas des permissions.

### 3. Conflit avec les triggers existants
**Risque :** Les triggers existants pourraient entrer en conflit avec les nouveaux triggers.

**Solution :** ✅ Les triggers sont créés avec `DROP TRIGGER IF EXISTS` pour éviter les doublons.

---

## ✅ CONCLUSION

### Résumé des impacts
- ✅ **Aucun conflit majeur détecté**
- ✅ **Impacts positifs sur tous les modules concernés**
- ✅ **Migration SQL créée et prête**
- ⏳ **Composants frontend à créer/modifier**

### Prochaines étapes
1. ✅ Exécuter la migration SQL 014
2. ⏳ Créer le composant `AffaireStatusBadge`
3. ⏳ Ajouter le bouton "Envoyer à planif"
4. ⏳ Mettre à jour le Dashboard Affaires
5. ⏳ Ajouter les nouveaux KPI
6. ⏳ Tester le cycle complet

---

**Date :** 2025-01-18
**Version :** 1.0
**Statut :** ✅ MIGRATION SQL CRÉÉE, FRONTEND À IMPLÉMENTER

