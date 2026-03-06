// lib/storage/r2.ts - Cloudflare R2 Storage

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Client S3 compatible pour Cloudflare R2
 */
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY!,
  },
});

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET || 'mahai-assets';

/**
 * Uploader un fichier vers R2
 */
export async function uploadFileToR2(
  file: Buffer,
  key: string,
  contentType: string = 'application/pdf'
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await r2Client.send(command);

  // Retourner l'URL publique (si bucket public) ou l'URL signée
  return `https://${BUCKET_NAME}.r2.cloudflarestorage.com/${key}`;
}

/**
 * Générer une URL signée pour télécharger un fichier (valide 1h)
 */
export async function getSignedUrlForDownload(
  key: string,
  expiresIn: number = 3600 // 1 heure par défaut
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const signedUrl = await getSignedUrl(r2Client, command, { expiresIn });
  return signedUrl;
}

/**
 * Supprimer un fichier de R2
 */
export async function deleteFileFromR2(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await r2Client.send(command);
}

/**
 * Générer un nom de fichier unique avec watermark
 */
export function generatePdfKey(
  sujetId: string,
  userId: string,
  username: string
): string {
  const timestamp = Date.now();
  const sanitizedName = username.replace(/[^a-zA-Z0-9]/g, '_');
  return `sujets/${sujetId}/${sanitizedName}_${userId.slice(0, 8)}_${timestamp}.pdf`;
}

/**
 * Uploader un PDF avec watermark personnalisé
 */
export async function uploadPdfWithWatermark(
  pdfBuffer: Buffer,
  sujetId: string,
  userId: string,
  username: string
): Promise<string> {
  // TODO: Implémenter l'ajout de watermark avec pdf-lib
  // Pour le MVP, on upload le PDF tel quel
  
  const key = generatePdfKey(sujetId, userId, username);
  await uploadFileToR2(pdfBuffer, key, 'application/pdf');
  
  return key;
}

/**
 * Uploader une image pour un sujet
 */
export async function uploadImageToR2(
  imageBuffer: Buffer,
  sujetId: string,
  imageName: string,
  contentType: string = 'image/jpeg'
): Promise<string> {
  const timestamp = Date.now();
  const key = `images/${sujetId}/${timestamp}_${imageName}`;
  
  await uploadFileToR2(imageBuffer, key, contentType);
  
  return `https://${BUCKET_NAME}.r2.cloudflarestorage.com/${key}`;
}
