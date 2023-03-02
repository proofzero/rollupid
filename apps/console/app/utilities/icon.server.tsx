/**
 * @file app/shared/utilities/icon.server.tsx
 */

// Types
// -----------------------------------------------------------------------------

import createImageClient from '@kubelt/platform-clients/image'

export type ImageMetadata = {
  // The environment from which image was uploaded.
  env: string
}

// NB: These image variants are manually configured in the image hosting service.
export enum ImageVariant {
  // 256x256 px
  Icon = 'icon',
  // 400x400 px
  Profile = 'pfp',
  // 1500x500 px
  Cover = 'cover',
}

// getUploadURL
// -----------------------------------------------------------------------------
// Fetch a signed URL that can be used (for a limited time) to upload an image.

async function getUploadURL(metadata: ImageMetadata) {
  try {
    const imageClient = createImageClient(Images, IMAGES_URL)
    const uploadURL = await imageClient.upload.mutate(metadata.env)

    // Expected response format:
    // {
    //   "id": "967521be-9500-4c3b-52e7-6b877f8a5500",
    //   "uploadURL": "https://upload.imagedelivery.net/GpF42-mqjMIqmRcX5aE9gQ/967521be-9500-4c3b-52e7-6b877f8a5500",
    // }
    return uploadURL
  } catch (err) {
    return {
      status: 500,
      error: 'Something went wrong',
    }
  }
}

// uploadImage
// -----------------------------------------------------------------------------

// TODO: change to CFImageClient from packages
async function uploadImage(
  blob: Blob,
  fileName: string,
  variant: ImageVariant,
  metadata: ImageMetadata
) {
  // Request signed image upload URL from icons service.
  const { id, uploadURL } = await getUploadURL(metadata)

  // Upload image to signed URL.
  const imageForm = new FormData()
  imageForm.append('file', blob, fileName)
  const imageUpload = await fetch(uploadURL, {
    method: 'POST',
    body: imageForm,
  })

  if (!imageUpload.ok) {
    return undefined
  }

  // Construct the image URL for the PFP.
  const imageURL = `https://imagedelivery.net/${ICONS_ACCOUNT}/${id}/${variant}`

  return { id, imageURL }
}

// uploadIcon
// -----------------------------------------------------------------------------

/**
 * Upload an image to our image hosting service.
 *
 * @param iconBlob a Blob containing binary image data
 * @param appId the Client ID that owns the image
 * @param metadata a map of user-supplied image metadata
 * @return the URL of the uploaded image as a string
 */
export async function uploadIcon(
  blob: Blob,
  ownerId: string,
  metadata: ImageMetadata
) {
  // Name the uploaded image.
  const fileName = `icon-${ownerId}`
  return uploadImage(blob, fileName, ImageVariant.Icon, metadata)
}

// uploadProfile
// -----------------------------------------------------------------------------

/**
 * Upload a PFP image to the image hosting service.
 */
export async function uploadProfile(
  blob: Blob,
  ownerId: string,
  metadata: ImageMetadata
) {
  // Name the uploaded image.
  const fileName = `profile-${ownerId}`
  return uploadImage(blob, fileName, ImageVariant.Profile, metadata)
}

// uploadCover
// -----------------------------------------------------------------------------

/**
 * Upload a cover image to the image hosting service.
 */
export async function uploadCover(
  blob: Blob,
  ownerId: string,
  metadata: ImageMetadata
) {
  // Name the uploaded image.
  const fileName = `cover-${ownerId}`
  return uploadImage(blob, fileName, ImageVariant.Cover, metadata)
}
