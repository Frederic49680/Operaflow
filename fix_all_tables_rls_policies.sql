-- ============================================
-- FIX COMPLET : Politiques RLS pour TOUTES les tables
-- ============================================
-- Date : 2025-01-20
-- Description : Active RLS et crée les politiques pour toutes les tables
-- Permet l'accès en lecture/écriture pour anon + authenticated
-- ============================================

-- ============================================
-- 1. TABLES RH
-- ============================================

-- Table: sites
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture sites" ON sites;
DROP POLICY IF EXISTS "Insertion sites" ON sites;
DROP POLICY IF EXISTS "Modification sites" ON sites;
DROP POLICY IF EXISTS "Suppression sites" ON sites;
CREATE POLICY "Lecture sites" ON sites FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertion sites" ON sites FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Modification sites" ON sites FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Suppression sites" ON sites FOR DELETE TO anon, authenticated USING (true);

-- Table: ressources
ALTER TABLE ressources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture ressources" ON ressources;
DROP POLICY IF EXISTS "Insertion ressources" ON ressources;
DROP POLICY IF EXISTS "Modification ressources" ON ressources;
DROP POLICY IF EXISTS "Suppression ressources" ON ressources;
CREATE POLICY "Lecture ressources" ON ressources FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertion ressources" ON ressources FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Modification ressources" ON ressources FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Suppression ressources" ON ressources FOR DELETE TO anon, authenticated USING (true);

-- Table: suivi_rh
ALTER TABLE suivi_rh ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture suivi_rh" ON suivi_rh;
DROP POLICY IF EXISTS "Insertion suivi_rh" ON suivi_rh;
DROP POLICY IF EXISTS "Modification suivi_rh" ON suivi_rh;
DROP POLICY IF EXISTS "Suppression suivi_rh" ON suivi_rh;
CREATE POLICY "Lecture suivi_rh" ON suivi_rh FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertion suivi_rh" ON suivi_rh FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Modification suivi_rh" ON suivi_rh FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Suppression suivi_rh" ON suivi_rh FOR DELETE TO anon, authenticated USING (true);

-- Table: historique_actions
ALTER TABLE historique_actions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture historique_actions" ON historique_actions;
DROP POLICY IF EXISTS "Insertion historique_actions" ON historique_actions;
DROP POLICY IF EXISTS "Modification historique_actions" ON historique_actions;
DROP POLICY IF EXISTS "Suppression historique_actions" ON historique_actions;
CREATE POLICY "Lecture historique_actions" ON historique_actions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertion historique_actions" ON historique_actions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Modification historique_actions" ON historique_actions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Suppression historique_actions" ON historique_actions FOR DELETE TO anon, authenticated USING (true);

-- Table: absences
ALTER TABLE absences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture absences" ON absences;
DROP POLICY IF EXISTS "Insertion absences" ON absences;
DROP POLICY IF EXISTS "Modification absences" ON absences;
DROP POLICY IF EXISTS "Suppression absences" ON absences;
CREATE POLICY "Lecture absences" ON absences FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertion absences" ON absences FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Modification absences" ON absences FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Suppression absences" ON absences FOR DELETE TO anon, authenticated USING (true);

-- Table: alerts
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture alerts" ON alerts;
DROP POLICY IF EXISTS "Insertion alerts" ON alerts;
DROP POLICY IF EXISTS "Modification alerts" ON alerts;
DROP POLICY IF EXISTS "Suppression alerts" ON alerts;
CREATE POLICY "Lecture alerts" ON alerts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertion alerts" ON alerts FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Modification alerts" ON alerts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Suppression alerts" ON alerts FOR DELETE TO anon, authenticated USING (true);

-- ============================================
-- 2. TABLES AFFAIRES
-- ============================================

-- Table: clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture clients" ON clients;
DROP POLICY IF EXISTS "Insertion clients" ON clients;
DROP POLICY IF EXISTS "Modification clients" ON clients;
DROP POLICY IF EXISTS "Suppression clients" ON clients;
CREATE POLICY "Lecture clients" ON clients FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertion clients" ON clients FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Modification clients" ON clients FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Suppression clients" ON clients FOR DELETE TO anon, authenticated USING (true);

