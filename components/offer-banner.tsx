'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Clock } from 'lucide-react'

interface OfferBannerProps {
  title: string
  description: string
  code?: string
  image: string
  link: string
  expiryDate?: string
  discount: string
}

export function OfferBanner({
  title,
  description,
  code,
  image,
  link,
  expiryDate,
  discount
}: OfferBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ translateY: -8 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-lg sm:rounded-2xl bg-gradient-to-br from-black to-orange-950 w-[280px] sm:w-full mx-auto"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 prison-bars opacity-10" />
      <div className="absolute inset-0 noise" />
      
      {/* Image Section */}
      <div className="relative h-32 sm:h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent z-10" />
        <img
          src={image}
          alt=""
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-20">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="bg-orange-500 text-white text-sm sm:text-xl font-black px-2 sm:px-4 py-1 sm:py-2 rounded-lg transform -rotate-6"
          >
            {discount}
          </motion.div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="relative p-3 sm:p-6">
        <div className="mb-3 sm:mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">{title}</h3>
          <p className="text-sm text-gray-400 line-clamp-2 mb-3 sm:mb-4">{description}</p>
          
          {code && (
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="flex-1 relative group/code">
                <div 
                  className="bg-orange-500/5 border border-dashed border-orange-500/20 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 
                  transition-colors group-hover/code:bg-orange-500/10"
                >
                  <span className="text-orange-500 font-mono font-bold text-xs sm:text-sm tracking-wider">
                    {code}
                  </span>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-orange-500 text-white text-xs px-2 py-1 rounded-full"
                >
                  Click to copy
                </motion.div>
              </div>
              {expiryDate && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>{expiryDate}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <motion.a
          href={link}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-between w-full bg-gradient-to-r from-orange-500 to-orange-600 
            hover:from-orange-600 hover:to-orange-700 text-white font-bold px-3 sm:px-4 py-2 sm:py-3 rounded-lg 
            transition-all text-sm sm:text-base group/button"
        >
          <span>Claim Offer</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover/button:translate-x-1" />
        </motion.a>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/20 to-transparent opacity-0 
        group-hover:opacity-100 transition-opacity duration-700 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-orange-500/10 to-transparent opacity-0 
        group-hover:opacity-100 transition-opacity duration-700 blur-2xl" />
    </motion.div>
  )
}
