"use client"

import type React from "react"

import { useState, useEffect, useId } from "react"
import { addDoc, updateDoc, doc, collection, getDocs, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { LoadingSpinner } from "@/components/loading-spinner"
import { GripVertical, Plus, Minus, Trash2, DollarSign, Info } from "lucide-react"
import type { ComboMeal, MenuItem, ComboItemConfiguration } from "@/types/menu"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ComboMealDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  comboToEdit?: ComboMeal | null
  onSave?: () => void
}

// Represents a menu item as it's being configured within the combo dialog
interface ConfigurableComboItem extends MenuItem {
  comboItemId: string // Unique ID for this item *instance* in the combo
  quantity: number
  selectedVariationId?: string
  selectedAddonIds: string[]
  isOptional: boolean
}

const initialFormData: Partial<ComboMeal> = {
  name: "",
  description: "",
  price: undefined, // Explicitly undefined to allow auto-calculation
  isActive: true,
  items: [],
}

export function ComboMealDialog({ open, onOpenChange, comboToEdit, onSave }: ComboMealDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [availableMenuItems, setAvailableMenuItems] = useState<MenuItem[]>([])
  const [configuredItems, setConfiguredItems] = useState<ConfigurableComboItem[]>([])
  const [formData, setFormData] = useState<Partial<ComboMeal>>(initialFormData)

  const uniqueId = useId()

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "menuItems"))
        const items = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }) as MenuItem)
          .filter((item) => item.isActive) // Only active items can be added to combos
        setAvailableMenuItems(items)
      } catch (err) {
        console.error("Error fetching menu items:", err)
        setError("Failed to load available menu items.")
      }
    }

    if (open) {
      fetchMenuItems()
      if (comboToEdit) {
        setFormData({ ...initialFormData, ...comboToEdit })
        setImagePreview(comboToEdit.image || null)
        // This needs to wait for availableMenuItems to be populated
      } else {
        setFormData(initialFormData)
        setConfiguredItems([])
        setImagePreview(null)
      }
      setError(null)
    }
  }, [open, comboToEdit])

  useEffect(() => {
    // Populate configuredItems when editing and availableMenuItems are loaded
    if (comboToEdit && availableMenuItems.length > 0 && configuredItems.length === 0) {
      const itemsToConfigure = comboToEdit.items
        .map((comboItem) => {
          const menuItem = availableMenuItems.find((mi) => mi.id === comboItem.menuItemId)
          if (!menuItem) return null
          return {
            ...menuItem,
            comboItemId: comboItem.id || crypto.randomUUID(), // Use existing ID or generate new
            quantity: comboItem.quantity,
            selectedVariationId: comboItem.selectedVariationId,
            selectedAddonIds: comboItem.selectedAddonIds || [],
            isOptional: comboItem.isOptional || false,
          }
        })
        .filter(Boolean) as ConfigurableComboItem[]
      setConfiguredItems(itemsToConfigure)
    }
  }, [comboToEdit, availableMenuItems, open]) // Add open to re-evaluate if dialog reopens

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    } else {
      setImageFile(null)
      setImagePreview(comboToEdit?.image || null)
    }
  }

  const handleAddItemToCombo = (menuItemId: string) => {
    const itemToAdd = availableMenuItems.find((i) => i.id === menuItemId)
    if (!itemToAdd) return

    setConfiguredItems((prev) => [
      ...prev,
      {
        ...itemToAdd,
        comboItemId: crypto.randomUUID(),
        quantity: 1,
        selectedAddonIds: [],
        isOptional: false,
        // Set default variation if any
        selectedVariationId: itemToAdd.variations?.find((v) => v.isDefault)?.id,
      },
    ])
  }

  const updateConfiguredItem = (comboItemId: string, updates: Partial<ConfigurableComboItem>) => {
    setConfiguredItems((prev) =>
      prev.map((item) => (item.comboItemId === comboItemId ? { ...item, ...updates } : item)),
    )
  }

  const handleQuantityChange = (comboItemId: string, change: number) => {
    setConfiguredItems((prev) =>
      prev.map((item) =>
        item.comboItemId === comboItemId ? { ...item, quantity: Math.max(1, item.quantity + change) } : item,
      ),
    )
  }

  const handleRemoveItemFromCombo = (comboItemId: string) => {
    setConfiguredItems((prev) => prev.filter((item) => item.comboItemId !== comboItemId))
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const items = Array.from(configuredItems)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    setConfiguredItems(items)
  }

  const calculateAutoPrice = (): number => {
    return configuredItems.reduce((total, item) => {
      let itemPrice = item.price
      if (item.selectedVariationId) {
        const variation = item.variations.find((v) => v.id === item.selectedVariationId)
        if (variation) itemPrice += variation.priceAdjustment
      }
      item.selectedAddonIds.forEach((addonId) => {
        const addon = item.addons.find((a) => a.id === addonId)
        if (addon) itemPrice += addon.price
      })
      return total + itemPrice * item.quantity
    }, 0)
  }

  const finalPrice = formData.price !== undefined && formData.price > 0 ? formData.price : calculateAutoPrice()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    if (!formData.name) {
      setError("Combo name is required.")
      setSubmitting(false)
      return
    }
    if (configuredItems.length === 0) {
      setError("A combo must include at least one item.")
      setSubmitting(false)
      return
    }

    try {
      let imageUrl = comboToEdit?.image || formData.image || ""
      if (imageFile) {
        imageUrl = await uploadToCloudinary(imageFile)
      }

      const comboItemsToSave: ComboItemConfiguration[] = configuredItems.map((item) => ({
        id: item.comboItemId,
        menuItemId: item.id,
        menuItemName: item.name, // Denormalize for easier display later
        quantity: item.quantity,
        selectedVariationId: item.selectedVariationId,
        selectedAddonIds: item.selectedAddonIds,
        isOptional: item.isOptional,
      }))

      const comboData: Omit<ComboMeal, "id" | "createdAt" | "updatedAt"> & { createdAt?: any; updatedAt: any } = {
        name: formData.name!,
        description: formData.description || "",
        price: finalPrice, // Use the final price (override or calculated)
        image: imageUrl,
        isActive: formData.isActive!,
        items: comboItemsToSave,
        updatedAt: serverTimestamp(),
      }

      if (comboToEdit) {
        await updateDoc(doc(db, "comboMeals", comboToEdit.id), comboData)
      } else {
        comboData.createdAt = serverTimestamp()
        await addDoc(collection(db, "comboMeals"), comboData)
      }

      onOpenChange(false)
      if (onSave) onSave()
    } catch (error) {
      console.error("Error saving combo meal:", error)
      setError(error instanceof Error ? error.message : "Failed to save combo meal.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCloseDialog = () => {
    if (submitting) return
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleCloseDialog}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{comboToEdit ? "Edit Combo Meal" : "Add New Combo Meal"}</DialogTitle>
          <DialogDescription>
            {comboToEdit
              ? "Update the details of this combo meal."
              : "Configure the items and details for the new combo meal."}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(80vh-200px)] pr-6">
          <form onSubmit={handleSubmit} id={`combo-meal-form-${uniqueId}`} className="space-y-6 pt-4">
            {/* Basic Info Section */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor={`combo-name-${uniqueId}`}>Combo Name*</Label>
                    <Input
                      id={`combo-name-${uniqueId}`}
                      value={formData.name || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`combo-price-${uniqueId}`}>Price Override (Optional)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id={`combo-price-${uniqueId}`}
                        type="number"
                        step="0.01"
                        value={formData.price === undefined ? "" : formData.price}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            price: e.target.value === "" ? undefined : Number.parseFloat(e.target.value) || 0,
                          }))
                        }
                        placeholder={`Auto: $${calculateAutoPrice().toFixed(2)}`}
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`combo-desc-${uniqueId}`}>Description</Label>
                  <Textarea
                    id={`combo-desc-${uniqueId}`}
                    value={formData.description || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`combo-image-${uniqueId}`}>Image</Label>
                  <Input id={`combo-image-${uniqueId}`} type="file" accept="image/*" onChange={handleImageChange} />
                  {imagePreview && (
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="mt-2 h-24 w-24 object-cover rounded-md border"
                    />
                  )}
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id={`combo-isActive-${uniqueId}`}
                    checked={!!formData.isActive}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor={`combo-isActive-${uniqueId}`}>Active (visible on menu)</Label>
                </div>
              </CardContent>
            </Card>

            {/* Items Configuration Section */}
            <Card>
              <CardHeader>
                <CardTitle>Configure Items</CardTitle>
                <CardDescription>Add and customize items for this combo.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select onValueChange={handleAddItemToCombo} value="">
                  <SelectTrigger>
                    <SelectValue placeholder="Select an item to add to combo" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMenuItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} (${item.price.toFixed(2)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {configuredItems.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No items added yet.</p>
                )}

                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="combo-items-list">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                        {configuredItems.map((item, index) => (
                          <Draggable key={item.comboItemId} draggableId={item.comboItemId} index={index}>
                            {(provided) => (
                              <div ref={provided.innerRef} {...provided.draggableProps}>
                                <Card className="bg-background/50">
                                  <CardHeader className="flex flex-row items-center justify-between p-4">
                                    <div className="flex items-center gap-2">
                                      <button type="button" {...provided.dragHandleProps} className="cursor-grab">
                                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                                      </button>
                                      <span className="font-semibold">{item.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => handleQuantityChange(item.comboItemId, -1)}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <span className="w-5 text-center text-sm">{item.quantity}</span>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => handleQuantityChange(item.comboItemId, 1)}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-red-500 hover:text-red-600"
                                        onClick={() => handleRemoveItemFromCombo(item.comboItemId)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </CardHeader>
                                  {(item.variations?.length > 0 || item.addons?.length > 0) && (
                                    <CardContent className="p-4 pt-0">
                                      <Accordion type="multiple" className="w-full">
                                        {item.variations?.length > 0 && (
                                          <AccordionItem value={`variations-${item.comboItemId}`}>
                                            <AccordionTrigger className="text-sm py-2">Variations</AccordionTrigger>
                                            <AccordionContent className="pt-2 space-y-2">
                                              {item.variations.map((variation) => (
                                                <div
                                                  key={variation.id}
                                                  className="flex items-center justify-between text-xs"
                                                >
                                                  <Label
                                                    htmlFor={`var-${item.comboItemId}-${variation.id}`}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                  >
                                                    <input
                                                      type="radio"
                                                      name={`variation-${item.comboItemId}`}
                                                      id={`var-${item.comboItemId}-${variation.id}`}
                                                      checked={item.selectedVariationId === variation.id}
                                                      onChange={() =>
                                                        updateConfiguredItem(item.comboItemId, {
                                                          selectedVariationId: variation.id,
                                                        })
                                                      }
                                                      className="form-radio h-3 w-3 text-orange-500 border-gray-600 focus:ring-orange-500"
                                                    />
                                                    {variation.name}
                                                  </Label>
                                                  <span>
                                                    {variation.priceAdjustment >= 0 ? "+" : "-"}$
                                                    {Math.abs(variation.priceAdjustment).toFixed(2)}
                                                  </span>
                                                </div>
                                              ))}
                                            </AccordionContent>
                                          </AccordionItem>
                                        )}
                                        {item.addons?.length > 0 && (
                                          <AccordionItem value={`addons-${item.comboItemId}`} className="border-b-0">
                                            <AccordionTrigger className="text-sm py-2">Add-ons</AccordionTrigger>
                                            <AccordionContent className="pt-2 space-y-2">
                                              {item.addons.map((addon) => (
                                                <div
                                                  key={addon.id}
                                                  className="flex items-center justify-between text-xs"
                                                >
                                                  <Label
                                                    htmlFor={`addon-${item.comboItemId}-${addon.id}`}
                                                    className="flex items-center gap-2 cursor-pointer"
                                                  >
                                                    <input
                                                      type="checkbox"
                                                      id={`addon-${item.comboItemId}-${addon.id}`}
                                                      checked={item.selectedAddonIds.includes(addon.id)}
                                                      onChange={(e) => {
                                                        const newAddonIds = e.target.checked
                                                          ? [...item.selectedAddonIds, addon.id]
                                                          : item.selectedAddonIds.filter((id) => id !== addon.id)
                                                        updateConfiguredItem(item.comboItemId, {
                                                          selectedAddonIds: newAddonIds,
                                                        })
                                                      }}
                                                      className="form-checkbox h-3 w-3 text-orange-500 border-gray-600 rounded focus:ring-orange-500"
                                                    />
                                                    {addon.name}
                                                  </Label>
                                                  <span>+${addon.price.toFixed(2)}</span>
                                                </div>
                                              ))}
                                            </AccordionContent>
                                          </AccordionItem>
                                        )}
                                      </Accordion>
                                    </CardContent>
                                  )}
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
                <div className="mt-4 p-3 bg-orange-900/20 rounded-md flex justify-between items-center">
                  <span className="text-sm font-semibold text-orange-400">Calculated Combo Price:</span>
                  <span className="text-lg font-bold text-orange-400">${calculateAutoPrice().toFixed(2)}</span>
                </div>
                {formData.price !== undefined && formData.price > 0 && (
                  <p className="text-xs text-orange-500 text-center mt-1">
                    Price override is active. Final price will be ${formData.price.toFixed(2)}.
                  </p>
                )}
              </CardContent>
            </Card>
          </form>
        </ScrollArea>

        {error && (
          <div className="mt-4 flex items-center gap-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-md">
            <Info className="h-4 w-4" /> {error}
          </div>
        )}

        <DialogFooter className="mt-6 pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form={`combo-meal-form-${uniqueId}`}
            className="bg-orange-500 hover:bg-orange-600"
            disabled={submitting}
          >
            {submitting ? <LoadingSpinner /> : comboToEdit ? "Update Combo" : "Add Combo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
