/**
 * @file app/shared/utilities/icon.server.tsx
 */

import invariant from "tiny-invariant";

import {
  redirect,
} from "@remix-run/cloudflare";

// Invariants
// -----------------------------------------------------------------------------

/*
invariant(!ICONS_SCHEMA, "ICONS_SCHEMA must be defined");
invariant(!ICONS_HOST, "ICONS_HOST must be defined");
invariant(!ICONS_PORT, "ICONS_PORT must be defined");
*/

// Types
// -----------------------------------------------------------------------------

export type ImageMetadata = {
  // The environment from which image was uploaded.
  env: string;
};

// NB: These image variants are manually configured in the image hosting service.
export enum ImageVariant {
  // 256x256 px
  Icon = "icon",
  // 400x400 px
  Profile = "pfp",
  // 1500x500 px
  Cover = "cover",
}

// getUploadURL
// -----------------------------------------------------------------------------
// Fetch a signed URL that can be used (for a limited time) to upload an image.

type HeadersObject = {
  "Content-Type": string;
};

async function getUploadURL(
  metadata: ImageMetadata,
) {
  const url = `${ICONS_SCHEMA}://${ICONS_HOST}:${ICONS_PORT}/`;

  const headers: HeadersObject = {
    "Content-Type": "application/json",
  };

  const body = JSON.stringify(metadata);

  const request = {
    method: "POST",
    headers,
    body,
  };

  const response = await fetch(url, request);
  const json = await response.json();

  if (response.status !== 200) {
    return {
      status: response.status,
      error: json,
    };
  }

  // Expected response format:
  // {
  //   "id": "967521be-9500-4c3b-52e7-6b877f8a5500",
  //   "uploadURL": "https://upload.imagedelivery.net/GpF42-mqjMIqmRcX5aE9gQ/967521be-9500-4c3b-52e7-6b877f8a5500",
  // }
  return json;
}

// uploadImage
// -----------------------------------------------------------------------------

async function uploadImage(
  blob: Blob,
  fileName: string,
  variant: ImageVariant,
  metadata: ImageMetadata,
) {
  // Request signed image upload URL from icons service.
  const { id, uploadURL } = await getUploadURL(metadata);

  // Upload image to signed URL.
  const imageForm = new FormData();
  imageForm.append("file", blob, fileName);
  const imageUpload = await fetch(uploadURL, {
    method: "POST",
    body: imageForm,
  });

  if (!imageUpload.ok) {
    return undefined;
  }

  // Construct the image URL for the PFP.
  const imageURL = `https://imagedelivery.net/${ICONS_ACCOUNT}/${id}/${variant}`;

  return { id, imageURL };
}

// uploadIcon
// -----------------------------------------------------------------------------

/**
 * Upload an image to our image hosting service.
 *
 * @param iconBlob a Blob containing binary image data
 * @param appId the application ID that owns the image
 * @param metadata a map of user-supplied image metadata
 * @return the URL of the uploaded image as a string
 */
export async function uploadIcon(
  blob: Blob,
  ownerId: string,
  metadata: ImageMetadata
) {
  // Name the uploaded image.
  const fileName = `icon-${ownerId}`;
  return uploadImage(blob, fileName, ImageVariant.Icon, metadata);
};

// uploadProfile
// -----------------------------------------------------------------------------

/**
 * Upload a PFP image to the image hosting service.
 */
export async function uploadProfile(
  blob: Blob,
  ownerId: string,
  metadata: ImageMetadata,
) {
  // Name the uploaded image.
  const fileName = `profile-${ownerId}`;
  return uploadImage(blob, fileName, ImageVariant.Profile, metadata);
}

// uploadCover
// -----------------------------------------------------------------------------

/**
 * Upload a cover image to the image hosting service.
 */
export async function uploadCover(
  blob: Blob,
  ownerId: string,
  metadata: ImageMetadata,
) {
  // Name the uploaded image.
  const fileName = `cover-${ownerId}`;
  return uploadImage(blob, fileName, ImageVariant.Cover, metadata);
}
