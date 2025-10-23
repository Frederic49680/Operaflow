-- Script pour appliquer la migration Plan de Formation
-- À exécuter dans Supabase SQL Editor

-- 1. Catalogue des formations
CREATE TABLE IF NOT EXISTS catalogue_formations (
    formation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intitule TEXT NOT NULL,
    validite_mois INTEGER,
    duree_jours INTEGER,
    category TEXT NOT NULL CHECK (category IN ('SECURITE', 'QUALITE', 'AUTO', 'TECHNIQUE', 'MANAGEMENT', 'AUTRE')),
    organisme_id UUID,
    tarif_unitaire NUMERIC(10,2),
    tarif_groupe NUMERIC(10,2),
    min_participants INTEGER DEFAULT 1,
    max_participants INTEGER DEFAULT 20,
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Historique des formations par ressource
CREATE TABLE IF NOT EXISTS ressource_formations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES ressources(id) ON DELETE CASCADE,
    formation_id UUID NOT NULL REFERENCES catalogue_formations(formation_id) ON DELETE CASCADE,
    date_obtention DATE NOT NULL,
    date_expiration DATE,
    mode TEXT NOT NULL CHECK (mode IN ('INTERNE', 'EXTERNE')),
    preuve_url TEXT,
    statut TEXT DEFAULT 'VALIDE' CHECK (statut IN ('VALIDE', 'EXPIRED', 'SUSPENDU')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(resource_id, formation_id, date_obtention)
);

-- 3. Plan de Formation (table principale)
CREATE TABLE IF NOT EXISTS plan_formations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    annee INTEGER NOT NULL,
    resource_id UUID NOT NULL REFERENCES ressources(id) ON DELETE CASCADE,
    formation_id UUID NOT NULL REFERENCES catalogue_formations(formation_id) ON DELETE CASCADE,
    mois_cible INTEGER CHECK (mois_cible >= 1 AND mois_cible <= 12),
    trimestre_cible INTEGER CHECK (trimestre_cible >= 1 AND trimestre_cible <= 4),
    category TEXT NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('ECHEANCE', 'MANUEL_HORS_PLAN')) DEFAULT 'ECHEANCE',
    phase TEXT NOT NULL CHECK (phase IN ('PREVISIONNEL', 'PLAN')) DEFAULT 'PREVISIONNEL',
    statut TEXT NOT NULL CHECK (statut IN ('EN_ATTENTE_VALIDATION', 'VALIDE', 'REJETE', 'PLANIFIE', 'REALISE', 'ANNULE')) DEFAULT 'EN_ATTENTE_VALIDATION',
    session_id UUID,
    cost_planned NUMERIC(10,2),
    cout_estime NUMERIC(10,2),
    baseline_version INTEGER DEFAULT 0,
    validated_at TIMESTAMPTZ,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(annee, resource_id, formation_id)
);

-- 4. Snapshots (baselines gelées)
CREATE TABLE IF NOT EXISTS plan_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    annee INTEGER NOT NULL,
    version INTEGER NOT NULL,
    committed_at TIMESTAMPTZ DEFAULT NOW(),
    committed_by UUID,
    tot_count INTEGER DEFAULT 0,
    tot_cost NUMERIC(10,2) DEFAULT 0,
    by_category JSONB DEFAULT '{}',
    by_quarter JSONB DEFAULT '{}',
    by_month JSONB DEFAULT '{}',
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(annee, version)
);

-- 5. Journal financier (ledger)
CREATE TABLE IF NOT EXISTS training_finance_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_item_id UUID REFERENCES plan_formations(id) ON DELETE CASCADE,
    annee INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('PLANNED', 'COMMITTED', 'ACTUAL', 'ADJUSTMENT')),
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    date DATE NOT NULL,
    source TEXT,
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Avenants (intégration de hors plan)
CREATE TABLE IF NOT EXISTS plan_change_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    annee INTEGER NOT NULL,
    version_from INTEGER NOT NULL,
    version_to INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    reason TEXT NOT NULL,
    delta_count INTEGER DEFAULT 0,
    delta_cost NUMERIC(10,2) DEFAULT 0,
    breakdown JSONB DEFAULT '{}'
);

