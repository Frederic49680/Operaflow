import { createClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

// GET - Récupérer les lots d'une affaire
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const affaireId = searchParams.get('affaire_id')

  if (!affaireId) {
    return NextResponse.json(
      { error: 'affaire_id requis' },
      { status: 400 }
    )
  }

  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('affaires_lots_financiers')
      .select('*')
      .eq('affaire_id', affaireId)
      .order('echeance_prevue', { ascending: true })

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Erreur lors de la récupération des lots:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des lots' },
      { status: 500 }
    )
  }
}

// POST - Créer un lot
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = createClient()

    const { data, error } = await supabase
      .from('affaires_lots_financiers')
      .insert([body])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Erreur lors de la création du lot:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du lot' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour un lot
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'id requis' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    const { data, error } = await supabase
      .from('affaires_lots_financiers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du lot:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du lot' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un lot
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json(
      { error: 'id requis' },
      { status: 400 }
    )
  }

  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('affaires_lots_financiers')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la suppression du lot:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du lot' },
      { status: 500 }
    )
  }
}

