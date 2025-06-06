"use client"

import { Instagram, Facebook, Mail } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { subscribeToRestaurantSettings } from "@/lib/settings-service"
import { NewsletterSignup } from "@/components/newsletter-signup"
import type { RestaurantSettings } from "@/types/menu"

export function Footer() {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null)

  useEffect(() => {
    const unsubscribe = subscribeToRestaurantSettings((newSettings) => {
      setSettings(newSettings)
    })

    return unsubscribe
  }, [])

  const formatHoursForDisplay = (hours: RestaurantSettings["operatingHours"]) => {
    if (!hours || hours.length === 0) return ["Hours not available"]

    // Group consecutive days with same hours
    const grouped: { days: string[]; hours: string }[] = []

    hours.forEach((day) => {
      if (!day.isOpen) return

      const timeStr = `${formatTime(day.openTime)} - ${formatTime(day.closeTime)}`
      const existing = grouped.find((g) => g.hours === timeStr)

      if (existing) {
        existing.days.push(day.dayOfWeek)
      } else {
        grouped.push({ days: [day.dayOfWeek], hours: timeStr })
      }
    })

    return grouped.map((g) => {
      const daysStr =
        g.days.length > 1
          ? `${getDayAbbr(g.days[0])} - ${getDayAbbr(g.days[g.days.length - 1])}`
          : getDayAbbr(g.days[0])
      return `${daysStr}: ${g.hours}`
    })
  }

  const formatTime = (time?: string) => {
    if (!time) return ""
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "pm" : "am"
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}${minutes !== "00" ? `:${minutes}` : ""}${ampm}`
  }

  const getDayAbbr = (day: string) => {
    const abbrs: { [key: string]: string } = {
      Monday: "Mon",
      Tuesday: "Tue",
      Wednesday: "Wed",
      Thursday: "Thu",
      Friday: "Fri",
      Saturday: "Sat",
      Sunday: "Sun",
    }
    return abbrs[day] || day
  }

  return (
    <footer className="bg-black relative">
      {/* Newsletter Section */}
      <div className="border-b border-orange-500/20 relative z-10">
        <div className="container px-4 py-8 sm:py-12">
          <NewsletterSignup />
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container px-4 py-8 sm:py-12 relative z-10">
        <div className="grid gap-8 sm:gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4 sm:space-y-6 text-center sm:text-left">
            <img
              src="https://res.cloudinary.com/dokqexnoi/image/upload/v1736053004/818abd7e-0605-4b56-9e97-fe3773335da6.png"
              alt="Alcatraz Chicken"
              className="h-12 sm:h-16 w-auto mx-auto sm:mx-0"
            />
            <p className="text-sm sm:text-base text-gray-400">Breaking free from ordinary flavor since 2023.</p>
            <div className="flex space-x-4 justify-center sm:justify-start">
              {settings?.socialMediaLinks?.instagram && (
                <a
                  href={settings.socialMediaLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-orange-500/10 p-2 rounded-full text-orange-500 hover:bg-orange-500 hover:text-white transition-colors block"
                  style={{ cursor: "pointer" }}
                >
                  <Instagram className="h-4 sm:h-5 w-4 sm:w-5" />
                </a>
              )}
              {settings?.socialMediaLinks?.facebook && (
                <a
                  href={settings.socialMediaLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-orange-500/10 p-2 rounded-full text-orange-500 hover:bg-orange-500 hover:text-white transition-colors block"
                  style={{ cursor: "pointer" }}
                >
                  <Facebook className="h-4 sm:h-5 w-4 sm:w-5" />
                </a>
              )}
              <a
                href={`mailto:${settings?.email || "info@alcatrazchicken.ca"}`}
                className="bg-orange-500/10 p-2 rounded-full text-orange-500 hover:bg-orange-500 hover:text-white transition-colors block"
                style={{ cursor: "pointer" }}
              >
                <Mail className="h-4 sm:h-5 w-4 sm:w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-bold text-white mb-4 sm:mb-6">Quick Links</h3>
            <div className="space-y-2 sm:space-y-3">
              <div>
                <Link
                  href="/menu"
                  className="text-sm sm:text-base text-gray-400 hover:text-orange-500 transition-colors block"
                  style={{ cursor: "pointer" }}
                >
                  Menu
                </Link>
              </div>
              <div>
                <Link
                  href="/about"
                  className="text-sm sm:text-base text-gray-400 hover:text-orange-500 transition-colors block"
                  style={{ cursor: "pointer" }}
                >
                  About Us
                </Link>
              </div>
              <div>
                <Link
                  href="/locations"
                  className="text-sm sm:text-base text-gray-400 hover:text-orange-500 transition-colors block"
                  style={{ cursor: "pointer" }}
                >
                  Locations
                </Link>
              </div>
              <div>
                <Link
                  href="/contact"
                  className="text-sm sm:text-base text-gray-400 hover:text-orange-500 transition-colors block"
                  style={{ cursor: "pointer" }}
                >
                  Contact
                </Link>
              </div>
              <div>
                <a
                  href="https://alcatrazchicken.order-online.ai/#/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm sm:text-base text-orange-500 hover:text-orange-400 transition-colors block"
                  style={{ cursor: "pointer" }}
                >
                  Order Online
                </a>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-bold text-white mb-4 sm:mb-6">Contact & Hours</h3>
            <div className="space-y-4">
              <div className="text-sm sm:text-base">
                <p className="text-gray-400">{settings?.address?.street || "101-225 Rutland Rd S"}</p>
                <p className="text-gray-400">
                  {settings?.address?.city || "Kelowna"}, {settings?.address?.province || "BC"}
                </p>
                <p className="text-gray-400">{settings?.address?.country || "Canada"}</p>
              </div>
              <div className="text-sm sm:text-base">
                <p className="text-gray-400">
                  <a
                    href={`tel:${settings?.phone || "(250) 980-6991"}`}
                    className="hover:text-orange-500 transition-colors"
                    style={{ cursor: "pointer" }}
                  >
                    Phone: {settings?.phone || "(250) 980-6991"}
                  </a>
                </p>
                <p className="text-gray-400">
                  <a
                    href={`mailto:${settings?.email || "info@alcatrazchicken.ca"}`}
                    className="hover:text-orange-500 transition-colors"
                    style={{ cursor: "pointer" }}
                  >
                    Email: {settings?.email || "info@alcatrazchicken.ca"}
                  </a>
                </p>
              </div>
              <div className="border-l-2 border-orange-500/20 pl-4 text-left">
                {settings?.operatingHours ? (
                  formatHoursForDisplay(settings.operatingHours).map((hourLine, index) => (
                    <p key={index} className="text-xs sm:text-sm text-gray-400">
                      {hourLine}
                    </p>
                  ))
                ) : (
                  <>
                    <p className="text-xs sm:text-sm text-gray-400">Mon - Thu: 11am - 10pm</p>
                    <p className="text-xs sm:text-sm text-gray-400">Fri - Sat: 11am - 11pm</p>
                    <p className="text-xs sm:text-sm text-gray-400">Sun: 12pm - 9pm</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Download App Section */}
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-bold text-white mb-4 sm:mb-6">Coming Soon</h3>
            <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-xl p-4 border border-orange-500/20">
              <h4 className="text-white font-bold mb-2">Alcatraz Chicken App</h4>
              <p className="text-xs sm:text-sm text-gray-400 mb-4">
                Order ahead, earn rewards, and get exclusive app-only offers.
              </p>
              <div className="flex flex-col gap-2">
                <a
                  href="https://apps.apple.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                  style={{ cursor: "pointer" }}
                >
                  <Button
                    variant="outline"
                    className="border-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-white text-sm w-full"
                  >
                    App Store
                  </Button>
                </a>
                <a
                  href="https://play.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                  style={{ cursor: "pointer" }}
                >
                  <Button
                    variant="outline"
                    className="border-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-white text-sm w-full"
                  >
                    Google Play
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-orange-500/20">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
              © {new Date().getFullYear()} {settings?.restaurantName || "Alcatraz Chicken"}. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <Link
                href="/privacy"
                className="text-xs sm:text-sm text-gray-400 hover:text-orange-500 transition-colors"
                style={{ cursor: "pointer" }}
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-xs sm:text-sm text-gray-400 hover:text-orange-500 transition-colors"
                style={{ cursor: "pointer" }}
              >
                Terms of Service
              </Link>
              <Link
                href="/accessibility"
                className="text-xs sm:text-sm text-gray-400 hover:text-orange-500 transition-colors"
                style={{ cursor: "pointer" }}
              >
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
