"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Layout } from "@/components/layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { subscribeToRestaurantSettings } from "@/lib/settings-service"
import type { RestaurantSettings } from "@/types/menu"
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertCircle } from "lucide-react"
import { submitContactForm } from "@/lib/contact-service"

export default function ContactPage() {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [submitMessage, setSubmitMessage] = useState("")

  useEffect(() => {
    const unsubscribe = subscribeToRestaurantSettings((newSettings) => {
      setSettings(newSettings)
    })
    return unsubscribe
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      await submitContactForm(formData)
      setSubmitStatus("success")
      setSubmitMessage("Thank you! Your message has been sent successfully. We'll get back to you soon.")
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      })
    } catch (error) {
      setSubmitStatus("error")
      setSubmitMessage("Sorry, there was an error sending your message. Please try again or call us directly.")
      console.error("Error submitting contact form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format time from 24h to 12h format
  const formatTime = (time?: string) => {
    if (!time) return ""
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "pm" : "am"
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}${minutes !== "00" ? `:${minutes}` : ""}${ampm}`
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 via-red-500/20 to-black" />
        <div className="absolute inset-0 prison-bars opacity-20 pointer-events-none" />
        <div className="absolute inset-0 noise pointer-events-none" />

        <div className="container relative px-4 py-16 sm:py-20 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Badge variant="secondary" className="bg-orange-500/20 text-orange-400 mb-6 text-sm px-4 py-2">
              Get In Touch
            </Badge>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-6">
              CONTACT
              <span className="text-orange-500 ml-4">US</span>
            </h1>
            <p className="text-gray-300 text-lg sm:text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed">
              Have a question, feedback, or want to learn more about Alcatraz Chicken? We're here to help!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="py-16 sm:py-20 bg-[#1a1a1a] relative overflow-hidden">
        <div className="absolute inset-0 prison-bars opacity-5 pointer-events-none" />
        <div className="absolute inset-0 noise pointer-events-none" />

        <div className="container px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Visit Us or
              <span className="text-orange-500 ml-3">Call Ahead</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Find us in Kelowna or reach out through any of these channels
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Location */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-black/80 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 text-center border border-orange-500/10 hover:border-orange-500/30 transition-all duration-300"
            >
              <div className="bg-orange-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Location</h3>
              <div className="text-gray-400 leading-relaxed">
                <p className="font-medium">101-225 Rutland Rd S</p>
                <p>Kelowna, BC V1X 3E8</p>
                <p className="text-sm mt-2 text-orange-400">In Rutland Centre</p>
              </div>
            </motion.div>

            {/* Phone */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-black/80 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 text-center border border-orange-500/10 hover:border-orange-500/30 transition-all duration-300"
            >
              <div className="bg-orange-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Phone className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Phone</h3>
              <a
                href="tel:(250) 980-6991"
                className="text-gray-400 hover:text-orange-500 transition-colors text-lg font-medium"
              >
                (250) 980-6991
              </a>
              <p className="text-sm text-gray-500 mt-2">Call for orders & inquiries</p>
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-black/80 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 text-center border border-orange-500/10 hover:border-orange-500/30 transition-all duration-300"
            >
              <div className="bg-orange-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Email</h3>
              <a
                href="mailto:info@alcatrazchicken.ca"
                className="text-gray-400 hover:text-orange-500 transition-colors font-medium"
              >
                info@alcatrazchicken.ca
              </a>
              <p className="text-sm text-gray-500 mt-2">We'll respond within 24 hours</p>
            </motion.div>

            {/* Hours */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-black/80 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 text-center border border-orange-500/10 hover:border-orange-500/30 transition-all duration-300"
            >
              <div className="bg-orange-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Hours</h3>
              <div className="text-gray-400 text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Mon-Thu:</span>
                  <span>11am - 10pm</span>
                </div>
                <div className="flex justify-between">
                  <span>Fri-Sat:</span>
                  <span>11am - 11pm</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday:</span>
                  <span>12pm - 9pm</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 sm:py-20 bg-black relative overflow-hidden">
        <div className="absolute inset-0 prison-bars opacity-5 pointer-events-none" />
        <div className="absolute inset-0 noise pointer-events-none" />

        <div className="container px-4 relative">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Send Us a<span className="text-orange-500 ml-3">Message</span>
              </h2>
              <p className="text-gray-400 text-lg">
                Have a question, suggestion, or just want to say hello? We'd love to hear from you!
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-black/80 to-gray-900/50 backdrop-blur-sm border-orange-500/20">
                <CardContent className="p-8 sm:p-12">
                  {submitStatus !== "idle" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mb-8 p-4 rounded-lg flex items-center gap-3 ${
                        submitStatus === "success"
                          ? "bg-green-500/10 border border-green-500/20 text-green-400"
                          : "bg-red-500/10 border border-red-500/20 text-red-400"
                      }`}
                    >
                      {submitStatus === "success" ? (
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      )}
                      <p>{submitMessage}</p>
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-white mb-3">
                          Full Name *
                        </label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="bg-black/50 border-gray-600 text-white focus:border-orange-500 focus:ring-orange-500/20 h-12"
                          placeholder="Your full name"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-white mb-3">
                          Email Address *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="bg-black/50 border-gray-600 text-white focus:border-orange-500 focus:ring-orange-500/20 h-12"
                          placeholder="your.email@example.com"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-semibold text-white mb-3">
                          Phone Number
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="bg-black/50 border-gray-600 text-white focus:border-orange-500 focus:ring-orange-500/20 h-12"
                          placeholder="(555) 123-4567"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <label htmlFor="subject" className="block text-sm font-semibold text-white mb-3">
                          Subject *
                        </label>
                        <Input
                          id="subject"
                          name="subject"
                          type="text"
                          required
                          value={formData.subject}
                          onChange={handleInputChange}
                          className="bg-black/50 border-gray-600 text-white focus:border-orange-500 focus:ring-orange-500/20 h-12"
                          placeholder="What's this about?"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-semibold text-white mb-3">
                        Message *
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleInputChange}
                        className="bg-black/50 border-gray-600 text-white focus:border-orange-500 focus:ring-orange-500/20 resize-none"
                        placeholder="Tell us what's on your mind..."
                        disabled={isSubmitting}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 text-lg transition-all duration-300 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending Message...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Send className="w-5 h-5" />
                          Send Message
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#1a1a1a] to-black relative overflow-hidden">
        <div className="absolute inset-0 prison-bars opacity-5 pointer-events-none" />
        <div className="absolute inset-0 noise pointer-events-none" />

        <div className="container px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready to
              <span className="text-orange-500 ml-3">Order?</span>
            </h2>
            <p className="text-gray-400 text-xl mb-10 leading-relaxed">
              Skip the wait and order online for pickup or delivery! Experience the bold flavors of Alcatraz Chicken.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-8 py-4 text-lg"
              onClick={() => window.open("https://alcatrazchicken.order-online.ai/#/", "_blank")}
            >
              Order Now
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  )
}
