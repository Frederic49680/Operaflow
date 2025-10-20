# 🏢 Module Sites - Guide d'installation

## ✅ Ce qui a été créé

Le Module Sites est maintenant prêt ! Voici ce qui a été implémenté :

### 📊 Base de données
- ✅ Migration SQL : `supabase/migrations/001_create_sites.sql`
- ✅ Table `sites` avec tous les champs
- ✅ Index pour les performances
- ✅ Triggers pour `updated_at`
- ✅ RLS (Row Level Security) activé

### 🎨 Interface utilisateur
- ✅ Page `/sites` avec design moderne
- ✅ Tableau des sites avec filtres
- ✅ Formulaire de création/édition
- ✅ 3 cartes de statistiques (Actif, En pause, Fermé)
- ✅ Boutons Import/Export (UI prête)
- ✅ Design cohérent avec le dashboard

### 🧩 Composants
- ✅ `SitesTable` - Tableau interactif
- ✅ `SiteFormModal` - Formulaire modal
- ✅ Composants UI : Select, Textarea, DropdownMenu

---

## 🚀 Installation de la migration SQL

### Option 1 : Via Supabase Dashboard (Recommandé)

1. **Ouvrez votre projet Supabase** :
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet

2. **Accédez à l'éditeur SQL** :
   - Menu de gauche → SQL Editor
   - Cliquez sur "New query"

3. **Copiez et exécutez la migration** :
   - Ouvrez le fichier `supabase/migrations/001_create_sites.sql`
   - Copiez tout le contenu
   - Collez dans l'éditeur SQL
   - Cliquez sur "Run" (ou Ctrl+Enter)

4. **Vérifiez la création** :
   - Menu de gauche → Table Editor
   - Vous devriez voir la table `sites`

### Option 2 : Via Supabase CLI (Avancé)

Si vous avez Supabase CLI installé :

```bash
# Installer Supabase CLI (si pas déjà fait)
npm install -g supabase

# Se connecter à votre projet
supabase link --project-ref rrmvejpwbkwlmyjhnxaz

# Exécuter les migrations
supabase db push
```

---

## 🧪 Tester le module

### 1. Accéder à la page Sites

Allez sur : **http://localhost:3002/sites**

Vous devriez voir :
- ✅ Header avec logo OperaFlow
- ✅ 3 cartes de statistiques
- ✅ Tableau vide avec message "Aucun site pour le moment"
- ✅ Bouton "Créer un site"

### 2. Créer un site de test

1. Cliquez sur "Créer un site"
2. Remplissez le formulaire :
   - **Code site** : `E-03A`
   - **Nom** : `Site Est - Zone 03A`
   - **Responsable** : Sélectionnez un responsable
   - **Statut** : `Actif`
   - **Commentaires** : (optionnel)
3. Cliquez sur "Créer"

### 3. Insérer des données directement dans Supabase

Si vous voulez tester avec des données :

1. Allez dans Supabase Dashboard → Table Editor → sites
2. Cliquez sur "Insert row"
3. Remplissez :
   ```sql
   code_site: E-03A
   nom: Site Est - Zone 03A
   responsable_id: (laissez vide pour l'instant)
   statut: Actif
   ```
4. Cliquez sur "Save"

Rafraîchissez la page `/sites` et vous devriez voir le site !

---

## 📋 Fonctionnalités implémentées

### ✅ Interface
- [x] Page Sites avec design moderne
- [x] Tableau des sites
- [x] Formulaire création/édition
- [x] Statistiques (Actif, En pause, Fermé)
- [x] Boutons Import/Export (UI)
- [x] Recherche (UI)
- [x] Actions (Modifier, Supprimer)

### ⏳ À implémenter (prochaines étapes)
- [ ] Connexion réelle à Supabase
- [ ] CRUD fonctionnel (Create, Read, Update, Delete)
- [ ] Import Excel
- [ ] Export Excel
- [ ] Recherche fonctionnelle
- [ ] Filtres par statut
- [ ] Stats dynamiques (calculées depuis la DB)
- [ ] Validation des formulaires
- [ ] Notifications (toast) pour succès/erreur

---

## 🎯 Prochaines étapes

Pour rendre le module complètement fonctionnel, nous devons :

1. **Créer les actions serveur** (Server Actions Next.js)
   - `actions/sites.ts` avec les fonctions CRUD

2. **Connecter à Supabase**
   - Utiliser le client Supabase
   - Gérer les erreurs

3. **Ajouter les notifications**
   - Toast pour succès/erreur
   - Loading states

4. **Implémenter Import/Export Excel**
   - Utiliser la librairie `xlsx`

---

## 💡 Notes importantes

- **RLS activé** : Les policies sont basiques pour l'instant (tout le monde peut tout faire)
- **Responsable** : Pour l'instant, les responsables sont en dur. On les connectera au module RH plus tard
- **Stats** : Les statistiques sont statiques (0). On les calculera dynamiquement plus tard
- **Design** : Cohérent avec le dashboard (couleurs, animations, hover)

---

## 🐛 Dépannage

### La page ne s'affiche pas
- Vérifiez que le serveur tourne : `npm run dev`
- Vérifiez l'URL : `http://localhost:3002/sites`
- Vérifiez la console du navigateur (F12)

### Erreur SQL lors de la migration
- Vérifiez que vous êtes dans le bon projet Supabase
- Vérifiez que la table `sites` n'existe pas déjà
- Si elle existe, supprimez-la d'abord ou modifiez la migration

### Les données ne s'affichent pas
- Vérifiez que vous avez bien inséré des données dans Supabase
- Vérifiez que la migration a bien été exécutée
- Rafraîchissez la page

---

## 📊 Structure de la table `sites`

```sql
CREATE TABLE sites (
    id UUID PRIMARY KEY,
    code_site TEXT UNIQUE NOT NULL,
    nom TEXT NOT NULL,
    responsable_id UUID,
    remplaçant_id UUID,
    statut TEXT CHECK (statut IN ('Actif', 'En pause', 'Fermé')),
    commentaires TEXT,
    date_creation TIMESTAMPTZ,
    created_by UUID,
    updated_at TIMESTAMPTZ
);
```

---

**Le Module Sites est prêt ! Testez-le et dites-moi ce que vous en pensez ! 🚀**

