-- Créer la table competencies si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.competencies (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    code text NOT NULL UNIQUE,
    label text NOT NULL,
    description text,
    actif boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Insérer des compétences par défaut si la table est vide
INSERT INTO public.competencies (code, label, description, actif)
SELECT * FROM (VALUES
    ('AUTO', 'Automatisme', 'Compétences en automatisme et régulation', true),
    ('ELEC', 'Électricité', 'Compétences en électricité industrielle', true),
    ('CVC', 'Chauffage Ventilation Climatisation', 'Compétences en CVC', true),
    ('SECU', 'Sécurité', 'Compétences en sécurité et prévention', true),
    ('QUAL', 'Qualité', 'Compétences en qualité et normes', true),
    ('GEST', 'Gestion', 'Compétences en gestion de projet', true),
    ('FORM', 'Formation', 'Compétences en formation et encadrement', true),
    ('MAINT', 'Maintenance', 'Compétences en maintenance industrielle', true),
    ('INFO', 'Informatique', 'Compétences en informatique et digital', true),
    ('COMM', 'Communication', 'Compétences en communication et relation client', true)
) AS t(code, label, description, actif)
WHERE NOT EXISTS (SELECT 1 FROM public.competencies LIMIT 1);

-- Créer la table roles si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    code text NOT NULL UNIQUE,
    label text NOT NULL,
    description text,
    seniority_rank integer DEFAULT 0,
    is_special boolean DEFAULT false,
    actif boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Insérer des rôles par défaut si la table est vide
INSERT INTO public.roles (code, label, description, seniority_rank, is_special, actif)
SELECT * FROM (VALUES
    ('TECH', 'Technicien', 'Technicien de terrain', 1, false, true),
    ('CHEF', 'Chef d''équipe', 'Chef d''équipe technique', 2, false, true),
    ('RESP', 'Responsable', 'Responsable technique', 3, false, true),
    ('EXPERT', 'Expert', 'Expert technique', 4, true, true),
    ('MANAGER', 'Manager', 'Manager de projet', 5, true, true),
    ('DIR', 'Directeur', 'Directeur technique', 6, true, true)
) AS t(code, label, description, seniority_rank, is_special, actif)
WHERE NOT EXISTS (SELECT 1 FROM public.roles LIMIT 1);
