"use client"

import { Pizza, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { MenuItem } from "@/types/menu"

interface MenuItemsTableProps {
  menuItems: MenuItem[]
  onEdit: (item: MenuItem) => void
  onDelete: (id: string) => void
}

export function MenuItemsTable({ menuItems, onEdit, onDelete }: MenuItemsTableProps) {
  if (menuItems.length === 0) {
    return (
      <div className="text-center py-8">
        <Pizza className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-300 mb-2">No menu items found</h3>
        <p className="text-gray-500">Get started by adding your first menu item.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-orange-500/20">
          <TableHead className="text-gray-300">Image</TableHead>
          <TableHead className="text-gray-300">Name</TableHead>
          <TableHead className="text-gray-300">Category</TableHead>
          <TableHead className="text-gray-300">Price</TableHead>
          <TableHead className="text-gray-300">Variations</TableHead>
          <TableHead className="text-gray-300">Add-ons</TableHead>
          <TableHead className="text-gray-300">Status</TableHead>
          <TableHead className="text-right text-gray-300">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {menuItems.map((item) => (
          <TableRow key={item.id} className="border-orange-500/10 hover:bg-orange-500/5">
            <TableCell>
              {item.image ? (
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  className="h-12 w-12 rounded-md object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-md bg-orange-900/30 flex items-center justify-center">
                  <Pizza className="h-6 w-6 text-orange-500/70" />
                </div>
              )}
            </TableCell>
            <TableCell className="font-medium text-white">{item.name}</TableCell>
            <TableCell className="text-gray-400">{item.category}</TableCell>
            <TableCell className="text-gray-300">${item.price.toFixed(2)}</TableCell>
            <TableCell>
              {item.variations?.length ? (
                <Badge variant="secondary" className="bg-blue-900/30 text-blue-400 border-blue-500/30">
                  {item.variations.length}
                </Badge>
              ) : (
                <span className="text-gray-500">-</span>
              )}
            </TableCell>
            <TableCell>
              {item.addons?.length ? (
                <Badge variant="secondary" className="bg-purple-900/30 text-purple-400 border-purple-500/30">
                  {item.addons.length}
                </Badge>
              ) : (
                <span className="text-gray-500">-</span>
              )}
            </TableCell>
            <TableCell>
              <Badge
                className={
                  item.isActive
                    ? "bg-green-700/30 text-green-400 border-green-500/30"
                    : "bg-red-700/30 text-red-400 border-red-500/30"
                }
              >
                {item.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(item)}
                  className="text-orange-500 hover:text-orange-400 hover:bg-orange-500/10"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(item.id)}
                  className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
