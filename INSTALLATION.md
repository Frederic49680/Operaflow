# 📦 Guide d'Installation - OperaFlow

## ✅ Ce qui a été créé

Le socle technique de votre application est maintenant prêt ! Voici ce qui a été mis en place :

### 🎨 Configuration de base
- ✅ Next.js 15 avec App Router
- ✅ TypeScript configuré
- ✅ Tailwind CSS avec design system bleu/gris
- ✅ Composants shadcn/ui (Button, Input, Card, Dialog, Table, Badge, etc.)
- ✅ Configuration Supabase (client, server, admin)
- ✅ Utilitaires et constantes
- ✅ ESLint + Prettier configurés

### 📁 Structure créée
```
operaflow/
├── app/
│   ├── auth/login/          # Page de connexion
│   ├── dashboard/           # Dashboard principal
│   ├── layout.tsx           # Layout racine
│   ├── page.tsx             # Page d'accueil (redirection)
│   └── globals.css          # Styles globaux
├── components/ui/           # Composants UI de base
├── lib/
│   ├── supabase/           # Clients Supabase
│   ├── utils.ts            # Fonctions utilitaires
│   └── constants.ts        # Constantes métier
├── package.json            # Dépendances
├── tsconfig.json           # Config TypeScript
├── tailwind.config.ts      # Config Tailwind
└── README.md               # Documentation
```

## 🚀 Installation

### 1. Installer les dépendances

Ouvrez un terminal dans le dossier du projet et exécutez :

```bash
npm install
```

Cela va installer toutes les dépendances listées dans `package.json`.

### 2. Configuration de l'environnement

Le fichier `.env.local` a été créé avec vos credentials Supabase :
- ✅ URL Supabase
- ✅ Clé API publique (anon)
- ✅ Clé API secrète (service role)

**Note** : Si vous devez recréer le fichier `.env.local`, copiez le contenu de `.env.local.example`.

### 3. Lancer le serveur de développement

```bash
npm run dev
```

L'application sera accessible sur : **http://localhost:3000**

## 🧪 Tester l'application

### Page de connexion
Allez sur : http://localhost:3000/auth/login

Vous verrez une belle page de connexion avec le design OperaFlow.

### Dashboard
Allez sur : http://localhost:3000/dashboard

Vous verrez le tableau de bord avec :
- Statistiques (en attente de données)
- Actions rapides vers les modules
- État du système

## 📊 Prochaines étapes

Maintenant que le socle est prêt, nous allons créer les modules un par un :

### Phase 1 - Accès & Référentiels (à venir)
1. **Module Auth & Utilisateurs** (PRD #1)
   - Tables : `app_users`, `roles`, `permissions`, etc.
   - Pages : `/admin/users`, `/admin/roles`, `/admin/access`
   - Fonctionnalités : Invitation, RBAC, 2FA

2. **Module Sites** (PRD #2)
   - Table : `sites`
   - Page : `/sites`
   - Fonctionnalités : CRUD sites, stats

3. **Module RH Collaborateurs** (PRD #3)
   - Table : `ressources`
   - Page : `/rh/collaborateurs`
   - Fonctionnalités : CRUD, import Excel, suivi RH

4. **Module Absences** (PRD #4)
   - Table : `absences`
   - Page : `/rh/absences`
   - Fonctionnalités : Gestion absences, disponibilités

### Phase 2-6 (à venir)
- Module Affaires
- Module Gantt
- Modules Terrain
- Modules Relations
- Dashboard Global
- Form Builder

## 🛠️ Commandes utiles

```bash
# Développement
npm run dev

# Build production
npm run build

# Lancer en production
npm run start

# Vérifier le code
npm run lint

# Formater le code
npm run format

# Vérifier TypeScript
npm run type-check
```

## 🐛 Résolution de problèmes

### Erreur "Module not found"
Si vous avez une erreur de module non trouvé :
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erreur Tailwind
Si les styles ne s'appliquent pas :
```bash
npm run build
```

### Erreur Supabase
Vérifiez que vos credentials dans `.env.local` sont corrects.

## 📝 Notes importantes

1. **Supabase** : Les tables et la base de données seront créées progressivement avec les migrations SQL.

2. **Authentification** : Pour l'instant, les pages auth sont des placeholders. L'authentification réelle sera implémentée avec le module Auth.

3. **Design** : Le design system est basé sur les couleurs bleu (#0369a1) et gris slate. Tous les composants utilisent ces couleurs.

4. **Responsive** : Tous les composants sont responsive et mobile-friendly.

## 🎯 Prochaine action

Une fois que vous avez testé l'application, dites-moi si vous voulez que je commence par :
1. **Module Auth & Utilisateurs** (le plus complexe mais essentiel)
2. **Module Sites** (plus simple, bon pour commencer)
3. Autre chose ?

---

**Prêt à construire votre application ! 🚀**

