-- Vérifier les demandes d'accès dans la base de données
-- À exécuter dans l'interface SQL de Supabase

-- 1. Vérifier toutes les demandes
SELECT 
  id,
  email,
  prenom,
  nom,
  statut,
  created_at,
  processed_at,
  processed_by
FROM access_requests 
ORDER BY created_at DESC;

-- 2. Compter par statut
SELECT 
  statut,
  COUNT(*) as count
FROM access_requests 
GROUP BY statut;

-- 3. Vérifier les politiques RLS
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies 
WHERE tablename = 'access_requests'
ORDER BY policyname;
