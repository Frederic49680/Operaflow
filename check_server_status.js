const http = require('http');

function checkServer() {
    console.log('🔍 Vérification du statut du serveur...');
    
    const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/',
        method: 'GET',
        timeout: 5000
    };

    const req = http.request(options, (res) => {
        console.log(`✅ Serveur accessible sur le port 3001 (Status: ${res.statusCode})`);
        console.log('🌐 Vous pouvez maintenant ouvrir http://localhost:3001 dans votre navigateur');
        console.log('💡 Si l\'erreur competencies persiste, videz le cache du navigateur (Ctrl+Shift+R)');
    });

    req.on('error', (err) => {
        console.log('⏳ Serveur pas encore prêt, attendez quelques secondes...');
        console.log('🔄 Redémarrage en cours...');
    });

    req.on('timeout', () => {
        console.log('⏳ Timeout - le serveur démarre encore...');
    });

    req.setTimeout(5000);
    req.end();
}

// Vérifier immédiatement
checkServer();

// Vérifier à nouveau dans 5 secondes
setTimeout(checkServer, 5000);

// Vérifier une dernière fois dans 10 secondes
setTimeout(checkServer, 10000);

