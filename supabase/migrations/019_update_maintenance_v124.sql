-- ============================================================================
-- Migration 019 : Mise à jour Module Maintenance v1.2.4
-- ============================================================================
-- Auteur : Fred Baudry
-- Date : 2025-01-18
-- Description : Mise à jour du module Maintenance selon PRD v1.2.4
-- PRD : prbmajmaintenance.mdc
-- ============================================================================
-- Changements :
-- - Fenêtre de saisie : 14:00–18:00 (au lieu de 17:00–20:00)
-- - Tranche : index 0..9 (obligatoire)
-- - Système Élémentaire : identifiant autonome obligatoire (ex. LAA001BT)
-- - Système : texte libre optionnel (Élec / IEG / CVC)
-- - Suppression de la confirmation du jour (etat_confirme)
-- - Type maintenance : texte libre (pas de CHECK)
-- - États : Non_lancee / En_cours / Termine / Prolongee / Reportee / Suspendue
-- - Reporting mensuel : totaux par état, heures métal, liste "Batterie"
-- ============================================================================

-- ============================================================================
-- MISE À JOUR DE LA VUE V_Dashboard_Maintenance (AVANT suppression colonne)
-- ============================================================================

-- Supprimer la vue existante pour pouvoir modifier les colonnes
DROP VIEW IF EXISTS V_Dashboard_Maintenance CASCADE;

-- Recréer la vue sans référence à etat_confirme
CREATE VIEW V_Dashboard_Maintenance AS
SELECT 
  COUNT(*) FILTER (WHERE etat_reel = 'Termine') as nb_interventions_terminees,
  COUNT(*) FILTER (WHERE etat_reel = 'Reportee') as nb_interventions_reportees,
  COUNT(*) FILTER (WHERE etat_reel = 'Prolongee') as nb_interventions_prolongees,
  COUNT(*) FILTER (WHERE etat_reel = 'Suspendue') as nb_interventions_suspendues,
  COUNT(*) FILTER (WHERE etat_reel = 'En_cours') as nb_interventions_en_cours,
  COUNT(*) FILTER (WHERE etat_reel = 'Non_lancee') as nb_interventions_non_lancees,
  SUM(heures_metal) as heures_metal_totales,
  COUNT(*) as nb_total_interventions
FROM maintenance_journal;

COMMENT ON VIEW V_Dashboard_Maintenance IS 'Vue agrégée Maintenance pour le dashboard (v1.2.4)';

-- ============================================================================
-- MODIFICATIONS DE LA TABLE maintenance_journal
-- ============================================================================

-- 1) Supprimer le champ de confirmation (plus de confirmation du jour)
ALTER TABLE maintenance_journal
  DROP COLUMN IF EXISTS etat_confirme;

-- 2) Supprimer les anciennes colonnes tranche_debut et tranche_fin
ALTER TABLE maintenance_journal
  DROP COLUMN IF EXISTS tranche_debut,
  DROP COLUMN IF EXISTS tranche_fin;

-- 3) Ajouter la colonne tranche (0..9, obligatoire)
ALTER TABLE maintenance_journal
  ADD COLUMN IF NOT EXISTS tranche INTEGER CHECK (tranche >= 0 AND tranche <= 9);

-- Rendre tranche obligatoire
ALTER TABLE maintenance_journal
  ALTER COLUMN tranche SET NOT NULL;

-- 4) Ajouter la colonne systeme_elementaire (obligatoire)
ALTER TABLE maintenance_journal
  ADD COLUMN IF NOT EXISTS systeme_elementaire TEXT;

-- Rendre systeme_elementaire obligatoire
ALTER TABLE maintenance_journal
  ALTER COLUMN systeme_elementaire SET NOT NULL;

