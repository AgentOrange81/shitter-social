import { NextRequest, NextResponse } from 'next/server';
import { getUploadPresignedUrl, generateMediaKey, getMediaUrl } from '@/lib/r2';

export async function POST(request: NextRequest) {
  try {
    const { filename, contentType } = await request.json();

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'filename and contentType are required' },
        { status: 400 }
      );
    }

    const key = generateMediaKey(filename);
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