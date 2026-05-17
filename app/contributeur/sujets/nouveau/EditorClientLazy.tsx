'use client'

/**
 * Wrapper de chargement différé pour l'éditeur de sujets.
 *
 * `EditorClient` tire un bundle lourd (TipTap v3 + KaTeX + lowlight). En le
 * chargeant via `next/dynamic` avec `ssr: false` :
 *  - le bundle de l'éditeur est isolé dans son propre chunk JS (il ne pèse
 *    plus sur le bundle initial de la route) ;
 *  - aucun rendu serveur de l'éditeur (il est purement client) — pas de
 *    travail SSR inutile ni de risque d'hydratation ;
 *  - un écran de chargement léger s'affiche immédiatement, ce qui améliore
 *    le ressenti sur réseau lent.
 */
import dynamic from 'next/dynamic'

function EditorLoading() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '1rem',
        color: 'var(--text-3)',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          border: '3px solid var(--b2)',
          borderTopColor: 'var(--gold)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <p style={{ fontFamily: 'var(--body)', fontSize: '0.9rem' }}>
        Chargement de l’éditeur…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

const EditorClientLazy = dynamic(() => import('./EditorClient'), {
  ssr: false,
  loading: EditorLoading,
})

export default EditorClientLazy