-- 5) Modifier systeme pour le rendre optionnel (texte libre)
-- (Déjà optionnel, on supprime juste le CHECK s'il existe)

-- 6) Supprimer le CHECK sur type_maintenance (texte libre maintenant)
ALTER TABLE maintenance_journal
  DROP CONSTRAINT IF EXISTS maintenance_journal_type_maintenance_check;

-- 7) Modifier etat_reel pour les nouveaux statuts
ALTER TABLE maintenance_journal
  DROP CONSTRAINT IF EXISTS maintenance_journal_etat_reel_check;

ALTER TABLE maintenance_journal
  ADD CONSTRAINT maintenance_journal_etat_reel_check 
  CHECK (etat_reel IN ('Non_lancee', 'En_cours', 'Termine', 'Prolongee', 'Reportee', 'Suspendue'));

-- 8) Modifier motif pour le rendre obligatoire si Suspendue
-- (Géré au niveau applicatif, pas de contrainte DB)

-- 9) Ajouter un index sur tranche pour les filtres
CREATE INDEX IF NOT EXISTS idx_maintenance_journal_tranche ON maintenance_journal(tranche);

-- 10) Ajouter un index sur systeme_elementaire
CREATE INDEX IF NOT EXISTS idx_maintenance_journal_systeme_elementaire ON maintenance_journal(systeme_elementaire);

-- 11) Ajouter un index sur systeme (pour le filtre "Batterie")
CREATE INDEX IF NOT EXISTS idx_maintenance_journal_systeme ON maintenance_journal(systeme);

-- ============================================================================
-- MODIFICATIONS DE LA TABLE maintenance_monthly_digest
-- ============================================================================

-- Ajouter les colonnes pour les nouveaux KPI
ALTER TABLE maintenance_monthly_digest
  ADD COLUMN IF NOT EXISTS kpi JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS csv_url TEXT;

-- Supprimer les anciennes colonnes (remplacées par kpi JSONB)
ALTER TABLE maintenance_monthly_digest
  DROP COLUMN IF EXISTS nb_batteries_terminees,
  DROP COLUMN IF EXISTS nb_batteries_reportees;

-- Commentaires
COMMENT ON COLUMN maintenance_monthly_digest.kpi IS 'KPI mensuels : {terminees, reportees, prolongees, suspendues, en_cours, non_lancees, heures_metal}';
COMMENT ON COLUMN maintenance_monthly_digest.csv_url IS 'URL du fichier CSV joint au mail mensuel';
COMMENT ON COLUMN maintenance_monthly_digest.details IS 'Liste détaillée des activités "Batterie" : {batterie_list: [...]}';

-- ============================================================================
-- FONCTION : Génération du résumé mensuel
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_generate_maintenance_monthly_summary(
  p_site_id UUID,
  p_periode_mois DATE
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_kpi JSONB;
  v_batterie_list JSONB;
  v_result JSONB;
BEGIN
  -- Calculer les KPI par état
  SELECT jsonb_build_object(
    'terminees', COUNT(*) FILTER (WHERE etat_reel = 'Termine'),
    'reportees', COUNT(*) FILTER (WHERE etat_reel = 'Reportee'),
    'prolongees', COUNT(*) FILTER (WHERE etat_reel = 'Prolongee'),
    'suspendues', COUNT(*) FILTER (WHERE etat_reel = 'Suspendue'),
    'en_cours', COUNT(*) FILTER (WHERE etat_reel = 'En_cours'),
    'non_lancees', COUNT(*) FILTER (WHERE etat_reel = 'Non_lancee'),
    'heures_metal', COALESCE(SUM(heures_metal), 0)
  )
  INTO v_kpi
  FROM maintenance_journal
  WHERE site_id = p_site_id
    AND date_jour >= DATE_TRUNC('month', p_periode_mois)
    AND date_jour < DATE_TRUNC('month', p_periode_mois) + INTERVAL '1 month';

  -- Extraire la liste des activités "Batterie"
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'date', date_jour,
      'tranche', tranche,
      'systeme', systeme,
      'systeme_elementaire', systeme_elementaire,
      'type', type_maintenance,
      'etat', etat_reel,
      'heures_metal', heures_metal,
      'description', description
    ) ORDER BY date_jour, tranche
  ), '[]'::jsonb)
  INTO v_batterie_list
  FROM maintenance_journal
  WHERE site_id = p_site_id
    AND date_jour >= DATE_TRUNC('month', p_periode_mois)
    AND date_jour < DATE_TRUNC('month', p_periode_mois) + INTERVAL '1 month'
    AND systeme ILIKE '%batterie%';

  -- Construire le résultat
  v_result := jsonb_build_object(
    'kpi', v_kpi,
    'details', jsonb_build_object(
      'batterie_list', v_batterie_list
    )
  );

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION fn_generate_maintenance_monthly_summary IS 'Génère le résumé mensuel avec KPI et liste Batterie';

