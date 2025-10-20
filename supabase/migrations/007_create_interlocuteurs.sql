-- Migration: Module Interlocuteurs Clients
-- Description: Gestion des clients et contacts
-- Date: 2025-01-18
-- PRD #9

-- Table: interlocuteurs (contacts clients)
CREATE TABLE IF NOT EXISTS interlocuteurs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id),
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    fonction TEXT,
    type_interlocuteur TEXT CHECK (type_interlocuteur IN ('Technique', 'Administratif', 'Facturation', 'Autre')),
    email TEXT,
    telephone TEXT,
    disponibilite TEXT,
    site_id UUID REFERENCES sites(id),
    actif BOOLEAN DEFAULT true,
    notes TEXT,
    photo_url TEXT,
    date_creation TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID
);

-- Index
CREATE INDEX IF NOT EXISTS idx_interlocuteurs_client ON interlocuteurs(client_id);
CREATE INDEX IF NOT EXISTS idx_interlocuteurs_site ON interlocuteurs(site_id);
CREATE INDEX IF NOT EXISTS idx_interlocuteurs_actif ON interlocuteurs(actif);

-- Table: affaires_interlocuteurs (liaison affaires <-> interlocuteurs)
CREATE TABLE IF NOT EXISTS affaires_interlocuteurs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affaire_id UUID REFERENCES affaires(id) ON DELETE CASCADE,
    interlocuteur_id UUID REFERENCES interlocuteurs(id) ON DELETE CASCADE,
    role_affaire TEXT CHECK (role_affaire IN ('Technique', 'Administratif', 'Facturation', 'Exploitant', 'Réception', 'Réclamation', 'Autre')),
    principal BOOLEAN DEFAULT false,
    actif BOOLEAN DEFAULT true,
    date_liaison TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    
    -- Un interlocuteur ne peut avoir qu'un seul rôle principal par affaire
    UNIQUE(affaire_id, interlocuteur_id, role_affaire)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_affaires_interlocuteurs_affaire ON affaires_interlocuteurs(affaire_id);
CREATE INDEX IF NOT EXISTS idx_affaires_interlocuteurs_interlocuteur ON affaires_interlocuteurs(interlocuteur_id);

-- Table: interactions_client (historique des échanges)
CREATE TABLE IF NOT EXISTS interactions_client (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interlocuteur_id UUID REFERENCES interlocuteurs(id) ON DELETE CASCADE,
    affaire_id UUID REFERENCES affaires(id) ON DELETE CASCADE,
    type_interaction TEXT CHECK (type_interaction IN ('Appel', 'Mail', 'Réunion', 'Claim', 'Autre')),
    description TEXT,
    fichier_url TEXT,
    date_interaction TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID
);

-- Index
CREATE INDEX IF NOT EXISTS idx_interactions_interlocuteur ON interactions_client(interlocuteur_id);
CREATE INDEX IF NOT EXISTS idx_interactions_affaire ON interactions_client(affaire_id);
CREATE INDEX IF NOT EXISTS idx_interactions_date ON interactions_client(date_interaction DESC);

-- RLS (Row Level Security)
ALTER TABLE interlocuteurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE affaires_interlocuteurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions_client ENABLE ROW LEVEL SECURITY;

-- Policies pour interlocuteurs
CREATE POLICY "Lecture publique des interlocuteurs"
    ON interlocuteurs FOR SELECT
    USING (true);

CREATE POLICY "Insertion interlocuteurs admin"
    ON interlocuteurs FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Modification interlocuteurs admin"
    ON interlocuteurs FOR UPDATE
    USING (true);

-- Policies pour affaires_interlocuteurs
CREATE POLICY "Lecture publique des liaisons"
    ON affaires_interlocuteurs FOR SELECT
    USING (true);

CREATE POLICY "Insertion liaisons admin"
    ON affaires_interlocuteurs FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Modification liaisons admin"
    ON affaires_interlocuteurs FOR UPDATE
    USING (true);

-- Policies pour interactions_client
CREATE POLICY "Lecture publique des interactions"
    ON interactions_client FOR SELECT
    USING (true);

CREATE POLICY "Insertion interactions admin"
    ON interactions_client FOR INSERT
    WITH CHECK (true);

-- Commentaires
COMMENT ON TABLE interlocuteurs IS 'Contacts clients (personnes)';
COMMENT ON TABLE affaires_interlocuteurs IS 'Liaison entre affaires et interlocuteurs avec rôles';
COMMENT ON TABLE interactions_client IS 'Historique des échanges avec les clients';

-- Vue pour les interlocuteurs avec informations du client
CREATE OR REPLACE VIEW v_interlocuteurs_complets AS
SELECT 
    i.id,
    i.client_id,
    c.nom_client,
    i.nom,
    i.prenom,
    i.fonction,
    i.type_interlocuteur,
    i.email,
    i.telephone,
    i.disponibilite,
    i.site_id,
    s.nom as site_nom,
    i.actif,
    i.notes,
    i.photo_url,
    i.date_creation
FROM interlocuteurs i
LEFT JOIN clients c ON i.client_id = c.id
LEFT JOIN sites s ON i.site_id = s.id;

COMMENT ON VIEW v_interlocuteurs_complets IS 'Vue des interlocuteurs avec informations client et site';

