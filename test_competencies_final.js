const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rrmvejpwbkwlmyjhnxaz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testCompetenciesFinal() {
    console.log('🔍 Test final de la requête competencies...');

    try {
        // Test de la requête corrigée (comme dans RHKPICards.tsx)
        console.log('\n1. 🎯 Test requête RHKPICards (corrigée)...');
        const { data: competencesData, error: competencesError } = await supabase
            .from('competencies')
            .select('code');

        if (competencesError) {
            console.error('❌ Erreur requête RHKPICards:', competencesError.message);
            return;
        }
        
        console.log(`✅ Requête RHKPICards réussie: ${competencesData.length} compétences`);
        console.log('📊 Données:', competencesData);

        // Test de la requête RHKPIDashboard (qui semble aussi correcte)
        console.log('\n2. 🎯 Test requête RHKPIDashboard...');
        const { data: competencesDashboard, error: competencesDashboardError } = await supabase
            .from('competencies')
            .select('code');

        if (competencesDashboardError) {
            console.error('❌ Erreur requête RHKPIDashboard:', competencesDashboardError.message);
            return;
        }
        
        console.log(`✅ Requête RHKPIDashboard réussie: ${competencesDashboard.length} compétences`);

        console.log('\n✅ Toutes les requêtes competencies fonctionnent correctement!');

    } catch (error) {
        console.error('❌ Erreur lors du test final:', error.message);
    }
}

testCompetenciesFinal();

