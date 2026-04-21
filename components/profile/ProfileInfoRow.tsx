'use client'

import { useState } from 'react'
import { Check, X, Pencil, Eye, EyeOff } from 'lucide-react'

export interface InfoRowProps {
  label: string;
  field: string;
  value: string | number | undefined | null;
  icon?: React.ReactNode;
  isPublic?: boolean;
  showVisibilityIcon?: boolean;
  onToggleVisibility?: () => void;
  onSave?: (field: string, newValue: any) => Promise<void>;
  type?: string;
}

export function ProfileInfoRow({
  label,
  field,
  value,
  icon,
  isPublic,
  showVisibilityIcon = true,
  onToggleVisibility,
  onSave,
  type = 'text',
}: InfoRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value || '');
  const [loading, setLoading] = useState(false);

  const isEmpty = !value || value === '';
  const displayValue = isEmpty ? 'Non renseigné' : value;

  const handleSave = async () => {
    if (onSave) {
      setLoading(true);
      await onSave(field, tempValue);
      setLoading(false);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTempValue(value || '');
    setIsEditing(false);
  };

  return (
    <div className={`info-row ${isEmpty ? 'is-empty' : ''} ${isEditing ? 'is-editing' : ''}`}>
      <div className='ir-label'>{label}</div>
      <div className='ir-content'>
        {isEditing ? (
          <div className='ir-edit-wrap'>
            <input
              type={type}
              className='ir-input'
              value={String(tempValue)}
              onChange={(e) => setTempValue(e.target.value)}
              autoFocus
              onBlur={(e) => {
                if (e.relatedTarget?.closest('.ir-edit-actions')) return;
                handleCancel();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') handleCancel();
              }}
            />
            <div className='ir-edit-actions'>
              <button className='ir-btn ir-btn-save' onClick={handleSave} disabled={loading} title='Valider'>
                {loading ? <div className='loading-dots'>...</div> : <Check size={14} />}
              </button>
              <button className='ir-btn ir-btn-cancel' onClick={handleCancel} disabled={loading} title='Annuler'>
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className='ir-value-group'>
              {icon && <span className='ir-icon'>{icon}</span>}
              <span className='ir-value'>{displayValue}</span>
            </div>
            {onSave && (
              <button className='ir-edit-trigger' onClick={() => setIsEditing(true)} title='Modifier'>
                <Pencil size={12} />
              </button>
            )}
          </>
        )}
      </div>
      <div className='ir-visibility-cell'>
        {!isEditing && showVisibilityIcon && (
          <div
            className={`ir-visibility ${isPublic ? 'public' : 'private'}`}
            title={
              isPublic
                ? 'Visible sur votre profil public'
                : 'Masqué sur votre profil public'
            }
            onClick={onToggleVisibility}
          >
            {isPublic ? <Eye size={14} /> : <EyeOff size={14} />}
          </div>
        )}
      </div>
    </div>
  );
}
