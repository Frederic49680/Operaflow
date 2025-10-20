-- Migration: Form Builder (Custom Follow-ups)
-- Description: Création de masques dynamiques
-- Date: 2025-01-18
-- PRD #12

-- Table: forms (définition de masque)
CREATE TABLE IF NOT EXISTS forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    version INTEGER DEFAULT 1,
    schema JSONB NOT NULL, -- JSON Schema-like des champs/sections/visibilité/validations/états
    permissions JSONB, -- qui peut créer/lire/valider/exporter
    published BOOLEAN DEFAULT false,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_forms_published ON forms(published);
CREATE INDEX IF NOT EXISTS idx_forms_created_by ON forms(created_by);

-- Table: form_instances (publication/portée)
CREATE TABLE IF NOT EXISTS form_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    scope_type TEXT NOT NULL CHECK (scope_type IN ('site', 'affaire', 'tache', 'global')),
    scope_id UUID,
    schedule JSONB, -- fenêtre horaire, fréquence, rappels
    digest_settings JSONB, -- périodicité, destinataires
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_form_instances_form ON form_instances(form_id);
CREATE INDEX IF NOT EXISTS idx_form_instances_scope ON form_instances(scope_type, scope_id);
CREATE INDEX IF NOT EXISTS idx_form_instances_active ON form_instances(is_active);

-- Table: form_entries (données)
CREATE TABLE IF NOT EXISTS form_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
    instance_id UUID REFERENCES form_instances(id) ON DELETE CASCADE,
    site_id UUID REFERENCES sites(id),
    affaire_id UUID REFERENCES affaires(id),
    tache_id UUID REFERENCES planning_taches(id),
    author UUID,
    date_jour DATE,
    state TEXT,
    data JSONB NOT NULL, -- payload champs
    attachments JSONB[],
    confirmed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_form_entries_form ON form_entries(form_id);
CREATE INDEX IF NOT EXISTS idx_form_entries_instance ON form_entries(instance_id);
CREATE INDEX IF NOT EXISTS idx_form_entries_site ON form_entries(site_id);
CREATE INDEX IF NOT EXISTS idx_form_entries_affaire ON form_entries(affaire_id);
CREATE INDEX IF NOT EXISTS idx_form_entries_tache ON form_entries(tache_id);
CREATE INDEX IF NOT EXISTS idx_form_entries_date ON form_entries(date_jour);
CREATE INDEX IF NOT EXISTS idx_form_entries_confirmed ON form_entries(confirmed);

-- Table: form_entry_history
CREATE TABLE IF NOT EXISTS form_entry_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID REFERENCES form_entries(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('create', 'update', 'confirm', 'validate')),
    diff JSONB,
    actor UUID,
    at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_form_entry_history_entry ON form_entry_history(entry_id);
CREATE INDEX IF NOT EXISTS idx_form_entry_history_at ON form_entry_history(at DESC);

-- Table: form_notifications
CREATE TABLE IF NOT EXISTS form_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES forms(id),
    instance_id UUID REFERENCES form_instances(id),
    type TEXT CHECK (type IN ('rappels', 'digest', 'alertes')),
    destinataires TEXT[],
    message TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT CHECK (status IN ('sent', 'failed')) DEFAULT 'sent'
);

-- Index
CREATE INDEX IF NOT EXISTS idx_form_notifications_form ON form_notifications(form_id);
CREATE INDEX IF NOT EXISTS idx_form_notifications_sent_at ON form_notifications(sent_at DESC);

-- RLS (Row Level Security)
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_entry_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_notifications ENABLE ROW LEVEL SECURITY;

-- Policies pour forms
CREATE POLICY "Lecture publique des forms"
    ON forms FOR SELECT
    USING (true);

CREATE POLICY "Insertion forms admin"
    ON forms FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Modification forms admin"
    ON forms FOR UPDATE
    USING (true);

-- Policies pour form_instances
CREATE POLICY "Lecture publique des instances"
    ON form_instances FOR SELECT
    USING (true);

CREATE POLICY "Insertion instances admin"
    ON form_instances FOR INSERT
    WITH CHECK (true);

-- Policies pour form_entries
CREATE POLICY "Lecture publique des entrées"
    ON form_entries FOR SELECT
    USING (true);

CREATE POLICY "Insertion entrées admin"
    ON form_entries FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Modification entrées admin"
    ON form_entries FOR UPDATE
    USING (true);

-- Commentaires
COMMENT ON TABLE forms IS 'Définitions de masques (formulaires dynamiques)';
COMMENT ON TABLE form_instances IS 'Publications de masques (portée site/affaire/tâche)';
COMMENT ON TABLE form_entries IS 'Données saisies (entrées des masques)';
COMMENT ON TABLE form_entry_history IS 'Historique des modifications d''entrées';
COMMENT ON TABLE form_notifications IS 'Traces d''envoi de notifications (rappels/digest)';

