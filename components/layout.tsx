import { Menu, Phone, ShoppingBag, X, Instagram, Facebook, ArrowRight, Mail } from 'lucide-react'
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { motion } from 'framer-motion'

interface LayoutProps {
  children: React.ReactNode
}

// Changed to named export to match the import
export function Layout({ children }: LayoutProps) {
  const [isCartOpen, setIsCartOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <main>{children}</main>
      <footer className="bg-black relative overflow-hidden">
  {/* Background Elements */}
  <div className="absolute inset-0 prison-bars opacity-10" />
  <div className="absolute inset-0 noise" />
  
  {/* Newsletter Section */}
  <div className="border-b border-orange-500/20">
    <div className="container px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Join the Most Wanted List</h3>
          <p className="text-sm sm:text-base text-gray-400 mb-6">Subscribe to get exclusive deals and be the first to know about new menu items.</p>
          <form className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-white/5 border-orange-500/20 text-white placeholder:text-gray-500"
            />
            <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold whitespace-nowrap">
              Subscribe
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  </div>

  {/* Main Footer Content */}
  <div className="container px-4 py-8 sm:py-12">
    <div className="grid gap-8 sm:gap-12 md:grid-cols-2 lg:grid-cols-4">
      {/* Brand Section */}
      <div className="space-y-4 sm:space-y-6 text-center sm:text-left">
        <motion.img
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          src="https://res.cloudinary.com/dokqexnoi/image/upload/v1736053004/818abd7e-0605-4b56-9e97-fe3773335da6.png"
          alt="Alcatraz Chicken"
          className="h-12 sm:h-16 w-auto mx-auto sm:mx-0"
        />
        <p className="text-sm sm:text-base text-gray-400">Breaking free from ordinary flavor since 2023.</p>
        <div className="flex space-x-4 justify-center sm:justify-start">
          <motion.a
            href="#"
            whileHover={{ scale: 1.1 }}
            className="bg-orange-500/10 p-2 rounded-full text-orange-500 hover:bg-orange-500 hover:text-white transition-colors"
          >
            <Instagram className="h-4 sm:h-5 w-4 sm:w-5" />
          </motion.a>
          <motion.a
            href="#"
            whileHover={{ scale: 1.1 }}
            className="bg-orange-500/10 p-2 rounded-full text-orange-500 hover:bg-orange-500 hover:text-white transition-colors"
          >
            <Facebook className="h-4 sm:h-5 w-4 sm:w-5" />
          </motion.a>
          <motion.a
            href="mailto:info@alcatrazchicken.ca"
            whileHover={{ scale: 1.1 }}
            className="bg-orange-500/10 p-2 rounded-full text-orange-500 hover:bg-orange-500 hover:text-white transition-colors"
          >
            <Mail className="h-4 sm:h-5 w-4 sm:w-5" />
          </motion.a>
        </div>
      </div>

      {/* Quick Links */}
      <div className="text-center sm:text-left">
        <h3 className="text-lg font-bold text-white mb-4 sm:mb-6 relative inline-block">
          Quick Links
          <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-orange-500" />
        </h3>
        <ul className="space-y-2 sm:space-y-3">
          <li>
            <Link href="/menu" className="text-sm sm:text-base text-gray-400 hover:text-orange-500 transition-colors flex items-center justify-center sm:justify-start group">
              <span className="w-0 group-hover:w-2 h-px bg-orange-500 mr-0 group-hover:mr-2 transition-all duration-300" />
              Menu
            </Link>
          </li>
          <li>
            <Link href="/about" className="text-sm sm:text-base text-gray-400 hover:text-orange-500 transition-colors flex items-center justify-center sm:justify-start group">
              <span className="w-0 group-hover:w-2 h-px bg-orange-500 mr-0 group-hover:mr-2 transition-all duration-300" />
              About Us
            </Link>
          </li>
          <li>
            <Link href="/locations" className="text-sm sm:text-base text-gray-400 hover:text-orange-500 transition-colors flex items-center justify-center sm:justify-start group">
              <span className="w-0 group-hover:w-2 h-px bg-orange-500 mr-0 group-hover:mr-2 transition-all duration-300" />
              Locations
            </Link>
          </li>
          <li>
            <Link href="/contact" className="text-sm sm:text-base text-gray-400 hover:text-orange-500 transition-colors flex items-center justify-center sm:justify-start group">
              <span className="w-0 group-hover:w-2 h-px bg-orange-500 mr-0 group-hover:mr-2 transition-all duration-300" />
              Contact
            </Link>
          </li>
        </ul>
      </div>

      {/* Contact Info */}
      <div className="text-center sm:text-left">
        <h3 className="text-lg font-bold text-white mb-4 sm:mb-6 relative inline-block">
          Contact & Hours
          <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-orange-500" />
        </h3>
        <div className="space-y-4">
          <div className="text-sm sm:text-base">
            <p className="text-gray-400">101-225 Rutland Rd S</p>
            <p className="text-gray-400">Kelowna, BC</p>
            <p className="text-gray-400">Canada</p>
          </div>
          <div className="text-sm sm:text-base">
            <p className="text-gray-400">Phone: (250) 980-6991</p>
            <p className="text-gray-400">Email: info@alcatrazchicken.ca</p>
          </div>
          <div className="border-l-2 border-orange-500/20 pl-4 inline-block text-left">
            <p className="text-xs sm:text-sm text-gray-400">Mon - Thu: 11am - 10pm</p>
            <p className="text-xs sm:text-sm text-gray-400">Fri - Sat: 11am - 11pm</p>
            <p className="text-xs sm:text-sm text-gray-400">Sun: 12pm - 9pm</p>
          </div>
        </div>
      </div>

      {/* Download App Section */}
      <div className="text-center sm:text-left">
        <h3 className="text-lg font-bold text-white mb-4 sm:mb-6 relative inline-block">
          Coming Soon
          <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-orange-500" />
        </h3>
        <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-xl p-4 border border-orange-500/20">
          <h4 className="text-white font-bold mb-2">Alcatraz Chicken App</h4>
          <p className="text-xs sm:text-sm text-gray-400 mb-4">Order ahead, earn rewards, and get exclusive app-only offers.</p>
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="border-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-white text-sm">
              App Store
            </Button>
            <Button variant="outline" className="border-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-white text-sm">
              Google Play
            </Button>
          </div>
        </div>
      </div>
    </div>

    {/* Bottom Bar */}
    <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-orange-500/20">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
          © {new Date().getFullYear()} Alcatraz Chicken. All rights reserved.
        </p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          <Link href="/privacy" className="text-xs sm:text-sm text-gray-400 hover:text-orange-500 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-xs sm:text-sm text-gray-400 hover:text-orange-500 transition-colors">
            Terms of Service
          </Link>
          <Link href="/accessibility" className="text-xs sm:text-sm text-gray-400 hover:text-orange-500 transition-colors">
            Accessibility
          </Link>
        </div>
      </div>
    </div>
  </div>
</footer>
    </div>
  )
}
