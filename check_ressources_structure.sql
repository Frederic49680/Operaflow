-- Vérifier la structure de la table ressources
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'ressources' 
AND table_schema = 'public'
ORDER BY ordinal_position;
