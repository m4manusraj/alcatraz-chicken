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
import { Save, Info, Clock, DollarSign, Truck, Phone } from "lucide-react"
import type { RestaurantSettings, OperatingHours, Address } from "@/types/menu"

const initialSettings: RestaurantSettings = {
  id: "main",
  restaurantName: "",
  address: { street: "", city: "", province: "", postalCode: "", country: "Canada" },
  phone: "",
  email: "",
  operatingHours: [
    { dayOfWeek: "Monday", isOpen: true, openTime: "11:00", closeTime: "22:00" },
    { dayOfWeek: "Tuesday", isOpen: true, openTime: "11:00", closeTime: "22:00" },
    { dayOfWeek: "Wednesday", isOpen: true, openTime: "11:00", closeTime: "22:00" },
    { dayOfWeek: "Thursday", isOpen: true, openTime: "11:00", closeTime: "22:00" },
    { dayOfWeek: "Friday", isOpen: true, openTime: "11:00", closeTime: "23:00" },
    { dayOfWeek: "Saturday", isOpen: true, openTime: "11:00", closeTime: "23:00" },
    { dayOfWeek: "Sunday", isOpen: true, openTime: "12:00", closeTime: "21:00" },
  ],
  taxRatePercentage: 5,
  currency: "CAD",
  deliverySettings: { enabled: true, baseFee: 5, freeDeliveryOverAmount: 50, estimatedTimeMinutes: 45, zones: [] },
  pickupSettings: { enabled: true, estimatedTimeMinutes: 20 },
  socialMediaLinks: { instagram: "", facebook: "", twitter: "" },
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
        } else {
          // If no settings exist, initialize with defaults (already done by useState)
          // Optionally, save initial settings to Firestore here if desired
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

  const handleInputChange = (section: keyof RestaurantSettings, field: string, value: any) => {
    setSettings((prev) => {
      const sectionData = prev[section]
      if (typeof sectionData === "object" && sectionData !== null) {
        return { ...prev, [section]: { ...sectionData, [field]: value } }
      }
      return { ...prev, [field]: value } // For top-level fields like restaurantName
    })
  }

  const handleAddressChange = (field: keyof Address, value: string) => {
    setSettings((prev) => ({ ...prev, address: { ...prev.address, [field]: value } }))
  }

  const handleOperatingHoursChange = (index: number, field: keyof OperatingHours, value: any) => {
    const newHours = [...settings.operatingHours]
    newHours[index] = { ...newHours[index], [field]: value }
    setSettings((prev) => ({ ...prev, operatingHours: newHours }))
  }

  const handleDeliverySettingsChange = (
    field: keyof NonNullable<RestaurantSettings["deliverySettings"]>,
    value: any,
  ) => {
    setSettings((prev) => ({ ...prev, deliverySettings: { ...prev.deliverySettings!, [field]: value } }))
  }

  const handlePickupSettingsChange = (field: keyof NonNullable<RestaurantSettings["pickupSettings"]>, value: any) => {
    setSettings((prev) => ({ ...prev, pickupSettings: { ...prev.pickupSettings!, [field]: value } }))
  }

  const handleSocialMediaChange = (
    platform: keyof NonNullable<RestaurantSettings["socialMediaLinks"]>,
    value: string,
  ) => {
    setSettings((prev) => ({ ...prev, socialMediaLinks: { ...prev.socialMediaLinks, [platform]: value } }))
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

      <Accordion type="multiple" defaultValue={["general", "hours", "financial"]} className="w-full space-y-4">
        {/* General Information */}
        <AccordionItem value="general" className="border border-orange-500/20 rounded-lg bg-black/30">
          <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-white hover:no-underline">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-orange-400" />
              General Information
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="restaurantName">Restaurant Name</Label>
                <Input
                  id="restaurantName"
                  value={settings.restaurantName}
                  onChange={(e) => setSettings((prev) => ({ ...prev, restaurantName: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone">Contact Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => setSettings((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>
            <h4 className="font-medium text-white pt-2">Address</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="street">Street</Label>
                <Input
                  id="street"
                  value={settings.address.street}
                  onChange={(e) => handleAddressChange("street", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={settings.address.city}
                  onChange={(e) => handleAddressChange("city", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="province">Province</Label>
                <Input
                  id="province"
                  value={settings.address.province}
                  onChange={(e) => handleAddressChange("province", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={settings.address.postalCode}
                  onChange={(e) => handleAddressChange("postalCode", e.target.value)}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Operating Hours */}
        <AccordionItem value="hours" className="border border-orange-500/20 rounded-lg bg-black/30">
          <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-white hover:no-underline">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-orange-400" />
              Operating Hours
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

        {/* Financial Settings */}
        <AccordionItem value="financial" className="border border-orange-500/20 rounded-lg bg-black/30">
          <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-white hover:no-underline">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-orange-400" />
              Financial Settings
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2 grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                step="0.01"
                value={settings.taxRatePercentage}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, taxRatePercentage: Number.parseFloat(e.target.value) || 0 }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="currency">Currency Code</Label>
              <Input
                id="currency"
                value={settings.currency}
                onChange={(e) => setSettings((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))}
                placeholder="e.g., CAD"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Delivery & Pickup Settings */}
        <AccordionItem value="deliveryPickup" className="border border-orange-500/20 rounded-lg bg-black/30">
          <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-white hover:no-underline">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-orange-400" />
              Delivery & Pickup
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-2 space-y-6">
            {/* Delivery Settings */}
            <div>
              <h4 className="font-medium text-white mb-2">Delivery Settings</h4>
              <div className="space-y-3 p-3 border border-orange-500/10 rounded-md">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="deliveryEnabled"
                    checked={settings.deliverySettings?.enabled}
                    onCheckedChange={(val) => handleDeliverySettingsChange("enabled", val)}
                  />
                  <Label htmlFor="deliveryEnabled">Enable Delivery</Label>
                </div>
                {settings.deliverySettings?.enabled && (
                  <>
                    <div className="grid sm:grid-cols-2 gap-3">
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
                    {/* Delivery Zones could be added here as a more complex component */}
                  </>
                )}
              </div>
            </div>
            {/* Pickup Settings */}
            <div>
              <h4 className="font-medium text-white mb-2">Pickup Settings</h4>
              <div className="space-y-3 p-3 border border-orange-500/10 rounded-md">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="pickupEnabled"
                    checked={settings.pickupSettings?.enabled}
                    onCheckedChange={(val) => handlePickupSettingsChange("enabled", val)}
                  />
                  <Label htmlFor="pickupEnabled">Enable Pickup</Label>
                </div>
                {settings.pickupSettings?.enabled && (
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
                )}
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
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="facebook">Facebook URL</Label>
              <Input
                id="facebook"
                value={settings.socialMediaLinks?.facebook || ""}
                onChange={(e) => handleSocialMediaChange("facebook", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="twitter">Twitter/X URL</Label>
              <Input
                id="twitter"
                value={settings.socialMediaLinks?.twitter || ""}
                onChange={(e) => handleSocialMediaChange("twitter", e.target.value)}
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
