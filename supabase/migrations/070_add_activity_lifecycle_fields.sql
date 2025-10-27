-- Migration 070: Ajout des champs pour le cycle de vie des activités
-- Date: 2025-01-27
-- Description: Ajouter les champs nécessaires pour le suivi du cycle de vie des activités (lancement, report, suspension, claim, prolongation)

-- 1. Ajouter les nouveaux champs à la table planning_taches
ALTER TABLE planning_taches 
ADD COLUMN IF NOT EXISTS date_lancement TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS jours_actifs INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS motif_report TEXT,
ADD COLUMN IF NOT EXISTS date_report DATE,
ADD COLUMN IF NOT EXISTS motif_prolongation TEXT,
ADD COLUMN IF NOT EXISTS duree_sup INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS motif_suspension TEXT,
ADD COLUMN IF NOT EXISTS date_suspension TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS responsable_suspension UUID REFERENCES app_users(id),
ADD COLUMN IF NOT EXISTS date_reprise TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS claim_id UUID REFERENCES claims(id);

-- 2. Ajouter des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_planning_taches_date_lancement ON planning_taches(date_lancement);
CREATE INDEX IF NOT EXISTS idx_planning_taches_date_suspension ON planning_taches(date_suspension);
CREATE INDEX IF NOT EXISTS idx_planning_taches_date_reprise ON planning_taches(date_reprise);
CREATE INDEX IF NOT EXISTS idx_planning_taches_claim_id ON planning_taches(claim_id);

-- 3. Créer une fonction pour calculer les jours ouvrés
CREATE OR REPLACE FUNCTION calculate_jours_ouvres(start_date DATE, end_date DATE)
RETURNS INTEGER AS $$
DECLARE
    jours_total INTEGER;
    jours_ouvres INTEGER := 0;
    current_day DATE;
BEGIN
    -- Calculer le nombre total de jours entre start_date et end_date
    jours_total := end_date - start_date + 1;
    
    -- Parcourir chaque jour et compter seulement les jours ouvrés (lundi à vendredi)
    current_day := start_date;
    
    WHILE current_day <= end_date LOOP
        -- Vérifier si c'est un jour ouvré (lundi=1 à vendredi=5)
        IF EXTRACT(DOW FROM current_day) BETWEEN 1 AND 5 THEN
            jours_ouvres := jours_ouvres + 1;
        END IF;
        current_day := current_day + INTERVAL '1 day';
    END LOOP;
    
    RETURN jours_ouvres;
END;
$$ LANGUAGE plpgsql;

-- 4. Créer une fonction pour mettre à jour les jours actifs
CREATE OR REPLACE FUNCTION update_jours_actifs()
RETURNS TRIGGER AS $$
DECLARE
    jours_calcules INTEGER;
BEGIN
    -- Seulement pour les tâches avec statut "En cours" et date_lancement définie
    IF NEW.statut = 'En cours' AND NEW.date_lancement IS NOT NULL THEN
        -- Calculer les jours ouvrés depuis le lancement
        jours_calcules := calculate_jours_ouvres(
            NEW.date_lancement::DATE, 
            CURRENT_DATE
        );
        
        -- Soustraire les jours de suspension si applicable
        IF NEW.date_suspension IS NOT NULL AND NEW.date_reprise IS NOT NULL THEN
            jours_calcules := jours_calcules - calculate_jours_ouvres(
                NEW.date_suspension::DATE,
                NEW.date_reprise::DATE
            );
        END IF;
        
        NEW.jours_actifs := GREATEST(0, jours_calcules);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Créer le trigger pour mettre à jour automatiquement les jours actifs
DROP TRIGGER IF EXISTS trigger_update_jours_actifs ON planning_taches;
CREATE TRIGGER trigger_update_jours_actifs
    BEFORE UPDATE ON planning_taches
    FOR EACH ROW
    EXECUTE FUNCTION update_jours_actifs();

