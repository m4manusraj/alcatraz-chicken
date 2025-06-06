'use client'

import { useState, useEffect } from 'react'

interface ViewportSize {
  width: number
  height: number
}

export function useViewportSize(): ViewportSize {
  const [size, setSize] = useState<ViewportSize>({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    // Function to update size
    function updateSize() {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    // Set size initially
    updateSize()

    // Add event listener
    window.addEventListener('resize', updateSize)

    // Cleanup
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  return size
}
