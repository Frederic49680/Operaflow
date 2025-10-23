-- Script pour vérifier les collaborateurs existants
SELECT 
  id,
  prenom,
  nom,
  email_pro,
  email_perso,
  type_contrat,
  actif,
  date_creation
FROM ressources 
ORDER BY date_creation DESC;
