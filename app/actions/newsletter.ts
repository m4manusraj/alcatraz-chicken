"use server"

import { subscribeToNewsletter } from "@/lib/contact-service"

export async function subscribeNewsletterAction(formData: FormData) {
  const email = formData.get("email") as string

  if (!email || !email.trim()) {
    return { success: false, message: "Please enter a valid email address" }
  }

  try {
    await subscribeToNewsletter(email.trim())
    return { success: true, message: "Successfully subscribed! Welcome to the Most Wanted List!" }
  } catch (error: any) {
    console.error("Newsletter subscription error:", error)

    if (error.message === "Email already subscribed") {
      return { success: false, message: "This email is already subscribed to our newsletter." }
    } else {
      return { success: false, message: "Failed to subscribe. Please try again." }
    }
  }
}
