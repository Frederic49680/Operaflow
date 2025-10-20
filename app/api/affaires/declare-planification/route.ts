import { createClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

// POST - Déclarer la planification d'une affaire
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { affaire_id, date_debut, date_fin, responsable_planification } = body

    if (!affaire_id || !date_debut || !date_fin) {
      return NextResponse.json(
        { error: 'affaire_id, date_debut et date_fin requis' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Appeler la fonction PostgreSQL
    const { data, error } = await supabase.rpc('fn_declare_planification', {
      p_affaire_id: affaire_id,
      p_date_debut: date_debut,
      p_date_fin: date_fin,
      p_responsable_planification: responsable_planification || null
    })

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

