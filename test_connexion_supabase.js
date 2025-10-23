// Test de connexion Supabase depuis le frontend
// Exécutez ce script dans la console du navigateur sur votre site

console.log('🔍 Test de connexion Supabase...');

// Test 1: Vérifier que Supabase est chargé
if (typeof window !== 'undefined' && window.supabase) {
    console.log('✅ Supabase est chargé');
} else {
    console.log('❌ Supabase n\'est pas chargé');
}

// Test 2: Tester une requête simple
async function testSupabaseConnection() {
    try {
        // Import dynamique de Supabase (adaptez selon votre setup)
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        
        console.log('🔗 Client Supabase créé');
        
        // Test de lecture
        const { data: sites, error: readError } = await supabase
            .from('sites')
            .select('id, nom, code_site')
            .limit(5);
            
        if (readError) {
            console.error('❌ Erreur de lecture:', readError);
            return false;
        }
        
        console.log('✅ Lecture réussie:', sites);
        
        // Test d'écriture (création d'un site de test)
        const testSite = {
            nom: 'Site Test Connexion',
            code_site: 'TEST_' + Date.now(),
            statut: 'Actif'
        };
        
        const { data: newSite, error: writeError } = await supabase
            .from('sites')
            .insert(testSite)
            .select();
            
        if (writeError) {
            console.error('❌ Erreur d\'écriture:', writeError);
            return false;
        }
        
        console.log('✅ Écriture réussie:', newSite);
        
        // Nettoyage - supprimer le site de test
        const { error: deleteError } = await supabase
            .from('sites')
            .delete()
            .eq('id', newSite[0].id);
            
        if (deleteError) {
            console.error('⚠️ Erreur de suppression du site de test:', deleteError);
        } else {
            console.log('✅ Nettoyage réussi');
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Erreur générale:', error);
        return false;
    }
}

// Test 3: Vérifier les variables d'environnement
function checkEnvironment() {
    console.log('🔍 Variables d\'environnement:');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'Non définie');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Définie' : 'Non définie');
}

// Exécuter les tests
console.log('🚀 Démarrage des tests...');
checkEnvironment();
testSupabaseConnection().then(success => {
    if (success) {
        console.log('🎉 Tous les tests sont passés ! La connexion Supabase fonctionne.');
    } else {
        console.log('💥 Des problèmes ont été détectés avec la connexion Supabase.');
    }
});
