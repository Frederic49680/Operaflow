# 🚀 Guide de déploiement sur Vercel

## 📋 Prérequis

- ✅ Compte Vercel (gratuit) : https://vercel.com
- ✅ Compte Supabase (gratuit) : https://supabase.com
- ✅ Application Next.js fonctionnelle localement
- ✅ Git repository (GitHub, GitLab, ou Bitbucket)

---

## 🔧 Étape 1 : Préparer Supabase

### 1.1 Créer un projet Supabase (si ce n'est pas déjà fait)

1. Allez sur https://supabase.com
2. Cliquez sur **"New Project"**
3. Remplissez les informations :
   - **Name** : Nom de votre projet
   - **Database Password** : Mot de passe fort
   - **Region** : Choisissez la région la plus proche (ex: Europe West - Ireland)
4. Cliquez sur **"Create new project"**

### 1.2 Appliquer les migrations SQL

1. Dans Supabase, allez dans **SQL Editor**
2. Exécutez **TOUTES** les migrations dans l'ordre :
   - `001_create_sites.sql`
   - `002_create_ressources.sql`
   - `003_create_clients.sql`
   - `004_create_affaires.sql`
   - ... (toutes les migrations dans `supabase/migrations/`)
3. Vérifiez que toutes les migrations sont appliquées sans erreur

### 1.3 Récupérer les clés API

