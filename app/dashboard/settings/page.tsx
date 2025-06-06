"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Switch } from "@/components/ui/switch"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Save, Info, Clock, Truck, Phone, Bell, AlertTriangle } from "lucide-react"
import type { RestaurantSettings, OperatingHours } from "@/types/menu"

const initialSettings: RestaurantSettings = {
  id: "main",
  restaurantName: "Alcatraz Chicken",
  address: {
    street: "101-225 Rutland Rd S",
    city: "Kelowna",
    province: "BC",
    postalCode: "V1X 3B1",
    country: "Canada",
  },
  phone: "(250) 123-4567",
  email: "info@alcatrazchicken.com",
  operatingHours: [
    { dayOfWeek: "Monday", isOpen: true, openTime: "11:00", closeTime: "22:00" },
    { dayOfWeek: "Tuesday", isOpen: true, openTime: "11:00", closeTime: "22:00" },
    { dayOfWeek: "Wednesday", isOpen: true, openTime: "11:00", closeTime: "22:00" },
    { dayOfWeek: "Thursday", isOpen: true, openTime: "11:00", closeTime: "22:00" },
    { dayOfWeek: "Friday", isOpen: true, openTime: "11:00", closeTime: "23:00" },
    { dayOfWeek: "Saturday", isOpen: true, openTime: "11:00", closeTime: "23:00" },
    { dayOfWeek: "Sunday", isOpen: true, openTime: "12:00", closeTime: "21:00" },
  ],
  currency: "CAD",
  deliverySettings: {
    enabled: true,
    baseFee: 5,
    freeDeliveryOverAmount: 50,
    estimatedTimeMinutes: 45,
    zones: [],
    useStoreHours: true,
    customHours: [],
    offsetMinutes: 30,
  },
  pickupSettings: {
    enabled: true,
    estimatedTimeMinutes: 20,
    useStoreHours: true,
    customHours: [],
    offsetMinutes: 15,
  },
  socialMediaLinks: { instagram: "", facebook: "", twitter: "" },
  bannerSettings: { enabled: true },
  updatedAt: null,
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<RestaurantSettings>(initialSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, "settings", "main"))
        if (settingsDoc.exists()) {
          setSettings({ ...initialSettings, ...settingsDoc.data() } as RestaurantSettings)
        }
      } catch (err) {
        console.error("Error fetching settings:", err)
        setError("Failed to load settings. Displaying default values.")
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleOperatingHoursChange = (index: number, field: keyof OperatingHours, value: any) => {
    const newHours = [...settings.operatingHours]
    newHours[index] = { ...newHours[index], [field]: value }
    setSettings((prev) => ({ ...prev, operatingHours: newHours }))
  }

  const handleCustomHoursChange = (
    serviceType: "delivery" | "pickup",
    index: number,
    field: keyof OperatingHours,
    value: any,
  ) => {
    const serviceKey = serviceType === "delivery" ? "deliverySettings" : "pickupSettings"
    const currentSettings = settings[serviceKey]!
    const newCustomHours = [...(currentSettings.customHours || settings.operatingHours)]
    newCustomHours[index] = { ...newCustomHours[index], [field]: value }

    setSettings((prev) => ({
      ...prev,
      [serviceKey]: {
        ...currentSettings,
        customHours: newCustomHours,
      },
    }))
  }

  const handleDeliverySettingsChange = (
    field: keyof NonNullable<RestaurantSettings["deliverySettings"]>,
    value: any,
  ) => {
    setSettings((prev) => ({
      ...prev,
      deliverySettings: {
        ...prev.deliverySettings!,
        [field]: value,
        // Initialize custom hours if switching to custom and they don't exist
        ...(field === "useStoreHours" && !value && !prev.deliverySettings?.customHours
          ? {
              customHours: [...prev.operatingHours],
            }
          : {}),
      },
    }))
  }

  const handlePickupSettingsChange = (field: keyof NonNullable<RestaurantSettings["pickupSettings"]>, value: any) => {
    setSettings((prev) => ({
      ...prev,
      pickupSettings: {
        ...prev.pickupSettings!,
        [field]: value,
        // Initialize custom hours if switching to custom and they don't exist
        ...(field === "useStoreHours" && !value && !prev.pickupSettings?.customHours
          ? {
              customHours: [...prev.operatingHours],
            }
          : {}),
      },
    }))
  }

  const handleSocialMediaChange = (
    platform: keyof NonNullable<RestaurantSettings["socialMediaLinks"]>,
    value: string,
  ) => {
    setSettings((prev) => ({ ...prev, socialMediaLinks: { ...prev.socialMediaLinks, [platform]: value } }))
  }

  const handleBannerSettingsChange = (field: keyof NonNullable<RestaurantSettings["bannerSettings"]>, value: any) => {
    setSettings((prev) => ({
      ...prev,
      bannerSettings: {
        ...prev.bannerSettings,
        [field]: value,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const settingsToSave = { ...settings, updatedAt: serverTimestamp() }
      await setDoc(doc(db, "settings", "main"), settingsToSave)
      setSuccessMessage("Settings saved successfully!")
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error("Error saving settings:", err)
      setError("Failed to save settings. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading)
    return (
      <div className="flex justify-center items-center py-10">
        <LoadingSpinner />
      </div>
    )

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Restaurant Settings</h1>
        <Button type="submit" disabled={saving} className="bg-orange-500 hover:bg-orange-600">
          {saving ? (
            <LoadingSpinner />
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Save Settings
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-3 rounded-md flex items-center gap-2">
          <Info className="h-4 w-4" /> {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-700/30 border border-green-500/30 text-green-400 p-3 rounded-md flex items-center gap-2">
          <Info className="h-4 w-4" /> {successMessage}
        </div>
      )}

      <Accordion type="multiple" defaultValue={["hours", "deliveryPickup", "banner"]} className="w-full space-y-4">
        {/* Operating Hours */}
        <AccordionItem value="hours" className="border border-orange-500/20 rounded-lg bg-black/30">
          <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-white hover:no-underline">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-orange-400" />
              Store Operating Hours
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2 space-y-3">
            {settings.operatingHours.map((hour, index) => (
              <div
                key={index}
                className="grid grid-cols-4 gap-3 items-center p-2 border-b border-orange-500/10 last:border-b-0"
              >
                <Label className="col-span-1 text-sm text-gray-300">{hour.dayOfWeek}</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={hour.isOpen}
                    onCheckedChange={(val) => handleOperatingHoursChange(index, "isOpen", val)}
                  />
                  <span className="text-xs">{hour.isOpen ? "Open" : "Closed"}</span>
                </div>
                <Input
                  type="time"
                  value={hour.openTime || ""}
                  disabled={!hour.isOpen}
                  onChange={(e) => handleOperatingHoursChange(index, "openTime", e.target.value)}
                  className="text-xs h-8"
                />
                <Input
                  type="time"
                  value={hour.closeTime || ""}
                  disabled={!hour.isOpen}
                  onChange={(e) => handleOperatingHoursChange(index, "closeTime", e.target.value)}
                  className="text-xs h-8"
                />
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* Delivery & Pickup Settings */}
        <AccordionItem value="deliveryPickup" className="border border-orange-500/20 rounded-lg bg-black/30">
          <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-white hover:no-underline">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-orange-400" />
              Delivery & Pickup Services
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2 space-y-8">
            {/* Delivery Settings */}
            <div>
              <h4 className="font-medium text-white mb-4 flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Delivery Settings
              </h4>
              <div className="space-y-4 p-4 border border-orange-500/10 rounded-md">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="deliveryEnabled"
                    checked={settings.deliverySettings?.enabled}
                    onCheckedChange={(val) => handleDeliverySettingsChange("enabled", val)}
                  />
                  <Label htmlFor="deliveryEnabled">Enable Delivery Service</Label>
                </div>

                {settings.deliverySettings?.enabled && (
                  <div className="space-y-4 pl-6 border-l-2 border-orange-500/20">
                    {/* Basic Settings */}
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="deliveryFee">Base Fee ($)</Label>
                        <Input
                          id="deliveryFee"
                          type="number"
                          step="0.01"
                          value={settings.deliverySettings.baseFee}
                          onChange={(e) => handleDeliverySettingsChange("baseFee", Number.parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="freeDeliveryOver">Free Delivery Over ($)</Label>
                        <Input
                          id="freeDeliveryOver"
                          type="number"
                          step="0.01"
                          value={settings.deliverySettings.freeDeliveryOverAmount}
                          onChange={(e) =>
                            handleDeliverySettingsChange("freeDeliveryOverAmount", Number.parseFloat(e.target.value))
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="deliveryTime">Est. Time (minutes)</Label>
                        <Input
                          id="deliveryTime"
                          type="number"
                          value={settings.deliverySettings.estimatedTimeMinutes}
                          onChange={(e) =>
                            handleDeliverySettingsChange("estimatedTimeMinutes", Number.parseInt(e.target.value))
                          }
                        />
                      </div>
                    </div>

                    {/* Hours Settings */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="deliveryUseStoreHours"
                          checked={settings.deliverySettings.useStoreHours}
                          onCheckedChange={(val) => handleDeliverySettingsChange("useStoreHours", val)}
                        />
                        <Label htmlFor="deliveryUseStoreHours">Use Store Hours</Label>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="deliveryOffset">Stop accepting orders (minutes before closing)</Label>
                        <Input
                          id="deliveryOffset"
                          type="number"
                          min="0"
                          max="120"
                          value={settings.deliverySettings.offsetMinutes}
                          onChange={(e) =>
                            handleDeliverySettingsChange("offsetMinutes", Number.parseInt(e.target.value) || 0)
                          }
                        />
                        <p className="text-xs text-gray-400">
                          Delivery will stop accepting orders this many minutes before closing time
                        </p>
                      </div>

                      {!settings.deliverySettings.useStoreHours && (
                        <div className="space-y-3 p-3 bg-black/20 rounded-md">
                          <h5 className="text-sm font-medium text-white">Custom Delivery Hours</h5>
                          {(settings.deliverySettings.customHours || settings.operatingHours).map((hour, index) => (
                            <div key={index} className="grid grid-cols-4 gap-2 items-center text-sm">
                              <Label className="text-gray-300">{hour.dayOfWeek}</Label>
                              <div className="flex items-center space-x-1">
                                <Switch
                                  checked={hour.isOpen}
                                  onCheckedChange={(val) => handleCustomHoursChange("delivery", index, "isOpen", val)}
                                />
                                <span className="text-xs">{hour.isOpen ? "Open" : "Closed"}</span>
                              </div>
                              <Input
                                type="time"
                                value={hour.openTime || ""}
                                disabled={!hour.isOpen}
                                onChange={(e) => handleCustomHoursChange("delivery", index, "openTime", e.target.value)}
                                className="text-xs h-7"
                              />
                              <Input
                                type="time"
                                value={hour.closeTime || ""}
                                disabled={!hour.isOpen}
                                onChange={(e) =>
                                  handleCustomHoursChange("delivery", index, "closeTime", e.target.value)
                                }
                                className="text-xs h-7"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pickup Settings */}
            <div>
              <h4 className="font-medium text-white mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pickup Settings
              </h4>
              <div className="space-y-4 p-4 border border-orange-500/10 rounded-md">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="pickupEnabled"
                    checked={settings.pickupSettings?.enabled}
                    onCheckedChange={(val) => handlePickupSettingsChange("enabled", val)}
                  />
                  <Label htmlFor="pickupEnabled">Enable Pickup Service</Label>
                </div>

                {settings.pickupSettings?.enabled && (
                  <div className="space-y-4 pl-6 border-l-2 border-orange-500/20">
                    <div className="space-y-1">
                      <Label htmlFor="pickupTime">Est. Prep Time (minutes)</Label>
                      <Input
                        id="pickupTime"
                        type="number"
                        value={settings.pickupSettings.estimatedTimeMinutes}
                        onChange={(e) =>
                          handlePickupSettingsChange("estimatedTimeMinutes", Number.parseInt(e.target.value))
                        }
                      />
                    </div>

                    {/* Hours Settings */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="pickupUseStoreHours"
                          checked={settings.pickupSettings.useStoreHours}
                          onCheckedChange={(val) => handlePickupSettingsChange("useStoreHours", val)}
                        />
                        <Label htmlFor="pickupUseStoreHours">Use Store Hours</Label>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="pickupOffset">Stop accepting orders (minutes before closing)</Label>
                        <Input
                          id="pickupOffset"
                          type="number"
                          min="0"
                          max="120"
                          value={settings.pickupSettings.offsetMinutes}
                          onChange={(e) =>
                            handlePickupSettingsChange("offsetMinutes", Number.parseInt(e.target.value) || 0)
                          }
                        />
                        <p className="text-xs text-gray-400">
                          Pickup will stop accepting orders this many minutes before closing time
                        </p>
                      </div>

                      {!settings.pickupSettings.useStoreHours && (
                        <div className="space-y-3 p-3 bg-black/20 rounded-md">
                          <h5 className="text-sm font-medium text-white">Custom Pickup Hours</h5>
                          {(settings.pickupSettings.customHours || settings.operatingHours).map((hour, index) => (
                            <div key={index} className="grid grid-cols-4 gap-2 items-center text-sm">
                              <Label className="text-gray-300">{hour.dayOfWeek}</Label>
                              <div className="flex items-center space-x-1">
                                <Switch
                                  checked={hour.isOpen}
                                  onCheckedChange={(val) => handleCustomHoursChange("pickup", index, "isOpen", val)}
                                />
                                <span className="text-xs">{hour.isOpen ? "Open" : "Closed"}</span>
                              </div>
                              <Input
                                type="time"
                                value={hour.openTime || ""}
                                disabled={!hour.isOpen}
                                onChange={(e) => handleCustomHoursChange("pickup", index, "openTime", e.target.value)}
                                className="text-xs h-7"
                              />
                              <Input
                                type="time"
                                value={hour.closeTime || ""}
                                disabled={!hour.isOpen}
                                onChange={(e) => handleCustomHoursChange("pickup", index, "closeTime", e.target.value)}
                                className="text-xs h-7"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Banner Settings */}
        <AccordionItem value="banner" className="border border-orange-500/20 rounded-lg bg-black/30">
          <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-white hover:no-underline">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-orange-400" />
              Service Banner Settings
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="bannerEnabled"
                  checked={settings.bannerSettings?.enabled !== false}
                  onCheckedChange={(val) => handleBannerSettingsChange("enabled", val)}
                />
                <Label htmlFor="bannerEnabled">Show service unavailable banner</Label>
              </div>
              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-300">
                    <p className="font-medium mb-1">About the service banner:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Shows at the top of all pages when delivery or pickup services are unavailable</li>
                      <li>• Displays the reason services are closed and when they'll next be available</li>
                      <li>• Uses Kelowna, BC time zone for accurate service hours</li>
                      <li>• Updates automatically every minute</li>
                      <li>• Visitors can dismiss the banner temporarily</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Social Media Links */}
        <AccordionItem value="social" className="border border-orange-500/20 rounded-lg bg-black/30">
          <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-white hover:no-underline">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-orange-400" />
              Social Media Links
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2 space-y-3">
            <div className="space-y-1">
              <Label htmlFor="instagram">Instagram URL</Label>
              <Input
                id="instagram"
                value={settings.socialMediaLinks?.instagram || ""}
                onChange={(e) => handleSocialMediaChange("instagram", e.target.value)}
                placeholder="https://instagram.com/alcatrazchicken"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="facebook">Facebook URL</Label>
              <Input
                id="facebook"
                value={settings.socialMediaLinks?.facebook || ""}
                onChange={(e) => handleSocialMediaChange("facebook", e.target.value)}
                placeholder="https://facebook.com/alcatrazchicken"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="twitter">Twitter/X URL</Label>
              <Input
                id="twitter"
                value={settings.socialMediaLinks?.twitter || ""}
                onChange={(e) => handleSocialMediaChange("twitter", e.target.value)}
                placeholder="https://twitter.com/alcatrazchicken"
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-end mt-8">
        <Button type="submit" disabled={saving} className="bg-orange-500 hover:bg-orange-600">
          {saving ? (
            <LoadingSpinner />
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Save All Settings
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
