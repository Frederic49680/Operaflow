-- ============================================================================
-- Migration 018 : Correction de la fonction aggregate_affaire_from_lots
-- ============================================================================
-- Auteur : Fred Baudry
-- Date : 2025-01-18
-- Description : Correction des colonnes dans la fonction aggregate_affaire_from_lots
-- ============================================================================

-- ============================================================================
-- FONCTION CORRIGÉE : Agréger les lots vers l'affaire
-- ============================================================================
CREATE OR REPLACE FUNCTION aggregate_affaire_from_lots()
RETURNS TRIGGER AS $$
DECLARE
    total_budget NUMERIC(12, 2);
    total_consomme NUMERIC(12, 2);
    total_atterrissage NUMERIC(12, 2);
    avg_avancement NUMERIC(5, 2);
    min_debut DATE;
    max_fin DATE;
BEGIN
    -- Calculer les totaux
    SELECT 
        SUM(budget_ht),
        SUM(montant_consomme),
        SUM(atterrissage),
        AVG(avancement_pct),
        MIN(date_debut_reelle),
        MAX(date_fin_reelle)
    INTO 
        total_budget,
        total_consomme,
        total_atterrissage,
        avg_avancement,
        min_debut,
        max_fin
    FROM affaires_lots
    WHERE affaire_id = COALESCE(NEW.affaire_id, OLD.affaire_id);
    
    -- Mettre à jour l'affaire
    UPDATE affaires
    SET 
        avancement_pct = COALESCE(avg_avancement, 0),
        montant_consomme = COALESCE(total_consomme, 0),
        reste_a_faire = GREATEST(COALESCE(total_budget, 0) - COALESCE(total_consomme, 0), 0),
        atterrissage = COALESCE(total_atterrissage, 0),
        date_debut = min_debut,  -- ✅ Corrigé : date_debut au lieu de date_debut_reelle
        date_fin_reelle = max_fin,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.affaire_id, OLD.affaire_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Fonction aggregate_affaire_from_lots corrigée avec succès !';
END $$;

