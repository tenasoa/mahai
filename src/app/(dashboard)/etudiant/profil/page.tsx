'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { 
  User, 
  Shield, 
  CreditCard, 
  Bell, 
  Lock, 
  Smartphone, 
  Trash2,
  ChevronRight,
  Mail,
  GraduationCap,
  MapPin,
  School,
  Gem,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'
import { LevelProgress } from '@/components/ui/profile/LevelProgress'
import RippleEffect from '@/components/ui/RippleEffect'

// Simulation de données (à relier plus tard à Prisma/DB)
const MOCK_ROLES = [
  { id: 'etudiant', name: 'Étudiante', icon: '🎓', status: 'active', color: 'text-teal' },
  { id: 'contributeur', name: 'Contributrice', icon: '✍️', status: 'active', color: 'text-gold' },
  { id: 'verificateur', name: 'Vérificatrice', icon: '👁️', status: 'pending', color: 'text-gold' },
]

const NOTIFS_SECTIONS = [
  { 
    title: 'Activité & Apprentissage', 
    items: [
      { id: 'new_subjects', icon: '📚', label: 'Nouveaux sujets', desc: 'Sujets dans tes matières préférées' },
      { id: 'exam_reminders', icon: '🎯', label: 'Rappels d\'examen', desc: 'Selon ton calendrier BAC' }
    ] 
  },
  { 
    title: 'Gains & Paiements', 
    items: [
      { id: 'consultations', icon: '💰', label: 'Nouvelles consultations', desc: 'Quand ton sujet est consulté' },
      { id: 'recharge', icon: '💳', label: 'Achats de crédits', desc: 'Confirmation de recharge' }
    ] 
  }
]

const extractClerkErrorMessage = (error: unknown, fallback: string) => {
  if (!error || typeof error !== 'object') return fallback
  const maybeErrors = (error as { errors?: Array<{ longMessage?: string; message?: string; code?: string }> }).errors
  const first = maybeErrors?.[0]
  if (first?.longMessage) return first.longMessage
  if (first?.message) return first.message
  if (first?.code) return `Erreur: ${first.code}`
  return fallback
}

