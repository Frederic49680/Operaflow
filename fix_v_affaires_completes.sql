-- Script de correction de la vue v_affaires_completes
-- À exécuter dans le SQL Editor de Supabase

-- Supprimer la vue existante
DROP VIEW IF EXISTS v_affaires_completes CASCADE;

-- Recréer la vue avec toutes les colonnes nécessaires
CREATE VIEW v_affaires_completes AS
SELECT 
    a.id,
    a.code_affaire,
    a.nom,
    a.site_id,
    s.nom as site_nom,
    s.code_site as site_code,
    a.responsable_id,
    r.nom as responsable_nom,
    r.prenom as responsable_prenom,
    a.client_id,
    c.nom_client,
    a.num_commande,
    a.competence_principale,
    a.type_contrat,
    a.type_affaire,
    a.montant_total_ht,
    a.statut,
    a.date_debut,
    a.date_fin_prevue,
    a.date_fin_reelle,
    a.avancement_pct,
    a.montant_consomme,
    a.reste_a_faire,
    a.atterrissage,
    a.marge_prevue,
    a.marge_reelle,
    a.date_creation,
    a.updated_at
FROM affaires a
LEFT JOIN sites s ON a.site_id = s.id
LEFT JOIN ressources r ON a.responsable_id = r.id
LEFT JOIN clients c ON a.client_id = c.id;

-- Commentaire
COMMENT ON VIEW v_affaires_completes IS 'Vue complète des affaires avec jointures (sites, ressources, clients)';

