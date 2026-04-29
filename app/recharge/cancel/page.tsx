export default function CancelPage() {
  return (
    <div className="container mx-auto py-20 text-center max-w-md">
      <div className="text-6xl mb-4">⚠️</div>
      <h1 className="text-2xl font-bold mb-2">Paiement annulé</h1>
      <p className="text-gray-600 mb-6">
        Le paiement a été annulé. Aucun montant n'a été débité.
      </p>

      <div className="space-y-3">
        <a 
          href="/recharge/stripe" 
          className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          Réessayer le paiement
        </a>
        <a 
          href="/recharge" 
          className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50"
        >
          Choisir une autre méthode
        </a>
      </div>
    </div>
  )
}
