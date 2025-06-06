"use client"

import React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Pizza,
  MenuIcon as MenuIconLucide,
  Tag,
  LogOut,
  ChevronDown,
  Bell,
  SearchIcon,
  SettingsIcon as SettingsIconLucide,
  Users,
  Menu,
  X,
  Home,
  Mail,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { collection, onSnapshot } from "firebase/firestore"
import { db, auth as firebaseAuth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useAuth } from "@/components/auth-provider"

interface SidebarLinkInfo {
  icon: React.ElementType
  label: string
  href: string
  badge?: number
}

const baseSidebarLinks: Omit<SidebarLinkInfo, "badge">[] = [
  { icon: Home, label: "Homepage", href: "/" },
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: Pizza, label: "Menu", href: "/dashboard/menu" },
  { icon: MenuIconLucide, label: "Categories", href: "/dashboard/categories" },
  { icon: Tag, label: "Offers", href: "/dashboard/offers" },
  { icon: Mail, label: "Communications", href: "/dashboard/communications" },
  { icon: SettingsIconLucide, label: "Settings", href: "/dashboard/settings" },
  { icon: Users, label: "Developer", href: "/dashboard/developer" },
]

function DashboardSidebar({
  isOpen,
  onClose,
  links,
}: {
  isOpen: boolean
  onClose: () => void
  links: SidebarLinkInfo[]
}) {
  const pathname = usePathname()
  const { user } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut(firebaseAuth)
      router.push("/login")
    } catch (error) {
      console.error("Error signing out: ", error)
    }
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 bg-black border-r border-orange-500/20 transition-transform duration-300 ease-in-out",
          "lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b border-orange-500/20 px-4">
            <Link href="/dashboard" className="flex items-center gap-2" onClick={onClose}>
              <img
                src="https://res.cloudinary.com/dokqexnoi/image/upload/v1736053004/818abd7e-0605-4b56-9e97-fe3773335da6.png"
                alt="Alcatraz Chicken"
                className="h-8 w-auto"
              />
              <span className="font-bold text-white">Dashboard</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden text-white hover:bg-orange-500/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive ? "bg-orange-500 text-white" : "text-gray-400 hover:bg-orange-500/10 hover:text-white",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </div>
                  {link.badge && link.badge > 0 && (
                    <span className="rounded-full bg-black/20 px-2 py-0.5 text-xs text-orange-500">{link.badge}</span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Menu */}
          <div className="border-t border-orange-500/20 p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2 text-white hover:bg-orange-500/10">
                  <img
                    src={user?.photoURL || "/placeholder.svg?height=32&width=32"}
                    alt={user?.displayName || "Admin"}
                    className="h-8 w-8 rounded-full"
                  />
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{user?.displayName || user?.email || "Admin User"}</div>
                    {user?.email && <div className="text-xs text-gray-400">{user.email}</div>}
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-black border-orange-500/30 text-white">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-orange-500/30" />
                <DropdownMenuItem className="hover:bg-orange-500/20">Profile</DropdownMenuItem>
                <DropdownMenuSeparator className="bg-orange-500/30" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-400 hover:bg-red-500/20 hover:text-red-300 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>
    </>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // State for counts and search
  const [menuCount, setMenuCount] = useState(0)
  const [categoryCount, setCategoryCount] = useState(0)
  const [offerCount, setOfferCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [notifications] = useState(3)

  useEffect(() => {
    if (!loading && !user && pathname !== "/login") {
      router.push("/login")
    }
  }, [user, loading, router, pathname])

  useEffect(() => {
    if (user) {
      const menuUnsubscribe = onSnapshot(
        collection(db, "menuItems"),
        (snapshot) => setMenuCount(snapshot.size),
        (error) => console.error("Error fetching menu count:", error),
      )
      const categoryUnsubscribe = onSnapshot(
        collection(db, "categories"),
        (snapshot) => setCategoryCount(snapshot.size),
        (error) => console.error("Error fetching category count:", error),
      )
      const offerUnsubscribe = onSnapshot(
        collection(db, "offers"),
        (snapshot) => setOfferCount(snapshot.size),
        (error) => console.error("Error fetching offer count:", error),
      )

      return () => {
        menuUnsubscribe()
        categoryUnsubscribe()
        offerUnsubscribe()
      }
    }
  }, [user])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    const searchEvent = new CustomEvent("dashboardSearch", { detail: { query: e.target.value } })
    window.dispatchEvent(searchEvent)
  }

  const sidebarLinks: SidebarLinkInfo[] = baseSidebarLinks.map((link) => {
    let badge
    if (link.href === "/dashboard/menu") badge = menuCount
    else if (link.href === "/dashboard/categories") badge = categoryCount
    else if (link.href === "/dashboard/offers") badge = offerCount
    return { ...link, badge }
  })

  if (loading || (!user && pathname !== "/login")) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user && pathname !== "/login") {
    return null
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Sidebar */}
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} links={sidebarLinks} />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-orange-500/20 bg-black/95 backdrop-blur-md px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-white hover:bg-orange-500/10"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden md:block relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                className="w-[300px] bg-black/50 border-gray-700 text-white pl-10 focus:border-orange-500"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs text-white ring-2 ring-black">
                  {notifications}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden text-gray-400 hover:text-white">
              <SearchIcon className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <React.Suspense
            fallback={
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
              </div>
            }
          >
            {children}
          </React.Suspense>
        </main>
      </div>
    </div>
  )
}