-- Table: affaires
ALTER TABLE affaires ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture affaires" ON affaires;
DROP POLICY IF EXISTS "Insertion affaires" ON affaires;
DROP POLICY IF EXISTS "Modification affaires" ON affaires;
DROP POLICY IF EXISTS "Suppression affaires" ON affaires;
CREATE POLICY "Lecture affaires" ON affaires FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertion affaires" ON affaires FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Modification affaires" ON affaires FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Suppression affaires" ON affaires FOR DELETE TO anon, authenticated USING (true);

-- Table: affaires_lots
ALTER TABLE affaires_lots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture affaires_lots" ON affaires_lots;
DROP POLICY IF EXISTS "Insertion affaires_lots" ON affaires_lots;
DROP POLICY IF EXISTS "Modification affaires_lots" ON affaires_lots;
DROP POLICY IF EXISTS "Suppression affaires_lots" ON affaires_lots;
CREATE POLICY "Lecture affaires_lots" ON affaires_lots FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertion affaires_lots" ON affaires_lots FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Modification affaires_lots" ON affaires_lots FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Suppression affaires_lots" ON affaires_lots FOR DELETE TO anon, authenticated USING (true);

-- ============================================
-- 3. TABLES GANTT
-- ============================================

-- Table: planning_taches
ALTER TABLE planning_taches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture planning_taches" ON planning_taches;
DROP POLICY IF EXISTS "Insertion planning_taches" ON planning_taches;
DROP POLICY IF EXISTS "Modification planning_taches" ON planning_taches;
DROP POLICY IF EXISTS "Suppression planning_taches" ON planning_taches;
CREATE POLICY "Lecture planning_taches" ON planning_taches FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertion planning_taches" ON planning_taches FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Modification planning_taches" ON planning_taches FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Suppression planning_taches" ON planning_taches FOR DELETE TO anon, authenticated USING (true);

-- Table: tache_dependances
ALTER TABLE tache_dependances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture tache_dependances" ON tache_dependances;
DROP POLICY IF EXISTS "Insertion tache_dependances" ON tache_dependances;
DROP POLICY IF EXISTS "Modification tache_dependances" ON tache_dependances;
DROP POLICY IF EXISTS "Suppression tache_dependances" ON tache_dependances;
CREATE POLICY "Lecture tache_dependances" ON tache_dependances FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertion tache_dependances" ON tache_dependances FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Modification tache_dependances" ON tache_dependances FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Suppression tache_dependances" ON tache_dependances FOR DELETE TO anon, authenticated USING (true);

-- ============================================
-- 4. TABLES TERRAIN
-- ============================================

-- Table: remontee_site
ALTER TABLE remontee_site ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture remontee_site" ON remontee_site;
DROP POLICY IF EXISTS "Insertion remontee_site" ON remontee_site;
DROP POLICY IF EXISTS "Modification remontee_site" ON remontee_site;
DROP POLICY IF EXISTS "Suppression remontee_site" ON remontee_site;
CREATE POLICY "Lecture remontee_site" ON remontee_site FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertion remontee_site" ON remontee_site FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Modification remontee_site" ON remontee_site FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Suppression remontee_site" ON remontee_site FOR DELETE TO anon, authenticated USING (true);

-- Table: remontee_site_reporting
ALTER TABLE remontee_site_reporting ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture remontee_site_reporting" ON remontee_site_reporting;
DROP POLICY IF EXISTS "Insertion remontee_site_reporting" ON remontee_site_reporting;
DROP POLICY IF EXISTS "Modification remontee_site_reporting" ON remontee_site_reporting;
DROP POLICY IF EXISTS "Suppression remontee_site_reporting" ON remontee_site_reporting;
CREATE POLICY "Lecture remontee_site_reporting" ON remontee_site_reporting FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertion remontee_site_reporting" ON remontee_site_reporting FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Modification remontee_site_reporting" ON remontee_site_reporting FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Suppression remontee_site_reporting" ON remontee_site_reporting FOR DELETE TO anon, authenticated USING (true);

-- Table: tache_suspensions
ALTER TABLE tache_suspensions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture tache_suspensions" ON tache_suspensions;
DROP POLICY IF EXISTS "Insertion tache_suspensions" ON tache_suspensions;
DROP POLICY IF EXISTS "Modification tache_suspensions" ON tache_suspensions;
DROP POLICY IF EXISTS "Suppression tache_suspensions" ON tache_suspensions;
CREATE POLICY "Lecture tache_suspensions" ON tache_suspensions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertion tache_suspensions" ON tache_suspensions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Modification tache_suspensions" ON tache_suspensions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Suppression tache_suspensions" ON tache_suspensions FOR DELETE TO anon, authenticated USING (true);

