// Test direct de l'API affaires

const testAPI = async () => {
  console.log("🧪 Test de l'API /api/affaires\n");

  const testData = {
    code_affaire: "TEST-API-002",
    nom: "Test API Affaires",
    site_id: null, // UUID invalide "1" → null
    responsable_id: null, // UUID invalide "1" → null
    client_id: null, // UUID invalide "1" → null
    competence_principale: "Électricité",
    num_commande: "CMD-API-002",
    type_affaire: "BPU",
    montant_total_ht: 50000,
    date_debut: "2025-01-01",
    date_fin_prevue: "2025-12-31",
    statut: "Brouillon",
    nb_ressources_ref: 2,
    heures_semaine_ref: 35,
    periode_debut: "2025-01-01",
    periode_fin: "2025-12-31",
  };

  console.log("📤 Données à envoyer:");
  console.log(JSON.stringify(testData, null, 2));
  console.log("\n");

  try {
    const response = await fetch("http://localhost:3000/api/affaires", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    console.log("📊 Réponse:");
    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);
    console.log("\n");

    const data = await response.json();
    console.log("📦 Body:");
    console.log(JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log("\n✅ SUCCÈS!");
    } else {
      console.log("\n❌ ERREUR");
    }
  } catch (error) {
    console.error("\n❌ ERREUR CRITIQUE:", error.message);
  }
};

testAPI();

