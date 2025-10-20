# ✅ CORRECTION - Migration 016 : Données de test

---

## 🔧 PROBLÈME DÉTECTÉ

**Erreur :** `ERROR: 42703: column "site" of relation "ressources" does not exist`

**Cause :** La table `ressources` utilise `site_id` (UUID) et non `site` (TEXT).

---

## ✅ SOLUTION APPLIQUÉE

### Correction de la colonne

**Avant (INCORRECT) :**
```sql
INSERT INTO ressources (nom, prenom, site, actif, type_contrat, ...) VALUES
('Dupont', 'Jean', 'E-03A', true, 'CDI', ...),
```

**Après (CORRECT) :**
```sql
INSERT INTO ressources (nom, prenom, site_id, actif, type_contrat, ...) VALUES
('Dupont', 'Jean', (SELECT id FROM sites WHERE code_site = 'E-03A'), true, 'CDI', ...),
```

---

## 📊 STRUCTURE DE LA TABLE `ressources`

```sql
CREATE TABLE IF NOT EXISTS ressources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    site_id UUID REFERENCES sites(id),  -- ✅ Utilise site_id (UUID)
    actif BOOLEAN DEFAULT true,
    type_contrat TEXT NOT NULL,
    email_pro TEXT,
    email_perso TEXT,
    telephone TEXT,
    adresse_postale TEXT,
    competences TEXT[],
    date_entree DATE,
    date_sortie DATE,
    date_creation TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT check_email CHECK (email_pro IS NOT NULL OR email_perso IS NOT NULL)
);
```

---

## 🚀 PROCHAINES ÉTAPES

### 1. Exécuter la migration SQL corrigée
```sql
-- Dans Supabase Dashboard → SQL Editor
-- Exécuter :
016_seed_data_test.sql
```

### 2. Vérifier les données
```sql
-- Vérifier les sites
SELECT * FROM sites ORDER BY code_site;

-- Vérifier les ressources
SELECT r.*, s.code_site 
FROM ressources r 
LEFT JOIN sites s ON r.site_id = s.id 
ORDER BY r.nom;

-- Vérifier les affaires
SELECT * FROM affaires ORDER BY code_affaire;

-- Vérifier les tâches
SELECT * FROM planning_taches ORDER BY date_debut_plan;
```

### 3. Ouvrir la page terrain/remontee
```bash
# Ouvrir dans le navigateur
http://localhost:3000/terrain/remontee

# Vérifier :
- [ ] La page s'affiche
- [ ] Les 4 affaires sont visibles
- [ ] Les statistiques sont affichées
```

---

## 📊 DONNÉES DE TEST

### Sites
- ✅ E-03A - Site E-03A - Poste HTA
- ✅ DAM - Site DAM - Dépôt Atelier Maintenance
- ✅ PDC_FBA - Site PDC_FBA - Poste de Commande
- ✅ SITE-TEST - Site de test générique

### Ressources
- ✅ Jean Dupont (E-03A)
- ✅ Sophie Martin (DAM)
- ✅ Pierre Bernard (PDC_FBA)
- ✅ Marie Dubois (SITE-TEST)

### Affaires
- ✅ AFF-2025-001 - Poste HTA (E-03A)
- ✅ AFF-2025-002 - Maintenance DAM
- ✅ AFF-2025-003 - Installation PDC_FBA
- ✅ AFF-2025-004 - Site de test

---

## ✅ VALIDATION

### Checklist
- ✅ Colonne `site` corrigée en `site_id`
- ✅ Sous-requêtes SELECT ajoutées
- ✅ Migration SQL complète
- ✅ Documentation créée

---

## 🎉 CONCLUSION

**La correction est appliquée !**

✅ Colonne `site` corrigée en `site_id`
✅ Sous-requêtes SELECT ajoutées
✅ Migration SQL complète
✅ Documentation créée

**La migration est maintenant prête à être exécutée ! 🚀**

---

**Date :** 2025-01-18
**Version :** 1.1
**Statut :** ✅ CORRIGÉ ET PRÊT

🎉 **LA MIGRATION EST PRÊTE !** 🎉

