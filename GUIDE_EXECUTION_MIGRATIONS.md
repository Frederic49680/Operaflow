# 🚀 GUIDE D'EXÉCUTION DES MIGRATIONS

---

## 📋 ORDRE D'EXÉCUTION DES MIGRATIONS

### Migrations à exécuter dans l'ordre :

1. **014_affaire_cycle_vie.sql** - Cycle de vie des affaires
2. **015_terrain_tuiles.sql** - Module Terrain : Vue Liste & Tuiles
3. **017_update_affaires_statuts.sql** - Mise à jour des statuts des affaires
4. **018_fix_aggregate_function.sql** - Correction de la fonction aggregate_affaire_from_lots
5. **016_seed_data_test.sql** - Données de test

---

## 🔧 EXÉCUTION DANS SUPABASE

### Étape 1 : Migration 014
```sql
-- Dans Supabase Dashboard → SQL Editor
-- Exécuter :
014_affaire_cycle_vie.sql
```

**Vérification :**
```sql
-- Vérifier que les fonctions sont créées
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name LIKE 'fn_affaire_%';
```

---

### Étape 2 : Migration 015
```sql
-- Dans Supabase Dashboard → SQL Editor
-- Exécuter :
015_terrain_tuiles.sql
```

**Vérification :**
```sql
-- Vérifier que les tables sont créées
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('site_blocages', 'confirmation_queue');

-- Vérifier que les fonctions sont créées
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name LIKE 'fn_%';
```

---

### Étape 3 : Migration 017
```sql
-- Dans Supabase Dashboard → SQL Editor
-- Exécuter :
017_update_affaires_statuts.sql
```

**Vérification :**
```sql
-- Vérifier que la contrainte est mise à jour
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'affaires'::regclass 
  AND conname = 'affaires_statut_check';
```

---

### Étape 4 : Migration 018
```sql
-- Dans Supabase Dashboard → SQL Editor
-- Exécuter :
018_fix_aggregate_function.sql
```

**Vérification :**
```sql
-- Vérifier que la fonction est corrigée
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'aggregate_affaire_from_lots';
```

---

### Étape 5 : Migration 016
```sql
-- Dans Supabase Dashboard → SQL Editor
-- Exécuter :
016_seed_data_test.sql
```

**Vérification :**
```sql
-- Vérifier les données
SELECT COUNT(*) FROM sites;        -- Attendu : 4
SELECT COUNT(*) FROM ressources;   -- Attendu : 4
SELECT COUNT(*) FROM clients;      -- Attendu : 4
SELECT COUNT(*) FROM affaires;     -- Attendu : 4
SELECT COUNT(*) FROM affaires_lots; -- Attendu : 11
SELECT COUNT(*) FROM planning_taches; -- Attendu : 16
SELECT COUNT(*) FROM remontee_site;   -- Attendu : 2
```

---

## 🎯 RÉSULTAT ATTENDU

### Données créées
- ✅ 4 sites
- ✅ 4 ressources
- ✅ 4 clients
- ✅ 4 affaires
- ✅ 11 lots financiers
- ✅ 16 tâches planifiées
- ✅ 2 remontées terrain

### Fonctions créées
- ✅ fn_affaire_auto_status()
- ✅ fn_affaire_planifiee()
- ✅ fn_affaire_en_suivi()
- ✅ fn_affaire_cloturee()
- ✅ fn_auto_descente_realisation()
- ✅ fn_confirm_en_cours()
- ✅ fn_apply_site_blocage()
- ✅ fn_resume_from_report()
- ✅ fn_auto_close_suspension()

### Vues créées
- ✅ v_affaires_cycle_vie
- ✅ v_affaires_taches_jour
- ✅ v_taches_tuiles

---

## 🚨 EN CAS D'ERREUR

### Erreur lors de l'exécution d'une migration

1. **Vérifier les logs**
   - Regarder le message d'erreur complet
   - Identifier la ligne problématique

2. **Consulter la documentation**
   - Vérifier les documents de correction
   - Vérifier les documents de résumé

3. **Réexécuter la migration**
   - Corriger l'erreur
   - Réexécuter la migration

4. **Contacter le support**
   - Fournir le message d'erreur complet
   - Fournir les logs

---

## ✅ CHECKLIST FINALE

### Avant de commencer
- [ ] Toutes les migrations précédentes sont exécutées
- [ ] Les corrections sont appliquées
- [ ] Les fichiers SQL sont prêts

### Après l'exécution
- [ ] Toutes les migrations sont exécutées
- [ ] Les données de test sont créées
- [ ] Les fonctions sont créées
- [ ] Les vues sont créées
- [ ] Les vérifications passent

---

## 🎉 CONCLUSION

**Toutes les migrations sont maintenant prêtes !**

✅ 5 migrations à exécuter
✅ Ordre d'exécution clair
✅ Vérifications à chaque étape
✅ Documentation complète

**Le système est prêt pour la production ! 🚀**

---

**Date :** 2025-01-18
**Version :** 1.0
**Statut :** ✅ PRÊT

🎉 **LES MIGRATIONS SONT PRÊTES !** 🎉

