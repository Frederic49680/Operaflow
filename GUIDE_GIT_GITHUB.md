# 📦 Guide Git / GitHub - Charger votre application

## 🎯 Objectif

Charger votre application sur GitHub pour pouvoir la déployer sur Vercel.

---

## 🚀 Méthode 1 : Depuis zéro (nouveau projet Git)

### Étape 1 : Initialiser Git (2 min)

Ouvrez PowerShell dans le dossier de votre projet et exécutez :

```bash
# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit - Application OpéraFlow"
```

### Étape 2 : Créer un repository sur GitHub (3 min)

1. Allez sur https://github.com
2. Cliquez sur le bouton **"+"** en haut à droite → **"New repository"**
3. Remplissez :
   - **Repository name** : `operaflow` (ou le nom que vous voulez)
   - **Description** : `Application de gestion de projets et planification`
   - **Visibilité** : Private (recommandé) ou Public
   - ⚠️ **NE COCHEZ PAS** "Add a README file" (on en a déjà un)
4. Cliquez sur **"Create repository"**

### Étape 3 : Connecter votre projet à GitHub (2 min)

GitHub vous affichera des commandes. Exécutez celles-ci :

```bash
# Ajouter le repository distant
git remote add origin https://github.com/VOTRE-USERNAME/operaflow.git

# Renommer la branche principale (optionnel)
git branch -M main

# Pousser votre code
git push -u origin main
```

**C'est fait !** 🎉 Votre code est maintenant sur GitHub.

---

## 🔄 Méthode 2 : Si vous avez déjà un repository Git

Si vous avez déjà initialisé Git localement :

```bash
# Vérifier le statut
git status

# Ajouter les fichiers modifiés
git add .

# Commit
git commit -m "Description de vos modifications"

# Pousser sur GitHub
git push origin main
```

---

## 📝 Commandes Git essentielles

### Voir les fichiers modifiés
```bash
git status
```

### Ajouter des fichiers
```bash
git add .                    # Tous les fichiers
git add fichier.ts          # Un fichier spécifique
```

### Faire un commit
```bash
git commit -m "Description de vos modifications"
```

### Pousser sur GitHub
```bash
git push origin main
```

### Récupérer les modifications
```bash
git pull origin main
```

### Voir l'historique
```bash
git log
```

---

## 🔐 Sécurité - Fichiers à ne PAS pousser sur Git

### ✅ Déjà dans .gitignore

Votre projet a déjà un fichier `.gitignore` qui exclut :
- `.env.local` (variables d'environnement)
- `node_modules/` (dépendances)
- `.next/` (build Next.js)
- `*.log` (logs)

### ⚠️ Vérifier avant de pousser

Avant de faire `git push`, vérifiez que ces fichiers ne sont PAS dans Git :

```bash
git status
```

Si vous voyez `.env.local` dans la liste, **NE FAITES PAS** `git push` !

---

## 🎯 Workflow complet (exemple)

### Scénario : Vous avez fait des modifications

```bash
# 1. Voir ce qui a changé
git status

# 2. Ajouter les modifications
git add .

# 3. Commit avec un message descriptif
git commit -m "Ajout de la planification automatique BPU"

# 4. Pousser sur GitHub
git push origin main
```

### Scénario : Vercel déploie automatiquement

Après le `git push`, Vercel détecte automatiquement les changements et redéploie votre application ! 🚀

---

## 🐛 Dépannage

### Erreur : "fatal: not a git repository"

**Solution :**
```bash
git init
```

### Erreur : "remote origin already exists"

**Solution :**
```bash
# Voir les remotes existants
git remote -v

# Supprimer l'ancien remote
git remote remove origin

# Ajouter le nouveau
git remote add origin https://github.com/VOTRE-USERNAME/operaflow.git
```

### Erreur : "Authentication failed"

**Solution :**

1. **GitHub ne supporte plus les mots de passe**, utilisez un **Personal Access Token** :

   a. Allez sur GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
   
   b. Cliquez sur **"Generate new token (classic)"**
   
   c. Donnez un nom (ex: "Vercel Deployment")
   
   d. Cochez les scopes : `repo` (toutes les cases)
   
   e. Cliquez sur **"Generate token"**
   
   f. **COPIEZ LE TOKEN** (vous ne le reverrez plus !)
   
   g. Quand Git vous demande un mot de passe, collez le token

2. **Alternative : Utiliser GitHub Desktop** (plus simple)
   - Téléchargez : https://desktop.github.com
   - Interface graphique, pas besoin de lignes de commande

---

## 🖥️ Alternative : GitHub Desktop (recommandé pour débuter)

Si vous préférez une interface graphique :

### Installation

1. Téléchargez GitHub Desktop : https://desktop.github.com
2. Installez et connectez-vous avec votre compte GitHub

### Utilisation

1. **Ouvrez** GitHub Desktop
2. **Cliquez** "File" → "Add Local Repository"
3. **Sélectionnez** votre dossier de projet
4. **Ajoutez** un message de commit (ex: "Initial commit")
5. **Cliquez** "Commit to main"
6. **Cliquez** "Publish repository"
7. ✅ **C'est fait !**

### Modifications futures

1. Faites vos modifications dans le code
2. Dans GitHub Desktop, vous verrez les fichiers modifiés
3. Ajoutez un message de commit
4. Cliquez "Commit to main"
5. Cliquez "Push origin"
6. ✅ Vercel redéploie automatiquement !

---

## 📋 Checklist avant le premier push

- [ ] Fichier `.env.local` existe et contient vos clés Supabase
- [ ] Fichier `.gitignore` est présent
- [ ] `npm run build` fonctionne localement
- [ ] Vous avez un compte GitHub
- [ ] Vous avez créé un repository sur GitHub

---

## 🎯 Prochaines étapes

1. ✅ Poussez votre code sur GitHub
2. ✅ Connectez votre repo à Vercel
3. ✅ Déployez sur Vercel (suivez `DEPLOIEMENT_VERCEL_RAPIDE.md`)
4. ✅ Configurez les déploiements automatiques

---

## 📞 Aide

### Documentation
- **Git** : https://git-scm.com/doc
- **GitHub** : https://docs.github.com
- **GitHub Desktop** : https://docs.github.com/en/desktop

### Commandes rapides

```bash
# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Commit
git commit -m "Initial commit"

# Connecter à GitHub
git remote add origin https://github.com/VOTRE-USERNAME/operaflow.git

# Pousser
git push -u origin main
```

---

## 🎉 C'est parti !

Votre application sera bientôt sur GitHub et déployée sur Vercel ! 🚀

