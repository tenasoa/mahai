'use client'

import { Trash2 } from 'lucide-react'
import { deleteSubject } from '@/actions/admin/subjects'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function DeleteSubjectButton({ subjectId }: { subjectId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement ce sujet ? Cette action est irréversible et supprimera aussi les achats liés.')) return
    setLoading(true)
    try {
      await deleteSubject(subjectId)
      router.push('/admin/sujets')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="admin-btn admin-btn-outline"
      style={{ color: 'var(--ruby)', borderColor: 'var(--ruby-line)' }}
      title="Supprimer définitivement ce sujet"
    >
      <Trash2 size={16} />
      {loading ? 'Suppression…' : 'Supprimer'}
    </button>
  )
}
