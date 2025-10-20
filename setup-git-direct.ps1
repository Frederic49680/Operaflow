# Script d'initialisation Git avec chemin direct

Write-Host "Initialisation de Git pour OperaFlow..." -ForegroundColor Cyan
Write-Host ""

# Ajouter Git au PATH de cette session
$env:Path += ";C:\Program Files\Git\cmd"

# Vérifier si Git fonctionne maintenant
Write-Host "Verification de Git..." -ForegroundColor Yellow
try {
    $gitVersion = & "C:\Program Files\Git\cmd\git.exe" --version
    if ($gitVersion) {
        Write-Host "Git est installe : $gitVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "Erreur lors de la verification de Git" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Initialiser Git
Write-Host "Initialisation de Git..." -ForegroundColor Yellow
& "C:\Program Files\Git\cmd\git.exe" init
Write-Host "Git initialise" -ForegroundColor Green
Write-Host ""

# Ajouter tous les fichiers
Write-Host "Ajout des fichiers..." -ForegroundColor Yellow
& "C:\Program Files\Git\cmd\git.exe" add .
Write-Host "Fichiers ajoutes" -ForegroundColor Green
Write-Host ""

# Faire le premier commit
Write-Host "Creation du premier commit..." -ForegroundColor Yellow
& "C:\Program Files\Git\cmd\git.exe" commit -m "Initial commit - Application OperaFlow"
Write-Host "Premier commit cree" -ForegroundColor Green
Write-Host ""

# Afficher le statut
Write-Host "Statut du repository :" -ForegroundColor Yellow
& "C:\Program Files\Git\cmd\git.exe" status
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
Write-Host '   & "C:\Program Files\Git\cmd\git.exe" remote add origin https://github.com/VOTRE-USERNAME/operaflow.git' -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Poussez votre code" -ForegroundColor White
Write-Host '   & "C:\Program Files\Git\cmd\git.exe" push -u origin main' -ForegroundColor Cyan
Write-Host ""
Write-Host "Note : Pour utiliser git directement, ajoutez au PATH :" -ForegroundColor Yellow
Write-Host "   C:\Program Files\Git\cmd" -ForegroundColor Cyan
Write-Host ""

