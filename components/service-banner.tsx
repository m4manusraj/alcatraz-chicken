"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, X, AlertTriangle } from "lucide-react"
import { getServiceStatus } from "@/lib/service-availability"
import { subscribeToRestaurantSettings } from "@/lib/settings-service"
import type { RestaurantSettings } from "@/types/menu"

export function ServiceBanner() {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [serviceStatus, setServiceStatus] = useState<any>(null)

  useEffect(() => {
    const unsubscribe = subscribeToRestaurantSettings((newSettings) => {
      setSettings(newSettings)

      if (newSettings) {
        const status = getServiceStatus(newSettings)
        setServiceStatus(status)

        // Show banner if services are unavailable and banner is enabled
        const shouldShow = newSettings.bannerSettings?.enabled !== false && !status.anyAvailable
        setShowBanner(shouldShow)
      }
    })

    return unsubscribe
  }, [])

  // Update service status every minute
  useEffect(() => {
    if (!settings) return

    const interval = setInterval(() => {
      const status = getServiceStatus(settings)
      setServiceStatus(status)

      const shouldShow = settings.bannerSettings?.enabled !== false && !status.anyAvailable
      setShowBanner(shouldShow)
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [settings])

  if (!showBanner || !serviceStatus) return null

  const getCompactMessage = () => {
    const { delivery, pickup } = serviceStatus
    const unavailableServices = []

    if (!delivery.available) unavailableServices.push("Delivery")
    if (!pickup.available) unavailableServices.push("Pickup")

    return `${unavailableServices.join(" & ")} unavailable`
  }

  const getNextAvailableTime = () => {
    const { delivery, pickup } = serviceStatus

    if (delivery.nextAvailable && pickup.nextAvailable) {
      if (delivery.nextAvailable === pickup.nextAvailable && delivery.nextAvailableDay === pickup.nextAvailableDay) {
        return `Resumes ${delivery.nextAvailableDay} at ${delivery.nextAvailable}`
      } else {
        // Show the earliest next available
        const deliveryTime = new Date(`${delivery.nextAvailableDay} ${delivery.nextAvailable}`)
        const pickupTime = new Date(`${pickup.nextAvailableDay} ${pickup.nextAvailable}`)

        if (deliveryTime <= pickupTime) {
          return `Next: ${delivery.nextAvailableDay} ${delivery.nextAvailable}`
        } else {
          return `Next: ${pickup.nextAvailableDay} ${pickup.nextAvailable}`
        }
      }
    } else if (delivery.nextAvailable) {
      return `Delivery: ${delivery.nextAvailableDay} ${delivery.nextAvailable}`
    } else if (pickup.nextAvailable) {
      return `Pickup: ${pickup.nextAvailableDay} ${pickup.nextAvailable}`
    }

    return "Check back later"
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-gradient-to-r from-orange-600 to-red-600 text-white relative z-40"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-3 py-1.5 lg:py-1">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <AlertTriangle className="h-3.5 w-3.5 lg:h-3 lg:w-3 flex-shrink-0" />
              <span className="font-medium text-sm lg:text-xs truncate">{getCompactMessage()}</span>
              <span className="hidden sm:inline text-orange-100 text-sm lg:text-xs">•</span>
              <div className="hidden sm:flex items-center gap-1 text-orange-100 truncate">
                <Clock className="h-3.5 w-3.5 lg:h-3 lg:w-3" />
                <span className="text-sm lg:text-xs">{getNextAvailableTime()}</span>
              </div>
            </div>

            {/* Mobile time info */}
            <div className="sm:hidden flex items-center gap-1 text-xs text-orange-100">
              <Clock className="h-3 w-3" />
              <span className="truncate text-xs">{getNextAvailableTime()}</span>
            </div>

            <button
              onClick={() => setShowBanner(false)}
              className="p-0.5 lg:p-0 hover:bg-white/20 rounded transition-colors flex-shrink-0"
              aria-label="Dismiss banner"
            >
              <X className="h-3.5 w-3.5 lg:h-3 lg:w-3" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
