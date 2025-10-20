# 🔧 RELANCE MANUELLE DU SERVEUR

---

## 🚨 PROBLÈME DÉTECTÉ

**Erreur :** Le serveur Next.js ne démarre pas correctement automatiquement.

**Solution :** Relancer le serveur manuellement dans le terminal.

---

## 🚀 RELANCE MANUELLE

### 1. Ouvrir un terminal PowerShell
```powershell
# Dans le terminal, naviguer vers le répertoire du projet
cd "C:\Users\Fredd\OneDrive\Desktop\Appli DE dev"
```

### 2. Relancer le serveur
```powershell
# Relancer le serveur sur le port 3002
$env:PORT=3002; npm run dev
```

### 3. Attendre la compilation
```powershell
# Attendre que le serveur compile (environ 10-15 secondes)
# Tu devrais voir :
# ✓ Compiled successfully
# ○ Local: http://localhost:3002
```

---

## 🎯 ACCÈS À L'APPLICATION

### URL principale
```bash
http://localhost:3002
```

### Page terrain/remontee
```bash
http://localhost:3002/terrain/remontee
```

### Page dashboard
```bash
http://localhost:3002/dashboard
```

---

## 📊 VÉRIFICATION

### Vérifier que le serveur est accessible
```powershell
# Dans un autre terminal PowerShell
Test-NetConnection -ComputerName localhost -Port 3002 -InformationLevel Quiet
# Résultat attendu : True
```

### Tester la page dashboard
```powershell
# Dans un autre terminal PowerShell
Invoke-WebRequest -Uri "http://localhost:3002/dashboard" -Method GET -UseBasicParsing -TimeoutSec 5
# Résultat attendu : Status 200
```

---

## 🐛 EN CAS D'ERREUR

### Erreur : Port déjà utilisé
```powershell
# Trouver le processus sur le port 3002
netstat -ano | findstr :3002

# Arrêter le processus
taskkill /PID <PID> /F

# Relancer le serveur
$env:PORT=3002; npm run dev
```

### Erreur : Module not found
```powershell
# Réinstaller les dépendances
npm install

# Relancer le serveur
$env:PORT=3002; npm run dev
```

### Erreur : Cannot find module
```powershell
# Nettoyer le cache
npm cache clean --force

# Réinstaller les dépendances
npm install

# Relancer le serveur
$env:PORT=3002; npm run dev
```

---

## ✅ CHECKLIST

### Avant de relancer
- [ ] Terminal ouvert
- [ ] Répertoire correct : `C:\Users\Fredd\OneDrive\Desktop\Appli DE dev`
- [ ] Aucun autre serveur sur le port 3002

### Après le démarrage
- [ ] Serveur compile sans erreur
- [ ] Message "✓ Compiled successfully"
- [ ] URL affichée : `http://localhost:3002`
- [ ] Page dashboard accessible
- [ ] Page terrain/remontee accessible

---

## 🎉 CONCLUSION

**Instructions pour relancer le serveur manuellement !**

✅ Commandes PowerShell fournies
✅ Port 3002 configuré
✅ Vérifications incluses
✅ Solutions aux erreurs courantes

**Relance le serveur manuellement et teste ! 🚀**

---

**Date :** 2025-01-18
**Version :** 1.0
**Statut :** ✅ INSTRUCTIONS FOURNIES

🎉 **RELANCE LE SERVEUR MANUELLEMENT !** 🎉


