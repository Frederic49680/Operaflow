import { redirect } from "next/navigation"

export default function HomePage() {
  // Pour l'instant, rediriger directement vers le dashboard
  // L'authentification sera implémentée avec le module Auth
  redirect("/dashboard")
}

