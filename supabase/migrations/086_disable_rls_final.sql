-- Migration 086: Désactiver RLS sur access_requests pour permettre l'accès admin
-- Cette migration désactive temporairement RLS pour permettre aux admins d'accéder aux données

-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Allow anonymous insert" ON access_requests;
DROP POLICY IF EXISTS "Authenticated users access" ON access_requests;
DROP POLICY IF EXISTS "Admins full access" ON access_requests;
DROP POLICY IF EXISTS "Users read own requests" ON access_requests;

-- Désactiver RLS temporairement
ALTER TABLE access_requests DISABLE ROW LEVEL SECURITY;

-- Test de l'accès sans RLS
SELECT 'RLS désactivé temporairement' as status, COUNT(*) as nb_demandes
FROM access_requests;

-- Note: RLS sera réactivé plus tard avec des politiques correctes
