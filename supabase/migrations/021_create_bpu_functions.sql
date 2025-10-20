-- ============================================================================
-- Migration 021 : Fonctions BPU (Bordereau de Prix Unitaire)
-- ============================================================================
-- Auteur : Fred Baudry
-- Date : 2025-01-19
-- Description : Fonctions et triggers pour le module BPU
-- PRD : prdmajmaintenancebpu.mdc
-- ============================================================================

-- ============================================================================
-- FONCTION : Créer tâche parapluie BPU
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_create_bpu_parapluie_task(p_affaire_id UUID)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_affaire RECORD;
    v_tache_id UUID;
    v_capacite NUMERIC;
BEGIN
    -- Récupérer les informations de l'affaire
    SELECT 
        id,
        code_affaire,
        site_id,
        periode_debut,
        periode_fin,
        nb_ressources_ref,
        heures_semaine_ref
    INTO v_affaire
    FROM affaires
    WHERE id = p_affaire_id
    AND type_affaire = 'BPU';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Affaire BPU introuvable : %', p_affaire_id;
    END IF;
    
    -- Calculer la capacité
    SELECT 
        CASE 
            WHEN v_affaire.periode_debut IS NOT NULL AND v_affaire.periode_fin IS NOT NULL THEN
                v_affaire.nb_ressources_ref * v_affaire.heures_semaine_ref * 
                (SELECT COUNT(*) 
                 FROM affaire_bpu_calendrier 
                 WHERE affaire_id = v_affaire.id AND active = true)
            ELSE NULL
        END
    INTO v_capacite;
    
    -- Créer la tâche parapluie
    INSERT INTO planning_taches (
        affaire_id,
        site_id,
        libelle_tache,
        date_debut_plan,
        date_fin_plan,
        avancement_pct,
        statut,
        is_parapluie_bpu,
        created_by
    ) VALUES (
        v_affaire.id,
        v_affaire.site_id,
        'Contrat ' || v_affaire.code_affaire || ' — Décharge batterie',
        v_affaire.periode_debut,
        v_affaire.periode_fin,
        0,
        'En cours',
        true,
        NULL
    ) RETURNING id INTO v_tache_id;
    
    RAISE NOTICE 'Tâche parapluie BPU créée : % pour l''affaire %', v_tache_id, v_affaire.code_affaire;
    
    RETURN v_tache_id;
END;
$$;

COMMENT ON FUNCTION fn_create_bpu_parapluie_task IS 'Crée une tâche parapluie BPU pour une affaire';

