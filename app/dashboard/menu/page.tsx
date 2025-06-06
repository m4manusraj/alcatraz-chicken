"use client"

import { useState, useEffect } from "react"
import { collection, onSnapshot, deleteDoc, doc, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MenuItemDialog } from "@/components/dashboard/menu/menu-item-dialog"
import { ComboMealDialog } from "@/components/dashboard/menu/combo-meal-dialog"
import { MenuItemsTable } from "@/components/dashboard/menu/menu-items-table"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Plus, Package, Utensils, AlertCircle } from "lucide-react"
import type { MenuItem, ComboMeal } from "@/types/menu"

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [comboMeals, setComboMeals] = useState<ComboMeal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [menuItemDialogOpen, setMenuItemDialogOpen] = useState(false)
  const [comboMealDialogOpen, setComboMealDialogOpen] = useState(false)
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null)
  const [editingComboMeal, setEditingComboMeal] = useState<ComboMeal | null>(null)

  useEffect(() => {
    console.log("Setting up menu items listener...")

    const menuItemsQuery = query(collection(db, "menuItems"), orderBy("createdAt", "desc"))

    const menuItemsUnsubscribe = onSnapshot(
      menuItemsQuery,
      (snapshot) => {
        console.log("Menu items snapshot received:", snapshot.docs.length, "items")
        const items = snapshot.docs.map((doc) => {
          const data = doc.data()
          console.log("Menu item data:", { id: doc.id, ...data })
          return { id: doc.id, ...data } as MenuItem
        })
        setMenuItems(items)
        setLoading(false)
        setError(null)
      },
      (error) => {
        console.error("Error fetching menu items:", error)
        setError("Failed to load menu items")
        setLoading(false)
      },
    )

    const comboMealsQuery = query(collection(db, "comboMeals"), orderBy("createdAt", "desc"))

    const comboMealsUnsubscribe = onSnapshot(
      comboMealsQuery,
      (snapshot) => {
        console.log("Combo meals snapshot received:", snapshot.docs.length, "combos")
        const combos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as ComboMeal)
        setComboMeals(combos)
      },
      (error) => {
        console.error("Error fetching combo meals:", error)
      },
    )

    return () => {
      menuItemsUnsubscribe()
      comboMealsUnsubscribe()
    }
  }, [])

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

  const handleEditMenuItem = (item: MenuItem) => {
    setEditingMenuItem(item)
    setMenuItemDialogOpen(true)
  }

  const handleEditComboMeal = (combo: ComboMeal) => {
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-black/50 border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Menu Items</CardTitle>
            <Utensils className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{menuItems.length}</div>
            <p className="text-xs text-gray-500">{menuItems.filter((item) => item.isActive).length} active</p>
          </CardContent>
        </Card>
        <Card className="bg-black/50 border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Combo Meals</CardTitle>
            <Package className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{comboMeals.length}</div>
            <p className="text-xs text-gray-500">{comboMeals.filter((combo) => combo.isActive).length} active</p>
          </CardContent>
        </Card>
        <Card className="bg-black/50 border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Featured Items</CardTitle>
            <Utensils className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{menuItems.filter((item) => item.isFeatured).length}</div>
            <p className="text-xs text-gray-500">highlighted items</p>
          </CardContent>
        </Card>
      </div>

      {/* Menu Items Table */}
      <Card className="bg-black/50 border-orange-500/20">
        <CardHeader>
          <CardTitle className="text-white">Menu Items</CardTitle>
          <CardDescription className="text-gray-400">
            Manage your restaurant's menu items, prices, and availability
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <MenuItemsTable menuItems={menuItems} onEdit={handleEditMenuItem} onDelete={handleDeleteMenuItem} />
          </div>
        </CardContent>
      </Card>

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
        comboMealToEdit={editingComboMeal}
        onSave={() => {
          // Refresh will happen automatically via onSnapshot
        }}
      />
    </div>
  )
}