-- Table: site_blocages
ALTER TABLE site_blocages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture site_blocages" ON site_blocages;
DROP POLICY IF EXISTS "Insertion site_blocages" ON site_blocages;
DROP POLICY IF EXISTS "Modification site_blocages" ON site_blocages;
DROP POLICY IF EXISTS "Suppression site_blocages" ON site_blocages;
CREATE POLICY "Lecture site_blocages" ON site_blocages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertion site_blocages" ON site_blocages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Modification site_blocages" ON site_blocages FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Suppression site_blocages" ON site_blocages FOR DELETE TO anon, authenticated USING (true);

-- Table: confirmation_queue
ALTER TABLE confirmation_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture confirmation_queue" ON confirmation_queue;
DROP POLICY IF EXISTS "Insertion confirmation_queue" ON confirmation_queue;
DROP POLICY IF EXISTS "Modification confirmation_queue" ON confirmation_queue;
DROP POLICY IF EXISTS "Suppression confirmation_queue" ON confirmation_queue;
CREATE POLICY "Lecture confirmation_queue" ON confirmation_queue FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertion confirmation_queue" ON confirmation_queue FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Modification confirmation_queue" ON confirmation_queue FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Suppression confirmation_queue" ON confirmation_queue FOR DELETE TO anon, authenticated USING (true);

-- ============================================
-- 5. TABLES MAINTENANCE
-- ============================================

-- Table: maintenance_batteries
ALTER TABLE maintenance_batteries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture maintenance_batteries" ON maintenance_batteries;
DROP POLICY IF EXISTS "Insertion maintenance_batteries" ON maintenance_batteries;
DROP POLICY IF EXISTS "Modification maintenance_batteries" ON maintenance_batteries;
DROP POLICY IF EXISTS "Suppression maintenance_batteries" ON maintenance_batteries;
CREATE POLICY "Lecture maintenance_batteries" ON maintenance_batteries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertion maintenance_batteries" ON maintenance_batteries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Modification maintenance_batteries" ON maintenance_batteries FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Suppression maintenance_batteries" ON maintenance_batteries FOR DELETE TO anon, authenticated USING (true);

-- Table: maintenance_journal
ALTER TABLE maintenance_journal ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture maintenance_journal" ON maintenance_journal;
DROP POLICY IF EXISTS "Insertion maintenance_journal" ON maintenance_journal;
DROP POLICY IF EXISTS "Modification maintenance_journal" ON maintenance_journal;
DROP POLICY IF EXISTS "Suppression maintenance_journal" ON maintenance_journal;
CREATE POLICY "Lecture maintenance_journal" ON maintenance_journal FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertion maintenance_journal" ON maintenance_journal FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Modification maintenance_journal" ON maintenance_journal FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Suppression maintenance_journal" ON maintenance_journal FOR DELETE TO anon, authenticated USING (true);

-- Table: maintenance_monthly_digest
ALTER TABLE maintenance_monthly_digest ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture maintenance_monthly_digest" ON maintenance_monthly_digest;
DROP POLICY IF EXISTS "Insertion maintenance_monthly_digest" ON maintenance_monthly_digest;
DROP POLICY IF EXISTS "Modification maintenance_monthly_digest" ON maintenance_monthly_digest;
DROP POLICY IF EXISTS "Suppression maintenance_monthly_digest" ON maintenance_monthly_digest;
CREATE POLICY "Lecture maintenance_monthly_digest" ON maintenance_monthly_digest FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertion maintenance_monthly_digest" ON maintenance_monthly_digest FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Modification maintenance_monthly_digest" ON maintenance_monthly_digest FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Suppression maintenance_monthly_digest" ON maintenance_monthly_digest FOR DELETE TO anon, authenticated USING (true);

-- ============================================
-- 6. TABLES INTERLOCUTEURS
-- ============================================

