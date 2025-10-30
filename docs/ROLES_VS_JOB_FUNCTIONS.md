# 📋 Séparation des Rôles App vs Fonctions Métier

## 🎯 Problème initial

La table `roles` était utilisée pour **deux choses différentes**, créant une confusion :

1. **Rôles applicatifs** (droits d'accès) pour `app_users`
2. **Fonctions métier** (hiérarchie) pour `ressources`

## ✅ Solution mise en place

### **1. Rôles Applicatifs** (Table: `roles`)
**Objectif :** Définir les droits d'accès dans l'application

**Utilisation :** Associer des permissions à des utilisateurs (`app_users`)

**Structure :**
```sql
roles (
    id UUID PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,  -- Ex: 'ADMIN', 'PLANIFICATEUR', 'USER'
    label TEXT NOT NULL,        -- Ex: 'Administrateur', 'Planificateur'
    system BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ
)
```

**Tables liées :**
- `user_roles` : Associe un `app_user` à un `role`
- `role_permissions` : Associe un `role` à des `permissions`
- `page_access_rules` : Définit l'accès par page pour un `role`
- `component_flags` : Active/désactive des composants pour un `role`

**Exemples de rôles app :**
- `ADMIN` : Tous les droits
- `PLANIFICATEUR` : Gantt, adéquation, lecture RH, écriture planif
- `CA` : Affaires, lots, reporting finance, validation claims
- `RESP_SITE` : Vues site, remontées, maintenance (son site)
- `MAINTENANCE` : Journal soir, batteries
- `RH` : Module RH/absences, lecture planif
- `DIRECTION` : Dashboard global (lecture), exports

### **2. Fonctions Métier** (Table: `job_functions`)
**Objectif :** Définir la hiérarchie et les fonctions dans l'entreprise

**Utilisation :** Associer une fonction à une ressource (`ressources`)

**Structure :**
```sql
job_functions (
    code TEXT PRIMARY KEY,      -- Ex: 'N1', 'N5', 'DIR'
    label TEXT NOT NULL,        -- Ex: 'Intervenant', 'Chargé d'Affaire'
    seniority_rank INTEGER,     -- 1-8 pour la hiérarchie
    description TEXT,
    is_special BOOLEAN,         -- Pour NA, NB, NC
    category TEXT,              -- 'OPERATIONNEL', 'ADMINISTRATIF', 'DIRECTION'
    created_at TIMESTAMPTZ
)
```

**Tables liées :**
- `resource_job_functions` : Associe une `ressource` à une `job_function`
- `assignments` : Affectation confirmée sur une tâche
- `provisional_assignments` : Affectation provisoire
- `substitution_rules` : Règles de substitution entre fonctions
- `resource_competency_roles` : Associations compétence → fonction

**Exemples de fonctions métier :**
- `N1` : Intervenant (Exécution terrain)
- `N2` : Chargé de Travaux (Opérationnel)
- `N3` : Chef de Chantier (Superviseur de site)
- `N4` : Conducteur de Travaux (Coordination multi-chantier)
- `N5` : Chargé d'Affaire (Gestion technique & financière)
- `N6` : Responsable d'Activ passes (Pilotage multi-affaires)
- `N7` : Responsable d'Agence (Niveau local)
- `N8` : Responsable Régional (Niveau direction)
- `NA` : Administratif (Hors hiérarchie)
- `NB` : Magasinier (Hors hiérarchie)
- `NC` : Chargé d'Étude (Hors hiérarchie)
- `DIR` : Directeur
- `MANAGER` : Manager de projet
- `EXPERT` : Expert technique

## 🔄 Migration

**Migrations créées :**
- `088_create_job_functions_table.sql` : Crée la table `job_functions`
- `089_clarify_roles_and_job_functions.sql` : Migre les données et clarifie

**État actuel :**
- ✅ `roles` = Rôles applicatifs (créés dans migration 047)
- ✅ `job_functions` = Fonctions métier (créées dans migration 088/089)
- ✅ Les données de `resource_roles` sont migrées vers `resource_job_functions`

## 📊 Schéma de données

```
app_users ──┬── user_roles ──┬── roles ──┬── role_permissions ──┬── permissions
            │                │           ├── page_access_rules
            │                │           └── component_flags
            │                │
            │                └── job_functions (pour l'historique si besoin)

ressources ──┬── resource_job_functions ──┬── job_functions
             │                             ├── substitutions_rules
             │                             └── assignments
             │
             └── resource_competencies ──┬── competencies
                                        └── resource_competency_roles
```

## 🎯 Cas d'usage

**Exemple 1 : Un collaborateur avec rôle app et fonction métier**
```
Ressource: "Jean Dupont"
├─ Fonction métier: N5 (Chargé d'Affaire)
└─ Rôle app: CA (Chargé d'Affaires - droits dans l'app)
```

**Exemple 2 : Un administrateur avec une fonction métier**
```
Ressource: "Marie Martin"
├─ Fonction métier: DIR (Directeur)
└─ Rôle app: ADMIN (tous les droits dans l'app)
```

**Exemple 3 : Un technicien avec droits limités**
```
Ressource: "Pierre Bernard"
├─ Fonction métier: N1 (Intervenant)
└─ Rôle app: USER (droits de base, lecture remontées site)
```

## 📝 Notes importantes

1. **Un utilisateur peut avoir plusieurs rôles app** (via `user_roles`)
2. **Une ressource peut avoir plusieurs fonctions métier** (via `resource_job_functions`) mais **une seule principale** (`is_primary = true`)
3. **Les fonctions métier définissent la hiérarchie** et les règles de substitution
4. **Les rôles app définissent les droits** d'accès dans l'application
5. **Ces deux concepts sont indépendants** : on peut être "Chef de Chantier" (fonction) sans être "Responsable de site" (rôle app)

## 🔍 Vérifications

Pour vérifier la séparation :
```sql
-- Voir les rôles applicatifs
SELECT * FROM roles ORDER BY code;

-- Voir les fonctions métier
SELECT * FROM job_functions ORDER BY seniority_rank, code;

-- Voir les associations ressources -> fonctions métier
SELECT 
    r.nom, r.prenom,
    jf.code, jf.label,
    rjf.is_primary
FROM ressources r
JOIN resource_job_functions rjf ON r.id = rjf.resource_id
JOIN job_functions jf ON rjf.job_function_code = jf.code
ORDER BY r.nom;

-- Voir les associations utilisateurs -> rôles app
SELECT 
    au.email, au.nom, au.prenom,
    r.code, r.label
FROM app_users au
JOIN user_roles ur ON au.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
ORDER BY au.nom;
```

## 🚀 Utilisation dans le code

**Dans les composants React :**
```typescript
// Pour vérifier les droits d'accès (rôles app)
const { user } = await supabase.auth.getUser()
const { data: userRoles } = await supabase
  .from('user_roles')
  .select('*, roles(*)')
  .eq('user_id', user.id)

// Pour afficher la fonction métier d'une ressource
const { data: resourceFunctions } = await supabase
  .from('resource_job_functions')
  .select('*, job_functions(*)')
  .eq('resource_id', resourceId)
  .eq('is_primary', true)
  .single()
```

## 📚 Références

- Migration 047 : Création de la table `roles` (rôles app)
- Migration 040 : Ancienne table `roles` (fonctions métier - DEPRECATED)
- Migration 088 : Création de la table `job_functions` (fonctions métier)
- Migration 089 : Migration et clarification
- PRD : `.cursor/rules/prd1.mdc` (Gestion Utilisateurs & Accès)

## ✅ Avantages de cette séparation

1. **Clarté** : Pas de confusion entre droits et hiérarchie
2. **Flexibilité** : Un utilisateur peut avoir plusieurs rôles app
3. **Indépendance** : Les fonctions métier évoluent indépendamment des droits app
4. **Maintenance** : Code plus propre et séparation des responsabilités
5. **Évolutivité** : Facile d'ajouter de nouveaux rôles app ou fonctions métier
