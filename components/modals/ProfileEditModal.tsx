"use client"

import { useState, useEffect } from 'react'
import { X, User, MapPin, GraduationCap, Calendar, Phone, Building, BookOpen } from 'lucide-react'
import { 
  madagascarRegions, 
  getDistrictsByRegion, 
  educationLevels, 
  gradeLevels, 
  bacSeries,
  userTypes,
  commonSubjects,
  studyObjectives
} from '@/data/madagascar-regions-districts'

interface ProfileEditModalProps {
  isOpen: boolean
  onClose: () => void
  userData: any
  onSave: (data: any) => void
  loading?: boolean
}

export function ProfileEditModal({ isOpen, onClose, userData, onSave, loading = false }: ProfileEditModalProps) {
  const [formData, setFormData] = useState({
    // Personal Information
    userType: userData?.userType || 'ETUDIANT',
    customUserType: userData?.customUserType || '',
    age: userData?.age || '',
    dateNaissance: userData?.dateNaissance || '',
    phone: userData?.phone || '',
    
    // Educational Information
    etablissement: userData?.etablissement || '',
    educationLevel: userData?.educationLevel || '',
    gradeLevel: userData?.gradeLevel || '',
    filiere: userData?.filiere || '',
    
    // Location
    region: userData?.region || '',
    district: userData?.district || '',
    
    // Preferences
    bio: userData?.bio || '',
    matieresPreferees: userData?.matieresPreferees || [],
    objectifsEtude: userData?.objectifsEtude || [],
    
    // Privacy Settings
    profilePublic: userData?.profilePublic ?? true,
    showEmail: userData?.showEmail ?? false,
    showPhone: userData?.showPhone ?? false,
    showEtablissement: userData?.showEtablissement ?? true,
    
    // Notification Settings
    notifCorrections: userData?.notifCorrections ?? true,
    notifSujets: userData?.notifSujets ?? true,
    notifPromos: userData?.notifPromos ?? false,
    notifRappels: userData?.notifRappels ?? true
  })

  const [availableDistricts, setAvailableDistricts] = useState<any[]>([])
  const [availableGrades, setAvailableGrades] = useState<any[]>([])

  // Update districts when region changes
  useEffect(() => {
    if (formData.region) {
      setAvailableDistricts(getDistrictsByRegion(formData.region))
    } else {
      setAvailableDistricts([])
    }
  }, [formData.region])

  // Update grades when education level changes
  useEffect(() => {
    if (formData.educationLevel) {
      setAvailableGrades(gradeLevels[formData.educationLevel as keyof typeof gradeLevels] || [])
    } else {
      setAvailableGrades([])
    }
  }, [formData.educationLevel])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else if (type === 'select-multiple') {
      const selectedOptions = Array.from((e.target as HTMLSelectElement).selectedOptions, option => option.value)
      setFormData(prev => ({ ...prev, [name]: selectedOptions }))
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

  return (
    <div className="modal-overlay">
      <div className="modal-container profile-edit-modal">
        <div className="modal-header">
          <h2 className="modal-title">Modifier mon profil</h2>
          <button onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-content">
          <div className="modal-sections">
            {/* Personal Information */}
            <div className="modal-section">
              <h3 className="section-title">
                <User size={18} />
                Informations personnelles
              </h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Type d'utilisateur</label>
                  <select 
                    name="userType" 
                    value={formData.userType}
                    onChange={handleChange}
                    className="form-select"
                  >
                    {userTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {formData.userType === 'AUTRE' && (
                  <div className="form-group">
                    <label className="form-label">Précisez</label>
                    <input
                      type="text"
                      name="customUserType"
                      value={formData.customUserType}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Décrivez votre type"
                    />
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Âge</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="form-input"
                    min="13"
                    max="100"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Date de naissance</label>
                  <input
                    type="date"
                    name="dateNaissance"
                    value={formData.dateNaissance}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Phone size={16} style={{ display: 'inline', marginRight: '8px' }} />
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="+261 34 XX XXX XX"
                />
              </div>
            </div>

            {/* Educational Information */}
            <div className="modal-section">
              <h3 className="section-title">
                <GraduationCap size={18} />
                Informations académiques
              </h3>
              
              <div className="form-group">
                <label className="form-label">
                  <Building size={16} style={{ display: 'inline', marginRight: '8px' }} />
                  Établissement
                </label>
                <input
                  type="text"
                  name="etablissement"
                  value={formData.etablissement}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Nom de votre établissement"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Niveau d'études</label>
                  <select 
                    name="educationLevel" 
                    value={formData.educationLevel}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">Sélectionner un niveau</option>
                    {educationLevels.map(level => (
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
                    <option value="">Sélectionner une classe</option>
                    {availableGrades.map(grade => (
                      <option key={grade.value} value={grade.value}>
                        {grade.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {(formData.educationLevel === 'UNIVERSITE' || formData.gradeLevel?.includes('TERMINALE')) && (
                <div className="form-group">
                  <label className="form-label">Filière</label>
                  <input
                    type="text"
                    name="filiere"
                    value={formData.filiere}
                    onChange={handleChange}
                    className="form-input"
                    placeholder={formData.educationLevel === 'UNIVERSITE' ? 'Ex: Informatique, Droit, Médecine...' : 'Ex: Série D, C, A...'}
                  />
                </div>
              )}
            </div>

            {/* Location Information */}
            <div className="modal-section">
              <h3 className="section-title">
                <MapPin size={18} />
                Localisation
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
                    <option value="">Sélectionner une région</option>
                    {madagascarRegions.map(region => (
                      <option key={region.code} value={region.name}>
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
                    <option value="">Sélectionner un district</option>
                    {availableDistricts.map(district => (
                      <option key={district.code} value={district.name}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="modal-section">
              <h3 className="section-title">
                <BookOpen size={18} />
                Préférences d'apprentissage
              </h3>
              
              <div className="form-group">
                <label className="form-label">Biographie</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="form-textarea"
                  rows={3}
                  placeholder="Parlez-nous de vous..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Matières préférées</label>
                <div className="tag-input-container">
                  <div className="selected-tags">
                    {formData.matieresPreferees.map((subject: string) => (
                      <span key={subject} className="tag">
                        {subject}
                        <button type="button" onClick={() => removeSubject(subject)} className="tag-remove">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <select 
                    onChange={(e) => {
                      if (e.target.value) {
                        addSubject(e.target.value)
                        e.target.value = ''
                      }
                    }}
                    className="form-select"
                  >
                    <option value="">Ajouter une matière...</option>
                    {commonSubjects.filter(subject => !formData.matieresPreferees.includes(subject)).map(subject => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Objectifs d'étude</label>
                <div className="tag-input-container">
                  <div className="selected-tags">
                    {formData.objectifsEtude.map((objective: string) => (
                      <span key={objective} className="tag">
                        {objective}
                        <button type="button" onClick={() => removeObjective(objective)} className="tag-remove">
                          ×
                        </button>
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
                    {studyObjectives.filter(objective => !formData.objectifsEtude.includes(objective)).map(objective => (
                      <option key={objective} value={objective}>
                        {objective}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="modal-section">
              <h3 className="section-title">Confidentialité</h3>
              
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="profilePublic"
                    checked={formData.profilePublic}
                    onChange={handleChange}
                  />
                  <span className="checkbox-text">Profil public</span>
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="showEmail"
                    checked={formData.showEmail}
                    onChange={handleChange}
                  />
                  <span className="checkbox-text">Afficher mon email</span>
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="showPhone"
                    checked={formData.showPhone}
                    onChange={handleChange}
                  />
                  <span className="checkbox-text">Afficher mon téléphone</span>
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="showEtablissement"
                    checked={formData.showEtablissement}
                    onChange={handleChange}
                  />
                  <span className="checkbox-text">Afficher mon établissement</span>
                </label>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="modal-section">
              <h3 className="section-title">Notifications</h3>
              
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="notifCorrections"
                    checked={formData.notifCorrections}
                    onChange={handleChange}
                  />
                  <span className="checkbox-text">Nouvelles corrections IA</span>
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="notifSujets"
                    checked={formData.notifSujets}
                    onChange={handleChange}
                  />
                  <span className="checkbox-text">Nouveaux sujets disponibles</span>
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="notifPromos"
                    checked={formData.notifPromos}
                    onChange={handleChange}
                  />
                  <span className="checkbox-text">Offres promotionnelles</span>
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="notifRappels"
                    checked={formData.notifRappels}
                    onChange={handleChange}
                  />
                  <span className="checkbox-text">Rappels d'étude</span>
                </label>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