-- Table: interlocuteurs
ALTER TABLE interlocuteurs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture interlocuteurs" ON interlocuteurs;
DROP POLICY IF EXISTS "Insertion interlocuteurs" ON interlocuteurs;
DROP POLICY IF EXISTS "Modification interlocuteurs" ON interlocuteurs;
DROP POLICY IF EXISTS "Suppression interlocuteurs" ON interlocuteurs;
CREATE POLICY "Lecture interlocuteurs" ON interlocuteurs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertion interlocuteurs" ON interlocuteurs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Modification interlocuteurs" ON interlocuteurs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Suppression interlocuteurs" ON interlocuteurs FOR DELETE TO anon, authenticated USING (true);

-- Table: affaires_interlocuteurs
ALTER TABLE affaires_interlocuteurs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture affaires_interlocuteurs" ON affaires_interlocuteurs;
DROP POLICY IF EXISTS "Insertion affaires_interlocuteurs" ON affaires_interlocuteurs;
DROP POLICY IF EXISTS "Modification affaires_interlocuteurs" ON affaires_interlocuteurs;
DROP POLICY IF EXISTS "Suppression affaires_interlocuteurs" ON affaires_interlocuteurs;
CREATE POLICY "Lecture affaires_interlocuteurs" ON affaires_interlocuteurs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertion affaires_interlocuteurs" ON affaires_interlocuteurs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Modification affaires_interlocuteurs" ON affaires_interlocuteurs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Suppression affaires_interlocuteurs" ON affaires_interlocuteurs FOR DELETE TO anon, authenticated USING (true);

-- Table: interactions_client
ALTER TABLE interactions_client ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture interactions_client" ON interactions_client;
DROP POLICY IF EXISTS "Insertion interactions_client" ON interactions_client;
DROP POLICY IF EXISTS "Modification interactions_client" ON interactions_client;
DROP POLICY IF EXISTS "Suppression interactions_client" ON interactions_client;
CREATE POLICY "Lecture interactions_client" ON interactions_client FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertion interactions_client" ON interactions_client FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Modification interactions_client" ON interactions_client FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Suppression interactions_client" ON interactions_client FOR DELETE TO anon, authenticated USING (true);

-- ============================================
-- 7. TABLES CLAIMS
-- ============================================

-- Table: claims
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture claims" ON claims;
DROP POLICY IF EXISTS "Insertion claims" ON claims;
DROP POLICY IF EXISTS "Modification claims" ON claims;
DROP POLICY IF EXISTS "Suppression claims" ON claims;
CREATE POLICY "Lecture claims" ON claims FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertion claims" ON claims FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Modification claims" ON claims FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Suppression claims" ON claims FOR DELETE TO anon, authenticated USING (true);

-- Table: claim_history
ALTER TABLE claim_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture claim_history" ON claim_history;
DROP POLICY IF EXISTS "Insertion claim_history" ON claim_history;
DROP POLICY IF EXISTS "Modification claim_history" ON claim_history;
DROP POLICY IF EXISTS "Suppression claim_history" ON claim_history;
CREATE POLICY "Lecture claim_history" ON claim_history FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertion claim_history" ON claim_history FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Modification claim_history" ON claim_history FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Suppression claim_history" ON claim_history FOR DELETE TO anon, authenticated USING (true);

-- Table: claim_comments
ALTER TABLE claim_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture claim_comments" ON claim_comments;
DROP POLICY IF EXISTS "Insertion claim_comments" ON claim_comments;
DROP POLICY IF EXISTS "Modification claim_comments" ON claim_comments;
DROP POLICY IF EXISTS "Suppression claim_comments" ON claim_comments;
CREATE POLICY "Lecture claim_comments" ON claim_comments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertion claim_comments" ON claim_comments FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Modification claim_comments" ON claim_comments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Suppression claim_comments" ON claim_comments FOR DELETE TO anon, authenticated USING (true);

-- ============================================
-- 8. TABLES FORM BUILDER
-- ============================================

-- Table: forms
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture forms" ON forms;
DROP POLICY IF EXISTS "Insertion forms" ON forms;
DROP POLICY IF EXISTS "Modification forms" ON forms;
DROP POLICY IF EXISTS "Suppression forms" ON forms;
CREATE POLICY "Lecture forms" ON forms FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertion forms" ON forms FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Modification forms" ON forms FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Suppression forms" ON forms FOR DELETE TO anon, authenticated USING (true);

