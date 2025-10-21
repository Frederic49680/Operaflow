# Script de verification post-deploiement - Tuiles Taches v2

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   Verification du deploiement Tuiles Taches v2" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verifier que Git est a jour
Write-Host "[1] Verification Git..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "    ATTENTION: Fichiers non commites detectes" -ForegroundColor Red
    git status --short
} else {
    Write-Host "    OK: Repertoire Git propre" -ForegroundColor Green
}
Write-Host ""

# 2. Verifier le dernier commit
Write-Host "[2] Dernier commit..." -ForegroundColor Yellow
$lastCommit = git log -1 --oneline
Write-Host "    $lastCommit" -ForegroundColor White
Write-Host ""

# 3. Verifier la branche
Write-Host "[3] Branche actuelle..." -ForegroundColor Yellow
$branch = git branch --show-current
Write-Host "    Branche: $branch" -ForegroundColor White
Write-Host ""

# 4. Verifier que tout est pushe
Write-Host "[4] Verification push..." -ForegroundColor Yellow
$unpushed = git log origin/main..HEAD --oneline
if ($unpushed) {
    Write-Host "    ATTENTION: Commits non pousses detectes" -ForegroundColor Red
    Write-Host $unpushed
} else {
    Write-Host "    OK: Tous les commits sont sur GitHub" -ForegroundColor Green
}
Write-Host ""

# 5. Verifier les fichiers cles du nouveau module
Write-Host "[5] Fichiers du nouveau module..." -ForegroundColor Yellow
$fichiersCles = @(
    "app\tuiles-taches\page.tsx",
    "components\tuiles-taches\TuilesTaches.tsx",
    "components\tuiles-taches\AffairesAPlanifier.tsx",
    "supabase\migrations\039_create_tuiles_taches_v2.sql"
)

$allOk = $true
foreach ($fichier in $fichiersCles) {
    if (Test-Path $fichier) {
        Write-Host "    OK: $fichier" -ForegroundColor Green
    } else {
        Write-Host "    ERREUR: $fichier manquant" -ForegroundColor Red
        $allOk = $false
    }
}
Write-Host ""

# 6. Verifier que l'ancien module a ete supprime
Write-Host "[6] Suppression ancien module Gantt..." -ForegroundColor Yellow
if (Test-Path "app\gantt\page.tsx") {
    Write-Host "    ATTENTION: L'ancien fichier gantt/page.tsx existe encore" -ForegroundColor Red
} else {
    Write-Host "    OK: Ancien module correctement supprime" -ForegroundColor Green
}
Write-Host ""

# 7. Verifier les migrations
Write-Host "[7] Migrations Supabase..." -ForegroundColor Yellow
$migrations = @(
    "supabase\migrations\037_fix_trigger_parapluie_dates.sql",
    "supabase\migrations\038_fix_function_parapluie_dates.sql",
    "supabase\migrations\039_create_tuiles_taches_v2.sql"
)

foreach ($migration in $migrations) {
    if (Test-Path $migration) {
        $lignes = (Get-Content $migration).Count
        $nom = Split-Path $migration -Leaf
        Write-Host "    OK: $nom ($lignes lignes)" -ForegroundColor Green
    } else {
        $nom = Split-Path $migration -Leaf
        Write-Host "    ERREUR: $nom manquant" -ForegroundColor Red
        $allOk = $false
    }
}
Write-Host ""

# 8. Verifier package.json
Write-Host "[8] Dependances package.json..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    $package = Get-Content "package.json" -Raw | ConvertFrom-Json
    Write-Host "    Nom: $($package.name)" -ForegroundColor White
    Write-Host "    Version: $($package.version)" -ForegroundColor White
    Write-Host "    OK: package.json valide" -ForegroundColor Green
} else {
    Write-Host "    ERREUR: package.json manquant" -ForegroundColor Red
    $allOk = $false
}
Write-Host ""

# 9. Resume final
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
if ($allOk -and !$gitStatus -and !$unpushed) {
    Write-Host ">>> DEPLOIEMENT PRET <<<" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines etapes :" -ForegroundColor Yellow
    Write-Host "  1. Verifier le deploiement Vercel : https://vercel.com/dashboard" -ForegroundColor White
    Write-Host "  2. Appliquer les migrations Supabase" -ForegroundColor White
    Write-Host "  3. Tester la page /tuiles-taches" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ">>> ATTENTION: Quelques problemes detectes <<<" -ForegroundColor Yellow
    Write-Host "Consultez les details ci-dessus" -ForegroundColor White
    Write-Host ""
}

Write-Host "Guide complet : DEPLOIEMENT_TUILES_TACHES_V2.md" -ForegroundColor Cyan
Write-Host ""

