"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { LuxuryNavbar } from "@/components/layout/LuxuryNavbar";
import { LuxuryCursor } from "@/components/layout/LuxuryCursor";
// import { ProfileEditModal } from "@/components/modals/ProfileEditModal"; // Supprimé au profit de l'édition inline
import { AvatarUploadModal } from "@/components/modals/AvatarUploadModal";
import { ProfilePageSkeleton } from "@/components/ui/PageSkeletons";
import {
  updateCurrentUserProfileAction,
  getCurrentUserPurchasedSubjectsAction,
  getUserTransactionsAction,
  updatePaymentPreferencesAction,
  type PurchasedSubjectItem,
} from "@/actions/profile";
import { uploadAvatarAction } from "@/actions/avatar";
import "@/components/modals/Modal.css";
import "./profile.css";
import {
  MapPin,
  GraduationCap,
  Building,
  Phone,
  Calendar,
  User as UserIcon,
  BookOpen,
  Shield,
  CheckCircle,
  Info,
  Zap,
  Camera,
  X,
  PlusCircle,
  Smartphone,
  Trash2,
  Check,
  Eye,
} from "lucide-react";
import { ProfileInfoRow } from "@/components/profile/ProfileInfoRow";
import { SecurityTab, type SecuritySettings } from "@/components/profile/SecurityTab";
import { TransactionsTab } from "@/components/profile/TransactionsTab";
import { PurchasedSubjectsTab } from "@/components/profile/PurchasedSubjectsTab";

