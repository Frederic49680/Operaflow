# Guide d'Audit Complet - Système de Planification & Pilotage

**Date :** 2025-01-18  
**Version :** Maintenance v1.2.4

## 📋 Vue d'ensemble

Ce guide vous permet d'effectuer un audit complet de votre système pour vérifier :
- ✅ Toutes les migrations SQL
- ✅ Intégrité de la base de données
- ✅ Fonctions et triggers
- ✅ Vues Dashboard
- ✅ Politiques RLS
- ✅ Composants React

---

## 🔍 ÉTAPE 1 : Audit Base de Données

### Option A : Via Supabase Dashboard (Recommandé)

1. **Accéder au SQL Editor**
   - Aller sur https://supabase.com/dashboard
   - Sélectionner votre projet
   - Cliquer sur "SQL Editor" dans le menu gauche

2. **Exécuter l'audit complet**
   - Copier le contenu du fichier `supabase/audit_complet.sql`
   - Coller dans l'éditeur SQL
   - Cliquer sur "Run" (ou Ctrl+Enter)

3. **Vérifier les résultats**
   - Le script affichera tous les tests avec ✓ ou ✗
   - Vérifier qu'il n'y a pas d'erreurs

### Option B : Via Supabase CLI

```bash
# Installer Supabase CLI (si pas déjà fait)
npm install -g supabase

# Se connecter à votre projet
supabase login

# Lier votre projet local
supabase link --project-ref votre-project-ref

# Exécuter l'audit
supabase db execute --file supabase/audit_complet.sql
```

---

## 🧪 ÉTAPE 2 : Tests des Migrations

### Vérifier les migrations appliquées

```sql
-- Dans Supabase SQL Editor
SELECT 
    version,
    name,
    inserted_at
FROM supabase_migrations.schema_migrations
ORDER BY inserted_at DESC;
```

**Résultat attendu :**
- ✅ 019_update_maintenance_v124.sql (dernière)
- ✅ 018_fix_aggregate_function.sql
- ✅ 017_update_affaires_statuts.sql
- ✅ 016_seed_data_test.sql
- ✅ 015_terrain_tuiles.sql
- ... (toutes les migrations précédentes)

---

## 📊 ÉTAPE 3 : Vérification des Tables

### Tables principales

```sql
-- Vérifier que toutes les tables existent
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**Tables attendues (33) :**
- sites, ressources, absences
- clients, interlocuteurs
- affaires, affaires_lots
- planning_taches, taches_ressources
- remontee_site, remontee_site_reporting, tache_suspensions
- site_blocages, confirmation_queue
- maintenance_batteries, maintenance_journal, maintenance_monthly_digest
- affaires_interlocuteurs, interactions_client
- claims, claim_history, claim_comments
- historique_actions, alerts
- roles, permissions, role_permissions, user_roles
- page_access_rules, component_flags, user_tokens
- audit_log, app_users

### Vérifier maintenance_journal (v1.2.4)

```sql
-- Vérifier les colonnes de maintenance_journal
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'maintenance_journal'
ORDER BY ordinal_position;
```

**Colonnes attendues :**
- ✅ `tranche` (integer, NOT NULL)
- ✅ `systeme_elementaire` (text, NOT NULL)
- ✅ `systeme` (text, nullable)
- ✅ `type_maintenance` (text, nullable)
- ✅ `etat_reel` (text, NOT NULL)
- ✅ `heures_presence` (numeric)
- ✅ `heures_suspension` (numeric)
- ✅ `heures_metal` (numeric)
- ✅ `motif` (text, nullable)
- ✅ `description` (text, nullable)
- ❌ `etat_confirme` (DOIT être supprimée)

---

## ⚙️ ÉTAPE 4 : Tests des Fonctions

### Fonction calculate_heures_metal

```sql
-- Tester le trigger de calcul des heures métal
INSERT INTO maintenance_journal (
    site_id,
    date_jour,
    tranche,
    systeme_elementaire,
    systeme,
    type_maintenance,
    etat_reel,
    heures_presence,
    heures_suspension
) 
SELECT 
    s.id,
    CURRENT_DATE,
    0,
    'TEST001',
    'Test',
    'Test',
    'En_cours',
    4.0,
    0.5
