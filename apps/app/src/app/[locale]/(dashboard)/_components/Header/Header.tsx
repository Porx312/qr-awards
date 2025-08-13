"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@v1/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@v1/ui/sheet"
import { Menu, Sparkles, LogOut, Settings } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@v1/ui/dropdown-menu"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@v1/ui/navigation-menu"
import { useAuthActions } from "@convex-dev/auth/react"
import { useQuery } from "convex/react"
import { useRouter } from "next/navigation"
import { api } from "@v1/backend/convex/_generated/api"
import { ThemeSwitcher } from "../theme-switcher"
import { cn } from "@v1/ui/utils"

const Menus = [
  {
    name: "Home",
    url: "/",
    icon: "PanelsTopLeft",
  },
  {
    name: "Features",
    subMenuHeading: ["QR Tools"],
    subMenu: [
      {
        name: "QR",
        desc: "Generate QR codes",
        icon: "Bolt",
        url: "/qr",
      },
      {
        name: "Scan QR",
        desc: "Scan QR codes",
        icon: "MessageCircle",
        url: "/scanqr",
      },
    ],
    gridCols: 2,
  },
  {
    name: "Settings",
    subMenuHeading: ["Account Settings"],
    subMenu: [
      {
        name: "General",
        desc: "Manage settings",
        icon: "CircleHelp",
        url: "/settings",
      },
      {
        name: "Billing",
        desc: "Billing details",
        icon: "Lock",
        url: "/settings/billing",
      },
    ],
    gridCols: 2,
  },
  {
    name: "Account",
    subMenuHeading: ["Plan & Benefits"],
    subMenu: [
      {
        name: "Subscriptions",
        desc: "Manage plans",
        icon: "ShieldPlus",
        url: "/subscriptions",
      },
      {
        name: "Rewards",
        desc: "View rewards",
        icon: "Dessert",
        url: "/rewards",
      },
      {
        name: "Rewards Client",
        desc: "View rewards",
        icon: "Dessert",
        url: "/rewards-client",
      },
    ],
    gridCols: 2,
  },
]

export function SaasHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { signOut } = useAuthActions()
  const router = useRouter()

  const user = useQuery(api.users.getUser)

  if (!user) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-950/95 dark:supports-[backdrop-filter]:bg-gray-950/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">StampMe</span>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {Menus.map((menu) => (
              <NavigationMenuItem key={menu.name}>
                {menu.subMenu ? (
                  <>
                    <NavigationMenuTrigger className="text-sm font-medium">{menu.name}</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        {menu.subMenuHeading && (
                          <div className="col-span-2">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                              {menu.subMenuHeading[0]}
                            </h4>
                          </div>
                        )}
                        {menu.subMenu.map((item) => (
                          <Link
                            key={item.name}
                            href={item.url}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">{item.name}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{item.desc}</p>
                          </Link>
                        ))}
                      </div>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <Link
                    href={menu.url}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors px-4 py-2"
                  >
                    {menu.name}
                  </Link>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-3">
          {/* Pro Badge */}
          <Link
            href="/#pricing"
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-amber-500/50 hover:border-amber-800/70 bg-gradient-to-r from-amber-500/20 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 transition-all duration-300"
          >
            <Sparkles className="w-4 h-4 text-amber-400 dark:text-amber-500" />
            <span className="text-sm font-medium text-amber-500 dark:text-amber-300 hover:text-amber-400">Pro </span>
          </Link>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 rounded-full">
                {user.avatarUrl ? (
                  <img
                    className="min-h-8 min-w-8 rounded-full object-cover"
                    alt={user.name ?? user.email}
                    src={user.avatarUrl || "/placeholder.svg"}
                  />
                ) : (
                  <span className="min-h-8 min-w-8 rounded-full bg-gradient-to-br from-lime-400 from-10% via-cyan-300 to-blue-500" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-56 bg-card p-2">
              <DropdownMenuItem className="group flex-col items-start focus:bg-transparent">
                <p className="text-sm font-medium text-primary/80 group-hover:text-primary group-focus:text-primary">
                  {user?.name || ""}
                </p>
                <p className="text-sm text-primary/60">{user?.email}</p>
              </DropdownMenuItem>
             
              <DropdownMenuItem
                className="group h-9 w-full cursor-pointer justify-between rounded-md px-2"
                onClick={() => router.push("/settings")}
              >
                <span className="text-sm text-primary/60 group-hover:text-primary group-focus:text-primary">
                  Settings
                </span>
                <Settings className="h-[18px] w-[18px] stroke-[1.5px] text-primary/60 group-hover:text-primary group-focus:text-primary" />
              </DropdownMenuItem>
             
              <DropdownMenuSeparator className="mx-0 my-2" />
              <DropdownMenuItem
                className="group h-9 w-full cursor-pointer justify-between rounded-md px-2"
                onClick={() => signOut()}
              >
                <span className="text-sm text-primary/60 group-hover:text-primary group-focus:text-primary">
                  Log Out
                </span>
                <LogOut className="h-[18px] w-[18px] stroke-[1.5px] text-primary/60 group-hover:text-primary group-focus:text-primary" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Menu Button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="flex items-center justify-between pb-4 border-b">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">StampMe</span>
                </Link>
              </div>

              {/* Mobile User Info */}
              <div className="py-4 border-b">
                <div className="flex items-center space-x-3">
                  {user.avatarUrl ? (
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      alt={user.name ?? user.email}
                      src={user.avatarUrl || "/placeholder.svg"}
                    />
                  ) : (
                    <span className="h-10 w-10 rounded-full bg-gradient-to-br from-lime-400 from-10% via-cyan-300 to-blue-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{user?.name || ""}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 py-6">
                <div className="space-y-1">
                  {Menus.map((menu) => (
                    <div key={menu.name}>
                      {menu.subMenu ? (
                        <div className="space-y-1">
                          <div className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                            {menu.name}
                          </div>
                          {menu.subMenu.map((item) => (
                            <Link
                              key={item.name}
                              href={item.url}
                              className="flex items-center px-6 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 rounded-md transition-colors ml-3"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <Link
                          href={menu.url}
                          className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 rounded-md transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {menu.name}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </nav>

              {/* Mobile Footer */}
              <div className="border-t pt-4 space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    router.push("/settings")
                    setMobileMenuOpen(false)
                  }}
                >
                  <Settings className="mr-3 h-4 w-4" />
                  Settings
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Log Out
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
