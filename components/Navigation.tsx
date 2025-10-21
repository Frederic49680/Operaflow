"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  Home, 
  Building, 
  GripVertical, 
  Users, 
  Settings,
  Calendar,
  FileText
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
  }
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo et titre */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">OF</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">OperaFlow</h1>
              <p className="text-xs text-gray-500">Pilotage Opérationnel</p>
            </div>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-1">
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

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Admin
            </Button>
            <Button variant="outline" size="sm">
              Dashboard
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
