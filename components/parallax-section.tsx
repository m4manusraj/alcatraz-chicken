'use client'

import { useScroll, useTransform, motion } from 'framer-motion'
import { useRef } from 'react'

export function ParallaxSection({ 
  children,
  baseVelocity = 3
}: { 
  children: React.ReactNode
  baseVelocity?: number 
}) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, -300])

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className="relative"
    >
      {children}
    </motion.div>
  )
}
