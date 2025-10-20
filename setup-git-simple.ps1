# Script d'initialisation Git automatique pour OperaFlow

Write-Host "Initialisation de Git pour OperaFlow..." -ForegroundColor Cyan
Write-Host ""

# Vérifier si Git est installé
Write-Host "Verification de Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version 2>$null
    if ($gitVersion) {
        Write-Host "Git est installe : $gitVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "Git n'est pas installe ou pas dans le PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Veuillez installer Git depuis : https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "Ou redemarrez PowerShell apres l'installation." -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Initialiser Git
Write-Host "Initialisation de Git..." -ForegroundColor Yellow
git init
Write-Host "Git initialise" -ForegroundColor Green
Write-Host ""

# Ajouter tous les fichiers
Write-Host "Ajout des fichiers..." -ForegroundColor Yellow
git add .
Write-Host "Fichiers ajoutes" -ForegroundColor Green
Write-Host ""

# Faire le premier commit
Write-Host "Creation du premier commit..." -ForegroundColor Yellow
git commit -m "Initial commit - Application OperaFlow"
Write-Host "Premier commit cree" -ForegroundColor Green
Write-Host ""

# Afficher le statut
Write-Host "Statut du repository :" -ForegroundColor Yellow
git status
Write-Host ""

# Instructions pour GitHub
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Git est maintenant initialise !" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prochaines etapes :" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Creez un repository sur GitHub" -ForegroundColor White
Write-Host "   Allez sur https://github.com" -ForegroundColor Cyan
Write-Host "   Cliquez sur + puis New repository" -ForegroundColor Cyan
Write-Host "   Nom : operaflow" -ForegroundColor Cyan
Write-Host "   Visibilite : Private" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Connectez votre projet a GitHub" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/VOTRE-USERNAME/operaflow.git" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Poussez votre code" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor Cyan
Write-Host ""

