"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { completeOnboarding, skipOnboarding } from "@/actions/auth";
import { updateCurrentUserProfileAction } from "@/actions/profile";
import {
  mapAcademicProfileToOnboardingLevel,
  mapOnboardingLevelToAcademicProfile,
} from "@/lib/auth-flow";
import { useAuth } from "@/lib/hooks/useAuth";

type Step = 1 | 2 | 3 | 4;

const SUBJECT_OPTIONS = [
  "Mathématiques",
  "Physique-Chimie",
  "SVT",
  "Français",
  "Histoire-Géo",
  "Anglais",
  "Informatique",
  "Économie",
  "Autre",
] as const;

const LEVEL_OPTIONS = [
  {
    id: "bepc",
    name: "Collège (BEPC)",
    desc: "3ème · Préparation au BEPC",
    icon: "📗",
  },
  {
    id: "bac-c",
    name: "Lycée Série C",
    desc: "Terminale · BAC Scientifique",
    icon: "📘",
  },
  {
    id: "bac-ad",
    name: "Lycée Série A/D",
    desc: "Terminale · BAC Littéraire/D",
    icon: "📙",
  },
  {
    id: "sup",
    name: "Supérieur",
    desc: "Université · Grandes écoles",
    icon: "🎓",
  },
] as const;

const GOAL_OPTIONS = [
  "Réussir le BAC",
  "Améliorer mes notes",
  "Concours d'entrée",
  "Révision continue",
] as const;

interface OnboardingFlowProps {
  initialUserName?: string;
}

