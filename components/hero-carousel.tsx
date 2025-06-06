'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useViewportSize } from '@/hooks/use-viewport-size'

interface Slide {
  title: string
  subtitle: string
  description: string
  gradientStart: string
  gradientMiddle: string
  gradientEnd: string
  image: string
  cta: {
    primary: string
    secondary: string
  }
}

const slides: Slide[] = [
  {
    title: "ESCAPE TO",
    subtitle: "FLAVOR",
    description: "Break free from ordinary fried chicken. Experience the most wanted taste in Kelowna.",
    gradientStart: "from-orange-500/80",
    gradientMiddle: "via-red-500/50",
    gradientEnd: "to-purple-900",
    image: "https://res.cloudinary.com/dokqexnoi/image/upload/v1736053115/11bd1e8d-416a-4839-a2c4-f41f5fb3c2d1.png",
    cta: {
      primary: "Order Now",
      secondary: "View Menu"
    }
  },
  {
    title: "MOST WANTED",
    subtitle: "WINGS",
    description: "Choose from our signature flavors, from mild to maximum security heat levels.",
    gradientStart: "from-red-500/80",
    gradientMiddle: "via-orange-500/50",
    gradientEnd: "to-rose-900",
    image: "https://res.cloudinary.com/dokqexnoi/image/upload/v1736053115/11bd1e8d-416a-4839-a2c4-f41f5fb3c2d1.png",
    cta: {
      primary: "Try Now",
      secondary: "See Flavors"
    }
  },
  {
    title: "FAMILY",
    subtitle: "FEAST",
    description: "Perfect for gang gatherings. Feed the whole crew with our legendary family combos.",
    gradientStart: "from-purple-500/80",
    gradientMiddle: "via-orange-500/50",
    gradientEnd: "to-red-900",
    image: "https://res.cloudinary.com/dokqexnoi/image/upload/v1736053115/11bd1e8d-416a-4839-a2c4-f41f5fb3c2d1.png",
    cta: {
      primary: "Order Feast",
      secondary: "Learn More"
    }
  }
]

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const { height: viewportHeight } = useViewportSize()

  useEffect(() => {
    if (!isAutoPlaying) return

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [isAutoPlaying])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setIsAutoPlaying(false)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setIsAutoPlaying(false)
  }

  return (
    <div 
      className="relative w-full overflow-hidden"
      style={{ 
        minHeight: '600px',
        height: `${viewportHeight}px`
      }}
    >
      {/* Background Elements */}
      <AnimatePresence initial={false}>
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].gradientStart} ${slides[currentSlide].gradientMiddle} ${slides[currentSlide].gradientEnd}`} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />
          <div className="absolute inset-0 prison-bars opacity-30" />
          <div className="absolute inset-0 noise" />
        </motion.div>
      </AnimatePresence>

      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-1/2 -left-1/2 w-full h-full border-[100px] border-orange-500/10 rounded-full"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full border-[100px] border-orange-500/10 rounded-full"
        />
      </div>

      {/* Content */}
      <div className="relative h-full">
        <div className="container h-full px-4 pb-safe">
          <div className="grid lg:grid-cols-2 h-full items-center gap-8 lg:gap-12">
            {/* Text Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${currentSlide}`}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.5 }}
                className="text-center lg:text-left relative z-10 mt-safe"
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white mb-4 sm:mb-6">
                  <span className="block text-outline mb-1 sm:mb-2">{slides[currentSlide].title}</span>
                  <span className="text-orange-500">{slides[currentSlide].subtitle}</span>
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0">
                  {slides[currentSlide].description}
                </p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-12 sm:mb-16"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-orange-500 text-white font-bold rounded-lg text-base sm:text-lg"
                  >
                    {slides[currentSlide].cta.primary}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white font-bold rounded-lg text-base sm:text-lg"
                  >
                    {slides[currentSlide].cta.secondary}
                  </motion.button>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Image Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`image-${currentSlide}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="relative h-[300px] sm:h-[400px] lg:h-full max-h-[70vh] lg:max-h-full order-first lg:order-last"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-orange-500/20 rounded-full"
                  />
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: -360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-10 border-2 border-orange-500/10 rounded-full"
                  />
                </div>
                <motion.img
                  src={slides[currentSlide].image}
                  alt=""
                  className="w-full h-full object-contain relative z-10"
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, 0]
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between container px-4 pointer-events-none">
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white border border-white/20 pointer-events-auto"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white border border-white/20 pointer-events-auto"
          onClick={nextSlide}
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute left-1/2 -translate-x-1/2 flex gap-2 sm:gap-3 bottom-8 sm:bottom-12">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentSlide(index)
              setIsAutoPlaying(false)
            }}
            className={`w-12 sm:w-16 h-1.5 rounded-full transition-all ${
              index === currentSlide
                ? 'bg-orange-500 w-20 sm:w-24'
                : 'bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
