const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Nettoyage du cache et rebuild complet...');

try {
    // 1. Supprimer le dossier .next (cache Next.js)
    const nextDir = path.join(__dirname, '.next');
    if (fs.existsSync(nextDir)) {
        console.log('🗑️ Suppression du dossier .next...');
        fs.rmSync(nextDir, { recursive: true, force: true });
        console.log('✅ Dossier .next supprimé');
    } else {
        console.log('ℹ️ Dossier .next n\'existe pas');
    }

    // 2. Supprimer node_modules/.cache si il existe
    const cacheDir = path.join(__dirname, 'node_modules', '.cache');
    if (fs.existsSync(cacheDir)) {
        console.log('🗑️ Suppression du cache node_modules...');
        fs.rmSync(cacheDir, { recursive: true, force: true });
        console.log('✅ Cache node_modules supprimé');
    }

    // 3. Nettoyer le cache npm
    console.log('🧹 Nettoyage du cache npm...');
    execSync('npm cache clean --force', { stdio: 'inherit' });
    console.log('✅ Cache npm nettoyé');

    console.log('\n✅ Nettoyage terminé! Vous pouvez maintenant redémarrer le serveur avec: npm run dev');

} catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error.message);
}

