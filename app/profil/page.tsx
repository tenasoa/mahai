"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { LuxuryNavbar } from "@/components/layout/LuxuryNavbar";
import { LuxuryCursor } from "@/components/layout/LuxuryCursor";
import { ProfileEditModal } from "@/components/modals/ProfileEditModal";
import { AvatarUploadModal } from "@/components/modals/AvatarUploadModal";
import { ProfilePageSkeleton } from "@/components/ui/PageSkeletons";
import {
  updateCurrentUserProfileAction,
  getCurrentUserPurchasedSubjectsAction,
  updateCurrentUserSecuritySettingsAction,
  changeUserPasswordAction,
  requestPasswordChangeCodeAction,
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
  BellRing,
  Clock3,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle,
  Info,
  Zap,
  Camera,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  PlusCircle,
  Smartphone,
  CreditCard,
} from "lucide-react";

interface InfoRowProps {
  label: string;
  value: string | number | undefined | null;
  icon?: React.ReactNode;
  isPublic?: boolean;
  showVisibilityIcon?: boolean;
  onToggleVisibility?: () => void;
}

function ProfileInfoRow({
  label,
  value,
  icon,
  isPublic,
  showVisibilityIcon = true,
  onToggleVisibility,
}: InfoRowProps) {
  const isEmpty = !value || value === "";
  const displayValue = isEmpty ? "Non renseigné" : value;

  return (
    <div className={`info-row ${isEmpty ? "is-empty" : ""}`}>
      <div className="ir-label">{label}</div>
      <div className="ir-content">
        {icon && <span className="ir-icon">{icon}</span>}
        <span className="ir-value">{displayValue}</span>
      </div>
      <div className="ir-visibility-cell">
        {showVisibilityIcon && (
          <div
            className={`ir-visibility ${isPublic ? "public" : "private"}`}
            title={
              isPublic
                ? "Visible sur votre profil public"
                : "Masqué sur votre profil public"
            }
            onClick={onToggleVisibility}
            style={{ cursor: "pointer" }}
          >
            {isPublic ? <Eye size={14} /> : <EyeOff size={14} />}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { userId, user, appUser, setAppUser, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
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
  const [securitySaving, setSecuritySaving] = useState(false);
  const [securitySettings, setSecuritySettings] = useState({
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
  // États pour le changement de mot de passe
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordStep, setPasswordStep] = useState<"form" | "code">("form");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    code: "",
  });
  const [passwordChanging, setPasswordChanging] = useState(false);

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

  // Gestion du changement de mot de passe
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChanging(true);

    try {
      if (passwordStep === "form") {
        // Étape 1 : Demander le code
        const result = await requestPasswordChangeCodeAction(passwordData);
        if (result.success) {
          setNotification({
            type: "success",
            message: "Code de confirmation envoyé à votre adresse email !",
          });
          setPasswordStep("code");
        } else {
          setNotification({
            type: "error",
            message: result.error || "Erreur lors de la demande de code",
          });
        }
      } else {
        // Étape 2 : Valider le code et changer le mot de passe
        const result = await changeUserPasswordAction(passwordData);
        if (result.success) {
          setNotification({
            type: "success",
            message: "Mot de passe mis à jour avec succès !",
          });
          setPasswordModalOpen(false);
          setPasswordStep("form");
          setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
            code: "",
          });
        } else {
          setNotification({
            type: "error",
            message:
              result.error || "Code invalide ou erreur lors du changement",
          });
        }
      }
    } catch (error) {
      setNotification({ type: "error", message: "Erreur serveur" });
    } finally {
      setPasswordChanging(false);
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

  const handleSecuritySave = async () => {
    setSecuritySaving(true);
    try {
      const result =
        await updateCurrentUserSecuritySettingsAction(securitySettings);
      if (result.success) {
        setNotification({
          type: "success",
          message: "Paramètres de sécurité enregistrés.",
        });
      } else {
        setNotification({
          type: "error",
          message: result.error || "Échec de la sauvegarde des paramètres.",
        });
      }
    } catch (error) {
      console.error("Erreur sauvegarde sécurité:", error);
      setNotification({
        type: "error",
        message: "Erreur serveur pendant la sauvegarde de la sécurité.",
      });
    } finally {
      setSecuritySaving(false);
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
        setEditModalOpen(false);
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
                      value={appUser?.pseudo || "Non renseigné"}
                      icon={<UserIcon size={14} />}
                      showVisibilityIcon={false}
                    />
                    <ProfileInfoRow
                      label="Prénom"
                      value={appUser?.prenom || "Non renseigné"}
                      icon={<UserIcon size={14} />}
                      showVisibilityIcon={false}
                    />
                    <ProfileInfoRow
                      label="Nom"
                      value={appUser?.nom || "Non renseigné"}
                      icon={<UserIcon size={14} />}
                      showVisibilityIcon={false}
                    />
                    <ProfileInfoRow
                      label="Âge"
                      value={
                        appUser?.birthDate
                          ? `${calculateAge(appUser.birthDate)} ans`
                          : null
                      }
                      icon={<Calendar size={14} />}
                      showVisibilityIcon={false}
                    />
                    <ProfileInfoRow
                      label="E-mail"
                      value={user?.email}
                      icon={<Shield size={14} />}
                      isPublic={showEmail}
                      showVisibilityIcon={true}
                      onToggleVisibility={() => toggleVisibility("showEmail")}
                    />
                    <ProfileInfoRow
                      label="Téléphone"
                      value={appUser?.phone}
                      icon={<Phone size={14} />}
                      isPublic={showPhone}
                      showVisibilityIcon={true}
                      onToggleVisibility={() => toggleVisibility("showPhone")}
                    />
                  </div>
                  <div className="sc-footer">
                    <button
                      className="btn-card-action"
                      onClick={() => setEditModalOpen(true)}
                    >
                      Mettre à jour le profil
                    </button>
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
                      value={appUser?.region}
                      showVisibilityIcon={false}
                    />
                    <ProfileInfoRow
                      label="District"
                      value={appUser?.district}
                      showVisibilityIcon={false}
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
                  <div className="bio-content">
                    <p className="bio-text">
                      {appUser?.bio ||
                        "Présentez-vous en quelques lignes pour personnaliser davantage votre profil."}
                    </p>
                    <button
                      className="btn-card-action"
                      onClick={() => setEditModalOpen(true)}
                    >
                      Modifier
                    </button>
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
                      value={appUser?.etablissement}
                      icon={<Building size={14} />}
                      isPublic={appUser?.showEtablissement}
                    />
                    <ProfileInfoRow
                      label="Niveau"
                      value={appUser?.educationLevel}
                      showVisibilityIcon={false}
                    />
                    <ProfileInfoRow
                      label="Classe / Série"
                      value={appUser?.gradeLevel}
                      showVisibilityIcon={false}
                    />
                    {appUser?.filiere && (
                      <ProfileInfoRow
                        label="Filière"
                        value={appUser.filiere}
                        icon={<BookOpen size={14} />}
                        showVisibilityIcon={false}
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
            <div className="section-header">
              <h3 className="section-title-with-icon">
                <BookOpen size={18} />
                Mes <em>Sujets</em>
              </h3>
            </div>

            {purchasedSubjectsLoading ? (
              <div className="subjects-grid">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="subject-card-skeleton">
                    <div className="subject-line w-70"></div>
                    <div className="subject-line w-45"></div>
                    <div className="subject-line w-30"></div>
                  </div>
                ))}
              </div>
            ) : purchasedSubjects.length > 0 ? (
              <>
                <div className="subjects-summary">
                  <span>
                    <strong>{purchasedSubjects.length}</strong> sujet
                    {purchasedSubjects.length > 1 ? "s" : ""} débloqué
                    {purchasedSubjects.length > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="subjects-grid">
                  {purchasedSubjects.map((subject) => (
                    <article
                      key={`${subject.id}-${subject.purchasedAt}`}
                      className="subject-card"
                    >
                      <div className="subject-card-head">
                        <span className="subject-badge">{subject.type}</span>
                        <span className="subject-credits">
                          -{subject.creditsAmount} cr
                        </span>
                      </div>
                      <h4 className="subject-title">{subject.titre}</h4>
                      <p className="subject-meta">
                        {subject.matiere} · {subject.annee}
                        {subject.serie ? ` · ${subject.serie}` : ""}
                      </p>
                      <p className="subject-date">
                        Débloqué le{" "}
                        {new Date(subject.purchasedAt).toLocaleDateString(
                          "fr-FR",
                          { day: "2-digit", month: "long", year: "numeric" },
                        )}
                      </p>
                      <button
                        className="btn-card-action mt-4"
                        onClick={() => router.push(`/sujet/${subject.id}`)}
                      >
                        Ouvrir le sujet
                      </button>
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="empty-section-title">
                  Aucun sujet débloqué pour le moment.
                </p>
                <p className="empty-section-text">
                  Quand vous achetez un sujet avec vos crédits, il apparaît
                  automatiquement ici.
                </p>
                <button
                  className="btn-card-action mt-4"
                  onClick={() => router.push("/catalogue")}
                >
                  Explorer le catalogue
                </button>
              </>
            )}
          </div>

          <div
            className={`ptab-panel ${activeTab === "coffre-fort" ? "active" : ""}`}
          >
            <div className="section-header">
              <h3 className="section-title-with-icon">
                <Zap size={18} />
                Mon <em>Coffre-fort</em>
              </h3>
            </div>

            <div className="safe-grid">
              <div className="safe-main-content">
                {/* Balance Card Luxury */}
                <div className="luxury-balance-card">
                  <div className="lbc-bg"></div>
                  <div className="lbc-header">
                    <div className="lbc-label">Solde actuel</div>
                    <Zap size={20} className="lbc-icon" />
                  </div>
                  <div className="lbc-amount">
                    {appUser?.credits ?? 0} <span>crédits</span>
                  </div>
                  <div className="lbc-footer">
                    <button
                      className="btn-lbc-action"
                      onClick={() => router.push("/recharge")}
                    >
                      <PlusCircle size={16} />
                      Recharger
                    </button>
                  </div>
                </div>

                {/* Transactions Table */}
                <div className="luxury-card settings-card safe-transactions-card">
                  <div className="sc-header">
                    <h3 className="sc-title">
                      Historique des <em>Transactions</em>
                    </h3>
                    <Clock3 size={14} className="sc-info-icon" />
                  </div>

                  {transactionsLoading ? (
                    <div className="transactions-loading">
                      Chargement de vos transactions...
                    </div>
                  ) : transactions.length > 0 ? (
                    <div className="transactions-list">
                      {transactions.map((tx) => (
                        <div key={tx.id} className="transaction-item">
                          <div
                            className={`tx-icon-wrap ${tx.type === "ACHAT" ? "spend" : "receive"}`}
                          >
                            {tx.type === "ACHAT" ? (
                              <ArrowUpRight size={16} />
                            ) : (
                              <ArrowDownLeft size={16} />
                            )}
                          </div>
                          <div className="tx-details">
                            <div className="tx-desc">
                              {tx.description ||
                                (tx.type === "ACHAT"
                                  ? "Achat de sujet"
                                  : "Recharge de crédits")}
                            </div>
                            <div className="tx-date">
                              {new Date(tx.createdAt).toLocaleDateString(
                                "fr-FR",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </div>
                            {tx.type === "RECHARGE" && tx.amount && (
                              <div
                                className="tx-payment-amount"
                                style={{
                                  fontSize: "0.7rem",
                                  color: "var(--luxury-text-muted)",
                                  marginTop: "0.2rem",
                                  fontFamily: "var(--mono)",
                                }}
                              >
                                {tx.amount} Ar
                              </div>
                            )}
                          </div>
                          <div
                            className={`tx-amount ${tx.type === "ACHAT" ? "minus" : "plus"}`}
                          >
                            {tx.type === "ACHAT"
                              ? `-${tx.amount} cr`
                              : `+${tx.creditsCount || tx.amount} cr`}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="transactions-empty">
                      <p>Aucune transaction enregistrée pour le moment.</p>
                      <span className="text-xs text-text-4">
                        Vos futurs achats et recharges apparaîtront ici.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="safe-sidebar-content">
                {/* Mobile Money Settings */}
                <div className="luxury-card settings-card mm-settings-card">
                  <div className="sc-header">
                    <h3 className="sc-title">
                      Mobile <em>Money</em>
                    </h3>
                    <Smartphone size={14} className="sc-info-icon" />
                  </div>
                  <div className="mm-settings-form">
                    <div className="form-group">
                      <label className="form-label">Opérateur par défaut</label>
                      <select
                        className="form-input"
                        value={mobileMoneySettings.operator}
                        onChange={(e) =>
                          setMobileMoneySettings({
                            ...mobileMoneySettings,
                            operator: e.target.value,
                          })
                        }
                      >
                        <option value="MVOLA">MVola</option>
                        <option value="ORANGE">Orange Money</option>
                        <option value="AIRTEL">Airtel Money</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Numéro de téléphone</label>
                      <input
                        type="text"
                        className="form-input"
                        value={mobileMoneySettings.phoneNumber}
                        onChange={(e) =>
                          setMobileMoneySettings({
                            ...mobileMoneySettings,
                            phoneNumber: e.target.value,
                          })
                        }
                        placeholder="034 XX XXX XX"
                      />
                    </div>
                    <button
                      className="btn-card-action"
                      onClick={handleMobileMoneySave}
                      disabled={mobileMoneySaving}
                    >
                      {mobileMoneySaving ? "Enregistrement..." : "Enregistrer"}
                    </button>
                  </div>
                </div>

                {/* Credit Perks Card */}
                <div className="luxury-card settings-card perks-card">
                  <div className="sc-header">
                    <h3 className="sc-title">
                      Avantages <em>Premium</em>
                    </h3>
                    <CreditCard size={14} className="sc-info-icon" />
                  </div>
                  <ul className="perks-list">
                    <li>
                      <CheckCircle size={12} className="perk-icon" />{" "}
                      Corrections IA illimitées
                    </li>
                    <li>
                      <CheckCircle size={12} className="perk-icon" />{" "}
                      Téléchargement PDF HD
                    </li>
                    <li>
                      <CheckCircle size={12} className="perk-icon" /> Accès
                      prioritaire 24/7
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`ptab-panel ${activeTab === "securite" ? "active" : ""}`}
          >
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
                      Recevoir un email lors d’une nouvelle connexion.
                    </div>
                  </div>
                </div>
                <label className="security-switch">
                  <input
                    type="checkbox"
                    checked={securitySettings.securityLoginAlertEnabled}
                    onChange={(event) =>
                      setSecuritySettings((previous) => ({
                        ...previous,
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
                    <div className="security-title">
                      Blocage appareil inconnu
                    </div>
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
                      setSecuritySettings((previous) => ({
                        ...previous,
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
                    <div className="security-title">
                      Authentification renforcée (2FA)
                    </div>
                    <div className="security-desc">
                      Ajoutez une protection supplémentaire à votre compte
                      lorsque cette option est activée.
                    </div>
                  </div>
                </div>
                <label className="security-switch">
                  <input
                    type="checkbox"
                    checked={securitySettings.securityTwoFactorEnabled}
                    onChange={(event) =>
                      setSecuritySettings((previous) => ({
                        ...previous,
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
                    <div className="security-title">
                      Expiration automatique de session
                    </div>
                    <div className="security-desc">
                      Déconnexion automatique après inactivité.
                    </div>
                  </div>
                </div>
                <select
                  className="security-select"
                  value={securitySettings.securitySessionTimeoutMinutes}
                  onChange={(event) =>
                    setSecuritySettings((previous) => ({
                      ...previous,
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
                      setSecuritySettings((previous) => ({
                        ...previous,
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
                {securitySaving
                  ? "Enregistrement..."
                  : "Enregistrer les paramètres sécurité"}
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
                className={`modal-overlay open`}
                onClick={() => {
                  setPasswordModalOpen(false);
                  setPasswordStep("form");
                }}
              >
                <div
                  className="modal-container password-modal"
                  style={{ maxWidth: '450px' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="modal-header">
                    <h2 className="modal-title">
                      {passwordStep === "form" ? (
                        <>
                          Changer le <em>mot de passe</em>
                        </>
                      ) : (
                        <>
                          Confirmer le <em>changement</em>
                        </>
                      )}
                    </h2>
                    <button
                      onClick={() => {
                        setPasswordModalOpen(false);
                        setPasswordStep("form");
                      }}
                      className="modal-close"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <form
                    onSubmit={handlePasswordChange}
                    className="modal-content"
                  >
                    {passwordStep === "form" ? (
                      <>
                        <div className="form-group">
                          <label className="form-label">
                            Mot de passe actuel
                          </label>
                          <input
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                currentPassword: e.target.value,
                              })
                            }
                            className="form-input"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">
                            Nouveau mot de passe
                          </label>
                          <input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                newPassword: e.target.value,
                              })
                            }
                            className="form-input"
                            placeholder="••••••••"
                            required
                            minLength={6}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">
                            Confirmer le mot de passe
                          </label>
                          <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                confirmPassword: e.target.value,
                              })
                            }
                            className="form-input"
                            placeholder="••••••••"
                            required
                            minLength={6}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          style={{ textAlign: "center", marginBottom: "1rem" }}
                        >
                          <p
                            style={{
                              fontSize: "0.85rem",
                              color: "var(--text-2)",
                              lineHeight: "1.5",
                            }}
                          >
                            Un code à 6 chiffres a été envoyé à{" "}
                            <strong>{user?.email}</strong>. Veuillez le saisir
                            ci-dessous pour valider votre nouveau mot de passe.
                          </p>
                        </div>
                        <div className="form-group">
                          <label className="form-label">
                            Code de confirmation
                          </label>
                          <input
                            type="text"
                            value={passwordData.code}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                code: e.target.value
                                  .replace(/\D/g, "")
                                  .slice(0, 6),
                              })
                            }
                            className="form-input"
                            style={{
                              textAlign: "center",
                              fontSize: "1.5rem",
                              letterSpacing: "0.5rem",
                              fontFamily: "var(--mono)",
                            }}
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
                          if (passwordStep === "code") {
                            setPasswordStep("form");
                          } else {
                            setPasswordModalOpen(false);
                          }
                        }}
                        className="btn-secondary"
                      >
                        {passwordStep === "code" ? "Retour" : "Annuler"}
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={passwordChanging}
                      >
                        {passwordChanging ? "Validation..." : "Valider"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {appUser?.securitySettingsUpdatedAt && (
              <p className="security-footnote">
                Dernière mise à jour:{" "}
                {new Date(appUser.securitySettingsUpdatedAt).toLocaleDateString(
                  "fr-FR",
                  { day: "2-digit", month: "long", year: "numeric" },
                )}
              </p>
            )}
          </div>
        </div>
      </main>

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className="toast-container">
          <div className={`toast ${notification.type}`}>
            <div className="toast-icon">
              {notification.type === "success" ? "✓" : "✕"}
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
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* MODALE D'ÉDITION */}
      <ProfileEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        userData={appUser}
        onSave={handleProfileUpdate}
        loading={saveLoading}
      />

      {/* MODALE UPLOAD AVATAR */}
      <AvatarUploadModal
        isOpen={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        userId={userId!}
        currentAvatarUrl={appUser?.profilePicture}
        onAvatarChange={() => window.location.reload()}
        onError={(message) => setNotification({ type: "error", message })}
      />

      <style jsx>{`
        .mt-6 {
          margin-top: 1.5rem;
        }
        .mb-8 {
          margin-bottom: 2rem;
        }
        .p-10 {
          padding: 3rem;
        }
        .flex-1 {
          flex: 1;
        }
        .text-rose {
          color: #ff4d4f;
        }
      `}</style>
    </div>
  );
}
