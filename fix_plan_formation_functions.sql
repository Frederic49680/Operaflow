-- Script de correction pour les fonctions Plan de Formation
-- À exécuter dans Supabase SQL Editor

-- Corriger la fonction commit_plan_formation
CREATE OR REPLACE FUNCTION commit_plan_formation(target_annee INTEGER)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    next_version INTEGER;
    total_count INTEGER;
    total_cost NUMERIC(10,2);
    by_category JSONB;
    by_quarter JSONB;
    by_month JSONB;
BEGIN
    -- Calculer la prochaine version
    SELECT COALESCE(MAX(version), 0) + 1 INTO next_version 
    FROM plan_snapshots WHERE annee = target_annee;
    
    -- Calculer les totaux
    SELECT 
        COUNT(*),
        COALESCE(SUM(cout_estime), 0),
        jsonb_object_agg(category, category_stats)
    INTO total_count, total_cost, by_category
    FROM (
        SELECT 
            category,
            jsonb_build_object('count', COUNT(*), 'cost', COALESCE(SUM(cout_estime), 0)) as category_stats
        FROM plan_formations 
        WHERE annee = target_annee AND phase = 'PREVISIONNEL' AND statut = 'VALIDE'
        GROUP BY category
    ) cat_stats;
    
    -- Calculer par trimestre
    SELECT jsonb_object_agg(trimestre_cible, quarter_stats)
    INTO by_quarter
    FROM (
        SELECT 
            trimestre_cible,
            jsonb_build_object('count', COUNT(*), 'cost', COALESCE(SUM(cout_estime), 0)) as quarter_stats
        FROM plan_formations 
        WHERE annee = target_annee AND phase = 'PREVISIONNEL' AND statut = 'VALIDE'
        GROUP BY trimestre_cible
    ) quarter_stats;
    
    -- Calculer par mois
    SELECT jsonb_object_agg(mois_cible, month_stats)
    INTO by_month
    FROM (
        SELECT 
            mois_cible,
            jsonb_build_object('count', COUNT(*), 'cost', COALESCE(SUM(cout_estime), 0)) as month_stats
        FROM plan_formations 
        WHERE annee = target_annee AND phase = 'PREVISIONNEL' AND statut = 'VALIDE'
        GROUP BY mois_cible
    ) month_stats;
    
    -- Créer le snapshot
    INSERT INTO plan_snapshots (
        annee, version, tot_count, tot_cost, by_category, by_quarter, by_month
    ) VALUES (
        target_annee, next_version, total_count, total_cost, by_category, by_quarter, by_month
    );
    
    -- Mettre à jour les lignes validées
    UPDATE plan_formations 
    SET 
        phase = 'PLAN',
        baseline_version = next_version,
        cost_planned = cout_estime,
        validated_at = NOW()
    WHERE annee = target_annee AND phase = 'PREVISIONNEL' AND statut = 'VALIDE';
    
    result := jsonb_build_object(
        'success', true,
        'annee', target_annee,
        'version', next_version,
        'total_count', total_count,
        'total_cost', total_cost,
        'message', 'Plan de formation validé et figé'
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Corriger la fonction get_plan_kpis pour utiliser cost_planned si disponible
CREATE OR REPLACE FUNCTION get_plan_kpis(target_annee INTEGER, target_version INTEGER DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    baseline_count INTEGER;
    baseline_cost NUMERIC(10,2);
    planifie_count INTEGER;
    realise_count INTEGER;
    total_count INTEGER;
    taux_avancement NUMERIC(5,2);
    taux_couverture NUMERIC(5,2);
    budget_engage NUMERIC(10,2);
    budget_consomme NUMERIC(10,2);
    ecart_budget NUMERIC(10,2);
BEGIN
    -- Si pas de version spécifiée, prendre la dernière
    IF target_version IS NULL THEN
        SELECT MAX(version) INTO target_version 
        FROM plan_snapshots WHERE annee = target_annee;
    END IF;
    
    -- Récupérer les données de baseline
    SELECT tot_count, tot_cost INTO baseline_count, baseline_cost
    FROM plan_snapshots 
    WHERE annee = target_annee AND version = target_version;
    
    -- Compter les statuts actuels
    SELECT 
        COUNT(*) FILTER (WHERE statut = 'PLANIFIE'),
        COUNT(*) FILTER (WHERE statut = 'REALISE'),
        COUNT(*)
    INTO planifie_count, realise_count, total_count
    FROM plan_formations 
    WHERE annee = target_annee AND baseline_version = target_version;
    
    -- Calculer les taux
    IF baseline_count > 0 THEN
        taux_avancement := ((planifie_count + realise_count)::NUMERIC / baseline_count) * 100;
        taux_couverture := (realise_count::NUMERIC / baseline_count) * 100;
    ELSE
        taux_avancement := 0;
        taux_couverture := 0;
    END IF;
    
    -- Calculer les budgets
    SELECT 
        COALESCE(SUM(amount) FILTER (WHERE type = 'COMMITTED'), 0),
        COALESCE(SUM(amount) FILTER (WHERE type = 'ACTUAL'), 0)
    INTO budget_engage, budget_consomme
    FROM training_finance_ledger 
    WHERE annee = target_annee;
    
    ecart_budget := budget_consomme - baseline_cost;
    
    result := jsonb_build_object(
        'annee', target_annee,
        'version', target_version,
        'baseline_count', baseline_count,
        'baseline_cost', baseline_cost,
        'total_count', total_count,
        'planifie_count', planifie_count,
        'realise_count', realise_count,
        'taux_avancement', taux_avancement,
        'taux_couverture', taux_couverture,
        'budget_engage', budget_engage,
        'budget_consomme', budget_consomme,
        'ecart_budget', ecart_budget
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

SELECT 'Fonctions Plan de Formation corrigées' as result;
