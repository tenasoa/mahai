'use client'

import { useState } from 'react'
import {
  Shield,
  BellRing,
  Clock3,
  KeyRound,
  X,
} from 'lucide-react'
import {
  updateCurrentUserSecuritySettingsAction,
  changeUserPasswordAction,
  requestPasswordChangeCodeAction,
} from '@/actions/profile'

export interface SecuritySettings {
  securityLoginAlertEnabled: boolean;
  securityTwoFactorEnabled: boolean;
  securityUnknownDeviceBlock: boolean;
  securityRecoveryEmailEnabled: boolean;
  securitySessionTimeoutMinutes: number;
}

interface SecurityTabProps {
  securitySettings: SecuritySettings;
  setSecuritySettings: React.Dispatch<React.SetStateAction<SecuritySettings>>;
  securitySettingsUpdatedAt?: Date | string | null;
  userEmail?: string;
  onNotification: (notification: { type: 'success' | 'error'; message: string }) => void;
}

export function SecurityTab({
  securitySettings,
  setSecuritySettings,
  securitySettingsUpdatedAt,
  userEmail,
  onNotification,
}: SecurityTabProps) {
  const [securitySaving, setSecuritySaving] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordStep, setPasswordStep] = useState<'form' | 'code'>('form');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    code: '',
  });
  const [passwordChanging, setPasswordChanging] = useState(false);

  const handleSecuritySave = async () => {
    setSecuritySaving(true);
    try {
      const result = await updateCurrentUserSecuritySettingsAction(securitySettings);
      if (result.success) {
        onNotification({ type: 'success', message: 'Paramètres de sécurité enregistrés !' });
      } else {
        onNotification({ type: 'error', message: result.error || 'Erreur lors de la sauvegarde' });
      }
    } catch (error) {
      onNotification({ type: 'error', message: 'Erreur serveur' });
    } finally {
      setSecuritySaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChanging(true);

    try {
      if (passwordStep === 'form') {
        const result = await requestPasswordChangeCodeAction(passwordData);
        if (result.success) {
          onNotification({ type: 'success', message: 'Code de confirmation envoyé à votre adresse email !' });
          setPasswordStep('code');
        } else {
          onNotification({ type: 'error', message: result.error || 'Erreur lors de la demande de code' });
        }
      } else {
        const result = await changeUserPasswordAction(passwordData);
        if (result.success) {
          onNotification({ type: 'success', message: 'Mot de passe mis à jour avec succès !' });
          setPasswordModalOpen(false);
          setPasswordStep('form');
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '', code: '' });
        } else {
          onNotification({ type: 'error', message: result.error || 'Code invalide ou erreur lors du changement' });
        }
      }
    } catch (error) {
      onNotification({ type: 'error', message: 'Erreur serveur' });
    } finally {
      setPasswordChanging(false);
    }
  };

  return (
    <>
      <div className="section-header">
        <h3 className="section-title-with-icon">
          <Shield size={18} />
          Paramètres <em>Sécurité</em>
        </h3>
      </div>

      <div className="security-grid">
        <div className="security-card">
          <div className="security-card-head">
            <BellRing size={16} className="sc-info-icon" />
            <div>
              <div className="security-title">Alertes de connexion</div>
              <div className="security-desc">
                Recevoir un email lors d'une nouvelle connexion.
              </div>
            </div>
          </div>
          <label className="security-switch">
            <input
              type="checkbox"
              checked={securitySettings.securityLoginAlertEnabled}
              onChange={(event) =>
                setSecuritySettings((prev) => ({
                  ...prev,
                  securityLoginAlertEnabled: event.target.checked,
                }))
              }
            />
            <span>Activer</span>
          </label>
        </div>

        <div className="security-card">
          <div className="security-card-head">
            <Shield size={16} className="sc-info-icon" />
            <div>
              <div className="security-title">Blocage appareil inconnu</div>
              <div className="security-desc">
                Refuser les connexions depuis un appareil non reconnu.
              </div>
            </div>
          </div>
          <label className="security-switch">
            <input
              type="checkbox"
              checked={securitySettings.securityUnknownDeviceBlock}
              onChange={(event) =>
                setSecuritySettings((prev) => ({
                  ...prev,
                  securityUnknownDeviceBlock: event.target.checked,
                }))
              }
            />
            <span>Activer</span>
          </label>
        </div>

        <div className="security-card">
          <div className="security-card-head">
            <KeyRound size={16} className="sc-info-icon" />
            <div>
              <div className="security-title">Authentification renforcée (2FA)</div>
              <div className="security-desc">
                Ajoutez une protection supplémentaire à votre compte lorsque cette option est activée.
              </div>
            </div>
          </div>
          <label className="security-switch">
            <input
              type="checkbox"
              checked={securitySettings.securityTwoFactorEnabled}
              onChange={(event) =>
                setSecuritySettings((prev) => ({
                  ...prev,
                  securityTwoFactorEnabled: event.target.checked,
                }))
              }
            />
            <span>Activer</span>
          </label>
        </div>

        <div className="security-card">
          <div className="security-card-head">
            <Clock3 size={16} className="sc-info-icon" />
            <div>
              <div className="security-title">Expiration automatique de session</div>
              <div className="security-desc">
                Déconnexion automatique après inactivité.
              </div>
            </div>
          </div>
          <select
            className="security-select"
            value={securitySettings.securitySessionTimeoutMinutes}
            onChange={(event) =>
              setSecuritySettings((prev) => ({
                ...prev,
                securitySessionTimeoutMinutes: Number(event.target.value),
              }))
            }
          >
            <option value={30}>30 minutes</option>
            <option value={60}>1 heure</option>
            <option value={120}>2 heures</option>
            <option value={240}>4 heures</option>
          </select>
        </div>

        <div className="security-card">
          <div className="security-card-head">
            <Shield size={16} className="sc-info-icon" />
            <div>
              <div className="security-title">Récupération par email</div>
              <div className="security-desc">
                Autoriser la réinitialisation de mot de passe via email.
              </div>
            </div>
          </div>
          <label className="security-switch">
            <input
              type="checkbox"
              checked={securitySettings.securityRecoveryEmailEnabled}
              onChange={(event) =>
                setSecuritySettings((prev) => ({
                  ...prev,
                  securityRecoveryEmailEnabled: event.target.checked,
                }))
              }
            />
            <span>Activer</span>
          </label>
        </div>
      </div>

      <div className="security-actions">
        <button
          className="btn-card-action"
          onClick={handleSecuritySave}
          disabled={securitySaving}
        >
          {securitySaving ? 'Enregistrement...' : 'Enregistrer les paramètres sécurité'}
        </button>
        <button
          className="btn-card-action ghost"
          onClick={() => setPasswordModalOpen(true)}
        >
          Changer le mot de passe
        </button>
      </div>

      {/* Modal Changement de mot de passe */}
      {passwordModalOpen && (
        <div
          className="modal-overlay open"
          onClick={() => {
            setPasswordModalOpen(false);
            setPasswordStep('form');
          }}
        >
          <div
            className="modal-container password-modal"
            style={{ maxWidth: '450px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">
                {passwordStep === 'form' ? (
                  <>Changer le <em>mot de passe</em></>
                ) : (
                  <>Confirmer le <em>changement</em></>
                )}
              </h2>
              <button
                onClick={() => {
                  setPasswordModalOpen(false);
                  setPasswordStep('form');
                }}
                className="modal-close"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handlePasswordChange} className="modal-content">
              {passwordStep === 'form' ? (
                <>
                  <div className="form-group">
                    <label className="form-label">Mot de passe actuel</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="form-input"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nouveau mot de passe</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="form-input"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirmer le mot de passe</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="form-input"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-2)', lineHeight: '1.5' }}>
                      Un code à 6 chiffres a été envoyé à{' '}
                      <strong>{userEmail}</strong>. Veuillez le saisir ci-dessous pour valider votre nouveau mot de passe.
                    </p>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Code de confirmation</label>
                    <input
                      type="text"
                      value={passwordData.code}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          code: e.target.value.replace(/\D/g, '').slice(0, 6),
                        })
                      }
                      className="form-input"
                      style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem', fontFamily: 'var(--mono)' }}
                      placeholder="000000"
                      required
                      maxLength={6}
                    />
                  </div>
                </>
              )}

              <div className="modal-footer password-modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    if (passwordStep === 'code') {
                      setPasswordStep('form');
                    } else {
                      setPasswordModalOpen(false);
                    }
                  }}
                  className="btn-secondary"
                >
                  {passwordStep === 'code' ? 'Retour' : 'Annuler'}
                </button>
                <button type="submit" className="btn-primary" disabled={passwordChanging}>
                  {passwordChanging ? 'Validation...' : 'Valider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {securitySettingsUpdatedAt && (
        <p className="security-footnote">
          Dernière mise à jour:{' '}
          {new Date(securitySettingsUpdatedAt).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      )}
    </>
  );
}
