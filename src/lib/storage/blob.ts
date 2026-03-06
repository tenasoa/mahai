import { put, getDownloadUrl, del } from '@vercel/blob'

// ============================================
// MAH.AI — Vercel Blob Utils
// ============================================
// Storage pour PDFs, captures, avatars
// ============================================

// ── UPLOAD ───────────────────────────────────────────────────
export async function uploadFile(
  filename: string,
  file: Blob | File,
  folder: 'sujets' | 'corrections' | 'preuves' | 'avatars' = 'sujets'
) {
  const blob = await put(`${folder}/${filename}`, file, {
    access: 'public',
    addRandomSuffix: true, // Évite les collisions
  })
  
  return {
    url: blob.url,
    pathname: blob.pathname,
    contentType: blob.contentType,
  }
}

// ── UPLOAD PDF SUJET ─────────────────────────────────────────
export async function uploadSujetPDF(file: File, sujetId: string) {
  return uploadFile(`${sujetId}.pdf`, file, 'sujets')
}

// ── UPLOAD PREUVE PAIEMENT ───────────────────────────────────
export async function uploadPreuvePaiement(file: File, userId: string) {
  const timestamp = Date.now()
  return uploadFile(`${userId}-${timestamp}.png`, file, 'preuves')
}

// ── GET URL ──────────────────────────────────────────────────
export async function getFileUrl(pathname: string) {
  return getDownloadUrl(pathname)
}

// ── DELETE ───────────────────────────────────────────────────
export async function deleteFile(pathname: string) {
  await del(pathname)
}

// ── UTILITAIRES ──────────────────────────────────────────────
export function getFileSizeMB(size: number): string {
  return (size / (1024 * 1024)).toFixed(2) + ' MB'
}

export function isValidPDF(file: File): boolean {
  return file.type === 'application/pdf'
}

export function isValidImage(file: File): boolean {
  return ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)
}
