'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Smartphone,
  Package,
  Settings,
  Plus,
  Edit2,
  Trash2,
  XCircle,
  Save,
  Loader2,
  Star,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  TrendingUp,
  Clock,
  Calculator,
  AlertCircle,
  RotateCcw,
  History,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb'
import { ToastContainer } from '@/components/ui/ToastContainer'
import { AIProviderPanel } from '@/components/admin/AIProviderPanel'
import { useToast } from '@/lib/hooks/useToast'
import { CurrencyConverter } from '@/lib/currency-converter'

// Types
type MerchantPhone = {
  id: string
  operator: 'mvola' | 'orange' | 'airtel'
  phone: string
  label: string | null
  isActive: boolean
  isDefault: boolean
}

type CreditPack = {
  id: string
  name: string
  credits: number
  price: number
  bonus: number
  isPopular: boolean
  isActive: boolean
  sortOrder: number
}

type SystemSetting = {
  id: string
  key: string
  value: string
  type: 'string' | 'number' | 'boolean' | 'json'
  label: string | null
  description: string | null
  category: string
  isEditable: boolean
}

type TabType = 'phones' | 'packs' | 'conversion' | 'settings' | 'contact' | 'ai'

type ContactInfo = {
  generalEmail: string
  legalEmail: string
  phone: string
  address: string
}

type CurrencyConfig = {
  id: string
  arPerCredit: number
  platformFeePercent: number
  updatedAt: string
  note?: string
}

type CurrencyHistory = {
  id: string
  arPerCredit: number
  platformFeePercent: number
  updatedAt: string
  updatedBy?: string
  note?: string
}

