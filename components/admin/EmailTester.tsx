"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface EmailTestResult {
  success: boolean
  message: string
  data?: any
}

export default function EmailTester() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<EmailTestResult | null>(null)
  const [testEmail, setTestEmail] = useState('test@example.com')

  const testActivationEmail = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'activation',
          userData: {
            email: testEmail,
            prenom: 'Test',
            nom: 'Utilisateur'
          }
        })
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: 'Email d\'activation envoyé avec succès',
          data: data.data
        })
      } else {
        setResult({
          success: false,
          message: data.error || 'Erreur lors de l\'envoi'
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Erreur de connexion: ' + (error instanceof Error ? error.message : 'Erreur inconnue')
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testResetEmail = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'reset',
          userData: {
            email: testEmail,
            prenom: 'Test',
            nom: 'Utilisateur'
          }
        })
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: 'Email de réinitialisation envoyé avec succès',
          data: data.data
        })
      } else {
        setResult({
          success: false,
          message: data.error || 'Erreur lors de l\'envoi'
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Erreur de connexion: ' + (error instanceof Error ? error.message : 'Erreur inconnue')
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-2 border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-green-800 flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Testeur d'Emails
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email de test */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email de test :
          </label>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="test@example.com"
          />
        </div>

        {/* Boutons de test */}
        <div className="flex gap-3">
          <Button
            onClick={testActivationEmail}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Test Email Activation
          </Button>

          <Button
            onClick={testResetEmail}
            disabled={isLoading}
            variant="outline"
            className="border-orange-300 text-orange-700 hover:bg-orange-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Test Email Reset
          </Button>
        </div>

        {/* Résultat */}
        {result && (
          <div className={`p-4 rounded-lg border ${
            result.success 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="font-semibold">
                {result.success ? 'Succès' : 'Erreur'}
              </span>
            </div>
            <p className="text-sm">{result.message}</p>
            
            {result.data && (
              <div className="mt-3 p-3 bg-white bg-opacity-50 rounded border">
                <h4 className="font-semibold text-sm mb-2">Données retournées :</h4>
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="text-sm text-gray-600 bg-white bg-opacity-50 p-3 rounded border">
          <h4 className="font-semibold mb-2">📧 Instructions :</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Modifiez l'email de test si nécessaire</li>
            <li>Cliquez sur "Test Email Activation" pour tester l'email d'activation</li>
            <li>Cliquez sur "Test Email Reset" pour tester l'email de réinitialisation</li>
            <li>Les emails sont actuellement simulés (pas d'envoi réel)</li>
            <li>Vérifiez la console pour voir les détails des emails générés</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
