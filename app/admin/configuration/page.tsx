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
} from 'lucide-react'
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb'
import { ToastContainer } from '@/components/ui/ToastContainer'
import { useToast } from '@/lib/hooks/useToast'

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

type TabType = 'phones' | 'packs' | 'settings' | 'contact'

type ContactInfo = {
  generalEmail: string
  legalEmail: string
  phone: string
  address: string
}

export default function AdminConfigurationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get('tab') as TabType) || 'phones'
  const [activeTab, setActiveTab] = useState<TabType>(
    ['phones', 'packs', 'settings', 'contact'].includes(initialTab) ? initialTab : 'phones'
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
      } else if (activeTab === 'settings') {
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
      'system': 'Système'
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
          onClick={() => changeTab('settings')}
          className={`admin-tab ${activeTab === 'settings' ? 'admin-tab-active' : ''}`}
        >
          <Settings size={16} />
          Paramètres Système
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
