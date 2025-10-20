-- ============================================
-- CRÉATION TABLE alerts + POLITIQUES RLS
-- ============================================
-- Date : 2025-01-20
-- Description : Crée la table alerts et toutes les politiques RLS nécessaires
-- ============================================

-- 1. Créer la table alerts si elle n'existe pas
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cible text NOT NULL,
  type text NOT NULL,
  message text NOT NULL,
  date_envoi timestamptz DEFAULT now(),
  statut text DEFAULT 'non lu',
  created_at timestamptz DEFAULT now()
);

-- 2. Activer RLS sur la table alerts
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- 3. Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Insertion alerte par utilisateur authentifié" ON alerts;
DROP POLICY IF EXISTS "Lecture alertes par utilisateur authentifié" ON alerts;
DROP POLICY IF EXISTS "Modification alertes par utilisateur authentifié" ON alerts;
DROP POLICY IF EXISTS "Suppression alertes par utilisateur authentifié" ON alerts;

-- 4. Créer les nouvelles politiques

-- Politique INSERT
CREATE POLICY "Insertion alerte par utilisateur authentifié"
    ON alerts FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Politique SELECT
CREATE POLICY "Lecture alertes par utilisateur authentifié"
    ON alerts FOR SELECT
    TO authenticated
    USING (true);

-- Politique UPDATE
CREATE POLICY "Modification alertes par utilisateur authentifié"
    ON alerts FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Politique DELETE
CREATE POLICY "Suppression alertes par utilisateur authentifié"
    ON alerts FOR DELETE
    TO authenticated
    USING (true);

-- 5. Créer un index sur la colonne cible pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_alerts_cible ON alerts(cible);

-- 6. Créer un index sur la colonne statut
CREATE INDEX IF NOT EXISTS idx_alerts_statut ON alerts(statut);

-- 7. Créer un index sur la colonne date_envoi
CREATE INDEX IF NOT EXISTS idx_alerts_date_envoi ON alerts(date_envoi DESC);

-- ============================================
-- FIN DU SCRIPT
-- ============================================
-- Vérification : 
-- 1. Va dans Table Editor → Tu devrais voir la table "alerts"
-- 2. Essaie de créer une absence maladie > 30 jours
-- 3. Une alerte devrait apparaître dans la table alerts
-- ============================================

