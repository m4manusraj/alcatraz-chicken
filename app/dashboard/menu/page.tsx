"use client"

import { useState, useEffect } from "react"
import { collection, onSnapshot, deleteDoc, doc, writeBatch } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MenuItemDialog } from "@/components/dashboard/menu/menu-item-dialog"
import { ComboMealDialog } from "@/components/dashboard/menu/combo-meal-dialog"
import { LoadingSpinner } from "@/components/loading-spinner"
import {
  Plus,
  Package,
  Utensils,
  AlertCircle,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  CheckSquare,
  XSquare,
  Star,
  RefreshCcw,
  Trash2,
  Pencil,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { MenuItem, ComboMeal } from "@/types/menu"

// Number of items to display per page
const ITEMS_PER_PAGE = 10

export default function MenuPage() {
  // State for menu items and combo meals
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [filteredMenuItems, setFilteredMenuItems] = useState<MenuItem[]>([])
  const [comboMeals, setComboMeals] = useState<ComboMeal[]>([])
  const [filteredComboMeals, setFilteredComboMeals] = useState<ComboMeal[]>([])

  // Loading and error states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dialog states
  const [menuItemDialogOpen, setMenuItemDialogOpen] = useState(false)
  const [comboMealDialogOpen, setComboMealDialogOpen] = useState(false)
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null)
  const [editingComboMeal, setEditingComboMeal] = useState<ComboMeal | null>(null)

  // Pagination states
  const [currentMenuPage, setCurrentMenuPage] = useState(1)
  const [currentComboPage, setCurrentComboPage] = useState(1)
  const [totalMenuPages, setTotalMenuPages] = useState(1)
  const [totalComboPages, setTotalComboPages] = useState(1)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("name-asc")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100])
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // Category list for filters
  const [categories, setCategories] = useState<string[]>([])

  // Fetch menu items and combo meals
  useEffect(() => {
    console.log("Setting up menu items listener...")

    // Try without ordering first to see if that's the issue
    const menuItemsQuery = collection(db, "menuItems")

    const menuItemsUnsubscribe = onSnapshot(
      menuItemsQuery,
      (snapshot) => {
        console.log("Menu items snapshot received:", snapshot.docs.length, "items")
        const items = snapshot.docs.map((doc) => {
          const data = doc.data()
          console.log("Menu item data:", { id: doc.id, name: data.name, category: data.category })
          return { id: doc.id, ...data } as MenuItem
        })

        // Extract unique categories
        const uniqueCategories = Array.from(new Set(items.map((item) => item.category)))
        setCategories(uniqueCategories)

        // Sort manually by name if createdAt is causing issues
        items.sort((a, b) => a.name.localeCompare(b.name))

        setMenuItems(items)
        setTotalMenuPages(Math.ceil(items.length / ITEMS_PER_PAGE))
        setLoading(false)
        setError(null)
      },
      (error) => {
        console.error("Error fetching menu items:", error)
        setError("Failed to load menu items: " + error.message)
        setLoading(false)
      },
    )

    // Try without ordering for combo meals too
    const comboMealsQuery = collection(db, "comboMeals")

    const comboMealsUnsubscribe = onSnapshot(
      comboMealsQuery,
      (snapshot) => {
        console.log("Combo meals snapshot received:", snapshot.docs.length, "combos")
        const combos = snapshot.docs.map((doc) => {
          const data = doc.data()
          console.log("Combo meal data:", { id: doc.id, name: data.name })
          return { id: doc.id, ...data } as ComboMeal
        })
        setComboMeals(combos)
        setTotalComboPages(Math.ceil(combos.length / ITEMS_PER_PAGE))
      },
      (error) => {
        console.error("Error fetching combo meals:", error)
        setError("Failed to load combo meals: " + error.message)
      },
    )

    return () => {
      menuItemsUnsubscribe()
      comboMealsUnsubscribe()
    }
  }, [])

  // Apply filters and sorting to menu items
  useEffect(() => {
    let filtered = [...menuItems]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) => item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query),
      )
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.category === categoryFilter)
    }

    // Apply status filter
    if (statusFilter === "active") {
      filtered = filtered.filter((item) => item.isActive)
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((item) => !item.isActive)
    }

    // Apply featured filter
    if (showFeaturedOnly) {
      filtered = filtered.filter((item) => item.isFeatured)
    }

    // Apply price range filter
    filtered = filtered.filter((item) => item.price >= priceRange[0] && item.price <= priceRange[1])

    // Apply sorting
    switch (sortBy) {
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name))
        break
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "newest":
        filtered.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis())
        break
      case "oldest":
        filtered.sort((a, b) => a.createdAt?.toMillis() - b.createdAt?.toMillis())
        break
    }

    setFilteredMenuItems(filtered)
    setTotalMenuPages(Math.ceil(filtered.length / ITEMS_PER_PAGE))
    setCurrentMenuPage(1) // Reset to first page when filters change
  }, [menuItems, searchQuery, categoryFilter, statusFilter, sortBy, priceRange, showFeaturedOnly])

  // Apply filters to combo meals
  useEffect(() => {
    let filtered = [...comboMeals]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (combo) => combo.name.toLowerCase().includes(query) || combo.description.toLowerCase().includes(query),
      )
    }

    // Apply status filter
    if (statusFilter === "active") {
      filtered = filtered.filter((combo) => combo.isActive)
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((combo) => !combo.isActive)
    }

    // Apply sorting
    switch (sortBy) {
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name))
        break
      case "price-asc":
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case "price-desc":
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case "newest":
        filtered.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis())
        break
      case "oldest":
        filtered.sort((a, b) => a.createdAt?.toMillis() - b.createdAt?.toMillis())
        break
    }

    setFilteredComboMeals(filtered)
    setTotalComboPages(Math.ceil(filtered.length / ITEMS_PER_PAGE))
    setCurrentComboPage(1) // Reset to first page when filters change
  }, [comboMeals, searchQuery, statusFilter, sortBy])

  // Get paginated menu items
  const getPaginatedMenuItems = () => {
    const startIndex = (currentMenuPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredMenuItems.slice(startIndex, endIndex)
  }

  // Get paginated combo meals
  const getPaginatedComboMeals = () => {
    const startIndex = (currentComboPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredComboMeals.slice(startIndex, endIndex)
  }

  const handleDeleteMenuItem = async (id: string) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      try {
        await deleteDoc(doc(db, "menuItems", id))
        console.log("Menu item deleted:", id)
      } catch (error) {
        console.error("Error deleting menu item:", error)
        setError("Failed to delete menu item")
      }
    }
  }

  const handleDeleteComboMeal = async (id: string) => {
    if (confirm("Are you sure you want to delete this combo meal?")) {
      try {
        await deleteDoc(doc(db, "comboMeals", id))
        console.log("Combo meal deleted:", id)
      } catch (error) {
        console.error("Error deleting combo meal:", error)
        setError("Failed to delete combo meal")
      }
    }
  }

  const handleEditMenuItem = (item: MenuItem) => {
    setEditingMenuItem(item)
    setMenuItemDialogOpen(true)
  }

  const handleEditComboMeal = (combo: ComboMeal) => {
    console.log("Editing combo meal:", combo)
    setEditingComboMeal(combo)
    setComboMealDialogOpen(true)
  }

  const handleCloseMenuItemDialog = () => {
    setMenuItemDialogOpen(false)
    setEditingMenuItem(null)
  }

  const handleCloseComboMealDialog = () => {
    setComboMealDialogOpen(false)
    setEditingComboMeal(null)
  }

  const handleSelectAllItems = (checked: boolean) => {
    if (checked) {
      setSelectedItems(getPaginatedMenuItems().map((item) => item.id))
    } else {
      setSelectedItems([])
    }
  }

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, id])
    } else {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id))
    }
  }

  const handleBulkAction = async (action: "activate" | "deactivate" | "delete") => {
    if (selectedItems.length === 0) return

    const actionText = action === "activate" ? "activate" : action === "deactivate" ? "deactivate" : "delete"

    if (!confirm(`Are you sure you want to ${actionText} ${selectedItems.length} item(s)?`)) {
      return
    }

    try {
      if (action === "delete") {
        // Handle delete action
        for (const id of selectedItems) {
          await deleteDoc(doc(db, "menuItems", id))
        }
      } else {
        // Handle activate/deactivate actions using batch update
        const batch = writeBatch(db)
        const isActive = action === "activate"

        for (const id of selectedItems) {
          const itemRef = doc(db, "menuItems", id)
          batch.update(itemRef, {
            isActive: isActive,
            updatedAt: new Date(),
          })
        }

        await batch.commit()
      }

      setSelectedItems([])
      console.log(`Successfully ${actionText}d ${selectedItems.length} items`)
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error)
      setError(`Failed to ${actionText} items: ${error.message}`)
    }
  }

  const resetFilters = () => {
    setSearchQuery("")
    setCategoryFilter("all")
    setStatusFilter("all")
    setSortBy("name-asc")
    setPriceRange([0, 100])
    setShowFeaturedOnly(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="w-full max-w-none space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Menu Management</h1>
          <p className="text-gray-400 mt-1">Manage your restaurant's menu items and combo meals</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => setMenuItemDialogOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add Menu Item
          </Button>
          <Button
            onClick={() => setComboMealDialogOpen(true)}
            variant="outline"
            className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
          >
            <Package className="mr-2 h-4 w-4" />
            Add Combo Meal
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Tabs for Menu Items and Combo Meals */}
      <Tabs defaultValue="menu-items" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="menu-items" className="data-[state=active]:bg-orange-500">
            Menu Items
          </TabsTrigger>
          <TabsTrigger value="combo-meals" className="data-[state=active]:bg-orange-500">
            Combo Meals
          </TabsTrigger>
        </TabsList>

        {/* Menu Items Tab */}
        <TabsContent value="menu-items" className="space-y-6">
          {/* Filter and Search Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-black/30 border-orange-500/20 text-white"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px] bg-black/30 border-orange-500/20 text-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-black border-orange-500/20">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] bg-black/30 border-orange-500/20 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-black border-orange-500/20">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px] bg-black/30 border-orange-500/20 text-white">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="bg-black border-orange-500/20">
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="price-asc">Price (Low-High)</SelectItem>
                  <SelectItem value="price-desc">Price (High-Low)</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10">
                    <Filter className="mr-2 h-4 w-4" />
                    More Filters
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-black border-orange-500/20">
                  <div className="space-y-4">
                    <h4 className="font-medium text-white">Price Range</h4>
                    <div className="px-1">
                      <Slider
                        defaultValue={[0, 100]}
                        max={100}
                        step={1}
                        value={priceRange}
                        onValueChange={(value) => setPriceRange(value as [number, number])}
                        className="py-4"
                      />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>${priceRange[0]}</span>
                        <span>${priceRange[1]}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch id="featured-only" checked={showFeaturedOnly} onCheckedChange={setShowFeaturedOnly} />
                      <Label htmlFor="featured-only" className="text-white">
                        Featured Items Only
                      </Label>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetFilters}
                        className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                      >
                        <RefreshCcw className="mr-2 h-3 w-3" />
                        Reset Filters
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <div className="flex border rounded-md overflow-hidden border-orange-500/20">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-9 w-9 ${viewMode === "list" ? "bg-orange-500/20" : ""}`}
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-9 w-9 ${viewMode === "grid" ? "bg-orange-500/20" : ""}`}
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery ||
            categoryFilter !== "all" ||
            statusFilter !== "all" ||
            showFeaturedOnly ||
            priceRange[0] > 0 ||
            priceRange[1] < 100) && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-400">Active filters:</span>

              {searchQuery && (
                <Badge
                  variant="outline"
                  className="bg-blue-900/20 text-blue-400 border-blue-500/30 flex items-center gap-1"
                >
                  Search: {searchQuery}
                  <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-white">
                    ×
                  </button>
                </Badge>
              )}

              {categoryFilter !== "all" && (
                <Badge
                  variant="outline"
                  className="bg-purple-900/20 text-purple-400 border-purple-500/30 flex items-center gap-1"
                >
                  Category: {categoryFilter}
                  <button onClick={() => setCategoryFilter("all")} className="ml-1 hover:text-white">
                    ×
                  </button>
                </Badge>
              )}

              {statusFilter !== "all" && (
                <Badge
                  variant="outline"
                  className="bg-green-900/20 text-green-400 border-green-500/30 flex items-center gap-1"
                >
                  Status: {statusFilter === "active" ? "Active" : "Inactive"}
                  <button onClick={() => setStatusFilter("all")} className="ml-1 hover:text-white">
                    ×
                  </button>
                </Badge>
              )}

              {showFeaturedOnly && (
                <Badge
                  variant="outline"
                  className="bg-yellow-900/20 text-yellow-400 border-yellow-500/30 flex items-center gap-1"
                >
                  Featured Only
                  <button onClick={() => setShowFeaturedOnly(false)} className="ml-1 hover:text-white">
                    ×
                  </button>
                </Badge>
              )}

              {(priceRange[0] > 0 || priceRange[1] < 100) && (
                <Badge
                  variant="outline"
                  className="bg-orange-900/20 text-orange-400 border-orange-500/30 flex items-center gap-1"
                >
                  Price: ${priceRange[0]} - ${priceRange[1]}
                  <button onClick={() => setPriceRange([0, 100])} className="ml-1 hover:text-white">
                    ×
                  </button>
                </Badge>
              )}

              <Button
                variant="link"
                size="sm"
                onClick={resetFilters}
                className="text-orange-400 hover:text-orange-300 p-0 h-auto"
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="flex items-center gap-2 p-2 bg-orange-900/20 border border-orange-500/30 rounded-md">
              <span className="text-sm text-orange-400">{selectedItems.length} items selected</span>
              <div className="ml-auto flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("activate")}
                  className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                >
                  <CheckSquare className="mr-1 h-3 w-3" />
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("deactivate")}
                  className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                >
                  <XSquare className="mr-1 h-3 w-3" />
                  Deactivate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("delete")}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Delete
                </Button>
              </div>
            </div>
          )}

          {/* Menu Items Display */}
          <Card className="bg-black/50 border-orange-500/20">
            <CardHeader>
              <CardTitle className="text-white">Menu Items</CardTitle>
              <CardDescription className="text-gray-400">{filteredMenuItems.length} items found</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                {filteredMenuItems.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-gray-400 mb-4">No menu items found matching your filters.</p>
                    <Button onClick={resetFilters} className="bg-orange-500 hover:bg-orange-600">
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Reset Filters
                    </Button>
                  </div>
                ) : viewMode === "list" ? (
                  <div className="w-full">
                    {/* Table header - hidden on mobile */}
                    <div className="hidden md:flex items-center px-4 py-2 border-b border-orange-500/20 bg-black/30">
                      <div className="w-6 mr-2">
                        <Checkbox
                          checked={
                            selectedItems.length === getPaginatedMenuItems().length &&
                            getPaginatedMenuItems().length > 0
                          }
                          onCheckedChange={handleSelectAllItems}
                        />
                      </div>
                      <div className="w-16">Image</div>
                      <div className="flex-1 font-medium text-gray-300">Name</div>
                      <div className="w-24 text-gray-300">Category</div>
                      <div className="w-20 text-gray-300">Price</div>
                      <div className="w-20 text-gray-300">Status</div>
                      <div className="w-24 text-right text-gray-300">Actions</div>
                    </div>

                    {/* Mobile and desktop list items */}
                    {getPaginatedMenuItems().map((item) => (
                      <div key={item.id} className="border-b border-orange-500/10 hover:bg-orange-500/5">
                        {/* Mobile view - stacked layout */}
                        <div className="md:hidden p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={selectedItems.includes(item.id)}
                                onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                              />
                              {item.image ? (
                                <img
                                  src={item.image || "/placeholder.svg"}
                                  alt={item.name}
                                  className="h-12 w-12 rounded-md object-cover"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-md bg-orange-900/30 flex items-center justify-center">
                                  <Utensils className="h-6 w-6 text-orange-500/70" />
                                </div>
                              )}
                              <div>
                                <div className="font-medium text-white flex items-center">
                                  {item.name}
                                  {item.isFeatured && (
                                    <Star className="ml-1 h-3 w-3 text-yellow-400" fill="currentColor" />
                                  )}
                                </div>
                                <p className="text-xs text-gray-400 truncate max-w-[200px]">{item.description}</p>
                              </div>
                            </div>
                            <Badge
                              className={
                                item.isActive
                                  ? "bg-green-700/30 text-green-400 border-green-500/30"
                                  : "bg-red-700/30 text-red-400 border-red-500/30"
                              }
                            >
                              {item.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <div className="space-y-1">
                              <div className="text-sm text-gray-400">
                                <span className="font-medium text-gray-300">Category:</span> {item.category}
                              </div>
                              <div className="text-sm text-gray-400">
                                <span className="font-medium text-gray-300">Price:</span> ${item.price.toFixed(2)}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditMenuItem(item)}
                                className="text-orange-500 hover:text-orange-400 hover:bg-orange-500/10"
                              >
                                <Pencil className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteMenuItem(item.id)}
                                className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Desktop view - horizontal layout */}
                        <div className="hidden md:flex items-center px-4 py-3">
                          <div className="w-6 mr-2">
                            <Checkbox
                              checked={selectedItems.includes(item.id)}
                              onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                            />
                          </div>
                          <div className="w-16">
                            {item.image ? (
                              <img
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                className="h-12 w-12 rounded-md object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-md bg-orange-900/30 flex items-center justify-center">
                                <Utensils className="h-6 w-6 text-orange-500/70" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 font-medium text-white">
                            <div className="flex items-center">
                              {item.name}
                              {item.isFeatured && <Star className="ml-1 h-3 w-3 text-yellow-400" fill="currentColor" />}
                            </div>
                            <p className="text-xs text-gray-400 truncate max-w-xs">{item.description}</p>
                          </div>
                          <div className="w-24 text-gray-400">{item.category}</div>
                          <div className="w-20 text-gray-300">${item.price.toFixed(2)}</div>
                          <div className="w-20">
                            <Badge
                              className={
                                item.isActive
                                  ? "bg-green-700/30 text-green-400 border-green-500/30"
                                  : "bg-red-700/30 text-red-400 border-red-500/30"
                              }
                            >
                              {item.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="w-24 text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditMenuItem(item)}
                                className="text-orange-500 hover:text-orange-400 hover:bg-orange-500/10"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteMenuItem(item.id)}
                                className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                    {getPaginatedMenuItems().map((item) => (
                      <div
                        key={item.id}
                        className="border border-orange-500/20 rounded-lg overflow-hidden bg-black/30 hover:bg-orange-500/5"
                      >
                        <div className="relative">
                          {item.image ? (
                            <img
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              className="h-40 w-full object-cover"
                            />
                          ) : (
                            <div className="h-40 w-full bg-orange-900/30 flex items-center justify-center">
                              <Utensils className="h-12 w-12 text-orange-500/70" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2 flex gap-1">
                            {item.isFeatured && <Badge className="bg-yellow-500/80 text-black">Featured</Badge>}
                            <Badge
                              className={item.isActive ? "bg-green-500/80 text-black" : "bg-red-500/80 text-black"}
                            >
                              {item.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                            <p className="text-white font-medium">${item.price.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-white">{item.name}</h3>
                            <Checkbox
                              checked={selectedItems.includes(item.id)}
                              onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                          <div className="flex items-center mt-2">
                            <Badge variant="outline" className="bg-purple-900/20 text-purple-400 border-purple-500/30">
                              {item.category}
                            </Badge>
                          </div>
                          <div className="flex justify-end gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditMenuItem(item)}
                              className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteMenuItem(item.id)}
                              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {filteredMenuItems.length > 0 && (
                  <div className="flex items-center justify-between px-4 py-4 border-t border-orange-500/20">
                    <div className="text-sm text-gray-400">
                      Showing {(currentMenuPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                      {Math.min(currentMenuPage * ITEMS_PER_PAGE, filteredMenuItems.length)} of{" "}
                      {filteredMenuItems.length} items
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentMenuPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentMenuPage === 1}
                        className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalMenuPages) }, (_, i) => {
                          // Show pages around current page
                          let pageToShow
                          if (totalMenuPages <= 5) {
                            pageToShow = i + 1
                          } else if (currentMenuPage <= 3) {
                            pageToShow = i + 1
                          } else if (currentMenuPage >= totalMenuPages - 2) {
                            pageToShow = totalMenuPages - 4 + i
                          } else {
                            pageToShow = currentMenuPage - 2 + i
                          }

                          return (
                            <Button
                              key={pageToShow}
                              variant={currentMenuPage === pageToShow ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentMenuPage(pageToShow)}
                              className={
                                currentMenuPage === pageToShow
                                  ? "bg-orange-500 hover:bg-orange-600"
                                  : "border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                              }
                            >
                              {pageToShow}
                            </Button>
                          )
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentMenuPage((prev) => Math.min(totalMenuPages, prev + 1))}
                        disabled={currentMenuPage === totalMenuPages}
                        className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Combo Meals Tab */}
        <TabsContent value="combo-meals" className="space-y-6">
          {/* Filter and Search Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search combo meals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-black/30 border-orange-500/20 text-white"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] bg-black/30 border-orange-500/20 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-black border-orange-500/20">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px] bg-black/30 border-orange-500/20 text-white">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="bg-black border-orange-500/20">
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="price-asc">Price (Low-High)</SelectItem>
                  <SelectItem value="price-desc">Price (High-Low)</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
              >
                <RefreshCcw className="mr-2 h-3 w-3" />
                Reset
              </Button>
            </div>
          </div>

          {/* Combo Meals Display */}
          <Card className="bg-black/50 border-orange-500/20">
            <CardHeader>
              <CardTitle className="text-white">Combo Meals</CardTitle>
              <CardDescription className="text-gray-400">{filteredComboMeals.length} combo meals found</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                {filteredComboMeals.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-gray-400 mb-4">No combo meals found matching your filters.</p>
                    <Button onClick={resetFilters} className="bg-orange-500 hover:bg-orange-600">
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Reset Filters
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {getPaginatedComboMeals().map((combo) => (
                      <div
                        key={combo.id}
                        className="flex flex-col border border-orange-500/20 rounded-lg bg-black/30 hover:bg-orange-500/5 overflow-hidden"
                      >
                        <div className="relative">
                          {combo.image ? (
                            <img
                              src={combo.image || "/placeholder.svg"}
                              alt={combo.name}
                              className="w-full h-40 object-cover"
                            />
                          ) : (
                            <div className="w-full h-40 bg-orange-900/30 flex items-center justify-center">
                              <Package className="h-12 w-12 text-orange-500/70" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            <Badge
                              className={combo.isActive ? "bg-green-500/80 text-black" : "bg-red-500/80 text-black"}
                            >
                              {combo.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                            <p className="text-white font-medium">${combo.price?.toFixed(2) || "Variable"}</p>
                          </div>
                        </div>

                        <div className="p-4 flex-grow">
                          <h3 className="font-semibold text-white text-lg">{combo.name}</h3>
                          <p className="text-sm text-gray-400 mt-1 line-clamp-2">{combo.description}</p>

                          <div className="mt-3">
                            <h4 className="text-sm font-medium text-gray-300 mb-1">Includes:</h4>
                            <ScrollArea className="h-20">
                              <ul className="text-xs text-gray-400 space-y-1">
                                {combo.items.map((item, index) => (
                                  <li key={index} className="flex items-center">
                                    <span className="w-5 inline-block">{item.quantity}×</span>
                                    <span>{item.menuItemName || "Unknown Item"}</span>
                                  </li>
                                ))}
                              </ul>
                            </ScrollArea>
                          </div>
                        </div>

                        <div className="p-4 border-t border-orange-500/20 flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditComboMeal(combo)}
                            className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteComboMeal(combo.id)}
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {filteredComboMeals.length > 0 && (
                  <div className="flex items-center justify-between px-4 py-4 border-t border-orange-500/20">
                    <div className="text-sm text-gray-400">
                      Showing {(currentComboPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                      {Math.min(currentComboPage * ITEMS_PER_PAGE, filteredComboMeals.length)} of{" "}
                      {filteredComboMeals.length} combo meals
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentComboPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentComboPage === 1}
                        className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalComboPages) }, (_, i) => {
                          // Show pages around current page
                          let pageToShow
                          if (totalComboPages <= 5) {
                            pageToShow = i + 1
                          } else if (currentComboPage <= 3) {
                            pageToShow = i + 1
                          } else if (currentComboPage >= totalComboPages - 2) {
                            pageToShow = totalComboPages - 4 + i
                          } else {
                            pageToShow = currentComboPage - 2 + i
                          }

                          return (
                            <Button
                              key={pageToShow}
                              variant={currentComboPage === pageToShow ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentComboPage(pageToShow)}
                              className={
                                currentComboPage === pageToShow
                                  ? "bg-orange-500 hover:bg-orange-600"
                                  : "border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                              }
                            >
                              {pageToShow}
                            </Button>
                          )
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentComboPage((prev) => Math.min(totalComboPages, prev + 1))}
                        disabled={currentComboPage === totalComboPages}
                        className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <MenuItemDialog
        open={menuItemDialogOpen}
        onOpenChange={handleCloseMenuItemDialog}
        menuItemToEdit={editingMenuItem}
        onSave={() => {
          // Refresh will happen automatically via onSnapshot
        }}
      />

      <ComboMealDialog
        open={comboMealDialogOpen}
        onOpenChange={handleCloseComboMealDialog}
        comboToEdit={editingComboMeal}
        onSave={() => {
          // Refresh will happen automatically via onSnapshot
        }}
      />
    </div>
  )
}
