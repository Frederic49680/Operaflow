# 📊 DONNÉES DE TEST - Module Terrain

---

## ✅ CE QUI A ÉTÉ CRÉÉ

### Migration SQL : `016_seed_data_test.sql`

**Contenu :**
- ✅ 4 sites de test
- ✅ 4 ressources (responsables)
- ✅ 4 clients
- ✅ 4 affaires avec lots financiers
- ✅ 11 lots financiers
- ✅ 16 tâches planifiées
- ✅ 2 remontées terrain

---

## 🏢 SITES DE TEST

| Code | Nom | Statut |
|------|-----|--------|
| E-03A | Site E-03A - Poste HTA | Actif |
| DAM | Site DAM - Dépôt Atelier Maintenance | Actif |
| PDC_FBA | Site PDC_FBA - Poste de Commande | Actif |
| SITE-TEST | Site de test générique | Actif |

---

## 👥 RESSOURCES DE TEST

| Nom | Prénom | Site | Email | Compétences |
|-----|--------|------|-------|-------------|
| Dupont | Jean | E-03A | jean.dupont@operaflow.fr | IEG, Planification |
| Martin | Sophie | DAM | sophie.martin@operaflow.fr | Maintenance, IEG |
| Bernard | Pierre | PDC_FBA | pierre.bernard@operaflow.fr | AUTO, Planification |
| Dubois | Marie | SITE-TEST | marie.dubois@operaflow.fr | IEG, AUTO, Maintenance |

---

## 🏢 CLIENTS DE TEST

| Nom | Catégorie | Email |
|-----|-----------|-------|
| EDF Réseaux | MOA | contact@edf.fr |
| Enedis | MOA | contact@enedis.fr |
| RTE | MOA | contact@rte-france.com |
| Client Test | Autre | test@client.fr |

---

## 📋 AFFAIRES DE TEST

### 1. AFF-2025-001 - Poste HTA (E-03A)
- **Client :** EDF Réseaux
- **Responsable :** Jean Dupont
- **Type :** Forfait
- **Montant :** 150 000 €
- **Statut :** Planifiée
- **Période :** -10 jours → +30 jours
- **3 lots :** Préparation, Exécution, Contrôle
- **5 tâches :** 2 terminées, 1 en cours, 2 non lancées

### 2. AFF-2025-002 - Maintenance DAM
- **Client :** Enedis
- **Responsable :** Sophie Martin
- **Type :** Régie
- **Montant :** 85 000 €
- **Statut :** En suivi
- **Période :** -20 jours → +15 jours
- **2 lots :** Maintenance préventive, Maintenance corrective
- **4 tâches :** 2 terminées, 1 en cours, 1 non lancée

### 3. AFF-2025-003 - Installation PDC_FBA
- **Client :** RTE
- **Responsable :** Pierre Bernard
- **Type :** Forfait
- **Montant :** 200 000 €
- **Statut :** Planifiée
- **Période :** -5 jours → +45 jours
- **3 lots :** Installation, Mise en service, Formation
- **2 tâches :** 1 en cours, 1 non lancée

### 4. AFF-2025-004 - Site de test
- **Client :** Client Test
- **Responsable :** Marie Dubois
- **Type :** Forfait
- **Montant :** 120 000 €
- **Statut :** En suivi
- **Période :** -15 jours → +25 jours
- **3 lots :** Études, Réalisation, Tests
- **4 tâches :** 1 terminée, 1 en cours, 2 non lancées

---

## 📊 STATISTIQUES

### Tâches par statut
- 🟢 **Terminées :** 5 tâches
- 🔵 **En cours :** 4 tâches
- 🟡 **Non lancées :** 7 tâches

### Tâches par site
- **E-03A :** 5 tâches
- **DAM :** 4 tâches
- **PDC_FBA :** 2 tâches
- **SITE-TEST :** 4 tâches

### Affaires par statut
- 🟢 **Planifiées :** 2 affaires (AFF-2025-001, AFF-2025-003)
- 🔵 **En suivi :** 2 affaires (AFF-2025-002, AFF-2025-004)

---

## 🚀 UTILISATION

### 1. Exécuter la migration SQL
```sql
-- Dans Supabase Dashboard → SQL Editor
-- Exécuter :
016_seed_data_test.sql
```

