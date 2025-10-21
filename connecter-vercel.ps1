# Script de connexion Vercel pour Operaflow

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   CONNEXION A VERCEL - Operaflow" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Verification Vercel CLI
Write-Host "[1] Verification Vercel CLI..." -ForegroundColor Yellow
$vercelVersion = vercel --version 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "    OK: Vercel CLI installe ($vercelVersion)" -ForegroundColor Green
} else {
    Write-Host "    ERREUR: Vercel CLI non installe" -ForegroundColor Red
    Write-Host "    Installer avec: npm install -g vercel" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Verification Git
Write-Host "[2] Verification Git..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "    ATTENTION: Fichiers non commites" -ForegroundColor Yellow
    Write-Host "    Commitez d'abord avec:" -ForegroundColor White
    Write-Host "    git add ." -ForegroundColor White
    Write-Host "    git commit -m 'votre message'" -ForegroundColor White
    Write-Host "    git push origin main" -ForegroundColor White
    Write-Host ""
    $continue = Read-Host "    Continuer quand meme ? (o/N)"
    if ($continue -ne "o" -and $continue -ne "O") {
        exit 0
    }
}
Write-Host "    OK: Repertoire propre ou ignore" -ForegroundColor Green
Write-Host ""

# Choix de la methode
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   CHOISISSEZ UNE METHODE" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option 1: Via Dashboard Vercel (RECOMMANDE)" -ForegroundColor Green
Write-Host "  - Plus simple et visuel" -ForegroundColor White
Write-Host "  - Configure tout automatiquement" -ForegroundColor White
Write-Host "  - Ideal pour premiere utilisation" -ForegroundColor White
Write-Host ""
Write-Host "Option 2: Via CLI Vercel" -ForegroundColor Yellow
Write-Host "  - Depuis ce terminal" -ForegroundColor White
Write-Host "  - Plus rapide si vous connaissez" -ForegroundColor White
Write-Host ""

$choix = Read-Host "Votre choix (1/2) "

if ($choix -eq "1") {
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Green
    Write-Host "   OPTION 1 : DASHBOARD VERCEL" -ForegroundColor Green
    Write-Host "================================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Etapes a suivre :" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Ouvrir dans votre navigateur :" -ForegroundColor White
    Write-Host "   https://vercel.com/new" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Importer depuis GitHub :" -ForegroundColor White
    Write-Host "   - Cliquer 'Import Git Repository'" -ForegroundColor White
    Write-Host "   - Selectionner 'Frederic49680/Operaflow'" -ForegroundColor White
    Write-Host "   - Cliquer 'Import'" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Configuration (IMPORTANT) :" -ForegroundColor White
    Write-Host "   Framework: Next.js (auto-detecte)" -ForegroundColor White
    Write-Host "   Install Command: npm install --legacy-peer-deps" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "4. Variables d'environnement (OBLIGATOIRE) :" -ForegroundColor Red
    Write-Host ""
    Write-Host "   NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Cyan
    Write-Host "   https://rrmvejpwbkwlmyjhnxaz.supabase.co" -ForegroundColor White
    Write-Host ""
    Write-Host "   NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Cyan
    Write-Host "   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow" -ForegroundColor White
    Write-Host ""
    Write-Host "5. Cliquer 'Deploy' et attendre 3-5 minutes" -ForegroundColor White
    Write-Host ""
    Write-Host "Ouvrir maintenant ? (o/N) " -NoNewline
    $ouvrir = Read-Host
    if ($ouvrir -eq "o" -or $ouvrir -eq "O") {
        Start-Process "https://vercel.com/new"
        Write-Host ""
        Write-Host "Navigateur ouvert !" -ForegroundColor Green
    }
    Write-Host ""
    Write-Host "Consultez GUIDE_CONNEXION_VERCEL.md pour plus de details" -ForegroundColor Cyan
    
} elseif ($choix -eq "2") {
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Yellow
    Write-Host "   OPTION 2 : CLI VERCEL" -ForegroundColor Yellow
    Write-Host "================================================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Je vais lancer: vercel" -ForegroundColor White
    Write-Host ""
    Write-Host "REPONSES A DONNER :" -ForegroundColor Cyan
    Write-Host "  Set up and deploy? → Y" -ForegroundColor White
    Write-Host "  Which scope? → [Votre compte]" -ForegroundColor White
    Write-Host "  Link to existing project? → N" -ForegroundColor White
    Write-Host "  Project name? → operaflow" -ForegroundColor White
    Write-Host "  Directory? → ./" -ForegroundColor White
    Write-Host "  Override settings? → N" -ForegroundColor White
    Write-Host ""
    Write-Host "Pret ? (o/N) " -NoNewline
    $pret = Read-Host
    if ($pret -eq "o" -or $pret -eq "O") {
        Write-Host ""
        Write-Host "Lancement de Vercel CLI..." -ForegroundColor Green
        Write-Host ""
        vercel
        
        Write-Host ""
        Write-Host "================================================================" -ForegroundColor Green
        Write-Host "   AJOUT DES VARIABLES D'ENVIRONNEMENT" -ForegroundColor Green
        Write-Host "================================================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Ajouter maintenant les variables ? (o/N) " -NoNewline
        $addEnv = Read-Host
        if ($addEnv -eq "o" -or $addEnv -eq "O") {
            Write-Host ""
            Write-Host "Ajout NEXT_PUBLIC_SUPABASE_URL..." -ForegroundColor Yellow
            Write-Host "https://rrmvejpwbkwlmyjhnxaz.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
            
            Write-Host ""
            Write-Host "Ajout NEXT_PUBLIC_SUPABASE_ANON_KEY..." -ForegroundColor Yellow
            Write-Host "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
            
            Write-Host ""
            Write-Host "Deploiement en production..." -ForegroundColor Yellow
            vercel --prod
        }
    } else {
        Write-Host ""
        Write-Host "Annule. Lancez manuellement: vercel" -ForegroundColor Yellow
    }
    
} else {
    Write-Host ""
    Write-Host "Choix invalide. Relancez le script." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "N'OUBLIEZ PAS :" -ForegroundColor Yellow
Write-Host "  1. Appliquer les 3 migrations Supabase" -ForegroundColor White
Write-Host "  2. Tester /tuiles-taches" -ForegroundColor White
Write-Host "  3. Verifier le Dashboard" -ForegroundColor White
Write-Host ""
Write-Host "Guide complet: GUIDE_CONNEXION_VERCEL.md" -ForegroundColor Cyan
Write-Host ""

