-- Migration 065: Suppression des statuts "Validée" et "En suivi"
-- Date: 2025-01-27
-- Description: Supprime les statuts "Validée" et "En suivi", met automatiquement à "Planifiée" les affaires avec tâches planifiées

-- 1. Supprimer les anciennes contraintes CHECK
ALTER TABLE affaires DROP CONSTRAINT IF EXISTS affaires_statut_check;

-- 2. Migrer les statuts existants
-- "En suivi" → "Planifiée"
UPDATE affaires 
SET statut = 'Planifiée' 
WHERE statut = 'En suivi';

-- "Validée" → "Planifiée" si l'affaire a des tâches planifiées
UPDATE affaires a
SET statut = 'Planifiée'
WHERE a.statut = 'Validée'
AND EXISTS (
  SELECT 1 FROM planning_taches pt 
  WHERE pt.affaire_id = a.id 
  AND pt.date_debut_plan IS NOT NULL
);

-- "Validée" → "A_planifier" si l'affaire n'a pas encore de tâches planifiées
UPDATE affaires a
SET statut = 'A_planifier'
WHERE a.statut = 'Validée'
AND NOT EXISTS (
  SELECT 1 FROM planning_taches pt 
  WHERE pt.affaire_id = a.id 
  AND pt.date_debut_plan IS NOT NULL
);

-- 3. Recréer la contrainte CHECK sans "Validée" et "En suivi"
ALTER TABLE affaires ADD CONSTRAINT affaires_statut_check 
CHECK (statut IN ('Brouillon', 'A_planifier', 'Planifiée', 'Clôturée'));

-- 4. Créer une fonction pour mettre automatiquement à "Planifiée" quand une tâche est ajoutée
CREATE OR REPLACE FUNCTION fn_affaire_planifiee()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le statut de l'affaire à "Planifiée" si elle a des tâches avec dates planifiées
  UPDATE affaires
  SET statut = 'Planifiée'
  WHERE id = NEW.affaire_id
  AND statut IN ('Brouillon', 'A_planifier')
  AND EXISTS (
    SELECT 1 FROM planning_taches pt 
    WHERE pt.affaire_id = NEW.affaire_id 
    AND pt.date_debut_plan IS NOT NULL
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Créer le trigger sur planning_taches
DROP TRIGGER IF EXISTS trg_affaire_planifiee ON planning_taches;
CREATE TRIGGER trg_affaire_planifiee
AFTER INSERT OR UPDATE ON planning_taches
FOR EACH ROW
WHEN (NEW.date_debut_plan IS NOT NULL)
EXECUTE FUNCTION fn_affaire_planifiee();

-- 6. Mettre à jour la vue v_affaires_taches_jour
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
WHERE a.statut IN ('Planifiée', 'Clôturée');

-- 7. Mettre à jour la vue V_Dashboard_Affaires
CREATE OR REPLACE VIEW V_Dashboard_Affaires AS
SELECT 
    COUNT(*) FILTER (WHERE statut IN ('A_planifier', 'Planifiée')) as nb_affaires_actives,
    COUNT(*) FILTER (WHERE statut = 'Clôturée') as nb_affaires_cloturees,
    SUM(montant_total_ht) FILTER (WHERE statut IN ('A_planifier', 'Planifiée')) as budget_total,
    AVG(avancement_pct) FILTER (WHERE statut IN ('A_planifier', 'Planifiée')) as avancement_moyen,
    SUM(montant_consomme) FILTER (WHERE statut IN ('A_planifier', 'Planifiée')) as montant_consomme_total,
    SUM(atterrissage) FILTER (WHERE statut IN ('A_planifier', 'Planifiée')) as atterrissage_total,
    COUNT(*) as nb_total_affaires
FROM affaires;

COMMENT ON VIEW V_Dashboard_Affaires IS 'Vue agrégée Affaires pour le dashboard';

-- 8. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Migration terminée avec succès !';
  RAISE NOTICE 'Statuts disponibles : Brouillon, A_planifier, Planifiée, Clôturée';
  RAISE NOTICE 'Les statuts "Validée" et "En suivi" ont été supprimés';
  RAISE NOTICE 'Un trigger automatique met maintenant à "Planifiée" les affaires avec tâches planifiées';
END $$;
