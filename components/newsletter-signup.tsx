"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, CheckCircle, AlertCircle } from "lucide-react"
import { subscribeToNewsletter } from "@/lib/contact-service"

console.log("[NewsletterSignup] component rendered");

export function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error" | "exists">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("[NewsletterSignup] handleSubmit called");
    e.preventDefault()
    console.log("[NewsletterSignup] preventDefault called");
    console.log("[NewsletterSignup] email value:", email)

    if (!email.trim()) {
      setStatus("error")
      setMessage("Please enter a valid email address")
      console.log("[NewsletterSignup] Invalid email, aborting");
      return
    }

    setIsSubmitting(true)
    setStatus("idle")
    setMessage("")
    console.log("[NewsletterSignup] Submitting to subscribeToNewsletter...");

    try {
      await subscribeToNewsletter(email.trim())
      setStatus("success")
      setMessage("Successfully subscribed! Welcome to the Most Wanted List!")
      setEmail("")
      console.log("[NewsletterSignup] Subscription successful");
    } catch (error: any) {
      console.error("Newsletter subscription error:", error)
      if (error.message === "Email already subscribed") {
        setStatus("exists")
        setMessage("This email is already subscribed to our newsletter.")
        console.log("[NewsletterSignup] Email already subscribed");
      } else {
        setStatus("error")
        setMessage("Failed to subscribe. Please try again.")
        console.log("[NewsletterSignup] Subscription failed");
      }
    } finally {
      setIsSubmitting(false)
      console.log("[NewsletterSignup] isSubmitting set to false");
      // Clear message after 5 seconds
      setTimeout(() => {
        setStatus("idle")
        setMessage("")
        console.log("[NewsletterSignup] Status and message reset after timeout");
      }, 5000)
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case "error":
      case "exists":
        return <AlertCircle className="w-5 h-5 text-red-400" />
      default:
        return null
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "error":
      case "exists":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return ""
    }
  }

  return (
    <div className="max-w-2xl mx-auto text-center">
      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Join the Most Wanted List</h3>
      <p className="text-sm sm:text-base text-gray-400 mb-6">
        Subscribe to get exclusive deals and be the first to know about new menu items.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
            className="bg-white/5 border-orange-500/20 text-white placeholder:text-gray-500 focus:border-orange-500/40"
          />
          <Button
            type="submit"
            disabled={isSubmitting || !email.trim()}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Subscribing...
              </>
            ) : (
              <>
                Subscribe
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm border flex items-center gap-2 ${getStatusColor()}`}>
            {getStatusIcon()}
            <span>{message}</span>
          </div>
        )}
      </form>
    </div>
  )
}
