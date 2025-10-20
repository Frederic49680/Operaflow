-- ============================================================================
-- Migration 028 : Vues et fonctions pour le module RH Formations
-- ============================================================================
-- Auteur : Fred Baudry
-- Date : 2025-01-21
-- Description : Vues pour budget, indisponibilités, alertes
-- ============================================================================

-- ============================================================================
-- VUE : V_Budget_Formations_Annuel
-- ============================================================================

CREATE OR REPLACE VIEW V_Budget_Formations_Annuel AS
SELECT 
    EXTRACT(YEAR FROM pfr.date_debut) as annee,
    s.id as site_id,
    s.nom as site_nom,
    o.id as organisme_id,
    o.nom as organisme_nom,
    f.id as formation_id,
    f.code as formation_code,
    f.libelle as formation_libelle,
    f.type_formation,
    COUNT(DISTINCT pfr.id) as nb_semaines,
    COUNT(DISTINCT pfr.collaborateur_id) as nb_participants,
    SUM(pfr.cout_prevu_ht) as budget_prevu_ht,
    SUM(pfr.cout_realise_ht) as budget_realise_ht,
    SUM(pfr.cout_realise_ht) - SUM(pfr.cout_prevu_ht) as ecart_ht,
    CASE 
        WHEN SUM(pfr.cout_prevu_ht) > 0 
        THEN ((SUM(pfr.cout_realise_ht) - SUM(pfr.cout_prevu_ht)) / SUM(pfr.cout_prevu_ht) * 100)
        ELSE 0 
    END as taux_ecart_pct
FROM plan_formation_ressource pfr
LEFT JOIN ressources r ON pfr.collaborateur_id = r.id
LEFT JOIN sites s ON r.site_id = s.id
LEFT JOIN formations_catalogue f ON pfr.formation_id = f.id
LEFT JOIN organismes_formation o ON pfr.organisme_id = o.id
WHERE pfr.statut IN ('Validé', 'Réalisé')
GROUP BY 
    EXTRACT(YEAR FROM pfr.date_debut),
    s.id, s.nom,
    o.id, o.nom,
    f.id, f.code, f.libelle, f.type_formation;

-- ============================================================================
-- VUE : V_Formation_Indispo_Planning
-- ============================================================================

CREATE OR REPLACE VIEW V_Formation_Indispo_Planning AS
SELECT 
    pfr.id,
    pfr.collaborateur_id,
    r.nom as ressource_nom,
    r.prenom as ressource_prenom,
    pfr.formation_id,
    f.libelle as formation_libelle,
    pfr.date_debut,
    pfr.date_fin,
    pfr.statut,
    pfr.semaine_iso,
    CASE 
        WHEN pfr.date_debut IS NOT NULL AND pfr.date_fin IS NOT NULL
        THEN pfr.date_fin - pfr.date_debut + 1
        ELSE 5
    END as duree_jours
FROM plan_formation_ressource pfr
LEFT JOIN ressources r ON pfr.collaborateur_id = r.id
LEFT JOIN formations_catalogue f ON pfr.formation_id = f.id
WHERE pfr.statut = 'Validé'
    AND pfr.date_debut IS NOT NULL
    AND pfr.date_fin IS NOT NULL;

-- ============================================================================
-- VUE : V_Habilitations_A_Renouveler
-- ============================================================================

CREATE OR REPLACE VIEW V_Habilitations_A_Renouveler AS
SELECT 
    f.id,
    f.ressource_id,
    r.nom as ressource_nom,
    r.prenom as ressource_prenom,
    s.nom as site,
    f.formation_id,
    fc.libelle as formation_libelle,
    fc.type_formation,
    f.date_expiration,
    f.statut,
    CASE 
        WHEN f.date_expiration IS NOT NULL 
        THEN f.date_expiration - CURRENT_DATE
        ELSE NULL
    END as jours_restants,
    CASE 
        WHEN f.date_expiration IS NOT NULL 
        THEN 
            CASE 
                WHEN f.date_expiration - CURRENT_DATE <= 0 THEN 'Expiré'
                WHEN f.date_expiration - CURRENT_DATE <= 30 THEN 'Urgent'
                WHEN f.date_expiration - CURRENT_DATE <= 60 THEN 'À renouveler'
                ELSE 'Valide'
            END
        ELSE 'Valide'
    END as priorite
FROM formations f
LEFT JOIN ressources r ON f.ressource_id = r.id
LEFT JOIN sites s ON r.site_id = s.id
LEFT JOIN formations_catalogue fc ON f.formation_id = fc.id
WHERE f.statut = 'Valide'
    AND f.date_expiration IS NOT NULL
    AND f.date_expiration <= CURRENT_DATE + INTERVAL '90 days'
ORDER BY f.date_expiration ASC;

-- ============================================================================
-- VUE : V_Formations_Prochaines
-- ============================================================================

CREATE OR REPLACE VIEW V_Formations_Prochaines AS
SELECT 
    pfr.id,
    pfr.collaborateur_id,
    r.nom as ressource_nom,
    r.prenom as ressource_prenom,
    r.email_pro as ressource_email,
    s.nom as site,
    pfr.formation_id,
    f.libelle as formation_libelle,
    pfr.organisme_id,
    o.nom as organisme_nom,
    pfr.date_debut,
    pfr.date_fin,
    pfr.modalite,
    pfr.semaine_iso,
    CASE 
        WHEN pfr.date_debut IS NOT NULL 
        THEN pfr.date_debut - CURRENT_DATE
        ELSE NULL
    END as jours_avant
