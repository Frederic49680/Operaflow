-- ============================================================================
-- Script d'insertion de données de test pour formations_sessions
-- ============================================================================

-- Insérer quelques sessions de test
INSERT INTO formations_sessions (
    formation_id,
    organisme_id,
    site_id,
    lieu,
    date_debut,
    date_fin,
    capacite,
    cout_session_ht,
    statut
) VALUES
(
    (SELECT id FROM formations_catalogue WHERE actif = true LIMIT 1),
    (SELECT id FROM organismes_formation WHERE actif = true LIMIT 1),
    (SELECT id FROM sites WHERE statut = 'Actif' LIMIT 1),
    'Salle de formation A',
    '2025-02-15',
    '2025-02-17',
    15,
    2500.00,
    'Ouverte'
),
(
    (SELECT id FROM formations_catalogue WHERE actif = true LIMIT 1 OFFSET 1),
    (SELECT id FROM organismes_formation WHERE actif = true LIMIT 1),
    (SELECT id FROM sites WHERE statut = 'Actif' LIMIT 1 OFFSET 1),
    'Salle de formation B',
    '2025-03-10',
    '2025-03-12',
    20,
    3500.00,
    'Ouverte'
),
(
    (SELECT id FROM formations_catalogue WHERE actif = true LIMIT 1),
    (SELECT id FROM organismes_formation WHERE actif = true LIMIT 1 OFFSET 1),
    NULL,
    'Formation à distance',
    '2025-02-20',
    '2025-02-20',
    50,
    1500.00,
    'Fermée'
);

-- Vérifier les données insérées
SELECT 
    s.id,
    f.libelle as formation,
    o.nom as organisme,
    s.lieu,
    s.date_debut,
    s.date_fin,
    s.capacite,
    s.cout_session_ht,
    s.statut
FROM formations_sessions s
LEFT JOIN formations_catalogue f ON s.formation_id = f.id
LEFT JOIN organismes_formation o ON s.organisme_id = o.id
ORDER BY s.date_debut DESC;

