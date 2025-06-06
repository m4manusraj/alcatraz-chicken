"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Twitter } from "lucide-react"
import { subscribeToRestaurantSettings, formatOperatingHours } from "@/lib/settings-service"
import type { RestaurantSettings } from "@/types/menu"

export default function ContactPage() {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  useEffect(() => {
    const unsubscribe = subscribeToRestaurantSettings(setSettings)
    return unsubscribe
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Form submitted:", formData)
    // You could integrate with a service like EmailJS or send to your backend
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Get In <span className="text-orange-500">Touch</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Have questions about our menu, catering, or want to share feedback? We'd love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information & Form */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-orange-500">Contact Information</h2>
                <p className="text-gray-300 mb-8">
                  Reach out to us through any of the following methods. We're here to help!
                </p>
              </div>

              <div className="space-y-6">
                {/* Address */}
                <Card className="bg-gray-900/50 border-orange-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <MapPin className="h-6 w-6 text-orange-500 mt-1" />
                      <div>
                        <h3 className="font-semibold text-white mb-2">Address</h3>
                        {settings?.address ? (
                          <p className="text-gray-300">
                            {settings.address.street}
                            <br />
                            {settings.address.city}, {settings.address.province} {settings.address.postalCode}
                            <br />
                            {settings.address.country}
                          </p>
                        ) : (
                          <p className="text-gray-300">
                            123 Prison Street
                            <br />
                            Alcatraz Island, CA 94133
                            <br />
                            United States
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Phone */}
                <Card className="bg-gray-900/50 border-orange-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Phone className="h-6 w-6 text-orange-500 mt-1" />
                      <div>
                        <h3 className="font-semibold text-white mb-2">Phone</h3>
                        <p className="text-gray-300">{settings?.phone || "(555) 123-BIRD"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Email */}
                <Card className="bg-gray-900/50 border-orange-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Mail className="h-6 w-6 text-orange-500 mt-1" />
                      <div>
                        <h3 className="font-semibold text-white mb-2">Email</h3>
                        <p className="text-gray-300">{settings?.email || "info@alcatrazchicken.com"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Hours */}
                <Card className="bg-gray-900/50 border-orange-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Clock className="h-6 w-6 text-orange-500 mt-1" />
                      <div>
                        <h3 className="font-semibold text-white mb-2">Hours</h3>
                        {settings?.operatingHours ? (
                          <pre className="text-gray-300 whitespace-pre-line font-sans">
                            {formatOperatingHours(settings.operatingHours)}
                          </pre>
                        ) : (
                          <div className="text-gray-300">
                            <p>Monday - Thursday: 11:00 AM - 10:00 PM</p>
                            <p>Friday - Saturday: 11:00 AM - 11:00 PM</p>
                            <p>Sunday: 12:00 PM - 9:00 PM</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Social Media */}
                {settings?.socialMediaLinks && (
                  <Card className="bg-gray-900/50 border-orange-500/20">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-white mb-4">Follow Us</h3>
                      <div className="flex gap-4">
                        {settings.socialMediaLinks.instagram && (
                          <a
                            href={settings.socialMediaLinks.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-500 hover:text-orange-400 transition-colors"
                          >
                            <Instagram className="h-6 w-6" />
                          </a>
                        )}
                        {settings.socialMediaLinks.facebook && (
                          <a
                            href={settings.socialMediaLinks.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-500 hover:text-orange-400 transition-colors"
                          >
                            <Facebook className="h-6 w-6" />
                          </a>
                        )}
                        {settings.socialMediaLinks.twitter && (
                          <a
                            href={settings.socialMediaLinks.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-500 hover:text-orange-400 transition-colors"
                          >
                            <Twitter className="h-6 w-6" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <Card className="bg-gray-900/50 border-orange-500/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-orange-500">Send us a Message</CardTitle>
                  <CardDescription className="text-gray-300">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="bg-black/50 border-gray-700 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="bg-black/50 border-gray-700 text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="bg-black/50 border-gray-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        className="bg-black/50 border-gray-700 text-white"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
