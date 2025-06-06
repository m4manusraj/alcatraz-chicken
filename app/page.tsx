"use client"

import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { MenuItem as MenuItemType } from "@/components/menu-item"
import { OfferBanner } from "@/components/offer-banner"
import { Layout } from "@/components/layout"
import { HeroCarousel } from "@/components/hero-carousel"
import { collection, onSnapshot, query, where, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { LoadingSpinner } from "@/components/loading-spinner"
import { getRestaurantSettings } from "@/lib/settings-service"
import type { RestaurantSettings } from "@/types/menu"

interface MenuItem {
  id: string
  name: string
  description: string
  price: string
  category: string
  image: string
  spicyLevel?: number
  isNew?: boolean
  isFeatured?: boolean
  discount?: {
    type: "none" | "percentage" | "amount"
    value: number
  }
}

interface Offer {
  id: string
  title: string
  description: string
  code?: string
  discount: string
  image: string
  link: string
  expiryDate?: string
  isActive: boolean
}

export default function Home() {
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([])
  const [activeOffers, setActiveOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState<RestaurantSettings | null>(null)

  useEffect(() => {
    // Fetch restaurant settings
    const fetchSettings = async () => {
      const restaurantSettings = await getRestaurantSettings()
      setSettings(restaurantSettings)
    }
    fetchSettings()

    // Fetch featured menu items (only active and featured)
    const menuQuery = query(
      collection(db, "menuItems"),
      where("isFeatured", "==", true),
      where("isActive", "==", true),
      limit(4),
    )

    const unsubscribeMenu = onSnapshot(
      menuQuery,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as MenuItem[]
        setFeaturedItems(items)
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching featured items:", error)
        setError("Error loading featured items")
        setLoading(false)
      },
    )

    // Fetch active offers (only active offers)
    const offersQuery = query(collection(db, "offers"), where("isActive", "==", true), limit(4))

    const unsubscribeOffers = onSnapshot(
      offersQuery,
      (snapshot) => {
        const offers = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Offer[]
        setActiveOffers(offers)
      },
      (error) => {
        console.error("Error fetching offers:", error)
        setError("Error loading offers")
      },
    )

    return () => {
      unsubscribeMenu()
      unsubscribeOffers()
    }
  }, [])

  // Add loading state handling
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-500">{error}</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Current Offers Section */}
      <section className="py-16 bg-gradient-to-b from-black to-[#1a1a1a]">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <div className="inline-block bg-orange-500/10 rounded-full px-4 py-1 mb-4">
              <span className="text-orange-500 font-semibold text-sm">Limited Time Offers</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
              EXCLUSIVE
              <span className="text-orange-500 ml-3">DEALS</span>
            </h2>
            <p className="text-gray-400 text-base max-w-2xl mx-auto">
              Break out with these unbeatable offers before they escape
            </p>
          </motion.div>

          {activeOffers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {activeOffers.map((offer) => (
                <OfferBanner
                  key={offer.id}
                  title={offer.title}
                  description={offer.description}
                  code={offer.code}
                  discount={offer.discount}
                  image={offer.image}
                  link={offer.link}
                  expiryDate={offer.expiryDate}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No active offers at the moment. Check back soon!</p>
            </div>
          )}

          <div className="mt-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block bg-orange-500/10 border border-orange-500/20 rounded-lg px-4 py-3"
            >
              <p className="text-white text-sm flex items-center gap-2">
                <span className="text-orange-500">💡</span>
                <span className="font-semibold">Pro tip:</span> Join our "Most Wanted" list to get exclusive deals and
                early access to new menu items
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Menu Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-black to-[#1a1a1a] relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 prison-bars opacity-10 pointer-events-none" />
        <div className="absolute inset-0 noise pointer-events-none" />

        <div className="container px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            {/* Section Badge */}
            <div className="flex items-center justify-center mb-12 sm:mb-16">
              <div className="relative">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  className="relative z-10"
                >
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-full px-6 py-2">
                    <span className="text-orange-500 font-semibold text-sm tracking-wider uppercase">
                      Featured Items
                    </span>
                  </div>
                </motion.div>
                <div className="absolute -inset-4 border-2 border-orange-500/20 rounded-full -rotate-3" />
                <div className="absolute -inset-4 border-2 border-orange-500/20 rounded-full rotate-3" />
              </div>
            </div>

            {/* Section Title */}
            <div className="relative inline-block">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4">
                MOST WANTED
                <span className="text-orange-500 ml-3">MENU</span>
              </h2>
              <div className="absolute -top-6 -right-6 w-12 h-12 border-2 border-orange-500/20 rounded-full" />
              <div className="absolute -bottom-6 -left-6 w-12 h-12 border-2 border-orange-500/20 rounded-full" />
            </div>

            {/* Section Description */}
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mt-6">
              Our inmates' favorite selections. Each dish is a crime of flavor, guaranteed to steal your heart.
            </p>
          </motion.div>

          {/* Menu Grid */}
          {featuredItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
              {featuredItems.map((item) => (
                <MenuItemType
                  key={item.id}
                  name={item.name}
                  category={item.category}
                  description={item.description}
                  price={item.price}
                  image={item.image}
                  spicyLevel={item.spicyLevel}
                  isNew={item.isNew}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No featured items available at the moment.</p>
            </div>
          )}

          {/* View Full Menu Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <motion.a
              href="/menu"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg group transition-colors"
            >
              View Full Menu
              <ArrowRight className="h-4 sm:h-5 w-4 sm:w-5 transition-transform group-hover:translate-x-1" />
            </motion.a>
          </motion.div>

          {/* Decorative Elements */}
          <div className="absolute top-20 left-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />
        </div>
      </section>

      {/* How to Order Section */}
      <section className="py-16 sm:py-20 bg-[#1a1a1a] relative overflow-hidden">
        <div className="absolute inset-0 prison-bars opacity-10 pointer-events-none" />
        <div className="absolute inset-0 noise pointer-events-none" />

        <div className="container px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 sm:mb-4">
              HOW TO
              <span className="text-orange-500 ml-3">ORDER</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
              Multiple ways to get your favorite chicken fix
            </p>
          </motion.div>

          <div className="grid gap-4 sm:gap-8 md:grid-cols-2 lg:grid-cols-4 items-stretch justify-items-center">
            {/* Direct Online Order */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-black/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-center w-full"
            >
              <div className="w-16 sm:w-24 h-16 sm:h-24 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 overflow-hidden">
                <img
                  src="https://res.cloudinary.com/dokqexnoi/image/upload/v1736053004/818abd7e-0605-4b56-9e97-fe3773335da6.png"
                  alt="Alcatraz Chicken"
                  className="w-12 sm:w-16 h-12 sm:h-16 object-contain"
                />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Order Online</h3>
              <p className="text-sm sm:text-base text-gray-400 mb-4">Order directly through our website for pickup</p>
              <a
                href="https://alcatrazchicken.order-online.ai/#/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base"
              >
                Order Now
              </a>
            </motion.div>

            {/* Delivery Partners */}
            {[
              {
                name: "UberEats",
                logo: "https://res.cloudinary.com/dokqexnoi/image/upload/v1736053625/uber-eats_zydhqr.png",
                link: "https://ubereats.com/alcatraz-chicken",
                bgColor: "bg-[#000000]",
                delay: 0.1,
              },
              {
                name: "DoorDash",
                logo: "https://res.cloudinary.com/dokqexnoi/image/upload/v1736054696/pngegg_a8unpl.png",
                link: "https://doordash.com/alcatraz-chicken",
                bgColor: "bg-[#ee2637]",
                delay: 0.2,
              },
              {
                name: "SkipTheDishes",
                logo: "https://res.cloudinary.com/dokqexnoi/image/upload/v1736054757/skipthedishes_jx0i9w.png",
                link: "https://skipthedishes.com/alcatraz-chicken",
                bgColor: "bg-[#f58021]",
                delay: 0.3,
              },
            ].map((partner) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: partner.delay }}
                className="bg-black/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-center flex flex-col h-full justify-between w-full"
              >
                <div>
                  <div
                    className={`w-16 sm:w-20 h-16 sm:h-20 ${partner.bgColor} rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 overflow-hidden`}
                  >
                    <img
                      src={partner.logo || "/placeholder.svg"}
                      alt={partner.name}
                      className="w-10 sm:w-14 h-10 sm:h-14 object-contain"
                    />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{partner.name}</h3>
                  <p className="text-sm sm:text-base text-gray-400 mb-4">
                    Order through {partner.name} for delivery or pickup
                  </p>
                </div>
                <a
                  href={partner.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 sm:px-6 py-2 rounded-lg transition-colors w-full text-sm sm:text-base"
                >
                  Order Now
                </a>
              </motion.div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-8 sm:mt-12 text-center">
            <div className="inline-block bg-orange-500/10 border border-orange-500/20 rounded-lg px-4 sm:px-6 py-3 sm:py-4">
              <p className="text-white text-sm sm:text-base">
                <span className="font-bold">Delivery Area:</span> We deliver within Kelowna and surrounding areas
              </p>
              <p className="text-gray-400 text-xs sm:text-sm mt-2">
                Delivery times and fees may vary by location and platform
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-[#1a1a1a] relative overflow-hidden">
        <div className="absolute inset-0 prison-bars opacity-10 pointer-events-none" />
        <div className="absolute inset-0 noise pointer-events-none" />

        <div className="container px-4 relative">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-center md:text-left"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
                THE STORY OF
                <br className="hidden sm:block" />
                <span className="text-orange-500 mt-1 sm:mt-2 block">ALCATRAZ CHICKEN</span>
              </h2>
              <p className="text-base sm:text-lg text-gray-400 mb-8 max-w-xl mx-auto md:mx-0">
                Born from a passion for perfect fried chicken and inspired by the infamous prison, Alcatraz Chicken has
                become Kelowna's most wanted destination for incredible flavor.
              </p>
              <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-md mx-auto md:mx-0">
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="text-2xl sm:text-3xl font-bold text-orange-500 mb-1">24HR</div>
                  <div className="text-sm sm:text-base text-gray-400">Marination</div>
                </div>
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="text-2xl sm:text-3xl font-bold text-orange-500 mb-1">13</div>
                  <div className="text-sm sm:text-base text-gray-400">Secret Spices</div>
                </div>
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="text-2xl sm:text-3xl font-bold text-orange-500 mb-1">100%</div>
                  <div className="text-sm sm:text-base text-gray-400">Fresh Daily</div>
                </div>
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="text-2xl sm:text-3xl font-bold text-orange-500 mb-1">1000+</div>
                  <div className="text-sm sm:text-base text-gray-400">Happy Customers</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative order-first md:order-last mb-8 md:mb-0"
            >
              <div className="aspect-square rounded-2xl sm:rounded-3xl overflow-hidden">
                <img
                  src="/placeholder.svg?height=600&width=600"
                  alt="Our Story"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-16 sm:py-20 bg-black relative overflow-hidden">
        <div className="absolute inset-0">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2569.8034686325392!2d-119.38233862396576!3d49.88661997147655!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x537d8b346a7f0bed%3A0xe7945fdf4af548c7!2s101-225%20Rutland%20Rd%20S%2C%20Kelowna%2C%20BC%20V1X%203B1!5e0!3m2!1sen!2sca!4v1704496542614!5m2!1sen!2sca"
            width="100%"
            height="100%"
            style={{ border: 0, filter: "grayscale(100%) contrast(1.2) opacity(0.2)" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-loaded"
          />
        </div>

        <div className="container px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-lg bg-black/90 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-orange-500/20"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 sm:mb-6">
              FIND US IN
              <br />
              <span className="text-orange-500">KELOWNA</span>
            </h2>
            <div className="space-y-2 sm:space-y-4 text-sm sm:text-base text-gray-400">
              <p>101-225 Rutland Rd S</p>
              <p>Kelowna, BC V1X 3B1</p>
              <p>Canada</p>
            </div>
            <div className="mt-6 sm:mt-8 space-y-2">
              {settings?.operatingHours ? (
                settings.operatingHours.map((hours) => (
                  <div key={hours.dayOfWeek} className="flex justify-between text-sm sm:text-base">
                    <span>{hours.dayOfWeek}</span>
                    <span>{hours.isOpen ? `${hours.openTime} - ${hours.closeTime}` : "Closed"}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Monday - Thursday</span>
                    <span>11am - 10pm</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Friday - Saturday</span>
                    <span>11am - 11pm</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Sunday</span>
                    <span>12pm - 9pm</span>
                  </div>
                </>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 sm:mt-8 w-full px-4 sm:px-6 py-2 sm:py-3 bg-orange-500 text-white font-bold rounded-lg text-sm sm:text-base"
            >
              Get Directions
            </motion.button>
          </motion.div>
        </div>
      </section>
    </Layout>
  )
}
