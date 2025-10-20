# 📍 Où mettre les variables d'environnement dans Vercel

## 🎯 Guide pas à pas

### Étape 1 : Créer votre projet sur Vercel

1. Allez sur **https://vercel.com**
2. Cliquez sur **"Sign Up"** ou **"Login"**
3. **Connectez-vous avec GitHub** (bouton "Continue with GitHub")
4. Cliquez sur **"Add New..."** → **"Project"**

---

### Étape 2 : Sélectionner votre repository

1. Dans la liste, trouvez **`Operaflow`**
2. Cliquez sur **"Import"** à côté du repository

---

### Étape 3 : Configuration du projet

Vous arrivez sur la page de configuration. Vous verrez :

```
┌─────────────────────────────────────────┐
│ Configure Project                        │
├─────────────────────────────────────────┤
│                                         │
│ Framework Preset: Next.js               │
│ Root Directory: ./                      │
│ Build Command: npm run build            │
│ Output Directory: .next                 │
│ Install Command: npm install            │
│                                         │
└─────────────────────────────────────────┘
```

**Ne changez rien** pour l'instant, c'est déjà bon ! ✅

---

### Étape 4 : Ajouter les variables d'environnement

**IMPORTANT :** C'est ici que vous devez ajouter les variables !

1. **Descendez** un peu sur la page
2. Vous verrez une section **"Environment Variables"**

```
┌─────────────────────────────────────────┐
│ Environment Variables                   │
├─────────────────────────────────────────┤
│                                         │
│  [Input field]  [Input field]  [Add]   │
│                                         │
│  (No environment variables yet)         │
│                                         │
└─────────────────────────────────────────┘
```

3. **Cliquez** dans le premier champ (KEY)
4. **Tapez** : `NEXT_PUBLIC_SUPABASE_URL`
5. **Cliquez** dans le deuxième champ (VALUE)
6. **Tapez** : `https://rrmvejpwbkwlmyjhnxaz.supabase.co`
7. **Cliquez** sur le bouton **"Add"**

**Répétez pour la deuxième variable :**

1. **Cliquez** dans le premier champ (KEY)
2. **Tapez** : `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Cliquez** dans le deuxième champ (VALUE)
4. **Tapez** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow`
5. **Cliquez** sur le bouton **"Add"**

**Résultat final :**

```
┌─────────────────────────────────────────┐
│ Environment Variables                   │
├─────────────────────────────────────────┤
│                                         │
│  NEXT_PUBLIC_SUPABASE_URL               │
│  https://rrmvejpwbkwlmyjhnxaz.supabase.co │
│                                         │
│  NEXT_PUBLIC_SUPABASE_ANON_KEY          │
│  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... │
│                                         │
└─────────────────────────────────────────┘
```

---

### Étape 5 : Déployer

1. **Descendez** jusqu'en bas de la page
2. Cliquez sur le bouton **"Deploy"**
3. **Attendez** 2-3 minutes

---

## 🎉 C'est fait !

Une fois le déploiement terminé, vous verrez :

```
✅ Deployment successful

Your site is live at:
https://operaflow.vercel.app
```

---

## 📸 Aperçu visuel

### Page de configuration Vercel

```
┌─────────────────────────────────────────────────────┐
│ Configure Project                                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Framework Preset: Next.js                           │
│ Root Directory: ./                                  │
│ Build Command: npm run build                        │
│ Output Directory: .next                             │
│ Install Command: npm install --legacy-peer-deps     │
│                                                      │
│ ┌────────────────────────────────────────────────┐ │
│ │ Environment Variables                          │ │
│ ├────────────────────────────────────────────────┤ │
│ │                                                │ │
│ │ [NEXT_PUBLIC_SUPABASE_URL] [https://...] [Add]│ │
│ │                                                │ │
│ │ [NEXT_PUBLIC_SUPABASE_ANON_KEY] [eyJhb...] [Add]│ │
│ │                                                │ │
│ └────────────────────────────────────────────────┘ │
│                                                      │
│                          [Deploy]                   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## ⚠️ Important

### Les variables doivent être ajoutées dans Vercel

**❌ NE PAS** les mettre dans le code source (elles sont déjà dans `.env.local` pour le développement local)

**✅ OUI** les mettre dans Vercel lors de la configuration du projet

### Pourquoi ?

- `.env.local` = pour le développement local
- Variables dans Vercel = pour la production

---

## 🔄 Si vous oubliez de les ajouter

Si vous déployez sans les variables :

1. Allez dans **Settings** → **Environment Variables**
2. Ajoutez les variables
3. **Redéployez** le projet

---

## 📝 Récapitulatif

**Où mettre les variables :**

1. **Dans Vercel** lors de la configuration du projet
2. **Section** "Environment Variables"
3. **Deux variables** à ajouter :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Ne pas oublier :**
- Cliquez sur **"Add"** après chaque variable
- Vérifiez que les deux variables sont bien présentes
- Cliquez sur **"Deploy"** après avoir ajouté les variables

---

## 🎯 Checklist

- [ ] Projet créé sur Vercel
- [ ] Repository `Operaflow` importé
- [ ] Variable `NEXT_PUBLIC_SUPABASE_URL` ajoutée
- [ ] Variable `NEXT_PUBLIC_SUPABASE_ANON_KEY` ajoutée
- [ ] Bouton "Deploy" cliqué
- [ ] Déploiement réussi
- [ ] Application accessible sur l'URL Vercel

---

## 🎊 C'est parti !

Votre application sera bientôt en ligne ! 🚀

**URL de votre repository :** https://github.com/Frederic49680/Operaflow

**Déployez maintenant sur Vercel !** 😊

