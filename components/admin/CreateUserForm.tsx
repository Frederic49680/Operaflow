"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { UserPlus, Eye, EyeOff } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Role {
  id: string
  code: string
  label: string
}

interface CreateUserFormProps {
  onUserCreated?: () => void
}

export default function CreateUserForm({ onUserCreated }: CreateUserFormProps) {
  const [email, setEmail] = useState("")
  const [prenom, setPrenom] = useState("")
  const [nom, setNom] = useState("")
  const [roleId, setRoleId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [temporaryPassword, setTemporaryPassword] = useState("")
  const [roles, setRoles] = useState<Role[]>([])

  // Charger les rôles disponibles
  const loadRoles = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("roles")
        .select("id, code, label")
        .eq("system", false)
        .order("label")

      if (error) {
        console.error("Erreur chargement rôles:", error)
        return
      }

      setRoles(data || [])
    } catch (error) {
      console.error("Erreur chargement rôles:", error)
    }
  }

  // Charger les rôles au montage du composant
  useState(() => {
    loadRoles()
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !prenom || !nom) {
      toast.error("Tous les champs sont requis")
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch("/api/auth/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          prenom,
          nom,
          role_id: roleId || null
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Utilisateur créé avec succès")
        setTemporaryPassword(data.user.temporaryPassword)
        
        // Réinitialiser le formulaire
        setEmail("")
        setPrenom("")
        setNom("")
        setRoleId("")
        
        // Notifier le parent
        if (onUserCreated) {
          onUserCreated()
        }
      } else {
        toast.error(data.message || "Erreur lors de la création")
      }
    } catch (error) {
      console.error("Create user error:", error)
      toast.error("Erreur lors de la création de l'utilisateur")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/30">
            <UserPlus className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Créer un utilisateur
            </CardTitle>
            <CardDescription>
              Ajouter un nouvel utilisateur à l'application
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom *</Label>
              <Input
                id="prenom"
                placeholder="Jean"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nom">Nom *</Label>
              <Input
                id="nom"
                placeholder="Dupont"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="jean.dupont@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Rôle</Label>
            <Select value={roleId} onValueChange={setRoleId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? "Création..." : "Créer l'utilisateur"}
          </Button>
        </form>
        
        {temporaryPassword && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">🔐 Identifiants temporaires</h3>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Email:</strong> {email}
              </div>
              <div className="flex items-center gap-2">
                <strong>Mot de passe temporaire:</strong>
                <div className="flex items-center gap-2">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                    {showPassword ? temporaryPassword : "••••••••"}
                  </code>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <p className="text-xs text-yellow-700 mt-2">
              ⚠️ L'utilisateur devra changer ce mot de passe lors de sa première connexion.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
