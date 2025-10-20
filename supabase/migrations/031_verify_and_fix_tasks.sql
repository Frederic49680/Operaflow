-- Migration pour vérifier et corriger les données des tâches
-- Date : 20/10/2025

-- 1. Vérifier les tâches sans site_id
SELECT 
    id,
    libelle_tache,
    affaire_id,
    site_id,
    date_debut_plan,
    date_fin_plan,
    statut
FROM planning_taches
WHERE site_id IS NULL;

-- 2. Vérifier les tâches sans libelle_tache
SELECT 
    id,
    libelle_tache,
    affaire_id,
    site_id,
    statut
FROM planning_taches
WHERE libelle_tache IS NULL OR libelle_tache = '';

-- 3. Mettre à jour les tâches sans site_id
-- On assigne le site_id de l'affaire si disponible
UPDATE planning_taches t
SET site_id = a.site_id
FROM affaires a
WHERE t.affaire_id = a.id
  AND t.site_id IS NULL
  AND a.site_id IS NOT NULL;

-- 4. Supprimer les tâches sans libelle_tache (tâches invalides)
DELETE FROM planning_taches
WHERE libelle_tache IS NULL OR libelle_tache = '';

-- 5. Vérifier les relations avec les affaires
SELECT 
    t.id,
    t.libelle_tache,
    t.affaire_id,
    a.code_affaire,
    a.nom as affaire_nom
FROM planning_taches t
LEFT JOIN affaires a ON t.affaire_id = a.id
WHERE a.id IS NULL;

-- 6. Vérifier les relations avec les sites
SELECT 
    t.id,
    t.libelle_tache,
    t.site_id,
    s.nom as site_nom
FROM planning_taches t
LEFT JOIN sites s ON t.site_id = s.id
WHERE s.id IS NULL;

-- 7. Afficher un résumé des données
SELECT 
    COUNT(*) as total_taches,
    COUNT(DISTINCT affaire_id) as nb_affaires,
    COUNT(DISTINCT site_id) as nb_sites,
    COUNT(CASE WHEN statut = 'En cours' THEN 1 END) as en_cours,
    COUNT(CASE WHEN statut = 'Terminé' THEN 1 END) as terminees
FROM planning_taches;

-- 8. Afficher les 5 dernières tâches pour vérification
SELECT 
    t.id,
    t.libelle_tache,
    t.affaire_id,
    a.code_affaire,
    t.site_id,
    s.nom as site_nom,
    t.date_debut_plan,
    t.date_fin_plan,
    t.statut
FROM planning_taches t
LEFT JOIN affaires a ON t.affaire_id = a.id
LEFT JOIN sites s ON t.site_id = s.id
ORDER BY t.date_debut_plan DESC
LIMIT 5;

