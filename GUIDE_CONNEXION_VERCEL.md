# 🔗 Guide de Connexion Vercel

## ✅ État actuel

- ✅ Vercel CLI installé : v48.4.1
- ✅ Code poussé sur GitHub (3 commits)
- ✅ Configuration vercel.json présente
- ❌ Projet non encore lié à Vercel

---

## 🚀 Connexion à Vercel

### Option 1 : Via Dashboard Vercel (RECOMMANDÉ)

C'est la méthode la plus simple et rapide.

#### Étapes :

1. **Aller sur Vercel**
   ```
   https://vercel.com/new
   ```

2. **Importer depuis GitHub**
   - Cliquer sur "Import Git Repository"
   - Sélectionner "GitHub"
   - Autoriser Vercel si demandé
   - Chercher "Frederic49680/Operaflow"
   - Cliquer sur "Import"

3. **Configurer le projet**
   
   **Framework Preset** : Next.js (détecté automatiquement)
   
   **Root Directory** : `.` (racine)
   
   **Build Command** : `npm run build` (auto)
   
   **Install Command** : `npm install --legacy-peer-deps` ⚠️ **IMPORTANT**

4. **Variables d'environnement** ⚠️ **OBLIGATOIRE**
   
   Ajouter ces 2 variables :
   
   ```
   Nom: NEXT_PUBLIC_SUPABASE_URL
   Valeur: https://rrmvejpwbkwlmyjhnxaz.supabase.co
   
   Nom: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Valeur: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow
   ```

5. **Déployer**
   - Cliquer sur "Deploy"
   - Attendre 3-5 minutes
   - ✅ Votre app est en ligne !

---

### Option 2 : Via CLI Vercel

Si vous préférez la ligne de commande :

```powershell
cd "c:\Users\Fredd\OneDrive\Desktop\Appli DE dev"
vercel
```

**Réponses à donner** :
```
? Set up and deploy "~/Appli DE dev"? [Y/n] Y
? Which scope? [Votre compte]
? Link to existing project? [y/N] N
? What's your project's name? operaflow
? In which directory is your code located? ./
? Want to override the settings? [y/N] N
```

Ensuite, ajouter les variables d'environnement :
```powershell
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Coller: https://rrmvejpwbkwlmyjhnxaz.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Coller: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow
```

Puis déployer :
```powershell
vercel --prod
```

---

## 📋 Configuration automatique

Votre fichier `vercel.json` est déjà configuré :

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": "nextjs",
  "regions": ["cdg1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key"
  }
}
```

✅ Configuration correcte avec :
- Installation avec `--legacy-peer-deps` (résout les conflits)
- Région CDG1 (Paris - optimal pour vous)
- Variables d'environnement référencées

---

## ⚠️ Points importants

### 1. Variables d'environnement OBLIGATOIRES

Sans ces variables, l'application **ne fonctionnera pas** :

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 2. Install Command

**IMPORTANT** : Utiliser `npm install --legacy-peer-deps`

Sinon, vous aurez des erreurs de dépendances.

### 3. Build Command

Le build prend ~2-3 minutes. C'est normal.

---

## 🧪 Vérification post-déploiement

Une fois déployé, Vercel vous donnera une URL :
```
https://operaflow-[random].vercel.app
```

### Tests à faire :

1. **Page d'accueil**
   ```
   https://[votre-url].vercel.app
   ```
   ✅ Doit charger sans erreur

2. **Dashboard**
   ```
   https://[votre-url].vercel.app/dashboard
   ```
   ✅ Doit afficher les KPI

3. **Tuiles Tâches**
   ```
   https://[votre-url].vercel.app/tuiles-taches
   ```
   ✅ Doit afficher le nouveau module

4. **Console navigateur (F12)**
   ✅ Aucune erreur rouge
   ⚠️ Warnings en jaune acceptables

---

## 🔧 Dépannage

### Build échoue

**Erreur communes** :
```
Error: Cannot find module 'X'
→ Solution: Vérifier package.json, relancer le build

Error: NEXT_PUBLIC_SUPABASE_URL is not defined
→ Solution: Ajouter les variables d'environnement

Error: peer dependency conflict
→ Solution: Vérifier que installCommand = npm install --legacy-peer-deps
```

### Vérifier les logs

Sur Vercel Dashboard :
1. Aller dans votre projet
2. Onglet "Deployments"
3. Cliquer sur le dernier déploiement
4. Onglet "Building" pour voir les logs

### Redéployer

Si besoin de forcer un redéploiement :

**Via Dashboard** :
- Aller dans Deployments
- Cliquer sur "..." → "Redeploy"

**Via CLI** :
```powershell
vercel --prod --force
```

---

## 📊 Déploiements automatiques

Une fois connecté à GitHub, **chaque push sur main** déclenchera automatiquement :

1. ✅ Build Vercel
2. ✅ Tests (si configurés)
3. ✅ Déploiement en production
4. ✅ URL mise à jour

**Temps total** : 3-5 minutes

---

## 🎯 Prochaines étapes après connexion

1. ✅ Vérifier que le build réussit
2. ✅ Tester l'URL de production
3. ⚠️ **APPLIQUER LES MIGRATIONS SUPABASE**
4. ✅ Tester toutes les pages
5. ✅ Configurer un domaine personnalisé (optionnel)

---

## 🌐 URLs utiles

| Service | URL |
|---------|-----|
| **Vercel Dashboard** | https://vercel.com/dashboard |
| **Vercel New Project** | https://vercel.com/new |
| **GitHub Repo** | https://github.com/Frederic49680/Operaflow |
| **Supabase** | https://rrmvejpwbkwlmyjhnxaz.supabase.co |

---

## 💡 Conseils

- ✅ Utiliser **Option 1 (Dashboard)** si première fois
- ✅ Bien noter l'URL Vercel fournie
- ✅ Ajouter l'URL aux favoris
- ✅ Configurer les notifications Vercel (optionnel)

---

**Prêt à déployer ! 🚀**

