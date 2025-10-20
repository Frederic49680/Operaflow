# 🧪 Guide de Test - Module BPU

**Date :** 2025-01-21  
**Version :** 1.0

---

## 📋 Checklist de test

### ✅ Étape 1 : Vérifier les migrations SQL

#### 1.1 Migration 020 (Tables BPU)
```sql
-- Dans Supabase Dashboard, exécuter :
-- supabase/migrations/020_create_bpu_tables.sql

-- Vérifier que les tables existent :
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('affaire_bpu_lignes', 'V_BPU_Parapluies_Actifs', 'V_BPU_Lignes_Disponibles', 'V_Affaire_BPU_Suivi', 'V_Affaire_BPU_Livraisons');

-- Vérifier les colonnes ajoutées à affaires :
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'affaires' 
  AND column_name IN ('type_affaire', 'nb_ressources_ref', 'heures_semaine_ref', 'periode_debut', 'periode_fin', 'heures_capacite', 'heures_vendues_total', 'heures_consommes_total', 'montant_reconnu_total');

-- Vérifier les colonnes ajoutées à planning_taches :
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'planning_taches' 
  AND column_name = 'is_parapluie_bpu';

-- Vérifier les colonnes ajoutées à maintenance_journal :
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'maintenance_journal' 
  AND column_name IN ('affaire_id', 'bpu_ligne_id');
```

**✅ Résultat attendu :** Toutes les tables et colonnes existent.

---

#### 1.2 Migration 021 (Fonctions BPU)
```sql
-- Dans Supabase Dashboard, exécuter :
-- supabase/migrations/021_create_bpu_functions.sql

-- Vérifier que les fonctions existent :
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'fn_create_bpu_parapluie_task',
    'fn_bpu_on_realisation_terminee',
    'fn_bpu_on_realisation_reportee',
    'cron_bpu_avancement_weekly',
    'fn_agg_bpu_affaire_totaux'
  );

-- Vérifier que les triggers existent :
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND trigger_name IN (
    'trg_affaire_bpu_lignes_after_insert',
    'trg_maintenance_journal_bpu_after_update'
  );
```

**✅ Résultat attendu :** Toutes les fonctions et triggers existent.

---

### ✅ Étape 2 : Créer une affaire BPU de test

#### 2.1 Créer l'affaire
```sql
-- Insérer une affaire BPU de test
INSERT INTO affaires (
  code_affaire,
  nom,
  site_id,
  responsable_id,
  type_affaire,
  nb_ressources_ref,
  heures_semaine_ref,
  periode_debut,
  periode_fin,
  statut
) VALUES (
  'BPU-TEST-001',
  'Test Maintenance Batteries',
  (SELECT id FROM sites LIMIT 1),
  (SELECT id FROM ressources LIMIT 1),
  'BPU',
  2,
  35,
  '2025-01-01',
  '2025-12-31',
  'Validee'
) RETURNING id, code_affaire;
```

**✅ Résultat attendu :** Affaire créée avec `type_affaire = 'BPU'`.

---

#### 2.2 Importer les lignes BPU (CSV de test)
```sql
-- Insérer des lignes BPU de test
INSERT INTO affaire_bpu_lignes (
  affaire_id,
  code_bpu,
  libelle,
  systeme_elementaire,
  quantite,
  unite,
  pu,
  pu_horaire,
  statut_ligne
) VALUES
  (
    (SELECT id FROM affaires WHERE code_affaire = 'BPU-TEST-001'),
    'VIERGE',
    'Activité libre',
    'LAA001',
    0,
    'heure',
    65,
    65,
    'vendue'
  ),
  (
    (SELECT id FROM affaires WHERE code_affaire = 'BPU-TEST-001'),
    'BPU001',
    'Décharge semestriel',
    'LAA001',
    1,
    'unité',
    500,
    NULL,
    'vendue'
  ),
  (
    (SELECT id FROM affaires WHERE code_affaire = 'BPU-TEST-001'),
    'BPU002',
    'Contrôle trimestriel',
    'LAA002',
    2,
    'unité',
    300,
    NULL,
    'vendue'
  )
RETURNING id, code_bpu, libelle;
```

**✅ Résultat attendu :** 
- 3 lignes BPU créées
- La tâche parapluie est automatiquement créée dans `planning_taches` (trigger)
- La capacité est calculée : 2 ressources × 35h/sem × 52 semaines = 3640h

---

#### 2.3 Vérifier la tâche parapluie
```sql
-- Vérifier que la tâche parapluie a été créée
SELECT 
  id,
  libelle_tache,
  affaire_id,
  is_parapluie_bpu,
  avancement_pct,
  statut
FROM planning_taches
WHERE affaire_id = (SELECT id FROM affaires WHERE code_affaire = 'BPU-TEST-001')
  AND is_parapluie_bpu = true;
```

**✅ Résultat attendu :** 1 tâche parapluie créée avec `libelle_tache` contenant "Contrat BPU-TEST-001".

---

