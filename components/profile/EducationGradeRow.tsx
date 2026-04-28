import { useState, useEffect } from 'react';
import { Pencil, Check, X, GraduationCap, School, BookOpen } from 'lucide-react';
import { 
  EDUCATION_LEVELS, 
  GRADE_LEVELS_MAP, 
  LYCEE_TYPES, 
  LYCEE_SERIES_GENERAL 
} from '@/lib/constants/profile-data';

interface EducationGradeRowProps {
  educationLevelValue?: string;
  gradeLevelValue?: string;
  filiereValue?: string;
  lyceeTypeValue?: string;
  onSave: (field: string, newValue: any) => Promise<void>;
}

export function EducationGradeRow({
  educationLevelValue,
  gradeLevelValue,
  filiereValue,
  lyceeTypeValue,
  onSave,
}: EducationGradeRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempEducationLevel, setTempEducationLevel] = useState(educationLevelValue || '');
  const [tempGradeLevel, setTempGradeLevel] = useState(gradeLevelValue || '');
  const [tempFiliere, setTempFiliere] = useState(filiereValue || '');
  const [tempLyceeType, setTempLyceeType] = useState(lyceeTypeValue || '');
  const [loading, setLoading] = useState(false);
  const [availableGrades, setAvailableGrades] = useState<{ value: string; label: string }[]>([]);

  // Mettre à jour les classes quand le niveau ou le type de lycée change
  useEffect(() => {
    if (!tempEducationLevel) {
      setAvailableGrades([]);
      return;
    }

    if (tempEducationLevel === 'LYCEE') {
      if (tempLyceeType === 'GENERALE') {
        setAvailableGrades(GRADE_LEVELS_MAP.LYCEE_GENERALE);
      } else if (tempLyceeType === 'TECHNIQUE') {
        setAvailableGrades(GRADE_LEVELS_MAP.LYCEE_TECHNIQUE);
      } else {
        setAvailableGrades([]);
      }
    } else if (GRADE_LEVELS_MAP[tempEducationLevel as keyof typeof GRADE_LEVELS_MAP]) {
      setAvailableGrades(GRADE_LEVELS_MAP[tempEducationLevel as keyof typeof GRADE_LEVELS_MAP]);
    } else {
      setAvailableGrades([]);
    }
  }, [tempEducationLevel, tempLyceeType]);

  // Synchroniser avec les valeurs externes
  useEffect(() => {
    if (!isEditing) {
      setTempEducationLevel(educationLevelValue || '');
      setTempGradeLevel(gradeLevelValue || '');
      setTempFiliere(filiereValue || '');
      setTempLyceeType(lyceeTypeValue || '');
    }
  }, [educationLevelValue, gradeLevelValue, filiereValue, lyceeTypeValue, isEditing]);

  const handleEducationLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLevel = e.target.value;
    setTempEducationLevel(newLevel);
    setTempGradeLevel('');
    setTempLyceeType('');
    setTempFiliere('');
  };

  const handleLyceeTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTempLyceeType(e.target.value);
    setTempGradeLevel('');
    setTempFiliere('');
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Sauvegarde séquentielle pour garantir la cohérence
      await onSave('educationLevel', tempEducationLevel);
      await onSave('lyceeType', tempLyceeType);
      await onSave('gradeLevel', tempGradeLevel);
      await onSave('filiere', tempFiliere);
      
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur sauvegarde parcours académique:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setTempEducationLevel(educationLevelValue || '');
    setTempGradeLevel(gradeLevelValue || '');
    setTempFiliere(filiereValue || '');
    setTempLyceeType(lyceeTypeValue || '');
    setIsEditing(false);
  };

  const getEducationLabel = (value: string) => {
    const found = EDUCATION_LEVELS.find((l) => l.value === value);
    return found ? found.label : value;
  };

  const getGradeLabel = (value: string) => {
    // Chercher dans toutes les catégories si nécessaire
    const allGrades = Object.values(GRADE_LEVELS_MAP).flat();
    const found = allGrades.find((g) => g.value === value);
    return found ? found.label : value;
  };

  const isLycée = tempEducationLevel === 'LYCEE';
  const isLycéeGeneral = isLycée && tempLyceeType === 'GENERALE';
  const isLycéeTechnique = isLycée && tempLyceeType === 'TECHNIQUE';
  const isSuperior = ['UNIVERSITE', 'FACULTE', 'INSTITUT', 'FORMATION'].includes(tempEducationLevel);

  return (
    <div className="education-grade-container">
      {isEditing ? (
        <div className="ed-edit luxury-card-inner">
          <div className="ed-field">
            <label className="ed-label">Niveau d'étude</label>
            <select
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

          {isLycée && (
            <div className="ed-field">
              <label className="ed-label">Type de Lycée</label>
              <select
                value={tempLyceeType}
                onChange={handleLyceeTypeChange}
                className="ir-input"
              >
                <option value="">Sélectionner le type...</option>
                {LYCEE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          )}

          {tempEducationLevel && (isLycée ? tempLyceeType : true) && (
            <div className="ed-field">
              <label className="ed-label">Classe</label>
              <select
                value={tempGradeLevel}
                onChange={(e) => setTempGradeLevel(e.target.value)}
                className="ir-input"
              >
                <option value="">Sélectionner une classe...</option>
                {availableGrades.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
          )}

          {isLycéeGeneral && (
            <div className="ed-field">
              <label className="ed-label">Série</label>
              <select
                value={tempFiliere}
                onChange={(e) => setTempFiliere(e.target.value)}
                className="ir-input"
              >
                <option value="">Sélectionner la série...</option>
                {LYCEE_SERIES_GENERAL.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          )}

          {(isLycéeTechnique || isSuperior) && (
            <div className="ed-field">
              <label className="ed-label">{isSuperior ? 'Filière / Mention' : 'Série / Spécialité'}</label>
              <input
                type="text"
                className="ir-input"
                value={tempFiliere}
                onChange={(e) => setTempFiliere(e.target.value)}
                placeholder={isSuperior ? "Ex: Gestion, Informatique..." : "Ex: OSE, Technique..."}
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
        <div className="info-rows-group">
          {/* Niveau d'étude */}
          <div className="info-row">
            <div className="ir-label">Niveau d'étude</div>
            <div className="ir-content">
              <span className="ir-icon"><School size={14} /></span>
              <span className="ir-value highlight">
                {educationLevelValue ? getEducationLabel(educationLevelValue) : 'Non renseigné'}
              </span>
              <button className="ir-edit-trigger" onClick={() => setIsEditing(true)} title="Modifier le parcours">
                <Pencil size={12} />
              </button>
            </div>
          </div>

          {/* Type de Lycée (Conditionnel) */}
          {lyceeTypeValue && (
            <div className="info-row">
              <div className="ir-label">Type de Lycée</div>
              <div className="ir-content">
                <span className="ir-icon"><School size={14} /></span>
                <span className="ir-value">
                  {lyceeTypeValue === 'GENERALE' ? 'Général' : 'Technique'}
                </span>
              </div>
            </div>
          )}

          {/* Classe */}
          {gradeLevelValue && (
            <div className="info-row">
              <div className="ir-label">Classe / Année</div>
              <div className="ir-content">
                <span className="ir-icon"><GraduationCap size={14} /></span>
                <span className="ir-value">
                  {getGradeLabel(gradeLevelValue)}
                </span>
              </div>
            </div>
          )}

          {/* Filière / Série */}
          {filiereValue && (
            <div className="info-row">
              <div className="ir-label">
                {isSuperior ? 'Filière / Mention' : 'Série / Spécialité'}
              </div>
              <div className="ir-content">
                <span className="ir-icon"><BookOpen size={14} /></span>
                <span className="ir-value">
                  {filiereValue}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
