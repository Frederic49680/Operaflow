// Script pour ajouter des clients supplémentaires
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rrmvejpwbkwlmyjhnxaz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'
);

async function addClients() {
  const clients = [
    {
      nom_client: 'TotalEnergies',
      siret: '12345678901238',
      adresse: '2 place Jean Millier, 92078 Paris La Défense',
      code_postal: '92078',
      ville: 'Paris La Défense',
      telephone: '01 47 44 45 46',
      email: 'contact@totalenergies.com',
      categorie: 'MOA',
      actif: true
    },
    {
      nom_client: 'Vinci Energies',
      siret: '12345678901239',
      adresse: '1 cours Ferdinand de Lesseps, 92500 Rueil-Malmaison',
      code_postal: '92500',
      ville: 'Rueil-Malmaison',
      telephone: '01 47 16 35 00',
      email: 'contact@vinci-energies.fr',
      categorie: 'MOE',
      actif: true
    }
  ];

  try {
    const { data, error } = await supabase
      .from('clients')
      .insert(clients)
      .select();
    
    if (error) {
      console.log('Erreur:', error.message);
    } else {
      console.log('Clients ajoutés:', data.length);
      data.forEach(client => {
        console.log('- ' + client.nom_client);
      });
    }
  } catch (err) {
    console.log('Erreur:', err.message);
  }
}

addClients();
