'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Pencil, Check } from 'lucide-react';
import { COMMON_SUBJECTS, STUDY_OBJECTIVES } from '@/lib/constants/profile-data';

interface TagsEditorProps {
  label: string;
  items: string[];
  availableOptions: string[];
  onSave: (newItems: string[]) => Promise<void>;
  maxDisplay?: number;
}

export function TagsEditor({
  label,
  items,
  availableOptions,
  onSave,
  maxDisplay = 20,
}: TagsEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempItems, setTempItems] = useState<string[]>(items || []);
  const [customInput, setCustomInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Synchroniser quand on entre en édition ou que items change
  useEffect(() => {
    if (!isEditing) {
      setTempItems(items || []);
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
      console.error('Erreur sauvegarde tags:', error);
    }
    setLoading(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempItems(items || []);
    setCustomInput('');
    setIsEditing(false);
  };

  return (
    <div className="tags-editor-container">
      {isEditing ? (
        <div className="tags-edit">
          <div className="tags-common">
            <span className="tags-common-label">Suggestions :</span>
            <div className="tags-common-buttons">
              {availableOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`tags-suggestion-btn ${tempItems.includes(opt) ? 'selected' : ''}`}
                  onClick={() => addItem(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div className="tags-custom">
            <input
              type="text"
              className="ir-input tags-custom-input"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustom();
                }
              }}
              placeholder="Ajouter une autre..."
            />
            <button
              type="button"
              className="tags-custom-add"
              onClick={handleAddCustom}
              disabled={!customInput.trim()}
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="tags-selected">
            <span className="tags-selected-label">Sélectionnés :</span>
            <div className="tags-selected-list">
              {tempItems.map((item) => (
                <span key={item} className="luxury-tag">
                  {item}
                  <button
                    type="button"
                    className="tag-remove"
                    onClick={() => removeItem(item)}
                    aria-label={`Supprimer ${item}`}
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              {tempItems.length === 0 && (
                <span className="luxury-tag-empty">Aucun élément sélectionné</span>
              )}
            </div>
          </div>
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
          <div className="pref-group">
            <span className="ir-label">{label}</span>
            <div className="luxury-tags">
              {(items?.length ?? 0) > 0 ? (
                items?.slice(0, maxDisplay).map((item: string) => (
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
              <Pencil size={12} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
