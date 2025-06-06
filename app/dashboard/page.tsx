'use client'

import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, orderBy, limit, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Pizza, DollarSign, Users, TrendingUp, ArrowRight, Plus } from 'lucide-react'
import { LoadingSpinner } from '@/components/loading-spinner'
import Link from 'next/link'

interface MenuItem {
  id: string
  name: string
  price: string
  category: string
  createdAt: any
}

interface DashboardStats {
  totalItems: number
  totalCategories: number
  activeOffers: number
  recentOrders: number
}

export default function DashboardPage() {
  const [recentItems, setRecentItems] = useState<MenuItem[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalItems: 0,
    totalCategories: 0,
    activeOffers: 0,
    recentOrders: 0
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch recent menu items
    const menuQuery = query(
      collection(db, 'menuItems'),
      orderBy('createdAt', 'desc'),
      limit(5)
    )

    // Set up listeners for all collections
    const unsubscribeMenu = onSnapshot(
      collection(db, 'menuItems'),
      (snapshot) => {
        setStats(prev => ({ ...prev, totalItems: snapshot.size }))
      },
      (error) => console.error('Error fetching menu items:', error)
    )

    const unsubscribeCategories = onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
        setStats(prev => ({ ...prev, totalCategories: snapshot.size }))
      },
      (error) => console.error('Error fetching categories:', error)
    )

    const unsubscribeOffers = onSnapshot(
      query(collection(db, 'offers'), where('isActive', '==', true)),
      (snapshot) => {
        setStats(prev => ({ ...prev, activeOffers: snapshot.size }))
      },
      (error) => console.error('Error fetching offers:', error)
    )

    // Fetch recent items separately
    const unsubscribeRecent = onSnapshot(menuQuery, 
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MenuItem[]
        setRecentItems(items)
        setLoading(false)
        setError(null)
      },
      (error) => {
        console.error('Error fetching recent items:', error)
        setError('Error loading menu items. Please check your database permissions.')
        setLoading(false)
      }
    )

    return () => {
      unsubscribeMenu()
      unsubscribeCategories()
      unsubscribeOffers()
      unsubscribeRecent()
    }
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg">
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Menu Items
            </CardTitle>
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
            <CardTitle className="text-sm font-medium text-gray-400">
              Categories
            </CardTitle>
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
            <CardTitle className="text-sm font-medium text-gray-400">
              Active Offers
            </CardTitle>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Recent Orders
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.recentOrders}</div>
            <p className="text-xs text-gray-400 mt-1">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Menu Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Added</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-white">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.price}</TableCell>
                  <TableCell className="text-right">
                    {item.createdAt?.toDate().toLocaleDateString() || 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 text-center">
            <Button asChild variant="outline">
              <Link href="/dashboard/menu">
                View All Menu Items
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
