"use client"

import { Menu, X } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
            <Link href="/login" className="text-white/80 hover:text-orange-500 transition-colors">
              Admin
            </Link>
            <Button className="bg-orange-500 hover:bg-orange-600">Order Now</Button>
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
              href="/login"
              className="text-2xl font-bold text-white hover:text-orange-500 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Admin
            </Link>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setIsOpen(false)}>
              Order Now
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
