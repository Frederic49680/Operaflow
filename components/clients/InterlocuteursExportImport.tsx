"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Download, Upload, FileSpreadsheet } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface InterlocuteursExportImportProps {
  onDataChange?: () => void
}

export function InterlocuteursExportImport({ onDataChange }: InterlocuteursExportImportProps) {
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = async () => {
    try {
      setExporting(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('interlocuteurs')
        .select(`
          nom,
          prenom,
          fonction,
          type_interlocuteur,
          email,
          telephone,
          disponibilite,
          notes,
          actif,
          clients!inner(nom_client),
          sites(nom)
        `)
        .order('nom')

      if (error) {
        throw error
      }

      // Convertir en CSV
      const csvContent = convertToCSV(data || [])
      
      // Télécharger le fichier
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `interlocuteurs_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success("Export réalisé avec succès")
    } catch (error) {
      console.error('Erreur export:', error)
      toast.error("Erreur lors de l'export")
    } finally {
      setExporting(false)
    }
  }

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return ""

    const headers = [
      'Nom',
      'Prénom', 
      'Fonction',
      'Type',
      'Email',
      'Téléphone',
      'Disponibilité',
      'Notes',
      'Client',
      'Site',
      'Actif'
    ]

    const csvRows = [
      headers.join(','),
      ...data.map(row => [
        `"${row.nom || ''}"`,
        `"${row.prenom || ''}"`,
        `"${row.fonction || ''}"`,
        `"${row.type_interlocuteur || ''}"`,
        `"${row.email || ''}"`,
        `"${row.telephone || ''}"`,
        `"${row.disponibilite || ''}"`,
        `"${row.notes || ''}"`,
        `"${(row.clients as any)?.nom_client || ''}"`,
        `"${(row.sites as any)?.nom || ''}"`,
        `"${row.actif ? 'Oui' : 'Non'}"`
      ].join(','))
    ]

    return csvRows.join('\n')
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setImporting(true)
      const text = await file.text()
      const lines = text.split('\n')
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
      
      // Validation des en-têtes
      const requiredHeaders = ['Nom', 'Prénom', 'Email']
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
      
      if (missingHeaders.length > 0) {
        toast.error(`En-têtes manquantes: ${missingHeaders.join(', ')}`)
        return
      }

      const supabase = createClient()
      const interlocuteurs = []

      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim())
          const row: any = {}
          
          headers.forEach((header, index) => {
            row[header.toLowerCase().replace('é', 'e').replace('è', 'e')] = values[index] || ''
          })

          // Récupérer l'ID du client
          let clientId = null
          if (row.client) {
            const { data: client } = await supabase
              .from('clients')
              .select('id')
              .eq('nom_client', row.client)
              .single()
            clientId = client?.id
          }

          // Récupérer l'ID du site
          let siteId = null
          if (row.site) {
            const { data: site } = await supabase
              .from('sites')
              .select('id')
              .eq('nom', row.site)
              .single()
            siteId = site?.id
          }

          interlocuteurs.push({
            nom: row.nom,
            prenom: row.prenom,
            fonction: row.fonction,
            type_interlocuteur: row.type || 'Autre',
            email: row.email,
            telephone: row.telephone,
            disponibilite: row.disponibilite,
            notes: row.notes,
            client_id: clientId,
            site_id: siteId,
            actif: row.actif === 'Oui' || row.actif === 'true'
          })
        }
      }

      if (interlocuteurs.length > 0) {
        const { error } = await supabase
          .from('interlocuteurs')
          .insert(interlocuteurs)

        if (error) {
          throw error
        }

        toast.success(`${interlocuteurs.length} interlocuteurs importés avec succès`)
        onDataChange?.()
      }
    } catch (error) {
      console.error('Erreur import:', error)
      toast.error("Erreur lors de l'import")
    } finally {
      setImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Export */}
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2"
        onClick={handleExport}
        disabled={exporting}
      >
        <Download className="h-4 w-4" />
        {exporting ? "Export..." : "Exporter"}
      </Button>

      {/* Import */}
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleImport}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={importing}
        />
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          disabled={importing}
        >
          <Upload className="h-4 w-4" />
          {importing ? "Import..." : "Importer"}
        </Button>
      </div>

      {/* Template */}
      <Button 
        variant="outline" 
        size="sm" 
        className="gap-2"
        onClick={() => {
          const template = "Nom,Prénom,Fonction,Type,Email,Téléphone,Disponibilité,Notes,Client,Site,Actif\n\"Dupont\",\"Jean\",\"Responsable\",\"Technique\",\"jean.dupont@client.com\",\"+33 6 12 34 56 78\",\"9h-17h\",\"Notes\",\"SMIPE\",\"Site A\",\"Oui\""
          const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' })
          const link = document.createElement('a')
          const url = URL.createObjectURL(blob)
          link.setAttribute('href', url)
          link.setAttribute('download', 'template_interlocuteurs.csv')
          link.style.visibility = 'hidden'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }}
      >
        <FileSpreadsheet className="h-4 w-4" />
        Template
      </Button>
    </div>
  )
}
