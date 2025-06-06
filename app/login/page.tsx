"use client"

import { useState, type FormEvent, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard") // Redirect if already logged in
    }
  }, [user, authLoading, router])

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast.success("Login successful! Redirecting...")
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Failed to login. Please check your credentials.")
      toast.error(err.message || "Failed to login. Please check your credentials.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || (!authLoading && user)) {
    // Show loading spinner or null while checking auth state or redirecting
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#101010] to-[#1a1a1a] p-4">
      <Card className="w-full max-w-md bg-black/80 backdrop-blur-lg border-orange-500/30 text-white shadow-2xl shadow-orange-500/10">
        <CardHeader className="text-center">
          <img
            src="https://res.cloudinary.com/dokqexnoi/image/upload/v1736053004/818abd7e-0605-4b56-9e97-fe3773335da6.png"
            alt="Alcatraz Chicken Logo"
            className="w-24 h-auto mx-auto mb-4"
          />
          <CardTitle className="text-3xl font-bold text-orange-500">Admin Login</CardTitle>
          <CardDescription className="text-gray-400">Access your Alcatraz Chicken dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/5 border-orange-500/20 text-white placeholder:text-gray-500 focus:border-orange-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/5 border-orange-500/20 text-white placeholder:text-gray-500 focus:border-orange-500"
              />
            </div>
            {error && <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-md">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              ) : null}
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center block">
          <Link href="/" className="text-sm text-orange-400 hover:text-orange-300 hover:underline">
            ← Back to Main Site
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