export default function ProfilePage() {
  const router = useRouter();
  const { userId, user, appUser, setAppUser, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  // Set page title
  useEffect(() => {
    document.title = "Mah.AI — Mon profil";
  }, []);
  const [saveLoading, setSaveLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "profil" | "mes-sujets" | "coffre-fort" | "securite"
  >("profil");
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [notificationTimeout, setNotificationTimeout] =
    useState<NodeJS.Timeout | null>(null);

  const [userPhones, setUserPhones] = useState<{id?: string, phone: string, provider: string}[]>([]);

  // Charger les numéros
  const loadUserPhones = async () => {
    try {
      const response = await fetch('/api/user/phones');
      if (response.ok) {
        const data = await response.json();
        setUserPhones(data);
      }
    } catch (err) {
      console.error('Erreur chargement numéros', err);
    }
  };

  const handleInlineSave = async (field: string, newValue: any) => {
    try {
      const result = await updateCurrentUserProfileAction({ [field]: newValue });
      if (result.success) {
        setNotification({ type: "success", message: `${field} mis à jour.` });
        if (appUser) setAppUser({ ...appUser, [field]: newValue });
      } else {
        setNotification({ type: "error", message: result.error || "Erreur de mise à jour" });
      }
    } catch (error) {
      setNotification({ type: "error", message: "Erreur serveur" });
    }
  };

  const handleAddPhone = async (phone: string, provider: string) => {
    if (!phone || !provider) return;

    try {
      const response = await fetch('/api/user/phones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, provider })
      });
      if (response.ok) {
        setNotification({ type: "success", message: "Numéro ajouté." });
        loadUserPhones();
      } else {
        const errorData = await response.json();
        setNotification({ type: "error", message: errorData.error || "Erreur lors de l'ajout." });
      }
    } catch (err) {
      setNotification({ type: "error", message: "Erreur serveur." });
    }
  };

  const handleDeletePhone = async (phoneId: string) => {
    if (!confirm("Supprimer ce numéro ?")) return;
    try {
      const response = await fetch(`/api/user/phones?id=${phoneId}`, { method: 'DELETE' });
      if (response.ok) {
        setNotification({ type: "success", message: "Numéro supprimé." });
        loadUserPhones();
      }
    } catch (err) {
      setNotification({ type: "error", message: "Erreur serveur." });
    }
  };

  // Auto-dismiss notification après 5 secondes
  useEffect(() => {
    if (notification) {
      // Clear any existing timeout
      if (notificationTimeout) {
        clearTimeout(notificationTimeout);
      }

      // Set new timeout
      const timeout = setTimeout(() => {
        setNotification(null);
      }, 5000);

      setNotificationTimeout(timeout);
    }

    return () => {
      if (notificationTimeout) {
        clearTimeout(notificationTimeout);
      }
    };
  }, [notification]);
  const [purchasedSubjects, setPurchasedSubjects] = useState<
    PurchasedSubjectItem[]
  >([]);
  const [purchasedSubjectsLoading, setPurchasedSubjectsLoading] =
    useState(false);
  const [purchasedSubjectsLoaded, setPurchasedSubjectsLoaded] = useState(false);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    securityTwoFactorEnabled: false,
    securityLoginAlertEnabled: true,
    securityUnknownDeviceBlock: false,
    securityRecoveryEmailEnabled: true,
    securitySessionTimeoutMinutes: 120,
  });
  // États pour masquer/afficher les informations
  const [showEmail, setShowEmail] = useState(appUser?.showEmail ?? false);
  const [showPhone, setShowPhone] = useState(appUser?.showPhone ?? false);
  const [showEtablissement, setShowEtablissement] = useState(
    appUser?.showEtablissement ?? true,
  );
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsLoaded, setTransactionsLoaded] = useState(false);
  const [mobileMoneySettings, setMobileMoneySettings] = useState({
    operator: appUser?.defaultOperator || "MVOLA",
    phoneNumber: appUser?.phone || "",
  });
  const [mobileMoneySaving, setMobileMoneySaving] = useState(false);

  // Mettre à jour mobileMoneySettings quand appUser change
  useEffect(() => {
    if (appUser) {
      setMobileMoneySettings({
        operator: appUser.defaultOperator || "MVOLA",
        phoneNumber: appUser.phone || "",
      });
    }
  }, [appUser]);

  // Gestion sauvegarde Mobile Money
  const handleMobileMoneySave = async () => {
    setMobileMoneySaving(true);
    try {
      const result = await updatePaymentPreferencesAction(mobileMoneySettings);
      if (result.success) {
        setNotification({
          type: "success",
          message: "Préférences de paiement enregistrées !",
        });
        // Mettre à jour l'état local
        if (appUser) {
          setAppUser({
            ...appUser,
            defaultOperator: mobileMoneySettings.operator,
            phone: mobileMoneySettings.phoneNumber,
          });
        }
      } else {
        setNotification({
          type: "error",
          message: result.error || "Erreur lors de la sauvegarde",
        });
      }
    } catch (error) {
      setNotification({ type: "error", message: "Erreur serveur" });
    } finally {
      setMobileMoneySaving(false);
    }
  };

  const handleAvatarChange = async (file: File) => {
    if (!userId) return;

    try {
      setSaveLoading(true);
      const result = await uploadAvatarAction(userId, file);

      if (result.success) {
        setNotification({
          type: "success",
          message: "Avatar mis à jour avec succès !",
        });
        setAvatarModalOpen(false);
        // Mettre à jour l'état local au lieu de recharger la page
        if (appUser) {
          setAppUser({ ...appUser, profilePicture: result.url });
        }
      } else {
        setNotification({
          type: "error",
          message: result.error || "Erreur lors de l'upload",
        });
      }
    } catch (error) {
      setNotification({
        type: "error",
        message: "Erreur lors de l'upload de l'avatar",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  // Fonction pour basculer la visibilité des champs
  const toggleVisibility = async (
    field: "showEmail" | "showPhone" | "showEtablissement",
  ) => {
    if (!userId) return;

    try {
      const newValue =
        field === "showEmail"
          ? !showEmail
          : field === "showPhone"
            ? !showPhone
            : !showEtablissement;

      // Mettre à jour l'état local immédiatement
      if (field === "showEmail") setShowEmail(newValue);
      if (field === "showPhone") setShowPhone(newValue);
      if (field === "showEtablissement") setShowEtablissement(newValue);

      // Mettre à jour dans la base de données
      const updateData = { [field]: newValue };
      await updateCurrentUserProfileAction(updateData);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la visibilité:", error);
    }
  };

  const loadPurchasedSubjects = async () => {
    if (purchasedSubjectsLoading) return;

    setPurchasedSubjectsLoading(true);
    try {
      const result = await getCurrentUserPurchasedSubjectsAction();
      if (result.success) {
        setPurchasedSubjects(result.data);
      } else {
        setNotification({
          type: "error",
          message:
            result.error || "Impossible de charger vos sujets débloqués.",
        });
      }
    } catch (error) {
      console.error("Erreur chargement mes sujets:", error);
      setNotification({
        type: "error",
        message: "Erreur serveur pendant le chargement de vos sujets.",
      });
    } finally {
      setPurchasedSubjectsLoading(false);
      setPurchasedSubjectsLoaded(true);
    }
  };

  const loadTransactions = async () => {
    if (transactionsLoading) return;
    setTransactionsLoading(true);
    try {
      const result = await getUserTransactionsAction();
      if (result.success) {
        setTransactions(result.data || []);
      } else {
        setNotification({
          type: "error",
          message:
            result.error || "Erreur lors du chargement des transactions.",
        });
      }
    } catch (error) {
      console.error("Erreur chargement transactions:", error);
    } finally {
      setTransactionsLoading(false);
      setTransactionsLoaded(true);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!userId) {
        router.push("/auth/login");
      } else {
        setLoading(false);
      }
    }
  }, [userId, authLoading, router]);

  useEffect(() => {
    if (!appUser) return;

    setSecuritySettings({
      securityTwoFactorEnabled: appUser.securityTwoFactorEnabled ?? false,
      securityLoginAlertEnabled: appUser.securityLoginAlertEnabled ?? true,
      securityUnknownDeviceBlock: appUser.securityUnknownDeviceBlock ?? false,
      securityRecoveryEmailEnabled:
        appUser.securityRecoveryEmailEnabled ?? true,
      securitySessionTimeoutMinutes:
        appUser.securitySessionTimeoutMinutes ?? 120,
    });
  }, [appUser]);

  useEffect(() => {
    if (activeTab === "mes-sujets" && !purchasedSubjectsLoaded) {
      loadPurchasedSubjects();
    }
    if (activeTab === "coffre-fort" && !transactionsLoaded) {
      loadTransactions();
    }
  }, [activeTab, purchasedSubjectsLoaded, transactionsLoaded]);

  if (loading || authLoading || !userId) {
    return (
      <>
        <LuxuryNavbar />
        <LuxuryCursor />
        <ProfilePageSkeleton />
      </>
    );
  }

  const handleProfileUpdate = async (data: any) => {
    setSaveLoading(true);
    try {
      // Nettoyer les données avant envoi
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(
          ([_, value]) => value !== null && value !== "",
        ),
      );

      const result = await updateCurrentUserProfileAction(cleanedData);

      if (result.success) {
        setNotification({
          type: "success",
          message: "Profil sublimé avec succès !",
        });
        // Fermeture de modale supprimée car édition inline active
        // Mettre à jour l'état local au lieu de recharger la page
        if (appUser) {
          setAppUser({ ...appUser, ...cleanedData });
        }
      } else {
        console.error("Erreur mise à jour:", result);
        const errorMsg = result.details
          ? `Validation échouée: ${JSON.stringify(result.details)}`
          : result.error || "Dissonance lors de la mise à jour";
        setNotification({ type: "error", message: errorMsg });
      }
    } catch (error) {
      console.error("Erreur exceptionnelle:", error);
      setNotification({
        type: "error",
        message:
          error instanceof Error ? error.message : "Erreur mystique du serveur",
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const calculateAge = (birthDate: string | null | undefined) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const userInitial = (
    appUser?.prenom?.charAt(0) ||
    user?.email?.charAt(0) ||
    "U"
  ).toUpperCase();

  const displayUserType = () => {
    if (appUser?.userType === "AUTRE")
      return appUser.customUserType || "Passionné";
    const types: Record<string, string> = {
      ETUDIANT: "Étudiant",
      PROFESSIONNEL: "Professionnel",
      ENSEIGNANT: "Enseignant",
      PARENT: "Parent",
    };
    return types[appUser?.userType || ""] || "Utilisateur";
  };

  // Calcul de la complétion du profil avec pondération
  const calculateProfileCompletion = () => {
    if (!appUser) return { percentage: 0, level: "Novice", nextGoal: "" };

    const fields = [
      { value: appUser.prenom, weight: 10, label: "Prénom" },
      { value: appUser.nom, weight: 10, label: "Nom" },
      { value: appUser.pseudo, weight: 5, label: "Pseudo" },
      { value: appUser.birthDate, weight: 10, label: "Date de naissance" },
      { value: appUser.phone, weight: 10, label: "Téléphone" },
      { value: appUser.region, weight: 10, label: "Région" },
      { value: appUser.district, weight: 5, label: "District" },
      { value: appUser.etablissement, weight: 10, label: "Établissement" },
      { value: appUser.educationLevel, weight: 15, label: "Niveau d'étude" },
      { value: appUser.gradeLevel, weight: 5, label: "Classe" },
      { value: appUser.bio, weight: 5, label: "Biographie" },
      {
        value: (appUser.matieresPreferees?.length ?? 0) > 0,
        weight: 5,
        label: "Matières préférées",
      },
      {
        value: (appUser.objectifsEtude?.length ?? 0) > 0,
        weight: 10,
        label: "Objectifs",
      },
    ];

    const totalWeight = fields.reduce((sum, f) => sum + f.weight, 0);
    const filledWeight = fields
      .filter(
        (f) =>
          f.value &&
          (typeof f.value === "boolean"
            ? f.value
            : String(f.value).trim() !== ""),
      )
      .reduce((sum, f) => sum + f.weight, 0);

    const percentage = Math.round((filledWeight / totalWeight) * 100);

    // Déterminer le niveau
    let level = "Novice";
    let nextGoal = "Complétez votre prénom et nom";

    if (percentage >= 90) {
      level = "Expert";
      nextGoal = "Profil complet ! 🎉";
    } else if (percentage >= 70) {
      level = "Avancé";
      nextGoal = "Plus que quelques détails pour un profil parfait";
    } else if (percentage >= 50) {
      level = "Intermédiaire";
      nextGoal = "Ajoutez vos objectifs d'étude";
    } else if (percentage >= 30) {
      level = "Débutant";
      nextGoal = "Renseignez votre niveau d'étude";
    } else if (percentage >= 10) {
      level = "Novice";
      nextGoal = "Ajoutez votre établissement scolaire";
    }

    return { percentage, level, nextGoal };
  };

  const {
    percentage: completionPercentage,
    level: completionLevel,
    nextGoal,
  } = calculateProfileCompletion();

  return (
    <div className="profile-page">
      <LuxuryCursor />
      <LuxuryNavbar />

      <main id="main-content" className="profile-container">
        {/* HEADER ARCHITECTURAL */}
        <div className="profile-header luxury-card">
          <div className="ph-left">
            <div className="ph-avatar-wrap">
              {appUser?.profilePicture ? (
                <div className="ph-avatar-image">
                  <img src={appUser.profilePicture} alt="Avatar" />
                </div>
              ) : (
                <div className="ph-avatar">
                  <span className="ph-avatar-glow"></span>
                  {userInitial}
                </div>
              )}
              <button
                className="ph-edit-btn ph-camera-btn"
                onClick={() => setAvatarModalOpen(true)}
                title="Changer l'avatar"
              >
                <Camera size={16} />
              </button>
            </div>

            <div className="ph-info">
              <div className="ph-name-wrap">
                <div className="ph-name-block">
                  <h1 className="ph-name">{appUser?.prenom}</h1>
                  <p className="ph-surname">{appUser?.nom}</p>
                </div>
                {appUser?.pseudo && (
                  <span className="ph-badge">@{appUser.pseudo}</span>
                )}
                <CheckCircle size={22} className="ph-verified-icon" />
              </div>

              <div className="ph-badges">
                <span className="ph-badge student">{displayUserType()}</span>
                {appUser?.role === "CONTRIBUTEUR" && (
                  <span className="ph-badge contrib">Contributeur Or</span>
                )}
              </div>

              {/* Barre de progression de complétion du profil */}
              <div className="ph-completion">
                <div className="ph-completion-header">
                  <span className="ph-completion-label">
                    Complétion du profil
                  </span>
                  <span
                    className={`ph-completion-level level-${completionLevel.toLowerCase()}`}
                  >
                    {completionLevel}
                  </span>
                </div>
                <div className="ph-progress-bar">
                  <div
                    className={`ph-progress-fill level-${completionLevel.toLowerCase()}`}
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <div className="ph-completion-footer">
                  <span className="ph-completion-percentage">
                    {completionPercentage}%
                  </span>
                  <span className="ph-completion-goal">{nextGoal}</span>
                </div>
              </div>

              <div className="ph-meta">
                {appUser?.region && (
                  <div className="ph-meta-item">
                    <MapPin size={12} />
                    <span>
                      {appUser.district}, {appUser.region}
                    </span>
                  </div>
                )}
                <div className="ph-meta-item">
                  <Calendar size={12} />
                  <span>
                    Membre depuis{" "}
                    {new Date(
                      appUser?.createdAt || Date.now(),
                    ).toLocaleDateString("fr-FR", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="ph-right">
            <div className="ph-stats">
              <div className="ph-stat">
                <div className="n gold-text">{appUser?.credits || 0}</div>
                <div className="l">Crédits</div>
              </div>
              <div className="ph-stat">
                <div className="n">
                  {appUser?.profilePublic ? "Oui" : "Non"}
                </div>
                <div className="l">Profil public</div>
              </div>
            </div>
            <button
              className="btn-profile-public"
              onClick={() => router.push(`/profil/${userId}`)}
            >
              <Eye size={14} /> Aperçu Public
            </button>
          </div>
        </div>

        <nav
          className="luxury-card profile-nav-tabs"
          aria-label="Navigation des sections du profil utilisateur"
        >
          <button
            type="button"
            className={`nav-tab ${activeTab === "profil" ? "active" : ""}`}
            onClick={() => setActiveTab("profil")}
          >
            <UserIcon size={14} />
            Profil
          </button>
          <button
            type="button"
            className={`nav-tab ${activeTab === "mes-sujets" ? "active" : ""}`}
            onClick={() => setActiveTab("mes-sujets")}
          >
            <BookOpen size={14} />
            Mes sujets
          </button>
          <button
            type="button"
            className={`nav-tab ${activeTab === "coffre-fort" ? "active" : ""}`}
            onClick={() => setActiveTab("coffre-fort")}
          >
            <Zap size={14} />
            Coffre-fort
          </button>
          <button
            type="button"
            className={`nav-tab ${activeTab === "securite" ? "active" : ""}`}
            onClick={() => setActiveTab("securite")}
          >
            <Shield size={14} />
            Sécurité
          </button>
        </nav>

        <div className="tabs-content">
          <div
            className={`ptab-panel ${activeTab === "profil" ? "active" : ""}`}
          >
            <div className="profile-grid">
              <div className="grid-column">
                <div className="luxury-card settings-card">
                  <div className="sc-header">
                    <h3 className="sc-title">
                      Informations <em>Personnelles</em>
                    </h3>
                    <Info size={14} className="sc-info-icon" />
                  </div>
                  <div className="info-rows">
                    <ProfileInfoRow
                      label="Pseudo"
                      field="pseudo"
                      value={appUser?.pseudo || "Non renseigné"}
                      icon={<UserIcon size={14} />}
                      showVisibilityIcon={false}
                      onSave={handleInlineSave}
                    />
                    <ProfileInfoRow
                      label="Prénom"
                      field="prenom"
                      value={appUser?.prenom || "Non renseigné"}
                      icon={<UserIcon size={14} />}
                      showVisibilityIcon={false}
                      onSave={handleInlineSave}
                    />
                    <ProfileInfoRow
                      label="Nom"
                      field="nom"
                      value={appUser?.nom || "Non renseigné"}
                      icon={<UserIcon size={14} />}
                      showVisibilityIcon={false}
                      onSave={handleInlineSave}
                    />
                    <ProfileInfoRow
                      label="Âge"
                      field="birthDate"
                      value={
                        appUser?.birthDate
                          ? `${calculateAge(appUser.birthDate)} ans`
                          : null
                      }
                      icon={<Calendar size={14} />}
                      showVisibilityIcon={false}
                      onSave={handleInlineSave}
                      type="date"
                    />
                    <ProfileInfoRow
                      label="E-mail"
                      field="email"
                      value={user?.email}
                      icon={<Shield size={14} />}
                      isPublic={showEmail}
                      showVisibilityIcon={true}
                      onToggleVisibility={() => toggleVisibility("showEmail")}
                    />
                  </div>
                </div>

                <div className="luxury-card settings-card">
                  <div className="sc-header">
                    <h3 className="sc-title">
                      Mes <em>Téléphones</em>
                    </h3>
                    <Phone size={14} className="sc-info-icon" />
                  </div>
                  <div className="telephones-container">
                    <div className="info-rows">
                      {userPhones.map((up) => (
                        <div key={up.id} className="info-row phone-row">
                          <div className="ir-label">{up.provider}</div>
                          <div className="ir-content">
                            <span className="ir-icon"><Smartphone size={14} /></span>
                            <span className="ir-value font-mono">{up.phone}</span>
                            <button 
                              className="ir-btn-delete" 
                              onClick={() => up.id && handleDeletePhone(up.id)}
                              title="Supprimer ce numéro"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="add-phone-form">
                      <div className="ap-inputs">
                        <select id="new-provider" className="ap-select">
                          <option value="MVOLA">MVola</option>
                          <option value="ORANGE">Orange</option>
                          <option value="AIRTEL">Airtel</option>
                        </select>
                        <input 
                          id="new-phone" 
                          type="text" 
                          placeholder="03X XX XXX XX" 
                          className="ap-input"
                        />
                        <button 
                          className="ap-btn"
                          onClick={() => {
                            const p = (document.getElementById('new-phone') as HTMLInputElement).value;
                            const pr = (document.getElementById('new-provider') as HTMLSelectElement).value;
                            if (p && pr) {
                              handleAddPhone(p, pr);
                              (document.getElementById('new-phone') as HTMLInputElement).value = '';
                            }
                          }}
                        >
                          <PlusCircle size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="luxury-card settings-card">
                  <div className="sc-header">
                    <h3 className="sc-title">
                      Localisation <em>& Zone</em>
                    </h3>
                    <MapPin size={14} className="sc-info-icon" />
                  </div>
                  <div className="info-rows">
                    <ProfileInfoRow
                      label="Région"
                      field="region"
                      value={appUser?.region}
                      showVisibilityIcon={false}
                      onSave={handleInlineSave}
                    />
                    <ProfileInfoRow
                      label="District"
                      field="district"
                      value={appUser?.district}
                      showVisibilityIcon={false}
                      onSave={handleInlineSave}
                    />
                  </div>
                </div>
              </div>

              <div className="grid-column">
                <div className="luxury-card settings-card">
                  <div className="sc-header">
                    <h3 className="sc-title">
                      À <em>Propos</em>
                    </h3>
                    <BookOpen size={14} className="sc-info-icon" />
                  </div>
                  <div className="bio-editing">
                    <ProfileInfoRow
                      label="Biographie"
                      field="bio"
                      value={appUser?.bio || "Aucune biographie... Cliquez pour en ajouter une."}
                      onSave={handleInlineSave}
                      type="textarea"
                    />
                  </div>
                </div>

                <div className="luxury-card settings-card">
                  <div className="sc-header">
                    <h3 className="sc-title">
                      Parcours <em>Académique</em>
                    </h3>
                    <GraduationCap size={14} className="sc-info-icon" />
                  </div>
                  <div className="info-rows">
                    <ProfileInfoRow
                      label="Établissement"
                      field="etablissement"
                      value={appUser?.etablissement}
                      icon={<Building size={14} />}
                      isPublic={appUser?.showEtablissement}
                      onSave={handleInlineSave}
                    />
                    <ProfileInfoRow
                      label="Niveau"
                      field="educationLevel"
                      value={appUser?.educationLevel}
                      showVisibilityIcon={false}
                      onSave={handleInlineSave}
                    />
                    <ProfileInfoRow
                      label="Classe / Série"
                      field="gradeLevel"
                      value={appUser?.gradeLevel}
                      showVisibilityIcon={false}
                      onSave={handleInlineSave}
                    />
                    {appUser?.filiere && (
                      <ProfileInfoRow
                        label="Filière"
                        field="filiere"
                        value={appUser.filiere}
                        icon={<BookOpen size={14} />}
                        showVisibilityIcon={false}
                        onSave={handleInlineSave}
                      />
                    )}
                  </div>
                </div>

                <div className="luxury-card settings-card">
                  <div className="sc-header">
                    <h3 className="sc-title">
                      Ambitions <em>& Goûts</em>
                    </h3>
                    <Zap size={14} className="sc-info-icon" />
                  </div>

                  <div className="pref-group">
                    <span className="ir-label">Matières préférées</span>
                    <div className="luxury-tags">
                      {(appUser?.matieresPreferees?.length ?? 0) > 0 ? (
                        appUser?.matieresPreferees?.map((m: string) => (
                          <span key={m} className="luxury-tag">
                            {m}
                          </span>
                        ))
                      ) : (
                        <span className="luxury-tag-empty">
                          Aucune matière renseignée
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pref-group mt-6">
                    <span className="ir-label">Objectifs d'étude</span>
                    <div className="luxury-tags">
                      {(appUser?.objectifsEtude?.length ?? 0) > 0 ? (
                        appUser?.objectifsEtude?.map((o: string) => (
                          <span key={o} className="luxury-tag gold">
                            {o}
                          </span>
                        ))
                      ) : (
                        <span className="luxury-tag-empty">
                          Aucun objectif renseigné
                        </span>
                      )}
                    </div>
                  </div>
                </div>


              </div>
            </div>
          </div>

          <div
            className={`ptab-panel ${activeTab === "mes-sujets" ? "active" : ""}`}
          >
            <PurchasedSubjectsTab
              subjects={purchasedSubjects}
              loading={purchasedSubjectsLoading}
            />
          </div>

          <div
            className={`ptab-panel ${activeTab === "coffre-fort" ? "active" : ""}`}
          >
            <TransactionsTab
              credits={appUser?.credits ?? 0}
              transactions={transactions}
              transactionsLoading={transactionsLoading}
              mobileMoneySettings={mobileMoneySettings}
              setMobileMoneySettings={setMobileMoneySettings}
              mobileMoneySaving={mobileMoneySaving}
              onMobileMoneySave={handleMobileMoneySave}
            />
          </div>

          <div
            className={`ptab-panel ${activeTab === "securite" ? "active" : ""}`}
          >
            <SecurityTab
              securitySettings={securitySettings}
              setSecuritySettings={setSecuritySettings}
              securitySettingsUpdatedAt={appUser?.securitySettingsUpdatedAt}
              userEmail={user?.email}
              onNotification={setNotification}
            />
          </div>
        </div>
      </main>

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className="toast-container">
          <div className={`toast ${notification.type}`}>
            <div className="toast-icon">
              {notification.type === "success" ? <Check size={18} /> : <X size={18} />}
            </div>
            <div className="toast-content">
              <div className="toast-title">
                {notification.type === "success" ? "Succès" : "Erreur"}
              </div>
              <div className="toast-msg">{notification.message}</div>
            </div>
            <button
              className="toast-close"
              onClick={() => setNotification(null)}
              aria-label="Fermer la notification"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ÉDITION INLINE ACTIVÉE - Modale supprimée */}

      {/* MODALE UPLOAD AVATAR */}
      <AvatarUploadModal
        isOpen={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        userId={userId!}
        currentAvatarUrl={appUser?.profilePicture}
        onAvatarChange={() => window.location.reload()}
        onError={(message) => setNotification({ type: "error", message })}
      />
    </div>
  );
}
