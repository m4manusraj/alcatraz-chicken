"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { LoadingSpinner } from "@/components/loading-spinner" // Assuming you have this

interface AuthContextType {
  user: User | null
  loading: boolean
  isRestaurantOwner?: boolean // Optional: for role-based access later
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  // const [isRestaurantOwner, setIsRestaurantOwner] = useState<boolean>(false); // For future role checks

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        // Example: Check for custom claims if you implement roles
        // const tokenResult = await firebaseUser.getIdTokenResult();
        // setIsRestaurantOwner(tokenResult.claims.isRestaurantOwner === true);
      } else {
        setUser(null)
        // setIsRestaurantOwner(false);
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <LoadingSpinner />
      </div>
    )
  }

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
