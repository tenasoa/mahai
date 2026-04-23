'use client'

import { PrixMode, Visibilite } from './types'

interface Stats {
  words: number
  pages: number
  questions: number
  readTime: number
}

interface Props {
  prix: number
  prixMode: PrixMode
  visibilite: Visibilite
  stats: Stats
  onPrixChange: (prix: number) => void
  onPrixModeChange: (mode: PrixMode) => void
  onVisibiliteChange: (vis: Visibilite) => void
}

const VIS_OPTIONS: { value: Visibilite; icon: string; label: string; desc: string }[] = [
  { value: 'public', icon: '🌐', label: 'Public', desc: 'Accessible à tous' },
  { value: 'abonnes', icon: '🔒', label: 'Abonnés', desc: 'Abonnés actifs uniquement' },
  { value: 'premium', icon: '⭐', label: 'Premium', desc: 'Crédits requis' },
]

export default function PricingSidebar({ prix, prixMode, visibilite, stats, onPrixChange, onPrixModeChange, onVisibiliteChange }: Props) {
  const commission = Math.round(prix * 0.3)
  const revenu = prix - commission

  return (
    <>
      {/* ── Tarification ── */}
      <div className="ed-pricing-card">
        <div className="ed-pricing-header">Tarification</div>
        <div className="ed-pricing-body">
          <div className="ed-price-toggle">
            <button
              className={`ed-price-toggle-btn${prixMode === 'par_page' ? ' active' : ''}`}
              onClick={() => onPrixModeChange('par_page')}
            >
              Par page
            </button>
            <button
              className={`ed-price-toggle-btn${prixMode === 'forfait' ? ' active' : ''}`}
              onClick={() => onPrixModeChange('forfait')}
            >
              Forfait
            </button>
          </div>

          <div className="ed-price-input-wrap">
            <input
              className="ed-price-input"
              type="number"
              min={0}
              step={100}
              value={prix}
              onChange={e => onPrixChange(Number(e.target.value))}
            />
            <div style={{ textAlign: 'center', marginTop: '0.35rem', fontSize: '0.68rem', color: 'var(--text-4)', fontFamily: 'var(--mono)' }}>
              Ar {prixMode === 'par_page' ? '/ page' : '/ forfait'}
            </div>
          </div>

          <div className="ed-ventilation">
            <div className="ed-vent-row">
              <span className="ed-vent-label" title="Prix payé par l'étudiant">
                Prix affiché étudiant
              </span>
              <span className="ed-vent-val">{prix.toLocaleString()} Ar</span>
            </div>
            <div className="ed-vent-sep" />
            <div className="ed-vent-row">
              <span className="ed-vent-label" title="30% de frais de plateforme">
                Commission plateforme (30%) ⓘ
              </span>
              <span className="ed-vent-val">− {commission.toLocaleString()} Ar</span>
            </div>
            <div className="ed-vent-row">
              <span className="ed-vent-label" title="Vos revenus nets">
                Vos revenus (70%)
              </span>
              <span className="ed-vent-val ed-vent-val--gold">{revenu.toLocaleString()} Ar</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="ed-panel">
        <div className="ed-panel-header">Statistiques</div>
        <div className="ed-panel-body" style={{ padding: '0.75rem' }}>
          <div className="ed-stats-grid">
            <div className="ed-stat-box">
              <div className="ed-stat-val">{stats.words}</div>
              <div className="ed-stat-label">Mots</div>
            </div>
            <div className="ed-stat-box">
              <div className="ed-stat-val">{stats.pages}</div>
              <div className="ed-stat-label">Pages</div>
            </div>
            <div className="ed-stat-box">
              <div className="ed-stat-val">{stats.questions}</div>
              <div className="ed-stat-label">Questions</div>
            </div>
            <div className="ed-stat-box">
              <div className="ed-stat-val">{stats.readTime} min</div>
              <div className="ed-stat-label">Temps estim.</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Visibilité ── */}
      <div className="ed-panel">
        <div className="ed-panel-header">Visibilité</div>
        <div className="ed-panel-body">
          <div className="ed-visibility">
            {VIS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`ed-vis-opt${visibilite === opt.value ? ' active' : ''}`}
                onClick={() => onVisibiliteChange(opt.value)}
              >
                <span className="ed-vis-opt-icon">{opt.icon}</span>
                <span className="ed-vis-opt-body">
                  <div className="ed-vis-opt-label">{opt.label}</div>
                  <div className="ed-vis-opt-desc">{opt.desc}</div>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
