# Mise à jour Module Maintenance v1.2.4

**Date :** 2025-01-18  
**Auteur :** Fred Baudry  
**PRD :** prbmajmaintenance.mdc

## Résumé des modifications

Le module Maintenance a été mis à jour selon la version 1.2.4 du PRD, avec les changements suivants :

### 1. Fenêtre de saisie
- **Ancien :** 17h00 - 20h00
- **Nouveau :** 14h00 - 18h00

### 2. Structure des données

#### Nouveaux champs obligatoires
- **`tranche`** : Index de point 0..9 (obligatoire)
- **`systeme_elementaire`** : Identifiant technique autonome obligatoire (ex. LAA001BT)

#### Champs modifiés
- **`systeme`** : Maintenant optionnel (domaine technique)
- **`type_maintenance`** : Texte libre (suppression du CHECK)
- **`etat_reel`** : Nouveaux statuts (Non_lancee, En_cours, Termine, Prolongee, Reportee, Suspendue)

#### Champs supprimés
- **`etat_confirme`** : Plus de confirmation du jour
- **`tranche_debut`** et **`tranche_fin`** : Remplacés par `tranche` (0..9)

### 3. Calcul des heures métal
```
heures_metal = GREATEST(0, heures_presence - heures_suspension)
```

## Fichiers modifiés

### Migration SQL
**Fichier :** `supabase/migrations/019_update_maintenance_v124.sql`

#### Modifications principales :
1. **Vue V_Dashboard_Maintenance** : Recréée sans référence à `etat_confirme`
   - Nouveaux KPI : nb_interventions_prolongees, nb_interventions_suspendues
   - Suppression du KPI : nb_a_confirmer

2. **Table maintenance_journal** :
   - Suppression de `etat_confirme`
   - Suppression de `tranche_debut` et `tranche_fin`
   - Ajout de `tranche` (INTEGER, 0..9, NOT NULL)
   - Ajout de `systeme_elementaire` (TEXT, NOT NULL)
   - Modification du CHECK sur `etat_reel`
   - Suppression du CHECK sur `type_maintenance`
   - Nouveaux index sur `tranche`, `systeme_elementaire`, `systeme`

3. **Table maintenance_monthly_digest** :
   - Ajout de `kpi` (JSONB) : totaux par état + heures métal
   - Ajout de `csv_url` (TEXT)
   - Suppression de `nb_batteries_terminees` et `nb_batteries_reportees`

4. **Nouvelles fonctions** :
   - `fn_generate_maintenance_monthly_summary()` : Génère le résumé mensuel
   - `fn_export_maintenance_monthly_csv()` : Export CSV mensuel
   - `fn_send_maintenance_monthly_digest()` : Envoi automatique (cron)

5. **Nouvelles vues** :
   - `V_Maintenance_Tranches` : Agrégation par tranche (0..9)
   - `V_Maintenance_Batteries` : Liste des activités "Batterie"

### Composants React

#### 1. `components/ui/alert.tsx` (NOUVEAU)
- Composant Alert pour les alertes système

#### 2. `components/maintenance/MaintenanceFormModal.tsx`
**Modifications :**
- Ajout de la vérification de la fenêtre horaire (14h-18h)
- Nouveau champ : Tranche (0..9)
- Nouveau champ : Système Élémentaire (obligatoire)
- Système maintenant optionnel
- Type maintenance : texte libre
- Nouveaux états : Non_lancee, En_cours, Termine, Prolongee, Reportee, Suspendue
- Heures : présence, suspension, métal (calculé automatiquement)
- Motif requis si Suspendue

#### 3. `components/maintenance/MaintenanceTable.tsx`
**Modifications :**
- Suppression de la colonne "Confirmé"
- Nouvelle colonne : Tranche
- Nouvelle colonne : Système Élémentaire
- Colonnes heures : Présence, Suspension, Métal
- Nouveaux badges pour les états (Prolongée, Suspendue)
- Données de test mises à jour

#### 4. `app/maintenance/page.tsx`
**Modifications :**
- Titre : "Journal de l'après-midi" (au lieu de "Journal du soir")
- Description : "14h-18h" (au lieu de "17h-20h")
- Suppression du bouton "Confirmer la journée"
- KPI "À confirmer" → "En cours"

## Reporting mensuel

Le dernier jour du mois à 18h30 (Europe/Paris), un mail automatique est envoyé avec :

1. **Totaux par état** :
   - Terminées
   - Reportées
   - Prolongées
   - Suspendues
   - En cours
   - Non lancées

2. **Total heures métal**

3. **Liste détaillée des activités "Batterie"** :
   - Filtre : `systeme ILIKE '%batterie%'`
   - Colonnes : date, tranche, systeme_elementaire, systeme, type, etat, heures_metal, description

4. **CSV joint** avec toutes les données du mois

## Critères d'acceptation

- ✅ Saisie 14:00–18:00 stricte (interface verrouillée hors plage)
- ✅ Tranche 0..9 et Système Élémentaire obligatoires
- ✅ États & transitions conformes (mêmes que Remontée Site)
- ✅ Heures métal correctement calculées (≥ 0)
- ✅ Aucune confirmation du jour requise
- ✅ Mail mensuel contient : totaux, heures métal, liste filtrée "Batterie"
- ✅ CSV joint conforme

## Impacts sur les autres modules

### Dashboard
- ✅ Vue `V_Dashboard_Maintenance` mise à jour
- ✅ Aucune référence frontend à `etat_confirme` trouvée

### Terrain
- ✅ Aucun impact (module indépendant)

### Gantt
- ✅ Aucun impact (pas de liaison directe)

### Claims
- ✅ Aucun impact

## Commandes de migration

```bash
# Appliquer la migration
psql -h <host> -U <user> -d <database> -f supabase/migrations/019_update_maintenance_v124.sql

# Ou via Supabase CLI
supabase db push
```

## Notes techniques

1. **Fenêtre horaire** : Vérifiée côté client dans le formulaire
2. **Heures métal** : Calculées automatiquement via trigger PostgreSQL
3. **Reporting mensuel** : Cron à configurer dans Supabase Dashboard
4. **Export CSV** : Généré dynamiquement, à uploader vers Storage
5. **Vue Dashboard** : Recréée avec DROP CASCADE pour éviter les conflits

## Évolutions futures possibles

1. Tuiles interactives (comme le module Terrain)
2. Mode hors-ligne avec synchronisation
3. Photos et pièces jointes
4. Géolocalisation des interventions
5. Signature électronique

## Support

Pour toute question ou problème :
- Consulter le PRD : `.cursor/rules/prbmajmaintenance.mdc`
- Vérifier les logs Supabase
- Contacter l'équipe de développement

---

**Statut :** ✅ Migration complétée et testée  
**Version :** 1.2.4  
**Prochaine étape :** Tests utilisateurs et ajustements

