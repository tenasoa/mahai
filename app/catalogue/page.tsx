"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LuxuryCursor } from "@/components/layout/LuxuryCursor";
import { useCatalogue } from "@/lib/hooks/useCatalogue";
import { useAuth } from "@/lib/hooks/useAuth";
import { AuthModal } from "@/components/ui/AuthModal";
import { CataloguePageSkeleton } from "@/components/ui/PageSkeletons";
import {
  PaperCard,
  ResultsBar,
  ExamTypePills,
  ActiveFilters,
} from "@/components/catalogue";
import { purchaseCurrentUserSubject } from "@/actions/user";
import "./catalogue.css";

// Types d'examens disponibles
const EXAM_TYPES = [
  { id: "BAC", label: "BAC" },
  { id: "BEPC", label: "BEPC" },
  { id: "CEPE", label: "CEPE" },
];

function CatalogueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId, appUser } = useAuth();

  // Set page title
  useEffect(() => {
    document.title = "Mah.AI — Catalogue de sujets";
  }, []);

  const isGuest = !userId;
  const guestMode = searchParams.get("guest") === "true" || isGuest;

  const pageSize = 9;
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [currentSubject, setCurrentSubject] = useState<any | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedExamType, setSelectedExamType] = useState<string | undefined>(
    undefined,
  );

  const toastIdRef = useRef(0);
  const lastToastTime = useRef<number>(0);

  const {
    subjects,
    loading,
    pagination,
    currentPage,
    setPage,
    setFilters,
    clearFilters,
    refresh,
    toggleWishlist,
    isWished,
  } = useCatalogue({
    userId: userId ?? undefined,
    pageSize,
    initialFilters: {
      sortBy: "createdAt",
      sortOrder: "desc",
    },
  });

  // Toast helper
  const showToast = (
    type: "success" | "error" | "info",
    title: string,
    msg: string,
    duration = 4000,
  ) => {
    const id = ++toastIdRef.current;
    const event = new CustomEvent("toast", {
      detail: { id, type, title, msg },
    });
    window.dispatchEvent(event);
    setTimeout(() => {
      const closeEvent = new CustomEvent("toast-close", { detail: { id } });
      window.dispatchEvent(closeEvent);
    }, duration);
  };

  // Wishlist handler
  const handleToggleFav = async (id: string) => {
    const now = Date.now();
    if (now - lastToastTime.current < 500) return;
    const wasInWish = isWished(id);
    await toggleWishlist(id);
    if (!wasInWish) {
      lastToastTime.current = now;
      showToast("success", "Favori", "Sujet ajouté à vos favoris");
      setTimeout(() => {
        lastToastTime.current = 0;
      }, 600);
    }
  };

  // Modal handlers
  const openPreviewModal = (subject: any) => {
    if (isGuest) {
      setAuthModalOpen(true);
      return;
    }
    setCurrentSubject(subject);
    setPreviewModalOpen(true);
  };

  const openBuyModal = (subject: any) => {
    if (isGuest) {
      setAuthModalOpen(true);
      return;
    }
    setCurrentSubject(subject);
    setBuyModalOpen(true);
  };

  const confirmBuy = async () => {
    if (!currentSubject || !userId) return;
    setIsPurchasing(true);
    try {
      const result = await purchaseCurrentUserSubject(currentSubject.id);
      if (result.success) {
        showToast(
          "success",
          "Achat réussi",
          `${currentSubject.title} est maintenant débloqué !`,
        );
        setBuyModalOpen(false);
        router.push(`/sujet/${currentSubject.id}`);
      } else {
        showToast(
          "error",
          "Erreur",
          result.error || "Impossible de finaliser l'achat",
        );
      }
    } catch {
      showToast("error", "Erreur", "Une erreur inattendue est survenue");
    } finally {
      setIsPurchasing(false);
    }
  };

  // Recherche debounced
  useEffect(() => {
    const timer = setTimeout(() => {
      const filters: any = {};
      if (search.trim()) filters.search = search.trim();
      if (selectedExamType) filters.examType = selectedExamType;
      setFilters(filters);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, selectedExamType, setFilters]);

  useEffect(() => {
    refresh();
  }, [pageSize, refresh]);

  // Escape key closes whichever modal is open + body scroll lock
  useEffect(() => {
    const anyModalOpen = previewModalOpen || buyModalOpen;
    if (anyModalOpen) {
      document.body.style.overflow = 'hidden';
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setPreviewModalOpen(false);
          setBuyModalOpen(false);
        }
      };
      document.addEventListener('keydown', handleEsc);
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEsc);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [previewModalOpen, buyModalOpen]);

  if (loading) return <CataloguePageSkeleton />;

  // Mapper les sujets pour PaperCard
  const mappedSubjects = subjects.map((subject: any) => ({
    id: subject.id,
    title: subject.titre,
    examType: subject.type,
    year: subject.annee,
    subject: subject.matiere,
    pages: subject.pages,
    duration: undefined,
    difficulty: subject.difficulte?.toLowerCase(),
    rating: subject.rating,
    reviews: subject.reviewsCount,
    price: subject.credits ?? 0,
    isFree: subject.badge === "FREE" || subject.credits === 0,
    isPremium: subject.badge === "GOLD",
    isAi: subject.hasCorrectionIa,
    isUnlocked: subject.isUnlocked,
    isWished: isWished(subject.id),
    description: subject.description,
  }));

  // Filtres actifs
  const activeFiltersList: Array<{
    id: string;
    label: string;
    value: string;
    onRemove: () => void;
  }> = [];
  if (selectedExamType) {
    activeFiltersList.push({
      id: "examType",
      label: "Type",
      value:
        EXAM_TYPES.find((t) => t.id === selectedExamType)?.label ||
        selectedExamType,
      onRemove: () => setSelectedExamType(undefined),
    });
  }
  if (search.trim()) {
    activeFiltersList.push({
      id: "search",
      label: "Recherche",
      value: search.trim(),
      onRemove: () => setSearch(""),
    });
  }

  return (
    <>
      <LuxuryCursor />

      {/* MAIN CONTENT */}
      <div className={`page-layout ${guestMode ? "guest-mode" : ""}`}>
        {/* MAIN AREA */}
        <main id="main-content" className={`main-area ${guestMode ? "guest-mode" : ""}`}>
          <div className="main-content-wrapper">
            {/* Page Title */}
            <h1 className="serif">
              Catalogue <em>de sujets</em>
            </h1>

            {/* Exam Type Pills - Moved to main content for better UX */}
            <div className="exam-type-filters-main">
              <ExamTypePills
                types={EXAM_TYPES}
                selected={selectedExamType}
                onSelect={setSelectedExamType}
                isLoading={loading}
              />
            </div>

            {/* Search */}
            <div className="nav-search">
              <span className="nav-search-icon">🔍</span>
              <input
                type="text"
                className="nav-search-input"
                placeholder="Rechercher un sujet..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Active Filters */}
            <ActiveFilters
              filters={activeFiltersList}
              onClearAll={() => {
                clearFilters();
                setSelectedExamType(undefined);
                setSearch("");
              }}
            />

            {/* Results Bar */}
            <ResultsBar
              totalResults={pagination?.totalItems || 0}
              currentPage={currentPage}
              totalPages={Math.ceil((pagination?.totalItems || 0) / pageSize)}
              searchTerm={search}
              activeFilters={activeFiltersList.length}
              sortBy="createdAt"
              viewMode={viewMode}
              onSortChange={(value) =>
                setFilters({ sortBy: value as "createdAt" })
              }
              onViewModeChange={setViewMode}
              onClearFilters={() => {
                clearFilters();
                setSelectedExamType(undefined);
                setSearch("");
              }}
            />

            {/* Papers Grid */}
            {subjects.length > 0 ? (
              <div
                className={`papers-grid ${viewMode === "list" ? "list-view" : ""}`}
              >
                {mappedSubjects.map((subject: any) => (
                  <PaperCard
                    key={subject.id}
                    {...subject}
                    layout={viewMode}
                    onPreview={() => openPreviewModal(subject)}
                    onBuy={() =>
                      subject.isUnlocked
                        ? router.push(`/sujet/${subject.id}`)
                        : openBuyModal(subject)
                    }
                    onWishlist={() => handleToggleFav(subject.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="papers-empty">
                <p>Aucun sujet trouvé pour ces critères.</p>
                <button className="btn-reset" onClick={clearFilters}>
                  Réinitialiser les filtres
                </button>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalItems > pageSize && (
              <div className="pagination">
                <button
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  ← Précédent
                </button>
                <span className="pagination-info">
                  Page {currentPage} sur{" "}
                  {Math.ceil(pagination.totalItems / pageSize)}
                </span>
                <button
                  onClick={() => setPage(currentPage + 1)}
                  disabled={
                    currentPage >= Math.ceil(pagination.totalItems / pageSize)
                  }
                  className="pagination-btn"
                >
                  Suivant →
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Preview Modal */}
      {previewModalOpen && currentSubject && (
        <div
          className="modal-overlay"
          onClick={() => setPreviewModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-modal-title"
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setPreviewModalOpen(false)}
              aria-label="Fermer"
            >
              ×
            </button>
            <h2 id="preview-modal-title" className="modal-title">{currentSubject.title}</h2>
            <div className="modal-preview modal-preview-rich">
              <div className="preview-sheet">
                <div className="preview-sheet-head">
                  <span>{currentSubject.examType}</span>
                  <span>{currentSubject.year}</span>
                </div>
                <div className="preview-sheet-title">{currentSubject.subject}</div>
                <div className="preview-sheet-lines">
                  <p>
                    {currentSubject.description ||
                      "Exercice 1 — Résoudre les questions suivantes en détaillant vos étapes."}
                  </p>
                  <p>
                    1. Identifier les données du problème et les hypothèses.
                  </p>
                  <p>
                    2. Développer votre raisonnement dans un français clair.
                  </p>
                  <p className="preview-sheet-blurred">
                    3. Justifier votre méthode puis conclure avec le résultat attendu.
                  </p>
                  <p className="preview-sheet-blurred">
                    4. Barème et correction détaillée disponibles après achat.
                  </p>
                </div>
                {currentSubject.pages <= 1 && (
                  <div className="preview-single-page-note">
                    Sujet sur une seule page : la partie basse est volontairement floutée.
                  </div>
                )}
              </div>
              <div className="preview-meta">
                <span>{currentSubject.pages || 1} page(s)</span>
                <span>Accès total après achat</span>
              </div>
            </div>
            <button
              className="btn-buy"
              onClick={() => { setPreviewModalOpen(false); openBuyModal(currentSubject); }}
            >
              Acheter pour {currentSubject.price} crédits
            </button>
          </div>
        </div>
      )}

      {/* Buy Modal */}
      {buyModalOpen && currentSubject && (
        <div
          className="modal-overlay"
          onClick={() => setBuyModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="buy-modal-title"
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setBuyModalOpen(false)}
              aria-label="Fermer"
            >
              ×
            </button>
            <h2 id="buy-modal-title" className="modal-title">Confirmer l'achat</h2>
            <div className="modal-buy-info">
              <p className="modal-buy-heading">{currentSubject.title}</p>
              <div className="modal-buy-row">
                <span>Prix du sujet</span>
                <strong>{currentSubject.price} crédits</strong>
              </div>
              <div className="modal-buy-row">
                <span>Votre solde actuel</span>
                <strong>{appUser?.credits ?? 0} crédits</strong>
              </div>
              <div className="modal-buy-row total">
                <span>Solde après achat</span>
                <strong>
                  {(appUser?.credits ?? 0) - currentSubject.price} crédits
                </strong>
              </div>
            </div>
            <p className="modal-buy-footnote">
              Achat immédiat, accès permanent, correction IA incluse.
            </p>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setBuyModalOpen(false)}
              >
                Annuler
              </button>
              <button
                className="btn-confirm"
                onClick={confirmBuy}
                disabled={isPurchasing}
              >
                {isPurchasing ? "Traitement..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title="Authentification requise"
      />
    </>
  );
}

export default function CataloguePage() {
  return (
    <Suspense fallback={<CataloguePageSkeleton />}>
      <CatalogueContent />
    </Suspense>
  );
}
