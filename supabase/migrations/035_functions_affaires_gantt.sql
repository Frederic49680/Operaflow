-- Migration 035 : Fonctions et triggers pour la transition Affaires ↔ Gantt
-- Date : 20/10/2025
-- Description : Fonctions pour gérer la planification, les jalons et les alertes

-- ============================================================================
-- 1. FONCTIONS POUR LA PLANIFICATION
-- ============================================================================

-- Fonction pour déclarer la planification d'une affaire
CREATE OR REPLACE FUNCTION fn_declare_planification(
  p_affaire_id uuid,
  p_date_debut date,
  p_date_fin date,
  p_responsable_planification uuid DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_affaire affaires%ROWTYPE;
  v_result jsonb;
  v_tache_id uuid;
BEGIN
  -- Vérifier que l'affaire existe et est en statut 'A_planifier'
  SELECT * INTO v_affaire 
  FROM affaires 
  WHERE id = p_affaire_id AND statut = 'A_planifier';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Affaire non trouvée ou déjà planifiée'
    );
  END IF;
  
  -- Créer une tâche parapluie pour l'affaire
  INSERT INTO planning_taches (
    id,
    affaire_id,
    site_id,
    libelle_tache,
    type_tache,
    type,
    date_debut_plan,
    date_fin_plan,
    avancement_pct,
    statut,
    is_parapluie_bpu,
    created_by
  ) VALUES (
    gen_random_uuid(),
    p_affaire_id,
    v_affaire.site_id,
    'Parapluie - ' || v_affaire.nom,
    'Préparation',
    'tache',
    p_date_debut,
    p_date_fin,
    0,
    'Non lancé',
    false,
    p_responsable_planification
  )
  RETURNING id INTO v_tache_id;
  
  -- Créer les jalons à partir des lots financiers
  PERFORM fn_create_jalons_from_lots(p_affaire_id);
  
  -- Mettre à jour le statut de l'affaire à 'Validée'
  UPDATE affaires 
  SET statut = 'Validee'
  WHERE id = p_affaire_id;
  
  -- Retourner le résultat
  RETURN jsonb_build_object(
    'success', true,
    'affaire_id', p_affaire_id,
    'tache_parapluie_id', v_tache_id,
    'message', 'Planification déclarée avec succès'
  );
END;
$$ LANGUAGE plpgsql;

-- Fonction pour créer les jalons à partir des lots financiers
CREATE OR REPLACE FUNCTION fn_create_jalons_from_lots(p_affaire_id uuid)
RETURNS integer AS $$
DECLARE
  v_lot affaires_lots_financiers%ROWTYPE;
  v_count integer := 0;
BEGIN
  -- Parcourir tous les lots financiers de l'affaire
  FOR v_lot IN 
    SELECT * FROM affaires_lots_financiers 
    WHERE affaire_id = p_affaire_id
  LOOP
    -- Créer un jalon pour chaque lot
    INSERT INTO planning_taches (
      id,
      affaire_id,
      site_id,
      lot_financier_id,
      libelle_tache,
      type_tache,
      type,
      date_debut_plan,
      date_fin_plan,
      avancement_pct,
      statut,
      montant,
      requiert_reception,
      created_by
    )
    SELECT 
      gen_random_uuid(),
      p_affaire_id,
      a.site_id,
      v_lot.id,
      'Jalon - ' || v_lot.libelle,
      'Contrôle',
      'jalon',
      v_lot.echeance_prevue,
      v_lot.echeance_prevue,
      0,
      'Non lancé',
      v_lot.montant_ht,
      CASE WHEN v_lot.mode_facturation = 'a_la_reception' THEN true ELSE false END,
      a.responsable_id
    FROM affaires a
    WHERE a.id = p_affaire_id;
    
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. FONCTIONS POUR LES JALONS
-- ============================================================================

-- Fonction pour vérifier si un jalon est terminé
CREATE OR REPLACE FUNCTION fn_check_jalon_completion(p_jalon_id uuid)
RETURNS boolean AS $$
DECLARE
  v_jalon planning_taches%ROWTYPE;
  v_taches_terminées integer;
  v_taches_total integer;
BEGIN
  -- Récupérer le jalon
  SELECT * INTO v_jalon 
  FROM planning_taches 
  WHERE id = p_jalon_id AND type = 'jalon';
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Vérifier si le jalon est à 100%
  IF v_jalon.avancement_pct < 100 THEN
    RETURN false;
  END IF;
  
  -- Compter les tâches associées au même lot financier
  SELECT 
    COUNT(*) FILTER (WHERE statut = 'Terminé'),
    COUNT(*)
  INTO v_taches_terminées, v_taches_total
  FROM planning_taches
  WHERE lot_financier_id = v_jalon.lot_financier_id
    AND type = 'tache'
    AND date_fin_plan <= v_jalon.date_fin_plan;
  
  -- Si toutes les tâches sont terminées, le jalon est complété
  RETURN v_taches_terminées = v_taches_total AND v_taches_total > 0;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour envoyer une alerte de facturation
