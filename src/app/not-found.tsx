import Link from "next/link"
import { ArrowLeft, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg relative px-6 overflow-hidden">
      {/* Mesh Background */}
      <div className="mesh-bg absolute inset-0 opacity-40">
        <span />
        <span />
        <span />
      </div>

      <div className="relative z-10 text-center max-w-lg">
        <h1 className="text-[120px] font-black leading-none mb-4 text-gradient opacity-80">
          404
        </h1>
        <h2 className="text-2xl font-bold mb-4 text-text">
          Oups ! On dirait que ce sujet n'existe pas encore.
        </h2>
        <p className="text-muted mb-10 leading-relaxed font-mono text-sm uppercase tracking-tighter">
          La page que tu cherches a été déplacée ou supprimée. 
          C'est peut-être un bug de l'IA ?
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/" 
            className="flex items-center justify-center gap-2 px-8 py-4 bg-teal hover:bg-teal2 text-bg font-extrabold rounded-2xl transition-all shadow-lg shadow-teal/10"
          >
            <Home className="w-4 h-4" />
            Retour à l'accueil
          </Link>
          <Link 
            href="/catalogue" 
            className="flex items-center justify-center gap-2 px-8 py-4 bg-bg2 border border-border hover:border-teal/30 text-text font-bold rounded-2xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Voir le catalogue
          </Link>
        </div>
      </div>
    </div>
  )
}