1. Dans Supabase, allez dans **Settings** → **API**
2. Copiez les valeurs suivantes :
   - **Project URL** (ex: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (longue chaîne de caractères)

---

## 🌐 Étape 2 : Déployer sur Vercel

### 2.1 Connexion à Vercel

1. Allez sur https://vercel.com
2. Cliquez sur **"Sign Up"** ou **"Login"**
3. Connectez-vous avec GitHub, GitLab ou Bitbucket

### 2.2 Importer votre projet

1. Cliquez sur **"Add New..."** → **"Project"**
2. Sélectionnez votre repository Git
3. Vercel détecte automatiquement Next.js

### 2.3 Configuration du projet

#### Settings de base :
- **Framework Preset** : Next.js (détecté automatiquement)
- **Root Directory** : `./` (racine du projet)
- **Build Command** : `npm run build`
- **Output Directory** : `.next` (par défaut)
- **Install Command** : `npm install --legacy-peer-deps`

#### Variables d'environnement :

Cliquez sur **"Environment Variables"** et ajoutez :

| Variable | Valeur | Description |
|----------|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxxxxxxxxxx.supabase.co` | URL de votre projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | Clé publique anonyme Supabase |

**Important :** Les variables commençant par `NEXT_PUBLIC_` sont accessibles côté client.

### 2.4 Déploiement

1. Cliquez sur **"Deploy"**
2. Attendez 2-3 minutes pendant que Vercel :
   - Installe les dépendances
   - Compile l'application
   - Déploie sur le CDN global
3. Une fois terminé, vous verrez :
   - ✅ **Deployment successful**
   - Une URL : `https://your-project.vercel.app`

---

## 🔄 Étape 3 : Configuration des migrations automatiques

### 3.1 Créer un webhook Supabase (optionnel)

Pour appliquer automatiquement les migrations lors des déploiements :

1. Dans Supabase, allez dans **Settings** → **Database** → **Webhooks**
2. Créez un nouveau webhook :
   - **Name** : Vercel Deploy
   - **URL** : `https://api.vercel.com/v1/integrations/webhooks/...`
   - **Events** : `database.migrations`

### 3.2 Alternative : Migrations manuelles

Si vous préférez appliquer les migrations manuellement :

1. Après chaque déploiement, allez dans Supabase **SQL Editor**
2. Copiez-collez les nouvelles migrations
3. Exécutez-les

---

## 🎯 Étape 4 : Configuration des domaines personnalisés (optionnel)

### 4.1 Ajouter un domaine personnalisé

1. Dans Vercel, allez dans **Settings** → **Domains**
2. Cliquez sur **"Add Domain"**
3. Entrez votre domaine (ex: `app.votredomaine.com`)
4. Suivez les instructions pour configurer les DNS

### 4.2 Configuration DNS

Ajoutez ces enregistrements DNS chez votre registrar :

| Type | Name | Value |
|------|------|-------|
| A | @ | 76.76.19.61 |
| CNAME | www | cname.vercel-dns.com |

---

## 🔐 Étape 5 : Sécurité et RLS

### 5.1 Activer Row Level Security (RLS) dans Supabase

1. Dans Supabase, allez dans **Authentication** → **Policies**
2. Pour chaque table, activez RLS :
   ```sql
   ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
   ALTER TABLE ressources ENABLE ROW LEVEL SECURITY;
   ALTER TABLE affaires ENABLE ROW LEVEL SECURITY;
   -- etc. pour toutes les tables
   ```

### 5.2 Créer des politiques RLS

Exemple pour la table `affaires` :

```sql
-- Permettre la lecture à tous les utilisateurs authentifiés
CREATE POLICY "Users can view all affaires"
  ON affaires FOR SELECT
  USING (auth.role() = 'authenticated');

-- Permettre l'insertion aux utilisateurs authentifiés
CREATE POLICY "Users can insert affaires"
  ON affaires FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Permettre la mise à jour aux utilisateurs authentifiés
CREATE POLICY "Users can update affaires"
  ON affaires FOR UPDATE
  USING (auth.role() = 'authenticated');
```

---

## 📊 Étape 6 : Monitoring et logs

### 6.1 Voir les logs de déploiement

1. Dans Vercel, allez dans **Deployments**
2. Cliquez sur un déploiement
3. Onglet **"Logs"** pour voir les erreurs de build

### 6.2 Monitoring en production

1. Dans Vercel, allez dans **Analytics**
2. Vous verrez :
   - Nombre de requêtes
   - Temps de réponse
   - Taux d'erreur
   - Utilisateurs uniques

### 6.3 Logs Supabase

1. Dans Supabase, allez dans **Logs**
2. Vous verrez :
   - Requêtes SQL
   - Erreurs de base de données
   - Authentification

---

## 🐛 Dépannage

### Problème : Build échoue

**Solution :**
1. Vérifiez les logs de build dans Vercel
2. Testez localement : `npm run build`
3. Vérifiez que toutes les dépendances sont dans `package.json`

### Problème : Erreur "Module not found"

**Solution :**
```bash
# Localement, supprimez node_modules et réinstallez
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Problème : Variables d'environnement non définies

**Solution :**
1. Vérifiez que les variables commencent par `NEXT_PUBLIC_` pour le client
2. Redéployez après avoir ajouté les variables
3. Vérifiez dans **Settings** → **Environment Variables**

### Problème : Base de données vide

**Solution :**
1. Vérifiez que toutes les migrations SQL sont appliquées
2. Exécutez les scripts de seed si nécessaire
3. Vérifiez les politiques RLS

---

## 🔄 Déploiements continus

### Workflow automatique

Une fois configuré, chaque push sur votre branche `main` déclenchera automatiquement un déploiement :

```
Push sur GitHub
      ↓
Vercel détecte le changement
      ↓
Build automatique
      ↓
Déploiement sur production
      ↓
URL mise à jour
```

### Branches de prévisualisation

Vercel crée automatiquement une URL de prévisualisation pour chaque Pull Request :

- **Production** : `https://your-project.vercel.app`
- **Preview** : `https://your-project-git-branch.vercel.app`

---

## 📝 Checklist de déploiement

### Avant le déploiement
- [ ] Toutes les migrations SQL sont appliquées dans Supabase
- [ ] Les variables d'environnement sont configurées dans Vercel
- [ ] Le build local fonctionne : `npm run build`
- [ ] Les tests locaux passent

### Après le déploiement
- [ ] L'application est accessible sur l'URL Vercel
- [ ] La connexion à Supabase fonctionne
- [ ] Les données s'affichent correctement
- [ ] Les formulaires fonctionnent
- [ ] Les API routes répondent

---

## 🎉 Félicitations !

Votre application est maintenant déployée sur Vercel ! 🚀

### URLs importantes

- **Application** : `https://your-project.vercel.app`
- **Dashboard Vercel** : https://vercel.com/dashboard
- **Dashboard Supabase** : https://supabase.com/dashboard

### Prochaines étapes

1. Configurez un domaine personnalisé
2. Activez les analytics
3. Configurez les alertes de monitoring
4. Optimisez les performances avec Vercel Analytics

---

## 📞 Support

- **Documentation Vercel** : https://vercel.com/docs
- **Documentation Supabase** : https://supabase.com/docs
- **Documentation Next.js** : https://nextjs.org/docs