-- 6. Créer une fonction pour gérer le lancement d'une activité
CREATE OR REPLACE FUNCTION lance_activite(tache_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    tache_record RECORD;
BEGIN
    -- Récupérer les informations de la tâche
    SELECT * INTO tache_record 
    FROM planning_taches 
    WHERE id = tache_id;
    
    -- Vérifier que la tâche existe et est dans le bon statut
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tâche non trouvée';
    END IF;
    
    IF tache_record.statut != 'Non lancé' THEN
        RAISE EXCEPTION 'La tâche doit être en statut "Non lancé" pour être lancée';
    END IF;
    
    -- Mettre à jour la tâche
    UPDATE planning_taches 
    SET 
        statut = 'En cours',
        date_lancement = NOW(),
        jours_actifs = 0,
        updated_at = NOW()
    WHERE id = tache_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 7. Créer une fonction pour gérer la suspension d'une activité
CREATE OR REPLACE FUNCTION suspend_activite(
    tache_id UUID, 
    motif TEXT, 
    responsable_id UUID,
    duree_estimee INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    tache_record RECORD;
BEGIN
    -- Récupérer les informations de la tâche
    SELECT * INTO tache_record 
    FROM planning_taches 
    WHERE id = tache_id;
    
    -- Vérifier que la tâche existe et est dans le bon statut
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tâche non trouvée';
    END IF;
    
    IF tache_record.statut != 'En cours' THEN
        RAISE EXCEPTION 'La tâche doit être en statut "En cours" pour être suspendue';
    END IF;
    
    -- Mettre à jour la tâche
    UPDATE planning_taches 
    SET 
        statut = 'Suspendu',
        motif_suspension = motif,
        responsable_suspension = responsable_id,
        date_suspension = NOW(),
        updated_at = NOW()
    WHERE id = tache_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 8. Créer une fonction pour gérer la reprise d'une activité
CREATE OR REPLACE FUNCTION reprend_activite(tache_id UUID, commentaire TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    tache_record RECORD;
BEGIN
    -- Récupérer les informations de la tâche
    SELECT * INTO tache_record 
    FROM planning_taches 
    WHERE id = tache_id;
    
    -- Vérifier que la tâche existe et est dans le bon statut
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tâche non trouvée';
    END IF;
    
    IF tache_record.statut NOT IN ('Suspendu', 'Reporté', 'Prolongé') THEN
        RAISE EXCEPTION 'La tâche doit être suspendue, reportée ou prolongée pour être reprise';
    END IF;
    
    -- Mettre à jour la tâche
    UPDATE planning_taches 
    SET 
        statut = 'En cours',
        date_reprise = NOW(),
        updated_at = NOW()
    WHERE id = tache_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 9. Créer une fonction pour gérer le report d'une activité
CREATE OR REPLACE FUNCTION reporte_activite(
    tache_id UUID, 
    motif TEXT, 
    nouvelle_date DATE,
    besoin_claim BOOLEAN DEFAULT FALSE
)
RETURNS BOOLEAN AS $$
DECLARE
    tache_record RECORD;
BEGIN
    -- Récupérer les informations de la tâche
    SELECT * INTO tache_record 
    FROM planning_taches 
    WHERE id = tache_id;
    
    -- Vérifier que la tâche existe et est dans le bon statut
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tâche non trouvée';
    END IF;
    
    IF tache_record.statut != 'En cours' THEN
        RAISE EXCEPTION 'La tâche doit être en statut "En cours" pour être reportée';
    END IF;
    
    -- Mettre à jour la tâche
    UPDATE planning_taches 
    SET 
        statut = 'Reporté',
        motif_report = motif,
        date_report = nouvelle_date,
        updated_at = NOW()
    WHERE id = tache_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 10. Créer une fonction pour gérer la prolongation d'une activité
CREATE OR REPLACE FUNCTION prolonge_activite(
    tache_id UUID, 
    motif TEXT, 
    duree_supplementaire INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    tache_record RECORD;
    nouvelle_date_fin DATE;
BEGIN
    -- Récupérer les informations de la tâche
    SELECT * INTO tache_record 
    FROM planning_taches 
    WHERE id = tache_id;
    
    -- Vérifier que la tâche existe et est dans le bon statut
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tâche non trouvée';
    END IF;
    
    IF tache_record.statut NOT IN ('En cours', 'Suspendu') THEN
        RAISE EXCEPTION 'La tâche doit être en cours ou suspendue pour être prolongée';
    END IF;
    
    -- Calculer la nouvelle date de fin
    nouvelle_date_fin := tache_record.date_fin_plan + INTERVAL '1 day' * duree_supplementaire;
    
    -- Mettre à jour la tâche
    UPDATE planning_taches 
    SET 
        motif_prolongation = motif,
        duree_sup = duree_supplementaire,
        date_fin_plan = nouvelle_date_fin::DATE,
        updated_at = NOW()
    WHERE id = tache_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 11. Créer une tâche cron pour mettre à jour les jours actifs quotidiennement
-- (Cette fonction sera appelée par un cron job externe ou par l'application)
CREATE OR REPLACE FUNCTION update_all_jours_actifs()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER := 0;
BEGIN
    -- Mettre à jour toutes les tâches en cours avec date_lancement
    UPDATE planning_taches 
    SET 
        jours_actifs = calculate_jours_ouvres(date_lancement::DATE, CURRENT_DATE),
        updated_at = NOW()
    WHERE statut = 'En cours' 
    AND date_lancement IS NOT NULL;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Migration 070 terminée avec succès !';
  RAISE NOTICE 'Nouveaux champs ajoutés : date_lancement, jours_actifs, motif_report, date_report, motif_prolongation, duree_sup, motif_suspension, date_suspension, responsable_suspension, date_reprise, claim_id';
  RAISE NOTICE 'Fonctions créées : lance_activite, suspend_activite, reprend_activite, reporte_activite, prolonge_activite, update_all_jours_actifs';
  RAISE NOTICE 'Trigger créé : trigger_update_jours_actifs pour le calcul automatique des jours actifs';
END $$;