-- 7. Sessions de formation
CREATE TABLE IF NOT EXISTS formation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    formation_id UUID NOT NULL REFERENCES catalogue_formations(formation_id) ON DELETE CASCADE,
    intitule TEXT NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    lieu TEXT,
    formateur TEXT,
    statut TEXT DEFAULT 'PLANIFIEE' CHECK (statut IN ('PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ANNULEE')),
    nb_participants INTEGER DEFAULT 0,
    cout_session NUMERIC(10,2),
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Participants aux sessions
CREATE TABLE IF NOT EXISTS session_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES formation_sessions(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES ressources(id) ON DELETE CASCADE,
    statut TEXT DEFAULT 'INSCRIT' CHECK (statut IN ('INSCRIT', 'PRESENT', 'ABSENT', 'ANNULE')),
    presence_jours INTEGER DEFAULT 0,
    note_finale NUMERIC(3,1),
    commentaire TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, resource_id)
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_ressource_formations_resource_id ON ressource_formations(resource_id);
CREATE INDEX IF NOT EXISTS idx_ressource_formations_formation_id ON ressource_formations(formation_id);
CREATE INDEX IF NOT EXISTS idx_ressource_formations_date_expiration ON ressource_formations(date_expiration);
CREATE INDEX IF NOT EXISTS idx_plan_formations_annee ON plan_formations(annee);
CREATE INDEX IF NOT EXISTS idx_plan_formations_phase ON plan_formations(phase);
CREATE INDEX IF NOT EXISTS idx_plan_formations_statut ON plan_formations(statut);
CREATE INDEX IF NOT EXISTS idx_plan_formations_resource_id ON plan_formations(resource_id);
CREATE INDEX IF NOT EXISTS idx_plan_snapshots_annee_version ON plan_snapshots(annee, version);
CREATE INDEX IF NOT EXISTS idx_training_finance_ledger_annee ON training_finance_ledger(annee);
CREATE INDEX IF NOT EXISTS idx_training_finance_ledger_type ON training_finance_ledger(type);
CREATE INDEX IF NOT EXISTS idx_formation_sessions_date_debut ON formation_sessions(date_debut);
CREATE INDEX IF NOT EXISTS idx_session_participants_session_id ON session_participants(session_id);

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_catalogue_formations_updated_at BEFORE UPDATE ON catalogue_formations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ressource_formations_updated_at BEFORE UPDATE ON ressource_formations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plan_formations_updated_at BEFORE UPDATE ON plan_formations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_formation_sessions_updated_at BEFORE UPDATE ON formation_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour générer le plan prévisionnel
CREATE OR REPLACE FUNCTION generate_plan_previsionnel(target_annee INTEGER)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    formation_record RECORD;
    resource_record RECORD;
    mois_cible INTEGER;
    trimestre_cible INTEGER;
    count_inserted INTEGER := 0;
