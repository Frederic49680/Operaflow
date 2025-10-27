// Script pour démarrer le serveur de développement sur le port 3001
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Démarrage du serveur de développement sur le port 3001...');

// Démarrer Next.js sur le port 3001
const nextProcess = spawn('npx', ['next', 'dev', '-p', '3001'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

nextProcess.on('error', (error) => {
  console.error('❌ Erreur lors du démarrage:', error);
});

nextProcess.on('close', (code) => {
  console.log(`📋 Processus terminé avec le code: ${code}`);
});

// Gestion de l'arrêt propre
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...');
  nextProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt du serveur...');
  nextProcess.kill('SIGTERM');
  process.exit(0);
});

console.log('✅ Serveur démarré sur http://localhost:3001');
console.log('📝 Appuyez sur Ctrl+C pour arrêter le serveur');

