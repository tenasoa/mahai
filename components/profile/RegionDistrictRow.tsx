'use client';

import { useState, useEffect } from 'react';
import { Pencil, Check, X, MapPin } from 'lucide-react';
import { getRegions, getDistrictsByRegion } from '@/lib/data/madagascar-geo';

interface RegionDistrictRowProps {
  regionValue?: string;
  districtValue?: string;
  onSave: (field: string, newValue: any) => Promise<void>;
}

export function RegionDistrictRow({
  regionValue,
  districtValue,
  onSave,
}: RegionDistrictRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempRegion, setTempRegion] = useState(regionValue || '');
  const [tempDistrict, setTempDistrict] = useState(districtValue || '');
  const [loading, setLoading] = useState(false);
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);

  // Mettre à jour les districts quand la région change
  useEffect(() => {
    if (tempRegion) {
      setAvailableDistricts(getDistrictsByRegion(tempRegion));
    } else {
      setAvailableDistricts([]);
    }
  }, [tempRegion]);

  // Synchroniser avec les valeurs externes
  useEffect(() => {
    if (!isEditing) {
      setTempRegion(regionValue || '');
      setTempDistrict(districtValue || '');
    }
  }, [regionValue, districtValue, isEditing]);

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRegion = e.target.value;
    setTempRegion(newRegion);
    setTempDistrict(''); // Reset district quand la région change
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave('region', tempRegion);
      await onSave('district', tempDistrict);
    } catch (error) {
      console.error('Erreur sauvegarde localisation:', error);
    }
    setLoading(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempRegion(regionValue || '');
    setTempDistrict(districtValue || '');
    setIsEditing(false);
  };

  const regions = getRegions();

  return (
    <div className="region-district-container">
      {isEditing ? (
        <div className="rd-edit">
          <div className="rd-field">
            <label htmlFor="edit-region">Région</label>
            <select
              id="edit-region"
              value={tempRegion}
              onChange={handleRegionChange}
              className="ir-input"
              autoFocus
            >
              <option value="">Sélectionner une région...</option>
              {regions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="rd-field">
            <label htmlFor="edit-district">District</label>
            <select
              id="edit-district"
              value={tempDistrict}
              onChange={(e) => setTempDistrict(e.target.value)}
              className="ir-input"
              disabled={!tempRegion}
            >
              <option value="">Sélectionner un district...</option>
              {availableDistricts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
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
          <div className="info-row">
            <div className="ir-label">Région</div>
            <div className="ir-content">
              <span className="ir-icon"><MapPin size={14} /></span>
              <span className="ir-value">{regionValue || 'Non renseigné'}</span>
              <button className="ir-edit-trigger" onClick={() => setIsEditing(true)} title="Modifier">
                <Pencil size={12} />
              </button>
            </div>
          </div>
          <div className="info-row">
            <div className="ir-label">District</div>
            <div className="ir-content">
              <span className="ir-icon"><MapPin size={14} /></span>
              <span className="ir-value">{districtValue || 'Non renseigné'}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