FROM plan_formation_ressource pfr
LEFT JOIN ressources r ON pfr.collaborateur_id = r.id
LEFT JOIN sites s ON r.site_id = s.id
LEFT JOIN formations_catalogue f ON pfr.formation_id = f.id
LEFT JOIN organismes_formation o ON pfr.organisme_id = o.id
WHERE pfr.statut IN ('Validé', 'Réalisé')
    AND pfr.date_debut IS NOT NULL
    AND pfr.date_debut >= CURRENT_DATE
    AND pfr.date_debut <= CURRENT_DATE + INTERVAL '30 days'
ORDER BY pfr.date_debut ASC;

-- ============================================================================
-- FONCTION : fn_pick_tarif_applicable
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_pick_tarif_applicable(
    p_formation_id UUID,
    p_organisme_id UUID,
    p_modalite TEXT,
    p_site_id UUID,
    p_date DATE
)
RETURNS UUID AS $$
DECLARE
    v_tarif_id UUID;
BEGIN
    -- Chercher le tarif le plus spécifique
    SELECT id INTO v_tarif_id
    FROM formations_tarifs
    WHERE formation_id = p_formation_id
        AND organisme_id = p_organisme_id
        AND modalite = p_modalite
        AND (site_id = p_site_id OR site_id IS NULL)
        AND date_debut <= p_date
        AND (date_fin IS NULL OR date_fin >= p_date)
        AND actif = true
    ORDER BY 
        CASE WHEN site_id IS NOT NULL THEN 0 ELSE 1 END,
        date_debut DESC
    LIMIT 1;
    
    RETURN v_tarif_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FONCTION : fn_calcul_cout_prevu
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_calcul_cout_prevu(
    p_plan_id UUID
)
RETURNS NUMERIC AS $$
DECLARE
    v_cout NUMERIC := 0;
    v_modalite TEXT;
    v_site_id UUID;
    v_tarif_id UUID;
    v_cout_unitaire NUMERIC;
    v_cout_session NUMERIC;
    v_cout_elearning NUMERIC;
    v_frais_deplacement NUMERIC;
    v_nb_participants_session INTEGER;
BEGIN
    -- Récupérer la modalité et le site
    SELECT pfr.modalite, r.site_id INTO v_modalite, v_site_id
    FROM plan_formation_ressource pfr
    LEFT JOIN ressources r ON pfr.collaborateur_id = r.id
    WHERE pfr.id = p_plan_id;
    
    -- Trouver le tarif applicable
    SELECT fn_pick_tarif_applicable(
        (SELECT formation_id FROM plan_formation_ressource WHERE id = p_plan_id),
        (SELECT organisme_id FROM plan_formation_ressource WHERE id = p_plan_id),
        v_modalite,
        v_site_id,
        (SELECT date_debut FROM plan_formation_ressource WHERE id = p_plan_id)
    ) INTO v_tarif_id;
    
    -- Récupérer les coûts du tarif
    SELECT 
        cout_unitaire,
        cout_session,
        cout_elearning,
        frais_deplacement
    INTO 
        v_cout_unitaire,
        v_cout_session,
        v_cout_elearning,
        v_frais_deplacement
    FROM formations_tarifs
    WHERE id = v_tarif_id;
    
    -- Calculer le coût selon la modalité
    IF v_modalite = 'E-learning' AND v_cout_elearning IS NOT NULL THEN
        v_cout := v_cout_elearning;
    ELSIF v_cout_unitaire IS NOT NULL THEN
        v_cout := v_cout_unitaire;
    END IF;
    
    -- Ajouter la quote-part du coût de session si présentiel
    IF v_modalite IN ('Présentiel', 'Mixte') AND v_cout_session IS NOT NULL THEN
        -- Compter le nombre de participants sur la même session
        SELECT COUNT(*) INTO v_nb_participants_session
        FROM plan_formation_ressource
        WHERE session_id = (SELECT session_id FROM plan_formation_ressource WHERE id = p_plan_id)
            AND statut IN ('Validé', 'Réalisé');
        
        IF v_nb_participants_session > 0 THEN
            v_cout := v_cout + (v_cout_session / v_nb_participants_session);
        END IF;
        
        -- Ajouter les frais de déplacement
        IF v_frais_deplacement IS NOT NULL THEN
            v_cout := v_cout + v_frais_deplacement;
        END IF;
    END IF;
    
    RETURN COALESCE(v_cout, 0);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Commentaires
-- ============================================================================

COMMENT ON VIEW V_Budget_Formations_Annuel IS 'Budget annuel des formations (prévu vs réalisé)';
COMMENT ON VIEW V_Formation_Indispo_Planning IS 'Indisponibilités planning dues aux formations';
COMMENT ON VIEW V_Habilitations_A_Renouveler IS 'Habilitations à renouveler (J-90)';
COMMENT ON VIEW V_Formations_Prochaines IS 'Formations à venir (J+30)';
COMMENT ON FUNCTION fn_pick_tarif_applicable IS 'Sélectionne le tarif applicable selon les critères';
COMMENT ON FUNCTION fn_calcul_cout_prevu IS 'Calcule le coût prévisionnel d''une semaine de formation';

