/**
 * Client-side utilities for uploading media to Cloudflare R2
 */

export interface UploadResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

/**
 * Get a presigned URL for uploading directly to R2
 * Call this first, then upload the file to the returned URL
 */
export async function getMediaUploadUrl(
  filename: string,
  contentType: string
): Promise<UploadResponse> {
  const response = await fetch('/api/media', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, contentType }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get upload URL');
  }

  return response.json();
}

/**
 * Upload a file directly to R2 using a presigned URL
 */
export async function uploadMedia(
  file: File
): Promise<{ url: string; key: string }> {
  // Get presigned URL
  const { uploadUrl, publicUrl, key } = await getMediaUploadUrl(
    file.name,
    file.type
  );

  // Upload directly to R2
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Upload failed: ${uploadResponse.statusText}`);
  }

  return { url: publicUrl, key };
}

/**
 * Upload an image with preview - convenience wrapper
 */
export async function uploadImage(file: File): Promise<string> {
  // Validate it's an image
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  // Validate size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image must be less than 10MB');
  }

  const { url } = await uploadMedia(file);
  return url;
}