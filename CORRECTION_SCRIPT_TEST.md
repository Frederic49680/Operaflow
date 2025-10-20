# 🔧 Correction du script de test

## Date : 20/10/2025

---

## ❌ Problème rencontré

Lors de l'exécution du script `test_affaires_gantt.sql`, une erreur s'est produite :

```
ERROR: P0001: La tâche ne peut pas se terminer après la fin prévue de l'affaire
CONTEXT: PL/pgSQL function trigger_validate_tache_dates_in_affaire()
```

### Cause

Le script utilisait des dates fixes pour déclarer la planification :
- Date début : `2025-11-01`
- Date fin : `2025-12-31`

Mais l'affaire avait une date de fin prévue antérieure à `2025-12-31`, ce qui violait le trigger `trigger_validate_tache_dates_in_affaire()`.

---

## ✅ Solution appliquée

Le script a été modifié pour utiliser les dates de l'affaire existante :

```sql
-- AVANT (dates fixes)
SELECT fn_declare_planification(
    v_affaire_id,
    '2025-11-01'::date,
    '2025-12-31'::date,
    NULL
);

-- APRÈS (dates de l'affaire)
SELECT 
    a.id,
    COALESCE(a.date_debut_prevue, CURRENT_DATE) as date_debut,
    COALESCE(a.date_fin_prevue, CURRENT_DATE + INTERVAL '3 months') as date_fin
INTO v_affaire_id, v_date_debut, v_date_fin
FROM affaires a
WHERE a.statut = 'A_planifier'
LIMIT 1;

SELECT fn_declare_planification(
    v_affaire_id,
    v_date_debut,
    v_date_fin,
    NULL
);
```

### Avantages

1. ✅ Respecte les contraintes de dates de l'affaire
2. ✅ Évite les erreurs du trigger
3. ✅ Utilise des valeurs par défaut si les dates ne sont pas définies
4. ✅ Plus flexible et robuste

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

## 🎯 Prochaines étapes

1. ✅ Réexécuter le script de test
2. ✅ Vérifier que tout fonctionne
3. ✅ Tester les fonctionnalités dans l'interface

---

**Le script est maintenant corrigé et prêt à être exécuté !** 🚀