BEGIN
    -- Supprimer les anciens prévisionnels pour cette année
    DELETE FROM plan_formations WHERE annee = target_annee AND phase = 'PREVISIONNEL';
    
    -- Parcourir toutes les formations qui expirent dans l'année cible
    FOR formation_record IN 
        SELECT rf.*, cf.category, cf.tarif_unitaire
        FROM ressource_formations rf
        JOIN catalogue_formations cf ON rf.formation_id = cf.formation_id
        WHERE rf.date_expiration IS NOT NULL 
        AND EXTRACT(YEAR FROM rf.date_expiration) = target_annee
        AND rf.statut = 'VALIDE'
    LOOP
        -- Calculer le mois cible (J-60 avant expiration)
        mois_cible := EXTRACT(MONTH FROM formation_record.date_expiration - INTERVAL '60 days');
        IF mois_cible < 1 THEN
            mois_cible := 1;
        END IF;
        
        -- Calculer le trimestre cible
        trimestre_cible := CEIL(mois_cible / 3.0);
        
        -- Insérer dans le plan prévisionnel
        INSERT INTO plan_formations (
            annee, resource_id, formation_id, mois_cible, trimestre_cible,
            category, source, phase, statut, cout_estime, created_at
        ) VALUES (
            target_annee, formation_record.resource_id, formation_record.formation_id,
            mois_cible, trimestre_cible, formation_record.category,
            'ECHEANCE', 'PREVISIONNEL', 'EN_ATTENTE_VALIDATION',
            formation_record.tarif_unitaire, NOW()
        );
        
        count_inserted := count_inserted + 1;
    END LOOP;
    
    result := jsonb_build_object(
        'success', true,
        'annee', target_annee,
        'count_inserted', count_inserted,
        'message', 'Plan prévisionnel généré avec succès'
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour valider le plan prévisionnel
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

-- Fonction pour calculer les KPIs
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

-- RLS Policies
ALTER TABLE catalogue_formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ressource_formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_finance_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE formation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;

-- Policies pour catalogue_formations
CREATE POLICY "Catalogue formations - Lecture pour tous" ON catalogue_formations FOR SELECT USING (true);
CREATE POLICY "Catalogue formations - Écriture pour RH" ON catalogue_formations FOR ALL USING (true);

-- Policies pour ressource_formations
CREATE POLICY "Ressource formations - Lecture pour tous" ON ressource_formations FOR SELECT USING (true);
CREATE POLICY "Ressource formations - Écriture pour RH" ON ressource_formations FOR ALL USING (true);

-- Policies pour plan_formations
CREATE POLICY "Plan formations - Lecture pour tous" ON plan_formations FOR SELECT USING (true);
CREATE POLICY "Plan formations - Écriture pour RH" ON plan_formations FOR ALL USING (true);

-- Policies pour plan_snapshots
CREATE POLICY "Plan snapshots - Lecture pour tous" ON plan_snapshots FOR SELECT USING (true);
CREATE POLICY "Plan snapshots - Écriture pour RH" ON plan_snapshots FOR ALL USING (true);

-- Policies pour training_finance_ledger
CREATE POLICY "Training finance ledger - Lecture pour tous" ON training_finance_ledger FOR SELECT USING (true);
CREATE POLICY "Training finance ledger - Écriture pour RH" ON training_finance_ledger FOR ALL USING (true);

-- Policies pour plan_change_orders
CREATE POLICY "Plan change orders - Lecture pour tous" ON plan_change_orders FOR SELECT USING (true);
CREATE POLICY "Plan change orders - Écriture pour RH" ON plan_change_orders FOR ALL USING (true);

-- Policies pour formation_sessions
CREATE POLICY "Formation sessions - Lecture pour tous" ON formation_sessions FOR SELECT USING (true);
CREATE POLICY "Formation sessions - Écriture pour RH" ON formation_sessions FOR ALL USING (true);

-- Policies pour session_participants
CREATE POLICY "Session participants - Lecture pour tous" ON session_participants FOR SELECT USING (true);
CREATE POLICY "Session participants - Écriture pour RH" ON session_participants FOR ALL USING (true);

-- Données de test pour le catalogue
INSERT INTO catalogue_formations (intitule, validite_mois, duree_jours, category, tarif_unitaire, tarif_groupe) VALUES
('SST - Sauveteur Secouriste du Travail', 24, 2, 'SECURITE', 350.00, 300.00),
('Habilitation Électrique BR', 36, 3, 'SECURITE', 450.00, 400.00),
('Habilitation Électrique B1V', 36, 2, 'SECURITE', 380.00, 320.00),
('CACES R389 - Chariot Élévateur', 60, 3, 'SECURITE', 420.00, 350.00),
('Formation Qualité ISO 9001', 36, 2, 'QUALITE', 280.00, 240.00),
('Management d''équipe', 24, 3, 'MANAGEMENT', 650.00, 580.00),
('Formation Auto - Permis B', 120, 5, 'AUTO', 1200.00, 1000.00),
('Formation Technique - Soudure', 24, 4, 'TECHNIQUE', 520.00, 450.00);

-- Commentaires sur les tables
COMMENT ON TABLE catalogue_formations IS 'Catalogue des formations disponibles';
COMMENT ON TABLE ressource_formations IS 'Historique des formations par ressource';
COMMENT ON TABLE plan_formations IS 'Plan de formation principal (prévisionnel et validé)';
COMMENT ON TABLE plan_snapshots IS 'Snapshots des plans validés (baselines)';
COMMENT ON TABLE training_finance_ledger IS 'Journal financier des formations';
COMMENT ON TABLE plan_change_orders IS 'Avenants au plan de formation';
COMMENT ON TABLE formation_sessions IS 'Sessions de formation planifiées';
COMMENT ON TABLE session_participants IS 'Participants aux sessions de formation';

SELECT 'Migration Plan de Formation appliquée avec succès' as result;
