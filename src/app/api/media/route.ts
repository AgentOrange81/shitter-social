import { NextRequest, NextResponse } from 'next/server';
import { getUploadPresignedUrl, generateMediaKey, getMediaUrl } from '@/lib/r2';

// Allowed content types for media uploads
const ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const { filename, contentType } = await request.json();

    // Validate required fields
    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'filename and contentType are required' },
        { status: 400 }
      );
    }

    // Validate content type (server-side)
    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images (JPEG, PNG, GIF, WebP) are allowed' },
        { status: 400 }
      );
    }

    // Validate filename (prevent path traversal)
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    if (sanitizedFilename.includes('..') || sanitizedFilename.includes('/')) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      );
    }

    const key = generateMediaKey(sanitizedFilename);
    const uploadUrl = await getUploadPresignedUrl(key, contentType);
    const publicUrl = getMediaUrl(key);

    return NextResponse.json({
      uploadUrl,
      publicUrl,
      key,
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}