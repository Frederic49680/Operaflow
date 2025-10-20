"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react"

interface BPUImportModalProps {
  children: React.ReactNode
  affaireId: string
  onImportComplete?: () => void
}

interface CSVRow {
  code_bpu: string
  libelle: string
  systeme_elementaire: string
  quantite: number
  unite: string
  pu: number
  pu_horaire?: number
  heures_equiv_unitaire?: number
}

export function BPUImportModal({ children, affaireId, onImportComplete }: BPUImportModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [csvText, setCsvText] = useState("")
  const [preview, setPreview] = useState<CSVRow[]>([])
  const [error, setError] = useState("")

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setCsvText(text)
      parseCSV(text)
    }
    reader.readAsText(file)
  }

  const parseCSV = (text: string) => {
    try {
      const lines = text.split("\n").filter((line) => line.trim())
      if (lines.length === 0) {
        setError("Le fichier CSV est vide")
        return
      }

      // En-têtes attendus
      const headers = lines[0].split(";").map((h) => h.trim())
      const expectedHeaders = [
        "code_bpu",
        "libelle",
        "systeme_elementaire",
        "quantite",
        "unite",
        "pu",
        "pu_horaire",
        "heures_equiv_unitaire",
      ]

      // Vérifier les en-têtes
      const missingHeaders = expectedHeaders.filter((h) => !headers.includes(h))
      if (missingHeaders.length > 0) {
        setError(`En-têtes manquants : ${missingHeaders.join(", ")}`)
        return
      }

      // Parser les lignes
      const rows: CSVRow[] = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(";").map((v) => v.trim())
        if (values.length < 6) continue // Ignorer les lignes incomplètes

        rows.push({
          code_bpu: values[0] || "",
          libelle: values[1] || "",
          systeme_elementaire: values[2] || "",
          quantite: parseFloat(values[3]) || 0,
          unite: values[4] || "unité",
          pu: parseFloat(values[5]) || 0,
          pu_horaire: values[6] ? parseFloat(values[6]) : undefined,
          heures_equiv_unitaire: values[7] ? parseFloat(values[7]) : undefined,
        })
      }

      setPreview(rows)
      setError("")
    } catch (err) {
      setError("Erreur lors du parsing du CSV")
      console.error(err)
    }
  }

  const handleImport = async () => {
    if (preview.length === 0) {
      setError("Aucune ligne à importer")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/bpu/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          affaire_id: affaireId,
          lignes: preview,
        }),
      })

      if (response.ok) {
        setOpen(false)
        setCsvText("")
        setPreview([])
        if (onImportComplete) onImportComplete()
      } else {
        setError("Erreur lors de l'import")
      }
    } catch (err) {
      setError("Erreur lors de l'import")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Importer BPU
          </DialogTitle>
          <DialogDescription>
            Importez les lignes du BPU depuis un fichier CSV
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format attendu */}
          <Alert className="border-blue-200 bg-blue-50">
            <FileText className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Format CSV attendu :</strong> code_bpu;libelle;systeme_elementaire;quantite;unite;pu;pu_horaire;heures_equiv_unitaire
              <br />
              <span className="text-xs">Séparateur : point-virgule (;)</span>
            </AlertDescription>
          </Alert>

          {/* Upload fichier */}
          <div className="grid gap-2">
            <Label htmlFor="csv-file" className="text-slate-700 font-medium">
              Fichier CSV
            </Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="border-slate-300"
            />
          </div>

          {/* Ou saisie manuelle */}
          <div className="grid gap-2">
            <Label htmlFor="csv-text" className="text-slate-700 font-medium">
              Ou coller le contenu CSV
            </Label>
            <Textarea
              id="csv-text"
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value)
                if (e.target.value) parseCSV(e.target.value)
              }}
              placeholder="code_bpu;libelle;systeme_elementaire;quantite;unite;pu;pu_horaire;heures_equiv_unitaire&#10;VIERGE;Activité libre;LAA001;0;heure;65;65;&#10;BPU001;Décharge semestriel;LAA001;1;unité;500;;"
              rows={6}
              className="font-mono text-xs"
            />
          </div>

          {/* Erreur */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Aperçu */}
          {preview.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <Label className="text-slate-700 font-medium">
                  Aperçu ({preview.length} lignes)
                </Label>
              </div>
              <div className="border rounded-lg overflow-auto max-h-64">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 sticky top-0">
                    <tr>
                      <th className="p-2 text-left">Code BPU</th>
                      <th className="p-2 text-left">Libellé</th>
                      <th className="p-2 text-left">Système Élémentaire</th>
                      <th className="p-2 text-right">Quantité</th>
                      <th className="p-2 text-left">Unité</th>
                      <th className="p-2 text-right">PU</th>
                      <th className="p-2 text-right">PU Horaire</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, index) => (
                      <tr key={index} className="border-t hover:bg-slate-50">
                        <td className="p-2 font-mono">{row.code_bpu}</td>
                        <td className="p-2">{row.libelle}</td>
                        <td className="p-2 font-mono">{row.systeme_elementaire}</td>
                        <td className="p-2 text-right">{row.quantite}</td>
                        <td className="p-2">{row.unite}</td>
                        <td className="p-2 text-right">{row.pu}€</td>
                        <td className="p-2 text-right">{row.pu_horaire || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={loading || preview.length === 0}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Upload className="h-4 w-4 mr-2" />
            {loading ? "Import..." : `Importer ${preview.length} lignes`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

