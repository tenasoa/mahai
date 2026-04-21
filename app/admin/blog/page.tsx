'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  XCircle,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Star,
} from 'lucide-react'
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb'
import { ToastContainer } from '@/components/ui/ToastContainer'
import { useToast } from '@/lib/hooks/useToast'
import { RichTextEditor } from '@/components/ui/RichTextEditor'

type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  author_id: string
  author_name: string
  cover_image: string
  read_time: number
  is_published: boolean
  is_featured: boolean
  views: number
  published_at: string
  createdAt: string
  updatedAt: string
}

export default function AdminBlogPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const toast = useToast()
  
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<string | null>(null)
  
  const [postForm, setPostForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'general',
    coverImage: '',
    readTime: 5,
    isPublished: false,
    isFeatured: false
  })

  const formatPostForForm = (post: BlogPost) => ({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || '',
    content: post.content,
    category: post.category,
    coverImage: post.cover_image || '',
    readTime: post.read_time,
    isPublished: post.is_published,
    isFeatured: post.is_featured
  })

  const categories = [
    'general',
    'conseils-bac',
    'conseils-bepc',
    'conseils-cepe',
    'actualites',
    'tutoriel',
    'technologie',
    'communaute',
    'carriere'
  ]

  const showToast = (message: string, isError = false) => {
    if (isError) {
      toast.error('Erreur', message)
    } else {
      toast.success('Succès', message)
    }
  }

  const loadPosts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/blog-posts')
      if (res.ok) {
        const data = await res.json()
        setPosts(data.posts || [])
      }
    } catch (err) {
      showToast('Erreur lors du chargement des articles', true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  const handleSavePost = async () => {
    if (!postForm.title.trim() || !postForm.content.trim()) {
      showToast('Le titre et le contenu sont requis', true)
      return
    }
    
    setSaving(true)
    try {
      const url = '/api/admin/blog-posts'
      const method = editingPost ? 'PATCH' : 'POST'
      const body = editingPost 
        ? { ...postForm, id: editingPost.id, authorId: editingPost.author_id, authorName: editingPost.author_name }
        : { ...postForm, authorId: 'admin', authorName: 'Admin Mah.AI' }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        showToast(editingPost ? 'Article mis à jour' : 'Article créé')
        setModalOpen(false)
        setEditingPost(null)
        setPostForm({
          title: '',
          slug: '',
          excerpt: '',
          content: '',
          category: 'general',
          coverImage: '',
          readTime: 5,
          isPublished: false,
          isFeatured: false
        })
        loadPosts()
      } else {
        const err = await res.json()
        showToast(err.error || 'Erreur lors de la sauvegarde', true)
      }
    } catch {
      showToast('Erreur lors de la sauvegarde', true)
    } finally {
      setSaving(false)
    }
  }

  const promptDeletePost = (id: string) => {
    setPostToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const handleDeletePost = async () => {
    if (!postToDelete) return

    try {
      const res = await fetch(`/api/admin/blog-posts/${postToDelete}`, { method: 'DELETE' })
      if (res.ok) {
        showToast('Article supprimé')
        loadPosts()
      } else {
        showToast('Erreur lors de la suppression', true)
      }
    } catch {
      showToast('Erreur lors de la suppression', true)
    } finally {
      setDeleteConfirmOpen(false)
      setPostToDelete(null)
    }
  }

  const openEditPost = (post: BlogPost) => {
    setEditingPost(post)
    setPostForm(formatPostForForm(post))
    setModalOpen(true)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="admin-page-content">
      <AdminBreadcrumb items={[{ label: 'Contenu' }, { label: 'Blog' }]} />

      {/* Header */}
      <div className="admin-header">
        <div>
          <div className="admin-header-badge" style={{ background: 'var(--gold-dim)', borderColor: 'var(--gold-line)', color: 'var(--gold)' }}>
            <FileText size={14} />
            <span>Gestion du Blog</span>
          </div>
          <h1 className="admin-title">Articles de Blog</h1>
          <p className="admin-subtitle">Créez et gérez les articles de blog et les commentaires</p>
        </div>
      </div>

      {/* Content */}
      <div className="admin-card">
        <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="admin-card-title">Tous les articles</h3>
          <button 
            className="admin-btn admin-btn-primary"
            onClick={() => {
              setEditingPost(null)
              setPostForm({
                title: '',
                slug: '',
                excerpt: '',
                content: '',
                category: 'general',
                coverImage: '',
                readTime: 5,
                isPublished: false,
                isFeatured: false
              })
              setModalOpen(true)
            }}
          >
            <Plus size={16} />
            Nouvel article
          </button>
        </div>
        
        {loading ? (
          <div className="admin-empty-state">
            <Loader2 className="animate-spin" size={32} />
            <p>Chargement...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="admin-empty-state">
            <FileText size={48} style={{ opacity: 0.5 }} />
            <p>Aucun article</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Catégorie</th>
                  <th>Auteur</th>
                  <th>Statut</th>
                  <th>Vues</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{post.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{post.slug}</div>
                    </td>
                    <td>
                      <span className="status-badge status-gray">{post.category}</span>
                    </td>
                    <td>{post.author_name}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {post.is_published ? (
                          <span style={{ color: 'var(--sage)' }}>
                            <Eye size={14} />
                          </span>
                        ) : (
                          <span style={{ color: 'var(--ruby)' }}>
                            <EyeOff size={14} />
                          </span>
                        )}
                        {post.is_featured && (
                          <span style={{ color: 'var(--gold)' }}>
                            <Star size={14} fill="currentColor" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--mono)' }}>{post.views}</td>
                    <td>{formatDate(post.createdAt)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button 
                          className="admin-btn admin-btn-sm admin-btn-outline"
                          onClick={() => openEditPost(post)}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          className="admin-btn admin-btn-sm admin-btn-danger"
                          onClick={() => promptDeletePost(post.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* POST MODAL */}
      {modalOpen && (
        <div className="admin-overlay open" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" style={{ maxWidth: '1100px', width: '95%', height: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header border-b border-border-1 p-4 flex-shrink-0 bg-card">
              <h3 className="modal-title">{editingPost ? 'Modifier l\'article' : 'Nouvel article'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="modal-body flex-grow overflow-y-auto p-6 bg-void/50">
              <div className="admin-form-stack">
                <div className="admin-form-group">
                  <label className="admin-label">Titre</label>
                  <input
                    type="text"
                    value={postForm.title}
                    onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                    placeholder="Titre de l'article"
                    className="admin-input"
                  />
                </div>
                <div className="admin-form-grid-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Slug (URL)</label>
                    <input
                      type="text"
                      value={postForm.slug}
                      onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })}
                      placeholder="url-friendly-slug"
                      className="admin-input"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Catégorie</label>
                    <select
                      value={postForm.category}
                      onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                      className="admin-select"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Extrait (résumé)</label>
                  <textarea
                    value={postForm.excerpt}
                    onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })}
                    placeholder="Bref résumé de l'article..."
                    className="admin-input"
                    rows={3}
                  />
                </div>

                <div className="admin-form-group">
                  <div className="flex justify-between items-end mb-2">
                    <label className="admin-label m-0">Contenu</label>
                    <span className="text-xs text-text-4 font-mono">Rich HTML Enabled</span>
                  </div>
                  <RichTextEditor
                    value={postForm.content}
                    onChange={(val) => setPostForm({ ...postForm, content: val })}
                    placeholder="Commencez à rédiger votre histoire..."
                  />
                </div>

                <div className="admin-form-grid-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Image de couverture (URL)</label>
                    <input
                      type="text"
                      value={postForm.coverImage}
                      onChange={(e) => setPostForm({ ...postForm, coverImage: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="admin-input"
                    />
                    {postForm.coverImage && (
                      <div className="mt-2 rounded-lg overflow-hidden border border-border-1 aspect-video relative group">
                        <img src={postForm.coverImage} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs text-white bg-black/60 px-2 py-1 rounded">Aperçu de la couverture</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="admin-form-group">
                    <div className="admin-form-group mb-4">
                      <label className="admin-label">Temps de lecture (min)</label>
                      <input
                        type="number"
                        value={postForm.readTime}
                        onChange={(e) => setPostForm({ ...postForm, readTime: parseInt(e.target.value) || 5 })}
                        min={1}
                        className="admin-input"
                      />
                    </div>
                    <div className="p-4 rounded-xl bg-surface border border-border-1">
                      <label className="admin-label mb-3">Visibilité & Mise en avant</label>
                      <div className="flex flex-col gap-3">
                        <label className="admin-checkbox-label">
                          <input
                            type="checkbox"
                            checked={postForm.isPublished}
                            onChange={(e) => setPostForm({ ...postForm, isPublished: e.target.checked })}
                          />
                          <span className="text-sm">Publier immédiatement</span>
                        </label>
                        <label className="admin-checkbox-label">
                          <input
                            type="checkbox"
                            checked={postForm.isFeatured}
                            onChange={(e) => setPostForm({ ...postForm, isFeatured: e.target.checked })}
                          />
                          <span className="text-sm">Mettre à la une (Hero Section)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-t border-border-1 p-4 flex-shrink-0 bg-card">
              <div className="flex justify-between items-center" style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
                <div className="text-xs text-text-4">
                  {editingPost ? 'ID: ' + editingPost.id.substring(0,8) : 'Nouvel article'}
                </div>
                <div className="modal-actions">
                  <button className="admin-btn admin-btn-outline" onClick={() => setModalOpen(false)}>
                    Annuler
                  </button>
                  <button
                    className="admin-btn admin-btn-primary"
                    onClick={handleSavePost}
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmOpen && (
        <div className="admin-overlay open" onClick={() => setDeleteConfirmOpen(false)}>
          <div className="admin-modal" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: 'var(--ruby)' }}>Confirmer la suppression</h3>
              <button className="modal-close" onClick={() => setDeleteConfirmOpen(false)}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-2)' }}>
                Êtes-vous sûr de vouloir supprimer définitivement cet article ? Cette action est irréversible.
              </p>
            </div>
            <div className="modal-footer">
              <div className="modal-actions">
                <button className="admin-btn admin-btn-outline" onClick={() => setDeleteConfirmOpen(false)}>
                  Annuler
                </button>
                <button
                  className="admin-btn admin-btn-danger"
                  onClick={handleDeletePost}
                >
                  <Trash2 size={16} />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  )
}
