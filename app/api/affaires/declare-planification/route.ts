import { createClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

// POST - Déclarer la planification d'une affaire
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { affaire_id, date_debut, date_fin, responsable_planification } = body

    console.log('📥 API: Données reçues:', { affaire_id, date_debut, date_fin, responsable_planification })

    if (!affaire_id || !date_debut || !date_fin) {
      return NextResponse.json(
        { error: 'affaire_id, date_debut et date_fin requis' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Récupérer les dates de l'affaire pour comparaison
    const { data: affaireData, error: affaireError } = await supabase
      .from('affaires')
      .select('id, nom, date_debut, date_fin_prevue, statut')
      .eq('id', affaire_id)
      .single()

    if (affaireError) {
      console.error('❌ Erreur récupération affaire:', affaireError)
      throw affaireError
    }

    console.log('📋 API: Affaire récupérée:', affaireData)

    // Appeler la fonction PostgreSQL
    const { data, error } = await supabase.rpc('fn_declare_planification', {
      p_affaire_id: affaire_id,
      p_date_debut: date_debut,
      p_date_fin: date_fin,
      p_responsable_planification: responsable_planification || null
    })

    console.log('📤 API: Réponse RPC:', { data, error })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erreur lors de la déclaration de planification:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la déclaration de planification' },
      { status: 500 }
    )
  }
}