export default function AccountPage() {
  const { user, isLoaded } = useUser()
  const [activeTab, setActiveTab] = useState('profil')
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [schoolLevel, setSchoolLevel] = useState('Terminale C')
  const [region, setRegion] = useState('Antananarivo')
  const [schoolName, setSchoolName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [emailCode, setEmailCode] = useState('')
  const [pendingEmail, setPendingEmail] = useState<any>(null)
  const [emailBusy, setEmailBusy] = useState(false)
  const [emailMessage, setEmailMessage] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [nextPassword, setNextPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordBusy, setPasswordBusy] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')

  if (!isLoaded) return null

  useEffect(() => {
    if (!user) return
    setFirstName(user.firstName || '')
    setLastName(user.lastName || '')
    const meta = (user.unsafeMetadata || {}) as Record<string, unknown>
    setPhone(typeof meta.phone === 'string' ? meta.phone : '')
    setSchoolLevel(typeof meta.schoolLevel === 'string' ? meta.schoolLevel : 'Terminale C')
    setRegion(typeof meta.region === 'string' ? meta.region : 'Antananarivo')
    setSchoolName(typeof meta.schoolName === 'string' ? meta.schoolName : '')
  }, [user])

  const handleSaveProfile = async () => {
    if (!user) return
    setIsSaving(true)
    try {
      await user.update({
        firstName,
        lastName,
        unsafeMetadata: {
          ...(user.unsafeMetadata || {}),
          phone,
          schoolLevel,
          region,
          schoolName,
        },
      })
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2500)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarChange = async (file: File | null) => {
    if (!user || !file) return
    setIsUploading(true)
    try {
      await user.setProfileImage({ file })
      await user.reload()
    } finally {
      setIsUploading(false)
    }
  }

  const handleStartEmailChange = async () => {
    if (!user || !newEmail.trim()) return
    setEmailBusy(true)
    setEmailMessage('')
    try {
      const created = await user.createEmailAddress({ email: newEmail.trim() })
      await created.prepareVerification({ strategy: 'email_code' })
      setPendingEmail(created)
      setEmailMessage('Code envoyé. Vérifie ta boîte mail puis saisis le code.')
    } catch (error) {
      setEmailMessage(extractClerkErrorMessage(error, "Impossible d'envoyer le code. Vérifie l'adresse email."))
    } finally {
      setEmailBusy(false)
    }
  }

  const handleVerifyEmailCode = async () => {
    if (!user || !pendingEmail || !emailCode.trim()) return
    setEmailBusy(true)
    setEmailMessage('')
    try {
      const verified = await pendingEmail.attemptVerification({ code: emailCode.trim() })
      if (verified.verification?.status === 'verified') {
        await user.setPrimaryEmailAddress?.({ emailAddressId: pendingEmail.id })
        await user.reload()
        setPendingEmail(null)
        setEmailCode('')
        setNewEmail('')
        setEmailMessage('Email principal mis à jour avec succès.')
      } else {
        setEmailMessage('Code invalide. Réessaie.')
      }
    } catch (error) {
      setEmailMessage(extractClerkErrorMessage(error, 'Vérification échouée. Réessaie.'))
    } finally {
      setEmailBusy(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!user) return
    setPasswordMessage('')
    if (!currentPassword || !nextPassword) {
      setPasswordMessage('Renseigne les champs mot de passe.')
      return
    }
    if (nextPassword !== confirmPassword) {
      setPasswordMessage('La confirmation ne correspond pas.')
      return
    }
    if (nextPassword.length < 8) {
      setPasswordMessage('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    setPasswordBusy(true)
    try {
      if (user.updatePassword) {
        await user.updatePassword({
          currentPassword,
          newPassword: nextPassword,
          signOutOfOtherSessions: false,
        })
      } else {
        await user.setPassword?.({
          currentPassword,
          newPassword: nextPassword,
          signOutOfOtherSessions: false,
        })
      }
      setCurrentPassword('')
      setNextPassword('')
      setConfirmPassword('')
      setPasswordMessage('Mot de passe mis à jour.')
    } catch (error) {
      setPasswordMessage(extractClerkErrorMessage(error, 'Impossible de changer le mot de passe.'))
    } finally {
      setPasswordBusy(false)
    }
  }

  const passwordRules = [
    { label: 'Au moins 8 caractères', ok: nextPassword.length >= 8 },
    { label: 'Au moins une lettre majuscule', ok: /[A-Z]/.test(nextPassword) },
    { label: 'Au moins une lettre minuscule', ok: /[a-z]/.test(nextPassword) },
    { label: 'Au moins un chiffre', ok: /\d/.test(nextPassword) },
    { label: 'Au moins un symbole', ok: /[^A-Za-z0-9]/.test(nextPassword) },
  ]

  const tabs = [
    { id: 'profil', label: 'Infos personnelles', icon: User },
    { id: 'securite', label: 'Sécurité & Connexion', icon: Lock },
    { id: 'roles', label: 'Mes rôles', icon: Shield, badge: '1' },
    { id: 'paiement', label: 'MVola & Paiements', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Mon Compte</h1>
          <p className="text-muted text-sm mt-1">Gère tes informations, tes rôles et tes préférences Mah.AI</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass px-4 py-2 rounded-2xl border border-teal/20 flex items-center gap-2">
            <Gem className="w-4 h-4 text-teal" />
            <span className="text-sm font-bold text-teal">12 crédits</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Navigation Gauche */}
        <aside className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
                ${activeTab === tab.id 
                  ? 'bg-teal/10 text-teal border border-teal/20 shadow-lg shadow-teal/5' 
                  : 'text-muted hover:bg-white/5 hover:text-text'}
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.badge && (
                <span className="ml-auto bg-gold/20 text-gold text-[9px] font-black px-2 py-0.5 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
          
          <div className="mt-8 pt-8 border-t border-border/10">
            <div className="text-[10px] text-muted/40 font-black uppercase tracking-widest px-4 mb-4 font-mono">
              Action Critique
            </div>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose hover:bg-rose/10 transition-all">
              <Trash2 className="w-4 h-4" />
              Supprimer mon compte
            </button>
          </div>
        </aside>

        {/* Content Droite */}
        <main className="space-y-6">
          {activeTab === 'profil' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Photo & Identité */}
              <section className="glass p-8 rounded-[32px] border border-border/40 space-y-8">
                <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-border/10">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-teal/20 shadow-2xl relative">
                      <img src={user?.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Changer</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-black">{user?.fullName}</h3>
                    <p className="text-muted text-sm">{user?.primaryEmailAddress?.emailAddress}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                      <span className="px-3 py-1 bg-teal/10 text-teal text-[10px] font-bold rounded-full border border-teal/20">Étudiante</span>
                      <span className="px-3 py-1 bg-gold/10 text-gold text-[10px] font-bold rounded-full border border-gold/20">Contributrice Or</span>
                    </div>
                  </div>
                  <label className="px-6 py-2 bg-white/5 border border-border/40 hover:border-teal/30 rounded-xl text-xs font-bold transition-all cursor-pointer">
                    {isUploading ? 'Mise à jour...' : 'Modifier la photo'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleAvatarChange(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>

                {/* Formulaire */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest font-mono flex items-center gap-2">
                      <User className="w-3 h-3 text-teal" /> Prénom
                    </label>
                    <input 
                      type="text" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-white/5 border border-border/40 rounded-xl px-4 py-3 text-sm focus:border-teal/50 outline-none transition-all hover:border-border/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest font-mono flex items-center gap-2">
                      <User className="w-3 h-3 text-teal" /> Nom
                    </label>
                    <input 
                      type="text" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-white/5 border border-border/40 rounded-xl px-4 py-3 text-sm focus:border-teal/50 outline-none transition-all hover:border-border/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest font-mono flex items-center gap-2">
                      <Mail className="w-3 h-3 text-teal" /> Email
                    </label>
                    <input 
                      type="email" 
                      value={user?.primaryEmailAddress?.emailAddress} 
                      disabled
                      className="w-full bg-white/5 border border-border/40 rounded-xl px-4 py-3 text-sm opacity-50 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted uppercase tracking-widest font-mono flex items-center gap-2">
                      <Smartphone className="w-3 h-3 text-teal" /> Téléphone
                    </label>
                    <input 
                      type="text" 
                      placeholder="+261 34 XX XXX XX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white/5 border border-border/40 rounded-xl px-4 py-3 text-sm focus:border-teal/50 outline-none transition-all hover:border-border/60"
                    />
                  </div>
                </div>

                {/* Scolarité */}
                <div className="pt-8 border-t border-border/10 space-y-6">
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-teal" /> Informations Scolaires
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted uppercase tracking-widest font-mono">Niveau Scolaire</label>
                      <select
                        value={schoolLevel}
                        onChange={(e) => setSchoolLevel(e.target.value)}
                        className="w-full bg-white/5 border border-border/40 rounded-xl px-4 py-3 text-sm focus:border-teal/50 outline-none appearance-none cursor-pointer"
                      >
                        <option>Terminale C</option>
                        <option>Terminale D</option>
                        <option>Terminale A</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted uppercase tracking-widest font-mono flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-teal" /> Région
                      </label>
                      <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="w-full bg-white/5 border border-border/40 rounded-xl px-4 py-3 text-sm focus:border-teal/50 outline-none appearance-none cursor-pointer"
                      >
                        <option>Antananarivo</option>
                        <option>Toamasina</option>
                      </select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-muted uppercase tracking-widest font-mono flex items-center gap-2">
                        <School className="w-3 h-3 text-teal" /> Établissement
                      </label>
                    <input 
                      type="text" 
                      placeholder="Ton lycée ou université"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="w-full bg-white/5 border border-border/40 rounded-xl px-4 py-3 text-sm focus:border-teal/50 outline-none transition-all hover:border-border/60"
                    />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border/10 flex justify-end">
                  <button 
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className={`
                      px-8 py-3 rounded-xl text-sm font-black transition-all shadow-lg
                      ${isSaved ? 'bg-green text-bg shadow-green/20' : 'bg-teal text-bg shadow-teal/20 hover:scale-105 active:scale-95'}
                      ${isSaving ? 'opacity-70 cursor-not-allowed hover:scale-100 active:scale-100' : ''}
                    `}
                  >
                    {isSaving ? 'Sauvegarde...' : isSaved ? '✓ Sauvegardé !' : '💾 Sauvegarder les modifications'}
                  </button>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
               {/* Progression */}
               <section className="glass p-8 rounded-[32px] border border-teal/20 bg-teal/5">
                 <LevelProgress 
                    current={5104} 
                    target={7900} 
                    label="Contributeur Or" 
                    nextLevel="Platine" 
                    color="#0AFFE0"
                    accentColor="#00FF88"
                 />
               </section>

               {/* Grid Rôles */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {MOCK_ROLES.map((role) => (
                   <div key={role.id} className="glass p-6 rounded-[24px] border border-border/40 hover:border-teal/30 transition-all group">
                     <div className="flex items-center justify-between mb-4">
                       <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                         {role.icon}
                       </div>
                       <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-current ${role.status === 'active' ? 'text-green' : 'text-gold'}`}>
                         {role.status === 'active' ? 'Actif' : 'En attente'}
                       </div>
                     </div>
                     <h3 className="font-bold text-lg">{role.name}</h3>
                     <p className="text-xs text-muted mt-2 leading-relaxed">
                       {role.id === 'etudiant' ? 'Accès au catalogue, examens blancs, corrections IA.' : 'Soumettre des sujets et recevoir une commission.'}
                     </p>
                     <button className="mt-6 w-full py-2.5 bg-white/5 border border-border/40 hover:border-teal/30 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
                       Gérer le rôle
                     </button>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {activeTab === 'securite' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <section className="glass p-8 rounded-[32px] border border-border/40 space-y-4">
                <h3 className="text-lg font-black">Sécurité et gestion de compte</h3>
                <p className="text-sm text-muted">
                  Cette section est synchronisée en direct avec Clerk. Les statuts changent automatiquement selon ton compte.
                </p>
              </section>

              <section className="glass p-8 rounded-[32px] border border-border/40 space-y-5">
                <h4 className="text-sm font-black">Identité de connexion</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-border/40 rounded-2xl p-4">
                    <div className="text-[10px] font-black text-muted uppercase tracking-widest font-mono">Email principal</div>
                    <div className="text-sm font-bold mt-1">{user?.primaryEmailAddress?.emailAddress || '—'}</div>
                    <div className="text-xs mt-2 text-muted">
                      Vérification: {user?.primaryEmailAddress?.verification?.status === 'verified' ? 'Vérifié' : 'Non vérifié'}
                    </div>
                  </div>
                  <div className="bg-white/5 border border-border/40 rounded-2xl p-4">
                    <div className="text-[10px] font-black text-muted uppercase tracking-widest font-mono">Authentification à 2 facteurs</div>
                    <div className="text-sm font-bold mt-1">{user?.twoFactorEnabled ? 'Activée' : 'Désactivée'}</div>
                    <div className="text-xs mt-2 text-muted">Statut synchronisé avec Clerk.</div>
                  </div>
                </div>
              </section>

              <section className="glass p-8 rounded-[32px] border border-border/40 space-y-5">
                <h4 className="text-sm font-black">Changer l'email principal</h4>
                <div className="text-xs text-muted">Email actuel: {user?.primaryEmailAddress?.emailAddress || '—'}</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="nouvel.email@exemple.com"
                    className="md:col-span-2 w-full bg-white/5 border border-border/40 rounded-xl px-4 py-3 text-sm focus:border-teal/50 outline-none"
                  />
                  <button
                    onClick={handleStartEmailChange}
                    disabled={emailBusy}
                    className="px-4 py-3 bg-teal text-bg rounded-xl font-black text-sm disabled:opacity-60"
                  >
                    Envoyer le code
                  </button>
                </div>
                {pendingEmail && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={emailCode}
                      onChange={(e) => setEmailCode(e.target.value)}
                      placeholder="Code de vérification"
                      className="md:col-span-2 w-full bg-white/5 border border-border/40 rounded-xl px-4 py-3 text-sm focus:border-teal/50 outline-none"
                    />
                    <button
                      onClick={handleVerifyEmailCode}
                      disabled={emailBusy}
                      className="px-4 py-3 bg-white/10 text-white rounded-xl font-black text-sm border border-white/10 disabled:opacity-60"
                    >
                      Vérifier
                    </button>
                  </div>
                )}
                {emailMessage && <p className="text-xs text-muted">{emailMessage}</p>}
              </section>

              <section className="glass p-8 rounded-[32px] border border-border/40 space-y-5">
                <h4 className="text-sm font-black">Changer le mot de passe</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Mot de passe actuel"
                    className="w-full bg-white/5 border border-border/40 rounded-xl px-4 py-3 text-sm focus:border-teal/50 outline-none"
                  />
                  <input
                    type="password"
                    value={nextPassword}
                    onChange={(e) => setNextPassword(e.target.value)}
                    placeholder="Nouveau mot de passe"
                    className="w-full bg-white/5 border border-border/40 rounded-xl px-4 py-3 text-sm focus:border-teal/50 outline-none"
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmer le mot de passe"
                    className="md:col-span-2 w-full bg-white/5 border border-border/40 rounded-xl px-4 py-3 text-sm focus:border-teal/50 outline-none"
                  />
                </div>
                <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[10px] font-black text-muted uppercase tracking-widest font-mono">Règles de sécurité</div>
                  {passwordRules.map((rule) => (
                    <div key={rule.label} className={`text-xs ${rule.ok ? 'text-green' : 'text-muted'}`}>
                      {rule.ok ? '✓' : '•'} {rule.label}
                    </div>
                  ))}
                </div>
                <button
                  onClick={handlePasswordChange}
                  disabled={passwordBusy}
                  className="px-6 py-3 bg-teal text-bg rounded-xl font-black text-sm disabled:opacity-60"
                >
                  Mettre à jour le mot de passe
                </button>
                {passwordMessage && <p className="text-xs text-muted">{passwordMessage}</p>}
              </section>

              <section className="glass p-8 rounded-[32px] border border-border/40 space-y-5">
                <h4 className="text-sm font-black">Sessions et activité</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/5 border border-border/40 rounded-2xl p-4">
                    <div className="text-[10px] font-black text-muted uppercase tracking-widest font-mono">Dernière connexion</div>
                    <div className="text-sm font-bold mt-1">{user?.lastSignInAt ? new Date(user.lastSignInAt).toLocaleString('fr-FR') : '—'}</div>
                  </div>
                  <div className="bg-white/5 border border-border/40 rounded-2xl p-4">
                    <div className="text-[10px] font-black text-muted uppercase tracking-widest font-mono">Dernière activité</div>
                    <div className="text-sm font-bold mt-1">{user?.lastActiveAt ? new Date(user.lastActiveAt).toLocaleString('fr-FR') : '—'}</div>
                  </div>
                  <div className="bg-white/5 border border-border/40 rounded-2xl p-4">
                    <div className="text-[10px] font-black text-muted uppercase tracking-widest font-mono">Compte créé le</div>
                    <div className="text-sm font-bold mt-1">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '—'}</div>
                  </div>
                </div>
              </section>

              <section className="glass p-8 rounded-[32px] border border-border/40 space-y-5">
                <h4 className="text-sm font-black">Connexions externes</h4>
                {user?.externalAccounts?.length ? (
                  <div className="space-y-3">
                    {user.externalAccounts.map((account) => (
                      <div key={account.id} className="bg-white/5 border border-border/40 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold">{account.provider || 'Provider'}</div>
                          <div className="text-xs text-muted">{account.emailAddress || account.username || 'Compte lié'}</div>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-teal">Actif</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted">Aucun compte externe lié.</p>
                )}
              </section>
            </div>
          )}

          {/* Autres onglets à implémenter... */}
          {activeTab === 'paiement' && (
            <div className="glass p-12 rounded-[32px] border border-border/40 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-right-4">
              <div className="w-20 h-20 bg-teal/10 rounded-full flex items-center justify-center mb-6">
                <CreditCard className="w-10 h-10 text-teal" />
              </div>
              <h3 className="text-xl font-bold">MVola & Paiements</h3>
              <p className="text-muted text-sm mt-2 max-w-sm mb-8">
                La configuration des paiements est en cours de développement. Bientôt disponible !
              </p>
              <button className="relative overflow-hidden px-8 py-4 bg-teal text-bg font-black rounded-2xl shadow-xl shadow-teal/20 flex items-center gap-3">
                <RippleEffect color="rgba(6, 9, 16, 0.2)" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/e/e4/Mvola_logo.png" alt="MVola" className="h-4 contrast-125" />
                <span>Recharger via MVola</span>
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
               {NOTIFS_SECTIONS.map((section) => (
                 <section key={section.title} className="space-y-4">
                    <h4 className="text-[10px] font-black text-muted/40 uppercase tracking-[0.2em] font-mono px-4">{section.title}</h4>
                    <div className="space-y-2">
                      {section.items.map((item) => (
                        <div key={item.id} className="glass p-5 rounded-[22px] border border-border/40 flex items-center justify-between hover:border-teal/20 transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-teal/10 transition-colors">
                              {item.icon}
                            </div>
                            <div>
                              <div className="text-sm font-bold">{item.label}</div>
                              <div className="text-[10px] text-muted">{item.desc}</div>
                            </div>
                          </div>
                          <div className="w-10 h-5 bg-teal/20 rounded-full p-1 relative cursor-pointer shadow-inner">
                            <div className="absolute right-1 w-3 h-3 bg-teal rounded-full shadow-lg shadow-teal/50" />
                          </div>
                        </div>
                      ))}
                    </div>
                 </section>
               ))}
            </div>
          )}
        </main>
      </div>

    </div>
  )
}
