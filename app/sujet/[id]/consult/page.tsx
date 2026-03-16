import { db } from '@/lib/db-client'
import { notFound, redirect } from 'next/navigation'

interface ConsultPageProps {
  params: Promise<{ id: string }>
}

export default async function ConsultPage({ params }: ConsultPageProps) {
  const { id } = await params
  
  // In production, get userId from session
  const userId = 'demo-user-id'

  try {
    // Verify user has purchased this subject
    const purchase = await db.purchase.findFirst({
      where: {
        userId,
        subjectId: id,
        status: 'COMPLETED',
      },
      include: {
        subject: true,
      },
    })

    if (!purchase) {
      redirect(`/sujet/${id}`)
    }

    const subject = purchase.subject
    
    if (!subject) {
      notFound()
    }

    return (
      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">{subject.titre}</h1>
              <p className="text-sm text-gray-400">{subject.matiere} - {subject.annee}</p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href={`/api/subjects/${id}/download`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Télécharger le PDF
              </a>
              <a
                href={`/sujet/${id}`}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Retour
              </a>
            </div>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ minHeight: '80vh' }}>
            {/* PDF Placeholder - In production, use react-pdf or similar */}
            <div className="flex items-center justify-center h-full py-20">
              <div className="text-center text-gray-500">
                <svg className="w-24 h-24 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                <p className="text-lg font-medium">Visualiseur PDF</p>
                <p className="text-sm">
                  Le document de {subject.pages} pages est prêt à être consulté
                </p>
                <p className="text-xs mt-4 text-gray-400">
                  En production: intégration avec react-pdf ou viewer PDF
                </p>
              </div>
            </div>
          </div>

          {/* Corrections Section */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            {subject.hasCorrectionIa && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🤖</span>
                  <h2 className="text-xl font-bold text-gray-900">Correction IA</h2>
                </div>
                <p className="text-gray-600 mb-4">
                  Correction détaillée générée par intelligence artificielle
                </p>
                <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                  Voir la correction IA
                </button>
              </div>
            )}

            {subject.hasCorrectionProf && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">👨‍🏫</span>
                  <h2 className="text-xl font-bold text-gray-900">Correction Prof</h2>
                </div>
                <p className="text-gray-600 mb-4">
                  Correction détaillée par un professeur expert
                </p>
                <button className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors">
                  Voir la correction Prof
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error in consultation page:', error)
    notFound()
  }
}
