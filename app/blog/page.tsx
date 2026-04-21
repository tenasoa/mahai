'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight, BookOpen, TrendingUp } from 'lucide-react'
import { LuxuryCursor } from '@/components/layout/LuxuryCursor'
import { LuxuryNavbar } from '@/components/layout/LuxuryNavbar'
import { LuxuryFooter } from '@/components/layout/LuxuryFooter'
import { LegalPageSkeleton } from '@/components/ui/PageSkeletons'

export default function BlogPage() {
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<any[]>([])
  const [featuredPost, setFeaturedPost] = useState<any>(null)

  useEffect(() => {
    document.title = "Mah.AI — Blog"
    
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/admin/blog-posts?published=true')
        if (res.ok) {
          const data = await res.json()
          const allPosts = data.posts || []
          
          // Set featured post (first one marked as featured)
          const featured = allPosts.find((p: any) => p.is_featured) || allPosts[0]
          setFeaturedPost(featured)
          
          // Set other posts (excluding featured)
          setPosts(allPosts.filter((p: any) => p.id !== featured?.id))
        }
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchPosts()
  }, [])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return <LegalPageSkeleton />
  }

  return (
    <div className="min-h-screen bg-void text-text">
      <LuxuryCursor />
      <LuxuryNavbar />

      {/* Hero */}
      <section className="relative py-24 px-6 border-b border-b1 bg-depth">
        <div className="max-w-7xl mx-auto">
          <div className="font-mono text-xs text-gold flex items-center gap-2 mb-4">
            <div className="w-5 h-px bg-gold"></div>
            Blog
          </div>
          <h1 className="font-display font-normal text-5xl md:text-6xl text-text leading-tight mb-6">
            Conseils, actualités et <em className="text-gold">ressources</em>
          </h1>
          <p className="text-text2 text-lg max-w-3xl leading-relaxed">
            Découvrez nos articles pour optimiser votre préparation aux examens, comprendre notre technologie, et rejoindre notre communauté.
          </p>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {featuredPost && (
            <div className="bg-gradient-to-br from-gold-dim to-transparent border border-gold-line rounded-2xl p-8 md:p-12">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-mono text-[0.6rem] text-gold uppercase tracking-[0.12em] bg-gold-dim px-2 py-1 rounded">
                  {featuredPost.category}
                </span>
                <span className="font-mono text-xs text-text3 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(featuredPost.createdAt)}
                </span>
                <span className="font-mono text-xs text-text3 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {featuredPost.read_time} min
                </span>
              </div>
              <h2 className="font-display text-3xl text-text mb-4 leading-tight">
                {featuredPost.title}
              </h2>
              <p className="text-text2 leading-relaxed mb-6">
                {featuredPost.excerpt || 'Lisez cet article pour en savoir plus...'}
              </p>
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="inline-flex items-center gap-2 font-body text-sm font-medium text-gold hover:opacity-70 transition-opacity"
              >
                Lire l'article complet
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-20 px-6 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="font-display font-normal text-3xl text-text tracking-[-0.02em]">
              Articles <em className="text-gold">récents</em>
            </h2>
            <div className="flex items-center gap-2 text-sm text-text3">
              <TrendingUp className="w-4 h-4" />
              <span>Plus populaires</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                <article className="bg-card border border-b1 rounded-lg overflow-hidden hover:border-gold-line transition-all h-full flex flex-col">
                  {post.coverImage ? (
                    <div className="aspect-video bg-surface overflow-hidden flex-shrink-0">
                      <img 
                        src={post.coverImage} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ) : (
                    <div className="bg-surface flex items-center justify-center p-8 text-6xl group-hover:scale-105 transition-transform flex-shrink-0">
                      📝
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-mono text-[0.6rem] text-gold uppercase tracking-[0.12em] bg-gold-dim px-2 py-1 rounded">
                        {post.category}
                      </span>
                      <span className="font-mono text-[0.6rem] text-text3 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                    <h3 className="font-display text-xl text-text mb-2 leading-tight group-hover:text-gold transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-text2 leading-relaxed mb-4 flex-grow">
                      {post.excerpt || 'Lisez cet article pour en savoir plus...'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-text3 mt-auto">
                      <Clock className="w-3 h-3" />
                      {post.read_time} min
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>


      <LuxuryFooter />
    </div>
  )
}
