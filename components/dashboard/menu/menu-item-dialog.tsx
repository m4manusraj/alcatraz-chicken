"use client"

import type React from "react"

import { useState, useEffect, useId } from "react"
import { addDoc, updateDoc, doc, collection, serverTimestamp, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { uploadImageToFirebase } from "@/lib/firebase-storage"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { LoadingSpinner } from "@/components/loading-spinner"
import { PlusCircle, Trash2, DollarSign, Info, X } from "lucide-react"
import type { MenuItem, Category, TempMenuItemVariation, TempMenuItemAddon } from "@/types/menu"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface MenuItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  menuItemToEdit?: MenuItem | null
  onSave?: () => void
}

const initialFormData: Partial<MenuItem> = {
  name: "",
  description: "",
  price: 0,
  category: "",
  isActive: true,
  isFeatured: false,
  variations: [],
  addons: [],
  allergens: [],
  nutritionalInfo: { calories: 0, protein: 0, carbs: 0, fat: 0, servingSize: "" },
  tags: [],
  preparationTime: 0,
  sortOrder: 0,
}

export function MenuItemDialog({ open, onOpenChange, menuItemToEdit, onSave }: MenuItemDialogProps) {
  const [activeTab, setActiveTab] = useState("basic")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formData, setFormData] = useState<Partial<MenuItem>>(initialFormData)
  const [categories, setCategories] = useState<Category[]>([])

  const [tempVariations, setTempVariations] = useState<TempMenuItemVariation[]>([])
  const [tempAddons, setTempAddons] = useState<TempMenuItemAddon[]>([])
  const [allergenInput, setAllergenInput] = useState("")
  const [tagInput, setTagInput] = useState("")

  const uniqueId = useId()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesSnapshot = await getDocs(collection(db, "categories"))
        const fetchedCategories = categoriesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Category)
        setCategories(fetchedCategories.filter((c) => c.isActive).sort((a, b) => a.order - b.order))
      } catch (err) {
        console.error("Error fetching categories:", err)
        setError("Could not load categories.")
      }
    }
    if (open) {
      fetchCategories()
      if (menuItemToEdit) {
        setFormData({ ...initialFormData, ...menuItemToEdit })
        setTempVariations(menuItemToEdit.variations?.map((v) => ({ ...v, _tempId: v.id || crypto.randomUUID() })) || [])
        setTempAddons(menuItemToEdit.addons?.map((a) => ({ ...a, _tempId: a.id || crypto.randomUUID() })) || [])
        if (menuItemToEdit.image) {
          setImagePreview(menuItemToEdit.image)
        }
      } else {
        setFormData(initialFormData)
        setTempVariations([])
        setTempAddons([])
        setImagePreview(null)
      }
      setError(null)
      setImageFile(null)
    }
  }, [open, menuItemToEdit])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image file size must be less than 5MB")
        return
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file")
        return
      }

      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setError(null)
    } else {
      setImageFile(null)
      setImagePreview(menuItemToEdit?.image || null)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    // Reset the file input
    const fileInput = document.getElementById(`image-${uniqueId}`) as HTMLInputElement
    if (fileInput) fileInput.value = ""
  }

  // Variation Handlers
  const addVariation = () => {
    setTempVariations([
      ...tempVariations,
      { _tempId: crypto.randomUUID(), id: "", name: "", priceAdjustment: 0, isDefault: false },
    ])
  }
  const updateVariation = (index: number, field: keyof TempMenuItemVariation, value: any) => {
    const newVariations = [...tempVariations]
    newVariations[index] = { ...newVariations[index], [field]: value }
    if (field === "isDefault" && value === true) {
      newVariations.forEach((v, i) => {
        if (i !== index) v.isDefault = false
      })
    }
    setTempVariations(newVariations)
  }
  const removeVariation = (index: number) => {
    setTempVariations(tempVariations.filter((_, i) => i !== index))
  }

  // Addon Handlers
  const addAddon = () => {
    setTempAddons([...tempAddons, { _tempId: crypto.randomUUID(), id: "", name: "", price: 0, category: "" }])
  }
  const updateAddon = (index: number, field: keyof TempMenuItemAddon, value: any) => {
    const newAddons = [...tempAddons]
    newAddons[index] = { ...newAddons[index], [field]: value }
    setTempAddons(newAddons)
  }
  const removeAddon = (index: number) => {
    setTempAddons(tempAddons.filter((_, i) => i !== index))
  }

  // Allergen Handlers
  const addAllergen = () => {
    if (allergenInput.trim() && !formData.allergens?.includes(allergenInput.trim())) {
      setFormData((prev) => ({ ...prev, allergens: [...(prev.allergens || []), allergenInput.trim()] }))
      setAllergenInput("")
    }
  }
  const removeAllergen = (allergenToRemove: string) => {
    setFormData((prev) => ({ ...prev, allergens: prev.allergens?.filter((a) => a !== allergenToRemove) }))
  }

  // Tag Handlers
  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }))
      setTagInput("")
    }
  }
  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags?.filter((t) => t !== tagToRemove) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    if (!formData.name || !formData.category || formData.price == null) {
      setError("Name, category, and price are required.")
      setSubmitting(false)
      setActiveTab("basic")
      return
    }

    // Validate variations and addons
    for (const v of tempVariations) {
      if (!v.name.trim()) {
        setError("All variation names are required.")
        setSubmitting(false)
        setActiveTab("details")
        return
      }
    }
    for (const a of tempAddons) {
      if (!a.name.trim()) {
        setError("All addon names are required.")
        setSubmitting(false)
        setActiveTab("details")
        return
      }
    }

    try {
      let imageUrl = menuItemToEdit?.image || formData.image || ""

      if (imageFile) {
        setUploadingImage(true)
        try {
          imageUrl = await uploadImageToFirebase(imageFile, "menuItems")
        } catch (uploadError) {
          console.error("Image upload error:", uploadError)
          setError("Failed to upload image. Please try again.")
          setSubmitting(false)
          setUploadingImage(false)
          return
        }
        setUploadingImage(false)
      }

      const finalVariations = tempVariations.map((v) => ({
        id: v.id || crypto.randomUUID(),
        name: v.name,
        priceAdjustment: v.priceAdjustment,
        isDefault: v.isDefault,
      }))
      const finalAddons = tempAddons.map((a) => ({
        id: a.id || crypto.randomUUID(),
        name: a.name,
        price: a.price,
        category: a.category,
      }))

      const menuItemData: Omit<MenuItem, "id" | "createdAt" | "updatedAt"> & { createdAt?: any; updatedAt: any } = {
        ...formData,
        image: imageUrl,
        price: Number(formData.price) || 0,
        variations: finalVariations,
        addons: finalAddons,
        allergens: formData.allergens || [],
        tags: formData.tags || [],
        nutritionalInfo: formData.nutritionalInfo || { calories: 0, protein: 0, carbs: 0, fat: 0, servingSize: "" },
        preparationTime: Number(formData.preparationTime) || 0,
        sortOrder: Number(formData.sortOrder) || 0,
        updatedAt: serverTimestamp(),
      }

      if (menuItemToEdit) {
        await updateDoc(doc(db, "menuItems", menuItemToEdit.id), menuItemData)
      } else {
        menuItemData.createdAt = serverTimestamp()
        await addDoc(collection(db, "menuItems"), menuItemData)
      }

      onOpenChange(false)
      if (onSave) onSave()
    } catch (error) {
      console.error("Error saving menu item:", error)
      setError(error instanceof Error ? error.message : "Failed to save menu item. Please try again.")
    } finally {
      setSubmitting(false)
      setUploadingImage(false)
    }
  }

  const handleCloseDialog = () => {
    if (submitting || uploadingImage) return
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleCloseDialog}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{menuItemToEdit ? "Edit Menu Item" : "Add New Menu Item"}</DialogTitle>
          <DialogDescription>
            {menuItemToEdit ? "Update the details of this menu item." : "Fill in the details for the new menu item."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)] pr-6">
          <form onSubmit={handleSubmit} id={`menu-item-form-${uniqueId}`}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="details">Details & Options</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor={`name-${uniqueId}`}>Name*</Label>
                    <Input
                      id={`name-${uniqueId}`}
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`category-${uniqueId}`}>Category*</Label>
                    <Select
                      value={formData.category || ""}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger id={`category-${uniqueId}`}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`description-${uniqueId}`}>Description</Label>
                  <Textarea
                    id={`description-${uniqueId}`}
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor={`price-${uniqueId}`}>Base Price*</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id={`price-${uniqueId}`}
                        type="number"
                        step="0.01"
                        value={formData.price || ""}
                        onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) || 0 })}
                        required
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`image-${uniqueId}`}>Image</Label>
                    <div className="space-y-2">
                      <Input
                        id={`image-${uniqueId}`}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={uploadingImage}
                      />
                      {imagePreview && (
                        <div className="relative inline-block">
                          <img
                            src={imagePreview || "/placeholder.svg"}
                            alt="Preview"
                            className="h-24 w-24 object-cover rounded-md border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={removeImage}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      {uploadingImage && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <LoadingSpinner />
                          Uploading image...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id={`isActive-${uniqueId}`}
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor={`isActive-${uniqueId}`}>Active (visible on menu)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`isFeatured-${uniqueId}`}
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                  />
                  <Label htmlFor={`isFeatured-${uniqueId}`}>Featured (highlight on homepage/menu)</Label>
                </div>
              </TabsContent>

              {/* Details & Options Tab */}
              <TabsContent value="details" className="space-y-6 pt-4">
                {/* Variations Section */}
                <div className="space-y-2">
                  <h3 className="text-md font-semibold">Variations (e.g., Size, Spice Level)</h3>
                  {tempVariations.map((variation, index) => (
                    <div key={variation._tempId} className="flex items-end gap-2 p-3 border rounded-md">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor={`var-name-${index}-${uniqueId}`}>Name*</Label>
                          <Input
                            id={`var-name-${index}-${uniqueId}`}
                            value={variation.name}
                            onChange={(e) => updateVariation(index, "name", e.target.value)}
                            placeholder="e.g., Large"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`var-price-${index}-${uniqueId}`}>Price Adj.</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              id={`var-price-${index}-${uniqueId}`}
                              type="number"
                              step="0.01"
                              value={variation.priceAdjustment}
                              onChange={(e) =>
                                updateVariation(index, "priceAdjustment", Number.parseFloat(e.target.value) || 0)
                              }
                              placeholder="e.g., 2.00 or -1.00"
                              className="pl-8"
                            />
                          </div>
                        </div>
                        <div className="space-y-1 flex items-center pt-5">
                          <Switch
                            id={`var-default-${index}-${uniqueId}`}
                            checked={variation.isDefault}
                            onCheckedChange={(checked) => updateVariation(index, "isDefault", checked)}
                          />
                          <Label htmlFor={`var-default-${index}-${uniqueId}`} className="ml-2">
                            Default
                          </Label>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVariation(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addVariation}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Variation
                  </Button>
                </div>

                {/* Add-ons Section */}
                <div className="space-y-2">
                  <h3 className="text-md font-semibold">Add-ons (e.g., Extra Toppings, Sauces)</h3>
                  {tempAddons.map((addon, index) => (
                    <div key={addon._tempId} className="flex items-end gap-2 p-3 border rounded-md">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor={`addon-name-${index}-${uniqueId}`}>Name*</Label>
                          <Input
                            id={`addon-name-${index}-${uniqueId}`}
                            value={addon.name}
                            onChange={(e) => updateAddon(index, "name", e.target.value)}
                            placeholder="e.g., Extra Cheese"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`addon-price-${index}-${uniqueId}`}>Price</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              id={`addon-price-${index}-${uniqueId}`}
                              type="number"
                              step="0.01"
                              value={addon.price}
                              onChange={(e) => updateAddon(index, "price", Number.parseFloat(e.target.value) || 0)}
                              placeholder="e.g., 1.50"
                              className="pl-8"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`addon-cat-${index}-${uniqueId}`}>Category</Label>
                          <Input
                            id={`addon-cat-${index}-${uniqueId}`}
                            value={addon.category || ""}
                            onChange={(e) => updateAddon(index, "category", e.target.value)}
                            placeholder="e.g., Sauce"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAddon(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addAddon}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Add-on
                  </Button>
                </div>
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-6 pt-4">
                {/* Nutritional Info Section */}
                <div className="space-y-2">
                  <h3 className="text-md font-semibold">Nutritional Information (Optional)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-3 border rounded-md">
                    <div className="space-y-1">
                      <Label htmlFor={`calories-${uniqueId}`}>Calories</Label>
                      <Input
                        id={`calories-${uniqueId}`}
                        type="number"
                        value={formData.nutritionalInfo?.calories || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            nutritionalInfo: {
                              ...prev.nutritionalInfo,
                              calories: Number.parseInt(e.target.value) || 0,
                            },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`protein-${uniqueId}`}>Protein (g)</Label>
                      <Input
                        id={`protein-${uniqueId}`}
                        type="number"
                        value={formData.nutritionalInfo?.protein || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            nutritionalInfo: { ...prev.nutritionalInfo, protein: Number.parseInt(e.target.value) || 0 },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`carbs-${uniqueId}`}>Carbs (g)</Label>
                      <Input
                        id={`carbs-${uniqueId}`}
                        type="number"
                        value={formData.nutritionalInfo?.carbs || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            nutritionalInfo: { ...prev.nutritionalInfo, carbs: Number.parseInt(e.target.value) || 0 },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`fat-${uniqueId}`}>Fat (g)</Label>
                      <Input
                        id={`fat-${uniqueId}`}
                        type="number"
                        value={formData.nutritionalInfo?.fat || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            nutritionalInfo: { ...prev.nutritionalInfo, fat: Number.parseInt(e.target.value) || 0 },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1 col-span-2 md:col-span-1">
                      <Label htmlFor={`servingSize-${uniqueId}`}>Serving Size</Label>
                      <Input
                        id={`servingSize-${uniqueId}`}
                        value={formData.nutritionalInfo?.servingSize || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            nutritionalInfo: { ...prev.nutritionalInfo, servingSize: e.target.value },
                          }))
                        }
                        placeholder="e.g., 100g, 1 piece"
                      />
                    </div>
                  </div>
                </div>

                {/* Allergens Section */}
                <div className="space-y-2">
                  <Label htmlFor={`allergens-${uniqueId}`}>Allergens (e.g., Nuts, Dairy, Gluten)</Label>
                  <div className="flex gap-2">
                    <Input
                      id={`allergens-${uniqueId}`}
                      value={allergenInput}
                      onChange={(e) => setAllergenInput(e.target.value)}
                      placeholder="Type allergen and press Add"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAllergen())}
                    />
                    <Button type="button" variant="outline" onClick={addAllergen}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.allergens?.map((allergen) => (
                      <Badge key={allergen} variant="secondary" className="flex items-center gap-1">
                        {allergen}
                        <button
                          type="button"
                          onClick={() => removeAllergen(allergen)}
                          className="ml-1 text-muted-foreground hover:text-foreground"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Tags Section */}
                <div className="space-y-2">
                  <Label htmlFor={`tags-${uniqueId}`}>Tags (e.g., Spicy, Vegetarian, Popular)</Label>
                  <div className="flex gap-2">
                    <Input
                      id={`tags-${uniqueId}`}
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Type tag and press Add"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" variant="outline" onClick={addTag}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags?.map((tag) => (
                      <Badge key={tag} variant="outline" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-muted-foreground hover:text-foreground"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor={`prepTime-${uniqueId}`}>Est. Preparation Time (minutes)</Label>
                    <Input
                      id={`prepTime-${uniqueId}`}
                      type="number"
                      value={formData.preparationTime || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, preparationTime: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`sortOrder-${uniqueId}`}>Sort Order (within category)</Label>
                    <Input
                      id={`sortOrder-${uniqueId}`}
                      type="number"
                      value={formData.sortOrder || ""}
                      onChange={(e) => setFormData({ ...formData, sortOrder: Number.parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </ScrollArea>

        {error && (
          <div className="mt-4 flex items-center gap-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-md">
            <Info className="h-4 w-4" /> {error}
          </div>
        )}

        <DialogFooter className="mt-6 pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={submitting || uploadingImage}>
            Cancel
          </Button>
          <Button
            type="submit"
            form={`menu-item-form-${uniqueId}`}
            className="bg-orange-500 hover:bg-orange-600"
            disabled={submitting || uploadingImage}
          >
            {submitting || uploadingImage ? <LoadingSpinner /> : menuItemToEdit ? "Update Item" : "Add Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
