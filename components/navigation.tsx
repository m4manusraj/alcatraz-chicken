"use client"

import { Menu, X, ChevronDown, LogOut, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/")
    } catch (error) {
      console.error("Error signing out: ", error)
    }
  }

  // Default logo URL - you can make this dynamic later from settings
  const logoUrl =
    "https://res.cloudinary.com/dokqexnoi/image/upload/v1736053004/818abd7e-0605-4b56-9e97-fe3773335da6.png"

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-300",
        scrolled ? "bg-black/95 backdrop-blur-md py-4" : "bg-transparent py-6",
      )}
    >
      <div className="container px-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="relative z-50">
            {logoUrl ? (
              <img src={logoUrl || "/placeholder.svg"} alt="Alcatraz Chicken" className="h-12 w-auto" />
            ) : (
              <div className="h-12 flex items-center">
                <span className="text-white text-xl font-bold">Alcatraz Chicken</span>
              </div>
            )}
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/menu" className="text-white/80 hover:text-orange-500 transition-colors">
              Menu
            </Link>
            <Link href="/locations" className="text-white/80 hover:text-orange-500 transition-colors">
              Locations
            </Link>
            <Link href="/about" className="text-white/80 hover:text-orange-500 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-white/80 hover:text-orange-500 transition-colors">
              Contact
            </Link>

            {/* Auth Section */}
            {loading ? (
              <div className="w-16 h-8 bg-gray-700 animate-pulse rounded"></div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-white/80 hover:text-orange-500 transition-colors flex items-center gap-1"
                  >
                    Dashboard
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-black border-orange-500/30 text-white">
                  <DropdownMenuLabel className="text-orange-500">
                    {user.displayName || user.email || "Admin User"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-orange-500/30" />
                  <DropdownMenuItem asChild className="hover:bg-orange-500/20 cursor-pointer">
                    <Link href="/dashboard" className="flex items-center">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Go to Dashboard
                    </Link>
                  </DropdownMenuItem>
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
            ) : (
              <Link href="/login" className="text-white/80 hover:text-orange-500 transition-colors">
                Login
              </Link>
            )}

            <Button
              className="bg-orange-500 hover:bg-orange-600"
              onClick={() => window.open("https://alcatrazchicken.order-online.ai/#/", "_blank")}
            >
              Order Now
            </Button>
          </div>

          <Button variant="ghost" size="icon" className="relative z-50 md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
          </Button>
        </nav>

        {/* Mobile Menu */}
        <div
          className={cn(
            "fixed inset-0 bg-black prison-bars z-40 transition-transform duration-300 md:hidden",
            isOpen ? "translate-x-0" : "translate-x-full",
          )}
          style={{ top: "0", height: "100vh" }}
        >
          <div className="flex flex-col items-center justify-center min-h-screen h-full space-y-8 px-4">
            <Link
              href="/menu"
              className="text-2xl font-bold text-white hover:text-orange-500 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Menu
            </Link>
            <Link
              href="/locations"
              className="text-2xl font-bold text-white hover:text-orange-500 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Locations
            </Link>
            <Link
              href="/about"
              className="text-2xl font-bold text-white hover:text-orange-500 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-2xl font-bold text-white hover:text-orange-500 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>

            {/* Mobile Auth Section */}
            {!loading &&
              (user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-2xl font-bold text-white hover:text-orange-500 transition-colors flex items-center gap-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard className="h-6 w-6" />
                    Dashboard
                  </Link>
                  <Button
                    onClick={() => {
                      handleLogout()
                      setIsOpen(false)
                    }}
                    variant="ghost"
                    className="text-2xl font-bold text-red-400 hover:text-red-300 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="h-6 w-6" />
                    Logout
                  </Button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="text-2xl font-bold text-white hover:text-orange-500 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
              ))}

            <Button
              className="bg-orange-500 hover:bg-orange-600"
              onClick={() => {
                window.open("https://alcatrazchicken.order-online.ai/#/", "_blank")
                setIsOpen(false)
              }}
            >
              Order Now
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
