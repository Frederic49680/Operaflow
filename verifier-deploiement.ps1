# Script de vérification post-déploiement
# Tuiles Tâches v2

Write-Host "🔍 Vérification du déploiement Tuiles Tâches v2" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier que Git est à jour
Write-Host "1️⃣ Vérification Git..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "   ⚠️  Fichiers non commités détectés" -ForegroundColor Red
    git status --short
} else {
    Write-Host "   ✅ Répertoire Git propre" -ForegroundColor Green
}
Write-Host ""

# 2. Vérifier le dernier commit
Write-Host "2️⃣ Dernier commit..." -ForegroundColor Yellow
$lastCommit = git log -1 --oneline
Write-Host "   $lastCommit" -ForegroundColor White
Write-Host ""

# 3. Vérifier la branche
Write-Host "3️⃣ Branche actuelle..." -ForegroundColor Yellow
$branch = git branch --show-current
Write-Host "   📍 $branch" -ForegroundColor White
Write-Host ""

# 4. Vérifier que tout est pushé
Write-Host "4️⃣ Vérification push..." -ForegroundColor Yellow
$unpushed = git log origin/main..HEAD --oneline
if ($unpushed) {
    Write-Host "   ⚠️  Commits non poussés détectés" -ForegroundColor Red
    Write-Host $unpushed
} else {
    Write-Host "   ✅ Tous les commits sont sur GitHub" -ForegroundColor Green
}
Write-Host ""

# 5. Vérifier les fichiers clés du nouveau module
Write-Host "5️⃣ Fichiers du nouveau module..." -ForegroundColor Yellow
$fichiersCles = @(
    "app\tuiles-taches\page.tsx",
    "components\tuiles-taches\TuilesTaches.tsx",
    "components\tuiles-taches\AffairesAPlanifier.tsx",
    "supabase\migrations\039_create_tuiles_taches_v2.sql"
)

$allOk = $true
foreach ($fichier in $fichiersCles) {
    if (Test-Path $fichier) {
        Write-Host "   ✅ $fichier" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $fichier manquant" -ForegroundColor Red
        $allOk = $false
    }
}
Write-Host ""

# 6. Vérifier que l'ancien module a été supprimé
Write-Host "6️⃣ Suppression ancien module Gantt..." -ForegroundColor Yellow
if (Test-Path "app\gantt\page.tsx") {
    Write-Host "   ⚠️  L'ancien fichier gantt/page.tsx existe encore" -ForegroundColor Red
} else {
    Write-Host "   ✅ Ancien module correctement supprimé" -ForegroundColor Green
}
Write-Host ""

# 7. Vérifier les migrations
Write-Host "7️⃣ Migrations Supabase..." -ForegroundColor Yellow
$migrations = @(
    "supabase\migrations\037_fix_trigger_parapluie_dates.sql",
    "supabase\migrations\038_fix_function_parapluie_dates.sql",
    "supabase\migrations\039_create_tuiles_taches_v2.sql"
)

foreach ($migration in $migrations) {
    if (Test-Path $migration) {
        $lignes = (Get-Content $migration).Count
        Write-Host "   ✅ $(Split-Path $migration -Leaf) ($lignes lignes)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $(Split-Path $migration -Leaf) manquant" -ForegroundColor Red
        $allOk = $false
    }
}
Write-Host ""

# 8. Vérifier package.json
Write-Host "8️⃣ Dépendances package.json..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    $package = Get-Content "package.json" -Raw | ConvertFrom-Json
    Write-Host "   📦 Nom: $($package.name)" -ForegroundColor White
    Write-Host "   🔢 Version: $($package.version)" -ForegroundColor White
    Write-Host "   ✅ package.json OK" -ForegroundColor Green
} else {
    Write-Host "   ❌ package.json manquant" -ForegroundColor Red
    $allOk = $false
}
Write-Host ""

# 9. Résumé final
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""
if ($allOk -and !$gitStatus -and !$unpushed) {
    Write-Host "✅ DÉPLOIEMENT PRÊT" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Prochaines étapes :" -ForegroundColor Yellow
    Write-Host "   1. Vérifier le déploiement Vercel : https://vercel.com/dashboard" -ForegroundColor White
    Write-Host "   2. Appliquer les migrations Supabase (voir DEPLOIEMENT_TUILES_TACHES_V2.md)" -ForegroundColor White
    Write-Host "   3. Tester la page /tuiles-taches" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "⚠️  ATTENTION : Quelques problèmes détectés" -ForegroundColor Yellow
    Write-Host "   Consultez les détails ci-dessus" -ForegroundColor White
    Write-Host ""
}

Write-Host "Guide complet : DEPLOIEMENT_TUILES_TACHES_V2.md" -ForegroundColor Cyan
Write-Host ""

