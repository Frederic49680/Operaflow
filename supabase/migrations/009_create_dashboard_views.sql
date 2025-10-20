-- Migration: Vues Dashboard Global
-- Description: Vues agrégées pour le dashboard
-- Date: 2025-01-18
-- PRD #11

-- Vue: V_Dashboard_RH
CREATE OR REPLACE VIEW V_Dashboard_RH AS
SELECT 
    COUNT(*) FILTER (WHERE actif = true) as nb_ressources_actives,
    COUNT(*) FILTER (WHERE actif = false) as nb_ressources_inactives,
    COUNT(*) FILTER (WHERE type_contrat = 'CDI') as nb_cdi,
    COUNT(*) FILTER (WHERE type_contrat = 'CDD') as nb_cdd,
    COUNT(*) FILTER (WHERE type_contrat = 'Intérim') as nb_interim,
    COUNT(*) FILTER (WHERE type_contrat = 'Apprenti') as nb_apprenti,
    COUNT(*) as nb_total_ressources
FROM ressources;

COMMENT ON VIEW V_Dashboard_RH IS 'Vue agrégée RH pour le dashboard';

-- Vue: V_Dashboard_Affaires
CREATE OR REPLACE VIEW V_Dashboard_Affaires AS
SELECT 
    COUNT(*) FILTER (WHERE statut IN ('Soumise', 'Validée')) as nb_affaires_actives,
    COUNT(*) FILTER (WHERE statut = 'Clôturée') as nb_affaires_cloturees,
    SUM(montant_total_ht) FILTER (WHERE statut IN ('Soumise', 'Validée')) as budget_total,
    AVG(avancement_pct) FILTER (WHERE statut IN ('Soumise', 'Validée')) as avancement_moyen,
    SUM(montant_consomme) FILTER (WHERE statut IN ('Soumise', 'Validée')) as montant_consomme_total,
    SUM(atterrissage) FILTER (WHERE statut IN ('Soumise', 'Validée')) as atterrissage_total,
    COUNT(*) as nb_total_affaires
FROM affaires;

COMMENT ON VIEW V_Dashboard_Affaires IS 'Vue agrégée Affaires pour le dashboard';

-- Vue: V_Dashboard_Planif
CREATE OR REPLACE VIEW V_Dashboard_Planif AS
SELECT 
    COUNT(*) FILTER (WHERE statut = 'En cours') as nb_taches_en_cours,
    COUNT(*) FILTER (WHERE statut = 'Terminé') as nb_taches_terminees,
    COUNT(*) FILTER (WHERE statut = 'Bloqué') as nb_taches_bloquees,
    AVG(avancement_pct) as avancement_moyen,
    SUM(effort_plan_h) as effort_total_planifie,
    SUM(effort_reel_h) as effort_total_reel,
    COUNT(*) as nb_total_taches
FROM planning_taches;

COMMENT ON VIEW V_Dashboard_Planif IS 'Vue agrégée Planification pour le dashboard';

-- Vue: V_Dashboard_Maintenance
CREATE OR REPLACE VIEW V_Dashboard_Maintenance AS
SELECT 
    COUNT(*) FILTER (WHERE etat_reel = 'Terminée') as nb_interventions_terminees,
    COUNT(*) FILTER (WHERE etat_reel = 'Reportée') as nb_interventions_reportees,
    SUM(heures_metal) as heures_metal_totales,
    COUNT(*) FILTER (WHERE etat_confirme = false) as nb_a_confirmer,
    COUNT(*) as nb_total_interventions
FROM maintenance_journal;

COMMENT ON VIEW V_Dashboard_Maintenance IS 'Vue agrégée Maintenance pour le dashboard';

-- Vue: V_Dashboard_Claims
CREATE OR REPLACE VIEW V_Dashboard_Claims AS
SELECT 
    COUNT(*) FILTER (WHERE statut = 'Ouvert') as nb_claims_ouverts,
    COUNT(*) FILTER (WHERE statut = 'En analyse') as nb_claims_en_analyse,
    COUNT(*) FILTER (WHERE statut = 'Clos') as nb_claims_clos,
    SUM(montant_estime) FILTER (WHERE statut IN ('Ouvert', 'En analyse', 'Validé')) as montant_estime_total,
    SUM(montant_final) FILTER (WHERE statut = 'Clos') as montant_final_total,
    COUNT(*) as nb_total_claims
FROM claims;

COMMENT ON VIEW V_Dashboard_Claims IS 'Vue agrégée Claims pour le dashboard';

-- Vue: V_Dashboard_Site
CREATE OR REPLACE VIEW V_Dashboard_Site AS
SELECT 
    COUNT(*) FILTER (WHERE statut_reel = 'Terminée') as nb_taches_terminees,
    COUNT(*) FILTER (WHERE statut_reel = 'Bloquée') as nb_taches_bloquees,
    SUM(heures_metal) as heures_metal_totales,
    COUNT(*) FILTER (WHERE etat_confirme = false) as nb_a_confirmer,
    COUNT(*) as nb_total_remontees
FROM remontee_site;

COMMENT ON VIEW V_Dashboard_Site IS 'Vue agrégée Remontées Site pour le dashboard';

-- Vue: V_Dashboard_Client
CREATE OR REPLACE VIEW V_Dashboard_Client AS
SELECT 
    COUNT(DISTINCT c.id) as nb_clients_actifs,
    COUNT(DISTINCT i.id) FILTER (WHERE i.actif = true) as nb_contacts_actifs,
    COUNT(DISTINCT i.id) FILTER (WHERE i.type_interlocuteur = 'Technique') as nb_contacts_techniques,
    COUNT(DISTINCT ai.affaire_id) as nb_affaires_avec_contacts,
    COUNT(DISTINCT c.id) as nb_total_clients
FROM clients c
LEFT JOIN interlocuteurs i ON c.id = i.client_id
LEFT JOIN affaires_interlocuteurs ai ON i.id = ai.interlocuteur_id;

COMMENT ON VIEW V_Dashboard_Client IS 'Vue agrégée Clients/Interlocuteurs pour le dashboard';

-- Vue: V_Dashboard_Absences
CREATE OR REPLACE VIEW V_Dashboard_Absences AS
SELECT 
    COUNT(*) FILTER (WHERE statut = 'en cours') as nb_absences_en_cours,
    COUNT(*) FILTER (WHERE statut = 'à venir') as nb_absences_a_venir,
    COUNT(*) FILTER (WHERE type = 'CP') as nb_cp,
    COUNT(*) FILTER (WHERE type = 'Maladie') as nb_maladie,
    COUNT(*) FILTER (WHERE type = 'Formation') as nb_formation,
    COUNT(*) as nb_total_absences
FROM absences;

COMMENT ON VIEW V_Dashboard_Absences IS 'Vue agrégée Absences pour le dashboard';

-- Vue: V_Dashboard_Alertes
CREATE OR REPLACE VIEW V_Dashboard_Alertes AS
SELECT 
    COUNT(*) FILTER (WHERE statut = 'envoyé') as nb_alertes_envoyees,
    COUNT(*) FILTER (WHERE statut = 'lu') as nb_alertes_lues,
    COUNT(*) FILTER (WHERE cible = 'RH') as nb_alertes_rh,
    COUNT(*) FILTER (WHERE cible = 'Responsable') as nb_alertes_responsable,
    COUNT(*) as nb_total_alertes
FROM alerts;

COMMENT ON VIEW V_Dashboard_Alertes IS 'Vue agrégée Alertes pour le dashboard';

