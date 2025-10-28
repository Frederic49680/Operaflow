-- Vérifier les rôles disponibles et leurs IDs
SELECT 
  'Rôles disponibles:' as status,
  id as role_id,
  code,
  label
FROM roles 
ORDER BY code;
