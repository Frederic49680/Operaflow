"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef } from "react"
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
  Shield
} from "lucide-react"

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

export default function Navigation() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false)
  const adminMenuRef = useRef<HTMLDivElement>(null)

  // Fermer le menu admin quand on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target as Node)) {
        setIsAdminMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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
            <div className="relative" ref={adminMenuRef}>
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
                  </div>
                </div>
              )}
            </div>
            <Button variant="outline" size="sm">
              Dashboard
            </Button>
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
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Dashboard
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
