'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

interface MenuItemProps {
  name: string
  description: string
  price: string
  image: string
  spicyLevel?: number
  category: string
  isNew?: boolean
}

export function MenuItem({
  name,
  description,
  price,
  image,
  spicyLevel = 0,
  category,
  isNew = false,
}: MenuItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative h-[400px] sm:h-[500px] w-[280px] sm:w-full mx-auto"
    >
      {/* Prison Cell Frame */}
      <div className="absolute inset-0 border-2 border-orange-500/20 rounded-xl sm:rounded-2xl">
        <div className="absolute inset-y-0 left-6 sm:left-8 w-[2px] bg-orange-500/20" />
        <div className="absolute inset-y-0 left-12 sm:left-16 w-[2px] bg-orange-500/20" />
        <div className="absolute inset-y-0 right-6 sm:right-8 w-[2px] bg-orange-500/20" />
        <div className="absolute inset-y-0 right-12 sm:right-16 w-[2px] bg-orange-500/20" />
      </div>

      {/* Content Container */}
      <div className="relative p-1 h-full">
        <div className="bg-black/80 backdrop-blur-sm rounded-lg sm:rounded-xl overflow-hidden h-full flex flex-col">
          {/* Image Section */}
          <div className="relative h-[160px] sm:h-[240px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
            <motion.img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.4 }}
            />
            {/* Category Tag */}
            <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-20">
              <div className="bg-orange-500/90 backdrop-blur-sm text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 rounded-full">
                {category}
              </div>
            </div>
            {/* New Badge */}
            {isNew && (
              <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-20">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-red-500 text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 rounded-full"
                >
                  NEW
                </motion.div>
              </div>
            )}
            {/* Price Tag */}
            <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 z-20">
              <div className="bg-black/90 backdrop-blur-sm text-orange-500 text-lg sm:text-xl font-bold px-3 sm:px-4 py-1 sm:py-2 rounded-lg">
                {price}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex flex-col flex-grow p-3 sm:p-6">
            {/* Text Content */}
            <div className="flex-grow">
              <h3 className="text-lg sm:text-2xl font-black text-white mb-1 sm:mb-3 line-clamp-2 group-hover:text-orange-500 transition-colors">
                {name}
              </h3>
              <p className="text-sm sm:text-base text-gray-400 line-clamp-3 sm:line-clamp-5">{description}</p>
            </div>

            {/* Bottom Section */}
            <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
              {/* Heat Level */}
              {spicyLevel > 0 ? (
                <div className="h-[30px] sm:h-[40px] flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">Heat Level:</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 sm:w-2 h-4 sm:h-6 rounded-full transition-all duration-300 ${
                          i < spicyLevel
                            ? 'bg-gradient-to-t from-orange-600 to-red-500'
                            : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[30px] sm:h-[40px]" />
              )}

              {/* Action Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-[40px] sm:h-[50px] bg-gradient-to-r from-orange-500 to-orange-600 
                  hover:from-orange-600 hover:to-orange-700 text-white font-bold px-3 sm:px-4
                  rounded-lg flex items-center justify-between text-sm sm:text-base group/button"
              >
                <span>Add to Order</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover/button:translate-x-1" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute -top-3 -left-3 w-6 sm:w-8 h-6 sm:h-8 border-2 border-orange-500/20 rounded-full" />
      <div className="absolute -bottom-3 -right-3 w-6 sm:w-8 h-6 sm:h-8 border-2 border-orange-500/20 rounded-full" />
    </motion.div>
  )
}
