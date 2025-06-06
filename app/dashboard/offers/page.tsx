'use client'

import { useEffect, useState } from 'react'
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Pencil, Trash2, Tag } from 'lucide-react'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Card } from '@/components/ui/card'

interface Offer {
  id: string
  title: string
  description: string
  code?: string
  discount: string
  image: string
  link: string
  expiryDate?: string
  isActive: boolean
  createdAt: any
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    discount: '',
    link: '',
    expiryDate: '',
    isActive: true
  })

  useEffect(() => {
    const q = query(
      collection(db, 'offers'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const offers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Offer[]
        setOffers(offers)
        setLoading(false)
        setError(null)
      },
      (error) => {
        console.error('Error fetching offers:', error)
        setError('Error loading offers. Please check your database permissions.')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const handleImageUpload = async (file: File) => {
    const storageRef = ref(storage, `offers/${Date.now()}-${file.name}`)
    await uploadBytes(storageRef, file)
    return getDownloadURL(storageRef)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      let imageUrl = selectedOffer?.image || ''

      if (imageFile) {
        try {
          imageUrl = await uploadToCloudinary(imageFile)
        } catch (uploadError) {
          console.error('Image upload error:', uploadError)
          setError('Failed to upload image. Please try again.')
          setSubmitting(false)
          return
        }
      }

      const offerData = {
        ...formData,
        image: imageUrl,
        createdAt: serverTimestamp()
      }

      if (selectedOffer) {
        await updateDoc(doc(db, 'offers', selectedOffer.id), offerData)
      } else {
        await addDoc(collection(db, 'offers'), offerData)
      }

      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving offer:', error)
      setError(error instanceof Error ? error.message : 'Failed to save offer. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        await deleteDoc(doc(db, 'offers', id))
      } catch (error) {
        console.error('Error deleting offer:', error)
        setError('Error deleting offer. Please try again.')
      }
    }
  }

  const handleEdit = (offer: Offer) => {
    setSelectedOffer(offer)
    setFormData({
      title: offer.title,
      description: offer.description,
      code: offer.code || '',
      discount: offer.discount,
      link: offer.link,
      expiryDate: offer.expiryDate || '',
      isActive: offer.isActive
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setSelectedOffer(null)
    setFormData({
      title: '',
      description: '',
      code: '',
      discount: '',
      link: '',
      expiryDate: '',
      isActive: true
    })
    setImageFile(null)
    setError(null)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Special Offers</h1>
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={resetForm}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Offer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedOffer ? 'Edit Offer' : 'Add Offer'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount</Label>
                  <Input
                    id="discount"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    placeholder="e.g., 20% OFF"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="code">Promo Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="link">Link</Label>
                  <Input
                    id="link"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-orange-500 hover:bg-orange-600"
                disabled={submitting}
              >
                {submitting ? (
                  <LoadingSpinner />
                ) : selectedOffer ? (
                  'Update Offer'
                ) : (
                  'Add Offer'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.map((offer) => (
              <TableRow key={offer.id}>
                <TableCell>
                  {offer.image ? (
                    <img
                      src={offer.image}
                      alt={offer.title}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <Tag className="h-5 w-5 text-orange-500" />
                    </div>
                  )}
                </TableCell>
                <TableCell>{offer.title}</TableCell>
                <TableCell>{offer.discount}</TableCell>
                <TableCell>{offer.code || 'N/A'}</TableCell>
                <TableCell>{offer.expiryDate || 'No expiry'}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      offer.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {offer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(offer)}
                    className="text-orange-500 hover:text-orange-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(offer.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
