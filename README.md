# 🚀 OperaFlow - Système de Pilotage Opérationnel

Application web complète de planification et pilotage opérationnel pour la gestion de projets, ressources humaines, affaires et terrain.

## 📋 Stack Technique

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Functions)
- **Charts**: Recharts
- **Gantt**: Frappe-Gantt
- **Forms**: React Hook Form + Zod
- **State Management**: Zustand
- **Notifications**: Sonner

## 🎨 Design System

- **Couleurs principales**: Bleu (#0369a1) et Gris Slate
- **Responsive**: Mobile-first
- **Composants**: shadcn/ui
- **Icônes**: Lucide React

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Créer le fichier .env.local (déjà créé avec vos credentials)
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...

# Lancer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📁 Structure du Projet

```
├── app/                    # Pages Next.js 15 (App Router)
│   ├── auth/              # Authentification
│   ├── admin/             # Administration
│   ├── sites/             # Module Sites
│   ├── rh/                # Module RH
│   ├── affaires/          # Module Affaires
│   ├── gantt/             # Module Gantt
│   ├── terrain/           # Remontées terrain
│   ├── maintenance/       # Module Maintenance
│   ├── clients/           # Interlocuteurs
│   ├── claims/            # Réclamations
│   ├── dashboard/         # Dashboard global
│   └── builder/           # Form Builder
├── components/            # Composants React
│   ├── ui/               # Composants UI de base (shadcn)
│   └── ...               # Composants métier
├── lib/                   # Utilitaires
│   ├── supabase/         # Clients Supabase
│   ├── utils.ts          # Fonctions utilitaires
│   └── constants.ts      # Constantes
├── types/                 # Types TypeScript
└── supabase/              # Migrations SQL (à créer)
```

## 📦 Modules (PRD)

### Phase 1 - Accès & Référentiels
1. ✅ **Gestion Utilisateurs & Accès** (PRD #1)
2. ⏳ **Sites** (PRD #2)
3. ⏳ **RH Collaborateurs** (PRD #3)
4. ⏳ **Absences** (PRD #4)

### Phase 2 - Affaires & Finance
5. ⏳ **Base Affaires** (PRD #5)

### Phase 3 - Planification
6. ⏳ **Gantt** (PRD #6)

### Phase 4 - Terrain & Reporting
7. ⏳ **Remontée Site** (PRD #7)
8. ⏳ **Maintenance** (PRD #8)

### Phase 5 - Relations externes
9. ⏳ **Interlocuteurs Clients** (PRD #9)
10. ⏳ **Claims** (PRD #10)

### Phase 6 - Suivis & Dashboard
11. ⏳ **Dashboard Global** (PRD #11)
12. ⏳ **Form Builder** (PRD #12)

## 🗄️ Base de Données Supabase

Les migrations SQL seront créées progressivement dans le dossier `supabase/migrations/`.

### Tables principales (à créer) :
- `app_users` - Utilisateurs de l'application
- `roles`, `permissions`, `role_permissions`, `user_roles`
- `sites` - Sites opérationnels
- `ressources` - Collaborateurs
- `absences` - Absences
- `clients`, `interlocuteurs` - Clients et contacts
- `affaires`, `affaires_lots` - Affaires et découpage financier
- `planning_taches` - Tâches Gantt
- `remontee_site` - Remontées terrain
- `maintenance_journal`, `maintenance_batteries` - Maintenance
- `claims`, `claim_history` - Réclamations
- Et bien d'autres...

## 🔐 Sécurité

- RLS (Row Level Security) activé sur toutes les tables
- RBAC (Role-Based Access Control) complet
- Authentification Supabase avec liens d'activation
- 2FA optionnel (obligatoire pour Admin/Direction)
- Audit logs sur actions sensibles

## 📊 Fonctionnalités Clés

- ✅ Authentification sécurisée
- ⏳ Gestion multi-sites
- ⏳ Planification Gantt interactive
- ⏳ Suivi temps réel terrain
- ⏳ Dashboard pilotage
- ⏳ Atterrissage financier automatique
- ⏳ Claims et réclamations
- ⏳ Reporting et exports

## 🧪 Tests

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Formatting
npm run format
```

## 📝 Scripts Disponibles

- `npm run dev` - Serveur de développement
- `npm run build` - Build production
- `npm run start` - Serveur production
- `npm run lint` - ESLint
- `npm run format` - Prettier
- `npm run type-check` - Vérification TypeScript

## 🚧 Développement

Le projet suit le plan de bataille défini dans le PRD Général :
- Phase 0 : Socle technique ✅
- Phase 1 : Accès & Référentiels (en cours)
- Phase 2-6 : À venir

## 📄 Licence

Propriétaire - Tous droits réservés

---

**Développé avec ❤️ pour optimiser votre pilotage opérationnel**

