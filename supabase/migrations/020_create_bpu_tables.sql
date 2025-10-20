-- ============================================================================
-- Migration 020 : Module BPU (Bordereau de Prix Unitaire)
-- ============================================================================
-- Auteur : Fred Baudry
-- Date : 2025-01-19
-- Description : Création des tables et modifications pour le module BPU
-- PRD : prdmajmaintenancebpu.mdc
-- ============================================================================

-- ============================================================================
-- MODIFICATIONS DE LA TABLE affaires
-- ============================================================================

-- Ajouter colonnes BPU
ALTER TABLE affaires
  ADD COLUMN IF NOT EXISTS type_affaire TEXT CHECK (type_affaire IN ('BPU', 'Forfait', 'Maintenance', 'Autre')),
  ADD COLUMN IF NOT EXISTS nb_ressources_ref INTEGER DEFAULT 2,
  ADD COLUMN IF NOT EXISTS heures_semaine_ref NUMERIC DEFAULT 35,
  ADD COLUMN IF NOT EXISTS periode_debut DATE,
  ADD COLUMN IF NOT EXISTS periode_fin DATE;

-- Index
CREATE INDEX IF NOT EXISTS idx_affaires_type_affaire ON affaires(type_affaire);

-- Commentaires
COMMENT ON COLUMN affaires.type_affaire IS 'Type d''affaire : BPU, Forfait, Maintenance, Autre';
COMMENT ON COLUMN affaires.nb_ressources_ref IS 'Nombre de ressources de référence pour le calcul de capacité BPU';
COMMENT ON COLUMN affaires.heures_semaine_ref IS 'Heures par semaine de référence (défaut: 35h)';
COMMENT ON COLUMN affaires.periode_debut IS 'Début de la période BPU';
COMMENT ON COLUMN affaires.periode_fin IS 'Fin de la période BPU';

-- ============================================================================
-- TABLE : affaire_bpu_lignes (lignes du BPU)
-- ============================================================================

CREATE TABLE IF NOT EXISTS affaire_bpu_lignes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affaire_id UUID NOT NULL REFERENCES affaires(id) ON DELETE CASCADE,
    
    -- Identification
    code_bpu TEXT NOT NULL,
    libelle TEXT NOT NULL,
    systeme_elementaire TEXT,  -- Identifiant technique (ex. LAA001)
    
    -- Quantité et prix
    quantite NUMERIC(10, 2),
    unite TEXT CHECK (unite IN ('unité', 'heure', 'jour', 'kg', 'm²', 'm', 'autre')),
    pu NUMERIC(12, 2),  -- Prix unitaire
    
    -- BPU horaire (pour code "vierge" ou activités non au BPU)
    pu_horaire NUMERIC(12, 2),  -- Prix à l'heure (multiplié par heures_metal)
    heures_equiv_unitaire NUMERIC(10, 2),  -- Équivalence heures pour 1 unité
    
    -- Statut
    statut_ligne TEXT NOT NULL CHECK (statut_ligne IN ('proposee', 'vendue', 'annulee')) DEFAULT 'proposee',
    
    -- Livraison (mis à jour par les réalisations)
    delivered_qty NUMERIC(10, 2) DEFAULT 0,
    delivered_hours NUMERIC(10, 2) DEFAULT 0,
    montant_reconnu NUMERIC(12, 2) DEFAULT 0,
    
    -- Métadonnées
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes
    CONSTRAINT check_delivered_qty CHECK (delivered_qty <= quantite OR quantite IS NULL),
    CONSTRAINT check_delivered_hours CHECK (delivered_hours >= 0),
    CONSTRAINT check_montant_reconnu CHECK (montant_reconnu >= 0)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_bpu_lignes_affaire ON affaire_bpu_lignes(affaire_id);
CREATE INDEX IF NOT EXISTS idx_bpu_lignes_statut ON affaire_bpu_lignes(statut_ligne);
CREATE INDEX IF NOT EXISTS idx_bpu_lignes_systeme_elementaire ON affaire_bpu_lignes(systeme_elementaire);
CREATE INDEX IF NOT EXISTS idx_bpu_lignes_code_bpu ON affaire_bpu_lignes(code_bpu);

