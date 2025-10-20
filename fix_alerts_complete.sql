-- ============================================
-- FIX COMPLET : Table alerts + Politiques + Triggers
-- ============================================
-- Date : 2025-01-20
-- Description : Corrige la table alerts pour les notifications automatiques
-- ============================================

-- 1. MODIFIER LE CHECK SUR LA COLONNE 'cible' pour accepter 'Administratif'
ALTER TABLE alerts DROP CONSTRAINT IF EXISTS alerts_cible_check;
ALTER TABLE alerts ADD CONSTRAINT alerts_cible_check 
    CHECK (cible IN ('RH', 'Responsable', 'Administratif', 'Planificateur', 'Direction'));

-- 2. MODIFIER LE CHECK SUR LA COLONNE 'statut' pour accepter 'non lu'
ALTER TABLE alerts DROP CONSTRAINT IF EXISTS alerts_statut_check;
ALTER TABLE alerts ADD CONSTRAINT alerts_statut_check 
    CHECK (statut IN ('envoyé', 'lu', 'non lu', 'traité'));

-- 3. SUPPRIMER LES ANCIENNES POLITIQUES
DROP POLICY IF EXISTS "Lecture publique des alertes" ON alerts;
DROP POLICY IF EXISTS "Insertion alerte par utilisateur authentifié" ON alerts;
DROP POLICY IF EXISTS "Lecture alertes par utilisateur authentifié" ON alerts;
DROP POLICY IF EXISTS "Modification alertes par utilisateur authentifié" ON alerts;
DROP POLICY IF EXISTS "Suppression alertes par utilisateur authentifié" ON alerts;
DROP POLICY IF EXISTS "Insertion alerte par tous les utilisateurs" ON alerts;
DROP POLICY IF EXISTS "Lecture alertes par tous les utilisateurs" ON alerts;
DROP POLICY IF EXISTS "Modification alertes par tous les utilisateurs" ON alerts;
DROP POLICY IF EXISTS "Suppression alertes par tous les utilisateurs" ON alerts;

-- 4. CRÉER LES NOUVELLES POLITIQUES (ANON + AUTHENTICATED)

-- Politique INSERT
CREATE POLICY "Insertion alerte par tous"
    ON alerts FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Politique SELECT
CREATE POLICY "Lecture alertes par tous"
    ON alerts FOR SELECT
    TO anon, authenticated
    USING (true);

-- Politique UPDATE
CREATE POLICY "Modification alertes par tous"
    ON alerts FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Politique DELETE
CREATE POLICY "Suppression alertes par tous"
    ON alerts FOR DELETE
    TO anon, authenticated
    USING (true);

-- 5. MODIFIER LE TRIGGER : Seuil 15 jours → 30 jours
CREATE OR REPLACE FUNCTION check_long_absence()
RETURNS TRIGGER AS $$
DECLARE
    absence_duration INTEGER;
BEGIN
    absence_duration := NEW.date_fin - NEW.date_debut;
    
    -- Seuil modifié : 30 jours au lieu de 15
    IF absence_duration > 30 THEN
        INSERT INTO alerts (cible, type, message)
        VALUES (
            'RH',
            'Absence longue',
            'Absence de ' || absence_duration || ' jours détectée pour la ressource ' || NEW.ressource_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VÉRIFICATION
-- ============================================
-- Pour vérifier que tout est OK :
-- 1. SELECT * FROM pg_policies WHERE tablename = 'alerts';
-- 2. Créer une absence maladie > 30 jours
-- 3. Vérifier dans Table Editor → alerts
-- ============================================

