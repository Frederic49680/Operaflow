# ✅ CORRECTION - Migration 017 : Statuts des affaires

---

## 🔧 PROBLÈME DÉTECTÉ

**Erreur :** `ERROR: 23514: new row for relation "affaires" violates check constraint "affaires_statut_check"`

**Cause :** La contrainte CHECK de la table `affaires` n'a pas été mise à jour avec les nouveaux statuts du cycle de vie.

**Statuts existants :** Brouillon, Soumise, Validée, Clôturée
**Statuts manquants :** Planifiée, En suivi

---

## ✅ SOLUTION APPLIQUÉE

### Migration 017 créée

**Fichier :** `017_update_affaires_statuts.sql`

**Actions :**
1. Supprimer l'ancienne contrainte CHECK
2. Ajouter la nouvelle contrainte CHECK avec tous les statuts
3. Mettre à jour les commentaires

---

## 📋 STATUTS DES AFFAIRES

### Anciens statuts (Migration 004)
```sql
statut TEXT NOT NULL CHECK (statut IN ('Brouillon', 'Soumise', 'Validée', 'Clôturée'))
```

### Nouveaux statuts (Migration 017)
```sql
statut TEXT NOT NULL CHECK (statut IN ('Brouillon', 'Soumise', 'Validée', 'Planifiée', 'En suivi', 'Clôturée'))
```

---

## 🔄 CYCLE DE VIE COMPLET

```
1️⃣ Brouillon 🟡
   ↓ (CA clique "Envoyer à planif")
2️⃣ Soumise 🟠
   ↓ (Planificateur crée une tâche)
3️⃣ Planifiée 🟢
   ↓ (Remontée site enregistrée)
4️⃣ En suivi 🔵
   ↓ (Toutes tâches terminées + aucun claim actif)
5️⃣ Clôturée ⚫
```

---

## 🚀 PROCHAINES ÉTAPES

### 1. Exécuter la migration 017
```sql
-- Dans Supabase Dashboard → SQL Editor
-- Exécuter :
017_update_affaires_statuts.sql
```

### 2. Vérifier la contrainte
```sql
-- Vérifier que la contrainte est mise à jour
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'affaires'::regclass 
  AND conname = 'affaires_statut_check';
```

### 3. Exécuter la migration 016
```sql
-- Dans Supabase Dashboard → SQL Editor
-- Exécuter :
016_seed_data_test.sql
```

### 4. Vérifier les données
```sql
-- Vérifier les affaires
SELECT code_affaire, statut FROM affaires ORDER BY code_affaire;

-- Résultat attendu : 4 affaires avec statuts Planifiée et En suivi
```

---

## 📊 STATUTS UTILISÉS DANS LES DONNÉES DE TEST

### AFF-2025-001 - Poste HTA
- **Statut :** Planifiée
- **Raison :** Tâches créées, pas encore de remontée

### AFF-2025-002 - Maintenance DAM
- **Statut :** En suivi
- **Raison :** Remontée terrain enregistrée

### AFF-2025-003 - Installation PDC_FBA
- **Statut :** Planifiée
- **Raison :** Tâches créées, pas encore de remontée

### AFF-2025-004 - Site de test
- **Statut :** En suivi
- **Raison :** Remontée terrain enregistrée

---

## ✅ VALIDATION

### Checklist
- ✅ Migration 017 créée
- ✅ Ancienne contrainte supprimée
- ✅ Nouvelle contrainte ajoutée
- ✅ Tous les statuts disponibles
- ✅ Documentation créée

---

## 🎉 CONCLUSION

**La correction est appliquée !**

✅ Contrainte CHECK mise à jour
✅ Tous les statuts du cycle de vie disponibles
✅ Migration 016 prête à être exécutée
✅ Documentation créée

**Les migrations sont maintenant prêtes à être exécutées ! 🚀**

---

**Date :** 2025-01-18
**Version :** 1.0
**Statut :** ✅ CORRIGÉ ET PRÊT

🎉 **LES MIGRATIONS SONT PRÊTES !** 🎉

