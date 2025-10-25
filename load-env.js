// Script pour charger les variables d'environnement depuis .env.local
const fs = require('fs');
const path = require('path');

// Lire le fichier .env.local
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  console.log('📄 Contenu du fichier .env.local:');
  console.log(envContent);
  
  // Parser les variables d'environnement
  const envVars = {};
  envContent.split('\n').forEach((line, index) => {
    const trimmedLine = line.trim();
    console.log(`Ligne ${index + 1}: "${trimmedLine}"`);
    
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const equalIndex = trimmedLine.indexOf('=');
      if (equalIndex > 0) {
        const key = trimmedLine.substring(0, equalIndex).trim();
        const value = trimmedLine.substring(equalIndex + 1).trim();
        console.log(`  -> Clé: "${key}", Valeur: "${value}"`);
        envVars[key] = value;
      }
    }
  });
  
  console.log('🔍 Variables parsées:', envVars);
  
  // Injecter les variables dans process.env
  Object.keys(envVars).forEach(key => {
    process.env[key] = envVars[key];
    console.log(`✅ Injecté ${key} = ${process.env[key]}`);
  });
  
  console.log('✅ Variables d\'environnement chargées depuis .env.local:');
  console.log('  - NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Défini' : '❌ Manquant');
  console.log('  - NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Défini' : '❌ Manquant');
} else {
  console.log('❌ Fichier .env.local non trouvé');
}
