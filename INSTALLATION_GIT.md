# 🔧 Installation de Git

## ❌ Problème détecté

Git n'est pas installé sur votre système Windows.

---

## 🎯 Solution : Installer Git

### Méthode 1 : Installer Git pour Windows (recommandé)

#### Étape 1 : Télécharger Git

1. Allez sur : **https://git-scm.com/download/win**
2. Le téléchargement commence automatiquement
3. Ouvrez le fichier `Git-2.x.x-64-bit.exe`

#### Étape 2 : Installer Git

1. **Next** → **Next** → **Next** (garde les options par défaut)
2. Cochez **"Git Bash Here"** et **"Git GUI Here"**
3. **Next** → **Next**
4. Choisissez **"Use bundled OpenSSH"**
5. **Next** → **Next**
6. Choisissez **"Use the OpenSSL library"**
7. **Next** → **Next**
8. Choisissez **"Checkout Windows-style, commit Unix-style line endings"**
9. **Next** → **Next**
10. Choisissez **"Use MinTTY"**
11. **Next** → **Next**
12. **Install**

#### Étape 3 : Vérifier l'installation

Ouvrez **PowerShell** et tapez :

```bash
git --version
```

Vous devriez voir : `git version 2.x.x`

✅ **Git est installé !**

---

## 🖥️ Méthode 2 : GitHub Desktop (plus simple)

Si vous préférez une interface graphique (recommandé pour débuter) :

### Installation

1. Allez sur : **https://desktop.github.com**
2. Téléchargez **GitHub Desktop**
3. Installez et connectez-vous avec votre compte GitHub

### Avantages

- ✅ Interface graphique intuitive
- ✅ Pas besoin de lignes de commande
- ✅ Gestion visuelle des commits
- ✅ Intégration GitHub directe

### Utilisation

1. **Ouvrez** GitHub Desktop
2. **File** → **Add Local Repository**
3. **Sélectionnez** votre dossier de projet
4. **Cliquez** "Publish repository"
5. ✅ **C'est fait !**

---

## 🚀 Après l'installation de Git

Une fois Git installé, revenez ici et je pourrai :

1. Initialiser Git dans votre projet
2. Ajouter tous les fichiers
3. Faire le premier commit
4. Connecter à GitHub

---

## 📋 Commandes à exécuter après l'installation

```bash
# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit - Application OpéraFlow"

# Connecter à GitHub (remplacez VOTRE-USERNAME)
git remote add origin https://github.com/VOTRE-USERNAME/operaflow.git

# Pousser sur GitHub
git push -u origin main
```

---

## 🎯 Quelle méthode choisir ?

### Choisissez Git (ligne de commande) si :
- ✅ Vous êtes à l'aise avec les lignes de commande
- ✅ Vous voulez contrôler précisément chaque action
- ✅ Vous préférez la vitesse

### Choisissez GitHub Desktop si :
- ✅ Vous préférez une interface graphique
- ✅ Vous débutez avec Git
- ✅ Vous voulez simplifier le processus

---

## 📞 Aide

- **Documentation Git** : https://git-scm.com/doc
- **Documentation GitHub Desktop** : https://docs.github.com/en/desktop
- **Télécharger Git** : https://git-scm.com/download/win
- **Télécharger GitHub Desktop** : https://desktop.github.com

---

## 🎉 Prochaines étapes

1. **Installez Git** ou **GitHub Desktop**
2. **Revenez** me voir
3. Je vous aiderai à initialiser votre projet

**Dites-moi quand c'est fait !** 😊