export default function AdminConfigurationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get('tab') as TabType) || 'phones'
  const [activeTab, setActiveTab] = useState<TabType>(
    ['phones', 'packs', 'conversion', 'settings', 'contact', 'ai'].includes(initialTab) ? initialTab : 'phones'
  )

  // Sync tab with URL
  const changeTab = (tab: TabType) => {
    setActiveTab(tab)
    const params = new URLSearchParams(window.location.search)
    params.set('tab', tab)
    router.replace(`/admin/configuration?${params.toString()}`, { scroll: false })
  }

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  // Data states
  const [phones, setPhones] = useState<MerchantPhone[]>([])
  const [packs, setPacks] = useState<CreditPack[]>([])
  const [settings, setSettings] = useState<SystemSetting[]>([])
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    generalEmail: 'contact@mah.ai',
    legalEmail: 'legal@mah.ai',
    phone: '+261 34 XX XXX XX',
    address: 'Antananarivo 101, Madagascar'
  })
  const [currencyConfig, setCurrencyConfig] = useState<CurrencyConfig | null>(null)
  const [currencyHistory, setCurrencyHistory] = useState<CurrencyHistory[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [previewPrice, setPreviewPrice] = useState<number>(5000)
  const [currencyForm, setCurrencyForm] = useState({
    arPerCredit: 50,
    platformFeePercent: 30,
    note: ''
  })

  // Détecte si le formulaire diffère de la config sauvegardée
  const isCurrencyDirty = Boolean(
    currencyConfig &&
      (Number(currencyForm.arPerCredit) !== Number(currencyConfig.arPerCredit) ||
        Number(currencyForm.platformFeePercent) !== Number(currencyConfig.platformFeePercent))
  )

  const resetCurrencyForm = () => {
    if (!currencyConfig) return
    setCurrencyForm({
      arPerCredit: currencyConfig.arPerCredit,
      platformFeePercent: currencyConfig.platformFeePercent,
      note: ''
    })
  }

  // Modal states
  const [phoneModalOpen, setPhoneModalOpen] = useState(false)
  const [packModalOpen, setPackModalOpen] = useState(false)
  const [editingPhone, setEditingPhone] = useState<MerchantPhone | null>(null)
  const [editingPack, setEditingPack] = useState<CreditPack | null>(null)
  const [editingSetting, setEditingSetting] = useState<SystemSetting | null>(null)
  const [settingValue, setSettingValue] = useState('')

  // Form states
  const [phoneForm, setPhoneForm] = useState<{
    operator: 'mvola' | 'orange' | 'airtel'
    phone: string
    label: string
    isActive: boolean
    isDefault: boolean
  }>({
    operator: 'orange',
    phone: '',
    label: '',
    isActive: true,
    isDefault: false
  })
  const [packForm, setPackForm] = useState({
    name: '',
    credits: 0,
    price: 0,
    bonus: 0,
    isPopular: false,
    isActive: true,
    sortOrder: 0
  })

  // Raccourcis Toast (cause d'erreur ou succès)
  const showToast = (message: string, isError = false) => {
    if (isError) {
      toast.error('Erreur', message)
    } else {
      toast.success('Succès', message)
    }
  }

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      if (activeTab === 'phones') {
        const res = await fetch('/api/admin/merchant-phones')
        if (res.ok) {
          const data = await res.json()
          setPhones(data.phones || [])
        }
      } else if (activeTab === 'packs') {
        const res = await fetch('/api/admin/credit-packs')
        if (res.ok) {
          const data = await res.json()
          setPacks(data.packs || [])
        }
      } else if (activeTab === 'conversion') {
        const res = await fetch('/api/admin/currency-config')
        if (res.ok) {
          const data = await res.json()
          setCurrencyConfig(data.config)
          setCurrencyForm({
            arPerCredit: data.config?.arPerCredit || 50,
            platformFeePercent: data.config?.platformFeePercent || 30,
            note: ''
          })
        }

        // Historique (non bloquant)
        setHistoryLoading(true)
        try {
          const histRes = await fetch('/api/admin/currency-config?history=1')
          if (histRes.ok) {
            const histData = await histRes.json()
            setCurrencyHistory(histData.history || [])
          } else {
            setCurrencyHistory([])
          }
        } catch {
          setCurrencyHistory([])
        } finally {
          setHistoryLoading(false)
        }
      } else if (activeTab === 'settings' || activeTab === 'ai') {
        const res = await fetch('/api/admin/settings')
        if (res.ok) {
          const data = await res.json()
          setSettings(data.settings || [])
        }
      } else if (activeTab === 'contact') {
        const res = await fetch('/api/admin/contact-info')
        if (res.ok) {
          const data = await res.json()
          setContactInfo(data.contactInfo || {
            generalEmail: 'contact@mah.ai',
            legalEmail: 'legal@mah.ai',
            phone: '+261 34 XX XXX XX',
            address: 'Antananarivo 101, Madagascar'
          })
        }
      }
    } catch (err) {
      showToast('Erreur lors du chargement des données', true)
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Phone CRUD
  const handleSavePhone = async () => {
    if (!phoneForm.phone.trim()) {
      showToast('Le numéro de téléphone est requis', true)
      return
    }
    
    setSaving(true)
    try {
      const url = '/api/admin/merchant-phones'
      const method = editingPhone ? 'PATCH' : 'POST'
      const body = editingPhone 
        ? { ...phoneForm, id: editingPhone.id }
        : phoneForm

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        showToast(editingPhone ? 'Numéro mis à jour' : 'Numéro ajouté')
        setPhoneModalOpen(false)
        setEditingPhone(null)
        setPhoneForm({ operator: 'orange', phone: '', label: '', isActive: true, isDefault: false })
        loadData()
      } else {
        const err = await res.json()
        showToast(err.error || 'Erreur lors de la sauvegarde', true)
      }
    } catch {
      showToast('Erreur lors de la sauvegarde', true)
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePhone = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce numéro ?')) return

    try {
      const res = await fetch(`/api/admin/merchant-phones?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        showToast('Numéro supprimé')
        loadData()
      } else {
        showToast('Erreur lors de la suppression', true)
      }
    } catch {
      showToast('Erreur lors de la suppression', true)
    }
  }

  // Pack CRUD
  const handleSavePack = async () => {
    if (!packForm.name.trim() || packForm.credits <= 0 || packForm.price <= 0) {
      showToast('Tous les champs sont requis et doivent être valides', true)
      return
    }

    setSaving(true)
    try {
      const url = '/api/admin/credit-packs'
      const method = editingPack ? 'PATCH' : 'POST'
      const body = editingPack
        ? { ...packForm, id: editingPack.id }
        : packForm

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        showToast(editingPack ? 'Pack mis à jour' : 'Pack ajouté')
        setPackModalOpen(false)
        setEditingPack(null)
        setPackForm({ name: '', credits: 0, price: 0, bonus: 0, isPopular: false, isActive: true, sortOrder: 0 })
        loadData()
      } else {
        const err = await res.json()
        showToast(err.error || 'Erreur lors de la sauvegarde', true)
      }
    } catch {
      showToast('Erreur lors de la sauvegarde', true)
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePack = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce pack ?')) return

    try {
      const res = await fetch(`/api/admin/credit-packs?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        showToast('Pack supprimé')
        loadData()
      } else {
        showToast('Erreur lors de la suppression', true)
      }
    } catch {
      showToast('Erreur lors de la suppression', true)
    }
  }

  // Setting update
  const handleSaveSetting = async () => {
    if (!editingSetting) return

    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: editingSetting.key,
          value: settingValue
        })
      })

      if (res.ok) {
        showToast('Paramètre mis à jour')
        setEditingSetting(null)
        setSettingValue('')
        loadData()
      } else {
        const err = await res.json()
        showToast(err.error || 'Erreur lors de la sauvegarde', true)
      }
    } catch {
      showToast('Erreur lors de la sauvegarde', true)
    } finally {
      setSaving(false)
    }
  }

  const openEditSetting = (setting: SystemSetting) => {
    setEditingSetting(setting)
    setSettingValue(setting.value)
  }

  const handleSaveContactInfo = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/contact-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactInfo)
      })

      if (res.ok) {
        showToast('Coordonnées de contact mises à jour')
      } else {
        const err = await res.json()
        showToast(err.error || 'Erreur lors de la sauvegarde', true)
      }
    } catch {
      showToast('Erreur lors de la sauvegarde', true)
    } finally {
      setSaving(false)
    }
  }

  // Currency Config handlers
  const handleSaveCurrencyConfig = async () => {
    // Valider les paramètres
    const validation = CurrencyConverter.validate(
      currencyForm.arPerCredit,
      currencyForm.platformFeePercent
    )

    if (!validation.valid) {
      showToast(validation.errors.join(', '), true)
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/currency-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          arPerCredit: currencyForm.arPerCredit,
          platformFeePercent: currencyForm.platformFeePercent,
          note: currencyForm.note
        })
      })

      if (res.ok) {
        showToast('Configuration de change mise à jour')
        setCurrencyForm({ ...currencyForm, note: '' })
        loadData()
      } else {
        const err = await res.json()
        showToast(err.error || 'Erreur lors de la sauvegarde', true)
      }
    } catch {
      showToast('Erreur lors de la sauvegarde', true)
    } finally {
      setSaving(false)
    }
  }

  const getOperatorLabel = (op: string) => {
    switch (op) {
      case 'mvola': return 'MVola'
      case 'orange': return 'Orange Money'
      case 'airtel': return 'Airtel Money'
      default: return op
    }
  }

  const getOperatorColor = (op: string) => {
    switch (op) {
      case 'mvola': return '#00A8E8'
      case 'orange': return '#FF7900'
      case 'airtel': return '#FF0000'
      default: return '#666'
    }
  }

  const formatCategory = (cat: string) => {
    const categories: Record<string, string> = {
      'general': 'Général',
      'onboarding': 'Onboarding',
      'referral': 'Parrainage',
      'payment': 'Paiement',
      'system': 'Système',
      'ai': 'IA',
      'contact': 'Contact'
    }
    return categories[cat] || cat
  }

  return (
    <div className="admin-page-content">
      <AdminBreadcrumb items={[{ label: 'Système' }, { label: 'Configuration' }]} />

      {/* Header */}
      <div className="admin-header">
        <div>
          <div className="admin-header-badge" style={{ background: 'var(--gold-dim)', borderColor: 'var(--gold-line)', color: 'var(--gold)' }}>
            <Settings size={14} />
            <span>Configuration</span>
          </div>
          <h1 className="admin-title">Configuration Système</h1>
          <p className="admin-subtitle">Gérez les numéros de réception, les packs de crédits et les paramètres système</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          onClick={() => changeTab('phones')}
          className={`admin-tab ${activeTab === 'phones' ? 'admin-tab-active' : ''}`}
        >
          <Smartphone size={16} />
          Numéros Mobile Banking
        </button>
        <button
          onClick={() => changeTab('packs')}
          className={`admin-tab ${activeTab === 'packs' ? 'admin-tab-active' : ''}`}
        >
          <Package size={16} />
          Packs de Crédits
        </button>
        <button
          onClick={() => changeTab('conversion')}
          className={`admin-tab ${activeTab === 'conversion' ? 'admin-tab-active' : ''}`}
        >
          <TrendingUp size={16} />
          Conversion Ar ↔ cr
        </button>
        <button
          onClick={() => changeTab('settings')}
          className={`admin-tab ${activeTab === 'settings' ? 'admin-tab-active' : ''}`}
        >
          <Settings size={16} />
          Paramètres Système
        </button>
        <button
          onClick={() => changeTab('ai')}
          className={`admin-tab ${activeTab === 'ai' ? 'admin-tab-active' : ''}`}
        >
          <Star size={16} />
          IA (provider)
        </button>
        <button
          onClick={() => changeTab('contact')}
          className={`admin-tab ${activeTab === 'contact' ? 'admin-tab-active' : ''}`}
        >
          <Mail size={16} />
          Coordonnées Contact
        </button>
      </div>

      <ToastContainer />

      {/* Content */}
      <div className="admin-card">
        {/* PHONES TAB */}
        {activeTab === 'phones' && (
          <>
            <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="admin-card-title">Numéros de réception Mobile Money</h3>
              <button 
                className="admin-btn admin-btn-primary"
                onClick={() => {
                  setEditingPhone(null)
                  setPhoneForm({ operator: 'orange', phone: '', label: '', isActive: true, isDefault: false })
                  setPhoneModalOpen(true)
                }}
              >
                <Plus size={16} />
                Ajouter un numéro
              </button>
            </div>
            
            {loading ? (
              <div className="admin-empty-state">
                <Loader2 className="animate-spin" size={32} />
                <p>Chargement...</p>
              </div>
            ) : phones.length === 0 ? (
              <div className="admin-empty-state">
                <Smartphone size={48} style={{ opacity: 0.5 }} />
                <p>Aucun numéro configuré</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Opérateur</th>
                      <th>Numéro</th>
                      <th>Label</th>
                      <th>Statut</th>
                      <th>Défaut</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {phones.map((phone) => (
                      <tr key={phone.id}>
                        <td>
                          <span style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '0.5rem',
                            color: getOperatorColor(phone.operator),
                            fontWeight: 600
                          }}>
                            <Smartphone size={14} />
                            {getOperatorLabel(phone.operator)}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: '0.95rem' }}>{phone.phone}</td>
                        <td>{phone.label || '-'}</td>
                        <td>
                          {phone.isActive ? (
                            <span className="status-badge status-emerald">Actif</span>
                          ) : (
                            <span className="status-badge status-gray">Inactif</span>
                          )}
                        </td>
                        <td>
                          {phone.isDefault ? (
                            <span style={{ color: 'var(--gold)' }}>
                              <Star size={16} fill="currentColor" />
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button
                              className="admin-btn admin-btn-sm admin-btn-outline"
                              aria-label={`Modifier ${phone.label || phone.operator}`}
                              onClick={() => {
                                setEditingPhone(phone)
                                setPhoneForm({
                                  operator: phone.operator,
                                  phone: phone.phone,
                                  label: phone.label || '',
                                  isActive: phone.isActive,
                                  isDefault: phone.isDefault
                                })
                                setPhoneModalOpen(true)
                              }}
                            >
                              <Edit2 size={14} aria-hidden="true" />
                            </button>
                            <button
                              className="admin-btn admin-btn-sm admin-btn-danger"
                              aria-label={`Supprimer ${phone.label || phone.operator}`}
                              onClick={() => handleDeletePhone(phone.id)}
                            >
                              <Trash2 size={14} aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* PACKS TAB */}
        {activeTab === 'packs' && (
          <>
            <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="admin-card-title">Packs de crédits disponibles</h3>
              <button 
                className="admin-btn admin-btn-primary"
                onClick={() => {
                  setEditingPack(null)
                  setPackForm({ name: '', credits: 0, price: 0, bonus: 0, isPopular: false, isActive: true, sortOrder: 0 })
                  setPackModalOpen(true)
                }}
              >
                <Plus size={16} />
                Ajouter un pack
              </button>
            </div>
            
            {loading ? (
              <div className="admin-empty-state">
                <Loader2 className="animate-spin" size={32} />
                <p>Chargement...</p>
              </div>
            ) : packs.length === 0 ? (
              <div className="admin-empty-state">
                <Package size={48} style={{ opacity: 0.5 }} />
                <p>Aucun pack configuré</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Crédits</th>
                      <th>Prix</th>
                      <th>Bonus</th>
                      <th>Populaire</th>
                      <th>Statut</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packs.map((pack) => (
                      <tr key={pack.id}>
                        <td style={{ fontWeight: 500 }}>{pack.name}</td>
                        <td style={{ fontFamily: 'var(--mono)' }}>{pack.credits} cr</td>
                        <td style={{ fontFamily: 'var(--mono)', color: 'var(--gold)' }}>{pack.price.toLocaleString()} Ar</td>
                        <td>+{pack.bonus} cr</td>
                        <td>
                          {pack.isPopular ? (
                            <span style={{ color: 'var(--gold)' }}>
                              <Star size={16} fill="currentColor" />
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>
                          {pack.isActive ? (
                            <span className="status-badge status-emerald">Actif</span>
                          ) : (
                            <span className="status-badge status-gray">Inactif</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button
                              className="admin-btn admin-btn-sm admin-btn-outline"
                              aria-label={`Modifier le pack ${pack.name}`}
                              onClick={() => {
                                setEditingPack(pack)
                                setPackForm({
                                  name: pack.name,
                                  credits: pack.credits,
                                  price: pack.price,
                                  bonus: pack.bonus,
                                  isPopular: pack.isPopular,
                                  isActive: pack.isActive,
                                  sortOrder: pack.sortOrder
                                })
                                setPackModalOpen(true)
                              }}
                            >
                              <Edit2 size={14} aria-hidden="true" />
                            </button>
                            <button
                              className="admin-btn admin-btn-sm admin-btn-danger"
                              aria-label={`Supprimer le pack ${pack.name}`}
                              onClick={() => handleDeletePack(pack.id)}
                            >
                              <Trash2 size={14} aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* CONVERSION TAB */}
        {activeTab === 'conversion' && (
          <>
            <div className="admin-card-header">
              <div>
                <h3 className="admin-card-title">Configuration des Taux de Change</h3>
                <p className="admin-subtitle" style={{ margin: 0, marginTop: '0.25rem' }}>
                  Définissez le taux de conversion et les frais de plateforme
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isCurrencyDirty && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    fontSize: '0.75rem',
                    color: 'var(--amber)',
                    background: 'var(--amber-dim)',
                    padding: '0.375rem 0.625rem',
                    borderRadius: 'var(--r)',
                    border: '1px solid var(--amber-line)',
                    fontWeight: 600,
                  }}>
                    <AlertCircle size={12} />
                    Modifications non enregistrées
                  </div>
                )}
                {currencyConfig?.updatedAt && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.8rem',
                    color: 'var(--text-3)',
                    background: 'var(--b2)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--r)',
                    border: '1px solid var(--b3)'
                  }}>
                    <Clock size={14} />
                    Config active depuis le {new Date(currencyConfig.updatedAt).toLocaleDateString('fr-FR')}
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <div className="admin-empty-state">
                <Loader2 className="animate-spin" size={32} />
                <p>Chargement...</p>
              </div>
            ) : (
              <div style={{ padding: '1.5rem' }}>
                {/* SECTION 1 — Aperçu global (live) */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.75rem',
                  paddingBottom: '0.5rem',
                }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-2)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Aperçu global {isCurrencyDirty && '(valeurs en cours de modification)'}
                  </h4>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '1rem',
                  marginBottom: '2rem'
                }}>
                  {/* Taux de change */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%)',
                    border: `1px solid ${isCurrencyDirty ? 'var(--amber-line)' : 'var(--gold-line)'}`,
                    borderRadius: 'var(--r-lg)',
                    padding: '1.25rem',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'border-color 0.2s'
                  }}>
                    <div style={{
                      position: 'absolute', top: '1rem', right: '1rem',
                      width: '40px', height: '40px', borderRadius: 'var(--r)',
                      background: 'var(--gold-dim)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', color: 'var(--gold)'
                    }}>
                      <DollarSign size={20} />
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '0.5rem', fontWeight: 500 }}>
                      Taux de Change
                    </div>
                    <div style={{
                      fontSize: '2rem', fontWeight: 700, color: 'var(--gold)',
                      fontFamily: 'var(--mono)', letterSpacing: '-0.02em'
                    }}>
                      {currencyForm.arPerCredit || 50} Ar
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginTop: '0.5rem' }}>
                      = 1 crédit
                      {isCurrencyDirty && currencyConfig && Number(currencyForm.arPerCredit) !== Number(currencyConfig.arPerCredit) && (
                        <span style={{ marginLeft: '0.375rem', color: 'var(--amber)', fontFamily: 'var(--mono)', fontSize: '0.7rem' }}>
                          (était {currencyConfig.arPerCredit} Ar)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Frais plateforme */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(224, 96, 112, 0.1) 0%, rgba(224, 96, 112, 0.05) 100%)',
                    border: `1px solid ${isCurrencyDirty ? 'var(--amber-line)' : 'var(--ruby-line)'}`,
                    borderRadius: 'var(--r-lg)',
                    padding: '1.25rem',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'border-color 0.2s'
                  }}>
                    <div style={{
                      position: 'absolute', top: '1rem', right: '1rem',
                      width: '40px', height: '40px', borderRadius: 'var(--r)',
                      background: 'var(--ruby-dim)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', color: 'var(--ruby)'
                    }}>
                      <TrendingUp size={20} />
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '0.5rem', fontWeight: 500 }}>
                      Frais Plateforme
                    </div>
                    <div style={{
                      fontSize: '2rem', fontWeight: 700, color: 'var(--ruby)',
                      fontFamily: 'var(--mono)', letterSpacing: '-0.02em'
                    }}>
                      {currencyForm.platformFeePercent || 30}%
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginTop: '0.5rem' }}>
                      sur chaque transaction
                      {isCurrencyDirty && currencyConfig && Number(currencyForm.platformFeePercent) !== Number(currencyConfig.platformFeePercent) && (
                        <span style={{ marginLeft: '0.375rem', color: 'var(--amber)', fontFamily: 'var(--mono)', fontSize: '0.7rem' }}>
                          (était {currencyConfig.platformFeePercent}%)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Revenu contributeur */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(96, 176, 144, 0.1) 0%, rgba(96, 176, 144, 0.05) 100%)',
                    border: `1px solid ${isCurrencyDirty ? 'var(--amber-line)' : 'var(--sage-line)'}`,
                    borderRadius: 'var(--r-lg)',
                    padding: '1.25rem',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'border-color 0.2s'
                  }}>
                    <div style={{
                      position: 'absolute', top: '1rem', right: '1rem',
                      width: '40px', height: '40px', borderRadius: 'var(--r)',
                      background: 'var(--sage-dim)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', color: 'var(--sage)'
                    }}>
                      <Star size={20} />
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '0.5rem', fontWeight: 500 }}>
                      Revenu Contributeur
                    </div>
                    <div style={{
                      fontSize: '2rem', fontWeight: 700, color: 'var(--sage)',
                      fontFamily: 'var(--mono)', letterSpacing: '-0.02em'
                    }}>
                      {100 - (currencyForm.platformFeePercent || 30)}%
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', marginTop: '0.5rem' }}>
                      du prix de vente
                    </div>
                  </div>
                </div>

                {/* Two Column Layout */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '1.5rem',
                  alignItems: 'start'
                }}>
                  {/* Configuration Form */}
                  <div style={{
                    background: 'var(--b1)',
                    borderRadius: 'var(--r-lg)',
                    padding: '1.25rem',
                    border: '1px solid var(--b2)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '1.25rem',
                      paddingBottom: '0.75rem',
                      borderBottom: '1px solid var(--b2)'
                    }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--r)',
                        background: 'var(--gold-dim)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--gold)'
                      }}>
                        <Settings size={16} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Modifier la Configuration</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', margin: 0 }}>Ajustez les taux et frais</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div className="admin-form-group" style={{ margin: 0 }}>
                        <label className="admin-label" style={{ fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                          Taux de change (1 crédit = ? Ar)
                        </label>
                        <div style={{
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <input
                            type="number"
                            value={currencyForm.arPerCredit}
                            onChange={(e) => setCurrencyForm({
                              ...currencyForm,
                              arPerCredit: parseFloat(e.target.value) || 50
                            })}
                            min={1}
                            step={1}
                            className="admin-input"
                            style={{
                              paddingRight: '3rem',
                              fontSize: '1.1rem',
                              fontWeight: 600,
                              fontFamily: 'var(--mono)'
                            }}
                          />
                          <span style={{
                            position: 'absolute',
                            right: '1rem',
                            color: 'var(--text-3)',
                            fontSize: '0.9rem',
                            fontWeight: 500
                          }}>Ar</span>
                        </div>
                        <small style={{ color: 'var(--text-3)', marginTop: '0.375rem', display: 'block', fontSize: '0.75rem' }}>
                          Montant en Ariary équivalent à 1 crédit
                        </small>
                      </div>

                      <div className="admin-form-group" style={{ margin: 0 }}>
                        <label className="admin-label" style={{ fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                          Frais plateforme (%)
                        </label>
                        <div style={{
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <input
                            type="number"
                            value={currencyForm.platformFeePercent}
                            onChange={(e) => setCurrencyForm({
                              ...currencyForm,
                              platformFeePercent: parseFloat(e.target.value) || 30
                            })}
                            min={0}
                            max={100}
                            step={1}
                            className="admin-input"
                            style={{
                              paddingRight: '2.5rem',
                              fontSize: '1.1rem',
                              fontWeight: 600,
                              fontFamily: 'var(--mono)'
                            }}
                          />
                          <span style={{
                            position: 'absolute',
                            right: '1rem',
                            color: 'var(--text-3)',
                            fontSize: '0.9rem',
                            fontWeight: 500
                          }}>%</span>
                        </div>
                        <small style={{ color: 'var(--text-3)', marginTop: '0.375rem', display: 'block', fontSize: '0.75rem' }}>
                          Pourcentage prélevé sur chaque transaction
                        </small>
                      </div>

                      <div className="admin-form-group" style={{ margin: 0 }}>
                        <label className="admin-label" style={{ fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                          Note de changement <span style={{ color: 'var(--text-3)' }}>(optionnel)</span>
                        </label>
                        <textarea
                          value={currencyForm.note}
                          onChange={(e) => setCurrencyForm({
                            ...currencyForm,
                            note: e.target.value
                          })}
                          placeholder="Ex: Ajustement suite à l'inflation..."
                          className="admin-input"
                          rows={2}
                          style={{ resize: 'none', fontSize: '0.85rem' }}
                        />
                        <small style={{ color: 'var(--text-3)', marginTop: '0.375rem', display: 'block', fontSize: '0.75rem' }}>
                          Raison du changement pour l'historique
                        </small>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {isCurrencyDirty && (
                          <button
                            className="admin-btn admin-btn-outline"
                            onClick={resetCurrencyForm}
                            disabled={saving}
                            style={{
                              justifyContent: 'center',
                              padding: '0.75rem',
                              flexShrink: 0
                            }}
                            aria-label="Réinitialiser le formulaire"
                            title="Annuler les modifications"
                          >
                            <RotateCcw size={16} />
                            Réinitialiser
                          </button>
                        )}
                        <button
                          className="admin-btn admin-btn-primary"
                          onClick={handleSaveCurrencyConfig}
                          disabled={saving || !isCurrencyDirty}
                          style={{
                            flex: 1,
                            justifyContent: 'center',
                            padding: '0.75rem',
                            opacity: !isCurrencyDirty && !saving ? 0.6 : 1
                          }}
                        >
                          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                          {saving ? 'Mise à jour en cours...' : isCurrencyDirty ? 'Enregistrer les modifications' : 'Aucun changement'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Live Calculator Preview */}
                  <div style={{
                    background: 'var(--b1)',
                    borderRadius: 'var(--r-lg)',
                    padding: '1.25rem',
                    border: '1px solid var(--b2)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '1.25rem',
                      paddingBottom: '0.75rem',
                      borderBottom: '1px solid var(--b2)'
                    }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--r)',
                        background: 'var(--sage-dim)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--sage)'
                      }}>
                        <Calculator size={16} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Aperçu du Calcul</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', margin: 0 }}>Simulation avec les nouveaux taux</p>
                      </div>
                    </div>

                    <div style={{
                      background: 'var(--void)',
                      borderRadius: 'var(--r)',
                      padding: '1rem',
                      marginBottom: '1rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                      }}>
                        <label htmlFor="preview-price-input" style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 500 }}>
                          Prix de vente simulé
                        </label>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>
                          {Math.round(previewPrice / currencyForm.arPerCredit)} cr
                        </span>
                      </div>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                          id="preview-price-input"
                          type="number"
                          value={previewPrice}
                          onChange={(e) => setPreviewPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                          min={0}
                          step={500}
                          className="admin-input"
                          style={{
                            paddingRight: '3rem',
                            fontSize: '1.4rem',
                            fontWeight: 700,
                            fontFamily: 'var(--mono)',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text)',
                            padding: '0.25rem 3rem 0.25rem 0'
                          }}
                          aria-label="Prix de vente simulé en Ariary"
                        />
                        <span style={{
                          position: 'absolute',
                          right: '0.5rem',
                          color: 'var(--text-3)',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          pointerEvents: 'none'
                        }}>Ar</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.625rem', flexWrap: 'wrap' }}>
                        {[1000, 5000, 10000, 20000, 50000].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setPreviewPrice(preset)}
                            className="admin-btn admin-btn-sm"
                            style={{
                              padding: '0.25rem 0.625rem',
                              fontSize: '0.7rem',
                              fontFamily: 'var(--mono)',
                              background: previewPrice === preset ? 'var(--gold-dim)' : 'var(--b2)',
                              border: `1px solid ${previewPrice === preset ? 'var(--gold-line)' : 'var(--b3)'}`,
                              color: previewPrice === preset ? 'var(--gold)' : 'var(--text-2)',
                              borderRadius: 'var(--r-sm)',
                              fontWeight: previewPrice === preset ? 600 : 500
                            }}
                            aria-pressed={previewPrice === preset}
                          >
                            {preset.toLocaleString()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem',
                        background: 'var(--b2)',
                        borderRadius: 'var(--r)',
                        fontSize: '0.85rem'
                      }}>
                        <span style={{ color: 'var(--text-2)' }}>Équivalent en crédits</span>
                        <span style={{
                          fontWeight: 600,
                          color: 'var(--gold)',
                          fontFamily: 'var(--mono)'
                        }}>
                          {Math.round(previewPrice / Math.max(currencyForm.arPerCredit, 1))} cr
                        </span>
                      </div>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem',
                        background: 'var(--b2)',
                        borderRadius: 'var(--r)',
                        fontSize: '0.85rem'
                      }}>
                        <span style={{ color: 'var(--text-2)' }}>Frais plateforme ({currencyForm.platformFeePercent}%)</span>
                        <span style={{
                          fontWeight: 600,
                          color: 'var(--ruby)',
                          fontFamily: 'var(--mono)'
                        }}>
                          -{Math.round(previewPrice * (currencyForm.platformFeePercent / 100)).toLocaleString()} Ar
                        </span>
                      </div>

                      <div style={{
                        marginTop: '0.5rem',
                        padding: '1rem',
                        background: 'var(--sage-dim)',
                        borderRadius: 'var(--r)',
                        border: '1px solid var(--sage-line)'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-2)', fontWeight: 500 }}>
                            Revenu contributeur
                          </span>
                          <span style={{
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            color: 'var(--sage)',
                            fontFamily: 'var(--mono)'
                          }}>
                            {Math.round(previewPrice * (1 - (currencyForm.platformFeePercent / 100))).toLocaleString()} Ar
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{
                      marginTop: '1rem',
                      padding: '0.75rem',
                      background: 'var(--b2)',
                      borderRadius: 'var(--r)',
                      fontSize: '0.75rem',
                      color: 'var(--text-3)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem'
                    }}>
                      <AlertCircle size={14} style={{ marginTop: '0.125rem', flexShrink: 0 }} />
                      <span>
                        Ce calcul est indicatif et montre la répartition des revenus basée sur les taux configurés ci-contre.
                      </span>
                    </div>
                  </div>
                </div>

                {/* SECTION 3 — Historique des modifications */}
                <div style={{ marginTop: '2rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.75rem',
                    paddingBottom: '0.5rem',
                  }}>
                    <History size={16} style={{ color: 'var(--text-3)' }} />
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-2)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Historique des modifications
                    </h4>
                    {currencyHistory.length > 0 && (
                      <span style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-3)',
                        fontFamily: 'var(--mono)',
                        background: 'var(--b2)',
                        padding: '0.125rem 0.5rem',
                        borderRadius: 'var(--r-sm)',
                        border: '1px solid var(--b3)'
                      }}>
                        {currencyHistory.length} entrée{currencyHistory.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {historyLoading ? (
                    <div style={{
                      padding: '1.5rem',
                      background: 'var(--b1)',
                      borderRadius: 'var(--r-lg)',
                      border: '1px solid var(--b2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      color: 'var(--text-3)',
                      fontSize: '0.85rem'
                    }}>
                      <Loader2 className="animate-spin" size={14} />
                      Chargement de l'historique...
                    </div>
                  ) : currencyHistory.length === 0 ? (
                    <div style={{
                      padding: '1.5rem',
                      background: 'var(--b1)',
                      borderRadius: 'var(--r-lg)',
                      border: '1px dashed var(--b2)',
                      textAlign: 'center',
                      color: 'var(--text-3)',
                      fontSize: '0.85rem'
                    }}>
                      Aucune modification enregistrée pour le moment.
                    </div>
                  ) : (
                    <div style={{
                      background: 'var(--b1)',
                      borderRadius: 'var(--r-lg)',
                      border: '1px solid var(--b2)',
                      overflow: 'hidden'
                    }}>
                      {currencyHistory.slice(0, 10).map((entry, idx) => {
                        const isActive = currencyConfig?.id === entry.id
                        const prev = currencyHistory[idx + 1]
                        const arDiff = prev ? Number(entry.arPerCredit) - Number(prev.arPerCredit) : 0
                        const feeDiff = prev ? Number(entry.platformFeePercent) - Number(prev.platformFeePercent) : 0
                        return (
                          <div
                            key={entry.id}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '32px 1fr auto',
                              gap: '0.875rem',
                              padding: '0.875rem 1rem',
                              borderBottom: idx < Math.min(currencyHistory.length, 10) - 1 ? '1px solid var(--b2)' : 'none',
                              alignItems: 'center',
                              background: isActive ? 'var(--sage-dim)' : 'transparent',
                              transition: 'background 0.15s'
                            }}
                          >
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: isActive ? 'var(--sage-dim)' : 'var(--b2)',
                              border: `1px solid ${isActive ? 'var(--sage-line)' : 'var(--b3)'}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: isActive ? 'var(--sage)' : 'var(--text-3)',
                              flexShrink: 0
                            }}>
                              {isActive ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                flexWrap: 'wrap',
                                marginBottom: '0.125rem'
                              }}>
                                <span style={{
                                  fontFamily: 'var(--mono)',
                                  fontSize: '0.85rem',
                                  fontWeight: 600,
                                  color: 'var(--gold)'
                                }}>
                                  {entry.arPerCredit} Ar
                                </span>
                                {prev && arDiff !== 0 && (
                                  <span style={{
                                    fontSize: '0.7rem',
                                    color: arDiff > 0 ? 'var(--ruby)' : 'var(--sage)',
                                    fontFamily: 'var(--mono)'
                                  }}>
                                    ({arDiff > 0 ? '+' : ''}{arDiff})
                                  </span>
                                )}
                                <ArrowRight size={11} style={{ color: 'var(--text-3)', opacity: 0.5 }} />
                                <span style={{
                                  fontFamily: 'var(--mono)',
                                  fontSize: '0.85rem',
                                  fontWeight: 600,
                                  color: 'var(--ruby)'
                                }}>
                                  {entry.platformFeePercent}%
                                </span>
                                {prev && feeDiff !== 0 && (
                                  <span style={{
                                    fontSize: '0.7rem',
                                    color: feeDiff > 0 ? 'var(--ruby)' : 'var(--sage)',
                                    fontFamily: 'var(--mono)'
                                  }}>
                                    ({feeDiff > 0 ? '+' : ''}{feeDiff}%)
                                  </span>
                                )}
                                {isActive && (
                                  <span style={{
                                    fontSize: '0.65rem',
                                    fontWeight: 600,
                                    color: 'var(--sage)',
                                    background: 'var(--sage-dim)',
                                    padding: '0.125rem 0.375rem',
                                    borderRadius: 'var(--r-sm)',
                                    border: '1px solid var(--sage-line)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                  }}>
                                    Active
                                  </span>
                                )}
                              </div>
                              {entry.note && (
                                <div style={{
                                  fontSize: '0.75rem',
                                  color: 'var(--text-3)',
                                  fontStyle: 'italic',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  « {entry.note} »
                                </div>
                              )}
                            </div>
                            <div style={{
                              fontSize: '0.7rem',
                              color: 'var(--text-3)',
                              fontFamily: 'var(--mono)',
                              textAlign: 'right',
                              flexShrink: 0
                            }}>
                              {new Date(entry.updatedAt).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                              <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>
                                {new Date(entry.updatedAt).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <>
            <div className="admin-card-header">
              <h3 className="admin-card-title">Paramètres système</h3>
            </div>
            
            {loading ? (
              <div className="admin-empty-state">
                <Loader2 className="animate-spin" size={32} />
                <p>Chargement...</p>
              </div>
            ) : settings.length === 0 ? (
              <div className="admin-empty-state">
                <Settings size={48} style={{ opacity: 0.5 }} />
                <p>Aucun paramètre configuré</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Paramètre</th>
                      <th>Valeur</th>
                      <th>Type</th>
                      <th>Catégorie</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settings.map((setting) => (
                      <tr key={setting.id}>
                        <td>
                          <div style={{ fontWeight: 500 }}>{setting.label || setting.key}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{setting.description}</div>
                        </td>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: '0.9rem' }}>
                          {setting.type === 'boolean' ? (
                            setting.value === 'true' ? (
                              <span style={{ color: 'var(--sage)' }}>✓ Activé</span>
                            ) : (
                              <span style={{ color: 'var(--ruby)' }}>✗ Désactivé</span>
                            )
                          ) : (
                            setting.value
                          )}
                        </td>
                        <td>
                          <span className="status-badge status-gray">{setting.type}</span>
                        </td>
                        <td>{formatCategory(setting.category)}</td>
                        <td style={{ textAlign: 'right' }}>
                          {setting.isEditable ? (
                            <button
                              className="admin-btn admin-btn-sm admin-btn-outline"
                              aria-label={`Modifier le paramètre ${setting.key}`}
                              onClick={() => openEditSetting(setting)}
                            >
                              <Edit2 size={14} aria-hidden="true" />
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Verrouillé</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* AI TAB */}
        {activeTab === 'ai' && (
          <>
            <div className="admin-card-header">
              <h3 className="admin-card-title">Configuration IA</h3>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <AIProviderPanel
                onChange={() => {
                  // Recharge les settings pour rafraîchir la valeur de ai.provider
                  // dans la liste éditable en dessous.
                  void fetch('/api/admin/settings')
                    .then((r) => r.json())
                    .then((d) => setSettings(d.settings || []))
                    .catch(() => {})
                }}
              />

              <section>
                <h4 style={{
                  fontSize: '0.95rem',
                  margin: '0 0 0.75rem',
                  color: 'var(--text-1)',
                  fontFamily: 'var(--font-display, serif)',
                  fontWeight: 600,
                }}>
                  Paramètres IA détaillés
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', margin: '0 0 1rem' }}>
                  Tarifs (en crédits), modèles par provider et niveau d'effort. Modifiez la valeur souhaitée puis cliquez sur l'icône pour confirmer.
                </p>

                {loading ? (
                  <div className="admin-empty-state">
                    <Loader2 className="animate-spin" size={28} />
                    <p>Chargement…</p>
                  </div>
                ) : settings.filter((s) => s.category === 'ai').length === 0 ? (
                  <div className="admin-empty-state">
                    <Settings size={36} style={{ opacity: 0.5 }} />
                    <p>Aucun paramètre IA — appliquez la migration <code>20260427_ai_providers.sql</code>.</p>
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Paramètre</th>
                          <th>Valeur</th>
                          <th>Type</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {settings
                          .filter((s) => s.category === 'ai')
                          .map((setting) => (
                            <tr key={setting.id}>
                              <td>
                                <div style={{ fontWeight: 500 }}>{setting.label || setting.key}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                                  <code style={{
                                    fontFamily: 'var(--font-mono, monospace)',
                                    fontSize: '0.7rem',
                                    color: 'var(--gold)',
                                  }}>{setting.key}</code>
                                  {setting.description ? ` — ${setting.description}` : ''}
                                </div>
                              </td>
                              <td style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.88rem' }}>
                                {setting.value}
                              </td>
                              <td>
                                <span className="status-badge status-gray">{setting.type}</span>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                {setting.isEditable ? (
                                  <button
                                    className="admin-btn admin-btn-sm admin-btn-outline"
                                    aria-label={`Modifier ${setting.key}`}
                                    onClick={() => openEditSetting(setting)}
                                  >
                                    <Edit2 size={14} aria-hidden="true" />
                                  </button>
                                ) : (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Verrouillé</span>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          </>
        )}

        {/* CONTACT TAB */}
        {activeTab === 'contact' && (
          <>
            <div className="admin-card-header">
              <h3 className="admin-card-title">Coordonnées de contact</h3>
            </div>
            
            {loading ? (
              <div className="admin-empty-state">
                <Loader2 className="animate-spin" size={32} />
                <p>Chargement...</p>
              </div>
            ) : (
              <div style={{ padding: '1.5rem' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                  <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '8px', 
                        background: 'var(--gold-dim)', 
                        border: '1px solid var(--gold-line)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0,
                        color: 'var(--gold)'
                      }}>
                        <Mail size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label className="admin-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Email général</label>
                        <input
                          type="email"
                          value={contactInfo.generalEmail}
                          onChange={(e) => setContactInfo({ ...contactInfo, generalEmail: e.target.value })}
                          className="admin-input"
                          placeholder="contact@mah.ai"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '8px', 
                        background: 'var(--gold-dim)', 
                        border: '1px solid var(--gold-line)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0,
                        color: 'var(--gold)'
                      }}>
                        <Mail size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label className="admin-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Email juridique</label>
                        <input
                          type="email"
                          value={contactInfo.legalEmail}
                          onChange={(e) => setContactInfo({ ...contactInfo, legalEmail: e.target.value })}
                          className="admin-input"
                          placeholder="legal@mah.ai"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '8px', 
                        background: 'var(--gold-dim)', 
                        border: '1px solid var(--gold-line)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0,
                        color: 'var(--gold)'
                      }}>
                        <Phone size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label className="admin-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Téléphone</label>
                        <input
                          type="tel"
                          value={contactInfo.phone}
                          onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                          className="admin-input"
                          placeholder="+261 34 XX XXX XX"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '8px', 
                        background: 'var(--gold-dim)', 
                        border: '1px solid var(--gold-line)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0,
                        color: 'var(--gold)'
                      }}>
                        <MapPin size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label className="admin-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Adresse</label>
                        <textarea
                          value={contactInfo.address}
                          onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                          className="admin-input"
                          rows={3}
                          placeholder="Antananarivo 101, Madagascar"
                        />
                      </div>
                    </div>

                    <div style={{ 
                      paddingTop: '1rem', 
                      borderTop: '1px solid var(--b1)',
                      marginTop: '1rem'
                    }}>
                      <button
                        className="admin-btn admin-btn-primary"
                        onClick={handleSaveContactInfo}
                        disabled={saving}
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* PHONE MODAL */}
      {phoneModalOpen && (
        <div className="admin-overlay open" onClick={() => setPhoneModalOpen(false)}>
          <div className="admin-modal" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingPhone ? 'Modifier le numéro' : 'Ajouter un numéro'}</h3>
              <button className="modal-close" onClick={() => setPhoneModalOpen(false)}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="admin-form-stack">
                <div className="admin-form-group">
                  <label className="admin-label">Opérateur</label>
                  <select
                    value={phoneForm.operator}
                    onChange={(e) => setPhoneForm({ ...phoneForm, operator: e.target.value as 'mvola' | 'orange' | 'airtel' })}
                    className="admin-select"
                  >
                    <option value="orange">Orange Money</option>
                    <option value="mvola">MVola</option>
                    <option value="airtel">Airtel Money</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Numéro de téléphone</label>
                  <input
                    type="text"
                    value={phoneForm.phone}
                    onChange={(e) => setPhoneForm({ ...phoneForm, phone: e.target.value })}
                    placeholder="Ex: 032 12 345 67"
                    className="admin-input"
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Label (optionnel)</label>
                  <input
                    type="text"
                    value={phoneForm.label}
                    onChange={(e) => setPhoneForm({ ...phoneForm, label: e.target.value })}
                    placeholder="Ex: Numéro principal"
                    className="admin-input"
                  />
                </div>
                <div className="admin-form-row">
                  <label className="admin-checkbox-label">
                    <input
                      type="checkbox"
                      checked={phoneForm.isActive}
                      onChange={(e) => setPhoneForm({ ...phoneForm, isActive: e.target.checked })}
                    />
                    <span>Actif</span>
                  </label>
                  <label className="admin-checkbox-label">
                    <input
                      type="checkbox"
                      checked={phoneForm.isDefault}
                      onChange={(e) => setPhoneForm({ ...phoneForm, isDefault: e.target.checked })}
                    />
                    <span>Par défaut</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <div className="modal-actions">
                <button className="admin-btn admin-btn-outline" onClick={() => setPhoneModalOpen(false)}>
                  Annuler
                </button>
                <button
                  className="admin-btn admin-btn-primary"
                  onClick={handleSavePhone}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PACK MODAL */}
      {packModalOpen && (
        <div className="admin-overlay open" onClick={() => setPackModalOpen(false)}>
          <div className="admin-modal" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingPack ? 'Modifier le pack' : 'Ajouter un pack'}</h3>
              <button className="modal-close" onClick={() => setPackModalOpen(false)}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="admin-form-stack">
                <div className="admin-form-group">
                  <label className="admin-label">Nom du pack</label>
                  <input
                    type="text"
                    value={packForm.name}
                    onChange={(e) => setPackForm({ ...packForm, name: e.target.value })}
                    placeholder="Ex: Pack Standard"
                    className="admin-input"
                  />
                </div>
                <div className="admin-form-grid-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Crédits</label>
                    <input
                      type="number"
                      value={packForm.credits}
                      onChange={(e) => setPackForm({ ...packForm, credits: parseInt(e.target.value) || 0 })}
                      min={1}
                      className="admin-input"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Prix (Ar)</label>
                    <input
                      type="number"
                      value={packForm.price}
                      onChange={(e) => setPackForm({ ...packForm, price: parseInt(e.target.value) || 0 })}
                      min={1}
                      className="admin-input"
                    />
                  </div>
                </div>
                <div className="admin-form-grid-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Bonus (crédits)</label>
                    <input
                      type="number"
                      value={packForm.bonus}
                      onChange={(e) => setPackForm({ ...packForm, bonus: parseInt(e.target.value) || 0 })}
                      min={0}
                      className="admin-input"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Ordre d'affichage</label>
                    <input
                      type="number"
                      value={packForm.sortOrder}
                      onChange={(e) => setPackForm({ ...packForm, sortOrder: parseInt(e.target.value) || 0 })}
                      className="admin-input"
                    />
                  </div>
                </div>
                <div className="admin-form-row">
                  <label className="admin-checkbox-label">
                    <input
                      type="checkbox"
                      checked={packForm.isPopular}
                      onChange={(e) => setPackForm({ ...packForm, isPopular: e.target.checked })}
                    />
                    <span>Pack populaire</span>
                  </label>
                  <label className="admin-checkbox-label">
                    <input
                      type="checkbox"
                      checked={packForm.isActive}
                      onChange={(e) => setPackForm({ ...packForm, isActive: e.target.checked })}
                    />
                    <span>Actif</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <div className="modal-actions">
                <button className="admin-btn admin-btn-outline" onClick={() => setPackModalOpen(false)}>
                  Annuler
                </button>
                <button
                  className="admin-btn admin-btn-primary"
                  onClick={handleSavePack}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SETTING EDIT MODAL */}
      {editingSetting && (
        <div className="admin-overlay open" onClick={() => setEditingSetting(null)}>
          <div className="admin-modal" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Modifier le paramètre</h3>
              <button className="modal-close" onClick={() => setEditingSetting(null)}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="admin-form-stack">
                <div className="admin-setting-info">
                  <div className="admin-setting-info-title">
                    {editingSetting.label || editingSetting.key}
                  </div>
                  {editingSetting.description && (
                    <p className="admin-setting-info-desc">
                      {editingSetting.description}
                    </p>
                  )}
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">
                    Valeur ({editingSetting.type})
                  </label>
                  {editingSetting.type === 'boolean' ? (
                    <select
                      value={settingValue}
                      onChange={(e) => setSettingValue(e.target.value)}
                      className="admin-select"
                    >
                      <option value="true">Activé (true)</option>
                      <option value="false">Désactivé (false)</option>
                    </select>
                  ) : editingSetting.type === 'number' ? (
                    <input
                      type="number"
                      value={settingValue}
                      onChange={(e) => setSettingValue(e.target.value)}
                      className="admin-input"
                    />
                  ) : (
                    <input
                      type="text"
                      value={settingValue}
                      onChange={(e) => setSettingValue(e.target.value)}
                      className="admin-input"
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <div className="modal-actions">
                <button className="admin-btn admin-btn-outline" onClick={() => setEditingSetting(null)}>
                  Annuler
                </button>
                <button
                  className="admin-btn admin-btn-primary"
                  onClick={handleSaveSetting}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
