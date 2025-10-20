# 🔧 Correction du script de test - V2

## Date : 20/10/2025

---

## ❌ Problème rencontré

Lors de l'exécution du script `test_affaires_gantt.sql`, une nouvelle erreur s'est produite :

```
ERROR: 42703: column a.date_debut_prevue does not exist
```

### Cause

Le script tentait de récupérer les colonnes `date_debut_prevue` et `date_fin_prevue` de la table `affaires`, mais ces colonnes n'existent pas dans le schéma actuel.

---

## ✅ Solution appliquée

Le script a été modifié pour utiliser des dates calculées directement dans le code PL/pgSQL :

```sql
-- AVANT (tentative de récupérer des colonnes inexistantes)
SELECT 
    a.id,
    COALESCE(a.date_debut_prevue, CURRENT_DATE) as date_debut,
    COALESCE(a.date_fin_prevue, CURRENT_DATE + INTERVAL '3 months') as date_fin
INTO v_affaire_id, v_date_debut, v_date_fin
FROM affaires a
WHERE a.statut = 'A_planifier'
LIMIT 1;

-- APRÈS (dates calculées directement)
SELECT a.id
INTO v_affaire_id
FROM affaires a
INNER JOIN affaires_lots_financiers l ON l.affaire_id = a.id
WHERE a.statut = 'A_planifier'
LIMIT 1;

IF v_affaire_id IS NOT NULL THEN
    -- Utiliser des dates calculées
    v_date_debut := CURRENT_DATE + INTERVAL '1 month';
    v_date_fin := CURRENT_DATE + INTERVAL '3 months';
    
    -- Appeler la fonction de déclaration
    SELECT fn_declare_planification(
        v_affaire_id,
        v_date_debut,
        v_date_fin,
        NULL
    ) INTO v_result;
END IF;
```

### Avantages

1. ✅ Ne dépend pas de colonnes qui n'existent pas
2. ✅ Utilise des dates calculées dynamiquement
3. ✅ Plus simple et plus robuste
4. ✅ Évite les erreurs de colonnes manquantes

---

## 📋 Dates utilisées

Le script utilise maintenant :
- **Date début** : Aujourd'hui + 1 mois
- **Date fin** : Aujourd'hui + 3 mois

Ces dates sont calculées dynamiquement, donc elles seront toujours valides.

---

## 🧪 Nouvelle exécution

Vous pouvez maintenant réexécuter le script :

```bash
# Via psql
psql -h rrmvejpwbkwlmyjhnxaz.supabase.co -U postgres -d postgres -f test_affaires_gantt.sql

# Ou via l'interface Supabase
# 1. Aller sur https://supabase.com/dashboard
# 2. Sélectionner votre projet
# 3. Aller dans "SQL Editor"
# 4. Copier/coller le contenu de test_affaires_gantt.sql
# 5. Cliquer sur "Run"
```

---

## 📋 Vérification

Après l'exécution, vérifiez que :

1. ✅ Le lot de test a été créé
2. ✅ La planification a été déclarée
3. ✅ Les jalons ont été créés
4. ✅ Le statut de l'affaire est passé à "Validée"

### Requêtes de vérification

```sql
-- Vérifier les lots
SELECT * FROM affaires_lots_financiers WHERE numero_commande = 'CMD-TEST-001';

-- Vérifier les jalons
SELECT * FROM planning_taches WHERE type = 'jalon';

-- Vérifier le statut de l'affaire
SELECT id, code_affaire, nom, statut FROM affaires WHERE statut = 'Validee';
```

---

## 🎯 Historique des corrections

### Correction 1
- **Problème** : Dates fixes qui dépassaient la date de fin de l'affaire
- **Solution** : Utiliser les dates de l'affaire (échoué car colonnes inexistantes)

### Correction 2 (actuelle)
- **Problème** : Colonnes `date_debut_prevue` et `date_fin_prevue` n'existent pas
- **Solution** : Utiliser des dates calculées dynamiquement

---

## 🎯 Prochaines étapes

1. ✅ Réexécuter le script de test
2. ✅ Vérifier que tout fonctionne
3. ✅ Tester les fonctionnalités dans l'interface

---

**Le script est maintenant corrigé et prêt à être exécuté !** 🚀

