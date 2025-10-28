"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { UserPlus, Mail } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [prenom, setPrenom] = useState("")
  const [nom, setNom] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !prenom || !nom) {
      toast.error("Email, prénom et nom sont requis")
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch("/api/auth/access-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          prenom,
          nom,
          message: message || "Demande d'accès à OperaFlow"
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Demande d'accès envoyée avec succès")
        setIsSent(true)
      } else {
        toast.error(data.message || "Erreur lors de l'envoi de la demande")
      }
    } catch (error) {
      console.error("Access request error:", error)
      toast.error("Erreur lors de l'envoi de la demande")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md shadow-green-500/30">
                <Mail className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
              Demande envoyée
            </CardTitle>
            <CardDescription>
              Votre demande d'accès a été transmise à l'administrateur
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-6">
              Vous recevrez un email de confirmation une fois votre demande traitée par l'administrateur.
            </p>
            
            <div className="space-y-2">
              <Button 
                onClick={() => setIsSent(false)}
                variant="outline" 
                className="w-full"
              >
                Nouvelle demande
              </Button>
              
              <Link href="/auth/login">
                <Button variant="ghost" className="w-full">
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/30">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Demande d'accès
          </CardTitle>
          <CardDescription>
            Demandez l'accès à Operaflow pour gérer vos projets
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="message">Message (optionnel)</Label>
              <Textarea
                id="message"
                placeholder="Expliquez pourquoi vous avez besoin d'accès à OperaFlow..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? "Envoi..." : "Envoyer la demande"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Déjà un compte ?{" "}
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
