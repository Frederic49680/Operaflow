-- Migration 025: Fonction de désactivation complète d'une ressource
-- Description: Désactive une ressource, retire ses affectations et crée des alertes pour le planificateur
-- Date: 2025-01-20

-- Fonction pour désactiver une ressource et gérer les affectations
CREATE OR REPLACE FUNCTION fn_desactiver_ressource(
  p_ressource_id UUID,
  p_date_sortie DATE,
  p_motif TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ressource_nom TEXT;
  v_ressource_prenom TEXT;
  v_taches_affectees JSONB;
  v_nb_taches INTEGER;
BEGIN
  -- 1. Récupérer le nom de la ressource
  SELECT nom, prenom INTO v_ressource_nom, v_ressource_prenom
  FROM ressources
  WHERE id = p_ressource_id;

  IF v_ressource_nom IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Ressource non trouvée'
    );
  END IF;

  -- 2. Récupérer les tâches affectées à cette ressource
  SELECT 
    jsonb_agg(
      jsonb_build_object(
        'id', id,
        'libelle', libelle_tache,
        'affaire_id', affaire_id,
        'date_debut_plan', date_debut_plan,
        'date_fin_plan', date_fin_plan
      )
    ),
    COUNT(*)
  INTO v_taches_affectees, v_nb_taches
  FROM planning_taches
  WHERE ressource_ids @> ARRAY[p_ressource_id]::UUID[];

  -- 3. Retirer la ressource de toutes les affectations
  UPDATE planning_taches
  SET ressource_ids = array_remove(ressource_ids, p_ressource_id)
  WHERE ressource_ids @> ARRAY[p_ressource_id]::UUID[];

  -- 4. Désactiver la ressource
  UPDATE ressources
  SET 
    actif = false,
    date_sortie = p_date_sortie,
    updated_at = NOW()
  WHERE id = p_ressource_id;

  -- 5. Créer une alerte pour le planificateur si des tâches étaient affectées
  IF v_nb_taches > 0 THEN
    INSERT INTO alerts (
      cible,
      type,
      message,
      date_envoi,
      statut
    ) VALUES (
      'Planificateur',
      'Désactivation ressource',
      format(
        '⚠️ Désactivation de %s %s (date sortie: %s). %s tâche(s) à réaffecter. Motif: %s',
        v_ressource_prenom,
        v_ressource_nom,
        p_date_sortie,
        v_nb_taches,
        COALESCE(p_motif, 'Non spécifié')
      ),
      NOW(),
      'envoyé'
    );
  END IF;

  -- 6. Enregistrer dans l'historique
  INSERT INTO historique_actions (
    element_type,
    element_id,
    action,
    valeur_apres,
    commentaire
  ) VALUES (
    'ressource',
    p_ressource_id,
    'désactivation',
    jsonb_build_object(
      'actif', false,
      'date_sortie', p_date_sortie,
      'motif', p_motif,
      'nb_taches_impactees', v_nb_taches
    ),
    p_motif
  );

  -- 7. Retourner le résultat
  RETURN jsonb_build_object(
    'success', true,
    'ressource_nom', v_ressource_nom,
    'ressource_prenom', v_ressource_prenom,
    'nb_taches_impactees', v_nb_taches,
    'taches_affectees', COALESCE(v_taches_affectees, '[]'::jsonb)
  );
END;
$$;

-- Commentaire
COMMENT ON FUNCTION fn_desactiver_ressource IS 'Désactive une ressource, retire ses affectations et crée des alertes pour le planificateur';

