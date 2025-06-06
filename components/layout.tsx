"use client"

import type React from "react"

import { Instagram, Facebook, ArrowRight, Mail } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { ServiceBanner } from "@/components/service-banner"
import { subscribeToRestaurantSettings } from "@/lib/settings-service"
import type { RestaurantSettings } from "@/types/menu"
import { Footer } from "@/components/footer"

interface LayoutProps {
  children: React.ReactNode
}

// Changed to named export to match the import
export function Layout({ children }: LayoutProps) {
  const [isCartOpen, setIsCartOpen] = useState(false)
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
    <div className="min-h-screen bg-[#1a1a1a]">
      <main>
        <ServiceBanner />
        {children}
      </main>
      <Footer />
    </div>
  )
}
