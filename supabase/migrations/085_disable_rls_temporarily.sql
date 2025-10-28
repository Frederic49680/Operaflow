-- Migration 085: Désactiver complètement RLS sur access_requests temporairement
-- Pour permettre le fonctionnement de l'admin

-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Allow anonymous insert" ON access_requests;
DROP POLICY IF EXISTS "Authenticated users access" ON access_requests;

-- Désactiver complètement RLS
ALTER TABLE access_requests DISABLE ROW LEVEL SECURITY;

-- Test de l'accès sans RLS
SELECT 'RLS désactivé' as status, COUNT(*) as nb_demandes
FROM access_requests;
