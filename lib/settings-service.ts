import { doc, getDoc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { RestaurantSettings } from "@/types/menu"

// Cache for settings to avoid repeated fetches
let settingsCache: RestaurantSettings | null = null
const settingsListeners: ((settings: RestaurantSettings | null) => void)[] = []

export async function getRestaurantSettings(): Promise<RestaurantSettings | null> {
  try {
    if (settingsCache) {
      return settingsCache
    }

    const settingsDoc = await getDoc(doc(db, "settings", "main"))
    if (settingsDoc.exists()) {
      settingsCache = settingsDoc.data() as RestaurantSettings
      return settingsCache
    }
    return null
  } catch (error) {
    console.error("Error fetching restaurant settings:", error)
    return null
  }
}

export function subscribeToRestaurantSettings(callback: (settings: RestaurantSettings | null) => void) {
  settingsListeners.push(callback)

  // Set up real-time listener
  const unsubscribe = onSnapshot(
    doc(db, "settings", "main"),
    (doc) => {
      if (doc.exists()) {
        settingsCache = doc.data() as RestaurantSettings
      } else {
        settingsCache = null
      }

      // Notify all listeners
      settingsListeners.forEach((listener) => listener(settingsCache))
    },
    (error) => {
      console.error("Error in settings subscription:", error)
      settingsListeners.forEach((listener) => listener(null))
    },
  )

  // Return unsubscribe function
  return () => {
    const index = settingsListeners.indexOf(callback)
    if (index > -1) {
      settingsListeners.splice(index, 1)
    }

    // If no more listeners, unsubscribe from Firestore
    if (settingsListeners.length === 0) {
      unsubscribe()
    }
  }
}

export function formatOperatingHours(hours: RestaurantSettings["operatingHours"]): string {
  if (!hours || hours.length === 0) return "Hours not available"

  const openDays = hours.filter((h) => h.isOpen)
  if (openDays.length === 0) return "Closed"

  // Group consecutive days with same hours
  const grouped: { days: string[]; hours: string }[] = []

  openDays.forEach((day) => {
    const timeStr = `${day.openTime} - ${day.closeTime}`
    const existing = grouped.find((g) => g.hours === timeStr)

    if (existing) {
      existing.days.push(day.dayOfWeek)
    } else {
      grouped.push({ days: [day.dayOfWeek], hours: timeStr })
    }
  })

  return grouped
    .map((g) => {
      const daysStr = g.days.length > 1 ? `${g.days[0]} - ${g.days[g.days.length - 1]}` : g.days[0]
      return `${daysStr}: ${g.hours}`
    })
    .join("\n")
}
