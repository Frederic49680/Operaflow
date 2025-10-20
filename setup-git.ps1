# Script d'initialisation Git automatique pour OpéraFlow
# Ce script va initialiser Git, ajouter tous les fichiers et préparer le premier commit

Write-Host "🚀 Initialisation de Git pour OpéraFlow..." -ForegroundColor Cyan
Write-Host ""

# Vérifier si Git est installé
Write-Host "📦 Vérification de Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version 2>$null
    if ($gitVersion) {
        Write-Host "✅ Git est installé : $gitVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Git n'est pas installé ou pas dans le PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Veuillez installer Git depuis : https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "Ou redémarrez PowerShell après l'installation." -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Initialiser Git
Write-Host "🔧 Initialisation de Git..." -ForegroundColor Yellow
git init
Write-Host "✅ Git initialisé" -ForegroundColor Green
Write-Host ""

# Ajouter tous les fichiers
Write-Host "📁 Ajout des fichiers..." -ForegroundColor Yellow
git add .
Write-Host "✅ Fichiers ajoutés" -ForegroundColor Green
Write-Host ""

# Configurer Git (si pas déjà configuré)
Write-Host "⚙️  Configuration de Git..." -ForegroundColor Yellow

# Demander le nom d'utilisateur si pas configuré
$userName = git config --global user.name 2>$null
if (-not $userName) {
    Write-Host "Entrez votre nom d'utilisateur Git (ex: Fred Baudry) : " -NoNewline -ForegroundColor Cyan
    $newUserName = Read-Host
    if ($newUserName) {
        git config --global user.name "$newUserName"
        Write-Host "✅ Nom d'utilisateur configuré" -ForegroundColor Green
    }
}

# Demander l'email si pas configuré
$userEmail = git config --global user.email 2>$null
if (-not $userEmail) {
    Write-Host "Entrez votre email Git (ex: fred@example.com) : " -NoNewline -ForegroundColor Cyan
    $newUserEmail = Read-Host
    if ($newUserEmail) {
        git config --global user.email "$newUserEmail"
        Write-Host "✅ Email configuré" -ForegroundColor Green
    }
}

Write-Host ""

# Faire le premier commit
Write-Host "💾 Création du premier commit..." -ForegroundColor Yellow
git commit -m "Initial commit - Application OpéraFlow"
Write-Host "✅ Premier commit créé" -ForegroundColor Green
Write-Host ""

# Afficher le statut
Write-Host "📊 Statut du repository :" -ForegroundColor Yellow
git status
Write-Host ""

# Instructions pour GitHub
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "✅ Git est maintenant initialisé !" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Prochaines étapes :" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Créez un repository sur GitHub :" -ForegroundColor White
Write-Host "   → Allez sur https://github.com" -ForegroundColor Cyan
Write-Host "   → Cliquez sur + → New repository" -ForegroundColor Cyan
Write-Host "   → Nom : operaflow" -ForegroundColor Cyan
Write-Host "   → Visibilité : Private" -ForegroundColor Cyan
Write-Host "   → NE COCHEZ PAS Add a README" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Connectez votre projet à GitHub :" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/VOTRE-USERNAME/operaflow.git" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Poussez votre code :" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 Guide complet : GUIDE_GIT_GITHUB.md" -ForegroundColor Yellow
Write-Host ""