### ✅ Étape 3 : Tester l'interface utilisateur

#### 3.1 Vérifier la page Maintenance
1. Aller sur `http://localhost:3000/maintenance`
2. Vérifier que la section "Affaires BPU actives" apparaît
3. Vérifier qu'une carte parapluie s'affiche pour l'affaire "BPU-TEST-001"
4. Vérifier les KPI affichés :
   - Capacité : 3640h (ou calculé selon la période)
   - Vendu : 0h (pas encore de réalisations)
   - Consommé : 0h
   - € Reconnu : 0€

**✅ Résultat attendu :** Carte parapluie visible avec les KPI corrects.

---

#### 3.2 Tester la création d'une réalisation BPU
1. Cliquer sur "Nouvelle réalisation BPU" sur la carte parapluie
2. Remplir le formulaire :
   - Tranche : 0
   - Ligne BPU : Sélectionner "BPU001 - Décharge semestriel"
   - Système Élémentaire : LAA001 (auto-rempli)
   - Type de maintenance : Décharge semestriel (auto-rempli)
   - État : En cours
   - Heures présence : 4
   - Heures suspension : 0
   - Description : "Test réalisation BPU"
3. Cliquer sur "Enregistrer"

**✅ Résultat attendu :** 
- Modal se ferme
- Réalisation créée dans `maintenance_journal`
- Ligne BPU non soldée (delivered_qty = 0 car état = En cours)

---

#### 3.3 Tester la finalisation d'une réalisation
1. Retourner sur la page Maintenance
2. Cliquer à nouveau sur "Nouvelle réalisation BPU"
3. Remplir le formulaire :
   - Tranche : 1
   - Ligne BPU : Sélectionner "BPU001 - Décharge semestriel"
   - État : **Terminée**
   - Heures présence : 4
   - Heures suspension : 0
4. Cliquer sur "Enregistrer"

**✅ Résultat attendu :** 
- Réalisation créée
- `fn_bpu_on_realisation_terminee()` déclenchée
- `delivered_qty` de la ligne BPU001 = 1
- `montant_reconnu` de la ligne BPU001 = 500€
- `heures_consommes_total` de l'affaire = 4h
- `montant_reconnu_total` de l'affaire = 500€

---

#### 3.4 Vérifier la ligne BPU soldée
1. Cliquer à nouveau sur "Nouvelle réalisation BPU"
2. Vérifier que la ligne "BPU001 - Décharge semestriel" n'apparaît plus dans la liste

**✅ Résultat attendu :** Ligne BPU001 non disponible (soldée).

---

#### 3.5 Tester une réalisation reportée
1. Cliquer sur "Nouvelle réalisation BPU"
2. Remplir le formulaire :
   - Tranche : 2
   - Ligne BPU : Sélectionner "BPU002 - Contrôle trimestriel"
   - État : **Reportée**
   - Heures présence : 2
   - Heures suspension : 0
   - Motif : "Attente matériel" (obligatoire)
   - Description : "Test report"
3. Cliquer sur "Enregistrer"

**✅ Résultat attendu :** 
- Réalisation créée
- `fn_bpu_on_realisation_reportee()` déclenchée
- `montant_reconnu` de la ligne BPU002 = 0€ (pas de monétisation)
- `heures_consommes_total` de l'affaire = 6h (4h + 2h)
- `montant_reconnu_total` de l'affaire = 500€ (inchangé)

---

### ✅ Étape 4 : Vérifier les vues SQL

#### 4.1 Vue V_BPU_Parapluies_Actifs
```sql
SELECT * FROM V_BPU_Parapluies_Actifs
WHERE code_affaire = 'BPU-TEST-001';
```

**✅ Résultat attendu :** 
- 1 ligne avec les KPI :
  - `heures_capacite` = 3640
  - `heures_vendues` = 0 (ou calculé selon les lignes vendues)
  - `heures_consommes` = 6
  - `montant_reconnu` = 500
  - `taux_remplissage_pct` = (6 / 3640) × 100 ≈ 0.16%
  - `taux_realisation_pct` = (6 / 0) × 100 = NULL (ou calculé selon les lignes vendues)

---

#### 4.2 Vue V_BPU_Lignes_Disponibles
```sql
SELECT * FROM V_BPU_Lignes_Disponibles
WHERE affaire_id = (SELECT id FROM affaires WHERE code_affaire = 'BPU-TEST-001');
```

**✅ Résultat attendu :** 
- 2 lignes (BPU002 et VIERGE, BPU001 est soldée)
- `quantite_disponible` = quantite - delivered_qty

---

#### 4.3 Vue V_Affaire_BPU_Suivi
```sql
SELECT * FROM V_Affaire_BPU_Suivi
WHERE affaire_id = (SELECT id FROM affaires WHERE code_affaire = 'BPU-TEST-001');
```

**✅ Résultat attendu :** 
- 1 ligne avec les totaux de l'affaire

---

