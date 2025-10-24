-- Ajouter la colonne role_principal à la table ressources
ALTER TABLE public.ressources 
ADD COLUMN IF NOT EXISTS role_principal text;

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN public.ressources.role_principal IS 'Code du rôle principal du collaborateur (référence vers roles.code)';
