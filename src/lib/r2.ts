import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'shitter';
// R2_PUBLIC_URL format: https://<bucket>.<account-id>.r2.cloudflarestorage.com
// Or use custom domain if configured
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL 
  || `https://${BUCKET_NAME}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Upload a file to R2 and return the public URL
 */
export async function uploadToR2(
  file: Buffer | Uint8Array,
  key: string,
  contentType: string
): Promise<UploadResult> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await r2Client.send(command);

  const url = `${R2_PUBLIC_URL}/${key}`;
  
  return { url, key };
}

/**
 * Generate a presigned URL for uploading directly to R2
 */
export async function getUploadPresignedUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const signedUrl = await getSignedUrl(r2Client, command, { expiresIn });
  return signedUrl;
}

/**
 * Generate a presigned URL for reading from R2
 */
export async function getDownloadPresignedUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const signedUrl = await getSignedUrl(r2Client, command, { expiresIn });
  return signedUrl;
}

/**
 * Generate a unique key for media storage
 */
export function generateMediaKey(filename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const ext = filename.split('.').pop() || 'bin';
  return `media/${timestamp}-${random}.${ext}`;
}

/**
 * Get public URL for a media key
 */
export function getMediaUrl(key: string): string {
  return `${R2_PUBLIC_URL}/${key}`;
}

export { r2Client, BUCKET_NAME };