### 2. Vérifier les données
```sql
-- Vérifier les affaires
SELECT * FROM affaires ORDER BY code_affaire;

-- Vérifier les tâches
SELECT * FROM planning_taches ORDER BY date_debut_plan;

-- Vérifier les remontées
SELECT * FROM remontee_site;
```

### 3. Ouvrir la page terrain/remontee
```bash
# Ouvrir dans le navigateur
http://localhost:3000/terrain/remontee

# Vérifier :
- [ ] La liste des affaires s'affiche (4 affaires)
- [ ] Les statistiques sont visibles
- [ ] Le bouton "Blocage général" est visible
```

### 4. Tester les tuiles interactives
```bash
# Actions :
1. Cliquer sur une affaire (ex: AFF-2025-001)
2. Voir les tuiles des tâches (5 tuiles)
3. Vérifier les différents statuts :
   - 🟢 Terminées (2 tâches)
   - 🔵 En cours (1 tâche)
   - 🟡 Non lancées (2 tâches)
4. Tester le changement de statut
5. Tester l'ajout de commentaires
```

---

## 🎨 VISUALISATION ATTENDUE

### Liste des affaires
```
┌─────────────────────────────────────────────────────────────┐
│ AFF-2025-001 - Poste HTA                                    │
│ E-03A | Jean Dupont | 45% | 5 tâches | En cours            │
│ [Ouvrir]                                                     │
├─────────────────────────────────────────────────────────────┤
│ AFF-2025-002 - Maintenance DAM                              │
│ DAM | Sophie Martin | 60% | 4 tâches | En cours            │
│ [Ouvrir]                                                     │
├─────────────────────────────────────────────────────────────┤
│ AFF-2025-003 - Installation PDC_FBA                         │
│ PDC_FBA | Pierre Bernard | 70% | 2 tâches | En cours       │
│ [Ouvrir]                                                     │
├─────────────────────────────────────────────────────────────┤
│ AFF-2025-004 - Site de test                                 │
│ SITE-TEST | Marie Dubois | 35% | 4 tâches | En cours       │
│ [Ouvrir]                                                     │
└─────────────────────────────────────────────────────────────┘
```

### Tuiles des tâches (exemple AFF-2025-001)
```
┌─────────────────────────────────────────────────────────────┐
│ 🔵 En cours — Jour 2/7                                      │
│ ─────────────────────────────────────────────────────────── │
│ 📍 Site : E-03A | 👷 Jean Dupont                            │
│ 🕒 18/01 → 25/01                                            │
│ ⏱️ Avancement : 45%                                         │
│ ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ [ 🟢 Terminer ] [ ⚫ Suspendre ] [ 🟣 Prolonger ]          │
│ ─────────────────────────────────────────────────────────── │
│ 💬 "Travail normal, zone dégagée"                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 MAINTENANCE DES DONNÉES

### Supprimer toutes les données de test
```sql
-- ATTENTION : Supprime toutes les données de test
DELETE FROM remontee_site;
DELETE FROM planning_taches;
DELETE FROM affaires_lots;
DELETE FROM affaires;
DELETE FROM clients;
DELETE FROM ressources;
DELETE FROM sites;
```

### Réinitialiser les données de test
```sql
-- Réexécuter la migration
-- Dans Supabase Dashboard → SQL Editor
-- Exécuter :
016_seed_data_test.sql
```

---

## ✅ VALIDATION

### Checklist
- ✅ 4 sites créés
- ✅ 4 ressources créées
- ✅ 4 clients créés
- ✅ 4 affaires créées
- ✅ 11 lots créés
- ✅ 16 tâches créées
- ✅ 2 remontées créées
- ✅ Données cohérentes
- ✅ Documentation créée

---

## 🎉 CONCLUSION

**Les données de test sont prêtes !**

✅ Migration SQL créée
✅ 4 affaires avec lots et tâches
✅ Données cohérentes et réalistes
✅ Documentation complète

**Tu peux maintenant voir le rendu de la page terrain/remontee ! 🚀**

---

**Date :** 2025-01-18
**Version :** 1.0
**Statut :** ✅ PRÊT

🎉 **LES DONNÉES DE TEST SONT PRÊTES !** 🎉

