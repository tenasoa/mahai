'use client';

import { useState, useEffect } from 'react';
import { Pencil, Check, X, GraduationCap } from 'lucide-react';
import { EDUCATION_LEVELS, GRADE_LEVELS_MAP } from '@/lib/constants/profile-data';

interface EducationGradeRowProps {
  educationLevelValue?: string;
  gradeLevelValue?: string;
  filiereValue?: string;
  onSave: (field: string, newValue: any) => Promise<void>;
}

export function EducationGradeRow({
  educationLevelValue,
  gradeLevelValue,
  filiereValue,
  onSave,
}: EducationGradeRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempEducationLevel, setTempEducationLevel] = useState(educationLevelValue || '');
  const [tempGradeLevel, setTempGradeLevel] = useState(gradeLevelValue || '');
  const [tempFiliere, setTempFiliere] = useState(filiereValue || '');
  const [loading, setLoading] = useState(false);
  const [availableGrades, setAvailableGrades] = useState<{ value: string; label: string }[]>([]);

  // Mettre à jour les classes quand le niveau change
  useEffect(() => {
    if (tempEducationLevel && GRADE_LEVELS_MAP[tempEducationLevel as keyof typeof GRADE_LEVELS_MAP]) {
      setAvailableGrades(GRADE_LEVELS_MAP[tempEducationLevel as keyof typeof GRADE_LEVELS_MAP]);
    } else {
      setAvailableGrades([]);
    }
  }, [tempEducationLevel]);

  // Synchroniser avec les valeurs externes
  useEffect(() => {
    if (!isEditing) {
      setTempEducationLevel(educationLevelValue || '');
      setTempGradeLevel(gradeLevelValue || '');
      setTempFiliere(filiereValue || '');
    }
  }, [educationLevelValue, gradeLevelValue, filiereValue, isEditing]);

  const handleEducationLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLevel = e.target.value;
    setTempEducationLevel(newLevel);
    setTempGradeLevel(''); // Reset grade quand le niveau change
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave('educationLevel', tempEducationLevel);
      await onSave('gradeLevel', tempGradeLevel);
      if (tempEducationLevel === 'LYCEE') {
        await onSave('filiere', tempFiliere);
      } else {
        await onSave('filiere', '');
      }
    } catch (error) {
      console.error('Erreur sauvegarde parcours académique:', error);
    }
    setLoading(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempEducationLevel(educationLevelValue || '');
    setTempGradeLevel(gradeLevelValue || '');
    setTempFiliere(filiereValue || '');
    setIsEditing(false);
  };

  const getEducationLabel = (value: string) => {
    const found = EDUCATION_LEVELS.find((l) => l.value === value);
    return found ? found.label : value;
  };

  const getGradeLabel = (value: string) => {
    const found = availableGrades.find((g) => g.value === value);
    return found ? found.label : value;
  };

  return (
    <div className="education-grade-container">
      {isEditing ? (
        <div className="ed-edit">
          <div className="ed-field">
            <label htmlFor="edit-education-level">Niveau d'étude</label>
            <select
              id="edit-education-level"
              value={tempEducationLevel}
              onChange={handleEducationLevelChange}
              className="ir-input"
              autoFocus
            >
              <option value="">Sélectionner un niveau...</option>
              {EDUCATION_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
          <div className="ed-field">
            <label htmlFor="edit-grade-level">Classe / Série</label>
            <select
              id="edit-grade-level"
              value={tempGradeLevel}
              onChange={(e) => setTempGradeLevel(e.target.value)}
              className="ir-input"
              disabled={!tempEducationLevel}
            >
              <option value="">Sélectionner une classe...</option>
              {availableGrades.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>
          {tempEducationLevel === 'LYCEE' && (
            <div className="ed-field">
              <label htmlFor="edit-filiere">Filière</label>
              <input
                id="edit-filiere"
                type="text"
                className="ir-input"
                value={tempFiliere}
                onChange={(e) => setTempFiliere(e.target.value)}
                placeholder="Générale, Technique, Professionnelle..."
              />
            </div>
          )}
          <div className="ir-edit-actions">
            <button
              className="ir-btn ir-btn-save"
              onClick={handleSave}
              disabled={loading}
              title="Valider"
            >
              {loading ? <span className="loading-dots">...</span> : <Check size={14} />}
            </button>
            <button
              className="ir-btn ir-btn-cancel"
              onClick={handleCancel}
              disabled={loading}
              title="Annuler"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="info-row">
            <div className="ir-label">Niveau d'étude</div>
            <div className="ir-content">
              <span className="ir-icon"><GraduationCap size={14} /></span>
              <span className="ir-value">{educationLevelValue ? getEducationLabel(educationLevelValue) : 'Non renseigné'}</span>
              <button className="ir-edit-trigger" onClick={() => setIsEditing(true)} title="Modifier">
                <Pencil size={12} />
              </button>
            </div>
          </div>
          <div className="info-row">
            <div className="ir-label">Classe / Série</div>
            <div className="ir-content">
              <span className="ir-icon"><GraduationCap size={14} /></span>
              <span className="ir-value">{gradeLevelValue ? getGradeLabel(gradeLevelValue) : 'Non renseigné'}</span>
            </div>
          </div>
          {filiereValue && (
            <div className="info-row">
              <div className="ir-label">Filière</div>
              <div className="ir-content">
                <span className="ir-icon"><GraduationCap size={14} /></span>
                <span className="ir-value">{filiereValue}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
