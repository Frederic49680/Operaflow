-- Migration 036 : Planification automatique des affaires BPU

-- Fonction pour planifier automatiquement une affaire BPU
CREATE OR REPLACE FUNCTION fn_auto_plan_bpu_affaire(p_affaire_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_affaire RECORD;
  v_tache_id uuid;
  v_date_debut date;
  v_date_fin date;
BEGIN
  -- Récupérer les informations de l'affaire BPU
  SELECT 
    id,
    code_affaire,
    nom,
    statut,
    type_affaire,
    site_id,
    responsable_id,
    periode_debut,
    periode_fin,
    nb_ressources_ref,
    heures_semaine_ref
  INTO v_affaire
  FROM affaires
  WHERE id = p_affaire_id
    AND type_affaire = 'BPU'
    AND statut = 'A_planifier';
  
  -- Vérifier que l'affaire existe et est bien une BPU
  IF NOT FOUND THEN
    RAISE NOTICE 'Affaire % non trouvée ou non BPU ou déjà planifiée', p_affaire_id;
    RETURN;
  END IF;
  
  -- Déterminer les dates de début et fin
  IF v_affaire.periode_debut IS NOT NULL AND v_affaire.periode_fin IS NOT NULL THEN
    v_date_debut := v_affaire.periode_debut;
    v_date_fin := v_affaire.periode_fin;
  ELSE
    -- Dates par défaut si non définies
    v_date_debut := CURRENT_DATE;
    v_date_fin := CURRENT_DATE + INTERVAL '1 month';
  END IF;
  
  -- Créer la tâche parapluie BPU
  INSERT INTO planning_taches (
    id,
    affaire_id,
    site_id,
    libelle_tache,
    type_tache,
    date_debut_plan,
    date_fin_plan,
    avancement_pct,
    statut,
    is_parapluie_bpu,
    type
  ) VALUES (
    gen_random_uuid(),
    v_affaire.id,
    v_affaire.site_id,
    'Contrat ' || v_affaire.nom || ' — Décharge batterie',
    'Exécution',
    v_date_debut,
    v_date_fin,
    0,
    'Non lancé',
    true,
    'tache'
  )
  RETURNING id INTO v_tache_id;
  
  -- Changer le statut de l'affaire en 'Validee'
  UPDATE affaires
  SET statut = 'Validee'
  WHERE id = v_affaire.id;
  
  RAISE NOTICE 'Affaire BPU % planifiée automatiquement. Tâche parapluie créée: %', v_affaire.code_affaire, v_tache_id;
END;
$$;

-- Trigger pour planifier automatiquement les affaires BPU à la création
CREATE OR REPLACE FUNCTION trg_auto_plan_bpu_on_create()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Si c'est une affaire BPU avec statut 'A_planifier', la planifier automatiquement
  IF NEW.type_affaire = 'BPU' AND NEW.statut = 'A_planifier' THEN
    PERFORM fn_auto_plan_bpu_affaire(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger
DROP TRIGGER IF EXISTS trg_auto_plan_bpu_affaire ON affaires;
CREATE TRIGGER trg_auto_plan_bpu_affaire
  AFTER INSERT ON affaires
  FOR EACH ROW
  EXECUTE FUNCTION trg_auto_plan_bpu_on_create();

-- Fonction pour planifier toutes les affaires BPU existantes qui ne sont pas encore planifiées
CREATE OR REPLACE FUNCTION fn_plan_all_bpu_affaires()
RETURNS TABLE(
  affaire_code text,
  affaire_nom text,
  tache_id uuid,
  statut text
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_affaire RECORD;
  v_tache_id uuid;
BEGIN
  -- Parcourir toutes les affaires BPU avec statut 'A_planifier'
  FOR v_affaire IN 
    SELECT id, code_affaire, nom
    FROM affaires
    WHERE affaires.type_affaire = 'BPU'
      AND affaires.statut = 'A_planifier'
  LOOP
    -- Planifier l'affaire
    PERFORM fn_auto_plan_bpu_affaire(v_affaire.id);
    
    -- Récupérer l'ID de la tâche créée
    SELECT id INTO v_tache_id
    FROM planning_taches
    WHERE affaire_id = v_affaire.id
      AND is_parapluie_bpu = true
    LIMIT 1;
    
    -- Retourner les informations
    RETURN QUERY SELECT v_affaire.code_affaire, v_affaire.nom, v_tache_id, 'Planifiée'::text;
  END LOOP;
END;
$$;

-- Commentaires
COMMENT ON FUNCTION fn_auto_plan_bpu_affaire(uuid) IS 'Planifie automatiquement une affaire BPU en créant une tâche parapluie et en changeant le statut en Validee';
COMMENT ON FUNCTION trg_auto_plan_bpu_on_create() IS 'Trigger qui planifie automatiquement les affaires BPU à la création';
COMMENT ON FUNCTION fn_plan_all_bpu_affaires() IS 'Planifie toutes les affaires BPU existantes qui ne sont pas encore planifiées';

