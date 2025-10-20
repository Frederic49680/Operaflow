#!/usr/bin/env node

/**
 * Script de vérification avant déploiement Vercel
 * Usage: node check-deployment-ready.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la préparation au déploiement...\n');

let errors = [];
let warnings = [];
let success = [];

// 1. Vérifier package.json
console.log('📦 Vérification de package.json...');
if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (!packageJson.scripts || !packageJson.scripts.build) {
    errors.push('❌ Script "build" manquant dans package.json');
  } else {
    success.push('✅ Script "build" présent');
  }
  
  if (!packageJson.scripts || !packageJson.scripts.dev) {
    errors.push('❌ Script "dev" manquant dans package.json');
  } else {
    success.push('✅ Script "dev" présent');
  }
  
  if (!packageJson.dependencies || !packageJson.dependencies.next) {
    errors.push('❌ Next.js manquant dans les dépendances');
  } else {
    success.push(`✅ Next.js ${packageJson.dependencies.next} installé`);
  }
} else {
  errors.push('❌ package.json introuvable');
}

// 2. Vérifier vercel.json
console.log('⚙️  Vérification de vercel.json...');
if (fs.existsSync('vercel.json')) {
  const vercelJson = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  success.push('✅ vercel.json présent');
  
  if (vercelJson.env) {
    success.push('✅ Variables d\'environnement configurées dans vercel.json');
  }
} else {
  warnings.push('⚠️  vercel.json introuvable (optionnel mais recommandé)');
}

// 3. Vérifier .env.local
console.log('🔐 Vérification des variables d\'environnement...');
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  
  if (envContent.includes('NEXT_PUBLIC_SUPABASE_URL')) {
    success.push('✅ NEXT_PUBLIC_SUPABASE_URL définie');
  } else {
    errors.push('❌ NEXT_PUBLIC_SUPABASE_URL manquante dans .env.local');
  }
  
  if (envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
    success.push('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY définie');
  } else {
    errors.push('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY manquante dans .env.local');
  }
} else {
  errors.push('❌ .env.local introuvable');
}

// 4. Vérifier la structure des dossiers
console.log('📁 Vérification de la structure...');
const requiredDirs = ['app', 'components', 'lib'];
requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    success.push(`✅ Dossier ${dir}/ présent`);
  } else {
    errors.push(`❌ Dossier ${dir}/ manquant`);
  }
});

// 5. Vérifier les migrations SQL
console.log('🗄️  Vérification des migrations SQL...');
if (fs.existsSync('supabase/migrations')) {
  const migrations = fs.readdirSync('supabase/migrations')
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  if (migrations.length > 0) {
    success.push(`✅ ${migrations.length} migration(s) SQL trouvée(s)`);
    console.log(`   Migrations: ${migrations.join(', ')}`);
  } else {
    warnings.push('⚠️  Aucune migration SQL trouvée');
  }
} else {
  warnings.push('⚠️  Dossier supabase/migrations/ introuvable');
}

// 6. Vérifier les dépendances critiques
console.log('📚 Vérification des dépendances critiques...');
const criticalDeps = [
  'react',
  'react-dom',
  'next',
  '@supabase/supabase-js',
  '@radix-ui/react-dialog',
  'tailwindcss'
];

if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };
  
  criticalDeps.forEach(dep => {
    if (allDeps[dep]) {
      success.push(`✅ ${dep} installé`);
    } else {
      warnings.push(`⚠️  ${dep} non trouvé (peut être nécessaire)`);
    }
  });
}

// 7. Vérifier les fichiers de configuration Next.js
console.log('⚙️  Vérification de la configuration Next.js...');
if (fs.existsSync('next.config.js') || fs.existsSync('next.config.ts')) {
  success.push('✅ next.config présent');
} else {
  warnings.push('⚠️  next.config manquant (optionnel)');
}

if (fs.existsSync('tailwind.config.js') || fs.existsSync('tailwind.config.ts')) {
  success.push('✅ tailwind.config présent');
} else {
  warnings.push('⚠️  tailwind.config manquant (si vous utilisez Tailwind)');
}

// 8. Vérifier .gitignore
console.log('🔒 Vérification de .gitignore...');
if (fs.existsSync('.gitignore')) {
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  
  if (gitignore.includes('.env.local')) {
    success.push('✅ .env.local dans .gitignore');
  } else {
    warnings.push('⚠️  .env.local devrait être dans .gitignore');
  }
  
  if (gitignore.includes('node_modules')) {
    success.push('✅ node_modules dans .gitignore');
  }
} else {
  warnings.push('⚠️  .gitignore introuvable');
}

// Affichage des résultats
console.log('\n' + '='.repeat(60));
console.log('📊 RÉSULTATS DE LA VÉRIFICATION');
console.log('='.repeat(60) + '\n');

if (success.length > 0) {
  console.log('✅ SUCCÈS (' + success.length + ')');
  success.forEach(msg => console.log('  ' + msg));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  AVERTISSEMENTS (' + warnings.length + ')');
  warnings.forEach(msg => console.log('  ' + msg));
  console.log('');
}

if (errors.length > 0) {
  console.log('❌ ERREURS (' + errors.length + ')');
  errors.forEach(msg => console.log('  ' + msg));
  console.log('');
}

// Conclusion
console.log('='.repeat(60));
if (errors.length === 0) {
  console.log('🎉 Votre projet est prêt pour le déploiement !');
  console.log('\n📝 Prochaines étapes :');
  console.log('  1. Ajoutez les variables d\'environnement dans Vercel');
  console.log('  2. Appliquez les migrations SQL dans Supabase');
  console.log('  3. Déployez sur Vercel');
  console.log('\n📖 Consultez GUIDE_DEPLOIEMENT_VERCEL.md pour plus d\'infos');
  process.exit(0);
} else {
  console.log('❌ Des erreurs doivent être corrigées avant le déploiement');
  console.log('\n💡 Conseils :');
  console.log('  - Créez un fichier .env.local avec vos clés Supabase');
  console.log('  - Vérifiez que toutes les dépendances sont installées');
  console.log('  - Consultez les logs ci-dessus pour plus de détails');
  process.exit(1);
}

