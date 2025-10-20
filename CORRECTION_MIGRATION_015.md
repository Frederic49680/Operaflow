# ✅ CORRECTION - Migration 015

---

## 🔧 PROBLÈME DÉTECTÉ

**Erreur :** `ERROR: 42P13: input parameters after one with a default value must also have defaults`

**Cause :** Dans PostgreSQL, si un paramètre de fonction a une valeur par défaut, tous les paramètres suivants doivent aussi avoir des valeurs par défaut.

**Fonction concernée :** `fn_apply_site_blocage()`

---

## ✅ SOLUTION APPLIQUÉE

### Avant (INCORRECT)
```sql
CREATE OR REPLACE FUNCTION fn_apply_site_blocage(
  p_site_id UUID DEFAULT NULL,
  p_affaire_id UUID DEFAULT NULL,
  p_cause TEXT,                    -- ❌ Pas de valeur par défaut
  p_start_at TIMESTAMPTZ,          -- ❌ Pas de valeur par défaut
  p_end_at TIMESTAMPTZ,            -- ❌ Pas de valeur par défaut
  p_scope_level TEXT               -- ❌ Pas de valeur par défaut
)
```

### Après (CORRECT)
```sql
CREATE OR REPLACE FUNCTION fn_apply_site_blocage(
  p_site_id UUID,                  -- ✅ Pas de valeur par défaut
  p_affaire_id UUID,               -- ✅ Pas de valeur par défaut
  p_cause TEXT,                    -- ✅ Pas de valeur par défaut
  p_start_at TIMESTAMPTZ,          -- ✅ Pas de valeur par défaut
  p_end_at TIMESTAMPTZ,            -- ✅ Pas de valeur par défaut
  p_scope_level TEXT               -- ✅ Pas de valeur par défaut
)
```

---

## 📋 EXPLICATION

### Règle PostgreSQL
En PostgreSQL, l'ordre des paramètres est important :
- ✅ Tous les paramètres obligatoires en premier
- ✅ Tous les paramètres avec valeurs par défaut à la fin
- ❌ On ne peut pas mélanger les deux

### Options possibles

#### Option 1 : Tous les paramètres obligatoires (CHOISI)
```sql
CREATE OR REPLACE FUNCTION fn_apply_site_blocage(
  p_site_id UUID,
  p_affaire_id UUID,
  p_cause TEXT,
  p_start_at TIMESTAMPTZ,
  p_end_at TIMESTAMPTZ,
  p_scope_level TEXT
)
```
**Avantages :**
- ✅ Simple et clair
- ✅ Tous les paramètres sont fournis par l'API
- ✅ Pas de confusion

#### Option 2 : Tous les paramètres avec valeurs par défaut
```sql
CREATE OR REPLACE FUNCTION fn_apply_site_blocage(
  p_site_id UUID DEFAULT NULL,
  p_affaire_id UUID DEFAULT NULL,
  p_cause TEXT DEFAULT '',
  p_start_at TIMESTAMPTZ DEFAULT NOW(),
  p_end_at TIMESTAMPTZ DEFAULT NOW(),
  p_scope_level TEXT DEFAULT 'site'
)
```
**Inconvénients :**
- ❌ Complexe
- ❌ Pas nécessaire car tous les paramètres sont fournis par l'API

---

## 🚀 PROCHAINES ÉTAPES

### 1. Exécuter la migration SQL corrigée
```sql
-- Dans Supabase Dashboard → SQL Editor
-- Exécuter :
015_terrain_tuiles.sql
```

### 2. Vérifier les fonctions
```sql
-- Vérifier que la fonction est créée correctement
SELECT 
  routine_name,
  routine_type,
  specific_name
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'fn_apply_site_blocage';
```

### 3. Tester la fonction
```sql
-- Tester avec un appel complet
SELECT fn_apply_site_blocage(
  'site-uuid',
  'affaire-uuid',
  'Grève',
  '2025-01-20 08:00:00',
  '2025-01-22 18:00:00',
  'site'
);
```

---

## ✅ VALIDATION

### Checklist
- ✅ Valeurs par défaut supprimées
- ✅ Tous les paramètres sont obligatoires
- ✅ Fonction compatible avec l'appel depuis l'API
- ✅ Documentation mise à jour

---

## 📚 RÉFÉRENCES

### Documentation PostgreSQL
- [CREATE FUNCTION - Parameters](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [42P13 - Invalid Parameter Value](https://www.postgresql.org/docs/current/errcodes-appendix.html)

### Règle à retenir
> **En PostgreSQL, si un paramètre a une valeur par défaut, tous les paramètres suivants doivent aussi avoir des valeurs par défaut.**

---

**Date :** 2025-01-18  
**Version :** 1.2  
**Statut :** ✅ CORRIGÉ ET PRÊT

🎉 **LA MIGRATION EST PRÊTE !** 🎉

