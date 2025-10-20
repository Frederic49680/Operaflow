-- ============================================
-- FIX : Contraintes CHECK + Trigger pour alerts
-- ============================================
-- Date : 2025-01-20
-- Description : Corrige les CHECK constraints et le trigger
-- Note : Les politiques RLS sont déjà créées par fix_all_tables_rls_policies.sql
-- ============================================

-- 1. MODIFIER LE CHECK SUR LA COLONNE 'cible' pour accepter 'Administratif'
ALTER TABLE alerts DROP CONSTRAINT IF EXISTS alerts_cible_check;
ALTER TABLE alerts ADD CONSTRAINT alerts_cible_check 
    CHECK (cible IN ('RH', 'Responsable', 'Administratif', 'Planificateur', 'Direction'));

-- 2. MODIFIER LE CHECK SUR LA COLONNE 'statut' pour accepter 'non lu'
ALTER TABLE alerts DROP CONSTRAINT IF EXISTS alerts_statut_check;
ALTER TABLE alerts ADD CONSTRAINT alerts_statut_check 
    CHECK (statut IN ('envoyé', 'lu', 'non lu', 'traité'));

-- 3. MODIFIER LE TRIGGER : Seuil 15 jours → 30 jours
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
-- 1. Créer une absence maladie > 30 jours
-- 2. Vérifier dans Table Editor → alerts
-- ============================================