FROM sites s
LIMIT 1
RETURNING id, heures_metal;

-- Vérifier : heures_metal devrait être 3.5 (4.0 - 0.5)

-- Nettoyer
DELETE FROM maintenance_journal WHERE systeme_elementaire = 'TEST001';
```

### Fonction fn_generate_maintenance_monthly_summary

```sql
-- Tester la génération du résumé mensuel
SELECT fn_generate_maintenance_monthly_summary(
    (SELECT id FROM sites LIMIT 1),
    CURRENT_DATE
);

-- Résultat attendu : JSONB avec kpi et details
```

### Fonction fn_export_maintenance_monthly_csv

```sql
-- Tester l'export CSV
SELECT fn_export_maintenance_monthly_csv(
    (SELECT id FROM sites LIMIT 1),
    CURRENT_DATE
);

-- Résultat attendu : Texte CSV avec en-têtes
```

---

## 📈 ÉTAPE 5 : Vérification des Vues Dashboard

### Vue V_Dashboard_Maintenance

```sql
-- Vérifier la vue maintenance
SELECT * FROM V_Dashboard_Maintenance;

-- Colonnes attendues :
-- - nb_interventions_terminees
-- - nb_interventions_reportees
-- - nb_interventions_prolongees
-- - nb_interventions_suspendues
-- - nb_interventions_en_cours
-- - nb_interventions_non_lancees
-- - heures_metal_totales
-- - nb_total_interventions

-- ⚠️ NE DOIT PAS contenir : nb_a_confirmer
```

### Autres vues Dashboard

```sql
-- Vérifier toutes les vues
SELECT * FROM V_Dashboard_RH;
SELECT * FROM V_Dashboard_Affaires;
SELECT * FROM V_Dashboard_Planif;
SELECT * FROM V_Dashboard_Claims;
SELECT * FROM V_Dashboard_Site;
SELECT * FROM V_Dashboard_Client;
SELECT * FROM V_Dashboard_Absences;
SELECT * FROM V_Dashboard_Alertes;
```

---

## 🔒 ÉTAPE 6 : Vérification des Politiques RLS

```sql
-- Vérifier que RLS est activé sur les tables critiques
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'maintenance_journal',
    'remontee_site',
    'planning_taches',
    'affaires',
    'claims'
)
ORDER BY tablename;

-- rowsecurity devrait être 't' (true) pour toutes

-- Vérifier les politiques
SELECT 
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## 🧪 ÉTAPE 7 : Tests des Composants React

### Test 1 : Page Maintenance

1. **Accéder à la page**
   ```
   http://localhost:3000/maintenance
   ```

2. **Vérifier l'interface**
   - ✅ Titre : "Journal de l'après-midi (14h-18h)"
   - ✅ Bouton "Nouvelle intervention" présent
   - ✅ Tableau avec colonnes : Tranche, Système Élémentaire, Système, Type, État, Présence, Suspension, Métal, Description
   - ❌ Pas de colonne "Confirmé"
   - ❌ Pas de bouton "Confirmer la journée"

3. **Tester la création**
   - Cliquer sur "Nouvelle intervention"
   - Vérifier les champs :
     - ✅ Tranche (0-9)
     - ✅ Système Élémentaire (obligatoire)
     - ✅ Système (optionnel)
     - ✅ Type maintenance (texte libre)
     - ✅ État (Non_lancee, En_cours, Termine, Prolongee, Reportee, Suspendue)
     - ✅ Heures présence, suspension, métal (auto)
   - Remplir le formulaire
   - Cliquer sur "Enregistrer"
   - ✅ L'intervention apparaît dans le tableau

