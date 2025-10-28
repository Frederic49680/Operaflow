-- Migration 084: Simplifier complètement les politiques RLS access_requests
-- Supprimer toutes les références à auth.users et auth.uid()

-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Admins full access" ON access_requests;
DROP POLICY IF EXISTS "Allow anonymous insert" ON access_requests;
DROP POLICY IF EXISTS "Users read own requests" ON access_requests;

-- Désactiver temporairement RLS pour les tests
ALTER TABLE access_requests DISABLE ROW LEVEL SECURITY;

-- Réactiver RLS avec des politiques ultra-simples
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

-- Politique 1: Permettre l'insertion anonyme (formulaire de demande)
CREATE POLICY "Allow anonymous insert" ON access_requests
FOR INSERT
TO anon
WITH CHECK (true);

-- Politique 2: Permettre la lecture/écriture pour tous les utilisateurs authentifiés
-- (temporaire pour permettre aux admins d'accéder)
CREATE POLICY "Authenticated users access" ON access_requests
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Test de la politique simplifiée
SELECT 'Test politique simplifiée' as test, COUNT(*) as nb_demandes
FROM access_requests;
