'use client';

import { useState, useEffect } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { COMMON_SUBJECTS, STUDY_OBJECTIVES } from '@/lib/constants/profile-data';

export interface TagsEditorProps {
  label: string;
  items: string[];
  availableOptions: string[];
  onSave: (newItems: string[]) => Promise<void>;
  maxDisplay?: number;
}

export function TagsEditor({ label, items, availableOptions, onSave, maxDisplay = 20 }: TagsEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempItems, setTempItems] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setTempItems(items || []);
      setCustomInput('');
    }
  }, [items, isEditing]);

  const addItem = (item: string) => {
    if (item && !tempItems.includes(item)) {
      setTempItems([...tempItems, item]);
    }
  };

  const removeItem = (item: string) => {
    setTempItems(tempItems.filter((i) => i !== item));
  };

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (trimmed) {
      addItem(trimmed);
      setCustomInput('');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(tempItems);
    } catch (error) {
      console.error('Save error:', error);
    }
    setLoading(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempItems(items || []);
    setCustomInput('');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="tags-edit">
        <div className="tags-common">
          <span className="tags-common-label">Suggestions :</span>
          <div className="tags-common-buttons">
            {availableOptions.map((opt) => (
              <button key={opt} type="button" className="tags-suggestion-btn" onClick={() => addItem(opt)}>
                {opt}
              </button>
            ))}
          </div>
        </div>
        <div className="tags-custom">
          <input
            className="ir-input tags-custom-input"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
            placeholder="Ajouter..."
          />
          <button type="button" className="tags-custom-add" onClick={handleAddCustom} disabled={!customInput.trim()}>
            <Plus size={14} />
          </button>
        </div>
        <div className="tags-selected">
          {tempItems.map((item) => (
            <span key={item} className="luxury-tag">
              {item}
              <button type="button" className="tag-remove" onClick={() => removeItem(item)}>
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
        <div className="ir-edit-actions">
          <button className="ir-btn ir-btn-save" onClick={handleSave} disabled={loading}>
            {loading ? <span className="loading-dots">...</span> : <Check size={14} />}
          </button>
          <button className="ir-btn ir-btn-cancel" onClick={handleCancel} disabled={loading}>
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tags-view">
      <div className="info-row">
        <div className="ir-label">{label}</div>
        <div className="ir-content">
          <div className="luxury-tags">
            {(tempItems?.length ?? 0) > 0 ? (
              tempItems?.slice(0, maxDisplay).map((item) => (
                <span key={item} className="luxury-tag">
                  {item}
                </span>
              ))
            ) : (
              <span className="luxury-tag-empty">Aucun élément renseigné</span>
            )}
          </div>
          <button
            className="ir-edit-trigger"
            onClick={() => setIsEditing(true)}
            title="Modifier"
          >
            <Pencil size={12} /> Modifier
          </button>
        </div>
      </div>
    </div>
  );
}
