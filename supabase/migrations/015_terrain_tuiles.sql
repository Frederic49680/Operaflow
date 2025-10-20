-- ============================================================================
-- Migration 015 : Module Terrain - Vue Liste & Tuiles interactives
-- ============================================================================
-- Auteur : Fred Baudry
-- Date : 2025-01-18
-- Description : Vue Liste & Tuiles interactives pour le terrain
-- PRD : prbmajsuivis.mdc
-- ============================================================================

-- ============================================================================
-- MODIFICATIONS DE LA TABLE planning_taches
-- ============================================================================
-- Ajouter les colonnes nécessaires pour la descente vers exécution
ALTER TABLE planning_taches 
ADD COLUMN IF NOT EXISTS responsable_execution_id UUID REFERENCES ressources(id),
ADD COLUMN IF NOT EXISTS descendu_vers_execution BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS date_transfert_execution TIMESTAMPTZ;

-- Index
CREATE INDEX IF NOT EXISTS idx_planning_taches_resp_exec ON planning_taches(responsable_execution_id);
CREATE INDEX IF NOT EXISTS idx_planning_taches_descendu ON planning_taches(descendu_vers_execution);

-- Commentaires
COMMENT ON COLUMN planning_taches.responsable_execution_id IS 'Responsable d''exécution (chargé de réalisation)';
COMMENT ON COLUMN planning_taches.descendu_vers_execution IS 'Indique si la tâche a été transférée vers l''exécution';
COMMENT ON COLUMN planning_taches.date_transfert_execution IS 'Date de transfert vers l''exécution';

-- ============================================================================
-- TABLE : site_blocages (blocages généraux : grèves, accès, météo)
-- ============================================================================
CREATE TABLE IF NOT EXISTS site_blocages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID REFERENCES sites(id),
    affaire_id UUID REFERENCES affaires(id),
    cause TEXT NOT NULL,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    scope_level TEXT NOT NULL CHECK (scope_level IN ('site', 'affaire')),
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes
    CONSTRAINT check_blocage_dates CHECK (end_at > start_at)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_site_blocages_site ON site_blocages(site_id);
CREATE INDEX IF NOT EXISTS idx_site_blocages_affaire ON site_blocages(affaire_id);
CREATE INDEX IF NOT EXISTS idx_site_blocages_dates ON site_blocages(start_at, end_at);

-- Commentaires
COMMENT ON TABLE site_blocages IS 'Blocages généraux (grèves, accès, météo)';
COMMENT ON COLUMN site_blocages.scope_level IS 'Niveau de blocage : site ou affaire';

-- ============================================================================
-- TABLE : confirmation_queue (queue de confirmation quotidienne)
-- ============================================================================
CREATE TABLE IF NOT EXISTS confirmation_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tache_id UUID REFERENCES planning_taches(id),
    date_question DATE NOT NULL,
    reponse BOOLEAN,
    date_reponse TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unicité : une seule question par tâche et par jour
    UNIQUE(tache_id, date_question)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_confirmation_queue_tache ON confirmation_queue(tache_id);
CREATE INDEX IF NOT EXISTS idx_confirmation_queue_date ON confirmation_queue(date_question);
CREATE INDEX IF NOT EXISTS idx_confirmation_queue_reponse ON confirmation_queue(reponse);

-- Commentaires
COMMENT ON TABLE confirmation_queue IS 'Queue de confirmation quotidienne des tâches en cours';
COMMENT ON COLUMN confirmation_queue.reponse IS 'Réponse à la question de confirmation (NULL si pas encore répondu)';

-- ============================================================================
-- FONCTION : Descente automatique vers exécution (06h00)
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_auto_descente_realisation()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Transférer les tâches du jour vers l'exécution
  UPDATE planning_taches
  SET 
    descendu_vers_execution = true,
    date_transfert_execution = NOW()
  WHERE 
    date_debut_plan <= CURRENT_DATE
    AND date_fin_plan >= CURRENT_DATE
    AND statut IN ('Non lancé', 'En cours')
    AND descendu_vers_execution = false;
  
  RAISE NOTICE 'Descente automatique vers exécution effectuée pour % tâches', FOUND;
END;
$$;

COMMENT ON FUNCTION fn_auto_descente_realisation IS 'Transfert automatique des tâches du jour vers l''exécution (06h00)';

