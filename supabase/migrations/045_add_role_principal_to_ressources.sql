-- Ajouter le champ role_principal à la table ressources
ALTER TABLE public.ressources 
ADD COLUMN IF NOT EXISTS role_principal text;

-- Ajouter une contrainte de clé étrangère vers la table roles
ALTER TABLE public.ressources 
ADD CONSTRAINT fk_ressources_role_principal 
FOREIGN KEY (role_principal) REFERENCES public.roles(code) 
ON DELETE SET NULL;
