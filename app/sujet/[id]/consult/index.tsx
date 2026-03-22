import { notFound, redirect } from 'next/navigation'

interface ConsultPageProps {
  params: { id: string }
}

export default async function ConsultPage({ params }: ConsultPageProps) {
  // TODO: Implement subject consultation with SQL
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Consultation du sujet {params.id}</h1>
        <p className="text-gray-600">Cette page est en cours de développement.</p>
      </div>
    </div>
  )
}
