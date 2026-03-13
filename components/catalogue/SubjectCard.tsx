import Link from 'next/link'

interface SubjectCardProps {
  subject: {
    id: string
    titre: string
    type: string
    matiere: string
    annee: string
    credits: number
    hasCorrectionIa: boolean
    hasCorrectionProf: boolean
  }
  viewMode: 'grid-3' | 'grid-2' | 'list'
}

export function SubjectCard({ subject, viewMode }: SubjectCardProps) {
  const gridClasses = {
    'grid-3': 'col-span-1',
    'grid-2': 'col-span-1 md:col-span-2',
    'list': 'col-span-1',
  }

  const listClasses = viewMode === 'list' 
    ? 'flex flex-row items-center gap-4 p-4' 
    : 'p-6'

  return (
    <div className={`bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all ${gridClasses[viewMode]} ${listClasses}`}>
      <Link href={`/catalogue/${subject.id}`}>
        <div className={viewMode === 'list' ? 'flex-1' : ''}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                {subject.type}
              </span>
              <span className="ml-2 inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                {subject.annee}
              </span>
            </div>
            <span className="text-lg font-bold text-blue-600">
              {subject.credits} crédits
            </span>
          </div>
          
          <h3 className={`font-semibold text-gray-900 ${viewMode === 'list' ? 'text-lg' : 'mt-3 text-lg'}`}>
            {subject.titre}
          </h3>
          
          <p className="text-sm text-gray-500 mt-1">{subject.matiere}</p>
          
          {viewMode !== 'list' && (
            <div className="mt-4 flex gap-2">
              {subject.hasCorrectionIa && (
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                  🤖 Correction IA
                </span>
              )}
              {subject.hasCorrectionProf && (
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                  👨‍🏫 Correction Prof
                </span>
              )}
            </div>
          )}
        </div>
        
        {viewMode === 'list' && (
          <div className="flex gap-2 mt-2">
            {subject.hasCorrectionIa && (
              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                🤖 Correction IA
              </span>
            )}
            {subject.hasCorrectionProf && (
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                👨‍🏫 Correction Prof
              </span>
            )}
          </div>
        )}
      </Link>
    </div>
  )
}