#### 4.4 Vue V_Affaire_BPU_Livraisons
```sql
SELECT * FROM V_Affaire_BPU_Livraisons
WHERE affaire_id = (SELECT id FROM affaires WHERE code_affaire = 'BPU-TEST-001')
ORDER BY date_jour DESC;
```

**✅ Résultat attendu :** 
- 3 réalisations (En cours, Terminée, Reportée)
- Avec les montants reconnus corrects

---

### ✅ Étape 5 : Tester l'API

#### 5.1 GET /api/bpu/parapluies
```bash
curl http://localhost:3000/api/bpu/parapluies
```

**✅ Résultat attendu :** JSON avec la liste des parapluies actifs.

---

#### 5.2 GET /api/bpu/lignes?affaire_id=xxx
```bash
curl "http://localhost:3000/api/bpu/lignes?affaire_id=<affaire_id>"
```

**✅ Résultat attendu :** JSON avec les lignes BPU disponibles.

---

#### 5.3 POST /api/bpu/realizations
```bash
curl -X POST http://localhost:3000/api/bpu/realizations \
  -H "Content-Type: application/json" \
  -d '{
    "affaire_id": "<affaire_id>",
    "tache_id": "<tache_id>",
    "bpu_ligne_id": "<bpu_ligne_id>",
    "tranche": 3,
    "systeme_elementaire": "LAA003",
    "type_maintenance": "Test API",
    "etat_reel": "En_cours",
    "heures_presence": 2,
    "heures_suspension": 0,
    "heures_metal": 2,
    "description": "Test API"
  }'
```

**✅ Résultat attendu :** 
- Status 201
- Réalisation créée

---

#### 5.4 GET /api/bpu/suivi?affaire_id=xxx
```bash
curl "http://localhost:3000/api/bpu/suivi?affaire_id=<affaire_id>"
```

**✅ Résultat attendu :** JSON avec le suivi global de l'affaire.

---

#### 5.5 GET /api/bpu/livraisons?affaire_id=xxx
```bash
curl "http://localhost:3000/api/bpu/livraisons?affaire_id=<affaire_id>"
```

**✅ Résultat attendu :** JSON avec les livraisons de l'affaire.

---

### ✅ Étape 6 : Tester le Gantt

1. Aller sur `http://localhost:3000/gantt`
2. Filtrer par l'affaire "BPU-TEST-001"
3. Vérifier qu'une barre "Parapluie BPU" apparaît
4. Vérifier le tooltip avec les KPI

**✅ Résultat attendu :** Barre parapluie visible dans le Gantt.

---

### ✅ Étape 7 : Tester la fiche affaire

1. Aller sur `http://localhost:3000/affaires`
2. Ouvrir l'affaire "BPU-TEST-001"
3. Vérifier que le composant `AffaireBPUOverview` s'affiche
4. Vérifier les KPI et le tableau des réalisations

**✅ Résultat attendu :** 
- KPI corrects
- Tableau des réalisations avec toutes les données

---

## 🐛 Problèmes courants et solutions

### Problème 1 : La carte parapluie ne s'affiche pas
**Solution :** 
- Vérifier que `type_affaire = 'BPU'` dans la table `affaires`
- Vérifier que la tâche parapluie existe dans `planning_taches`
- Vérifier les logs de l'API `/api/bpu/parapluies`

---

### Problème 2 : Les lignes BPU n'apparaissent pas
**Solution :** 
- Vérifier que `statut_ligne = 'vendue'`
- Vérifier que `delivered_qty < quantite`
- Vérifier la vue `V_BPU_Lignes_Disponibles`

---

### Problème 3 : Le montant reconnu n'est pas mis à jour
**Solution :** 
- Vérifier que `etat_reel = 'Termine'`
- Vérifier que la fonction `fn_bpu_on_realisation_terminee()` a été déclenchée
- Vérifier les logs Supabase

---

### Problème 4 : Erreur "Ligne BPU introuvable"
**Solution :** 
- Vérifier que `bpu_ligne_id` est correct
- Vérifier que la ligne existe dans `affaire_bpu_lignes`

---

## 📊 Résultats attendus finaux

Après tous les tests, vous devriez avoir :

- ✅ 1 affaire BPU créée
- ✅ 3 lignes BPU importées
- ✅ 1 tâche parapluie dans le Gantt
- ✅ 3 réalisations dans `maintenance_journal` :
  - 1 En cours (4h, 0€)
  - 1 Terminée (4h, 500€)
  - 1 Reportée (2h, 0€)
- ✅ Capacité : 3640h
- ✅ Consommé : 6h
- ✅ € Reconnu : 500€
- ✅ 1 ligne BPU soldée (BPU001)

---

## 🎉 Validation finale

Si tous les tests passent, le module BPU est **opérationnel** !

**Prochaines étapes :**
1. Créer des affaires BPU réelles
2. Importer les vrais CSV BPU
3. Former les utilisateurs à la saisie guidée
4. Configurer le cron hebdomadaire pour l'avancement

---

**Bon test ! 🚀**

