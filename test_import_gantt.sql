-- Script de test pour vérifier les données après import

-- 1. Compter le nombre de tâches
SELECT COUNT(*) as nombre_taches FROM planning_taches;

-- 2. Voir les dernières tâches importées
SELECT 
    libelle_tache,
    a.code_affaire,
    s.nom as site,
    type_tache,
    date_debut_plan,
    date_fin_plan,
    statut,
    avancement_pct
FROM planning_taches t
LEFT JOIN affaires a ON t.affaire_id = a.id
LEFT JOIN sites s ON t.site_id = s.id
ORDER BY t.created_at DESC
LIMIT 10;

-- 3. Vérifier les tâches par statut
SELECT 
    statut,
    COUNT(*) as nombre
FROM planning_taches
GROUP BY statut
ORDER BY nombre DESC;

-- 4. Vérifier les tâches par site
SELECT 
    s.nom as site,
    COUNT(t.id) as nb_taches
FROM sites s
LEFT JOIN planning_taches t ON s.id = t.site_id
GROUP BY s.nom
ORDER BY nb_taches DESC;

-- 5. Vérifier les tâches par affaire
SELECT 
    a.code_affaire,
    a.nom as affaire,
    COUNT(t.id) as nb_taches
FROM affaires a
LEFT JOIN planning_taches t ON a.id = t.affaire_id
GROUP BY a.code_affaire, a.nom
ORDER BY nb_taches DESC;

-- 6. Vérifier les dates (pour le Gantt)
SELECT 
    MIN(date_debut_plan) as premiere_date,
    MAX(date_fin_plan) as derniere_date,
    COUNT(*) as nombre_taches
FROM planning_taches;

-- 7. Voir toutes les tâches avec leurs relations
SELECT 
    t.id,
    t.libelle_tache,
    a.code_affaire,
    s.nom as site,
    t.type_tache,
    t.date_debut_plan,
    t.date_fin_plan,
    t.avancement_pct,
    t.statut,
    t.created_at
FROM planning_taches t
LEFT JOIN affaires a ON t.affaire_id = a.id
LEFT JOIN sites s ON t.site_id = s.id
ORDER BY t.date_debut_plan;