-- Commentaires
COMMENT ON TABLE affaire_bpu_lignes IS 'Lignes du BPU (Bordereau de Prix Unitaire)';
COMMENT ON COLUMN affaire_bpu_lignes.code_bpu IS 'Code BPU (peut être "VIERGE" pour activités non au BPU)';
COMMENT ON COLUMN affaire_bpu_lignes.libelle IS 'Libellé de la ligne (type de maintenance)';
COMMENT ON COLUMN affaire_bpu_lignes.systeme_elementaire IS 'Identifiant technique (ex. LAA001) - peut être partagé entre plusieurs lignes';
COMMENT ON COLUMN affaire_bpu_lignes.pu_horaire IS 'Prix à l''heure (pour code VIERGE ou activités non au BPU)';
COMMENT ON COLUMN affaire_bpu_lignes.statut_ligne IS 'Statut : proposee (en attente), vendue (validée), annulee';
COMMENT ON COLUMN affaire_bpu_lignes.delivered_qty IS 'Quantité livrée (pour BPU à l''unité)';
COMMENT ON COLUMN affaire_bpu_lignes.delivered_hours IS 'Heures livrées (pour BPU horaire)';
COMMENT ON COLUMN affaire_bpu_lignes.montant_reconnu IS 'Montant reconnu (€)';

-- ============================================================================
-- TABLE : affaire_bpu_calendrier (calendrier des semaines actives)
-- ============================================================================