CREATE OR REPLACE FUNCTION fn_alert_facturation_ca(p_affaire_id uuid, p_lot_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_lot affaires_lots_financiers%ROWTYPE;
  v_affaire affaires%ROWTYPE;
  v_responsable ressources%ROWTYPE;
  v_message text;
BEGIN
  -- Récupérer les informations du lot
  SELECT * INTO v_lot 
  FROM affaires_lots_financiers 
  WHERE id = p_lot_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Lot non trouvé'
    );
  END IF;
  
  -- Récupérer les informations de l'affaire
  SELECT * INTO v_affaire 
  FROM affaires 
  WHERE id = p_affaire_id;
  
  -- Récupérer les informations du responsable
  SELECT * INTO v_responsable 
  FROM ressources 
  WHERE id = v_affaire.responsable_id;
  
  -- Construire le message
  v_message := format(
    '💡 Lot "%s" terminé — facturation possible pour l''affaire %s',
    v_lot.libelle,
    v_affaire.code_affaire
  );
  
  -- TODO: Envoyer un mail SMTP au responsable
  -- INSERT INTO mail_queue (to_email, subject, body) VALUES (...)
  
  -- Retourner le résultat
  RETURN jsonb_build_object(
    'success', true,
    'message', v_message,
    'lot_libelle', v_lot.libelle,
    'affaire_code', v_affaire.code_affaire,
    'responsable_email', v_responsable.email_pro
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. TRIGGERS
-- ============================================================================

-- Trigger pour vérifier la complétion des jalons
CREATE OR REPLACE FUNCTION trg_check_jalon_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_is_completed boolean;
BEGIN
  -- Vérifier si c'est un jalon
  IF NEW.type = 'jalon' THEN
    -- Vérifier si le jalon est complété
    v_is_completed := fn_check_jalon_completion(NEW.id);
    
    IF v_is_completed THEN
      -- Envoyer l'alerte de facturation
      PERFORM fn_alert_facturation_ca(NEW.affaire_id, NEW.lot_financier_id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS trg_jalon_completion_check ON planning_taches;

CREATE TRIGGER trg_jalon_completion_check
  AFTER UPDATE OF avancement_pct, statut ON planning_taches
  FOR EACH ROW
  WHEN (NEW.type = 'jalon')
  EXECUTE FUNCTION trg_check_jalon_completion();

-- ============================================================================
-- 4. VUES UTILITAIRES
-- ============================================================================

-- Vue pour les affaires avec leurs lots et jalons
CREATE OR REPLACE VIEW v_affaires_planification AS
SELECT 
  a.id,
  a.code_affaire,
  a.nom,
  a.statut,
  a.montant_total_ht,
  -- Compter les lots
  (SELECT COUNT(*) FROM affaires_lots_financiers WHERE affaire_id = a.id) as nb_lots,
  -- Compter les jalons
  (SELECT COUNT(*) FROM planning_taches WHERE affaire_id = a.id AND type = 'jalon') as nb_jalons,
  -- Compter les jalons terminés
  (SELECT COUNT(*) FROM planning_taches WHERE affaire_id = a.id AND type = 'jalon' AND avancement_pct = 100) as nb_jalons_termines,
  -- Compter les tâches
  (SELECT COUNT(*) FROM planning_taches WHERE affaire_id = a.id AND type = 'tache') as nb_taches,
  -- Montant total des lots
  (SELECT COALESCE(SUM(montant_ht), 0) FROM affaires_lots_financiers WHERE affaire_id = a.id) as montant_lots_ht
FROM affaires a;

-- ============================================================================
-- 5. COMMENTAIRES
-- ============================================================================

COMMENT ON FUNCTION fn_declare_planification IS 'Déclare la planification d''une affaire et crée les tâches/jalons';
COMMENT ON FUNCTION fn_create_jalons_from_lots IS 'Crée les jalons à partir des lots financiers d''une affaire';
COMMENT ON FUNCTION fn_check_jalon_completion IS 'Vérifie si un jalon est complété (100% + toutes les tâches terminées)';
COMMENT ON FUNCTION fn_alert_facturation_ca IS 'Envoie une alerte de facturation au CA';
COMMENT ON VIEW v_affaires_planification IS 'Vue des affaires avec leurs lots, jalons et tâches';

