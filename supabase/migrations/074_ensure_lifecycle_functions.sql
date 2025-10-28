-- Migration 074: S'assurer que toutes les fonctions de cycle de vie sont présentes
-- Date: 2025-01-27
-- Description: Vérifier et recréer les fonctions de cycle de vie des activités

-- Supprimer les fonctions existantes si elles existent
DROP FUNCTION IF EXISTS suspend_activite(UUID, TEXT, UUID, INTEGER);
DROP FUNCTION IF EXISTS reprend_activite(UUID, UUID);
DROP FUNCTION IF EXISTS reporte_activite(UUID, TEXT, UUID, DATE);
DROP FUNCTION IF EXISTS prolonge_activite(UUID, TEXT, UUID, INTEGER);
DROP FUNCTION IF EXISTS lance_activite(UUID, UUID);

-- Fonction pour suspendre une activité
CREATE OR REPLACE FUNCTION suspend_activite(
  tache_id UUID,
  motif TEXT,
  responsable_id UUID,
  duree_estimee INTEGER DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_tache planning_taches%ROWTYPE;
  v_result JSONB;
BEGIN
  -- Récupérer la tâche
  SELECT * INTO v_tache FROM planning_taches WHERE id = tache_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Tâche non trouvée');
  END IF;
  
  -- Vérifier le statut
  IF v_tache.statut != 'En cours' THEN
    RETURN jsonb_build_object('success', false, 'message', 'La tâche doit être en cours pour être suspendue');
  END IF;
  
  -- Mettre à jour la tâche
  UPDATE planning_taches 
  SET 
    statut = 'Suspendu',
    motif_suspension = motif,
    date_suspension = NOW(),
    responsable_suspension = responsable_id,
    updated_at = NOW()
  WHERE id = tache_id;
  
  -- Retourner le résultat
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Activité suspendue avec succès',
    'tache_id', tache_id,
    'statut', 'Suspendu'
  );
END;
$$;

-- Fonction pour reprendre une activité
CREATE OR REPLACE FUNCTION reprend_activite(
  tache_id UUID,
  responsable_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_tache planning_taches%ROWTYPE;
BEGIN
  -- Récupérer la tâche
  SELECT * INTO v_tache FROM planning_taches WHERE id = tache_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Tâche non trouvée');
  END IF;
  
  -- Vérifier le statut
  IF v_tache.statut NOT IN ('Suspendu', 'Prolongé', 'Reporté') THEN
    RETURN jsonb_build_object('success', false, 'message', 'La tâche doit être suspendue, prolongée ou reportée pour être reprise');
  END IF;
  
  -- Mettre à jour la tâche
  UPDATE planning_taches 
  SET 
    statut = 'En cours',
    date_reprise = NOW(),
    updated_at = NOW()
  WHERE id = tache_id;
  
  -- Retourner le résultat
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Activité reprise avec succès',
    'tache_id', tache_id,
    'statut', 'En cours'
  );
END;
$$;

-- Fonction pour reporter une activité
CREATE OR REPLACE FUNCTION reporte_activite(
  tache_id UUID,
  motif TEXT,
  responsable_id UUID,
  nouvelle_date_fin DATE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_tache planning_taches%ROWTYPE;
BEGIN
  -- Récupérer la tâche
  SELECT * INTO v_tache FROM planning_taches WHERE id = tache_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Tâche non trouvée');
  END IF;
  
  -- Mettre à jour la tâche
  UPDATE planning_taches 
  SET 
    statut = 'Reporté',
    motif_report = motif,
    date_report = NOW(),
    date_fin_plan = COALESCE(nouvelle_date_fin, date_fin_plan),
    updated_at = NOW()
  WHERE id = tache_id;
  
  -- Retourner le résultat
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Activité reportée avec succès',
    'tache_id', tache_id,
    'statut', 'Reporté'
  );
END;
$$;

-- Fonction pour prolonger une activité
CREATE OR REPLACE FUNCTION prolonge_activite(
  tache_id UUID,
  motif TEXT,
  responsable_id UUID,
  duree_sup INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_tache planning_taches%ROWTYPE;
BEGIN
  -- Récupérer la tâche
  SELECT * INTO v_tache FROM planning_taches WHERE id = tache_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Tâche non trouvée');
  END IF;
  
  -- Mettre à jour la tâche
  UPDATE planning_taches 
  SET 
    statut = 'Prolongé',
    motif_prolongation = motif,
    duree_sup = duree_sup,
    date_fin_plan = date_fin_plan + INTERVAL '1 day' * duree_sup,
    updated_at = NOW()
  WHERE id = tache_id;
  
  -- Retourner le résultat
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Activité prolongée avec succès',
    'tache_id', tache_id,
    'statut', 'Prolongé'
  );
END;
$$;

-- Fonction pour lancer une activité
CREATE OR REPLACE FUNCTION lance_activite(
  tache_id UUID,
  responsable_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_tache planning_taches%ROWTYPE;
BEGIN
  -- Récupérer la tâche
  SELECT * INTO v_tache FROM planning_taches WHERE id = tache_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Tâche non trouvée');
  END IF;
  
  -- Vérifier le statut
  IF v_tache.statut != 'Non lancé' THEN
    RETURN jsonb_build_object('success', false, 'message', 'La tâche doit être non lancée pour être lancée');
  END IF;
  
  -- Mettre à jour la tâche
  UPDATE planning_taches 
  SET 
    statut = 'En cours',
    date_lancement = NOW(),
    updated_at = NOW()
  WHERE id = tache_id;
  
  -- Retourner le résultat
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Activité lancée avec succès',
    'tache_id', tache_id,
    'statut', 'En cours'
  );
END;
$$;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Migration 074 terminée avec succès !';
  RAISE NOTICE 'Fonctions de cycle de vie créées : lance_activite, suspend_activite, reprend_activite, reporte_activite, prolonge_activite';
END $$;