-- Table: form_instances
ALTER TABLE form_instances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture form_instances" ON form_instances;
DROP POLICY IF EXISTS "Insertion form_instances" ON form_instances;
DROP POLICY IF EXISTS "Modification form_instances" ON form_instances;
DROP POLICY IF EXISTS "Suppression form_instances" ON form_instances;
CREATE POLICY "Lecture form_instances" ON form_instances FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertion form_instances" ON form_instances FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Modification form_instances" ON form_instances FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Suppression form_instances" ON form_instances FOR DELETE TO anon, authenticated USING (true);

-- Table: form_entries
ALTER TABLE form_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture form_entries" ON form_entries;
DROP POLICY IF EXISTS "Insertion form_entries" ON form_entries;
DROP POLICY IF EXISTS "Modification form_entries" ON form_entries;
DROP POLICY IF EXISTS "Suppression form_entries" ON form_entries;
CREATE POLICY "Lecture form_entries" ON form_entries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertion form_entries" ON form_entries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Modification form_entries" ON form_entries FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Suppression form_entries" ON form_entries FOR DELETE TO anon, authenticated USING (true);

-- Table: form_entry_history
ALTER TABLE form_entry_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture form_entry_history" ON form_entry_history;
DROP POLICY IF EXISTS "Insertion form_entry_history" ON form_entry_history;
DROP POLICY IF EXISTS "Modification form_entry_history" ON form_entry_history;
DROP POLICY IF EXISTS "Suppression form_entry_history" ON form_entry_history;
CREATE POLICY "Lecture form_entry_history" ON form_entry_history FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertion form_entry_history" ON form_entry_history FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Modification form_entry_history" ON form_entry_history FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Suppression form_entry_history" ON form_entry_history FOR DELETE TO anon, authenticated USING (true);

-- Table: form_notifications
ALTER TABLE form_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture form_notifications" ON form_notifications;
DROP POLICY IF EXISTS "Insertion form_notifications" ON form_notifications;
DROP POLICY IF EXISTS "Modification form_notifications" ON form_notifications;
DROP POLICY IF EXISTS "Suppression form_notifications" ON form_notifications;
CREATE POLICY "Lecture form_notifications" ON form_notifications FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertion form_notifications" ON form_notifications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Modification form_notifications" ON form_notifications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Suppression form_notifications" ON form_notifications FOR DELETE TO anon, authenticated USING (true);

-- ============================================
-- 9. TABLES BPU
-- ============================================

-- Table: affaire_bpu_lignes
ALTER TABLE affaire_bpu_lignes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture affaire_bpu_lignes" ON affaire_bpu_lignes;
DROP POLICY IF EXISTS "Insertion affaire_bpu_lignes" ON affaire_bpu_lignes;
DROP POLICY IF EXISTS "Modification affaire_bpu_lignes" ON affaire_bpu_lignes;
DROP POLICY IF EXISTS "Suppression affaire_bpu_lignes" ON affaire_bpu_lignes;
CREATE POLICY "Lecture affaire_bpu_lignes" ON affaire_bpu_lignes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertion affaire_bpu_lignes" ON affaire_bpu_lignes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Modification affaire_bpu_lignes" ON affaire_bpu_lignes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Suppression affaire_bpu_lignes" ON affaire_bpu_lignes FOR DELETE TO anon, authenticated USING (true);

-- Table: affaire_bpu_calendrier
ALTER TABLE affaire_bpu_calendrier ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture affaire_bpu_calendrier" ON affaire_bpu_calendrier;
DROP POLICY IF EXISTS "Insertion affaire_bpu_calendrier" ON affaire_bpu_calendrier;
DROP POLICY IF EXISTS "Modification affaire_bpu_calendrier" ON affaire_bpu_calendrier;
DROP POLICY IF EXISTS "Suppression affaire_bpu_calendrier" ON affaire_bpu_calendrier;
CREATE POLICY "Lecture affaire_bpu_calendrier" ON affaire_bpu_calendrier FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Insertion affaire_bpu_calendrier" ON affaire_bpu_calendrier FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Modification affaire_bpu_calendrier" ON affaire_bpu_calendrier FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Suppression affaire_bpu_calendrier" ON affaire_bpu_calendrier FOR DELETE TO anon, authenticated USING (true);

-- ============================================
-- FIN DU SCRIPT
-- ============================================
-- Ce script a appliqué les politiques RLS pour TOUTES les tables
-- Toutes les tables sont maintenant accessibles en lecture/écriture
-- pour les utilisateurs anon ET authenticated
-- ============================================

