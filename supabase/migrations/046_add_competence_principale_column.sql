-- Ajouter la colonne competence_principale à la table ressources
ALTER TABLE public.ressources 
ADD COLUMN IF NOT EXISTS competence_principale TEXT;

-- Ajouter une contrainte de clé étrangère si la table competencies existe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'competencies') THEN
    -- Vérifier si la contrainte n'existe pas déjà
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'fk_competence_principale' 
      AND conrelid = 'public.ressources'::regclass
    ) THEN
      ALTER TABLE public.ressources
      ADD CONSTRAINT fk_competence_principale
      FOREIGN KEY (competence_principale) REFERENCES public.competencies(code)
      ON DELETE SET NULL;
    END IF;
  END IF;
END
$$;
