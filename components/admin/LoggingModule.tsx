"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, RefreshCw, Database, Users, Shield } from 'lucide-react'

interface LogEntry {
  timestamp: string
  level: 'info' | 'success' | 'warning' | 'error'
  message: string
  data?: any
}

export default function LoggingModule() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [stats, setStats] = useState<any>(null)

  const addLog = (level: LogEntry['level'], message: string, data?: any) => {
    const newLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
      data
    }
    setLogs(prev => [newLog, ...prev].slice(0, 50)) // Garder seulement les 50 derniers logs
  }

  const testConnection = async () => {
    setIsLoading(true)
    addLog('info', '🔍 Test de connexion à Supabase...')
    
    try {
      const supabase = createClient()
      
      // Test 1: Connexion de base
      addLog('info', '📡 Test de connexion de base...')
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) {
        addLog('warning', '⚠️ Pas d\'utilisateur authentifié (normal)', authError.message)
      } else {
        addLog('success', '✅ Connexion auth OK', user?.email || 'Anonyme')
      }

      // Test 2: Lecture des utilisateurs
      addLog('info', '👥 Test de lecture des utilisateurs...')
      const { data: users, error: usersError } = await supabase
        .from('app_users')
        .select(`
          *,
          user_roles(
            role_id,
            roles(code, label)
          )
        `)
        .limit(5)

      if (usersError) {
        addLog('error', '❌ Erreur lecture utilisateurs', usersError.message)
        setConnectionStatus('error')
      } else {
        addLog('success', `✅ ${users?.length || 0} utilisateurs lus`)
        setConnectionStatus('connected')
        setStats({
          users: users?.length || 0,
          usersWithRoles: users?.filter(u => u.user_roles?.length > 0).length || 0
        })
      }

      // Test 3: Lecture des rôles
      addLog('info', '🎭 Test de lecture des rôles...')
      const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .order('seniority_rank', { ascending: true })

      if (rolesError) {
        addLog('error', '❌ Erreur lecture rôles', rolesError.message)
      } else {
        addLog('success', `✅ ${roles?.length || 0} rôles lus`)
        setStats(prev => ({
          ...prev,
          roles: roles?.length || 0
        }))
      }

      // Test 4: Test de mise à jour
      addLog('info', '🔄 Test de mise à jour...')
      if (users && users.length > 0) {
        const testUser = users[0]
        const { error: updateError } = await supabase
          .from('app_users')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', testUser.id)

        if (updateError) {
          addLog('error', '❌ Erreur mise à jour utilisateur', updateError.message)
        } else {
          addLog('success', '✅ Mise à jour utilisateur OK')
        }
      }

      // Test 5: Variables d'environnement
      addLog('info', '🔧 Vérification des variables d\'environnement...')
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl) {
        addLog('error', '❌ NEXT_PUBLIC_SUPABASE_URL manquant')
      } else {
        addLog('success', '✅ NEXT_PUBLIC_SUPABASE_URL défini')
      }
      
      if (!supabaseKey) {
        addLog('error', '❌ NEXT_PUBLIC_SUPABASE_ANON_KEY manquant')
      } else {
        addLog('success', '✅ NEXT_PUBLIC_SUPABASE_ANON_KEY défini')
      }

    } catch (error) {
      addLog('error', '❌ Erreur générale', error instanceof Error ? error.message : 'Erreur inconnue')
      setConnectionStatus('error')
    } finally {
      setIsLoading(false)
    }
  }

  const clearLogs = () => {
    setLogs([])
    addLog('info', '🧹 Logs effacés')
  }

  useEffect(() => {
    addLog('info', '🚀 Module de logging initialisé')
    testConnection()
  }, [])

  const getLogIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />
      default: return <Database className="h-4 w-4 text-blue-500" />
    }
  }

  const getLogColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800'
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'error': return 'bg-red-50 border-red-200 text-red-800'
      default: return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  return (
    <div className="space-y-4">
      {/* Header avec stats */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
              <Database className="h-5 w-5" />
              Module de Logging - Admin Users
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={testConnection}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Test...' : 'Tester'}
              </Button>
              <Button
                onClick={clearLogs}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Effacer
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' : 
                connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <span className="text-sm font-medium">
                {connectionStatus === 'connected' ? 'Connecté' : 
                 connectionStatus === 'error' ? 'Erreur' : 'Vérification...'}
              </span>
            </div>
            
            {stats && (
              <div className="flex gap-4 text-sm">
                <Badge variant="outline" className="border-green-300 text-green-700">
                  <Users className="h-3 w-3 mr-1" />
                  {stats.users} utilisateurs
                </Badge>
                <Badge variant="outline" className="border-blue-300 text-blue-700">
                  <Shield className="h-3 w-3 mr-1" />
                  {stats.roles} rôles
                </Badge>
                <Badge variant="outline" className="border-purple-300 text-purple-700">
                  <Users className="h-3 w-3 mr-1" />
                  {stats.usersWithRoles} avec rôles
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-md font-semibold text-gray-800">
            Logs en temps réel ({logs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucun log disponible. Cliquez sur "Tester" pour commencer.
              </div>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border text-sm ${getLogColor(log.level)}`}
                >
                  <div className="flex items-start gap-2">
                    {getLogIcon(log.level)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs opacity-70">{log.timestamp}</span>
                        <span className="font-semibold">{log.message}</span>
                      </div>
                      {log.data && (
                        <div className="mt-1">
                          <pre className="text-xs bg-white bg-opacity-50 p-2 rounded border overflow-x-auto">
                            {typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
