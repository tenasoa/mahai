'use client'

import { Trash2, X, AlertTriangle } from 'lucide-react'
import { deleteSubject } from '@/actions/admin/subjects'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function DeleteSubjectButton({ subjectId, subjectTitle }: { subjectId: string; subjectTitle?: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    try {
      await deleteSubject(subjectId)
      router.push('/admin/sujets')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="admin-btn admin-btn-outline"
        style={{ color: 'var(--ruby)', borderColor: 'var(--ruby-line)' }}
        title="Supprimer définitivement ce sujet"
      >
        <Trash2 size={16} />
        Supprimer
      </button>

      <div className={`admin-overlay${open ? ' open' : ''}`} onClick={() => !loading && setOpen(false)}>
        <div className="admin-modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--r)',
                background: 'var(--ruby-dim)', border: '1px solid var(--ruby-line)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <AlertTriangle size={20} style={{ color: 'var(--ruby)' }} />
              </div>
              <h2 className="modal-title">Supprimer le sujet</h2>
            </div>
            <button className="modal-close" onClick={() => setOpen(false)} disabled={loading} aria-label="Fermer">
              <X size={16} />
            </button>
          </div>

          <div className="modal-body">
            <p style={{ color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>
              {subjectTitle ? (
                <>Vous êtes sur le point de supprimer définitivement <strong style={{ color: 'var(--text)' }}>« {subjectTitle} »</strong>.</>
              ) : (
                <>Vous êtes sur le point de supprimer définitivement ce sujet.</>
              )}
            </p>
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              background: 'var(--ruby-dim)', border: '1px solid var(--ruby-line)',
              borderRadius: 'var(--r)', fontSize: '0.85rem', color: 'var(--ruby)'
            }}>
              Cette action est irréversible. Tous les achats liés seront également supprimés.
            </div>
          </div>

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="admin-btn admin-btn-outline"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="admin-btn"
              style={{ background: 'var(--ruby)', color: '#fff', borderColor: 'var(--ruby)' }}
            >
              <Trash2 size={16} />
              {loading ? 'Suppression…' : 'Supprimer définitivement'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
