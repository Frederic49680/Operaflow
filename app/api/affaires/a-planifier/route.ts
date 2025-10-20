import { createClient } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

// GET - Récupérer les affaires en attente de planification
export async function GET() {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('affaires')
      .select(`
        *,
        sites:site_id (
          id,
          nom,
          code_site
        ),
        clients:client_id (
          id,
          nom_client
        ),
        ressources:responsable_id (
          id,
          nom,
          prenom
        )
      `)
      .eq('statut', 'A_planifier')
      .order('code_affaire', { ascending: true })

    if (error) throw error

    // Récupérer les lots financiers pour chaque affaire
    const affaireIds = data?.map((a: any) => a.id) || []
    const { data: lotsData } = await supabase
      .from('affaires_lots_financiers')
      .select('affaire_id, montant_ht')
      .in('affaire_id', affaireIds)

    // Créer un Map pour compter les lots par affaire
    const lotsByAffaire = new Map<string, { count: number; total: number }>()
    lotsData?.forEach((lot: any) => {
      const current = lotsByAffaire.get(lot.affaire_id) || { count: 0, total: 0 }
      lotsByAffaire.set(lot.affaire_id, {
        count: current.count + 1,
        total: current.total + (lot.montant_ht || 0)
      })
    })

    // Transformer les données pour aplatir les relations
    const formattedData = data?.map((affaire: any) => {
      const lotsInfo = lotsByAffaire.get(affaire.id) || { count: 0, total: 0 }
      return {
        ...affaire,
        site_nom: affaire.sites?.nom || 'N/A',
        site_code: affaire.sites?.code_site || 'N/A',
        client_nom: affaire.clients?.nom_client || 'N/A',
        responsable_nom: affaire.ressources ? `${affaire.ressources.prenom} ${affaire.ressources.nom}` : 'N/A',
        nb_lots_financiers: lotsInfo.count,
        montant_lots_ht: lotsInfo.total,
      }
    }) || []

    return NextResponse.json({ success: true, data: formattedData })
  } catch (error) {
    console.error('Erreur lors de la récupération des affaires à planifier:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des affaires à planifier' },
      { status: 500 }
    )
  }
}

