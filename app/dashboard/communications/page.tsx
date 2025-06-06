"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  getPaginatedContacts,
  getPaginatedNewsletterSubscriptions,
  updateContactStatus,
  updateNewsletterStatus,
  type ContactSubmission,
  type NewsletterSubscription,
} from "@/lib/contact-service"
import {
  Mail,
  Phone,
  Calendar,
  Search,
  Users,
  MessageSquare,
  ChevronRight,
  Clock,
  Trash2,
  RotateCcw,
} from "lucide-react"
import { format } from "date-fns"

export default function CommunicationsPage() {
  const [contacts, setContacts] = useState<ContactSubmission[]>([])
  const [newsletters, setNewsletters] = useState<NewsletterSubscription[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read" | "replied" | "not_replied">("all")

  // Modal states
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null)
  const [selectedNewsletter, setSelectedNewsletter] = useState<NewsletterSubscription | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  // Pagination states
  const [contactsPage, setContactsPage] = useState(1)
  const [newsletterPage, setNewsletterPage] = useState(1)
  const [contactsHasMore, setContactsHasMore] = useState(true)
  const [newsletterHasMore, setNewsletterHasMore] = useState(true)
  const [contactsLastDoc, setContactsLastDoc] = useState<any>(null)
  const [newsletterLastDoc, setNewsletterLastDoc] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const pageSize = 20

  const loadContacts = async (page = 1, reset = false) => {
    setLoading(true)
    try {
      const lastDoc = reset ? null : page === 1 ? null : contactsLastDoc
      const result = await getPaginatedContacts(pageSize, lastDoc)

      if (reset || page === 1) {
        setContacts(result.contacts)
      } else {
        setContacts((prev) => [...prev, ...result.contacts])
      }

      setContactsLastDoc(result.lastDoc)
      setContactsHasMore(result.hasMore)
      setContactsPage(page)
    } catch (error) {
      console.error("Error loading contacts:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadNewsletters = async (page = 1, reset = false) => {
    setLoading(true)
    try {
      const lastDoc = reset ? null : page === 1 ? null : newsletterLastDoc
      const result = await getPaginatedNewsletterSubscriptions(pageSize, lastDoc)

      if (reset || page === 1) {
        setNewsletters(result.subscriptions)
      } else {
        setNewsletters((prev) => [...prev, ...result.subscriptions])
      }

      setNewsletterLastDoc(result.lastDoc)
      setNewsletterHasMore(result.hasMore)
      setNewsletterPage(page)
    } catch (error) {
      console.error("Error loading newsletters:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContacts(1, true)
    loadNewsletters(1, true)
  }, [])

  const handleContactClick = async (contact: ContactSubmission) => {
    setSelectedContact(contact)

    // Automatically mark as read if it's unread
    if (contact.status === "unread") {
      try {
        await updateContactStatus(contact.id!, "read")
        const updatedContact = { ...contact, status: "read" as const }
        setSelectedContact(updatedContact)
        setContacts((prev) => prev.map((c) => (c.id === contact.id ? updatedContact : c)))
      } catch (error) {
        console.error("Error updating contact status:", error)
      }
    }
  }

  const handleStatusUpdate = async (contactId: string, newStatus: "unread" | "read" | "replied" | "not_replied") => {
    if (isUpdatingStatus) return

    setIsUpdatingStatus(true)
    try {
      await updateContactStatus(contactId, newStatus)

      // Update contacts list
      setContacts((prev) =>
        prev.map((contact) => (contact.id === contactId ? { ...contact, status: newStatus } : contact)),
      )

      // Update selected contact
      if (selectedContact?.id === contactId) {
        setSelectedContact((prev) => (prev ? { ...prev, status: newStatus } : null))
      }
    } catch (error) {
      console.error("Error updating contact status:", error)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleNewsletterStatusUpdate = async (subscriptionId: string, status: "active" | "unsubscribed") => {
    try {
      await updateNewsletterStatus(subscriptionId, status)

      // Update newsletters list
      setNewsletters((prev) =>
        prev.map((subscription) => (subscription.id === subscriptionId ? { ...subscription, status } : subscription)),
      )

      // Update selected newsletter
      if (selectedNewsletter?.id === subscriptionId) {
        setSelectedNewsletter((prev) => (prev ? { ...prev, status } : null))
      }
    } catch (error) {
      console.error("Error updating newsletter status:", error)
    }
  }

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || contact.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredNewsletters = newsletters.filter(
    (subscription) =>
      subscription.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subscription.name && subscription.name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const unreadCount = contacts.filter((contact) => contact.status === "unread").length
  const notRepliedCount = contacts.filter((contact) => contact.status === "not_replied").length
  const activeSubscribers = newsletters.filter((sub) => sub.status === "active").length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "unread":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Unread</Badge>
      case "read":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Read</Badge>
      case "replied":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Replied</Badge>
      case "not_replied":
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Not Replied</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "unread":
        return "border-l-red-500"
      case "read":
        return "border-l-yellow-500"
      case "replied":
        return "border-l-green-500"
      case "not_replied":
        return "border-l-orange-500"
      default:
        return "border-l-gray-500"
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Communications</h1>
          <p className="text-gray-400 mt-2">Manage contact messages and newsletter subscriptions</p>
        </div>

        <div className="flex gap-4">
          <Card className="bg-black/50 border-orange-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-400">Needs Attention</p>
                <p className="text-xl font-bold text-white">{unreadCount + notRepliedCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/50 border-orange-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-400">Active Subscribers</p>
                <p className="text-xl font-bold text-white">{activeSubscribers}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search messages, emails, or subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-black/50 border-gray-700 text-white"
          />
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Tabs defaultValue="contacts" className="space-y-6">
          <TabsList className="bg-black/50 border border-orange-500/20">
            <TabsTrigger value="contacts" className="data-[state=active]:bg-orange-500">
              Contact Messages ({contacts.length})
            </TabsTrigger>
            <TabsTrigger value="newsletter" className="data-[state=active]:bg-orange-500">
              Newsletter ({newsletters.length})
            </TabsTrigger>
          </TabsList>

          {/* Contact Messages Tab */}
          <TabsContent value="contacts" className="space-y-4">
            <div className="flex gap-2 mb-4 flex-wrap">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
                className={statusFilter === "all" ? "bg-orange-500" : ""}
              >
                All
              </Button>
              <Button
                variant={statusFilter === "unread" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("unread")}
                className={statusFilter === "unread" ? "bg-orange-500" : ""}
              >
                Unread ({unreadCount})
              </Button>
              <Button
                variant={statusFilter === "read" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("read")}
                className={statusFilter === "read" ? "bg-orange-500" : ""}
              >
                Read
              </Button>
              <Button
                variant={statusFilter === "not_replied" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("not_replied")}
                className={statusFilter === "not_replied" ? "bg-orange-500" : ""}
              >
                Not Replied ({notRepliedCount})
              </Button>
              <Button
                variant={statusFilter === "replied" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("replied")}
                className={statusFilter === "replied" ? "bg-orange-500" : ""}
              >
                Replied
              </Button>
            </div>

            {/* Contact List */}
            <div className="space-y-2">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => handleContactClick(contact)}
                  className={`bg-black/50 border-l-4 ${getStatusColor(
                    contact.status,
                  )} border-r border-t border-b border-orange-500/20 hover:border-orange-500/40 transition-colors cursor-pointer p-4 rounded-r-lg`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-medium truncate">{contact.name}</h3>
                        {getStatusBadge(contact.status)}
                      </div>
                      <p className="text-orange-400 font-medium truncate mb-1">{contact.subject}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{contact.email}</span>
                        </div>
                        {contact.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{contact.createdAt && format(contact.createdAt.toDate(), "MMM dd, HH:mm")}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}

              {filteredContacts.length === 0 && (
                <Card className="bg-black/50 border-orange-500/20">
                  <CardContent className="p-8 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No contact messages found</p>
                  </CardContent>
                </Card>
              )}

              {/* Pagination for Contacts */}
              {contactsHasMore && (
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={() => loadContacts(contactsPage + 1)}
                    disabled={loading}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {loading ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Newsletter Tab */}
          <TabsContent value="newsletter" className="space-y-4">
            <div className="space-y-2">
              {filteredNewsletters.map((subscription) => (
                <div
                  key={subscription.id}
                  onClick={() => setSelectedNewsletter(subscription)}
                  className="bg-black/50 border border-orange-500/20 hover:border-orange-500/40 transition-colors cursor-pointer p-4 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-medium truncate">{subscription.name || subscription.email}</h3>
                        <Badge
                          variant={subscription.status === "active" ? "default" : "secondary"}
                          className={
                            subscription.status === "active"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-gray-500/20 text-gray-400"
                          }
                        >
                          {subscription.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{subscription.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {subscription.createdAt && format(subscription.createdAt.toDate(), "MMM dd, yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}

              {filteredNewsletters.length === 0 && (
                <Card className="bg-black/50 border-orange-500/20">
                  <CardContent className="p-8 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No newsletter subscriptions found</p>
                  </CardContent>
                </Card>
              )}

              {/* Pagination for Newsletter */}
              {newsletterHasMore && (
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={() => loadNewsletters(newsletterPage + 1)}
                    disabled={loading}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {loading ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Contact Modal */}
      <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
        <DialogContent className="bg-black border-orange-500/20 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">Contact Message</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Name</label>
                  <p className="text-white font-medium">{selectedContact.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <p className="text-white">{selectedContact.email}</p>
                </div>
                {selectedContact.phone && (
                  <div>
                    <label className="text-sm text-gray-400">Phone</label>
                    <p className="text-white">{selectedContact.phone}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm text-gray-400">Date</label>
                  <p className="text-white">
                    {selectedContact.createdAt && format(selectedContact.createdAt.toDate(), "MMM dd, yyyy HH:mm")}
                  </p>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="text-sm text-gray-400">Subject</label>
                <p className="text-orange-400 font-medium">{selectedContact.subject}</p>
              </div>

              {/* Message */}
              <div>
                <label className="text-sm text-gray-400">Message</label>
                <div className="bg-gray-900/50 p-4 rounded-lg mt-2">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedContact.message}</p>
                </div>
              </div>

              {/* Status Management */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Status</label>
                <Select
                  value={selectedContact.status}
                  onValueChange={(value: "unread" | "read" | "replied" | "not_replied") =>
                    handleStatusUpdate(selectedContact.id!, value)
                  }
                  disabled={isUpdatingStatus}
                >
                  <SelectTrigger className="bg-black/50 border-orange-500/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-orange-500/20">
                    <SelectItem value="unread" className="text-white hover:bg-orange-500/20">
                      Unread
                    </SelectItem>
                    <SelectItem value="read" className="text-white hover:bg-orange-500/20">
                      Read
                    </SelectItem>
                    <SelectItem value="not_replied" className="text-white hover:bg-orange-500/20">
                      Not Replied
                    </SelectItem>
                    <SelectItem value="replied" className="text-white hover:bg-orange-500/20">
                      Replied
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => (window.location.href = `mailto:${selectedContact.email}`)}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Reply via Email
                </Button>
                {selectedContact.phone && (
                  <Button
                    variant="outline"
                    onClick={() => (window.location.href = `tel:${selectedContact.phone}`)}
                    className="border-orange-500/20 text-orange-500 hover:bg-orange-500/10"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Newsletter Modal */}
      <Dialog open={!!selectedNewsletter} onOpenChange={() => setSelectedNewsletter(null)}>
        <DialogContent className="bg-black border-orange-500/20 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">Newsletter Subscription</DialogTitle>
          </DialogHeader>
          {selectedNewsletter && (
            <div className="space-y-6">
              {/* Subscriber Info */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <p className="text-white font-medium">{selectedNewsletter.email}</p>
                </div>
                {selectedNewsletter.name && (
                  <div>
                    <label className="text-sm text-gray-400">Name</label>
                    <p className="text-white">{selectedNewsletter.name}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm text-gray-400">Subscribed Date</label>
                  <p className="text-white">
                    {selectedNewsletter.createdAt && format(selectedNewsletter.createdAt.toDate(), "MMM dd, yyyy")}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Status</label>
                  <div className="mt-1">
                    <Badge
                      variant={selectedNewsletter.status === "active" ? "default" : "secondary"}
                      className={
                        selectedNewsletter.status === "active"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-gray-500/20 text-gray-400"
                      }
                    >
                      {selectedNewsletter.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                {selectedNewsletter.status === "active" ? (
                  <Button
                    onClick={() => handleNewsletterStatusUpdate(selectedNewsletter.id!, "unsubscribed")}
                    variant="outline"
                    className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Unsubscribe
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleNewsletterStatusUpdate(selectedNewsletter.id!, "active")}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reactivate
                  </Button>
                )}
                <Button
                  onClick={() => (window.location.href = `mailto:${selectedNewsletter.email}`)}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
