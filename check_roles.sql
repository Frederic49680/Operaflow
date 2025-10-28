-- Vérifier les rôles existants
SELECT id, code, label, system FROM roles ORDER BY code;

-- Vérifier les permissions existantes
SELECT id, code, label FROM permissions ORDER BY code;
