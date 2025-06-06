import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  limit,
  startAfter,
  getDocs,
  where,
  Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"

export interface ContactSubmission {
  id?: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  status: "unread" | "read" | "replied" | "not_replied"
  createdAt: any
  updatedAt: any
}

export interface NewsletterSubscription {
  id?: string
  email: string
  name?: string
  status: "active" | "unsubscribed"
  createdAt: any
}

// Submit contact form
export async function submitContactForm(formData: {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}) {
  try {
    const docRef = await addDoc(collection(db, "contacts"), {
      ...formData,
      status: "unread",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error submitting contact form:", error)
    throw error
  }
}

// Get paginated contact submissions
export async function getPaginatedContacts(pageSize = 10, lastDoc?: any) {
  try {
    let q = query(collection(db, "contacts"), orderBy("createdAt", "desc"), limit(pageSize))

    if (lastDoc) {
      q = query(collection(db, "contacts"), orderBy("createdAt", "desc"), startAfter(lastDoc), limit(pageSize))
    }

    const snapshot = await getDocs(q)
    const contacts: ContactSubmission[] = []

    snapshot.forEach((doc) => {
      contacts.push({
        id: doc.id,
        ...doc.data(),
      } as ContactSubmission)
    })

    return {
      contacts,
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === pageSize,
    }
  } catch (error) {
    console.error("Error getting paginated contacts:", error)
    throw error
  }
}

// Subscribe to contact submissions (for real-time updates)
export function subscribeToContactSubmissions(callback: (contacts: ContactSubmission[]) => void) {
  const q = query(collection(db, "contacts"), orderBy("createdAt", "desc"), limit(50))

  return onSnapshot(q, (snapshot) => {
    const contacts: ContactSubmission[] = []
    snapshot.forEach((doc) => {
      contacts.push({
        id: doc.id,
        ...doc.data(),
      } as ContactSubmission)
    })
    callback(contacts)
  })
}

// Get contact stats for dashboard
export async function getContactStats() {
  try {
    const allContactsQuery = query(collection(db, "contacts"))
    const unreadContactsQuery = query(collection(db, "contacts"), where("status", "==", "unread"))
    const notRepliedContactsQuery = query(collection(db, "contacts"), where("status", "==", "not_replied"))

    const [allSnapshot, unreadSnapshot, notRepliedSnapshot] = await Promise.all([
      getDocs(allContactsQuery),
      getDocs(unreadContactsQuery),
      getDocs(notRepliedContactsQuery),
    ])

    return {
      total: allSnapshot.size,
      unread: unreadSnapshot.size,
      notReplied: notRepliedSnapshot.size,
      needsAttention: unreadSnapshot.size + notRepliedSnapshot.size,
    }
  } catch (error) {
    console.error("Error getting contact stats:", error)
    return { total: 0, unread: 0, notReplied: 0, needsAttention: 0 }
  }
}

// Update contact status
export async function updateContactStatus(contactId: string, status: "unread" | "read" | "replied" | "not_replied") {
  try {
    const contactRef = doc(db, "contacts", contactId)
    await updateDoc(contactRef, {
      status,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating contact status:", error)
    throw error
  }
}

// Subscribe to newsletter
export async function subscribeToNewsletter(email: string, name?: string) {
  try {
    // Check if email already exists
    const existingQuery = query(collection(db, "newsletter"), where("email", "==", email))
    const existingSnapshot = await getDocs(existingQuery)

    if (!existingSnapshot.empty) {
      throw new Error("Email already subscribed")
    }

    const docRef = await addDoc(collection(db, "newsletter"), {
      email,
      name: name || "",
      status: "active",
      createdAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error subscribing to newsletter:", error)
    throw error
  }
}

// Get paginated newsletter subscriptions
export async function getPaginatedNewsletterSubscriptions(pageSize = 10, lastDoc?: any) {
  try {
    let q = query(collection(db, "newsletter"), orderBy("createdAt", "desc"), limit(pageSize))

    if (lastDoc) {
      q = query(collection(db, "newsletter"), orderBy("createdAt", "desc"), startAfter(lastDoc), limit(pageSize))
    }

    const snapshot = await getDocs(q)
    const subscriptions: NewsletterSubscription[] = []

    snapshot.forEach((doc) => {
      subscriptions.push({
        id: doc.id,
        ...doc.data(),
      } as NewsletterSubscription)
    })

    return {
      subscriptions,
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === pageSize,
    }
  } catch (error) {
    console.error("Error getting paginated newsletter subscriptions:", error)
    throw error
  }
}

// Subscribe to newsletter subscriptions (for real-time updates)
export function subscribeToNewsletterSubscriptions(callback: (subscriptions: NewsletterSubscription[]) => void) {
  const q = query(collection(db, "newsletter"), orderBy("createdAt", "desc"), limit(50))

  return onSnapshot(q, (snapshot) => {
    const subscriptions: NewsletterSubscription[] = []
    snapshot.forEach((doc) => {
      subscriptions.push({
        id: doc.id,
        ...doc.data(),
      } as NewsletterSubscription)
    })
    callback(subscriptions)
  })
}

// Get newsletter stats for dashboard
export async function getNewsletterStats() {
  try {
    const allSubscriptionsQuery = query(collection(db, "newsletter"))
    const activeSubscriptionsQuery = query(collection(db, "newsletter"), where("status", "==", "active"))

    // Get subscriptions from this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const thisMonthQuery = query(
      collection(db, "newsletter"),
      where("createdAt", ">=", Timestamp.fromDate(startOfMonth)),
      where("status", "==", "active"),
    )

    const [allSnapshot, activeSnapshot, thisMonthSnapshot] = await Promise.all([
      getDocs(allSubscriptionsQuery),
      getDocs(activeSubscriptionsQuery),
      getDocs(thisMonthQuery),
    ])

    return {
      total: allSnapshot.size,
      active: activeSnapshot.size,
      thisMonth: thisMonthSnapshot.size,
    }
  } catch (error) {
    console.error("Error getting newsletter stats:", error)
    return { total: 0, active: 0, thisMonth: 0 }
  }
}

// Update newsletter subscription status
export async function updateNewsletterStatus(subscriptionId: string, status: "active" | "unsubscribed") {
  try {
    const subscriptionRef = doc(db, "newsletter", subscriptionId)
    await updateDoc(subscriptionRef, {
      status,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating newsletter status:", error)
    throw error
  }
}
