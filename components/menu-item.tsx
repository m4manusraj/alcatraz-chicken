"use client"

import { motion } from "framer-motion"

interface MenuItemProps {
  name: string
  description: string
  price: string
  image: string
  spicyLevel?: number
  category: string
  isNew?: boolean
}

export function MenuItem({ name, description, price, image, spicyLevel = 0, category, isNew = false }: MenuItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-black/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-center flex flex-col h-full justify-between w-full border border-gray-500/20"
    >
      {/* Image Section */}
      <div>
        <div className="relative w-full h-32 sm:h-36 rounded-lg overflow-hidden mx-auto mb-3 sm:mb-4">
          <img src={image || "/placeholder.svg"} alt={name} className="w-full h-full object-cover" />

          {/* Category Badge */}
          <div className="absolute top-2 left-2">
            <div className="bg-orange-500/90 text-white text-xs font-bold px-2 py-1 rounded-full">{category}</div>
          </div>

          {/* New Badge */}
          {isNew && (
            <div className="absolute top-2 right-2">
              <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">NEW</div>
            </div>
          )}

          {/* Price Tag */}
          <div className="absolute bottom-2 right-2">
            <div className="bg-black/90 text-orange-500 text-sm font-bold px-2 py-1 rounded-lg border border-orange-500/30">
              {price}
            </div>
          </div>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{name}</h3>
        <p className="text-sm sm:text-base text-gray-400 mb-4">{description}</p>

        {/* Heat Level */}
        {spicyLevel > 0 && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-sm text-gray-400">Heat Level:</span>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-4 rounded-full transition-all duration-300 ${
                    i < spicyLevel ? "bg-gradient-to-t from-orange-600 to-red-500" : "bg-gray-700"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <a
        href="https://alcatrazchicken.order-online.ai/#/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 sm:px-6 py-2 rounded-lg transition-colors w-full text-sm sm:text-base"
      >
        Add to Order
      </a>
    </motion.div>
  )
}
