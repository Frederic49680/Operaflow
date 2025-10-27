// Script de test pour vérifier les variables d'environnement
const fs = require('fs');

// Lire directement le fichier .env.local
const envPath = '.env.local';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('📄 Contenu du fichier .env.local:');
  console.log(envContent);
  
  // Parser manuellement
  const lines = envContent.split('\n');
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const equalIndex = trimmedLine.indexOf('=');
      if (equalIndex > 0) {
        const key = trimmedLine.substring(0, equalIndex).trim();
        const value = trimmedLine.substring(equalIndex + 1).trim();
        process.env[key] = value;
        console.log(`✅ Chargé: ${key} = ${value}`);
      }
    }
  });
}

console.log('🔍 Test des variables d\'environnement:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Défini' : 'Manquant');

if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.log('✅ Variables d\'environnement chargées correctement');
} else {
  console.log('❌ Variables d\'environnement manquantes');
}
