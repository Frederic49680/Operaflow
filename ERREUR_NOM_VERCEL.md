# ⚠️ ERREUR : Nom de projet Vercel

## Le problème

Vous avez reçu cette erreur :
```
Error: Project names can be up to 100 characters long and must be lowercase.
```

**Cause** : Vous avez tapé `OperFlow` (avec majuscule) au lieu de `operaflow` (minuscules).

---

## ✅ Solution

### Relancer Vercel avec le bon nom

```powershell
vercel
```

**Réponses à donner** :

```
? Set up and deploy "~/Appli DE dev"? Y
? Which scope? [Votre compte] (Entrée)
? Link to existing project? N
? What's your project's name? operaflow    ← EN MINUSCULES !
? In which directory is your code located? ./
? Want to modify these settings? N
```

---

## 📋 Règles de nommage Vercel

✅ **Autorisé** :
- Lettres minuscules : `a-z`
- Chiffres : `0-9`
- Caractères : `.` `_` `-`
- Max 100 caractères

❌ **Interdit** :
- Majuscules : `A-Z`
- Séquence `---`
- Espaces
- Caractères spéciaux

---

## ✅ Exemples valides

```
✅ operaflow
✅ opera-flow
✅ opera_flow
✅ operaflow2025
✅ opera.flow
```

## ❌ Exemples invalides

```
❌ OperFlow (majuscules)
❌ OPERAFLOW (tout en majuscules)
❌ Opera Flow (espace)
❌ opera---flow (triple tiret)
```

---

## 🚀 Après correction

Une fois le nom correct entré, Vercel va :

1. ✅ Créer le projet
2. ✅ Détecter la configuration Next.js
3. ✅ Préparer le déploiement
4. ⚠️ **Ensuite, ajoutez les variables d'environnement** (voir ci-dessous)

---

## 📝 Variables d'environnement à ajouter

Après la création du projet, ajoutez :

```powershell
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Puis tapez : https://rrmvejpwbkwlmyjhnxaz.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Puis tapez : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow
```

Puis déployer :
```powershell
vercel --prod
```

---

**Relancez maintenant : `vercel`**

