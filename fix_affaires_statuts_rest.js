const https = require('https')

// Configuration Supabase
const supabaseUrl = 'https://rrmvejpwbkwlmyjhnxaz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybXZlanB3Ymt3bG15amhueGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTM1NDEsImV4cCI6MjA3NjM2OTU0MX0.8TVMKeCBR3yg2iKlqypOD7zPqIPYYMi2xwHubNPF_Ow'

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ sql })
    
    const options = {
      hostname: 'rrmvejpwbkwlmyjhnxaz.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      }
    }

    const req = https.request(options, (res) => {
      let responseData = ''
      
      res.on('data', (chunk) => {
        responseData += chunk
      })
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData)
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(result)
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${responseData}`))
          }
        } catch (e) {
          reject(new Error(`Parse error: ${responseData}`))
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.write(data)
    req.end()
  })
}

async function fixAffairesStatuts() {
  console.log('🔧 Correction des statuts des affaires via API REST...')
  
  try {
    // 1. Supprimer la contrainte existante
    console.log('1. Suppression de la contrainte existante...')
    try {
      await executeSQL('ALTER TABLE affaires DROP CONSTRAINT IF EXISTS affaires_statut_check;')
      console.log('✅ Contrainte supprimée')
    } catch (error) {
      console.log('⚠️ Erreur lors de la suppression (peut être normal):', error.message)
    }

    // 2. Créer la nouvelle contrainte
    console.log('2. Création de la nouvelle contrainte...')
    await executeSQL(`ALTER TABLE affaires ADD CONSTRAINT affaires_statut_check 
                     CHECK (statut IN ('Brouillon', 'A_planifier', 'Validée', 'Planifiée', 'En suivi', 'Clôturée'));`)
    console.log('✅ Nouvelle contrainte créée')

    console.log('🎉 Correction des statuts terminée avec succès !')
    console.log('📋 Statuts autorisés: Brouillon, A_planifier, Validée, Planifiée, En suivi, Clôturée')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
}

// Exécuter la correction
fixAffairesStatuts()
