import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { storage } from "@/lib/firebase"

export async function uploadImageToFirebase(file: File, folder = "images"): Promise<string> {
  try {
    // Create a unique filename
    const timestamp = Date.now()
    const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
    const storageRef = ref(storage, `${folder}/${fileName}`)

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file)

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref)

    return downloadURL
  } catch (error) {
    console.error("Error uploading image to Firebase Storage:", error)
    throw new Error("Failed to upload image")
  }
}

export async function deleteImageFromFirebase(imageUrl: string): Promise<void> {
  try {
    // Extract the path from the URL
    const url = new URL(imageUrl)
    const pathMatch = url.pathname.match(/\/o\/(.+)\?/)
    if (!pathMatch) throw new Error("Invalid Firebase Storage URL")

    const path = decodeURIComponent(pathMatch[1])
    const imageRef = ref(storage, path)

    await deleteObject(imageRef)
  } catch (error) {
    console.error("Error deleting image from Firebase Storage:", error)
    throw new Error("Failed to delete image")
  }
}
