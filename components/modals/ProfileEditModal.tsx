"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { X, User, MapPin, GraduationCap, Phone, Building, BookOpen } from 'lucide-react'
import { MADAGASCAR_REGIONS, getDistrictsByRegion } from '@/lib/data/madagascar-geo'
import {
  USER_TYPES,
  EDUCATION_LEVELS,
  GRADE_LEVELS_MAP,
  COMMON_SUBJECTS,
  STUDY_OBJECTIVES
} from '@/lib/constants/profile-data'
import '@/components/modals/Modal.css'
import './ProfileEditModal.css'

interface ProfileEditModalProps {
  isOpen: boolean
  onClose: () => void
  userData: any
  onSave: (data: any) => void
  loading?: boolean
}

export function ProfileEditModal({ isOpen, onClose, userData, onSave, loading = false }: ProfileEditModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose(); return }
    if (e.key === 'Tab' && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (!focusable.length) return
      const first = focusable[0], last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    setTimeout(() => { modalRef.current?.querySelector<HTMLElement>('button, input')?.focus() }, 0)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  const [formData, setFormData] = useState({
    // Informations personnelles - TOUT pré-rempli avec les données existantes
    prenom: userData?.prenom || '',
    nom: userData?.nom || '',
    pseudo: userData?.pseudo || '',
    userType: userData?.userType || 'ETUDIANT',
    customUserType: userData?.customUserType || '',
    birthDate: userData?.birthDate || '',
    phone: userData?.phone || '',

    // Informations académiques
    etablissement: userData?.etablissement || '',
    educationLevel: userData?.educationLevel || '',
    gradeLevel: userData?.gradeLevel || '',
    filiere: userData?.filiere || '',

    // Localisation
    region: userData?.region || '',
    district: userData?.district || '',

    // Préférences
    bio: userData?.bio || '',
    matieresPreferees: userData?.matieresPreferees || [],
    objectifsEtude: userData?.objectifsEtude || [],

    // Paramètres de confidentialité
    profilePublic: userData?.profilePublic ?? true,
    showEmail: userData?.showEmail ?? false,
    showPhone: userData?.showPhone ?? false,
    showEtablissement: userData?.showEtablissement ?? true,

    // Paramètres de notification
    notifCorrections: userData?.notifCorrections ?? true,
    notifSujets: userData?.notifSujets ?? true,
    notifPromos: userData?.notifPromos ?? false,
    notifRappels: userData?.notifRappels ?? true
  })

  const [availableDistricts, setAvailableDistricts] = useState<string[]>([])
  const [availableGrades, setAvailableGrades] = useState<{value: string, label: string}[]>([])

  // Mettre à jour formData quand userData change (à l'ouverture du modal)
  useEffect(() => {
    if (userData && isOpen) {
      setFormData({
        // Informations personnelles
        prenom: userData?.prenom || '',
        nom: userData?.nom || '',
        pseudo: userData?.pseudo || '',
        userType: userData?.userType || 'ETUDIANT',
        customUserType: userData?.customUserType || '',
        birthDate: userData?.birthDate || '',
        phone: userData?.phone || '',

        // Informations académiques
        etablissement: userData?.etablissement || '',
        educationLevel: userData?.educationLevel || '',
        gradeLevel: userData?.gradeLevel || '',
        filiere: userData?.filiere || '',

        // Localisation
        region: userData?.region || '',
        district: userData?.district || '',

        // Préférences
        bio: userData?.bio || '',
        matieresPreferees: userData?.matieresPreferees || [],
        objectifsEtude: userData?.objectifsEtude || [],

        // Paramètres de confidentialité
        profilePublic: userData?.profilePublic ?? true,
        showEmail: userData?.showEmail ?? false,
        showPhone: userData?.showPhone ?? false,
        showEtablissement: userData?.showEtablissement ?? true,

        // Paramètres de notification
        notifCorrections: userData?.notifCorrections ?? true,
        notifSujets: userData?.notifSujets ?? true,
        notifPromos: userData?.notifPromos ?? false,
        notifRappels: userData?.notifRappels ?? true
      })
    }
  }, [userData, isOpen])

  // Mettre à jour les districts quand la région change
  useEffect(() => {
    if (formData.region) {
      setAvailableDistricts(getDistrictsByRegion(formData.region))
    } else {
      setAvailableDistricts([])
    }
  }, [formData.region])

  // Mettre à jour les classes quand le niveau d'étude change
  useEffect(() => {
    if (formData.educationLevel) {
      setAvailableGrades(GRADE_LEVELS_MAP[formData.educationLevel as keyof typeof GRADE_LEVELS_MAP] || [])
    } else {
      setAvailableGrades([])
    }
  }, [formData.educationLevel])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const addSubject = (subject: string) => {
    if (!formData.matieresPreferees.includes(subject)) {
      setFormData(prev => ({
        ...prev,
        matieresPreferees: [...prev.matieresPreferees, subject]
      }))
    }
  }

  const removeSubject = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      matieresPreferees: prev.matieresPreferees.filter((s: string) => s !== subject)
    }))
  }

  const addObjective = (objective: string) => {
    if (!formData.objectifsEtude.includes(objective)) {
      setFormData(prev => ({
        ...prev,
        objectifsEtude: [...prev.objectifsEtude, objective]
      }))
    }
  }

  const removeObjective = (objective: string) => {
    setFormData(prev => ({
      ...prev,
      objectifsEtude: prev.objectifsEtude.filter((o: string) => o !== objective)
    }))
  }

  if (!isOpen) return null

  const isHigherEd = ['UNIVERSITE', 'FACULTE', 'INSTITUT', 'FORMATION'].includes(formData.educationLevel);

  return (
    <div
      className={`modal-overlay ${isOpen ? 'open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-edit-title"
    >
      <div ref={modalRef} className="modal-container profile-edit-modal">
        <div className="modal-header">
          <h2 id="profile-edit-title" className="modal-title">Compléter mon profil</h2>
          <button onClick={onClose} className="modal-close" aria-label="Fermer">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-content">
          <div className="modal-sections">
            {/* Informations personnelles */}
            <div className="modal-section">
              <h3 className="section-title">
                <User size={18} />
                Identité & Type
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Prénom</label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Votre prénom"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nom</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Votre nom de famille"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Pseudo</label>
                  <input
                    type="text"
                    name="pseudo"
                    value={formData.pseudo}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Ex: Jean, Jiko, ..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date de naissance</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Informations académiques */}
            <div className="modal-section">
              <h3 className="section-title">
                <GraduationCap size={18} />
                Parcours Académique
              </h3>
              
              <div className="form-group">
                <label className="form-label">
                  <Building size={16} style={{ display: 'inline', marginRight: '8px' }} />
                  Établissement (Nom)
                </label>
                <input
                  type="text"
                  name="etablissement"
                  value={formData.etablissement}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Ex: LMA, UGM, ISPM..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Niveau</label>
                  <select 
                    name="educationLevel" 
                    value={formData.educationLevel}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">Sélectionner</option>
                    {EDUCATION_LEVELS.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Classe</label>
                  <select 
                    name="gradeLevel" 
                    value={formData.gradeLevel}
                    onChange={handleChange}
                    className="form-select"
                    disabled={!formData.educationLevel}
                  >
                    <option value="">Sélectionner</option>
                    {availableGrades.map(grade => (
                      <option key={grade.value} value={grade.value}>
                        {grade.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isHigherEd && (
                <div className="form-group">
                  <label className="form-label">Filière / Mention</label>
                  <input
                    type="text"
                    name="filiere"
                    value={formData.filiere}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Ex: Gestion, Informatique, Médecine..."
                  />
                </div>
              )}
            </div>

            {/* Localisation */}
            <div className="modal-section">
              <h3 className="section-title">
                <MapPin size={18} />
                Localisation (Madagascar)
              </h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Région</label>
                  <select 
                    name="region" 
                    value={formData.region}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">Sélectionner la région</option>
                    {MADAGASCAR_REGIONS.map(region => (
                      <option key={region.name} value={region.name}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">District</label>
                  <select 
                    name="district" 
                    value={formData.district}
                    onChange={handleChange}
                    className="form-select"
                    disabled={!formData.region}
                  >
                    <option value="">Sélectionner le district</option>
                    {availableDistricts.map(district => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Préférences */}
            <div className="modal-section">
              <h3 className="section-title">
                <BookOpen size={18} />
                À Propos & Biographie
              </h3>

              <div className="form-group">
                <label className="form-label">Biographie</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="form-textarea"
                  placeholder="Parlez-nous de vous, de vos passions, de vos objectifs..."
                  rows={4}
                />
              </div>

              <h3 className="section-title" style={{ marginTop: '1.5rem' }}>
                <BookOpen size={18} />
                Objectifs & Matières
              </h3>
              
              <div className="form-group">
                <label className="form-label">Matières de prédilection</label>
                <div className="tag-input-container">
                  <div className="selected-tags">
                    {formData.matieresPreferees.map((subject: string) => (
                      <span key={subject} className="tag">
                        {subject}
                        <button type="button" onClick={() => removeSubject(subject)} className="tag-remove" aria-label={`Supprimer ${subject}`}>×</button>
                      </span>
                    ))}
                  </div>
                  <div className="custom-add-group" style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      list="common-subjects"
                      placeholder="Ex: SVT, Philosophie, Informatique..."
                      className="form-input"
                      id="custom-subject-input"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = e.currentTarget.value.trim();
                          if (val && !formData.matieresPreferees.includes(val)) {
                            addSubject(val);
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                    <datalist id="common-subjects">
                      {COMMON_SUBJECTS.filter(subject => !formData.matieresPreferees.includes(subject)).map(subject => (
                        <option key={subject} value={subject} />
                      ))}
                    </datalist>
                    <button 
                      type="button" 
                      className="btn-add-inline"
                      onClick={() => {
                        const input = document.getElementById('custom-subject-input') as HTMLInputElement;
                        if (input) {
                          const val = input.value.trim();
                          if (val && !formData.matieresPreferees.includes(val)) {
                            addSubject(val);
                            input.value = '';
                          }
                        }
                      }}
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Vos objectifs</label>
                <div className="tag-input-container">
                  <div className="selected-tags">
                    {formData.objectifsEtude.map((objective: string) => (
                      <span key={objective} className="tag">
                        {objective}
                        <button type="button" onClick={() => removeObjective(objective)} className="tag-remove" aria-label={`Supprimer ${objective}`}>×</button>
                      </span>
                    ))}
                  </div>
                  <select 
                    onChange={(e) => {
                      if (e.target.value) {
                        addObjective(e.target.value)
                        e.target.value = ''
                      }
                    }}
                    className="form-select"
                  >
                    <option value="">Ajouter un objectif...</option>
                    {STUDY_OBJECTIVES.filter(objective => !formData.objectifsEtude.includes(objective)).map(objective => (
                      <option key={objective} value={objective}>{objective}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Confidentialité */}
            <div className="modal-section">
              <h3 className="section-title">Visibilité du profil</h3>
              
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="profilePublic"
                    checked={formData.profilePublic}
                    onChange={handleChange}
                  />
                  <span className="checkbox-text">Rendre mon profil public (accessible via lien)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer mon profil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
