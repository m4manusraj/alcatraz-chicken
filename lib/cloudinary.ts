export async function uploadToCloudinary(file: File) {
  console.log('Starting Cloudinary upload process...', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type
  })

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    const missingVars = []
    if (!cloudName) missingVars.push('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME')
    if (!uploadPreset) missingVars.push('NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET')
    
    throw new Error(`Missing required Cloudinary configuration: ${missingVars.join(', ')}`)
  }

  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', uploadPreset)

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`
    console.log('Uploading to:', uploadUrl)

    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      mode: 'cors'
    })

    // Get the raw response text first
    const responseText = await uploadResponse.text()
    console.log('Raw response:', responseText)

    // Try to parse the response as JSON
    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error('Failed to parse response as JSON:', e)
      throw new Error(`Invalid response format: ${responseText.substring(0, 100)}...`)
    }

    // Check for Cloudinary error
    if (!uploadResponse.ok || data.error) {
      console.error('Cloudinary error response:', data)
      throw new Error(
        data.error?.message || 
        data.error || 
        `Upload failed with status ${uploadResponse.status}: ${uploadResponse.statusText}`
      )
    }

    if (!data.secure_url) {
      console.error('Missing secure_url in response:', data)
      throw new Error('Upload succeeded but no URL was returned')
    }

    console.log('Upload successful:', {
      url: data.secure_url,
      publicId: data.public_id,
      format: data.format,
      size: data.bytes
    })

    return data.secure_url
  } catch (error) {
    console.error('Detailed upload error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