4. **Tester la modification**
   - Cliquer sur les 3 points (⋯) d'une ligne
   - Cliquer sur "Modifier"
   - ✅ Le modal s'ouvre avec les données pré-remplies
   - Modifier un champ
   - Cliquer sur "Modifier"
   - ✅ Les modifications sont sauvegardées

5. **Tester la suppression**
   - Cliquer sur les 3 points (⋯)
   - Cliquer sur "Supprimer"
   - Confirmer
   - ✅ L'intervention est supprimée

6. **Tester le calcul heures métal**
   - Créer une intervention
   - Heures présence : 4
   - Heures suspension : 0.5
   - ✅ Heures métal : 3.5 (calculé automatiquement)

### Test 2 : Fenêtre horaire (14h-18h)

```javascript
// Dans la console du navigateur
const now = new Date();
const hour = now.getHours();
console.log(`Heure actuelle : ${hour}h`);

if (hour >= 14 && hour < 18) {
    console.log('✅ Dans la fenêtre de saisie');
} else {
    console.log('⚠️ Hors fenêtre de saisie');
}
```

**Comportement attendu :**
- Entre 14h et 18h : Alerte jaune affichée
- Hors fenêtre : Aucune restriction (pour test)

---

## 📋 ÉTAPE 8 : Checklist Complète

### Base de données
- [ ] Toutes les migrations appliquées
- [ ] Toutes les tables présentes (33)
- [ ] maintenance_journal avec colonnes v1.2.4
- [ ] etat_confirme supprimée
- [ ] Toutes les fonctions présentes (15+)
- [ ] Trigger calculate_heures_metal fonctionne
- [ ] Toutes les vues Dashboard présentes
- [ ] V_Dashboard_Maintenance sans nb_a_confirmer
- [ ] RLS activé sur toutes les tables critiques
- [ ] Politiques RLS configurées

### Frontend
- [ ] Page /maintenance accessible
- [ ] Formulaire de création fonctionne
- [ ] Formulaire de modification fonctionne
- [ ] Suppression fonctionne
- [ ] Calcul heures métal automatique
- [ ] Fenêtre horaire 14h-18h
- [ ] Tableau avec nouvelles colonnes
- [ ] Pas de colonne "Confirmé"
- [ ] Pas de bouton "Confirmer"

### Fonctions métier
- [ ] Tranche 0-9 obligatoire
- [ ] Système Élémentaire obligatoire
- [ ] Système optionnel
- [ ] Type maintenance texte libre
- [ ] États conformes v1.2.4
- [ ] Heures métal = présence - suspension
- [ ] Motif requis si Suspendue

---

## 🐛 Dépannage

### Erreur : "cannot drop column etat_confirme"
**Solution :** La vue V_Dashboard_Maintenance doit être supprimée avant
```sql
DROP VIEW IF EXISTS V_Dashboard_Maintenance CASCADE;
-- Puis réappliquer la migration 019
```

### Erreur : "Internal Server Error"
**Solutions possibles :**
1. Vérifier que le serveur de développement est démarré
2. Vérifier les logs dans la console du navigateur (F12)
3. Vérifier les logs Supabase
4. Redémarrer le serveur : `npm run dev`

### Erreur : "class-variance-authority not found"
**Solution :**
```bash
npm install class-variance-authority
```

### Migration 019 échoue
**Solution :**
```sql
-- Exécuter manuellement dans Supabase SQL Editor
-- Copier le contenu de supabase/migrations/019_update_maintenance_v124.sql
```

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Consulter les logs Supabase
2. Consulter la console du navigateur (F12)
3. Vérifier le fichier `MAINTENANCE_V124_UPDATE.md`
4. Consulter le PRD : `.cursor/rules/prbmajmaintenance.mdc`

---

## ✅ Validation Finale

Une fois tous les tests passés :
- ✅ Base de données conforme v1.2.4
- ✅ Frontend fonctionnel
- ✅ Toutes les fonctions testées
- ✅ Aucune erreur dans les logs

**Le système est prêt pour la production !** 🚀

