"use client"

import { motion } from "framer-motion"
import { Clock } from "lucide-react"

interface OfferBannerProps {
  title: string
  description: string
  code?: string
  image: string
  link: string
  expiryDate?: string
  discount: string
}

export function OfferBanner({ title, description, code, image, link, expiryDate, discount }: OfferBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-gradient-to-br from-orange-500/10 to-black/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-center flex flex-col h-full justify-between w-full border border-orange-500/20"
    >
      {/* Image/Discount Section */}
      <div>
        <div className="relative w-full h-32 sm:h-36 rounded-lg overflow-hidden mx-auto mb-3 sm:mb-4">
          <img src={image || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />

          {/* Discount Badge - More Prominent */}
          <div className="absolute top-2 left-2">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-black px-3 py-1.5 rounded-lg transform -rotate-3 shadow-lg">
              {discount}
            </div>
          </div>

          {/* Limited Time Badge */}
          <div className="absolute top-2 right-2">
            <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">LIMITED</div>
          </div>

          {/* Expiry Date if available */}
          {expiryDate && (
            <div className="absolute bottom-2 left-2">
              <div className="bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{expiryDate}</span>
              </div>
            </div>
          )}
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-sm sm:text-base text-gray-400 mb-4">{description}</p>

        {code && (
          <div className="mb-4">
            <div className="bg-orange-500/20 border-2 border-dashed border-orange-500/50 rounded-lg px-3 py-2 relative">
              <div className="text-orange-400 font-mono font-bold text-sm tracking-wider">{code}</div>
              <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                COPY
              </div>
            </div>
          </div>
        )}
      </div>

      <a
        href="https://alcatrazchicken.order-online.ai/#/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-4 sm:px-6 py-2 rounded-lg transition-all w-full text-sm sm:text-base shadow-lg transform hover:scale-105"
      >
        🔥 Claim Offer
      </a>
    </motion.div>
  )
}