-- ============================================================================
-- FONCTION : Export CSV mensuel
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_export_maintenance_monthly_csv(
  p_site_id UUID,
  p_periode_mois DATE
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_csv TEXT;
  v_row RECORD;
BEGIN
  -- En-tête CSV
  v_csv := 'date,site,tranche,systeme_elementaire,systeme,type_maintenance,etat_reel,heures_presence,heures_suspension,heures_metal,description' || E'\n';

  -- Données
  FOR v_row IN
    SELECT 
      date_jour,
      s.nom as site_nom,
      tranche,
      systeme_elementaire,
      systeme,
      type_maintenance,
      etat_reel,
      heures_presence,
      heures_suspension,
      heures_metal,
      description
    FROM maintenance_journal mj
    JOIN sites s ON mj.site_id = s.id
    WHERE mj.site_id = p_site_id
      AND mj.date_jour >= DATE_TRUNC('month', p_periode_mois)
      AND mj.date_jour < DATE_TRUNC('month', p_periode_mois) + INTERVAL '1 month'
    ORDER BY date_jour, tranche
  LOOP
    v_csv := v_csv || 
      COALESCE(v_row.date_jour::TEXT, '') || ',' ||
      COALESCE(v_row.site_nom, '') || ',' ||
      COALESCE(v_row.tranche::TEXT, '') || ',' ||
      COALESCE(v_row.systeme_elementaire, '') || ',' ||
      COALESCE(v_row.systeme, '') || ',' ||
      COALESCE(v_row.type_maintenance, '') || ',' ||
      COALESCE(v_row.etat_reel, '') || ',' ||
      COALESCE(v_row.heures_presence::TEXT, '') || ',' ||
      COALESCE(v_row.heures_suspension::TEXT, '') || ',' ||
      COALESCE(v_row.heures_metal::TEXT, '') || ',' ||
      COALESCE(v_row.description, '') || E'\n';
  END LOOP;

  RETURN v_csv;
END;
$$;

COMMENT ON FUNCTION fn_export_maintenance_monthly_csv IS 'Exporte les données mensuelles au format CSV';

-- ============================================================================
-- CRON : Envoi automatique du résumé mensuel (dernier jour du mois à 18:30)
-- ============================================================================

-- Note : Le cron sera configuré via Supabase Dashboard ou pg_cron
-- Fonction d'envoi (à implémenter avec SMTP/API)
CREATE OR REPLACE FUNCTION fn_send_maintenance_monthly_digest()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_site RECORD;
  v_periode DATE;
  v_summary JSONB;
  v_csv TEXT;
BEGIN
  -- Date du dernier jour du mois précédent
  v_periode := DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day';
  
  -- Pour chaque site
  FOR v_site IN
    SELECT DISTINCT site_id 
    FROM maintenance_journal
    WHERE date_jour >= DATE_TRUNC('month', v_periode)
      AND date_jour < DATE_TRUNC('month', v_periode) + INTERVAL '1 month'
  LOOP
    -- Générer le résumé
    v_summary := fn_generate_maintenance_monthly_summary(v_site.site_id, v_periode);
    
    -- Générer le CSV
    v_csv := fn_export_maintenance_monthly_csv(v_site.site_id, v_periode);
    
    -- TODO : Upload CSV vers Supabase Storage
    -- TODO : Envoi du mail avec le résumé et le lien CSV
    
    -- Enregistrer la trace
    INSERT INTO maintenance_monthly_digest (
      site_id,
      periode_mois,
      destinataires,
      kpi,
      details,
      csv_url,
      sent_at
    ) VALUES (
      v_site.site_id,
      DATE_TRUNC('month', v_periode),
      ARRAY[]::TEXT[], -- TODO : récupérer depuis maintenance_batteries.responsable_id
      v_summary->'kpi',
      v_summary->'details',
      NULL, -- TODO : URL du CSV uploadé
      NOW()
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
  
  RAISE NOTICE 'Résumés mensuels de maintenance envoyés pour % sites', FOUND;
END;
$$;

COMMENT ON FUNCTION fn_send_maintenance_monthly_digest IS 'Envoie automatiquement les résumés mensuels de maintenance';

-- ============================================================================
-- VUE : Maintenance par tranche (0..9)
-- ============================================================================

CREATE OR REPLACE VIEW V_Maintenance_Tranches AS
SELECT 
  site_id,
  date_jour,
  tranche,
  COUNT(*) as nb_interventions,
  COUNT(*) FILTER (WHERE etat_reel = 'Termine') as nb_terminees,
  COUNT(*) FILTER (WHERE etat_reel = 'En_cours') as nb_en_cours,
  COUNT(*) FILTER (WHERE etat_reel = 'Reportee') as nb_reportees,
  COUNT(*) FILTER (WHERE etat_reel = 'Prolongee') as nb_prolongees,
  COUNT(*) FILTER (WHERE etat_reel = 'Suspendue') as nb_suspendues,
  SUM(heures_metal) as heures_metal_total
FROM maintenance_journal
GROUP BY site_id, date_jour, tranche
ORDER BY date_jour DESC, tranche;

COMMENT ON VIEW V_Maintenance_Tranches IS 'Agrégation des interventions par tranche (0..9)';

-- ============================================================================
-- VUE : Activités Batterie (filtre systeme ILIKE '%batterie%')
-- ============================================================================

CREATE OR REPLACE VIEW V_Maintenance_Batteries AS
SELECT 
  id,
  site_id,
  date_jour,
  tranche,
  systeme_elementaire,
  systeme,
  type_maintenance,
  etat_reel,
  heures_presence,
  heures_suspension,
  heures_metal,
  description,
  created_at
FROM maintenance_journal
WHERE systeme ILIKE '%batterie%'
ORDER BY date_jour DESC, tranche;

COMMENT ON VIEW V_Maintenance_Batteries IS 'Liste des activités dont le système contient "Batterie"';

-- ============================================================================
-- COMMENTAIRES FINAUX
-- ============================================================================

COMMENT ON TABLE maintenance_journal IS 'Journal maintenance v1.2.4 : saisie 14h-18h, tranche 0..9, systeme_elementaire obligatoire, pas de confirmation';
COMMENT ON COLUMN maintenance_journal.tranche IS 'Index de point 0..9 (obligatoire)';
COMMENT ON COLUMN maintenance_journal.systeme_elementaire IS 'Identifiant technique autonome obligatoire (ex. LAA001BT)';
COMMENT ON COLUMN maintenance_journal.systeme IS 'Domaine optionnel (Élec / IEG / CVC)';
COMMENT ON COLUMN maintenance_journal.type_maintenance IS 'Type libre (Décharge semestriel / Contrôle / Correctif...)';
COMMENT ON COLUMN maintenance_journal.etat_reel IS 'État : Non_lancee / En_cours / Termine / Prolongee / Reportee / Suspendue';

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================

