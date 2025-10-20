-- Test de la planification automatique des affaires BPU

-- 1. Vérifier les affaires BPU existantes
SELECT 
  id,
  code_affaire,
  nom,
  type_affaire,
  statut,
  periode_debut,
  periode_fin
FROM affaires
WHERE type_affaire = 'BPU'
ORDER BY code_affaire;

-- 2. Vérifier si des tâches parapluie existent déjà
SELECT 
  t.id,
  t.libelle_tache,
  t.is_parapluie_bpu,
  t.date_debut_plan,
  t.date_fin_plan,
  t.statut,
  a.code_affaire,
  a.nom as affaire_nom
FROM planning_taches t
JOIN affaires a ON t.affaire_id = a.id
WHERE a.type_affaire = 'BPU'
  AND t.is_parapluie_bpu = true
ORDER BY a.code_affaire;

-- 3. Planifier toutes les affaires BPU non planifiées
SELECT * FROM fn_plan_all_bpu_affaires();

-- 4. Vérifier le résultat
SELECT 
  a.id,
  a.code_affaire,
  a.nom,
  a.type_affaire,
  a.statut,
  a.periode_debut,
  a.periode_fin,
  t.id as tache_id,
  t.libelle_tache,
  t.date_debut_plan,
  t.date_fin_plan,
  t.statut as tache_statut
FROM affaires a
LEFT JOIN planning_taches t ON t.affaire_id = a.id AND t.is_parapluie_bpu = true
WHERE a.type_affaire = 'BPU'
ORDER BY a.code_affaire;

-- 5. Test de création d'une nouvelle affaire BPU (pour tester le trigger)
DO $$
DECLARE
  v_affaire_id uuid;
  v_tache_id uuid;
BEGIN
  -- Créer une nouvelle affaire BPU
  INSERT INTO affaires (
    id,
    code_affaire,
    nom,
    site_id,
    client_id,
    responsable_id,
    type_affaire,
    statut,
    periode_debut,
    periode_fin,
    nb_ressources_ref,
    heures_semaine_ref,
    montant_total_ht
  ) VALUES (
    gen_random_uuid(),
    'AFF-TEST-BPU-001',
    'Test BPU automatique',
    (SELECT id FROM sites LIMIT 1),
    (SELECT id FROM clients LIMIT 1),
    (SELECT id FROM ressources LIMIT 1),
    'BPU',
    'A_planifier',
    CURRENT_DATE + INTERVAL '1 day',
    CURRENT_DATE + INTERVAL '30 days',
    2,
    35,
    50000
  )
  RETURNING id INTO v_affaire_id;
  
  RAISE NOTICE 'Affaire BPU créée: %', v_affaire_id;
  
  -- Vérifier que la tâche parapluie a été créée automatiquement
  SELECT id INTO v_tache_id
  FROM planning_taches
  WHERE affaire_id = v_affaire_id
    AND is_parapluie_bpu = true;
  
  IF FOUND THEN
    RAISE NOTICE '✅ Tâche parapluie créée automatiquement: %', v_tache_id;
  ELSE
    RAISE NOTICE '❌ Tâche parapluie NON créée';
  END IF;
  
  -- Vérifier que le statut de l'affaire a changé
  IF (SELECT statut FROM affaires WHERE id = v_affaire_id) = 'Validee' THEN
    RAISE NOTICE '✅ Statut de l''affaire changé en Validee';
  ELSE
    RAISE NOTICE '❌ Statut de l''affaire n''a PAS changé';
  END IF;
  
  -- Nettoyer : supprimer l'affaire de test
  DELETE FROM planning_taches WHERE affaire_id = v_affaire_id;
  DELETE FROM affaires WHERE id = v_affaire_id;
  
  RAISE NOTICE '✅ Test terminé, affaire de test supprimée';
END $$;

