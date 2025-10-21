'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { LotFormModal } from './LotFormModal'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Lot {
  id: string
  libelle: string
  montant_ht: number
  mode_facturation: string
  echeance_prevue: string
  numero_commande?: string
  commentaire?: string
}

interface LotsFinanciersTableProps {
  affaireId: string
}

export function LotsFinanciersTable({ affaireId }: LotsFinanciersTableProps) {
  const [lots, setLots] = useState<Lot[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedLot, setSelectedLot] = useState<Lot | undefined>(undefined)

  const loadLots = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/affaires/lots?affaire_id=${affaireId}`)
      const result = await response.json()

      if (result.success) {
        setLots(result.data || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des lots:', error)
      toast.error('Erreur lors du chargement des lots')
    } finally {
      setLoading(false)
    }
  }, [affaireId])

  useEffect(() => {
    loadLots()
  }, [affaireId, loadLots])

  const handleDelete = async (lotId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce lot ?')) {
      return
    }

    try {
      const response = await fetch(`/api/affaires/lots?id=${lotId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Lot supprimé avec succès')
        loadLots()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error('Erreur lors de la suppression du lot')
    }
  }

  const handleEdit = (lot: Lot, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setSelectedLot(lot)
    setShowModal(true)
  }

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedLot(undefined)
    setShowModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setSelectedLot(undefined)
  }

  const getModeFacturationLabel = (mode: string) => {
    const modes: Record<string, string> = {
      'a_l_avancement': 'À l\'avancement',
      'a_la_reception': 'À la réception',
      'echeancier': 'Échéancier'
    }
    return modes[mode] || mode
  }

  const getEcheanceBadge = (date: string) => {
    const echeance = new Date(date)
    const today = new Date()
    const diffDays = Math.ceil((echeance.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return <Badge variant="destructive">En retard</Badge>
    } else if (diffDays <= 7) {
      return <Badge variant="outline" className="bg-orange-100 text-orange-800">À échéance</Badge>
    } else {
      return <Badge variant="outline" className="bg-green-100 text-green-800">À venir</Badge>
    }
  }

  const totalMontant = lots.reduce((sum, lot) => sum + lot.montant_ht, 0)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Lots financiers</h3>
          <p className="text-sm text-muted-foreground">
            {lots.length} lot(s) • Total : {totalMontant.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>
        <Button onClick={(e) => handleAdd(e)} size="sm" type="button">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un lot
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Chargement...
        </div>
      ) : lots.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border rounded-lg">
          Aucun lot financier pour cette affaire
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Libellé</TableHead>
                <TableHead>Montant HT</TableHead>
                <TableHead>Mode de facturation</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead>N° commande</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lots.map((lot) => (
                <TableRow key={lot.id}>
                  <TableCell className="font-medium">{lot.libelle}</TableCell>
                  <TableCell>
                    {lot.montant_ht.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getModeFacturationLabel(lot.mode_facturation)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span>{format(new Date(lot.echeance_prevue), 'dd/MM/yyyy', { locale: fr })}</span>
                      {getEcheanceBadge(lot.echeance_prevue)}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lot.numero_commande || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={(e) => handleEdit(lot, e)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={(e) => handleDelete(lot.id, e)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <LotFormModal
        open={showModal}
        onClose={handleModalClose}
        onSuccess={loadLots}
        affaireId={affaireId}
        lot={selectedLot}
      />
    </div>
  )
}

