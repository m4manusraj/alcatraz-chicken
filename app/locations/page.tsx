"use client"

import { motion } from "framer-motion"
import { Layout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Clock,
  Phone,
  Car,
  Bus,
  Bike,
  ParkingMeterIcon as Parking,
  Utensils,
  Wifi,
  CreditCard,
  ShipWheelIcon as Wheelchair,
} from "lucide-react"
import { useState, useEffect } from "react"
import { subscribeToRestaurantSettings } from "@/lib/settings-service"
import type { RestaurantSettings } from "@/types/menu"

export default function LocationsPage() {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null)

  useEffect(() => {
    const unsubscribe = subscribeToRestaurantSettings((newSettings) => {
      setSettings(newSettings)
    })

    return unsubscribe
  }, [])

  const formatTime = (time?: string) => {
    if (!time) return ""
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "pm" : "am"
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}${minutes !== "00" ? `:${minutes}` : ""}${ampm}`
  }

  const formatHoursForDisplay = (hours: RestaurantSettings["operatingHours"]) => {
    if (!hours || hours.length === 0) return []

    return hours.map((day) => ({
      day: day.dayOfWeek,
      hours: day.isOpen ? `${formatTime(day.openTime)} - ${formatTime(day.closeTime)}` : "Closed",
      isOpen: day.isOpen,
    }))
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-black">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/20 to-black" />
        <div className="absolute inset-0 prison-bars opacity-20" />
        <div className="absolute inset-0 noise" />

        <div className="container relative px-4 py-12 sm:py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4">
              FIND
              <span className="text-orange-500 ml-3">US</span>
            </h1>
            <p className="text-gray-400 text-base sm:text-lg md:text-xl">
              Visit us in Kelowna and experience legendary flavor
            </p>
          </motion.div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-12 sm:py-16 bg-[#1a1a1a] relative overflow-hidden">
        <div className="absolute inset-0 prison-bars opacity-10" />
        <div className="absolute inset-0 noise" />

        <div className="container px-4 relative">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Map */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-[300px] sm:h-[400px] lg:h-full rounded-xl overflow-hidden order-last lg:order-first"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2569.8034686325392!2d-119.38233862396576!3d49.88661997147655!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x537d8b346a7f0bed%3A0xe7945fdf4af548c7!2s101-225%20Rutland%20Rd%20S%2C%20Kelowna%2C%20BC%20V1X%203B1!5e0!3m2!1sen!2sca!4v1704496542614!5m2!1sen!2sca"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale contrast-125 opacity-80"
              />
            </motion.div>

            {/* Location Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 mb-4">
                  Kelowna Location
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                  Visit Our
                  <span className="text-orange-500 ml-3">Restaurant</span>
                </h2>
              </div>

              <div className="grid gap-6">
                <div className="flex items-start gap-4">
                  <MapPin className="h-6 w-6 text-orange-500 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Address</h3>
                    <p className="text-gray-400">
                      {settings?.address?.street || "101-225 Rutland Rd S"}
                      <br />
                      {settings?.address?.city || "Kelowna"}, {settings?.address?.province || "BC"}{" "}
                      {settings?.address?.postalCode || "V1X 3B1"}
                      <br />
                      {settings?.address?.country || "Canada"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock className="h-6 w-6 text-orange-500 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Hours</h3>
                    <div className="grid gap-1 text-gray-400">
                      {settings?.operatingHours ? (
                        formatHoursForDisplay(settings.operatingHours).map((day, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{day.day}</span>
                            <span className={day.isOpen ? "" : "text-red-400"}>{day.hours}</span>
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span>Monday - Thursday</span>
                            <span>11am - 10pm</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Friday - Saturday</span>
                            <span>11am - 11pm</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Sunday</span>
                            <span>12pm - 9pm</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone className="h-6 w-6 text-orange-500 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Contact</h3>
                    <p className="text-gray-400">
                      Phone: {settings?.phone || "(250) 980-6991"}
                      <br />
                      Email: {settings?.email || "info@alcatrazchicken.ca"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-orange-500/20">
                <h3 className="text-lg font-bold text-white mb-4">Getting Here</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Car className="h-5 w-5 text-orange-500" />
                    <span>Free parking available</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Bus className="h-5 w-5 text-orange-500" />
                    <span>Bus routes nearby</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Bike className="h-5 w-5 text-orange-500" />
                    <span>Bike racks on-site</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-orange-500/20">
                <h3 className="text-lg font-bold text-white mb-4">Amenities</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Parking className="h-5 w-5 text-orange-500" />
                    <span>Free Parking</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Wifi className="h-5 w-5 text-orange-500" />
                    <span>Free Wi-Fi</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Utensils className="h-5 w-5 text-orange-500" />
                    <span>Dine-in Available</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <CreditCard className="h-5 w-5 text-orange-500" />
                    <span>All Cards Accepted</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Wheelchair className="h-5 w-5 text-orange-500" />
                    <span>Wheelchair Accessible</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button size="lg" className="flex-1 bg-orange-500 hover:bg-orange-600">
                  Get Directions
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 border-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-white"
                >
                  Order Now
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
