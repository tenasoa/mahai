"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Upload, Trash2, Image as ImageIcon } from 'lucide-react'
import { uploadAvatarAction, deleteAvatarAction } from '@/actions/avatar'
import '@/components/modals/Modal.css'
import './AvatarUploadModal.css'

interface AvatarUploadModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  currentAvatarUrl?: string | null
  onAvatarChange: (url: string) => void
  onError: (message: string) => void
}

export function AvatarUploadModal({ 
  isOpen, 
  onClose, 
  userId, 
  currentAvatarUrl,
  onAvatarChange,
  onError
}: AvatarUploadModalProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const modalContainerRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose() }
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
    
    // Check MIME type
    if (!allowedTypes.includes(file.type)) {
      // Fallback: check file extension if MIME type is not reliable
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      if (!allowedExtensions.includes(fileExtension)) {
        return 'Type de fichier non supporté'
      }
    }

    if (file.size > 5 * 1024 * 1024) {
      return 'Fichier trop volumineux (max 5MB)'
    }

    return null
  }

  const handleFileSelect = (file: File) => {
    const error = validateFile(file)
    if (error) {
      setError(error)
      return
    }

    setError(null)
    setSelectedFile(file)

    // Créer un preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const error = validateFile(file)
      if (error) {
        onError(error)
      } else {
        handleFileSelect(file)
      }
    } else {
      onError('Veuillez déposer une image valide (JPG, PNG, WebP, GIF)')
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setError(null)

    const result = await uploadAvatarAction(userId, selectedFile)

    if (result.success && result.url) {
      onAvatarChange(result.url)
      handleClose()
    } else {
      onError(result.error || 'Erreur lors de l\'upload de l\'avatar')
      handleClose()
    }

    setUploading(false)
  }

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre avatar ?')) return

    setDeleting(true)
    setError(null)

    const result = await deleteAvatarAction(userId)

    if (result.success) {
      onAvatarChange('')
      handleClose()
    } else {
      onError(result.error || 'Erreur lors de la suppression de l\'avatar')
      handleClose()
    }

    setDeleting(false)
  }

  const handleClose = () => {
    setPreview(null)
    setSelectedFile(null)
    setError(null)
    onClose()
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div
      className={`modal-overlay ${isOpen ? 'open' : ''}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="avatar-modal-title"
    >
      <div ref={modalContainerRef} className="modal-container avatar-upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="avatar-modal-title" className="modal-title">Modifier mon <em>avatar</em></h2>
          <button onClick={handleClose} className="modal-close" aria-label="Fermer">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="modal-content">
          {/* Preview avec Drag & Drop */}
          <div
            className="avatar-preview-section"
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="avatar-preview">
              {preview || (currentAvatarUrl && currentAvatarUrl !== null) ? (
                <img
                  src={preview || (currentAvatarUrl as string)}
                  alt="Avatar"
                  className="avatar-preview-image"
                />
              ) : (
                <div className="avatar-placeholder">
                  <ImageIcon size={48} />
                </div>
              )}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="upload-error">
              {error}
            </div>
          )}

          {/* File input hidden */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleInputChange}
            className="hidden-input"
          />

          {/* Actions */}
          <div className="avatar-actions">
            <button 
              className="btn-select-file" 
              onClick={triggerFileInput}
              disabled={uploading || deleting}
            >
              <Upload size={16} />
              Choisir une image
            </button>

            {selectedFile && (
              <p className="file-info">
                {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}

            <div className="modal-footer">
              <button 
                className="btn-primary" 
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
              >
                {uploading ? 'Upload...' : 'Enregistrer'}
              </button>

              {currentAvatarUrl && !selectedFile && (
                <button 
                  className="btn-secondary btn-delete" 
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <Trash2 size={16} />
                  {deleting ? 'Suppression...' : 'Supprimer'}
                </button>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="avatar-instructions">
            <p>Formats acceptés : JPG, PNG, WebP, GIF</p>
            <p>Taille maximale : 5MB</p>
            <p>Conseil : Utilisez une image carrée pour un meilleur rendu</p>
          </div>
        </div>
      </div>
    </div>
  )
}
