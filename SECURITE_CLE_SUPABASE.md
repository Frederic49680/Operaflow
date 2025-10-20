# 🔐 Sécurité des clés Supabase

## ⚠️ IMPORTANT : Ne JAMAIS exposer la clé service role !

---

## 🔑 Les deux types de clés Supabase

### 1. Clé "anon public" (✅ À utiliser dans Vercel)

**Caractéristiques :**
- ✅ **Sécurisée** pour le frontend
- ✅ Respecte les **politiques RLS** (Row Level Security)
- ✅ Accès limité selon les règles de sécurité
- ✅ Peut être exposée côté client

**Où l'utiliser :**
- Frontend (React/Next.js)
- Variables d'environnement `NEXT_PUBLIC_*`
- Vercel (production)

**Valeur :**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow
```

---

### 2. Clé "service role secret" (❌ NE JAMAIS exposer)

**Caractéristiques :**
- ❌ **DANGEREUSE** si exposée
- ❌ **Bypass TOUTES** les politiques RLS
- ❌ Accès **complet** à la base de données
- ❌ Peut **supprimer/modifier** toutes les données

**Où l'utiliser :**
- **UNIQUEMENT** dans les API routes serveur
- **UNIQUEMENT** dans les fonctions Supabase (Edge Functions)
- **JAMAIS** dans le frontend
- **JAMAIS** dans les variables `NEXT_PUBLIC_*`

**Valeur :**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDc5MzU0MSwiZXhwIjoyMDc2MzY5NTQxfQ...
```

---

## ✅ Variables à mettre dans Vercel

### Pour la production (Vercel)

**UNIQUEMENT ces deux variables :**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://rrmvejpwbkwlmyjhnxaz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow
```

**❌ NE PAS ajouter :**
- `SUPABASE_SERVICE_ROLE_KEY` (jamais !)
- Toute autre clé "secret"

---

## 🛡️ Pourquoi c'est dangereux ?

### Si vous exposez la clé service role

```javascript
// ❌ JAMAIS FAIRE ÇA
const supabase = createClient(
  'https://...',
  'service_role_secret_key' // ← DANGER !
)
```

**Conséquences :**
- ❌ N'importe qui peut accéder à votre base de données
- ❌ N'importe qui peut modifier/supprimer toutes les données
- ❌ Toutes les politiques de sécurité sont ignorées
- ❌ Vos données sont **complètement exposées**

---

## ✅ Bonnes pratiques

### Frontend (React/Next.js)

```typescript
// ✅ CORRECT
import { createClient } from '@/lib/supabase/client'

const supabase = createClient() // Utilise NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### API Routes (Serveur)

```typescript
// ✅ CORRECT (si vraiment nécessaire)
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ← Variable SANS NEXT_PUBLIC_
)
```

**Mais dans votre cas :** Vous n'avez PAS besoin de la clé service role pour l'instant !

---

## 🎯 Votre cas

### Variables nécessaires

**Pour votre application OpéraFlow, vous avez besoin UNIQUEMENT de :**

1. ✅ `NEXT_PUBLIC_SUPABASE_URL`
2. ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**C'est tout !** Ces deux variables suffisent pour faire fonctionner toute votre application.

---

## 📋 Checklist Vercel

### ✅ À ajouter dans Vercel

- [x] `NEXT_PUBLIC_SUPABASE_URL`
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### ❌ À NE PAS ajouter

- [ ] `SUPABASE_SERVICE_ROLE_KEY` ← JAMAIS !
- [ ] `SUPABASE_SERVICE_ROLE_SECRET` ← JAMAIS !

---

## 🔒 Sécurité

### Règles d'or

1. **Tout ce qui commence par `NEXT_PUBLIC_`** est visible côté client
2. **La clé service role** ne doit JAMAIS commencer par `NEXT_PUBLIC_`
3. **La clé anon** est conçue pour être publique, c'est OK
4. **Les politiques RLS** protègent vos données avec la clé anon

---

## 🎉 Résumé

**Dans Vercel, ajoutez UNIQUEMENT :**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://rrmvejpwbkwlmyjhnxaz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**❌ NE PAS ajouter la clé service role !**

---

## 📚 Documentation

- **Sécurité Supabase** : https://supabase.com/docs/guides/auth/row-level-security
- **Clés API** : https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs

---

## 🎊 C'est clair ?

**2 variables = tout ce dont vous avez besoin !** 🚀

La clé service role reste secrète et n'est jamais exposée. ✅

