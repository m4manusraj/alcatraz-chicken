export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string // Should match a Category name or ID
  image?: string
  isActive: boolean
  isFeatured?: boolean
  variations: MenuItemVariation[]
  addons: MenuItemAddon[]
  allergens: string[] // List of allergen names
  nutritionalInfo?: NutritionalInfo
  tags?: string[] // e.g., "Spicy", "Vegetarian", "Popular"
  preparationTime?: number // in minutes
  sortOrder?: number // For custom sorting within categories
  createdAt: any
  updatedAt: any
}

export interface MenuItemVariation {
  id: string // Can be a generated UUID
  name: string // e.g., "Small", "Medium", "Large" or "Mild", "Spicy"
  priceAdjustment: number // Can be positive or negative, or 0 for no change
  isDefault?: boolean
}

export interface MenuItemAddon {
  id: string // Can be a generated UUID
  name: string // e.g., "Extra Cheese", "Garlic Sauce"
  price: number
  category?: string // e.g., "Sauces", "Toppings", "Sides"
}

export interface NutritionalInfo {
  calories?: number
  protein?: number // in grams
  carbs?: number // in grams
  fat?: number // in grams
  servingSize?: string // e.g., "100g", "1 piece"
}

export interface Category {
  id: string
  name: string
  description?: string
  image?: string
  order: number
  isActive: boolean
  createdAt: any
  updatedAt: any
}

export interface ComboMeal {
  id: string
  name: string
  description: string
  price?: number // Optional: if set, overrides calculated price
  image?: string
  isActive: boolean
  items: ComboItemConfiguration[]
  createdAt: any
  updatedAt: any
}

// Represents an item *within* a combo, detailing its specific configuration
export interface ComboItemConfiguration {
  id: string // Unique ID for this instance in the combo
  menuItemId: string // ID of the MenuItem
  menuItemName?: string // Store name for display, denormalized
  quantity: number
  selectedVariationId?: string // ID of the chosen MenuItemVariation
  selectedAddonIds?: string[] // IDs of chosen MenuItemAddons
  isOptional?: boolean
  // You might add a field for `allowedVariations` or `allowedAddons` if they are restricted for the combo
}

/*
export interface Order {
id: string
orderNumber: string // Human-readable order ID
customerId?: string // Link to a customer if applicable
customerName: string
customerEmail?: string
customerPhone?: string
items: OrderItem[]
subTotal: number
taxAmount: number
discountAmount: number
totalAmount: number
status: "pending" | "confirmed" | "preparing" | "ready_for_pickup" | "out_for_delivery" | "completed" | "cancelled"
paymentStatus: "pending" | "paid" | "failed" | "refunded"
paymentMethod?: string
orderType: "pickup" | "delivery"
deliveryAddress?: Address
pickupTime?: any // Firestore Timestamp
notes?: string
createdAt: any
updatedAt: any
}

export interface OrderItem {
menuItemId: string
name: string
quantity: number
unitPrice: number // Price at the time of order
totalPrice: number
variation?: { name: string; priceAdjustment: number }
addons?: { name: string; price: number }[]
}
*/

export interface Offer {
  id: string
  title: string
  description: string
  code?: string
  discountType: "percentage" | "fixed_amount" | "free_item"
  discountValue: number // Percentage value or fixed amount
  freeMenuItemId?: string // if discountType is 'free_item'
  applicableTo: "all" | "specific_items" | "specific_categories"
  itemIds?: string[] // if applicableTo is 'specific_items'
  categoryIds?: string[] // if applicableTo is 'specific_categories'
  minPurchaseAmount?: number
  image?: string
  link?: string // For external promotions or direct order links
  startDate: any // Firestore Timestamp
  expiryDate?: any // Firestore Timestamp
  isActive: boolean
  usageLimit?: number
  timesUsed?: number
  createdAt: any
  updatedAt: any
}

export interface Address {
  street: string
  city: string
  province: string
  postalCode: string
  country: string
  notes?: string
}

export interface RestaurantSettings {
  id: "main" // Singleton document ID
  restaurantName: string
  address: Address
  phone: string
  email: string
  operatingHours: OperatingHours[]
  currency: string // e.g., "CAD", "USD"
  deliverySettings?: {
    enabled: boolean
    baseFee: number
    freeDeliveryOverAmount?: number
    estimatedTimeMinutes: number // Average delivery time
    zones?: DeliveryZone[]
    useStoreHours: boolean // true = use store hours, false = use custom hours
    customHours?: OperatingHours[] // only used if useStoreHours is false
    offsetMinutes: number // minutes before closing to stop accepting orders
  }
  pickupSettings?: {
    enabled: boolean
    estimatedTimeMinutes: number // Average pickup prep time
    useStoreHours: boolean // true = use store hours, false = use custom hours
    customHours?: OperatingHours[] // only used if useStoreHours is false
    offsetMinutes: number // minutes before closing to stop accepting orders
  }
  socialMediaLinks?: {
    instagram?: string
    facebook?: string
    twitter?: string
  }
  logoUrl?: string
  faviconUrl?: string
  bannerSettings?: {
    enabled: boolean // whether to show service unavailable banner
  }
  updatedAt: any
}

export interface OperatingHours {
  dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"
  isOpen: boolean
  openTime?: string // "HH:MM" format (24-hour)
  closeTime?: string // "HH:MM" format (24-hour)
}

export interface DeliveryZone {
  name: string
  postalCodes: string[] // List of postal code prefixes or full codes
  fee: number
}

// For use in dialogs, not directly in Firestore for MenuItem
export interface TempMenuItemVariation extends MenuItemVariation {
  _tempId: string // For local list management before saving
}
export interface TempMenuItemAddon extends MenuItemAddon {
  _tempId: string // For local list management before saving
}