export function OnboardingFlow({
  initialUserName = "Étudiant",
}: OnboardingFlowProps) {
  const router = useRouter();
  const { appUser } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [selectedMats, setSelectedMats] = useState<string[]>([
    "Mathématiques",
    "Physique-Chimie",
  ]);
  const [selectedLevel, setSelectedLevel] = useState("Lycée Série C");
  const [selectedObj, setSelectedObj] = useState("Réussir le BAC");
  const [userName, setUserName] = useState(initialUserName);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!appUser) {
      return;
    }

    setUserName(appUser.prenom || initialUserName);

    if (appUser.matieresPreferees?.length) {
      setSelectedMats(appUser.matieresPreferees);
    }

    if (appUser.objectifsEtude?.length) {
      setSelectedObj(appUser.objectifsEtude[0]);
    }

    setSelectedLevel(
      mapAcademicProfileToOnboardingLevel({
        educationLevel: appUser.educationLevel,
        schoolLevel: appUser.schoolLevel,
      }),
    );
  }, [appUser, initialUserName]);

  const totalSteps = 4;
  const summarySubjects = useMemo(
    () => selectedMats.slice(0, 3).join(", "),
    [selectedMats],
  );

  const next = () => {
    if (step < totalSteps) {
      setStep((prev) => (prev + 1) as Step);
      setSaveError(null);
    }
  };

  const prev = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as Step);
      setSaveError(null);
    }
  };

  const toggleMat = (mat: string) => {
    setSelectedMats((prev) =>
      prev.includes(mat) ? prev.filter((item) => item !== mat) : [...prev, mat],
    );
  };

  const finish = async () => {
    setIsSaving(true);
    setSaveError(null);

    const academicProfile = mapOnboardingLevelToAcademicProfile(selectedLevel);
    const updateResult = await updateCurrentUserProfileAction({
      ...academicProfile,
      matieresPreferees: selectedMats,
      objectifsEtude: [selectedObj],
    });

    if (!updateResult.success) {
      setSaveError(
        updateResult.error || "Impossible d'enregistrer votre onboarding",
      );
      setIsSaving(false);
      return;
    }

    const completionResult = await completeOnboarding();

    if (!completionResult.success) {
      setSaveError(
        "L'onboarding a été enregistré, mais la finalisation a échoué",
      );
      setIsSaving(false);
      return;
    }

    router.push("/dashboard");
  };

  const handleSkip = async () => {
    setIsSaving(true);
    setSaveError(null);

    const result = await skipOnboarding();

    if (!result.success) {
      setSaveError("Impossible d'ignorer l'onboarding pour le moment");
      setIsSaving(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-12 pb-8 px-6 relative overflow-hidden bg-void auth-page">
      {/* Ambient Orbs */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      <div className="auth-wrap" style={{ maxWidth: "640px", width: "100%" }}>
        {/* Progress Steps */}
        <div className="flex gap-2 mb-8" style={{ justifyContent: "center" }}>
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-500 ${
                s < step
                  ? "w-2 bg-gold shadow-[0_0_10px_var(--gold-glow)]"
                  : s === step
                    ? "w-6 bg-gold shadow-[0_0_8px_var(--gold-glow)]"
                    : "w-2 bg-gold-dim border border-gold-line"
              }`}
            />
          ))}
        </div>

        {/* Main Card */}
        <div
          className="auth-card w-full bg-card rounded-2xl shadow-2xl relative"
          style={{
            background: "var(--card)",
            border: "1px solid var(--b1)",
            borderRadius: "var(--r-lg)",
            padding: "0",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            overflow: "visible",
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" />

          {/* Content Area */}
          <div className="p-10">
            {/* STEP 1 - Welcome */}
            {step === 1 && (
              <div className="text-center animate-in slide-in-from-right-10 duration-500">
                {/* Logo */}
                <div className="welcome-gem w-16 h-16 rounded-full bg-gradient-to-br from-gold-hi to-gold flex items-center justify-center text-2xl mb-6 mx-auto shadow-[0_0_40px_var(--gold-glow)] animate-pulse">
                  ✦
                </div>

                {/* Label */}
                <div className="ob-label text-[10px] font-mono uppercase tracking-[0.2em] text-gold flex items-center justify-center gap-4 mb-4">
                  <span className="h-px w-10 bg-gold-line"></span>
                  MahAI · Bienvenue
                  <span className="h-px w-10 bg-gold-line"></span>
                </div>

                {/* Title */}
                <h1 className="font-display text-4xl mb-4 leading-tight">
                  Bonjour,
                  <br />
                  <em className="italic text-gold">{userName}</em> !
                </h1>

                {/* Subtitle */}
                <p className="text-sm text-text-2 leading-relaxed max-w-[420px] mx-auto mb-8">
                  Votre email est confirmé. Personnalisez votre expérience pour
                  retrouver vos préférences directement dans votre profil.
                </p>

                {/* Info Cards */}
                <div className="flex flex-col gap-3 mb-8">
                  <div className="flex items-center gap-4 p-4 bg-surface border border-b2 rounded-xl text-left">
                    <div className="w-10 h-10 bg-gold-dim rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                      🎯
                    </div>
                    <div>
                      <div className="text-sm font-medium text-text mb-1">
                        Catalogue personnalisé
                      </div>
                      <div className="text-xs text-text-3">
                        Recommandations selon vos matières et votre niveau
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-surface border border-b2 rounded-xl text-left">
                    <div className="w-10 h-10 bg-sage-dim rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                      👤
                    </div>
                    <div>
                      <div className="text-sm font-medium text-text mb-1">
                        Profil déjà prérempli
                      </div>
                      <div className="text-xs text-text-3">
                        Les infos de votre inscription sont conservées pour
                        éviter la ressaisie
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-surface border border-b2 rounded-xl text-left">
                    <div className="w-10 h-10 bg-blue-dim rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                      ✦
                    </div>
                    <div>
                      <div className="text-sm font-medium text-text mb-1">
                        Correction IA illimitée
                      </div>
                      <div className="text-xs text-text-3">
                        Accédez aux corrections détaillées et expliquées par
                        l'IA
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bonus Badge */}
                <div className="bg-gold-dim border border-gold-line rounded-lg p-3 flex items-center gap-3 justify-center">
                  <span className="font-mono text-[10px] text-gold uppercase px-2 py-1 bg-gold/10 rounded">
                    🎁 Bonus
                  </span>
                  <span className="text-xs text-text-2">
                    10 crédits ont été ajoutés après validation de votre email
                  </span>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in slide-in-from-right-10 duration-500">
                <div className="ob-label text-[10px] font-mono uppercase tracking-[0.2em] text-gold flex items-center gap-4 mb-3">
                  Étape 1 · Matières
                </div>
                <h2 className="font-display text-3xl mb-2">
                  Vos <em className="italic text-gold">matières</em>
                </h2>
                <p className="text-xs text-text-3 mb-6">
                  Choisissez les matières qui doivent guider vos
                  recommandations.
                </p>

                <div className="grid grid-cols-3 gap-2 mb-6">
                  {SUBJECT_OPTIONS.map((mat) => (
                    <button
                      key={mat}
                      onClick={() => toggleMat(mat)}
                      className={`p-3 rounded-lg border transition-all text-center cursor-none ${
                        selectedMats.includes(mat)
                          ? "border-gold bg-gold-dim text-gold shadow-[0_0_0_2px_var(--gold-dim)]"
                          : "border-b2 bg-surface hover:border-gold-line"
                      }`}
                    >
                      <div className="text-xl mb-1">
                        {mat === "Mathématiques"
                          ? "📐"
                          : mat === "Physique-Chimie"
                            ? "⚗️"
                            : mat === "SVT"
                              ? "🌿"
                              : mat === "Français"
                                ? "📚"
                                : mat === "Histoire-Géo"
                                  ? "🌍"
                                  : mat === "Anglais"
                                    ? "🌐"
                                    : mat === "Informatique"
                                      ? "💻"
                                      : mat === "Économie"
                                        ? "💰"
                                        : "🎨"}
                      </div>
                      <div className="text-[10px] font-medium truncate">
                        {mat}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="text-center font-mono text-[10px] text-text-4 uppercase tracking-wider">
                  {selectedMats.length} matière
                  {selectedMats.length > 1 ? "s" : ""} sélectionnée
                  {selectedMats.length > 1 ? "s" : ""}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in slide-in-from-right-10 duration-500">
                <div className="ob-label text-[10px] font-mono uppercase tracking-[0.2em] text-gold flex items-center gap-4 mb-3">
                  Étape 2 · Profil scolaire
                </div>
                <h2 className="font-display text-3xl mb-2">
                  Votre <em className="italic text-gold">niveau</em>
                </h2>
                <p className="text-xs text-text-3 mb-6">
                  On s'en sert pour afficher les contenus les plus pertinents
                  dans tout le site.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  {LEVEL_OPTIONS.map((lvl) => (
                    <button
                      key={lvl.id}
                      onClick={() => setSelectedLevel(lvl.name)}
                      className={`p-4 rounded-xl border text-left transition-all cursor-none ${
                        selectedLevel === lvl.name
                          ? "border-gold bg-gold-dim shadow-[0_0_0_2px_var(--gold-dim)]"
                          : "border-b2 bg-surface hover:border-gold-line"
                      }`}
                    >
                      <div className="text-2xl mb-2">{lvl.icon}</div>
                      <div
                        className={`text-sm font-medium ${selectedLevel === lvl.name ? "text-gold" : ""}`}
                      >
                        {lvl.name}
                      </div>
                      <div className="text-[10px] text-text-3">{lvl.desc}</div>
                    </button>
                  ))}
                </div>

                <div className="text-[10px] font-mono uppercase text-text-4 tracking-widest mb-3">
                  Mon objectif principal
                </div>
                <div className="flex flex-wrap gap-2">
                  {GOAL_OPTIONS.map((obj) => (
                    <button
                      key={obj}
                      onClick={() => setSelectedObj(obj)}
                      className={`px-4 py-2 border rounded-full font-mono text-[10px] uppercase tracking-wider transition-all cursor-none ${
                        selectedObj === obj
                          ? "border-gold bg-gold-dim text-gold"
                          : "border-b2 bg-transparent text-text-3 hover:text-text-2 hover:border-gold-line"
                      }`}
                    >
                      {obj}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="text-center animate-in slide-in-from-right-10 duration-500">
                <div className="w-16 h-16 rounded-full bg-sage/10 border border-sage/20 flex items-center justify-center text-2xl mb-6 mx-auto animate-pop-in">
                  ✓
                </div>
                <div className="ob-label text-[10px] font-mono uppercase tracking-[0.2em] text-gold flex items-center justify-center gap-4 mb-4">
                  Profil configuré
                </div>
                <h1 className="font-display text-4xl mb-6 leading-tight">
                  Vous êtes <em className="italic text-gold">prêt·e</em> !
                </h1>

                <div className="grid grid-cols-3 gap-3 mb-8">
                  <div className="p-4 bg-surface border border-b2 rounded-xl">
                    <div className="font-display text-2xl text-gold">2 840</div>
                    <div className="text-[8px] font-mono uppercase text-text-4 tracking-widest mt-1">
                      Sujets
                    </div>
                  </div>
                  <div className="p-4 bg-surface border border-b2 rounded-xl">
                    <div className="font-display text-2xl text-gold">10</div>
                    <div className="text-[8px] font-mono uppercase text-text-4 tracking-widest mt-1">
                      Crédits
                    </div>
                  </div>
                  <div className="p-4 bg-surface border border-b2 rounded-xl">
                    <div className="font-display text-2xl text-gold">∞</div>
                    <div className="text-[8px] font-mono uppercase text-text-4 tracking-widest mt-1">
                      IA
                    </div>
                  </div>
                </div>

                <div className="bg-gold-dim border border-gold-line rounded-xl p-5 text-left mb-8">
                  <div className="text-[9px] font-mono text-gold uppercase tracking-[0.2em] mb-3">
                    ✦ Votre profil
                  </div>
                  <div className="text-sm text-text-2 space-y-2">
                    <p>
                      Niveau :{" "}
                      <span className="text-text font-medium">
                        {selectedLevel}
                      </span>
                    </p>
                    <p>
                      Matières :{" "}
                      <span className="text-text font-medium">
                        {summarySubjects}
                      </span>
                    </p>
                    <p>
                      Objectif :{" "}
                      <span className="text-text font-medium">
                        {selectedObj}
                      </span>
                    </p>
                  </div>
                </div>

                {saveError ? (
                  <div className="mb-5 rounded-xl border border-ruby-line bg-ruby-dim px-4 py-3 text-sm text-ruby">
                    {saveError}
                  </div>
                ) : null}

                <button
                  onClick={finish}
                  disabled={isSaving}
                  className="w-full py-4 rounded-xl bg-gradient-to-br from-gold to-gold-hi text-void font-medium text-lg shadow-[0_4px_24px_rgba(201,168,76,0.3)] hover:-translate-y-1 hover:shadow-[0_8px_36px_rgba(201,168,76,0.45)] transition-all cursor-none disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {isSaving ? "Enregistrement..." : "Explorer mon catalogue →"}
                </button>
              </div>
            )}
          </div>

          {/* Navigation Footer */}
          {step < 4 && (
            <div className="px-10 py-5 bg-surface border-t border-gold-line/10 flex items-center justify-between">
              <button
                onClick={prev}
                className={`font-mono text-[10px] uppercase tracking-widest text-text-3 hover:text-gold transition-colors cursor-none ${step === 1 ? "opacity-0 pointer-events-none" : ""}`}
              >
                ← Retour
              </button>

              <div className="font-mono text-[10px] text-text-4 uppercase tracking-[0.2em]">
                0{step} / 04
              </div>

              <button
                onClick={next}
                className="px-6 py-2 rounded bg-gradient-to-br from-gold to-gold-hi text-void text-xs font-medium tracking-wide shadow-lg hover:-translate-y-px transition-all cursor-none"
              >
                {step === 1
                  ? "Commencer →"
                  : step === 3
                    ? "Voir mon profil →"
                    : "Continuer →"}
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleSkip}
          disabled={isSaving}
          className="mt-6 font-mono text-[9px] uppercase tracking-[0.3em] text-text-4 hover:text-text-2 transition-colors cursor-none disabled:opacity-60"
          style={{
            display: "block",
            margin: "1.5rem auto 0",
            textAlign: "center",
          }}
        >
          {isSaving ? "Patientez..." : "Passer la configuration →"}
        </button>
      </div>
    </div>
  );
}
