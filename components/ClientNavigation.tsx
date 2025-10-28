"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  Home, 
  Building, 
  GripVertical, 
  Users, 
  Settings,
  Calendar,
  FileText,
  GraduationCap,
  Menu,
  X,
  ChevronDown,
  UserCog,
  Shield,
  UserCheck,
  LogOut,
  User
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home
  },
  {
    name: "Affaires",
    href: "/affaires",
    icon: Building
  },
  {
    name: "Planning",
    href: "/planning",
    icon: GripVertical
  },
  {
    name: "RH",
    href: "/rh",
    icon: Users
  },
  {
    name: "Sites",
    href: "/sites",
    icon: Building
  },
  {
    name: "Maintenance",
    href: "/maintenance",
    icon: Calendar
  },
  {
    name: "Claims",
    href: "/claims",
    icon: FileText
  },
  {
    name: "Formations",
    href: "/rh/formations",
    icon: GraduationCap
  }
]

interface UserProfile {
  id: string
  email: string
  prenom: string
  nom: string
}

export default function ClientNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    
    // Récupérer l'utilisateur actuel
    const getUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (authUser) {
          // Récupérer le profil utilisateur
          const { data: profile } = await supabase
            .from('app_users')
            .select('id, email, prenom, nom')
            .eq('id', authUser.id)
            .single()
          
          if (profile) {
            setUser(profile)
          }
        }
      } catch (error) {
        console.error('Erreur récupération utilisateur:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        router.push('/auth/login')
      } else if (event === 'SIGNED_IN' && session?.user) {
        getUser()
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      toast.success("Déconnexion réussie")
    } catch (error) {
      console.error('Erreur déconnexion:', error)
      toast.error("Erreur lors de la déconnexion")
    }
  }

  // Ne pas afficher la navigation sur les pages d'auth
  if (pathname.startsWith('/auth/')) {
    return null
  }

  return (
    <nav className="bg-white border-b">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo et titre */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">OF</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">OperaFlow</h1>
              <p className="text-xs text-gray-500">Pilotage Opérationnel</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-lg font-bold text-gray-900">OperaFlow</h1>
            </div>
          </Link>

          {/* Navigation Desktop */}
          <div className="hidden lg:flex items-center gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`flex items-center gap-2 ${
                      isActive 
                        ? "bg-blue-600 text-white" 
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* Actions Desktop */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Menu Admin */}
            <div className="relative">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                className="flex items-center gap-1"
              >
                <Shield className="h-4 w-4" />
                Admin
                <ChevronDown className="h-3 w-3" />
              </Button>
              
              {isAdminMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border">
                  <div className="py-1">
                    <Link href="/admin/users" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <UserCog className="h-4 w-4 mr-2" />
                      Utilisateurs
                    </Link>
                    <Link href="/admin/roles" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Shield className="h-4 w-4 mr-2" />
                      Rôles & Permissions
                    </Link>
                    <Link href="/admin/access-requests" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <UserCheck className="h-4 w-4 mr-2" />
                      Demandes d'Accès
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Menu Utilisateur */}
            {!isLoading && (
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  {user ? `${user.prenom} ${user.nom}` : 'Utilisateur'}
                  <ChevronDown className="h-3 w-3" />
                </Button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-500 border-b">
                        {user?.email}
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Se déconnecter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Menu Mobile */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Menu Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t">
            <div className="pt-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={`w-full justify-start flex items-center gap-3 ${
                        isActive 
                          ? "bg-blue-600 text-white" 
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                )
              })}
              
              {/* Actions Mobile */}
              <div className="pt-4 border-t space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Admin
                </Button>
                {user && (
                  <div className="px-3 py-2 text-sm text-gray-600">
                    {user.prenom} {user.nom}
                  </div>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Se déconnecter
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
