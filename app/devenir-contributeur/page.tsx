import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getCurrentUserAndApplication } from './actions'
import CandidatureForm from './CandidatureForm'

function getStatusLabel(status?: string) {
  if (status === 'APPROVED') return 'Approuvée'
  if (status === 'REJECTED') return 'Refusée'
  return 'En attente'
}

export default async function BecomeContributorPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    redirect('/auth/login')
  }

  const sessionData = await getCurrentUserAndApplication()
  const user = sessionData?.user
  const application = sessionData?.application

  if (!user) {
    redirect('/dashboard')
  }

  const alreadyContributor = ['CONTRIBUTEUR', 'PROFESSEUR', 'ADMIN', 'VALIDATEUR', 'VERIFICATEUR'].includes(
    user.role,
  )

  return (
    <main className="min-h-screen bg-void px-4 pb-16 pt-28 md:px-8">
      <div className="mx-auto max-w-[1020px] space-y-6">
        <section className="rounded-2xl border border-gold-line bg-gradient-to-br from-gold-dim to-transparent p-6 md:p-8">
          <p className="mb-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-gold">
            Programme contributeur Mah.AI
          </p>
          <h1 className="mb-3 font-display text-4xl leading-tight text-text">
            Candidatez pour devenir contributeur
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-text-2">
            Partagez vos sujets officiels BAC/BEPC/CEPE, accompagnez les élèves et participez à l'amélioration du niveau scolaire à Madagascar.
            Après validation par l'équipe admin, votre accès contributeur est activé automatiquement.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border-1 bg-card p-4">
            <div className="mb-2 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-text-3">Étape 1</div>
            <p className="text-sm text-text-2">Remplissez un dossier détaillé (matières, expérience, motivation).</p>
          </div>
          <div className="rounded-2xl border border-border-1 bg-card p-4">
            <div className="mb-2 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-text-3">Étape 2</div>
            <p className="text-sm text-text-2">L'équipe admin étudie votre dossier et peut demander des précisions.</p>
          </div>
          <div className="rounded-2xl border border-border-1 bg-card p-4">
            <div className="mb-2 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-text-3">Étape 3</div>
            <p className="text-sm text-text-2">En cas d'approbation, votre rôle passe en contributeur et votre espace est activé.</p>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="rounded-2xl border border-gold-line bg-gradient-to-br from-gold-dim to-transparent p-6 md:p-8">
          <h2 className="mb-4 font-display text-2xl text-text">Pourquoi devenir contributeur ?</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gold/20 rounded flex items-center justify-center text-gold">💰</div>
              <div>
                <h3 className="font-semibold text-text mb-1">Revenus attractifs</h3>
                <p className="text-sm text-text-2">Gagnez 80% à 90% du prix de chaque sujet vendu. Paiement mensuel via Mobile Money dès 5 000 Ar.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gold/20 rounded flex items-center justify-center text-gold">🎓</div>
              <div>
                <h3 className="font-semibold text-text mb-1">Impact éducatif</h3>
                <p className="text-sm text-text-2">Aidez des milliers d'élèves à réussir leurs examens en partageant votre expertise.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gold/20 rounded flex items-center justify-center text-gold">📈</div>
              <div>
                <h3 className="font-semibold text-text mb-1">Statut et reconnaissance</h3>
                <p className="text-sm text-text-2">Devenez un contributeur certifié, profitez de badges et d'une visibilité accrue.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gold/20 rounded flex items-center justify-center text-gold">🏆</div>
              <div>
                <h3 className="font-semibold text-text mb-1">Programme Elite</h3>
                <p className="text-sm text-text-2">Les meilleurs contributeurs accèdent au statut Elite avec 90% de revenus et support prioritaire.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Requirements Section */}
        <section className="rounded-2xl border border-border-1 bg-card p-6 md:p-8">
          <h2 className="mb-4 font-display text-2xl text-text">Critères d'éligibilité</h2>
          <ul className="space-y-3 text-sm text-text-2">
            <li className="flex items-start gap-2">
              <span className="text-gold mt-1">✓</span>
              <span>Être professeur, étudiant en fin d'études, ou avoir une expérience pertinente dans l'enseignement</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold mt-1">✓</span>
              <span>Maîtriser au moins 2 matières du programme scolaire malgache</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold mt-1">✓</span>
              <span>Disposer de sujets officiels authentiques (BAC, BEPC, CEPE)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold mt-1">✓</span>
              <span>Être capable de produire des corrections détaillées et conformes aux barèmes officiels</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gold mt-1">✓</span>
              <span>Avoir un compte Mobile Money (MVola, Orange Money ou Airtel Money) pour recevoir les paiements</span>
            </li>
          </ul>
        </section>

        {/* Commission Structure */}
        <section className="rounded-2xl border border-border-1 bg-card p-6 md:p-8">
          <h2 className="mb-4 font-display text-2xl text-text">Structure des commissions</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border-1 bg-lift p-4 text-center">
              <div className="font-mono text-xs text-text-3 uppercase tracking-[0.12em] mb-2">Standard</div>
              <div className="font-display text-3xl text-gold mb-1">80%</div>
              <div className="text-sm text-text-2">de revenus</div>
              <div className="text-xs text-text-3 mt-2">Nouveau contributeur</div>
            </div>
            <div className="rounded-xl border border-gold-line bg-gold-dim p-4 text-center">
              <div className="font-mono text-xs text-gold uppercase tracking-[0.12em] mb-2">Vérifié</div>
              <div className="font-display text-3xl text-gold mb-1">85%</div>
              <div className="text-sm text-text-2">de revenus</div>
              <div className="text-xs text-text-3 mt-2">+10 sujets vendus</div>
            </div>
            <div className="rounded-xl border border-gold-line bg-gradient-to-br from-gold-dim to-transparent p-4 text-center">
              <div className="font-mono text-xs text-gold uppercase tracking-[0.12em] mb-2">Elite</div>
              <div className="font-display text-3xl text-gold mb-1">90%</div>
              <div className="text-sm text-text-2">de revenus</div>
              <div className="text-xs text-text-3 mt-2">+50 sujets vendus</div>
            </div>
          </div>
          <p className="text-xs text-text-3 mt-4 text-center">
            * Les paiements sont effectués mensuellement via Mobile Money dès que le solde atteint 5 000 Ar
          </p>
        </section>

        {alreadyContributor ? (
          <section className="rounded-2xl border border-sage-line bg-sage-dim p-6">
            <h2 className="mb-2 text-lg font-semibold text-sage">Votre compte possède déjà les droits contributeur</h2>
            <p className="mb-4 text-sm text-text-2">
              Vous pouvez directement accéder à votre espace de production de sujets.
            </p>
            <Link
              href="/contributeur"
              className="inline-flex rounded-xl border border-sage-line bg-card px-4 py-2 text-sm font-medium text-sage"
            >
              Ouvrir l'espace contributeur
            </Link>
          </section>
        ) : (
          <>
            {application && (
              <section
                className={`rounded-2xl border p-4 ${
                  application.status === 'APPROVED'
                    ? 'border-sage-line bg-sage-dim'
                    : application.status === 'REJECTED'
                      ? 'border-ruby-line bg-ruby-dim'
                      : 'border-gold-line bg-gold-dim'
                }`}
              >
                <p className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-text-3">Dernier statut</p>
                <p className="mt-1 text-base font-semibold text-text">{getStatusLabel(application.status)}</p>
                {application.adminNotes && (
                  <p className="mt-2 text-sm text-text-2">Note admin: {application.adminNotes}</p>
                )}
              </section>
            )}

            <CandidatureForm
              defaultValues={{
                fullName:
                  application?.fullName ||
                  [user.prenom, user.nom].filter(Boolean).join(' ') ||
                  '',
                phone: application?.phone || user.phone || '',
                subjects: application?.subjects || '',
                educationLevel: application?.educationLevel || '',
                teachingExperience: application?.teachingExperience || '',
                motivation: application?.motivation || '',
                availability: application?.availability || '',
                portfolioUrl: application?.portfolioUrl || '',
                sampleLesson: application?.sampleLesson || '',
              }}
            />
          </>
        )}
      </div>
    </main>
  )
}
