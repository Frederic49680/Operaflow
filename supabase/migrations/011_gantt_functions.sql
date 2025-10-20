-- ============================================================================
-- Migration 011 : Table des dépendances + Fonctions Gantt
-- ============================================================================
-- Auteur : Fred Baudry
-- Date : 2025-01-18
-- Description : Table des dépendances + Fonctions de validation, recalcul et synchronisation pour le Gantt interactif
-- ============================================================================

-- ============================================================================
-- TABLE : Dépendances entre tâches (créée en premier)
-- ============================================================================
CREATE TABLE IF NOT EXISTS tache_dependances (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tache_id uuid NOT NULL REFERENCES planning_taches(id) ON DELETE CASCADE,
    tache_precedente_id uuid NOT NULL REFERENCES planning_taches(id) ON DELETE CASCADE,
    type_dependance text NOT NULL CHECK (type_dependance IN ('fin-debut', 'debut-debut', 'fin-fin', 'debut-fin')),
    lag_jours integer DEFAULT 0,
    created_at timestamptz DEFAULT NOW(),
    created_by uuid,
    
    -- Contrainte : une tâche ne peut pas dépendre d'elle-même
    CONSTRAINT check_no_self_dependency CHECK (tache_id != tache_precedente_id),
    
    -- Contrainte : pas de dépendance circulaire (vérifiée par application)
    UNIQUE(tache_id, tache_precedente_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_tache_dependances_tache_id ON tache_dependances(tache_id);
CREATE INDEX IF NOT EXISTS idx_tache_dependances_precedente_id ON tache_dependances(tache_precedente_id);

-- Commentaires
COMMENT ON TABLE tache_dependances IS 'Dépendances entre tâches (fin-début, début-début, etc.)';
COMMENT ON COLUMN tache_dependances.type_dependance IS 'Type de dépendance : fin-début, début-début, fin-fin, début-fin';
COMMENT ON COLUMN tache_dependances.lag_jours IS 'Délai en jours entre les deux tâches (positif ou négatif)';

-- ============================================================================
-- FONCTIONS
-- ============================================================================

-- ============================================================================
-- 1. FONCTION : Validation des dépendances entre tâches
-- ============================================================================
-- Vérifie que les dépendances sont respectées lors d'un déplacement
CREATE OR REPLACE FUNCTION fn_validate_dependencies(
    p_tache_id uuid,
    p_new_date_debut date,
    p_new_date_fin date
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    v_conflicts jsonb;
    v_dep tache_dependances%rowtype;
BEGIN
    v_conflicts := '[]'::jsonb;
    
    -- Vérifier les dépendances de cette tâche (tâches suivantes)
    FOR v_dep IN
        SELECT * FROM tache_dependances WHERE tache_precedente_id = p_tache_id
    LOOP
        -- Récupérer la date de fin de la tâche suivante
        DECLARE
            v_suivante_debut date;
            v_suivante_fin date;
        BEGIN
            SELECT date_debut_plan, date_fin_plan INTO v_suivante_debut, v_suivante_fin
            FROM planning_taches
            WHERE id = v_dep.tache_id;
            
            -- Si la nouvelle date de fin est après le début de la tâche suivante
            IF p_new_date_fin > v_suivante_debut THEN
                v_conflicts := v_conflicts || jsonb_build_object(
                    'type', 'dependency_conflict',
                    'tache_id', v_dep.tache_id,
                    'message', 'Cette tâche précède une dépendance. Souhaitez-vous décaler également les suivantes ?'
                );
            END IF;
        END;
    END LOOP;
    
    RETURN v_conflicts;
END;
$$;

COMMENT ON FUNCTION fn_validate_dependencies IS 'Valide les dépendances entre tâches lors d''un déplacement';

-- ============================================================================
-- 2. FONCTION : Vérification de disponibilité des ressources
-- ============================================================================
-- Vérifie si une ressource est disponible pendant une période donnée
CREATE OR REPLACE FUNCTION fn_check_disponibilite(
    p_ressource_id uuid,
    p_date_debut date,
    p_date_fin date
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    v_conflicts jsonb;
    v_absence absences%rowtype;
BEGIN
    v_conflicts := '[]'::jsonb;
    
    -- Vérifier les absences de la ressource
    FOR v_absence IN
        SELECT * FROM absences
        WHERE ressource_id = p_ressource_id
        AND statut IN ('à venir', 'en cours')
        AND (
            (date_debut <= p_date_debut AND date_fin >= p_date_debut) OR
            (date_debut <= p_date_fin AND date_fin >= p_date_fin) OR
            (date_debut >= p_date_debut AND date_fin <= p_date_fin)
        )
    LOOP
        v_conflicts := v_conflicts || jsonb_build_object(
            'type', 'absence_conflict',
            'absence_id', v_absence.id,
            'type_absence', v_absence.type,
            'date_debut', v_absence.date_debut,
            'date_fin', v_absence.date_fin,
            'message', format('Ressource absente (%s) du %s au %s', 
                v_absence.type, 
                v_absence.date_debut, 
                v_absence.date_fin)
        );
    END LOOP;
    
    RETURN v_conflicts;
END;
$$;

COMMENT ON FUNCTION fn_check_disponibilite IS 'Vérifie la disponibilité d''une ressource sur une période donnée';

-- ============================================================================
-- 3. FONCTION : Vérification des claims actifs
-- ============================================================================
-- Vérifie si une tâche est liée à un claim actif
CREATE OR REPLACE FUNCTION fn_check_claims_actifs(
    p_tache_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    v_conflicts jsonb;
    v_claim claims%rowtype;
BEGIN
    v_conflicts := '[]'::jsonb;
    
    -- Vérifier les claims liés à cette tâche
    FOR v_claim IN
        SELECT * FROM claims
        WHERE tache_id = p_tache_id
        AND statut NOT IN ('Clos', 'Annulé')
    LOOP
        v_conflicts := v_conflicts || jsonb_build_object(
            'type', 'claim_conflict',
            'claim_id', v_claim.id,
            'titre', v_claim.titre,
            'statut', v_claim.statut,
            'message', format('Impossible de déplacer une tâche liée à une réclamation active : %s', v_claim.titre)
        );
    END LOOP;
    
    RETURN v_conflicts;
END;
$$;

COMMENT ON FUNCTION fn_check_claims_actifs IS 'Vérifie si une tâche est liée à un claim actif';

-- ============================================================================
-- 4. FONCTION : Recalcul de l'avancement d'un lot
-- ============================================================================
-- Recalcule l'avancement, les dates et l'atterrissage d'un lot
CREATE OR REPLACE FUNCTION fn_recalc_lot_avancement(
    p_lot_id uuid
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_lot affaires_lots%rowtype;
    v_avancement_pct numeric;
    v_montant_consomme numeric;
    v_reste_a_faire numeric;
    v_atterrissage numeric;
    v_date_debut_reelle date;
    v_date_fin_reelle date;
    v_ponderation text;
BEGIN
    -- Récupérer les infos du lot
    SELECT * INTO v_lot FROM affaires_lots WHERE id = p_lot_id;
    
    -- Récupérer la pondération (heures ou budget)
    SELECT ponderation INTO v_ponderation FROM affaires_lots WHERE id = p_lot_id;
    
    -- Calculer l'avancement pondéré
    IF v_ponderation = 'heures' THEN
        -- Pondération par heures
        SELECT 
            COALESCE(SUM(avancement_pct * effort_plan_h) / NULLIF(SUM(effort_plan_h), 0), 0)
        INTO v_avancement_pct
        FROM planning_taches
        WHERE lot_id = p_lot_id;
    ELSE
        -- Pondération par budget (égal)
        SELECT 
            COALESCE(AVG(avancement_pct), 0)
        INTO v_avancement_pct
        FROM planning_taches
        WHERE lot_id = p_lot_id;
    END IF;
    
    -- Calculer le montant consommé (méthode à l'avancement)
    v_montant_consomme := v_lot.budget_ht * (v_avancement_pct / 100);
    
    -- Calculer le reste à faire
    v_reste_a_faire := GREATEST(v_lot.budget_ht - v_montant_consomme, 0);
    
    -- Calculer l'atterrissage (consommé + RAF)
    v_atterrissage := v_montant_consomme + v_reste_a_faire;
    
    -- Calculer les dates réelles (min début, max fin)
    SELECT 
        MIN(date_debut_reelle),
        MAX(date_fin_reelle)
    INTO 
        v_date_debut_reelle,
        v_date_fin_reelle
    FROM planning_taches
    WHERE lot_id = p_lot_id
    AND date_debut_reelle IS NOT NULL;
    
    -- Mettre à jour le lot
    UPDATE affaires_lots
    SET 
        avancement_pct = v_avancement_pct,
        montant_consomme = v_montant_consomme,
        reste_a_faire = v_reste_a_faire,
        atterrissage = v_atterrissage,
        date_debut_reelle = v_date_debut_reelle,
        date_fin_reelle = v_date_fin_reelle,
        date_maj = NOW()
    WHERE id = p_lot_id;
    
    -- Recalculer l'affaire parente
    PERFORM fn_propagate_recalc_affaire_dates(v_lot.affaire_id);
END;
$$;

COMMENT ON FUNCTION fn_recalc_lot_avancement IS 'Recalcule l''avancement, les dates et l''atterrissage d''un lot';

-- ============================================================================
-- 5. FONCTION : Propagation des dates d'affaires
-- ============================================================================
-- Met à jour les dates d'affaires depuis les lots
CREATE OR REPLACE FUNCTION fn_propagate_recalc_affaire_dates(
    p_affaire_id uuid
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    v_avancement_pct numeric;
    v_date_debut_reelle date;
    v_date_fin_reelle date;
BEGIN
    -- Calculer l'avancement global (moyenne pondérée des lots)
    SELECT 
        COALESCE(AVG(avancement_pct), 0)
    INTO v_avancement_pct
    FROM affaires_lots
    WHERE affaire_id = p_affaire_id;
    
    -- Calculer les dates réelles (min début, max fin)
    SELECT 
        MIN(date_debut_reelle),
        MAX(date_fin_reelle)
    INTO 
        v_date_debut_reelle,
        v_date_fin_reelle
    FROM affaires_lots
    WHERE affaire_id = p_affaire_id
    AND date_debut_reelle IS NOT NULL;
    
    -- Mettre à jour l'affaire
    UPDATE affaires
    SET 
        avancement_pct = v_avancement_pct,
        date_debut_reelle = v_date_debut_reelle,
        date_fin_reelle = v_date_fin_reelle,
        updated_at = NOW()
    WHERE id = p_affaire_id;
END;
$$;

COMMENT ON FUNCTION fn_propagate_recalc_affaire_dates IS 'Met à jour les dates d''affaires depuis les lots';

-- ============================================================================
-- 6. FONCTION : Validation complète d'un déplacement de tâche
-- ============================================================================
-- Valide toutes les contraintes avant un déplacement
CREATE OR REPLACE FUNCTION fn_validate_drag_tache(
    p_tache_id uuid,
    p_new_date_debut date,
    p_new_date_fin date
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    v_result jsonb;
    v_tache planning_taches%rowtype;
    v_dependencies jsonb;
    v_claims jsonb;
    v_affaire affaires%rowtype;
BEGIN
    v_result := jsonb_build_object(
        'valid', true,
        'conflicts', '[]'::jsonb,
        'warnings', '[]'::jsonb
    );
    
    -- Récupérer la tâche
    SELECT * INTO v_tache FROM planning_taches WHERE id = p_tache_id;
    
    -- Récupérer l'affaire
    SELECT * INTO v_affaire FROM affaires WHERE id = v_tache.affaire_id;
    
    -- 1. Vérifier que la tâche n'est pas terminée ou bloquée
    IF v_tache.statut IN ('Terminé', 'Bloqué') THEN
        v_result := jsonb_set(v_result, '{valid}', 'false'::jsonb);
        v_result := jsonb_set(v_result, '{conflicts}', 
            (v_result->'conflicts') || jsonb_build_object(
                'type', 'status_conflict',
                'message', 'Impossible de déplacer une tâche terminée ou bloquée'
            )
        );
        RETURN v_result;
    END IF;
    
    -- 2. Vérifier les dates de l'affaire
    IF p_new_date_debut < v_affaire.date_debut THEN
        v_result := jsonb_set(v_result, '{warnings}', 
            (v_result->'warnings') || jsonb_build_object(
                'type', 'date_warning',
                'message', 'La tâche commence avant le début de l''affaire'
            )
        );
    END IF;
    
    IF p_new_date_fin > v_affaire.date_fin_prevue AND v_affaire.statut != 'Ouverte' THEN
        v_result := jsonb_set(v_result, '{warnings}', 
            (v_result->'warnings') || jsonb_build_object(
                'type', 'date_warning',
                'message', 'La tâche se termine après la fin prévue de l''affaire'
            )
        );
    END IF;
    
    -- 3. Vérifier les dépendances
    v_dependencies := fn_validate_dependencies(p_tache_id, p_new_date_debut, p_new_date_fin);
    IF jsonb_array_length(v_dependencies) > 0 THEN
        v_result := jsonb_set(v_result, '{conflicts}', 
            (v_result->'conflicts') || v_dependencies
        );
    END IF;
    
    -- 4. Vérifier les claims actifs
    v_claims := fn_check_claims_actifs(p_tache_id);
    IF jsonb_array_length(v_claims) > 0 THEN
        v_result := jsonb_set(v_result, '{valid}', 'false'::jsonb);
        v_result := jsonb_set(v_result, '{conflicts}', 
            (v_result->'conflicts') || v_claims
        );
    END IF;
    
    RETURN v_result;
END;
$$;

COMMENT ON FUNCTION fn_validate_drag_tache IS 'Valide toutes les contraintes avant un déplacement de tâche';

-- ============================================================================
-- 7. FONCTION : Mise à jour d'une tâche avec validation
-- ============================================================================
-- Met à jour une tâche et recalcule les impacts
CREATE OR REPLACE FUNCTION fn_update_tache_with_validation(
    p_tache_id uuid,
    p_date_debut_plan date,
    p_date_fin_plan date,
    p_avancement_pct numeric DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
    v_validation jsonb;
    v_tache planning_taches%rowtype;
BEGIN
    -- Valider le déplacement
    v_validation := fn_validate_drag_tache(p_tache_id, p_date_debut_plan, p_date_fin_plan);
    
    -- Si validation échoue, retourner les erreurs
    IF NOT (v_validation->>'valid')::boolean THEN
        RETURN jsonb_build_object(
            'success', false,
            'errors', v_validation->'conflicts'
        );
    END IF;
    
    -- Récupérer la tâche
    SELECT * INTO v_tache FROM planning_taches WHERE id = p_tache_id;
    
    -- Mettre à jour la tâche
    UPDATE planning_taches
    SET 
        date_debut_plan = p_date_debut_plan,
        date_fin_plan = p_date_fin_plan,
        avancement_pct = COALESCE(p_avancement_pct, avancement_pct),
        updated_at = NOW()
    WHERE id = p_tache_id;
    
    -- Recalculer le lot
    IF v_tache.lot_id IS NOT NULL THEN
        PERFORM fn_recalc_lot_avancement(v_tache.lot_id);
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'warnings', v_validation->'warnings'
    );
END;
$$;

COMMENT ON FUNCTION fn_update_tache_with_validation IS 'Met à jour une tâche avec validation et recalcule les impacts';

-- ============================================================================
-- 8. FONCTION : Vérification des dépendances circulaires
-- ============================================================================
-- Vérifie qu'il n'y a pas de dépendances circulaires
CREATE OR REPLACE FUNCTION fn_check_circular_dependencies(
    p_tache_id uuid,
    p_tache_precedente_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
    v_visited uuid[] := ARRAY[]::uuid[];
    v_current uuid;
    v_next uuid;
BEGIN
    -- Vérifier si la tâche précédente dépend déjà de la tâche courante
    v_current := p_tache_precedente_id;
    
    WHILE v_current IS NOT NULL LOOP
        -- Vérifier si on a déjà visité ce nœud (cycle détecté)
        IF v_current = ANY(v_visited) THEN
            RETURN false;
        END IF;
        
        -- Ajouter à la liste des visités
        v_visited := v_visited || v_current;
        
        -- Si on atteint la tâche courante, c'est un cycle
        IF v_current = p_tache_id THEN
            RETURN false;
        END IF;
        
        -- Passer à la tâche précédente suivante
        SELECT tache_precedente_id INTO v_next
        FROM tache_dependances
        WHERE tache_id = v_current
        LIMIT 1;
        
        v_current := v_next;
    END LOOP;
    
    RETURN true;
END;
$$;

COMMENT ON FUNCTION fn_check_circular_dependencies IS 'Vérifie qu''il n''y a pas de dépendances circulaires';

-- ============================================================================
-- TRIGGER : Validation des dépendances avant insertion
-- ============================================================================
CREATE OR REPLACE FUNCTION trigger_validate_dependances()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Vérifier qu'il n'y a pas de dépendances circulaires
    IF NOT fn_check_circular_dependencies(NEW.tache_id, NEW.tache_precedente_id) THEN
        RAISE EXCEPTION 'Dépendance circulaire détectée : impossible de créer cette dépendance';
    END IF;
    
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION trigger_validate_dependances IS 'Valide les dépendances avant insertion';

-- Créer le trigger
DROP TRIGGER IF EXISTS trg_validate_dependances ON tache_dependances;
CREATE TRIGGER trg_validate_dependances
    BEFORE INSERT ON tache_dependances
    FOR EACH ROW
    EXECUTE FUNCTION trigger_validate_dependances();

-- ============================================================================
-- VUE : Tâches avec dépendances
-- ============================================================================
CREATE OR REPLACE VIEW v_taches_avec_dependances AS
SELECT 
    pt.id,
    pt.libelle_tache,
    pt.affaire_id,
    pt.lot_id,
    pt.date_debut_plan,
    pt.date_fin_plan,
    pt.statut,
    pt.avancement_pct,
    -- Dépendances précédentes (tâches qui doivent se terminer avant)
    COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id', td_prec.id,
                'tache_id', td_prec.tache_precedente_id,
                'type', td_prec.type_dependance,
                'lag_jours', td_prec.lag_jours
            )
        ) FILTER (WHERE td_prec.id IS NOT NULL),
        '[]'::jsonb
    ) as dependances_precedentes,
    -- Dépendances suivantes (tâches qui dépendent de celle-ci)
    COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id', td_suiv.id,
                'tache_id', td_suiv.tache_id,
                'type', td_suiv.type_dependance,
                'lag_jours', td_suiv.lag_jours
            )
        ) FILTER (WHERE td_suiv.id IS NOT NULL),
        '[]'::jsonb
    ) as dependances_suivantes
FROM planning_taches pt
LEFT JOIN tache_dependances td_prec ON pt.id = td_prec.tache_id
LEFT JOIN tache_dependances td_suiv ON pt.id = td_suiv.tache_precedente_id
GROUP BY pt.id, pt.libelle_tache, pt.affaire_id, pt.lot_id, pt.date_debut_plan, pt.date_fin_plan, pt.statut, pt.avancement_pct;

COMMENT ON VIEW v_taches_avec_dependances IS 'Vue des tâches avec leurs dépendances (précédentes et suivantes)';

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================

