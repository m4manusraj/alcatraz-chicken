"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, CheckCircle, AlertCircle } from "lucide-react"
import { subscribeNewsletterAction } from "@/app/actions/newsletter"

export function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!email.trim()) {
      setStatus("error")
      setMessage("Please enter a valid email address")
      return
    }

    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append("email", email.trim())

        const result = await subscribeNewsletterAction(formData)

        if (result.success) {
          setStatus("success")
          setMessage(result.message)
          setEmail("")
        } else {
          setStatus("error")
          setMessage(result.message)
        }
      } catch (error: any) {
        console.error("Newsletter submission error:", error)
        setStatus("error")
        setMessage("An unexpected error occurred. Please try again.")
      } finally {
        // Clear message after 5 seconds
        setTimeout(() => {
          setStatus("idle")
          setMessage("")
        }, 5000)
      }
    })
  }

  const getStatusIcon = () => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case "error":
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
            name="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isPending}
            className="bg-white/5 border-orange-500/20 text-white placeholder:text-gray-500 focus:border-orange-500/40"
          />
          <Button
            type="submit"
            disabled={isPending || !email.trim()}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
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
