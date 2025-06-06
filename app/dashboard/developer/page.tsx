"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, writeBatch, doc, getDocs, query } from "firebase/firestore"
import { toast } from "sonner"

// Sample Data (condensed for brevity)
const sampleCategories = [
  { id: "cat_fried_chicken", name: "Fried Chicken", description: "Crispy and juicy fried chicken." },
  { id: "cat_burgers", name: "Burgers", description: "Delicious handcrafted burgers." },
  { id: "cat_sides", name: "Sides", description: "Perfect accompaniments." },
  { id: "cat_drinks", name: "Drinks", description: "Refreshing beverages." },
  { id: "cat_combos", name: "Combos", description: "Value meal deals." },
]

const sampleMenuItems = [
  {
    id: "item_classic_chicken",
    name: "Classic Fried Chicken",
    description: "Our signature crispy fried chicken.",
    price: 12.99,
    categoryId: "cat_fried_chicken",
    image: "https://source.unsplash.com/random/400x300/?fried+chicken",
    isFeatured: true,
    spicyLevel: 1,
    tags: ["best-seller", "crispy"],
    variations: [
      {
        name: "Size",
        options: [
          { name: "Regular", priceModifier: 0 },
          { name: "Large", priceModifier: 3 },
        ],
      },
    ],
    addOns: [{ name: "Extra Sauce", price: 0.75, categoryId: "cat_sides" /* or a specific add-on category */ }],
    nutrition: { calories: "500kcal", protein: "30g", allergens: ["gluten", "soy"] },
  },
  {
    id: "item_spicy_burger",
    name: "Spicy Chicken Burger",
    description: "A fiery chicken burger with our special sauce.",
    price: 9.5,
    categoryId: "cat_burgers",
    image: "https://source.unsplash.com/random/400x300/?chicken+burger",
    isFeatured: false,
    spicyLevel: 3,
    tags: ["spicy", "burger"],
    variations: [
      {
        name: "Cheese",
        options: [
          { name: "No Cheese", priceModifier: 0 },
          { name: "Add Cheese", priceModifier: 1 },
        ],
      },
    ],
  },
  {
    id: "item_fries",
    name: "Crispy Fries",
    description: "Golden crispy french fries.",
    price: 3.99,
    categoryId: "cat_sides",
    image: "https://source.unsplash.com/random/400x300/?fries",
  },
  {
    id: "item_coke",
    name: "Coca-Cola",
    description: "Classic Coca-Cola.",
    price: 2.5,
    categoryId: "cat_drinks",
    image: "https://source.unsplash.com/random/400x300/?coke+can",
  },
]

const sampleComboMeals = [
  {
    id: "combo_chicken_delight",
    name: "Chicken Delight Combo",
    description: "Classic Fried Chicken, Fries, and a Drink.",
    price: 16.99, // Base price, or can be calculated
    image: "https://source.unsplash.com/random/400x300/?meal+combo",
    items: [
      { itemId: "item_classic_chicken", quantity: 1, selectedVariation: { Size: "Regular" } },
      { itemId: "item_fries", quantity: 1 },
      { itemId: "item_coke", quantity: 1 },
    ],
    isFeatured: true,
    tags: ["value", "popular"],
  },
]

const sampleOffers = [
  {
    id: "offer_weekend_special",
    title: "Weekend Chicken Feast",
    description: "Get 20% off on all fried chicken items this weekend!",
    code: "WEEKEND20",
    discountType: "percentage", // 'percentage' or 'fixed'
    discountValue: 20, // 20% or $20
    applicableCategoryIds: ["cat_fried_chicken"], // Optional: restrict to categories
    applicableItemIds: [], // Optional: restrict to specific items
    minimumPurchase: 0, // Optional
    image: "https://source.unsplash.com/random/400x300/?discount+offer",
    isActive: true,
    startDate: new Date().toISOString(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(), // 7 days from now
  },
]

async function seedCollection(collectionName: string, data: any[], clearExisting = false) {
  const collectionRef = collection(db, collectionName)
  const batch = writeBatch(db)

  if (clearExisting) {
    const q = query(collectionRef)
    const snapshot = await getDocs(q)
    snapshot.docs.forEach((doc) => batch.delete(doc.ref))
    toast.info(`Cleared existing documents from ${collectionName}.`)
  }

  data.forEach((item) => {
    const docRef = doc(collectionRef, item.id) // Use predefined ID
    batch.set(docRef, item)
  })

  await batch.commit()
  toast.success(`Successfully seeded ${data.length} documents into ${collectionName}.`)
}

export default function DeveloperPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [clearData, setClearData] = useState(false)

  const handleSeedAll = async () => {
    setIsLoading(true)
    toast.info("Starting database seed process...")
    try {
      await seedCollection("categories", sampleCategories, clearData)
      await seedCollection("menuItems", sampleMenuItems, clearData)
      await seedCollection("comboMeals", sampleComboMeals, clearData)
      await seedCollection("offers", sampleOffers, clearData)
      toast.success("All collections seeded successfully!")
    } catch (error) {
      console.error("Error seeding database: ", error)
      toast.error("Error seeding database. Check console for details.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <Card className="bg-black border border-orange-500/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-orange-400">Developer Tools</CardTitle>
          <CardDescription className="text-gray-400">
            Use these tools to manage and seed your application's database. Be careful, these actions can be
            destructive.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="destructive" className="bg-red-900/30 border-red-700 text-red-300">
            <Terminal className="h-4 w-4 !text-red-300" />
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Seeding data will add sample documents. If 'Clear Existing Data' is checked, it will DELETE all existing
              documents in the collections before seeding. This action cannot be undone.
            </AlertDescription>
          </Alert>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="clearData"
              checked={clearData}
              onChange={(e) => setClearData(e.target.checked)}
              className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-400 accent-orange-500"
            />
            <label htmlFor="clearData" className="text-sm font-medium text-gray-300">
              Clear Existing Data before Seeding
            </label>
          </div>

          <Button
            onClick={handleSeedAll}
            disabled={isLoading}
            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-semibold"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            ) : null}
            {isLoading ? "Seeding Database..." : "Seed All Sample Data"}
          </Button>

          <div className="text-xs text-gray-500 space-y-1">
            <p>This will seed: </p>
            <ul className="list-disc list-inside pl-4">
              <li>{sampleCategories.length} Categories</li>
              <li>{sampleMenuItems.length} Menu Items</li>
              <li>{sampleComboMeals.length} Combo Meals</li>
              <li>{sampleOffers.length} Offers</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
