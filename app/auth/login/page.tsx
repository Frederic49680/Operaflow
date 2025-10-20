import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-2xl border-slate-200">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30">
              <span className="text-white text-3xl font-bold">OF</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Bienvenue sur OperaFlow
          </CardTitle>
          <CardDescription className="text-center text-slate-600">
            Connectez-vous à votre compte pour accéder au système de pilotage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                required
                className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-700 font-medium">Mot de passe</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
                >
                  Oublié ?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
            <Button type="submit" className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all">
              Se connecter
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-slate-600">
            <p>
              Pas encore de compte ?{" "}
              <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors">
                Demander un accès
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

