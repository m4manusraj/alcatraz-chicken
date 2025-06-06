"use client"

import { useEffect, useState, useRef } from "react"
import { collection, getDocs, query, orderBy, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { motion, AnimatePresence } from "framer-motion"
import { Layout } from "@/components/layout"
import { Search, Filter, X, ChevronRight, AlertCircle, ArrowUp, Flame, Clock, ExternalLink, Star } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useViewportSize } from "@/hooks/use-viewport-size"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  spicyLevel?: number
  isNew?: boolean
  isFeatured?: boolean
  isActive?: boolean
  prepTime?: number
  calories?: number
  ingredients?: string[]
  allergens?: string[]
  nutritionalInfo?: {
    protein?: number
    carbs?: number
    fat?: number
    fiber?: number
    sodium?: number
  }
  discount?: {
    type: "none" | "percentage" | "amount"
    value: number
  }
}

interface Category {
  id: string
  name: string
  description: string
  order: number
  icon?: string
  isActive?: boolean
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    spicyLevel: 0,
    priceRange: [0, 100],
    showNew: false,
    showFeatured: false,
  })
  const [showFilters, setShowFilters] = useState(false)
  const [showScrollToTop, setShowScrollToTop] = useState(false)
  const [sortOption, setSortOption] = useState<
    "default" | "priceAsc" | "priceDesc" | "nameAsc" | "spicyAsc" | "spicyDesc"
  >("default")
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)

  const { width } = useViewportSize()
  const isMobile = width < 768
  const contentRef = useRef<HTMLDivElement>(null)
  const categoryNavRef = useRef<HTMLDivElement>(null)

  // Category icons mapping
  const categoryIcons: Record<string, string> = {
    "Chicken Only": "🐔",
    Tenders: "🍗",
    "Wings & More Chicken": "🐔",
    "Popcorn Chicken & Nuggets": "🍿",
    "Single Meals": "🍽️",
    "Family Meals": "👨‍👩‍👧‍👦",
    Twisters: "🌯",
    "Sandwiches & Burgers": "🍔",
    "Sides & Dessert": "🍟",
    "Kids Meals": "🧒",
    "Dipping Sauces": "🥣",
    Drinks: "🥤",
  }

  useEffect(() => {
    console.log("Fetching menu data...")

    async function fetchData() {
      try {
        // Fetch active categories only
        const categoriesQuery = query(
          collection(db, "categories"),
          where("isActive", "==", true),
          orderBy("order", "asc"),
        )
        const categoriesSnapshot = await getDocs(categoriesQuery)
        console.log("Categories fetched:", categoriesSnapshot.docs.length)

        const categoriesData = categoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[]
        setCategories(categoriesData)

        // Fetch active menu items only
        const menuQuery = query(collection(db, "menuItems"), where("isActive", "==", true))
        const menuSnapshot = await getDocs(menuQuery)
        console.log("Menu items fetched:", menuSnapshot.docs.length)

        const menuData = menuSnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            // Ensure price is a number
            price: typeof data.price === "string" ? Number.parseFloat(data.price.replace("$", "")) : data.price,
          }
        }) as MenuItem[]

        setMenuItems(menuData)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load menu data. Please try again later.")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Scroll event listener for showing scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        setShowScrollToTop(contentRef.current.scrollTop > 300)
      }
    }

    const contentElement = contentRef.current
    if (contentElement) {
      contentElement.addEventListener("scroll", handleScroll)
      return () => contentElement.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Scroll to category section
  const scrollToCategory = (categoryId: string) => {
    const element = document.getElementById(`category-${categoryId}`)
    if (element && contentRef.current) {
      // Get the position of the category element
      const elementPosition = element.getBoundingClientRect().top
      // Get the position of the content container
      const containerPosition = contentRef.current.getBoundingClientRect().top
      // Calculate the scroll position
      const scrollPosition = elementPosition - containerPosition - (isMobile ? 70 : 100)

      contentRef.current.scrollBy({
        top: scrollPosition,
        behavior: "smooth",
      })
    }
  }

  // Scroll to top
  const scrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }
  }

  // Filter and sort menu items
  const filteredAndSortedItems = menuItems
    .filter((item) => {
      // Category filter
      if (activeCategory !== "all" && item.category !== activeCategory) return false

      // Search filter
      if (
        searchQuery &&
        !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false

      // Spicy level filter
      if (filters.spicyLevel > 0 && (!item.spicyLevel || item.spicyLevel < filters.spicyLevel)) return false

      // Price range filter
      if (item.price < filters.priceRange[0] || item.price > filters.priceRange[1]) return false

      // New items filter
      if (filters.showNew && !item.isNew) return false

      // Featured items filter
      if (filters.showFeatured && !item.isFeatured) return false

      return true
    })
    .sort((a, b) => {
      switch (sortOption) {
        case "priceAsc":
          return a.price - b.price
        case "priceDesc":
          return b.price - a.price
        case "nameAsc":
          return a.name.localeCompare(b.name)
        case "spicyAsc":
          return (a.spicyLevel || 0) - (b.spicyLevel || 0)
        case "spicyDesc":
          return (b.spicyLevel || 0) - (a.spicyLevel || 0)
        default:
          // Default sorting by category order
          const categoryA = categories.find((c) => c.name === a.category)
          const categoryB = categories.find((c) => c.name === b.category)
          return (categoryA?.order || 0) - (categoryB?.order || 0)
      }
    })

  const calculateDiscountedPrice = (
    price: number,
    discount?: { type: "none" | "percentage" | "amount"; value: number },
  ) => {
    if (!discount || discount.type === "none" || !discount.value) return price

    const discountedPrice = discount.type === "percentage" ? price * (1 - discount.value / 100) : price - discount.value

    return discountedPrice
  }

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`
  }

  // Group menu items by category for display
  const groupedMenuItems = categories.reduce(
    (acc, category) => {
      const items = filteredAndSortedItems.filter((item) => item.category === category.name)
      if (items.length > 0) {
        acc.push({
          category,
          items,
        })
      }
      return acc
    },
    [] as { category: Category; items: MenuItem[] }[],
  )

  // Render compact menu item card
  const renderCompactMenuItem = (item: MenuItem) => {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative bg-black/80 backdrop-blur-sm rounded-lg border border-orange-500/20 overflow-hidden cursor-pointer hover:border-orange-500/40 hover:bg-black/90 transition-all duration-200 group"
            onClick={() => setSelectedItem(item)}
          >
            <div className="flex flex-col sm:flex-row">
              {/* Image (hidden on smallest screens) */}
              <div className="hidden sm:block relative w-24 h-24 sm:w-28 sm:h-28 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/50 z-10" />
                <img
                  src={item.image || "/placeholder.svg?height=112&width=112"}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                {item.isNew && (
                  <div className="absolute top-1 left-1 z-20">
                    <div className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">NEW</div>
                  </div>
                )}
                {item.isFeatured && (
                  <div className="absolute top-1 right-1 z-20">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-3 flex flex-col">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-orange-500 transition-colors">
                      {item.name}
                      {item.isNew && (
                        <span className="sm:hidden ml-1.5 inline-flex items-center bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                          NEW
                        </span>
                      )}
                      {item.isFeatured && (
                        <Star className="sm:hidden inline-block ml-1 h-3 w-3 text-yellow-500 fill-current" />
                      )}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">{item.description}</p>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <div className="text-orange-500 font-bold">
                      {item.discount && item.discount.type !== "none" ? (
                        <div className="flex flex-col items-end">
                          <span className="text-xs line-through text-gray-400">{formatPrice(item.price)}</span>
                          <span>{formatPrice(calculateDiscountedPrice(item.price, item.discount))}</span>
                        </div>
                      ) : (
                        formatPrice(item.price)
                      )}
                    </div>
                  </div>
                </div>

                {/* Item metadata */}
                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                  {item.prepTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{item.prepTime} min</span>
                    </div>
                  )}

                  {item.calories && (
                    <div className="flex items-center gap-1">
                      <span>{item.calories} cal</span>
                    </div>
                  )}

                  {item.spicyLevel ? (
                    <div className="flex items-center gap-1">
                      <Flame className="h-3 w-3 text-orange-500" />
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 h-2 rounded-full ${
                              i < (item.spicyLevel || 0) ? "bg-gradient-to-t from-orange-600 to-red-500" : "bg-gray-700"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Clickable indicator */}
                <div className="mt-auto pt-2 flex justify-end">
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                </div>
              </div>
            </div>
          </motion.div>
        </DialogTrigger>

        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-black border border-orange-500/30">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              {item.name}
              {item.isNew && <Badge className="bg-red-500 hover:bg-red-600 text-xs">NEW</Badge>}
              {item.isFeatured && <Star className="h-5 w-5 text-yellow-500 fill-current" />}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Image */}
            <div className="relative h-64 rounded-lg overflow-hidden">
              <img
                src={item.image || "/placeholder.svg?height=256&width=512"}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

              {/* Price overlay */}
              <div className="absolute bottom-4 right-4">
                <div className="bg-black/90 backdrop-blur-sm text-orange-500 text-2xl font-bold px-4 py-2 rounded-lg">
                  {item.discount && item.discount.type !== "none" ? (
                    <div className="flex flex-col items-end">
                      <span className="text-sm line-through text-gray-400">{formatPrice(item.price)}</span>
                      <span>{formatPrice(calculateDiscountedPrice(item.price, item.discount))}</span>
                    </div>
                  ) : (
                    formatPrice(item.price)
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
              <p className="text-gray-300">{item.description}</p>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {item.prepTime && (
                <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <Clock className="h-5 w-5 text-orange-500 mx-auto mb-1" />
                  <div className="text-sm font-medium text-white">{item.prepTime} min</div>
                  <div className="text-xs text-gray-400">Prep Time</div>
                </div>
              )}

              {item.calories && (
                <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <div className="text-lg font-bold text-orange-500 mb-1">{item.calories}</div>
                  <div className="text-xs text-gray-400">Calories</div>
                </div>
              )}

              {item.spicyLevel ? (
                <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <div className="flex justify-center gap-1 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Flame
                        key={i}
                        className={`h-3 w-3 ${
                          i < (item.spicyLevel || 0) ? "text-orange-500 fill-current" : "text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-gray-400">Spice Level</div>
                </div>
              ) : null}

              <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <div className="text-sm font-medium text-orange-500 mb-1">{item.category}</div>
                <div className="text-xs text-gray-400">Category</div>
              </div>
            </div>

            {/* Nutritional Information */}
            {item.nutritionalInfo && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Nutritional Information</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {item.nutritionalInfo.protein && (
                    <div className="text-center p-2 bg-gray-800/50 rounded">
                      <div className="text-sm font-bold text-white">{item.nutritionalInfo.protein}g</div>
                      <div className="text-xs text-gray-400">Protein</div>
                    </div>
                  )}
                  {item.nutritionalInfo.carbs && (
                    <div className="text-center p-2 bg-gray-800/50 rounded">
                      <div className="text-sm font-bold text-white">{item.nutritionalInfo.carbs}g</div>
                      <div className="text-xs text-gray-400">Carbs</div>
                    </div>
                  )}
                  {item.nutritionalInfo.fat && (
                    <div className="text-center p-2 bg-gray-800/50 rounded">
                      <div className="text-sm font-bold text-white">{item.nutritionalInfo.fat}g</div>
                      <div className="text-xs text-gray-400">Fat</div>
                    </div>
                  )}
                  {item.nutritionalInfo.fiber && (
                    <div className="text-center p-2 bg-gray-800/50 rounded">
                      <div className="text-sm font-bold text-white">{item.nutritionalInfo.fiber}g</div>
                      <div className="text-xs text-gray-400">Fiber</div>
                    </div>
                  )}
                  {item.nutritionalInfo.sodium && (
                    <div className="text-center p-2 bg-gray-800/50 rounded">
                      <div className="text-sm font-bold text-white">{item.nutritionalInfo.sodium}mg</div>
                      <div className="text-xs text-gray-400">Sodium</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ingredients */}
            {item.ingredients && item.ingredients.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Ingredients</h3>
                <div className="flex flex-wrap gap-2">
                  {item.ingredients.map((ingredient, index) => (
                    <Badge key={index} variant="outline" className="border-orange-500/30 text-gray-300">
                      {ingredient}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Allergens */}
            {item.allergens && item.allergens.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Allergen Information</h3>
                <div className="flex flex-wrap gap-2">
                  {item.allergens.map((allergen, index) => (
                    <Badge key={index} variant="destructive" className="bg-red-900/50 border-red-500/50">
                      {allergen}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator className="bg-orange-500/20" />

            {/* Order CTA */}
            <div className="text-center space-y-3">
              <p className="text-gray-400 text-sm">Ready to order this delicious item?</p>
              <a href="https://alcatrazchicken.order-online.ai/#/" target="_blank" rel="noopener noreferrer">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Order Now
                </Button>
              </a>
              <p className="text-xs text-gray-500">You'll be redirected to our online ordering system</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            {error}
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-black">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/20 to-black" />
        <div className="absolute inset-0 prison-bars opacity-20" />
        <div className="absolute inset-0 noise" />

        <div className="container relative px-4 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2 sm:mb-4">
              MENU
              <span className="text-orange-500 ml-2 sm:ml-3">LINEUP</span>
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Choose your sentence from our lineup of legendary chicken dishes, each one guilty of incredible flavor.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="relative bg-[#1a1a1a] min-h-screen pt-4">
        <div className="container px-0 sm:px-4 pb-8">
          {/* Sticky search and filter bar */}
          <div className="sticky top-0 z-30 bg-[#1a1a1a] border-b border-orange-500/20 shadow-md">
            <div className="px-4 py-3 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9 bg-black/50 border-orange-500/30 text-sm"
                />
                {searchQuery && (
                  <button
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>

              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1.5 border-orange-500/30"
                    onClick={() => setShowFilters(true)}
                  >
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline">Filters</span>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[300px] sm:w-[400px] bg-[#1a1a1a] border-l border-orange-500/20"
                >
                  <SheetHeader>
                    <SheetTitle className="text-white">Filters</SheetTitle>
                  </SheetHeader>
                  <div className="py-4">
                    <Accordion type="single" collapsible defaultValue="category">
                      <AccordionItem value="category">
                        <AccordionTrigger className="text-white">Categories</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pt-2">
                            <Button
                              variant={activeCategory === "all" ? "default" : "outline"}
                              size="sm"
                              className={`mr-2 mb-2 ${activeCategory === "all" ? "bg-orange-500" : "border-orange-500/30"}`}
                              onClick={() => setActiveCategory("all")}
                            >
                              All
                            </Button>
                            {categories.map((category) => (
                              <Button
                                key={category.id}
                                variant={activeCategory === category.name ? "default" : "outline"}
                                size="sm"
                                className={`mr-2 mb-2 ${activeCategory === category.name ? "bg-orange-500" : "border-orange-500/30"}`}
                                onClick={() => setActiveCategory(category.name)}
                              >
                                {categoryIcons[category.name] || ""} {category.name}
                              </Button>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="spicy">
                        <AccordionTrigger className="text-white">Spice Level</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 pt-2">
                            <div className="flex items-center gap-2">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Button
                                  key={i}
                                  variant={filters.spicyLevel === i + 1 ? "default" : "outline"}
                                  size="sm"
                                  className={`${filters.spicyLevel === i + 1 ? "bg-orange-500" : "border-orange-500/30"}`}
                                  onClick={() => setFilters({ ...filters, spicyLevel: i + 1 })}
                                >
                                  <Flame
                                    className={`h-4 w-4 ${i < filters.spicyLevel ? "text-white" : "text-gray-400"}`}
                                  />
                                  <span>{i + 1}</span>
                                </Button>
                              ))}
                              {filters.spicyLevel > 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-orange-500/30"
                                  onClick={() => setFilters({ ...filters, spicyLevel: 0 })}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="price">
                        <AccordionTrigger className="text-white">Price Range</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 pt-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-400">Min: ${filters.priceRange[0]}</span>
                              <span className="text-sm text-gray-400">Max: ${filters.priceRange[1]}</span>
                            </div>
                            <div className="flex gap-4">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-orange-500/30"
                                onClick={() => setFilters({ ...filters, priceRange: [0, 10] })}
                              >
                                Under $10
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-orange-500/30"
                                onClick={() => setFilters({ ...filters, priceRange: [10, 20] })}
                              >
                                $10-$20
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-orange-500/30"
                                onClick={() => setFilters({ ...filters, priceRange: [20, 100] })}
                              >
                                $20+
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="special">
                        <AccordionTrigger className="text-white">Special Items</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pt-2">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="showNew"
                                checked={filters.showNew}
                                onChange={() => setFilters({ ...filters, showNew: !filters.showNew })}
                                className="mr-2"
                              />
                              <label htmlFor="showNew" className="text-gray-300 text-sm">
                                New Items
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="showFeatured"
                                checked={filters.showFeatured}
                                onChange={() => setFilters({ ...filters, showFeatured: !filters.showFeatured })}
                                className="mr-2"
                              />
                              <label htmlFor="showFeatured" className="text-gray-300 text-sm">
                                Featured Items
                              </label>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="sort">
                        <AccordionTrigger className="text-white">Sort By</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pt-2">
                            <Button
                              variant={sortOption === "default" ? "default" : "outline"}
                              size="sm"
                              className={`mr-2 mb-2 ${sortOption === "default" ? "bg-orange-500" : "border-orange-500/30"}`}
                              onClick={() => setSortOption("default")}
                            >
                              Default
                            </Button>
                            <Button
                              variant={sortOption === "priceAsc" ? "default" : "outline"}
                              size="sm"
                              className={`mr-2 mb-2 ${sortOption === "priceAsc" ? "bg-orange-500" : "border-orange-500/30"}`}
                              onClick={() => setSortOption("priceAsc")}
                            >
                              Price: Low to High
                            </Button>
                            <Button
                              variant={sortOption === "priceDesc" ? "default" : "outline"}
                              size="sm"
                              className={`mr-2 mb-2 ${sortOption === "priceDesc" ? "bg-orange-500" : "border-orange-500/30"}`}
                              onClick={() => setSortOption("priceDesc")}
                            >
                              Price: High to Low
                            </Button>
                            <Button
                              variant={sortOption === "nameAsc" ? "default" : "outline"}
                              size="sm"
                              className={`mr-2 mb-2 ${sortOption === "nameAsc" ? "bg-orange-500" : "border-orange-500/30"}`}
                              onClick={() => setSortOption("nameAsc")}
                            >
                              Name: A to Z
                            </Button>
                            <Button
                              variant={sortOption === "spicyAsc" ? "default" : "outline"}
                              size="sm"
                              className={`mr-2 mb-2 ${sortOption === "spicyAsc" ? "bg-orange-500" : "border-orange-500/30"}`}
                              onClick={() => setSortOption("spicyAsc")}
                            >
                              Spice: Low to High
                            </Button>
                            <Button
                              variant={sortOption === "spicyDesc" ? "default" : "outline"}
                              size="sm"
                              className={`mr-2 mb-2 ${sortOption === "spicyDesc" ? "bg-orange-500" : "border-orange-500/30"}`}
                              onClick={() => setSortOption("spicyDesc")}
                            >
                              Spice: High to Low
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                  <div className="flex justify-between mt-4">
                    <Button
                      variant="outline"
                      className="border-orange-500/30"
                      onClick={() => {
                        setFilters({
                          spicyLevel: 0,
                          priceRange: [0, 100],
                          showNew: false,
                          showFeatured: false,
                        })
                        setSortOption("default")
                        setActiveCategory("all")
                      }}
                    >
                      Reset All
                    </Button>
                    <SheetClose asChild>
                      <Button>Apply Filters</Button>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Category navigation */}
            <div
              ref={categoryNavRef}
              className="flex items-center overflow-x-auto hide-scrollbar px-2 py-2 bg-black/30 border-t border-orange-500/10"
            >
              <Button
                variant={activeCategory === "all" ? "default" : "ghost"}
                size="sm"
                className={`rounded-full px-3 py-1 text-xs whitespace-nowrap ${
                  activeCategory === "all"
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "text-gray-300 hover:text-white hover:bg-black/50"
                }`}
                onClick={() => {
                  setActiveCategory("all")
                  scrollToTop()
                }}
              >
                All
              </Button>

              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.name ? "default" : "ghost"}
                  size="sm"
                  className={`rounded-full px-3 py-1 text-xs whitespace-nowrap ${
                    activeCategory === category.name
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "text-gray-300 hover:text-white hover:bg-black/50"
                  }`}
                  onClick={() => {
                    if (activeCategory === "all") {
                      setActiveCategory(category.name)
                      scrollToCategory(category.id)
                    } else {
                      setActiveCategory(category.name)
                      scrollToCategory(category.id)
                    }
                  }}
                >
                  {categoryIcons[category.name] || ""} {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Results count and active filters */}
          <div className="px-4 py-3 flex flex-wrap items-center gap-2">
            <div className="text-xs text-gray-400">
              {filteredAndSortedItems.length} {filteredAndSortedItems.length === 1 ? "item" : "items"} found
            </div>

            {/* Active filters */}
            <div className="flex flex-wrap gap-1.5">
              {activeCategory !== "all" && (
                <Badge variant="outline" className="text-xs py-0 h-5 border-orange-500/30 bg-orange-500/10">
                  {activeCategory}
                  <button className="ml-1" onClick={() => setActiveCategory("all")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {searchQuery && (
                <Badge variant="outline" className="text-xs py-0 h-5 border-orange-500/30 bg-orange-500/10">
                  Search: {searchQuery}
                  <button className="ml-1" onClick={() => setSearchQuery("")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filters.spicyLevel > 0 && (
                <Badge variant="outline" className="text-xs py-0 h-5 border-orange-500/30 bg-orange-500/10">
                  Spicy: {filters.spicyLevel}+
                  <button className="ml-1" onClick={() => setFilters({ ...filters, spicyLevel: 0 })}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {(filters.priceRange[0] > 0 || filters.priceRange[1] < 100) && (
                <Badge variant="outline" className="text-xs py-0 h-5 border-orange-500/30 bg-orange-500/10">
                  ${filters.priceRange[0]} - ${filters.priceRange[1]}
                  <button className="ml-1" onClick={() => setFilters({ ...filters, priceRange: [0, 100] })}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filters.showNew && (
                <Badge variant="outline" className="text-xs py-0 h-5 border-orange-500/30 bg-orange-500/10">
                  New Items
                  <button className="ml-1" onClick={() => setFilters({ ...filters, showNew: false })}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filters.showFeatured && (
                <Badge variant="outline" className="text-xs py-0 h-5 border-orange-500/30 bg-orange-500/10">
                  Featured
                  <button className="ml-1" onClick={() => setFilters({ ...filters, showFeatured: false })}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {sortOption !== "default" && (
                <Badge variant="outline" className="text-xs py-0 h-5 border-orange-500/30 bg-orange-500/10">
                  {sortOption === "priceAsc" && "Price: Low to High"}
                  {sortOption === "priceDesc" && "Price: High to Low"}
                  {sortOption === "nameAsc" && "Name: A to Z"}
                  {sortOption === "spicyAsc" && "Spice: Low to High"}
                  {sortOption === "spicyDesc" && "Spice: High to Low"}
                  <button className="ml-1" onClick={() => setSortOption("default")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {(activeCategory !== "all" ||
                searchQuery ||
                filters.spicyLevel > 0 ||
                filters.priceRange[0] > 0 ||
                filters.priceRange[1] < 100 ||
                filters.showNew ||
                filters.showFeatured ||
                sortOption !== "default") && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 text-xs px-2 text-orange-500 hover:text-orange-400"
                  onClick={() => {
                    setActiveCategory("all")
                    setSearchQuery("")
                    setFilters({
                      spicyLevel: 0,
                      priceRange: [0, 100],
                      showNew: false,
                      showFeatured: false,
                    })
                    setSortOption("default")
                  }}
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Menu content */}
          <div
            ref={contentRef}
            className="px-4 pb-4 space-y-6 max-h-[calc(100vh-220px)] overflow-y-auto hide-scrollbar"
          >
            {filteredAndSortedItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-orange-500/50 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No items found</h3>
                <p className="text-gray-400 max-w-md">
                  Try adjusting your filters or search query to find what you're looking for.
                </p>
                <Button
                  variant="outline"
                  className="mt-4 border-orange-500/30"
                  onClick={() => {
                    setActiveCategory("all")
                    setSearchQuery("")
                    setFilters({
                      spicyLevel: 0,
                      priceRange: [0, 100],
                      showNew: false,
                      showFeatured: false,
                    })
                    setSortOption("default")
                  }}
                >
                  Reset All Filters
                </Button>
              </div>
            ) : (
              <>
                {activeCategory === "all" ? (
                  // Show grouped by category
                  <div className="space-y-8">
                    <AnimatePresence>
                      {groupedMenuItems.map(({ category, items }) => (
                        <motion.div
                          key={category.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          id={`category-${category.id}`}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <h2 className="text-xl font-bold text-white">
                              {categoryIcons[category.name] || ""} {category.name}
                            </h2>
                            <div className="h-px flex-1 bg-orange-500/20" />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {items.map((item) => renderCompactMenuItem(item))}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  // Show filtered by active category
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <AnimatePresence>
                      {filteredAndSortedItems.map((item) => renderCompactMenuItem(item))}
                    </AnimatePresence>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Scroll to top button */}
          <AnimatePresence>
            {showScrollToTop && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="fixed bottom-8 right-4 z-30 bg-orange-500 text-white p-2 rounded-full shadow-lg"
                onClick={scrollToTop}
              >
                <ArrowUp className="h-5 w-5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </section>
    </Layout>
  )
}
