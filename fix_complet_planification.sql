-- ============================================================
-- SCRIPT COMPLET DE CORRECTION - PLANIFICATION
-- ============================================================
-- Ce script corrige TOUS les problèmes de planification
-- Date : 2025-01-20
-- ============================================================

-- ============================================================
-- ÉTAPE 1 : Supprimer l'ancien trigger
-- ============================================================
DROP TRIGGER IF EXISTS trg_validate_tache_dates_in_affaire ON planning_taches;

-- ============================================================
-- ÉTAPE 2 : Recréer la fonction trigger avec exception parapluie
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_validate_tache_dates_in_affaire()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_affaire_date_debut date;
    v_affaire_date_fin date;
    v_affaire_statut text;
BEGIN
    -- Récupérer les dates de l'affaire
    SELECT date_debut, date_fin_prevue, statut
    INTO v_affaire_date_debut, v_affaire_date_fin, v_affaire_statut
    FROM affaires
    WHERE id = NEW.affaire_id;
    
    -- Vérifier que la tâche commence après le début de l'affaire
    IF NEW.date_debut_plan < v_affaire_date_debut THEN
        RAISE EXCEPTION 'La tâche ne peut pas commencer avant le début de l''affaire (ID: %)', NEW.id;
    END IF;
    
    -- Vérifier que la tâche se termine avant la fin prévue (sauf si affaire ouverte OU si c'est une tâche parapluie)
    -- Les tâches parapluies peuvent dépasser la fin prévue car elles représentent la période réelle de planification
    IF NEW.date_fin_plan > v_affaire_date_fin 
       AND v_affaire_statut != 'Ouverte' 
       AND (NEW.is_parapluie_bpu IS NULL OR NEW.is_parapluie_bpu = false) THEN
        RAISE EXCEPTION 'La tâche ne peut pas se terminer après la fin prévue de l''affaire (ID: %)', NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- ============================================================
-- ÉTAPE 3 : Recréer le trigger
-- ============================================================
CREATE TRIGGER trg_validate_tache_dates_in_affaire
    BEFORE INSERT OR UPDATE ON planning_taches
    FOR EACH ROW
    EXECUTE FUNCTION trigger_validate_tache_dates_in_affaire();

COMMENT ON FUNCTION trigger_validate_tache_dates_in_affaire IS 'Vérifie que les dates de la tâche sont dans les bornes de l''affaire (sauf pour les tâches parapluies)';

-- ============================================================
-- ÉTAPE 4 : Corriger la fonction fn_declare_planification
-- ============================================================
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
    true,  -- ✅ CORRECTION : is_parapluie_bpu = true pour autoriser les dates étendues
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

COMMENT ON FUNCTION fn_declare_planification IS 'Déclare la planification d''une affaire et crée les tâches/jalons. La tâche parapluie peut dépasser la date_fin_prevue de l''affaire.';

-- ============================================================
-- ÉTAPE 5 : Vérification
-- ============================================================
-- Afficher un message de succès
DO $$
BEGIN
    RAISE NOTICE '✅ Script de correction exécuté avec succès !';
    RAISE NOTICE '✅ Trigger recréé avec exception parapluie';
    RAISE NOTICE '✅ Fonction fn_declare_planification corrigée';
    RAISE NOTICE '✅ Les tâches parapluies peuvent maintenant dépasser la date_fin_prevue';
END $$;

-- ============================================================
-- FIN DU SCRIPT
-- ============================================================