CREATE TABLE IF NOT EXISTS affaire_bpu_calendrier (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affaire_id UUID NOT NULL REFERENCES affaires(id) ON DELETE CASCADE,
    
    -- Période
    annee INTEGER NOT NULL,
    semaine INTEGER NOT NULL CHECK (semaine >= 1 AND semaine <= 53),
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    
    -- Statut
    active BOOLEAN DEFAULT true,  -- true = semaine active, false = pause
    
    -- Métadonnées
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unicité : une seule entrée par affaire et par semaine
    UNIQUE(affaire_id, annee, semaine)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_bpu_calendrier_affaire ON affaire_bpu_calendrier(affaire_id);
CREATE INDEX IF NOT EXISTS idx_bpu_calendrier_annee_semaine ON affaire_bpu_calendrier(annee, semaine);
CREATE INDEX IF NOT EXISTS idx_bpu_calendrier_active ON affaire_bpu_calendrier(active);

-- Commentaires
COMMENT ON TABLE affaire_bpu_calendrier IS 'Calendrier des semaines actives pour les affaires BPU';
COMMENT ON COLUMN affaire_bpu_calendrier.active IS 'true = semaine active (travail), false = pause';

-- ============================================================================
-- MODIFICATIONS DE LA TABLE planning_taches
-- ============================================================================

-- Ajouter colonne parapluie BPU
ALTER TABLE planning_taches
  ADD COLUMN IF NOT EXISTS is_parapluie_bpu BOOLEAN DEFAULT false;

-- Index
CREATE INDEX IF NOT EXISTS idx_planning_taches_parapluie_bpu ON planning_taches(is_parapluie_bpu);

-- Commentaires
COMMENT ON COLUMN planning_taches.is_parapluie_bpu IS 'Indique si la tâche est une tâche parapluie BPU';

-- ============================================================================
-- MODIFICATIONS DE LA TABLE maintenance_journal
-- ============================================================================

-- Ajouter colonnes BPU
ALTER TABLE maintenance_journal
  ADD COLUMN IF NOT EXISTS affaire_id UUID REFERENCES affaires(id),
  ADD COLUMN IF NOT EXISTS bpu_ligne_id UUID REFERENCES affaire_bpu_lignes(id);

-- Index
CREATE INDEX IF NOT EXISTS idx_maintenance_journal_affaire ON maintenance_journal(affaire_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_journal_bpu_ligne ON maintenance_journal(bpu_ligne_id);

-- Commentaires
COMMENT ON COLUMN maintenance_journal.affaire_id IS 'Lien vers l''affaire (si réalisation BPU)';
COMMENT ON COLUMN maintenance_journal.bpu_ligne_id IS 'Lien vers la ligne BPU concernée';

-- ============================================================================
-- VUES : V_Affaire_BPU_Suivi
-- ============================================================================

CREATE OR REPLACE VIEW V_Affaire_BPU_Suivi AS
SELECT 
    a.id as affaire_id,
    a.code_affaire,
    a.code_affaire as nom_affaire,
    a.type_affaire,
    a.nb_ressources_ref,
    a.heures_semaine_ref,
    a.periode_debut,
    a.periode_fin,
    
    -- Capacité (heures)
    CASE 
        WHEN a.periode_debut IS NOT NULL AND a.periode_fin IS NOT NULL THEN
            (a.nb_ressources_ref * a.heures_semaine_ref * 
             (SELECT COUNT(*) 
              FROM affaire_bpu_calendrier 
              WHERE affaire_id = a.id AND active = true))
        ELSE NULL
    END as heures_capacite,
    
    -- Vendu (heures) - somme des heures équivalentes des lignes vendues
    COALESCE((
        SELECT SUM(
            CASE 
                WHEN unite = 'heure' THEN quantite
                WHEN heures_equiv_unitaire IS NOT NULL THEN quantite * heures_equiv_unitaire
                ELSE 0
            END
        )
        FROM affaire_bpu_lignes
        WHERE affaire_id = a.id AND statut_ligne = 'vendue'
    ), 0) as heures_vendues,
    
    -- Consommé (heures) - somme des heures métal des réalisations terminées
    COALESCE((
        SELECT SUM(heures_metal)
        FROM maintenance_journal
        WHERE affaire_id = a.id AND etat_reel = 'Termine'
    ), 0) as heures_consommes,
    
    -- Reconnu (€)
    COALESCE((
        SELECT SUM(montant_reconnu)
        FROM affaire_bpu_lignes
        WHERE affaire_id = a.id
    ), 0) as montant_reconnu,
    
    -- Écarts
    COALESCE((
        SELECT SUM(
            CASE 
                WHEN unite = 'heure' THEN quantite
                WHEN heures_equiv_unitaire IS NOT NULL THEN quantite * heures_equiv_unitaire
                ELSE 0
            END
        )
        FROM affaire_bpu_lignes
        WHERE affaire_id = a.id AND statut_ligne = 'vendue'
    ), 0) - COALESCE((
        SELECT SUM(heures_metal)
        FROM maintenance_journal
        WHERE affaire_id = a.id AND etat_reel = 'Termine'
    ), 0) as ecart_heures,
    
    -- KPI
    CASE 
        WHEN a.periode_debut IS NOT NULL AND a.periode_fin IS NOT NULL THEN
            ROUND(
                (COALESCE((
                    SELECT SUM(heures_metal)
                    FROM maintenance_journal
                    WHERE affaire_id = a.id AND etat_reel = 'Termine'
                ), 0) / NULLIF(
                    (a.nb_ressources_ref * a.heures_semaine_ref * 
                     (SELECT COUNT(*) 
                      FROM affaire_bpu_calendrier 
                      WHERE affaire_id = a.id AND active = true)),
                    0
                )) * 100,
                2
            )
        ELSE NULL
    END as taux_remplissage_pct,
    
    CASE 
        WHEN COALESCE((
            SELECT SUM(
                CASE 
                    WHEN unite = 'heure' THEN quantite
                    WHEN heures_equiv_unitaire IS NOT NULL THEN quantite * heures_equiv_unitaire
                    ELSE 0
                END
            )
            FROM affaire_bpu_lignes
            WHERE affaire_id = a.id AND statut_ligne = 'vendue'
        ), 0) > 0 THEN
            ROUND(
                (COALESCE((
                    SELECT SUM(heures_metal)
                    FROM maintenance_journal
                    WHERE affaire_id = a.id AND etat_reel = 'Termine'
                ), 0) / NULLIF(
                    COALESCE((
                        SELECT SUM(
                            CASE 
                                WHEN unite = 'heure' THEN quantite
                                WHEN heures_equiv_unitaire IS NOT NULL THEN quantite * heures_equiv_unitaire
                                ELSE 0
                            END
                        )
                        FROM affaire_bpu_lignes
                        WHERE affaire_id = a.id AND statut_ligne = 'vendue'
                    ), 0),
                    0
                )) * 100,
                2
            )
        ELSE NULL
    END as taux_realisation_pct
    
FROM affaires a
WHERE a.type_affaire = 'BPU';

COMMENT ON VIEW V_Affaire_BPU_Suivi IS 'Suivi des affaires BPU : capacité, vendu, consommé, reconnu, écarts';

-- ============================================================================
-- VUE : V_Affaire_BPU_Livraisons
-- ============================================================================

CREATE OR REPLACE VIEW V_Affaire_BPU_Livraisons AS
SELECT 
    mj.id as realisation_id,
    mj.affaire_id,
    mj.bpu_ligne_id,
    mj.date_jour,
    mj.tranche,
    mj.systeme_elementaire,
    mj.systeme,
    mj.type_maintenance,
    mj.etat_reel,
    mj.heures_presence,
    mj.heures_suspension,
    mj.heures_metal,
    mj.motif,
    mj.description,
    
    -- Informations ligne BPU
    bl.code_bpu,
    bl.libelle as libelle_bpu,
    bl.unite,
    bl.pu,
    bl.pu_horaire,
    
    -- Montant reconnu pour cette réalisation
    CASE 
        WHEN mj.etat_reel = 'Termine' THEN
            CASE 
                WHEN bl.unite = 'heure' AND bl.pu_horaire IS NOT NULL THEN
                    mj.heures_metal * bl.pu_horaire
                WHEN bl.unite = 'unité' AND bl.pu IS NOT NULL THEN
                    bl.pu
                ELSE 0
            END
        ELSE 0
    END as montant_realisation,
    
    -- Informations affaire
    a.code_affaire,
    a.code_affaire as nom_affaire,
    s.nom as nom_site
    
FROM maintenance_journal mj
LEFT JOIN affaire_bpu_lignes bl ON mj.bpu_ligne_id = bl.id
LEFT JOIN affaires a ON mj.affaire_id = a.id
LEFT JOIN sites s ON mj.site_id = s.id
WHERE mj.affaire_id IS NOT NULL
ORDER BY mj.date_jour DESC, mj.tranche;

COMMENT ON VIEW V_Affaire_BPU_Livraisons IS 'Journal des réalisations BPU avec montants et détails';

-- ============================================================================
-- VUE : V_BPU_Lignes_Disponibles (lignes BPU vendues non soldées)
-- ============================================================================

CREATE OR REPLACE VIEW V_BPU_Lignes_Disponibles AS
SELECT 
    bl.id,
    bl.affaire_id,
    bl.code_bpu,
    bl.libelle,
    bl.systeme_elementaire,
    bl.quantite,
    bl.unite,
    bl.pu,
    bl.pu_horaire,
    bl.heures_equiv_unitaire,
    bl.delivered_qty,
    bl.delivered_hours,
    bl.montant_reconnu,
    
    -- Calculer la disponibilité
    CASE 
        WHEN bl.quantite IS NOT NULL THEN
            bl.quantite - bl.delivered_qty
        ELSE NULL
    END as quantite_disponible,
    
    -- Vérifier si la ligne est complètement vendue
    (bl.quantite IS NULL OR bl.delivered_qty < bl.quantite) as est_disponible,
    
    -- Informations affaire
    a.code_affaire,
    a.code_affaire as nom_affaire,
    a.statut as statut_affaire
    
FROM affaire_bpu_lignes bl
JOIN affaires a ON bl.affaire_id = a.id
WHERE bl.statut_ligne = 'vendue'
    AND a.statut IN ('Validée', 'En cours')
    AND (bl.quantite IS NULL OR bl.delivered_qty < bl.quantite);

COMMENT ON VIEW V_BPU_Lignes_Disponibles IS 'Lignes BPU vendues non soldées disponibles pour réalisation';

-- ============================================================================
-- VUE : V_BPU_Parapluies_Actifs (tâches parapluie BPU actives)
-- ============================================================================

CREATE OR REPLACE VIEW V_BPU_Parapluies_Actifs AS
SELECT 
    pt.id as tache_id,
    pt.affaire_id,
    pt.libelle_tache,
    pt.date_debut_plan,
    pt.date_fin_plan,
    pt.avancement_pct,
    pt.statut,
    
    -- Informations affaire
    a.code_affaire,
    a.code_affaire as nom_affaire,
    a.site_id,
    s.nom as nom_site,
    
    -- Suivi BPU
    vs.heures_capacite,
    vs.heures_vendues,
    vs.heures_consommes,
    vs.montant_reconnu,
    vs.ecart_heures,
    vs.taux_remplissage_pct,
    vs.taux_realisation_pct
    
FROM planning_taches pt
JOIN affaires a ON pt.affaire_id = a.id
LEFT JOIN sites s ON a.site_id = s.id
LEFT JOIN V_Affaire_BPU_Suivi vs ON a.id = vs.affaire_id
WHERE pt.is_parapluie_bpu = true
    AND a.statut IN ('Validée', 'En cours')
ORDER BY a.code_affaire;

COMMENT ON VIEW V_BPU_Parapluies_Actifs IS 'Tâches parapluie BPU actives avec suivi';

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================

ALTER TABLE affaire_bpu_lignes ENABLE ROW LEVEL SECURITY;
ALTER TABLE affaire_bpu_calendrier ENABLE ROW LEVEL SECURITY;

-- Policies pour affaire_bpu_lignes
CREATE POLICY "Lecture publique des lignes BPU"
    ON affaire_bpu_lignes FOR SELECT
    USING (true);

CREATE POLICY "Insertion lignes BPU admin"
    ON affaire_bpu_lignes FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Modification lignes BPU admin"
    ON affaire_bpu_lignes FOR UPDATE
    USING (true);

-- Policies pour affaire_bpu_calendrier
CREATE POLICY "Lecture publique du calendrier BPU"
    ON affaire_bpu_calendrier FOR SELECT
    USING (true);

CREATE POLICY "Insertion calendrier BPU admin"
    ON affaire_bpu_calendrier FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Modification calendrier BPU admin"
    ON affaire_bpu_calendrier FOR UPDATE
    USING (true);

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================

