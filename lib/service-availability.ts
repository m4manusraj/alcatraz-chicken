import type { RestaurantSettings, OperatingHours } from "@/types/menu"

// Kelowna, BC timezone
const KELOWNA_TIMEZONE = "America/Vancouver"

export function getKelownaTime(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: KELOWNA_TIMEZONE }))
}

export function getCurrentDayOfWeek(): string {
  const kelownaTime = getKelownaTime()
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  return days[kelownaTime.getDay()]
}

export function getCurrentTimeString(): string {
  const kelownaTime = getKelownaTime()
  return kelownaTime.toTimeString().slice(0, 5) // HH:MM format
}

export function timeStringToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(":").map(Number)
  return hours * 60 + minutes
}

export function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
}

export function isServiceAvailable(
  settings: RestaurantSettings,
  serviceType: "delivery" | "pickup",
): {
  available: boolean
  reason?: string
  nextAvailable?: string
  nextAvailableDay?: string
} {
  const serviceSettings = serviceType === "delivery" ? settings.deliverySettings : settings.pickupSettings

  if (!serviceSettings?.enabled) {
    return { available: false, reason: `${serviceType} is currently disabled` }
  }

  const currentDay = getCurrentDayOfWeek()
  const currentTime = getCurrentTimeString()
  const currentMinutes = timeStringToMinutes(currentTime)

  // Determine which hours to use
  const hoursToUse = serviceSettings.useStoreHours
    ? settings.operatingHours
    : serviceSettings.customHours || settings.operatingHours

  // Find today's hours
  const todayHours = hoursToUse.find((h) => h.dayOfWeek === currentDay)

  if (!todayHours?.isOpen || !todayHours.openTime || !todayHours.closeTime) {
    // Find next available day
    const nextAvailable = findNextAvailableTime(hoursToUse, serviceSettings.offsetMinutes)
    return {
      available: false,
      reason: `${serviceType} is closed today`,
      ...nextAvailable,
    }
  }

  const openMinutes = timeStringToMinutes(todayHours.openTime)
  const closeMinutes = timeStringToMinutes(todayHours.closeTime)
  const effectiveCloseMinutes = closeMinutes - (serviceSettings.offsetMinutes || 0)

  // Check if currently within service hours
  if (currentMinutes < openMinutes) {
    return {
      available: false,
      reason: `${serviceType} opens at ${todayHours.openTime}`,
      nextAvailable: todayHours.openTime,
      nextAvailableDay: "today",
    }
  }

  if (currentMinutes >= effectiveCloseMinutes) {
    // Find next available time
    const nextAvailable = findNextAvailableTime(hoursToUse, serviceSettings.offsetMinutes)
    const offsetText = serviceSettings.offsetMinutes
      ? ` (stops ${serviceSettings.offsetMinutes} min before closing)`
      : ""
    return {
      available: false,
      reason: `${serviceType} closed for today${offsetText}`,
      ...nextAvailable,
    }
  }

  return { available: true }
}

function findNextAvailableTime(
  hours: OperatingHours[],
  offsetMinutes = 0,
): { nextAvailable?: string; nextAvailableDay?: string } {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const currentDayIndex = days.indexOf(getCurrentDayOfWeek())

  // Check remaining days this week and next week
  for (let i = 1; i <= 7; i++) {
    const dayIndex = (currentDayIndex + i) % 7
    const dayName = days[dayIndex] as OperatingHours["dayOfWeek"]
    const dayHours = hours.find((h) => h.dayOfWeek === dayName)

    if (dayHours?.isOpen && dayHours.openTime) {
      const dayLabel = i === 1 ? "tomorrow" : i <= 6 ? dayName : `next ${dayName}`

      return {
        nextAvailable: dayHours.openTime,
        nextAvailableDay: dayLabel,
      }
    }
  }

  return {}
}

export function getServiceStatus(settings: RestaurantSettings) {
  const deliveryStatus = isServiceAvailable(settings, "delivery")
  const pickupStatus = isServiceAvailable(settings, "pickup")

  return {
    delivery: deliveryStatus,
    pickup: pickupStatus,
    anyAvailable: deliveryStatus.available || pickupStatus.available,
  }
}
