# 🔧 FIX: Erreur lors de la création de collaborateur

Date: 2025-01-20
Problème: 401 Unauthorized + 42501 RLS Policy violation

---

## 🔍 PROBLÈMES DÉTECTÉS

### 1. **401 (Unauthorized)**
```
POST https://rrmvejpwbkwlmyjhnxaz.supabase.co/rest/v1/ressources 401
```

**Cause** : Problème d'authentification avec Supabase.

**Solutions possibles** :
- ✅ Vérifier que vous êtes connecté à Supabase
- ✅ Vérifier que la clé API est correcte dans `.env.local`
- ✅ Vérifier que RLS (Row Level Security) n'est pas trop restrictif

### 2. **42501 - Row-Level Security Policy**
```
new row violates row-level security policy for table "historique_actions"
```

**Cause** : Le trigger `log_ressource_changes()` essaie d'insérer dans `historique_actions` lors de la création d'une ressource, mais il n'y a **PAS de politique RLS** qui autorise l'INSERT.

**Ligne problématique dans la migration 002** :
```sql
-- ❌ PROBLÈME: Pas de politique d'INSERT pour historique_actions
CREATE POLICY "Lecture publique de l'historique"
    ON historique_actions FOR SELECT
    USING (true);
```

**Mais le trigger essaie d'insérer** :
```sql
-- Ligne 94-96 du trigger log_ressource_changes()
IF TG_OP = 'INSERT' THEN
    INSERT INTO historique_actions (element_type, element_id, action, valeur_apres, acteur_id)
    VALUES ('ressource', NEW.id, 'ajout', to_jsonb(NEW), NEW.created_by);
```

---

## 🔧 SOLUTIONS

### Solution 1 : Ajouter les politiques RLS manquantes

#### Étape 1 : Ouvrir Supabase Dashboard
1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet
3. Aller dans "SQL Editor"
4. Cliquer sur "New query"

#### Étape 2 : Exécuter le script de correction
Copier-coller le contenu de `fix_historique_actions.sql` et exécuter.

**OU** exécuter directement :

```sql
-- Ajouter la politique d'insertion pour historique_actions
CREATE POLICY "Insertion historique par trigger"
    ON historique_actions FOR INSERT
    WITH CHECK (true);

-- Ajouter aussi les politiques de modification et suppression
CREATE POLICY "Modification historique admin"
    ON historique_actions FOR UPDATE
    USING (true);

CREATE POLICY "Suppression historique admin"
    ON historique_actions FOR DELETE
    USING (true);
```

#### Étape 3 : Vérifier que les politiques sont créées

```sql
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE tablename = 'historique_actions';
```

**Résultat attendu** : 4 politiques (SELECT, INSERT, UPDATE, DELETE)

---

### Solution 2 : Vérifier l'authentification

#### Vérifier le fichier `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://rrmvejpwbkwlmyjhnxaz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Vérifier que vous utilisez la bonne clé

Dans `lib/supabase/client.ts` :

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

---

### Solution 3 : Désactiver temporairement RLS (POUR TEST UNIQUEMENT)

⚠️ **ATTENTION** : Cette solution est pour tester uniquement, ne pas utiliser en production !

```sql
-- Désactiver RLS sur historique_actions temporairement
ALTER TABLE historique_actions DISABLE ROW LEVEL SECURITY;
```

**Après les tests, réactiver RLS** :
```sql
ALTER TABLE historique_actions ENABLE ROW LEVEL SECURITY;
```

---

## 🧪 TEST APRÈS CORRECTION

### 1. Exécuter le script de correction
```sql
CREATE POLICY "Insertion historique par trigger"
    ON historique_actions FOR INSERT
    WITH CHECK (true);
```

### 2. Tester la création d'un collaborateur

Dans l'application :
1. Aller sur `/rh/collaborateurs`
2. Cliquer sur "Ajouter un collaborateur"
3. Remplir le formulaire :
   - Nom : BAUDRY
   - Prénom : Frédéric
   - Site : Sélectionner un site
   - Type contrat : CDI
   - Email pro : frederic.baudry@snef.fr
   - Téléphone : +33 6 12 34 56 78
4. Cliquer sur "Créer"

### 3. Vérifier le résultat

**Si succès** :
- ✅ Message "Collaborateur créé avec succès !"
- ✅ Le collaborateur apparaît dans la liste
- ✅ Console : Pas d'erreur 401 ou 42501

**Si erreur persiste** :
- ❌ Vérifier l'authentification (clé API)
- ❌ Vérifier que les politiques sont bien créées
- ❌ Vérifier les logs Supabase

---

## 📊 VÉRIFICATION DES POLITIQUES

Pour vérifier que toutes les politiques sont bien en place :

```sql
-- Voir toutes les politiques pour ressources
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'ressources';

-- Voir toutes les politiques pour historique_actions
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'historique_actions';

-- Voir toutes les politiques pour suivi_rh
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'suivi_rh';
```

---

## 🎯 RÉSUMÉ

### Problème principal
❌ Pas de politique d'INSERT pour `historique_actions`

### Solution
✅ Ajouter les politiques manquantes avec le script `fix_historique_actions.sql`

### Étape suivante
1. Exécuter le script SQL dans Supabase Dashboard
2. Tester la création d'un collaborateur
3. Vérifier que tout fonctionne

---

**Document généré le**: 2025-01-20
**Statut**: 🔧 Correction à appliquer

