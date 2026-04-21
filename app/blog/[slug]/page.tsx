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
      <section className="relative pt-28 pb-12 px-6 border-b border-border-1 bg-depth">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-body text-sm text-text-3 hover:text-gold transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
            Retour au blog
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="font-mono text-xs text-gold uppercase tracking-[0.12em] bg-gold-dim px-3 py-1 rounded">
              {post.category}
            </span>
            <span className="font-mono text-xs text-text-3 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(post.publishedAt || post.createdAt)}
            </span>
            <span className="font-mono text-xs text-text-3 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.readTime} min de lecture
            </span>
            <span className="font-mono text-xs text-text-3 flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {post.views} vues
            </span>
          </div>
          <h1 className="font-display font-normal text-4xl md:text-5xl text-text leading-tight mb-6">
            {post.title}
          </h1>
          <p className="text-text-2 text-lg leading-relaxed">
            {post.excerpt}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {post.cover_image && (
            <div className="mb-10 rounded-2xl overflow-hidden border border-border-1">
              <img src={post.cover_image} alt={post.title} className="w-full object-cover" />
            </div>
          )}
          <div 
            className="prose prose-invert max-w-none text-lg prose-headings:font-display prose-headings:font-normal prose-headings:tracking-tight prose-h1:text-4xl prose-h1:text-text prose-h2:text-3xl prose-h2:text-text prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b prose-h2:border-border-1 prose-h2:pb-4 prose-h3:text-2xl prose-h3:text-text prose-h3:mt-8 prose-h3:mb-4 prose-p:text-text-2 prose-p:leading-relaxed prose-p:mb-6 prose-a:text-gold hover:prose-a:text-gold-hi prose-a:no-underline hover:prose-a:underline prose-strong:text-text prose-strong:font-semibold prose-blockquote:border-l-4 prose-blockquote:border-gold prose-blockquote:bg-gold-dim prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:my-8 prose-blockquote:rounded-r-2xl prose-blockquote:not-italic prose-blockquote:text-text-2 prose-blockquote:shadow-sm prose-img:rounded-2xl prose-img:border prose-img:border-border-1 prose-img:shadow-sm prose-img:my-10 prose-ul:list-disc prose-ol:list-decimal marker:text-gold prose-li:text-text-2 prose-li:leading-relaxed prose-code:text-gold prose-code:bg-gold-dim prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono prose-code:text-sm prose-pre:bg-card prose-pre:border prose-pre:border-border-1 prose-pre:rounded-2xl"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </section>

      {/* Comments Section */}
      <section className="py-20 px-6 bg-depth border-t border-border-1">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gold/10 border border-gold-line rounded-xl flex items-center justify-center text-gold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h2 className="font-display font-normal text-3xl text-text">
              Commentaires ({comments.length})
            </h2>
          </div>

          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleSubmitComment} className="mb-12 bg-card border border-border-1 rounded-2xl p-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Écrivez votre commentaire..."
                className="w-full px-4 py-4 bg-lift border border-border-1 rounded-xl text-text placeholder:text-text-3 focus:border-gold focus:outline-none transition-colors resize-none"
                rows={4}
              />
              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-gold to-gold-hi text-void rounded-xl font-medium tracking-[0.04em] hover:-translate-y-0.5 hover:shadow-gold-md transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  {submittingComment ? 'Envoi...' : 'Envoyer le commentaire'}
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-12 p-8 bg-card border border-border-1 rounded-2xl text-center">
              <p className="text-text-2 mb-6 text-lg">
                Connectez-vous pour laisser un commentaire
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-gold to-gold-hi text-void rounded-xl font-medium tracking-[0.04em] hover:-translate-y-0.5 hover:shadow-gold-md transition-all"
              >
                Se connecter
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <div className="text-center text-text-3 py-12 bg-card border border-border-1 rounded-2xl border-dashed">
                <p>Soyez le premier à commenter !</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-card border border-border-1 rounded-2xl p-6 hover:border-gold-line transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-lift border border-border-1 flex items-center justify-center font-display text-text">
                        {comment.userName?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="font-display text-text">{comment.userName}</div>
                        <div className="font-mono text-xs text-text-3">{formatDate(comment.createdAt)}</div>
                      </div>
                    </div>
                    {user && user.id === comment.userId && (
                      <button
                        onClick={() => {
                          // Implement delete comment functionality
                        }}
                        className="text-text-3 hover:text-ruby p-2 hover:bg-ruby-dim rounded-lg transition-colors"
                        title="Supprimer le commentaire"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-text-2 leading-relaxed">{comment.content}</p>
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
