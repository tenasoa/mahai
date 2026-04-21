'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, Eye, MessageSquare, ArrowLeft, Send, Trash2 } from 'lucide-react'
import { LuxuryCursor } from '@/components/layout/LuxuryCursor'
import { LuxuryNavbar } from '@/components/layout/LuxuryNavbar'
import { LuxuryFooter } from '@/components/layout/LuxuryFooter'
import { LegalPageSkeleton } from '@/components/ui/PageSkeletons'
import { useAuth } from '@/lib/hooks/useAuth'

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    document.title = "Mah.AI — Blog"
    
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/blog/posts/${params.slug}`)
        if (res.ok) {
          const data = await res.json()
          setPost(data.post)
          // Fetch comments only after we have the post id
          if (data.post?.id) {
            fetchComments(data.post.id)
          }
        } else {
          router.push('/blog')
        }
      } catch (error) {
        console.error('Error fetching post:', error)
        router.push('/blog')
      } finally {
        setLoading(false)
      }
    }
    
    const fetchComments = async (postId: string) => {
      try {
        const res = await fetch(`/api/blog/comments/${postId}`)
        if (res.ok) {
          const data = await res.json()
          setComments(data.comments || [])
        }
      } catch (error) {
        console.error('Error fetching comments:', error)
      }
    }
    
    fetchPost()
  }, [params.slug, router])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      alert('Vous devez être connecté pour commenter')
      return
    }
    if (!newComment.trim()) return

    setSubmittingComment(true)
    try {
      const res = await fetch(`/api/blog/comments/${post.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment })
      })

      if (res.ok) {
        const data = await res.json()
        setComments([...comments, data.comment])
        setNewComment('')
      } else {
        const err = await res.json()
        alert(err.error || 'Erreur lors de la création du commentaire')
      }
    } catch (error) {
      console.error('Error creating comment:', error)
      alert('Erreur lors de la création du commentaire')
    } finally {
      setSubmittingComment(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return <LegalPageSkeleton />
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-void text-text flex items-center justify-center">
        <p>Article non trouvé</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-void text-text">
      <LuxuryCursor />
      <LuxuryNavbar />

      {/* Header */}
      <section className="relative py-12 px-6 border-b border-b1 bg-depth">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-body text-sm text-text3 hover:text-gold transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au blog
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-xs text-gold uppercase tracking-[0.12em] bg-gold-dim px-3 py-1 rounded">
              {post.category}
            </span>
            <span className="font-mono text-xs text-text3 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(post.publishedAt || post.createdAt)}
            </span>
            <span className="font-mono text-xs text-text3 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.readTime} min de lecture
            </span>
            <span className="font-mono text-xs text-text3 flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {post.views} vues
            </span>
          </div>
          <h1 className="font-display font-normal text-4xl md:text-5xl text-text leading-tight mb-6">
            {post.title}
          </h1>
          <p className="text-text2 text-lg leading-relaxed">
            {post.excerpt}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {post.cover_image && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img src={post.cover_image} alt={post.title} className="w-full" />
            </div>
          )}
          <div className="prose prose-invert max-w-none">
            <div className="text-text2 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          </div>
        </div>
      </section>

      {/* Comments Section */}
      <section className="py-12 px-6 bg-surface">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <MessageSquare className="w-5 h-5 text-gold" />
            <h2 className="font-display font-normal text-2xl text-text">
              Commentaires ({comments.length})
            </h2>
          </div>

          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleSubmitComment} className="mb-8">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Écrivez votre commentaire..."
                className="w-full px-4 py-3 bg-card border border-b1 rounded text-text placeholder:text-text3 focus:border-gold focus:outline-none transition-colors resize-none"
                rows={4}
              />
              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold to-gold-hi text-void rounded font-medium tracking-[0.04em] hover:-translate-y-0.5 hover:shadow-gold-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingComment ? 'Envoi...' : 'Envoyer'}
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-6 bg-card border border-b1 rounded-lg text-center">
              <p className="text-text2 mb-4">
                Connectez-vous pour laisser un commentaire
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold to-gold-hi text-void rounded font-medium tracking-[0.04em] hover:-translate-y-0.5 hover:shadow-gold-md transition-all"
              >
                Se connecter
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <div className="text-center text-text3 py-8">
                <p>Aucun commentaire pour le moment</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-card border border-b1 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-medium text-text">{comment.userName}</div>
                      <div className="font-mono text-xs text-text3">{formatDate(comment.createdAt)}</div>
                    </div>
                    {user && user.id === comment.userId && (
                      <button
                        onClick={() => {
                          // Implement delete comment functionality
                        }}
                        className="text-text3 hover:text-ruby transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-text2 leading-relaxed">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <LuxuryFooter />
    </div>
  )
}
