"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, QrCode, Users, Gift, Settings, LogOut, X } from "lucide-react"
import { Button } from "@v1/ui/button"
import { cn } from "@v1/ui/utils"

const sidebarItems = [
  {
    name: "dashboard",
    href: "/",
    icon: LayoutDashboard,
    active: true,
  },
  {
    name: "Qr Scanner",
    href: "/qr-scanner",
    icon: QrCode,
  },
  {
    name: "Usuarios",
    href: "/usuarios",
    icon: Users,
  },
  {
    name: "Premios",
    href: "/premios",
    icon: Gift,
  },
]

const bottomItems = [
  {
    name: "Configuracion",
    href: "/configuracion",
    icon: Settings,
  },
  {
    name: "Salir",
    href: "/logout",
    icon: LogOut,
  },
]

interface DashboardSidebarProps {
  mobile?: boolean
  onClose?: () => void
}

export function DashboardSidebar({ mobile = false, onClose }: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("flex py-16 fixed top-0 z-30 h-screen w-64 flex-col bg-white  border-gray-200", mobile && "relative")}>
      {/* Mobile Header */}
      

    

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || (item.href === "/" && pathname === "/")
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={mobile ? onClose : undefined}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive ? "bg-green-400 text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom Items */}
      <div className="px-4 pb-6">
        <div className="space-y-2">
          {bottomItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={mobile ? onClose : undefined}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
