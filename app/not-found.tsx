import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-slate-600 rounded-2xl flex items-center justify-center">
              <span className="text-white text-2xl font-bold">404</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Page introuvable
          </CardTitle>
          <CardDescription className="text-center">
            Désolé, la page que vous recherchez n'existe pas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-slate-600">
            <p className="text-sm">
              La page que vous essayez d'accéder n'existe pas ou a été déplacée.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