-- ============================================================================
-- FONCTION : Traiter réalisation terminée
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_bpu_on_realisation_terminee(p_maintenance_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_realisation RECORD;
    v_ligne RECORD;
    v_montant NUMERIC;
BEGIN
    -- Récupérer la réalisation
    SELECT 
        mj.id,
        mj.affaire_id,
        mj.bpu_ligne_id,
        mj.heures_metal,
        mj.etat_reel,
        bl.unite,
        bl.pu,
        bl.pu_horaire,
        bl.quantite,
        bl.delivered_qty,
        bl.delivered_hours,
        bl.montant_reconnu
    INTO v_realisation
    FROM maintenance_journal mj
    LEFT JOIN affaire_bpu_lignes bl ON mj.bpu_ligne_id = bl.id
    WHERE mj.id = p_maintenance_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Réalisation introuvable : %', p_maintenance_id;
    END IF;
    
    IF v_realisation.bpu_ligne_id IS NULL THEN
        RAISE NOTICE 'Réalisation % non liée à une ligne BPU, aucun traitement', p_maintenance_id;
        RETURN;
    END IF;
    
    -- Calculer le montant selon le type de BPU
    v_montant := 0;
    
    IF v_realisation.unite = 'heure' AND v_realisation.pu_horaire IS NOT NULL THEN
        -- BPU horaire : montant = heures_metal × pu_horaire
        v_montant := v_realisation.heures_metal * v_realisation.pu_horaire;
        
        -- Mettre à jour delivered_hours
        UPDATE affaire_bpu_lignes
        SET delivered_hours = delivered_hours + v_realisation.heures_metal
        WHERE id = v_realisation.bpu_ligne_id;
        
    ELSIF v_realisation.unite = 'unité' AND v_realisation.pu IS NOT NULL THEN
        -- BPU à l'unité : montant = pu (une seule fois)
        v_montant := v_realisation.pu;
        
        -- Mettre à jour delivered_qty
        UPDATE affaire_bpu_lignes
        SET delivered_qty = delivered_qty + 1
        WHERE id = v_realisation.bpu_ligne_id
        AND (quantite IS NULL OR delivered_qty < quantite);  -- Empêcher sur-livraison
        
    END IF;
    
    -- Mettre à jour le montant reconnu
    UPDATE affaire_bpu_lignes
    SET montant_reconnu = montant_reconnu + v_montant
    WHERE id = v_realisation.bpu_ligne_id;
    
    RAISE NOTICE 'Réalisation terminée : % - Montant reconnu : %€', p_maintenance_id, v_montant;
END;
$$;

COMMENT ON FUNCTION fn_bpu_on_realisation_terminee IS 'Traite une réalisation BPU terminée et met à jour les montants';

-- ============================================================================
-- FONCTION : Traiter réalisation reportée
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_bpu_on_realisation_reportee(p_maintenance_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_realisation RECORD;
BEGIN
    -- Récupérer la réalisation
    SELECT 
        mj.id,
        mj.affaire_id,
        mj.bpu_ligne_id,
        mj.motif
    INTO v_realisation
    FROM maintenance_journal mj
    WHERE mj.id = p_maintenance_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Réalisation introuvable : %', p_maintenance_id;
    END IF;
    
    -- Vérifier que le motif est renseigné
    IF v_realisation.motif IS NULL OR v_realisation.motif = '' THEN
        RAISE EXCEPTION 'Motif obligatoire pour une réalisation reportée';
    END IF;
    
    -- Aucune monétisation pour une réalisation reportée
    RAISE NOTICE 'Réalisation reportée : % - Motif : % - Aucune monétisation', p_maintenance_id, v_realisation.motif;
END;
$$;

COMMENT ON FUNCTION fn_bpu_on_realisation_reportee IS 'Traite une réalisation BPU reportée (vérifie motif, pas de monétisation)';

-- ============================================================================
-- FONCTION : Calcul hebdo avancement parapluie
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_calculate_bpu_avancement_weekly()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_tache RECORD;
    v_avancement NUMERIC;
BEGIN
    -- Pour chaque tâche parapluie BPU
    FOR v_tache IN
        SELECT 
            pt.id,
            pt.affaire_id,
            a.nb_ressources_ref,
            a.heures_semaine_ref,
            a.periode_debut,
            a.periode_fin
        FROM planning_taches pt
        JOIN affaires a ON pt.affaire_id = a.id
        WHERE pt.is_parapluie_bpu = true
        AND a.type_affaire = 'BPU'
        AND a.statut IN ('Validée', 'En cours')
    LOOP
        -- Calculer l'avancement
        SELECT 
            CASE 
                WHEN v_tache.periode_debut IS NOT NULL AND v_tache.periode_fin IS NOT NULL THEN
                    LEAST(100, 
                        ROUND(
                            (COALESCE((
                                SELECT SUM(heures_metal)
                                FROM maintenance_journal
                                WHERE affaire_id = v_tache.affaire_id 
                                AND etat_reel = 'Termine'
                            ), 0) / NULLIF(
                                (v_tache.nb_ressources_ref * v_tache.heures_semaine_ref * 
                                 (SELECT COUNT(*) 
                                  FROM affaire_bpu_calendrier 
                                  WHERE affaire_id = v_tache.affaire_id AND active = true)),
                                0
                            )) * 100,
                            2
                        )
                    )
                ELSE 0
            END
        INTO v_avancement;
        
        -- Mettre à jour la tâche
        UPDATE planning_taches
        SET avancement_pct = v_avancement
        WHERE id = v_tache.id;
        
        RAISE NOTICE 'Tâche parapluie % : avancement %%%', v_tache.id, v_avancement;
    END LOOP;
END;
$$;

COMMENT ON FUNCTION fn_calculate_bpu_avancement_weekly IS 'Calcule l''avancement hebdomadaire des tâches parapluie BPU';

-- ============================================================================
-- FONCTION : Agrégation nightly des totaux BPU
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_agg_bpu_affaire_totaux()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_affaire RECORD;
    v_heures_consommes NUMERIC;
    v_montant_reconnu NUMERIC;
BEGIN
    -- Pour chaque affaire BPU
    FOR v_affaire IN
        SELECT id, code_affaire
        FROM affaires
        WHERE type_affaire = 'BPU'
        AND statut IN ('Validée', 'En cours')
    LOOP
        -- Calculer les heures consommées
        SELECT COALESCE(SUM(heures_metal), 0)
        INTO v_heures_consommes
        FROM maintenance_journal
        WHERE affaire_id = v_affaire.id
        AND etat_reel = 'Termine';
        
        -- Calculer le montant reconnu
        SELECT COALESCE(SUM(montant_reconnu), 0)
        INTO v_montant_reconnu
        FROM affaire_bpu_lignes
        WHERE affaire_id = v_affaire.id;
        
        -- Les totaux sont déjà dans la vue V_Affaire_BPU_Suivi
        -- Cette fonction peut être utilisée pour des calculs supplémentaires si nécessaire
        
        RAISE NOTICE 'Affaire BPU % : %h consommées, %€ reconnus', 
            v_affaire.code_affaire, v_heures_consommes, v_montant_reconnu;
    END LOOP;
END;
$$;

COMMENT ON FUNCTION fn_agg_bpu_affaire_totaux IS 'Agrégation nightly des totaux BPU par affaire';

-- ============================================================================
-- TRIGGER : Automatiser le traitement des réalisations BPU
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_bpu_on_etat_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Si la réalisation est liée à une ligne BPU
    IF NEW.bpu_ligne_id IS NOT NULL THEN
        
        -- Si passage à Terminée
        IF NEW.etat_reel = 'Termine' AND OLD.etat_reel != 'Termine' THEN
            PERFORM fn_bpu_on_realisation_terminee(NEW.id);
        END IF;
        
        -- Si passage à Reportée
        IF NEW.etat_reel = 'Reportee' AND OLD.etat_reel != 'Reportee' THEN
            PERFORM fn_bpu_on_realisation_reportee(NEW.id);
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION trigger_bpu_on_etat_change IS 'Trigger pour automatiser le traitement des changements d''état BPU';

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_bpu_maintenance_etat ON maintenance_journal;

CREATE TRIGGER trigger_bpu_maintenance_etat
    AFTER UPDATE ON maintenance_journal
    FOR EACH ROW
    WHEN (NEW.etat_reel IS DISTINCT FROM OLD.etat_reel)
    EXECUTE FUNCTION trigger_bpu_on_etat_change();

-- ============================================================================
-- FONCTION : Générer calendrier BPU pour une année
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_generate_bpu_calendrier(
    p_affaire_id UUID,
    p_annee INTEGER,
    p_semaines_actives INTEGER[]
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_semaine INTEGER;
    v_date_debut DATE;
    v_date_fin DATE;
    v_is_active BOOLEAN;
BEGIN
    -- Pour chaque semaine de l'année
    FOR v_semaine IN 1..53
    LOOP
        -- Calculer les dates de la semaine
        v_date_debut := DATE_TRUNC('year', MAKE_DATE(p_annee, 1, 1))::DATE + (v_semaine - 1) * INTERVAL '1 week';
        v_date_fin := v_date_debut + INTERVAL '6 days';
        
        -- Vérifier si la semaine est active
        v_is_active := v_semaine = ANY(p_semaines_actives);
        
        -- Insérer ou mettre à jour
        INSERT INTO affaire_bpu_calendrier (
            affaire_id,
            annee,
            semaine,
            date_debut,
            date_fin,
            active
        ) VALUES (
            p_affaire_id,
            p_annee,
            v_semaine,
            v_date_debut,
            v_date_fin,
            v_is_active
        )
        ON CONFLICT (affaire_id, annee, semaine) 
        DO UPDATE SET 
            active = v_is_active,
            date_debut = EXCLUDED.date_debut,
            date_fin = EXCLUDED.date_fin;
    END LOOP;
    
    RAISE NOTICE 'Calendrier BPU généré pour l''affaire % - Année %', p_affaire_id, p_annee;
END;
$$;

COMMENT ON FUNCTION fn_generate_bpu_calendrier IS 'Génère le calendrier BPU pour une année avec semaines actives/inactives';

-- ============================================================================
-- FONCTION : Import CSV BPU
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_import_bpu_affaire(
    p_affaire_id UUID,
    p_lignes JSONB
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_ligne JSONB;
    v_code_bpu TEXT;
    v_libelle TEXT;
    v_systeme_elementaire TEXT;
    v_quantite NUMERIC;
    v_unite TEXT;
    v_pu NUMERIC;
    v_pu_horaire NUMERIC;
    v_heures_equiv NUMERIC;
BEGIN
    -- Pour chaque ligne du JSON
    FOR v_ligne IN SELECT * FROM jsonb_array_elements(p_lignes)
    LOOP
        -- Extraire les valeurs
        v_code_bpu := v_ligne->>'code_bpu';
        v_libelle := v_ligne->>'libelle';
        v_systeme_elementaire := v_ligne->>'systeme_elementaire';
        v_quantite := (v_ligne->>'quantite')::NUMERIC;
        v_unite := v_ligne->>'unite';
        v_pu := (v_ligne->>'pu')::NUMERIC;
        v_pu_horaire := (v_ligne->>'pu_horaire')::NUMERIC;
        v_heures_equiv := (v_ligne->>'heures_equiv_unitaire')::NUMERIC;
        
        -- Insérer la ligne
        INSERT INTO affaire_bpu_lignes (
            affaire_id,
            code_bpu,
            libelle,
            systeme_elementaire,
            quantite,
            unite,
            pu,
            pu_horaire,
            heures_equiv_unitaire,
            statut_ligne
        ) VALUES (
            p_affaire_id,
            v_code_bpu,
            v_libelle,
            v_systeme_elementaire,
            v_quantite,
            v_unite,
            v_pu,
            v_pu_horaire,
            v_heures_equiv,
            'proposee'  -- Par défaut proposée
        );
    END LOOP;
    
    RAISE NOTICE '% lignes BPU importées pour l''affaire %', jsonb_array_length(p_lignes), p_affaire_id;
END;
$$;

COMMENT ON FUNCTION fn_import_bpu_affaire IS 'Importe les lignes BPU depuis un JSON (CSV parsé)';

-- ============================================================================
-- FONCTION : Valider les lignes BPU (passage proposee → vendue)
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_validate_bpu_lignes(p_affaire_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Passer toutes les lignes proposées en vendues
    UPDATE affaire_bpu_lignes
    SET statut_ligne = 'vendue'
    WHERE affaire_id = p_affaire_id
    AND statut_ligne = 'proposee';
    
    RAISE NOTICE 'Lignes BPU validées pour l''affaire %', p_affaire_id;
END;
$$;

COMMENT ON FUNCTION fn_validate_bpu_lignes IS 'Valide les lignes BPU (proposee → vendue)';

-- ============================================================================
-- FONCTION : Annuler les lignes BPU (passage → annulee)
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_cancel_bpu_lignes(p_affaire_id UUID, p_ligne_ids UUID[])
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Annuler les lignes spécifiées
    UPDATE affaire_bpu_lignes
    SET statut_ligne = 'annulee'
    WHERE affaire_id = p_affaire_id
    AND id = ANY(p_ligne_ids);
    
    RAISE NOTICE '% lignes BPU annulées pour l''affaire %', array_length(p_ligne_ids, 1), p_affaire_id;
END;
$$;

COMMENT ON FUNCTION fn_cancel_bpu_lignes IS 'Annule les lignes BPU spécifiées';

-- ============================================================================
-- FONCTION : Rollback réalisation BPU (annulation)
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_rollback_bpu_realisation(p_maintenance_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_realisation RECORD;
    v_montant NUMERIC;
BEGIN
    -- Récupérer la réalisation
    SELECT 
        mj.id,
        mj.affaire_id,
        mj.bpu_ligne_id,
        mj.heures_metal,
        mj.etat_reel,
        bl.unite,
        bl.pu,
        bl.pu_horaire,
        bl.delivered_qty,
        bl.delivered_hours,
        bl.montant_reconnu
    INTO v_realisation
    FROM maintenance_journal mj
    LEFT JOIN affaire_bpu_lignes bl ON mj.bpu_ligne_id = bl.id
    WHERE mj.id = p_maintenance_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Réalisation introuvable : %', p_maintenance_id;
    END IF;
    
    IF v_realisation.bpu_ligne_id IS NULL THEN
        RAISE NOTICE 'Réalisation % non liée à une ligne BPU, aucun rollback', p_maintenance_id;
        RETURN;
    END IF;
    
    -- Calculer le montant à déduire
    v_montant := 0;
    
    IF v_realisation.unite = 'heure' AND v_realisation.pu_horaire IS NOT NULL THEN
        v_montant := v_realisation.heures_metal * v_realisation.pu_horaire;
        
        -- Déduire delivered_hours
        UPDATE affaire_bpu_lignes
        SET delivered_hours = GREATEST(0, delivered_hours - v_realisation.heures_metal)
        WHERE id = v_realisation.bpu_ligne_id;
        
    ELSIF v_realisation.unite = 'unité' AND v_realisation.pu IS NOT NULL THEN
        v_montant := v_realisation.pu;
        
        -- Déduire delivered_qty
        UPDATE affaire_bpu_lignes
        SET delivered_qty = GREATEST(0, delivered_qty - 1)
        WHERE id = v_realisation.bpu_ligne_id;
        
    END IF;
    
    -- Déduire le montant reconnu
    UPDATE affaire_bpu_lignes
    SET montant_reconnu = GREATEST(0, montant_reconnu - v_montant)
    WHERE id = v_realisation.bpu_ligne_id;
    
    RAISE NOTICE 'Rollback réalisation % : -%€ déduits', p_maintenance_id, v_montant;
END;
$$;

COMMENT ON FUNCTION fn_rollback_bpu_realisation IS 'Annule une réalisation BPU et déduit les montants';

-- ============================================================================
-- CRON : Calcul hebdo avancement (Lundi 00:05)
-- ============================================================================

-- Note : Le cron sera configuré via Supabase Dashboard
-- Fonction : fn_calculate_bpu_avancement_weekly()
-- Plan : 0 5 * * 1 (tous les lundis à 00:05)

-- ============================================================================
-- CRON : Agrégation nightly (01:00)
-- ============================================================================

-- Note : Le cron sera configuré via Supabase Dashboard
-- Fonction : fn_agg_bpu_affaire_totaux()
-- Plan : 0 1 * * * (tous les jours à 01:00)

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================

