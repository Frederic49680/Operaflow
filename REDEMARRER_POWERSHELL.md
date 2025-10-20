# 🔄 Redémarrer PowerShell

## ❌ Problème

Git est installé mais PowerShell ne le reconnaît pas encore.

---

## ✅ Solution : Redémarrer PowerShell

### Méthode 1 : Fermer et rouvrir PowerShell

1. **Fermez** complètement PowerShell (cliquez sur la croix)
2. **Rouvrez** PowerShell
3. **Naviguez** vers votre dossier de projet :
   ```bash
   cd "C:\Users\Fredd\OneDrive\Desktop\Appli DE dev"
   ```
4. **Vérifiez** que Git fonctionne :
   ```bash
   git --version
   ```

Vous devriez voir : `git version 2.x.x`

### Méthode 2 : Redémarrer l'ordinateur

Si la méthode 1 ne fonctionne pas :

1. **Redémarrez** votre ordinateur
2. **Rouvrez** PowerShell
3. **Naviguez** vers votre dossier de projet
4. **Testez** Git :
   ```bash
   git --version
   ```

---

## 🎯 Après le redémarrage

Une fois que `git --version` fonctionne, revenez me voir et je pourrai :

1. Initialiser Git dans votre projet
2. Ajouter tous les fichiers
3. Faire le premier commit
4. Vous guider pour pousser sur GitHub

---

## 📝 Commandes à exécuter

```bash
# Vérifier que Git fonctionne
git --version

# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit - Application OpéraFlow"
```

---

## 🎉 Dites-moi quand c'est fait !

Une fois que vous avez redémarré PowerShell et que `git --version` fonctionne, dites-le moi et je continuerai ! 😊

