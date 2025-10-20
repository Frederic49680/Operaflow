# 🚀 Guide de déploiement sur Netlify

## 📋 Prérequis

1. ✅ Compte Netlify créé (https://netlify.com)
2. ✅ Projet poussé sur GitHub/GitLab/Bitbucket
3. ✅ Variables d'environnement Supabase

---

## 🔧 Configuration

### 1. Variables d'environnement

Dans le **Dashboard Netlify** :
1. Allez dans **Site settings** > **Environment variables**
2. Ajoutez ces variables :

```
NEXT_PUBLIC_SUPABASE_URL = https://rrmvejpwbkwlmyjhnxaz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow
```

### 2. Paramètres de build

Dans **Site settings** > **Build & deploy** :
- **Build command** : `npm run build`
- **Publish directory** : `.next`
- **Base directory** : (laisser vide)

---

## 🚀 Déploiement

### Option A : Via le Dashboard (Recommandé)

1. Allez sur https://app.netlify.com
2. Cliquez sur **"Add new site"** > **"Import an existing project"**
3. Connectez votre repo GitHub/GitLab/Bitbucket
4. Sélectionnez le repo
5. Configurez :
   - **Branch to deploy** : `main` (ou `master`)
   - **Build command** : `npm run build`
   - **Publish directory** : `.next`
6. Cliquez sur **"Deploy site"**

### Option B : Via CLI

```bash
# Installation du CLI Netlify
npm install -g netlify-cli

# Connexion
netlify login

# Déploiement initial
netlify deploy --prod

# Pour les déploiements suivants
git push origin main
# Netlify déploiera automatiquement !
```

---

## ✅ Vérification

Après le déploiement :

1. **Testez l'application** sur l'URL fournie par Netlify
2. **Vérifiez les logs** : Site settings > Deploys > (votre déploiement) > Deploy log
3. **Testez les fonctionnalités** :
   - Création d'affaire
   - Liste des sites
   - Connexion à la base de données

---

## 🔧 Dépannage

### Erreur "Build failed"

**Cause** : Variables d'environnement manquantes
**Solution** : Vérifiez que toutes les variables NEXT_PUBLIC_* sont définies

### Erreur "Module not found"

**Cause** : Dépendances manquantes
**Solution** : Vérifiez que `node_modules` est dans `.gitignore` et que `package.json` est à jour

### Erreur "Supabase connection failed"

**Cause** : Variables d'environnement incorrectes
**Solution** : Vérifiez les valeurs dans Environment variables

---

## 📝 Commandes utiles

```bash
# Voir les logs en temps réel
netlify logs

# Ouvrir le site localement
netlify dev

# Voir les fonctions déployées
netlify functions:list
```

---

## 🎯 Prochaines étapes

1. ✅ Déployer sur Netlify
2. ✅ Tester toutes les fonctionnalités
3. ✅ Configurer un nom de domaine personnalisé (optionnel)
4. ✅ Activer les notifications par email

---

**URL de votre site** : https://votre-site.netlify.app

Bon déploiement ! 🚀

