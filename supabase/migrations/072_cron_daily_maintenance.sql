-- Migration 072: Fonction cron pour mise à jour quotidienne des jours actifs
-- Date: 2025-01-27
-- Description: Créer une fonction cron pour mettre à jour automatiquement les jours actifs

-- 1. Créer une fonction pour mettre à jour les jours actifs de toutes les tâches en cours
CREATE OR REPLACE FUNCTION cron_update_jours_actifs()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER := 0;
    tache_record RECORD;
BEGIN
    -- Parcourir toutes les tâches en cours avec date_lancement
    FOR tache_record IN 
        SELECT id, date_lancement, date_suspension, date_reprise
        FROM planning_taches 
        WHERE statut = 'En cours' 
        AND date_lancement IS NOT NULL
    LOOP
        DECLARE
            jours_calcules INTEGER;
            date_debut_calcul DATE;
        BEGIN
            -- Déterminer la date de début du calcul
            IF tache_record.date_reprise IS NOT NULL AND tache_record.date_reprise > tache_record.date_lancement THEN
                date_debut_calcul := tache_record.date_reprise::DATE;
            ELSE
                date_debut_calcul := tache_record.date_lancement::DATE;
            END IF;
            
            -- Calculer les jours ouvrés depuis la date de début
            jours_calcules := calculate_jours_ouvres(date_debut_calcul, CURRENT_DATE);
            
            -- Soustraire les jours de suspension si applicable
            IF tache_record.date_suspension IS NOT NULL THEN
                DECLARE
                    date_fin_suspension DATE;
                BEGIN
                    -- Si pas de date de reprise, la suspension est toujours active
                    IF tache_record.date_reprise IS NOT NULL THEN
                        date_fin_suspension := tache_record.date_reprise::DATE;
                    ELSE
                        date_fin_suspension := CURRENT_DATE;
                    END IF;
                    
                    -- Soustraire les jours de suspension
                    jours_calcules := jours_calcules - calculate_jours_ouvres(
                        tache_record.date_suspension::DATE,
                        date_fin_suspension
                    );
                END;
            END IF;
            
            -- Mettre à jour la tâche avec les jours calculés
            UPDATE planning_taches 
            SET 
                jours_actifs = GREATEST(0, jours_calcules),
                updated_at = NOW()
            WHERE id = tache_record.id;
            
            updated_count := updated_count + 1;
        END;
    END LOOP;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- 2. Créer une fonction pour mettre à jour les statuts automatiquement
CREATE OR REPLACE FUNCTION cron_update_task_statuses()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER := 0;
BEGIN
    -- Mettre à jour les tâches suspendues depuis plus de 30 jours vers "Reporté"
    UPDATE planning_taches 
    SET 
        statut = 'Reporté',
        motif_report = 'Suspension prolongée (>30 jours)',
        updated_at = NOW()
    WHERE statut = 'Suspendu' 
    AND date_suspension IS NOT NULL 
    AND date_suspension < CURRENT_DATE - INTERVAL '30 days'
    AND date_reprise IS NULL;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- 3. Créer une fonction combinée pour les tâches cron quotidiennes
CREATE OR REPLACE FUNCTION daily_maintenance_tasks()
RETURNS JSON AS $$
DECLARE
    result JSON;
    jours_actifs_count INTEGER;
    status_count INTEGER;
BEGIN
    -- Mettre à jour les jours actifs
    SELECT cron_update_jours_actifs() INTO jours_actifs_count;
    
    -- Mettre à jour les statuts
    SELECT cron_update_task_statuses() INTO status_count;
    
    -- Retourner un résumé
    result := json_build_object(
        'jours_actifs_updated', jours_actifs_count,
        'statuses_updated', status_count,
        'execution_date', NOW()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 4. Créer une vue pour surveiller les tâches avec problèmes
CREATE OR REPLACE VIEW v_tasks_issues AS
SELECT 
    pt.id,
    pt.libelle_tache,
    pt.statut,
    pt.date_lancement,
    pt.jours_actifs,
    pt.date_suspension,
    pt.date_reprise,
    pt.motif_suspension,
    pt.motif_report,
    s.nom as site_nom,
    a.code_affaire
FROM planning_taches pt
LEFT JOIN sites s ON pt.site_id = s.id
LEFT JOIN affaires a ON pt.affaire_id = a.id
WHERE 
    -- Tâches suspendues depuis plus de 15 jours
    (pt.statut = 'Suspendu' AND pt.date_suspension < CURRENT_DATE - INTERVAL '15 days')
    OR
    -- Tâches reportées depuis plus de 30 jours
    (pt.statut = 'Reporté' AND pt.date_report < CURRENT_DATE - INTERVAL '30 days')
    OR
    -- Tâches en cours depuis plus de 60 jours
    (pt.statut = 'En cours' AND pt.date_lancement < CURRENT_DATE - INTERVAL '60 days')
ORDER BY pt.date_lancement DESC;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Migration 072 terminée avec succès !';
  RAISE NOTICE 'Fonctions cron créées : cron_update_jours_actifs, cron_update_task_statuses, daily_maintenance_tasks';
  RAISE NOTICE 'Vue de surveillance créée : v_tasks_issues';
  RAISE NOTICE 'Pour exécuter manuellement : SELECT daily_maintenance_tasks();';
END $$;
