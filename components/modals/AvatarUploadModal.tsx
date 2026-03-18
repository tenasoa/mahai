"use client"

import { useState, useRef } from 'react'
import { X, Upload, Trash2, Image as ImageIcon } from 'lucide-react'
import { uploadAvatarAction, deleteAvatarAction } from '@/actions/avatar'

interface AvatarUploadModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  currentAvatarUrl?: string | null
  onAvatarChange: (url: string) => void
}

export function AvatarUploadModal({ 
  isOpen, 
  onClose, 
  userId, 
  currentAvatarUrl,
  onAvatarChange 
}: AvatarUploadModalProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setError('Type de fichier non supporté')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Fichier trop volumineux (max 5MB)')
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

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setError(null)

    const result = await uploadAvatarAction(userId, selectedFile)

    if (result.success && result.url) {
      onAvatarChange(result.url)
      handleClose()
    } else {
      setError(result.error || 'Erreur lors de l\'upload')
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
      setError(result.error || 'Erreur lors de la suppression')
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
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container avatar-upload-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Modifier mon avatar</h2>
          <button onClick={handleClose} className="modal-close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          {/* Preview */}
          <div className="avatar-preview-section">
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
            onChange={handleFileSelect}
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

            <div className="avatar-buttons">
              <button 
                className="btn-upload" 
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
              >
                {uploading ? 'Upload...' : 'Enregistrer'}
              </button>

              {currentAvatarUrl && !selectedFile && (
                <button 
                  className="btn-delete" 
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
