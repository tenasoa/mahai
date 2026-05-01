import Link from 'next/link'

export default function SuccessPage() {
  return (
    <div className="container mx-auto py-20 text-center max-w-md">
      <div className="text-6xl mb-4">✓</div>
      <h1 className="text-2xl font-bold mb-2">Recharge enregistrée</h1>
      <p className="text-gray-600 mb-6">
        Votre demande est en cours de vérification. Les crédits seront ajoutés après validation.
      </p>

      <div className="space-y-3">
        <Link
          href="/profil" 
          className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          Voir mon profil
        </Link>
        <Link
          href="/recharge" 
          className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50"
        >
          Retour à la recharge
        </Link>
      </div>
    </div>
  )
}