-- ============================================================================
-- FONCTION : Confirmation quotidienne (06h30)
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_confirm_en_cours()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Créer les questions de confirmation pour les tâches en cours
  INSERT INTO confirmation_queue (tache_id, date_question)
  SELECT 
    t.id,
    CURRENT_DATE
  FROM planning_taches t
  WHERE 
    t.statut = 'En cours'
    AND t.date_debut_plan <= CURRENT_DATE
    AND t.date_fin_plan >= CURRENT_DATE
    AND NOT EXISTS (
      SELECT 1 FROM confirmation_queue cq
      WHERE cq.tache_id = t.id AND cq.date_question = CURRENT_DATE
    )
  ON CONFLICT (tache_id, date_question) DO NOTHING;
  
  RAISE NOTICE 'Confirmation quotidienne effectuée pour % tâches', FOUND;
END;
$$;

COMMENT ON FUNCTION fn_confirm_en_cours IS 'Création des questions de confirmation quotidienne (06h30)';

-- ============================================================================
-- FONCTION : Appliquer un blocage général
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_apply_site_blocage(
  p_site_id UUID,
  p_affaire_id UUID,
  p_cause TEXT,
  p_start_at TIMESTAMPTZ,
  p_end_at TIMESTAMPTZ,
  p_scope_level TEXT
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_blocage_id UUID;
BEGIN
  -- Créer le blocage
  INSERT INTO site_blocages (site_id, affaire_id, cause, start_at, end_at, scope_level)
  VALUES (p_site_id, p_affaire_id, p_cause, p_start_at, p_end_at, p_scope_level)
  RETURNING id INTO v_blocage_id;
  
  -- Suspendre les tâches concernées
  UPDATE planning_taches
  SET statut = 'Suspendu'
  WHERE 
    (p_scope_level = 'site' AND site_id = p_site_id)
    OR (p_scope_level = 'affaire' AND affaire_id = p_affaire_id)
    AND statut IN ('Non lancé', 'En cours')
    AND date_debut_plan <= p_end_at
    AND date_fin_plan >= p_start_at;
  
  -- Créer les suspensions
  INSERT INTO tache_suspensions (tache_id, suspension_start, suspension_end, motif)
  SELECT 
    t.id,
    p_start_at,
    p_end_at,
    p_cause
  FROM planning_taches t
  WHERE 
    (p_scope_level = 'site' AND site_id = p_site_id)
    OR (p_scope_level = 'affaire' AND affaire_id = p_affaire_id)
    AND statut = 'Suspendu'
    AND date_debut_plan <= p_end_at
    AND date_fin_plan >= p_start_at;
  
  RAISE NOTICE 'Blocage appliqué : % tâches suspendues', FOUND;
END;
$$;

COMMENT ON FUNCTION fn_apply_site_blocage IS 'Applique un blocage général et suspend les tâches concernées';

-- ============================================================================
-- FONCTION : Reprise après reporté
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_resume_from_report(
  p_tache_id UUID,
  p_mode TEXT,
  p_value NUMERIC DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_ancienne_fin DATE;
  v_nouvelle_fin DATE;
  v_duree_jours INTEGER;
BEGIN
  -- Récupérer la date de fin actuelle
  SELECT date_fin_plan INTO v_ancienne_fin
  FROM planning_taches
  WHERE id = p_tache_id;
  
  -- Calculer la nouvelle date de fin selon le mode
  CASE p_mode
    WHEN 'aucun' THEN
      -- Aucun impact : on garde la même fin
      v_nouvelle_fin := v_ancienne_fin;
      
    WHEN 'total' THEN
      -- Impact total : on ajoute la durée du report
      v_duree_jours := EXTRACT(DAY FROM (CURRENT_DATE - v_ancienne_fin));
      v_nouvelle_fin := v_ancienne_fin + (v_duree_jours || ' days')::INTERVAL;
      
    WHEN 'partiel' THEN
      -- Impact partiel : on ajoute un pourcentage
      v_duree_jours := EXTRACT(DAY FROM (v_ancienne_fin - date_debut_plan));
      v_nouvelle_fin := v_ancienne_fin + (v_duree_jours * p_value / 100 || ' days')::INTERVAL;
      
    WHEN 'valeur' THEN
      -- Impact valeur : on ajoute X jours
      v_nouvelle_fin := v_ancienne_fin + (p_value || ' days')::INTERVAL;
      
    ELSE
      RAISE EXCEPTION 'Mode invalide : %', p_mode;
  END CASE;
  
  -- Mettre à jour la tâche
  UPDATE planning_taches
  SET 
    date_fin_plan = v_nouvelle_fin,
    statut = 'En cours'
  WHERE id = p_tache_id;
  
  RAISE NOTICE 'Tâche reprise : nouvelle date de fin = %', v_nouvelle_fin;
END;
$$;

COMMENT ON FUNCTION fn_resume_from_report IS 'Reprend une tâche reportée et ajuste la date de fin selon le mode';

-- ============================================================================
-- FONCTION : Fermeture automatique des suspensions
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_auto_close_suspension()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Fermer les suspensions dont la date de fin est passée
  UPDATE tache_suspensions
  SET suspension_end = CURRENT_TIMESTAMP
  WHERE 
    suspension_end IS NULL
    AND suspension_start < CURRENT_TIMESTAMP - INTERVAL '1 day';
  
  RAISE NOTICE 'Suspensions fermées : %', FOUND;
END;
$$;

COMMENT ON FUNCTION fn_auto_close_suspension IS 'Ferme automatiquement les suspensions ouvertes';

-- ============================================================================
-- VUE : Affaires avec tâches du jour
-- ============================================================================
CREATE OR REPLACE VIEW v_affaires_taches_jour AS
SELECT 
  a.id as affaire_id,
  a.code_affaire,
  a.site_id,
  s.nom as site_nom,
  a.responsable_id,
  r.nom as responsable_nom,
  r.prenom as responsable_prenom,
  a.statut as affaire_statut,
  a.avancement_pct as affaire_avancement,
  -- Statistiques des tâches du jour
  (SELECT COUNT(*) FROM planning_taches t 
   WHERE t.affaire_id = a.id 
   AND t.date_debut_plan <= CURRENT_DATE 
   AND t.date_fin_plan >= CURRENT_DATE) as nb_taches_jour,
  -- Dernier statut global
  (SELECT t.statut FROM planning_taches t 
   WHERE t.affaire_id = a.id 
   AND t.date_debut_plan <= CURRENT_DATE 
   AND t.date_fin_plan >= CURRENT_DATE
   ORDER BY t.date_debut_plan DESC LIMIT 1) as dernier_statut_global
FROM affaires a
LEFT JOIN sites s ON a.site_id = s.id
LEFT JOIN ressources r ON a.responsable_id = r.id
WHERE a.statut IN ('Planifiée', 'En suivi');

COMMENT ON VIEW v_affaires_taches_jour IS 'Vue des affaires avec leurs tâches du jour';

-- ============================================================================
-- VUE : Tâches avec détails complets pour les tuiles
-- ============================================================================
CREATE OR REPLACE VIEW v_taches_tuiles AS
SELECT 
  t.id as tache_id,
  t.libelle_tache,
  t.affaire_id,
  a.code_affaire,
  t.site_id,
  s.code_site,
  s.nom as site_nom,
  t.responsable_execution_id,
  r_exec.nom as responsable_execution_nom,
  r_exec.prenom as responsable_execution_prenom,
  t.date_debut_plan,
  t.date_fin_plan,
  t.date_debut_reelle,
  t.date_fin_reelle,
  t.statut,
  t.avancement_pct,
  t.effort_plan_h,
  t.effort_reel_h,
  t.descendu_vers_execution,
  t.date_transfert_execution,
  -- Blocages actifs
  (SELECT COUNT(*) FROM site_blocages sb 
   WHERE sb.site_id = t.site_id 
   AND sb.start_at <= CURRENT_TIMESTAMP 
   AND sb.end_at >= CURRENT_TIMESTAMP) as nb_blocages_actifs,
  -- Suspensions actives
  (SELECT COUNT(*) FROM tache_suspensions ts 
   WHERE ts.tache_id = t.id 
   AND ts.suspension_end IS NULL) as nb_suspensions_actives,
  -- Confirmation en attente
  (SELECT COUNT(*) FROM confirmation_queue cq 
   WHERE cq.tache_id = t.id 
   AND cq.date_question = CURRENT_DATE 
   AND cq.reponse IS NULL) as confirmation_en_attente,
  t.date_creation,
  t.updated_at
FROM planning_taches t
LEFT JOIN affaires a ON t.affaire_id = a.id
LEFT JOIN sites s ON t.site_id = s.id
LEFT JOIN ressources r_exec ON t.responsable_execution_id = r_exec.id;

COMMENT ON VIEW v_taches_tuiles IS 'Vue des tâches avec détails complets pour les tuiles interactives';

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================
ALTER TABLE site_blocages ENABLE ROW LEVEL SECURITY;
ALTER TABLE confirmation_queue ENABLE ROW LEVEL SECURITY;

-- Policies pour site_blocages
CREATE POLICY "Lecture publique des blocages"
    ON site_blocages FOR SELECT
    USING (true);

CREATE POLICY "Insertion blocages admin"
    ON site_blocages FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Modification blocages admin"
    ON site_blocages FOR UPDATE
    USING (true);

-- Policies pour confirmation_queue
CREATE POLICY "Lecture publique des confirmations"
    ON confirmation_queue FOR SELECT
    USING (true);

CREATE POLICY "Insertion confirmations admin"
    ON confirmation_queue FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Modification confirmations admin"
    ON confirmation_queue FOR UPDATE
    USING (true);

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================

