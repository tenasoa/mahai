import { query } from '@/lib/db'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { BookOpen, CreditCard, TrendingUp, Award, Clock, Target } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient()

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  let user = null
  try {
    // Get user with basic info
    const userResult = await query(
      'SELECT id, email, prenom, nom, role, credits, "emailVerified", "schoolLevel", "createdAt" FROM "User" WHERE id = $1',
      [session.user.id]
    )
    user = userResult.rows[0]

    if (!user) {
      redirect('/auth/login')
    }

    // Get recent purchases
    const purchasesResult = await query(`
      SELECT p.*, s.titre, s.matiere, s.annee 
      FROM "Purchase" p 
      LEFT JOIN "Subject" s ON p."subjectId" = s.id 
      WHERE p."userId" = $1 AND p.status = 'COMPLETED'
      ORDER BY p."createdAt" DESC 
      LIMIT 5
    `, [session.user.id])

    // Get recent exam attempts
    const examsResult = await query(`
      SELECT * FROM "ExamenBlanc" 
      WHERE "userId" = $1 
      ORDER BY "createdAt" DESC 
      LIMIT 3
    `, [session.user.id])

    // Get stats
    const statsResult = await query(`
      SELECT 
        COUNT(CASE WHEN p.status = 'COMPLETED' THEN 1 END) as total_purchases,
        COUNT(CASE WHEN e.status = 'COMPLETED' THEN 1 END) as completed_exams,
        AVG(CASE WHEN e.status = 'COMPLETED' THEN e.score END) as avg_score
      FROM "User" u
      LEFT JOIN "Purchase" p ON u.id = p."userId"
      LEFT JOIN "ExamenBlanc" e ON u.id = e."userId"
      WHERE u.id = $1
    `, [session.user.id])

    const stats = statsResult.rows[0]

    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Bienvenue, {user.prenom} !
          </h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Crédits</p>
                  <p className="text-2xl font-semibold text-gray-900">{user.credits}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sujets achetés</p>
                  <p className="text-2xl font-semibold text-gray-900">{Number(stats.total_purchases) || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Examens complétés</p>
                  <p className="text-2xl font-semibold text-gray-900">{Number(stats.completed_exams) || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Score moyen</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.avg_score ? Math.round(Number(stats.avg_score)) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Purchases */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Achats récents</h2>
              {purchasesResult.rows.length > 0 ? (
                <div className="space-y-3">
                  {purchasesResult.rows.map((purchase: any) => (
                    <div key={purchase.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-gray-900">{purchase.titre}</p>
                        <p className="text-sm text-gray-600">{purchase.matiere} • {purchase.annee}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-blue-600">{purchase.creditsAmount} crédits</p>
                        <p className="text-xs text-gray-500">
                          {new Date(purchase.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Aucun achat récent</p>
              )}
            </div>

            {/* Recent Exams */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Examens récents</h2>
              {examsResult.rows.length > 0 ? (
                <div className="space-y-3">
                  {examsResult.rows.map((exam: any) => (
                    <div key={exam.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-gray-900">{exam.titre}</p>
                        <p className="text-sm text-gray-600">{exam.typeExamen}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-purple-600">
                          {exam.score ? `${exam.score}/${exam.scoreMax}` : 'En cours'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(exam.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Aucun examen récent</p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Dashboard error:', error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur de chargement</h1>
          <p className="text-gray-600">Impossible de charger vos données. Veuillez réessayer.</p>
        </div>
      </div>
    )
  }
}
