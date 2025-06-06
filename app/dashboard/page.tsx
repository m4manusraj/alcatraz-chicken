"use client"

import { useEffect, useState } from "react"
import { collection, onSnapshot, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pizza, DollarSign, Users, Plus, AlertCircle, MessageSquare, Mail, ArrowRight } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { getContactStats, getNewsletterStats } from "@/lib/contact-service"
import Link from "next/link"

interface MenuItem {
  id: string
  name: string
  price: string | number
  category: string
  createdAt: any
}

interface DashboardStats {
  totalItems: number
  totalCategories: number
  activeOffers: number
  recentOrders: number
}

interface ContactStats {
  total: number
  unread: number
  notReplied: number
  needsAttention: number
}

interface NewsletterStats {
  total: number
  active: number
  thisMonth: number
}

export default function DashboardPage() {
  const [recentItems, setRecentItems] = useState<MenuItem[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalItems: 0,
    totalCategories: 0,
    activeOffers: 0,
    recentOrders: 0,
  })
  const [contactStats, setContactStats] = useState<ContactStats>({
    total: 0,
    unread: 0,
    notReplied: 0,
    needsAttention: 0,
  })
  const [newsletterStats, setNewsletterStats] = useState<NewsletterStats>({
    total: 0,
    active: 0,
    thisMonth: 0,
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("Setting up dashboard listeners...")

    // Set up listeners for all collections without ordering
    const unsubscribeMenu = onSnapshot(
      collection(db, "menuItems"),
      (snapshot) => {
        console.log("Menu items count snapshot received:", snapshot.size)
        setStats((prev) => ({ ...prev, totalItems: snapshot.size }))

        // Get recent items (just take first 5)
        const items = snapshot.docs.slice(0, 5).map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            // Format price if it's a number
            price: typeof data.price === "number" ? `$${data.price.toFixed(2)}` : data.price,
          }
        }) as MenuItem[]
        setRecentItems(items)
        setLoading(false)
        setError(null)
      },
      (error) => {
        console.error("Error fetching menu items:", error)
        setError("Error loading menu items: " + error.message)
        setLoading(false)
      },
    )

    const unsubscribeCategories = onSnapshot(
      collection(db, "categories"),
      (snapshot) => {
        console.log("Categories count snapshot received:", snapshot.size)
        setStats((prev) => ({ ...prev, totalCategories: snapshot.size }))
      },
      (error) => console.error("Error fetching categories count:", error),
    )

    const unsubscribeOffers = onSnapshot(
      query(collection(db, "offers"), where("isActive", "==", true)),
      (snapshot) => {
        console.log("Active offers count snapshot received:", snapshot.size)
        setStats((prev) => ({ ...prev, activeOffers: snapshot.size }))
      },
      (error) => console.error("Error fetching offers count:", error),
    )

    // Load contact and newsletter stats
    const loadStats = async () => {
      try {
        const [contactData, newsletterData] = await Promise.all([getContactStats(), getNewsletterStats()])
        setContactStats(contactData)
        setNewsletterStats(newsletterData)
      } catch (error) {
        console.error("Error loading communication stats:", error)
      }
    }

    loadStats()

    return () => {
      unsubscribeMenu()
      unsubscribeCategories()
      unsubscribeOffers()
    }
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
        <Button asChild className="bg-orange-500 hover:bg-orange-600">
          <Link href="/dashboard/menu">
            <Plus className="mr-2 h-4 w-4" />
            Add Menu Item
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Menu Items</CardTitle>
            <Pizza className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalItems}</div>
            <Link
              href="/dashboard/menu"
              className="text-xs text-orange-500 hover:text-orange-400 inline-flex items-center mt-1"
            >
              View all items
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Categories</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalCategories}</div>
            <Link
              href="/dashboard/categories"
              className="text-xs text-orange-500 hover:text-orange-400 inline-flex items-center mt-1"
            >
              Manage categories
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Active Offers</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.activeOffers}</div>
            <Link
              href="/dashboard/offers"
              className="text-xs text-orange-500 hover:text-orange-400 inline-flex items-center mt-1"
            >
              View offers
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card className={contactStats.needsAttention > 0 ? "border-red-500/50 bg-red-500/5" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Contact Messages</CardTitle>
            <MessageSquare
              className={`h-4 w-4 ${contactStats.needsAttention > 0 ? "text-red-500" : "text-orange-500"}`}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{contactStats.total}</div>
            <div className="text-xs text-gray-400 mt-1">
              {contactStats.needsAttention > 0 ? (
                <span className="text-red-400">{contactStats.needsAttention} need attention</span>
              ) : (
                "All messages handled"
              )}
            </div>
            <Link
              href="/dashboard/communications"
              className="text-xs text-orange-500 hover:text-orange-400 inline-flex items-center mt-1"
            >
              View messages
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Newsletter</CardTitle>
            <Mail className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{newsletterStats.active}</div>
            <div className="text-xs text-gray-400 mt-1">
              {newsletterStats.thisMonth > 0 ? (
                <span className="text-green-400">+{newsletterStats.thisMonth} this month</span>
              ) : (
                "No new subscribers"
              )}
            </div>
            <Link
              href="/dashboard/communications"
              className="text-xs text-orange-500 hover:text-orange-400 inline-flex items-center mt-1"
            >
              Manage subscribers
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
