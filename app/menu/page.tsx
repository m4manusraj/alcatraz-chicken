"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { motion, AnimatePresence } from "framer-motion"
import { Layout } from "@/components/layout"
import { ViewToggle } from "@/components/view-toggle"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, AlertCircle } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"

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
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [view, setView] = useState<"grid" | "list">("grid")

  useEffect(() => {
    console.log("Fetching menu data...")

    async function fetchData() {
      try {
        // Fetch categories
        const categoriesQuery = query(collection(db, "categories"), orderBy("order", "asc"))
        const categoriesSnapshot = await getDocs(categoriesQuery)
        console.log("Categories fetched:", categoriesSnapshot.docs.length)

        const categoriesData = categoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[]
        setCategories(categoriesData)

        // Fetch menu items
        const menuQuery = query(collection(db, "menuItems"))
        const menuSnapshot = await getDocs(menuQuery)
        console.log("Menu items fetched:", menuSnapshot.docs.length)

        const menuData = menuSnapshot.docs.map((doc) => {
          const data = doc.data()
          console.log("Menu item:", doc.id, data)
          return {
            id: doc.id,
            ...data,
            // Ensure price is a number
            price: typeof data.price === "string" ? Number.parseFloat(data.price.replace("$", "")) : data.price,
          }
        }) as MenuItem[]

        setMenuItems(menuData)

        // Debug: Log category matching
        console.log(
          "Categories:",
          categoriesData.map((c) => c.name),
        )
        console.log("Menu item categories:", [...new Set(menuData.map((item) => item.category))])

        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load menu data. Please try again later.")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredItems =
    activeCategory === "all" ? menuItems : menuItems.filter((item) => item.category === activeCategory)

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

  const renderGridView = (items: MenuItem[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 justify-items-center">
      {items.length === 0 ? (
        <div className="col-span-full text-center py-10">
          <p className="text-gray-400">No menu items found in this category.</p>
        </div>
      ) : (
        items.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="group relative h-[350px] sm:h-[400px] w-[260px] sm:w-full mx-auto"
          >
            {/* Prison Cell Frame */}
            <div className="absolute inset-0 border-2 border-orange-500/20 rounded-xl sm:rounded-2xl">
              <div className="absolute inset-y-0 left-6 sm:left-8 w-[2px] bg-orange-500/20" />
              <div className="absolute inset-y-0 left-12 sm:left-16 w-[2px] bg-orange-500/20" />
              <div className="absolute inset-y-0 right-6 sm:right-8 w-[2px] bg-orange-500/20" />
              <div className="absolute inset-y-0 right-12 sm:right-16 w-[2px] bg-orange-500/20" />
            </div>

            {/* Content Container */}
            <div className="relative p-1 h-full">
              <div className="bg-black/80 backdrop-blur-sm rounded-lg sm:rounded-xl overflow-hidden h-full flex flex-col">
                {/* Image Section */}
                <div className="relative h-[140px] sm:h-[200px] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
                  <motion.img
                    src={item.image || "/placeholder.svg?height=240&width=360"}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                  />
                  {/* Category Tag */}
                  <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-20">
                    <div className="bg-orange-500/90 backdrop-blur-sm text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 rounded-full">
                      {item.category}
                    </div>
                  </div>
                  {/* New Badge */}
                  {item.isNew && (
                    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-20">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-red-500 text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 rounded-full"
                      >
                        NEW
                      </motion.div>
                    </div>
                  )}
                  {/* Price Tag */}
                  <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 z-20">
                    <div className="bg-black/90 backdrop-blur-sm text-orange-500 text-lg sm:text-xl font-bold px-3 sm:px-4 py-1 sm:py-2 rounded-lg">
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

                {/* Content Section */}
                <div className="flex flex-col flex-grow p-2 sm:p-4">
                  {/* Text Content */}
                  <div className="flex-grow">
                    <h3 className="text-lg sm:text-2xl font-black text-white mb-1 sm:mb-3 line-clamp-2 group-hover:text-orange-500 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-400 line-clamp-3 sm:line-clamp-5">
                      {item.description}
                    </p>
                  </div>

                  {/* Bottom Section */}
                  <div className="mt-2 sm:mt-3 space-y-2 sm:space-y-3">
                    {/* Heat Level */}
                    {item.spicyLevel ? (
                      <div className="h-[30px] sm:h-[40px] flex items-center gap-2">
                        <span className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">Heat Level:</span>
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-1.5 sm:w-2 h-4 sm:h-6 rounded-full transition-all duration-300 ${
                                i < (item.spicyLevel || 0)
                                  ? "bg-gradient-to-t from-orange-600 to-red-500"
                                  : "bg-gray-700"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="h-[30px] sm:h-[40px]" />
                    )}

                    {/* Action Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full h-[36px] sm:h-[40px] bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-3 rounded-lg flex items-center justify-between text-sm group/button"
                    >
                      <span>Add to Order</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/button:translate-x-1" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-3 -left-3 w-6 sm:w-8 h-6 sm:h-8 border-2 border-orange-500/20 rounded-full" />
            <div className="absolute -bottom-3 -right-3 w-6 sm:w-8 h-6 sm:h-8 border-2 border-orange-500/20 rounded-full" />
          </motion.div>
        ))
      )}
    </div>
  )

  const renderListView = (items: MenuItem[]) => {
    // Get all unique categories from menu items
    const uniqueCategories = Array.from(new Set(items.map((item) => item.category)))

    console.log("Rendering list view with categories:", uniqueCategories)
    console.log("Total items:", items.length)

    return (
      <div className="space-y-4">
        {uniqueCategories.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400">No menu items found.</p>
          </div>
        ) : (
          uniqueCategories.map((categoryName) => {
            const categoryItems = items.filter((item) => item.category === categoryName)
            console.log(`Category ${categoryName} has ${categoryItems.length} items`)

            if (categoryItems.length === 0) return null

            return (
              <motion.div
                key={categoryName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/50 backdrop-blur-sm rounded-xl overflow-hidden"
              >
                <Accordion type="multiple" defaultValue={[categoryName]}>
                  <AccordionItem value={categoryName} className="border-b-0">
                    <AccordionTrigger className="px-4 py-3 hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-500">
                          {categoryItems.length}
                        </Badge>
                        <span className="text-lg font-bold text-white">{categoryName}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="px-4 pb-4 space-y-2">
                        {categoryItems.map((item) => (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="group relative bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-colors"
                          >
                            <div className="flex items-start gap-4">
                              <div className="relative h-20 w-20 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={item.image || "/placeholder.svg?height=80&width=80"}
                                  alt={item.name}
                                  className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                />
                                {item.isNew && (
                                  <div className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                                    NEW
                                  </div>
                                )}
                              </div>

                              <div className="flex-grow min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                  <h3 className="text-lg font-bold text-white truncate group-hover:text-orange-500 transition-colors">
                                    {item.name}
                                  </h3>
                                  <div className="flex-shrink-0">
                                    {item.discount && item.discount.type !== "none" ? (
                                      <div className="text-right">
                                        <div className="text-sm line-through text-gray-400">
                                          {formatPrice(item.price)}
                                        </div>
                                        <div className="text-lg font-bold text-orange-500">
                                          {formatPrice(calculateDiscountedPrice(item.price, item.discount))}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-lg font-bold text-orange-500">{formatPrice(item.price)}</div>
                                    )}
                                  </div>
                                </div>

                                <p className="text-sm text-gray-400 line-clamp-2 mb-2">{item.description}</p>

                                <div className="flex items-center gap-4">
                                  {item.spicyLevel && item.spicyLevel > 0 && (
                                    <div className="flex items-center gap-1">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <div
                                          key={i}
                                          className={`w-1 h-4 rounded-full transition-all duration-300 ${
                                            i < (item.spicyLevel || 0)
                                              ? "bg-gradient-to-t from-orange-600 to-red-500"
                                              : "bg-gray-700"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  )}

                                  <Button size="sm" className="ml-auto bg-orange-500 hover:bg-orange-600">
                                    Add to Order
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </motion.div>
            )
          })
        )}
      </div>
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

        <div className="container relative px-4 py-12 sm:py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4">
              MENU
              <span className="text-orange-500 ml-3">LINEUP</span>
            </h1>
            <p className="text-gray-400 text-base sm:text-lg md:text-xl">
              Choose your sentence from our lineup of legendary chicken dishes, each one guilty of incredible flavor.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="py-8 sm:py-12 bg-[#1a1a1a]">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <ViewToggle view={view} onViewChange={setView} />
              <div className="text-sm text-gray-400">Showing {filteredItems.length} items</div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {view === "grid" ? (
              <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="w-full justify-start mb-6 bg-transparent border-b">
                    <TabsTrigger
                      value="all"
                      onClick={() => setActiveCategory("all")}
                      className="text-white data-[state=active]:text-orange-500"
                    >
                      All Items
                    </TabsTrigger>
                    {categories.map((category) => (
                      <TabsTrigger
                        key={category.id}
                        value={category.name}
                        onClick={() => setActiveCategory(category.name)}
                        className="text-white data-[state=active]:text-orange-500"
                      >
                        {category.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <TabsContent value="all">{renderGridView(filteredItems)}</TabsContent>

                  {categories.map((category) => (
                    <TabsContent key={category.name} value={category.name}>
                      {renderGridView(filteredItems.filter((item) => item.category === category.name))}
                    </TabsContent>
                  ))}
                </Tabs>
              </motion.div>
            ) : (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {renderListView(menuItems)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </Layout>
  )
}
