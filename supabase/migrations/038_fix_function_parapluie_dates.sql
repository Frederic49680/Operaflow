-- Migration 038 : Correction de la fonction fn_declare_planification
-- Date : 2025-01-20
-- Description : Corrige la fonction pour définir is_parapluie_bpu = true lors de la création de la tâche parapluie

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
    true,  -- ✅ CORRIGÉ : is_parapluie_bpu = true pour autoriser les dates étendues
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

