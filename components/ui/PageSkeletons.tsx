'use client'

import { Skeleton } from '@/components/ui/Skeleton'

// ============================================================================
// SHELL COMPONENT - Wrapper for full-page skeletons
// ============================================================================
function SkeletonShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-void page-skeleton-root">
      <div className="max-w-[1280px] mx-auto px-6 py-24 space-y-6">{children}</div>
    </div>
  )
}

// ============================================================================
// DASHBOARD PAGE SKELETON
// ============================================================================
export function DashboardPageSkeleton() {
  return (
    <div className="min-h-screen bg-void page-skeleton-root">
      {/* Navbar skeleton */}
      <div className="border-b border-[var(--b1)] bg-[var(--card)]">
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-12 space-y-8">
        {/* Hero card */}
        <div className="rounded-[22px] border border-[var(--b1)] bg-[var(--card)] p-8 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-12 w-2/3" />
          </div>
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-[18px] border border-[var(--b1)] bg-[var(--card)] p-6 space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-40" />
            </div>
          ))}
        </div>

        {/* Lower grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-[22px] border border-[var(--b1)] bg-[var(--card)] p-6 space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-1" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// PROFILE PAGE SKELETON
// ============================================================================
export function ProfilePageSkeleton() {
  return (
    <div className="min-h-screen bg-void page-skeleton-root">
      {/* Navbar skeleton */}
      <div className="border-b border-[var(--b1)] bg-[var(--card)]">
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-12 space-y-6">
        {/* Profile header */}
        <div className="rounded-[24px] border border-[var(--b1)] bg-[var(--card)] p-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
            <div className="flex items-center gap-5">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-3">
                <Skeleton className="h-9 w-60" />
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-4 w-72" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
              <Skeleton className="h-20 w-full lg:w-40 rounded-[14px]" />
              <Skeleton className="h-20 w-full lg:w-40 rounded-[14px]" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="rounded-[999px] border border-[var(--b1)] bg-[var(--card)] p-2 flex gap-2 w-fit">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-28 rounded-full" />
          ))}
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-[18px] border border-[var(--b1)] bg-[var(--card)] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32 flex-1" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// CATALOGUE PAGE SKELETON
// ============================================================================
export function CataloguePageSkeleton() {
  return (
    <div className="min-h-screen bg-void page-skeleton-root">
      {/* Navbar skeleton */}
      <div className="border-b border-[var(--b1)] bg-[var(--card)]">
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-12 space-y-6">
        {/* Search bar */}
        <Skeleton className="h-12 w-full rounded-[14px]" />

        {/* Results bar */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-40 rounded-[10px]" />
            <Skeleton className="h-10 w-28 rounded-[10px]" />
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 9 }).map((_, index) => (
            <div key={index} className="rounded-[18px] border border-[var(--b1)] bg-[var(--card)] overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-8 w-24 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-10 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// RECHARGE / CREDITS PAGE SKELETON
// ============================================================================
export function RechargePageSkeleton() {
  return (
    <div className="min-h-screen bg-void page-skeleton-root">
      {/* Navbar skeleton */}
      <div className="border-b border-[var(--b1)] bg-[var(--card)]">
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-12">
        {/* Hero balance */}
        <div className="mb-8">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-16 w-48 mb-2" />
          <Skeleton className="h-6 w-40" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Skeleton className="h-10 w-32 rounded-full" />
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Credit packs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-[18px] border border-[var(--b1)] bg-[var(--card)] p-6 space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-12 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full rounded-full" />
                </div>
              ))}
            </div>

            {/* Operator selection */}
            <div className="rounded-[18px] border border-[var(--b1)] bg-[var(--card)] p-6 space-y-4">
              <Skeleton className="h-5 w-48" />
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-[12px]" />
                ))}
              </div>
            </div>

            {/* Phone input */}
            <div className="rounded-[18px] border border-[var(--b1)] bg-[var(--card)] p-6 space-y-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-12 w-full rounded-[12px]" />
            </div>

            {/* Summary */}
            <div className="rounded-[18px] border border-[var(--b1)] bg-[var(--card)] p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>

            {/* Pay button */}
            <Skeleton className="h-14 w-full rounded-[14px]" />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-[18px] border border-[var(--b1)] bg-[var(--card)] p-6 space-y-4">
                <Skeleton className="h-5 w-40" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// AUTH PAGES SKELETON (Login, Register, Forgot Password, etc.)
// ============================================================================
export function AuthPageSkeleton() {
  return (
    <div className="min-h-screen bg-void page-skeleton-root px-6 py-16 flex items-start justify-center relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />

      <div className="w-full max-w-[440px] space-y-5 relative z-10">
        {/* Logo */}
        <Skeleton className="h-12 w-40 mx-auto" />

        {/* Auth card */}
        <div className="rounded-[16px] border border-[var(--b1)] bg-[var(--card)] p-6 space-y-4">
          <Skeleton className="h-8 w-2/3 mx-auto" />
          <Skeleton className="h-4 w-full" />

          {/* Form fields */}
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full rounded-[10px]" />
              </div>
            ))}
          </div>

          {/* Submit button */}
          <Skeleton className="h-12 w-full rounded-[10px]" />

          {/* Divider */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-px w-full" />
          </div>

          {/* Social buttons */}
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-[10px]" />
            ))}
          </div>
        </div>

        {/* Footer links */}
        <div className="flex justify-center gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// EXAMENS LIST PAGE SKELETON
// ============================================================================
export function ExamensPageSkeleton() {
  return (
    <div className="min-h-screen bg-void page-skeleton-root">
      {/* Navbar skeleton */}
      <div className="border-b border-[var(--b1)] bg-[var(--card)]">
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-12 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-12 w-40 rounded-full" />
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-32 rounded-full" />
          ))}
        </div>

        {/* Exams grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-[18px] border border-[var(--b1)] bg-[var(--card)] p-6 space-y-4">
              <div className="flex items-start justify-between">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-3 w-16 rounded-full" />
                <Skeleton className="h-3 w-16 rounded-full" />
                <Skeleton className="h-3 w-16 rounded-full" />
              </div>
              <Skeleton className="h-10 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// EXAMEN DETAIL PAGE SKELETON
// ============================================================================
export function ExamenDetailSkeleton() {
  return (
    <div className="min-h-screen bg-void page-skeleton-root">
      {/* Navbar skeleton */}
      <div className="border-b border-[var(--b1)] bg-[var(--card)]">
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-12 space-y-6">
        {/* Header */}
        <div className="rounded-[28px] border border-[var(--b1)] bg-[var(--card)] p-8 space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-4" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="h-5 w-1/2" />
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Main content */}
          <div className="space-y-5">
            <div className="rounded-[22px] border border-[var(--b1)] bg-[var(--card)] p-5 space-y-4">
              <Skeleton className="h-10 w-72" />
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full rounded-[12px]" />
              ))}
            </div>
            <div className="rounded-[22px] border border-[var(--b1)] bg-[var(--card)] p-5 space-y-3">
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Skeleton className="h-48 rounded-[18px]" />
            <Skeleton className="h-52 rounded-[18px]" />
            <Skeleton className="h-52 rounded-[18px]" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// SUJET DETAIL PAGE SKELETON
// ============================================================================
export function SujetDetailSkeleton() {
  return (
    <div className="min-h-screen bg-void page-skeleton-root">
      {/* Navbar skeleton */}
      <div className="border-b border-[var(--b1)] bg-[var(--card)]">
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-12 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-4" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-4" />
          <Skeleton className="h-3 w-32" />
        </div>

        {/* Subject header */}
        <div className="rounded-[28px] border border-[var(--b1)] bg-[var(--card)] p-8 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-12 w-3/4" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-20 rounded-full" />
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-[22px] border border-[var(--b1)] bg-[var(--card)] p-6 space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-[18px] border border-[var(--b1)] bg-[var(--card)] p-6 space-y-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-20 w-20 rounded-full mx-auto" />
              <Skeleton className="h-8 w-32 mx-auto" />
              <Skeleton className="h-4 w-24 mx-auto" />
            </div>
            <div className="rounded-[18px] border border-[var(--b1)] bg-[var(--card)] p-6 space-y-3">
              <Skeleton className="h-5 w-40" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// PAYMENT CONFIRMATION SKELETON
// ============================================================================
export function PaymentConfirmationSkeleton() {
  return (
    <div className="min-h-screen bg-void page-skeleton-root flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-2xl border border-[var(--b1)] bg-[var(--card)] p-8 space-y-5">
        <Skeleton className="h-14 w-14 rounded-full mx-auto" />
        <Skeleton className="h-9 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-5/6 mx-auto" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  )
}

// ============================================================================
// ONBOARDING PAGE SKELETON
// ============================================================================
export function OnboardingPageSkeleton() {
  return (
    <div className="min-h-screen bg-void page-skeleton-root flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-8">
        {/* Progress */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-3 w-32 rounded-full" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>

        {/* Card */}
        <div className="rounded-[24px] border border-[var(--b1)] bg-[var(--card)] p-8 space-y-6">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />

          {/* Form fields */}
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12 w-full rounded-[12px]" />
              </div>
            ))}
          </div>

          {/* Submit */}
          <Skeleton className="h-14 w-full rounded-[14px]" />
        </div>

        {/* Steps */}
        <div className="flex justify-center gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// ROLE SELECTION PAGE SKELETON
// ============================================================================
export function RoleSelectionSkeleton() {
  return (
    <div className="min-h-screen bg-void page-skeleton-root flex items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <Skeleton className="h-10 w-64 mx-auto" />
          <Skeleton className="h-5 w-96 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-[18px] border border-[var(--b1)] bg-[var(--card)] p-6 space-y-4">
              <Skeleton className="h-12 w-12 rounded-full mx-auto" />
              <Skeleton className="h-6 w-32 mx-auto" />
              <Skeleton className="h-4 w-48 mx-auto" />
              <Skeleton className="h-10 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// VERIFY EMAIL PAGE SKELETON
// ============================================================================
export function VerifyEmailSkeleton() {
  return (
    <div className="min-h-screen bg-void page-skeleton-root flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-[var(--b1)] bg-[var(--card)] p-8 space-y-6">
        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>

        {/* OTP inputs */}
        <div className="flex justify-center gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-12 rounded-xl" />
          ))}
        </div>

        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-4 w-40 mx-auto" />
      </div>
    </div>
  )
}

// ============================================================================
// LANDING PAGE SKELETON
// ============================================================================
export function LandingPageSkeleton() {
  return (
    <div className="min-h-screen bg-void page-skeleton-root">
      {/* Navbar */}
      <div className="border-b border-[var(--b1)] bg-[var(--card)]">
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-[1280px] mx-auto px-6 py-24 space-y-8">
        <div className="text-center space-y-4">
          <Skeleton className="h-16 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
          <div className="flex justify-center gap-4">
            <Skeleton className="h-12 w-40 rounded-full" />
            <Skeleton className="h-12 w-40 rounded-full" />
          </div>
        </div>

        {/* Hero image */}
        <Skeleton className="h-96 w-full rounded-[24px]" />

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-[18px] border border-[var(--b1)] bg-[var(--card)] p-6 space-y-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// NOT FOUND (404) PAGE SKELETON
// ============================================================================
export function NotFoundSkeleton() {
  return (
    <div className="min-h-screen bg-void page-skeleton-root flex items-center justify-center p-6">
      <div className="text-center space-y-6">
        <Skeleton className="h-32 w-32 mx-auto rounded-full" />
        <Skeleton className="h-12 w-64 mx-auto" />
        <Skeleton className="h-5 w-80 mx-auto" />
        <Skeleton className="h-12 w-48 mx-auto rounded-full" />
      </div>
    </div>
  )
}

// ============================================================================
// MAINTENANCE PAGE SKELETON
// ============================================================================
export function MaintenancePageSkeleton() {
  return (
    <div className="min-h-screen bg-void page-skeleton-root flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <Skeleton className="h-24 w-24 mx-auto rounded-full" />
        <Skeleton className="h-10 w-64 mx-auto" />
        <Skeleton className="h-5 w-full mx-auto" />
        <Skeleton className="h-5 w-3/4 mx-auto" />
        <Skeleton className="h-12 w-48 mx-auto rounded-full" />
      </div>
    </div>
  )
}

// ============================================================================
// LEGAL PAGES SKELETON (CGU, Privacy Policy, etc.)
// ============================================================================
export function LegalPageSkeleton() {
  return (
    <div className="min-h-screen bg-void page-skeleton-root">
      {/* Navbar */}
      <div className="border-b border-[var(--b1)] bg-[var(--card)]">
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        <div className="rounded-[18px] border border-[var(--b1)] bg-[var(--card)] p-8 space-y-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// PUBLIC PROFILE PAGE SKELETON
// ============================================================================
export function PublicProfileSkeleton() {
  return (
    <div className="min-h-screen bg-void page-skeleton-root">
      {/* Navbar */}
      <div className="border-b border-[var(--b1)] bg-[var(--card)]">
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-12 space-y-6">
        {/* Profile header */}
        <div className="rounded-[24px] border border-[var(--b1)] bg-[var(--card)] p-8">
          <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-between">
            <div className="flex items-center gap-5">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-3">
                <Skeleton className="h-9 w-60" />
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-4 w-72" />
              </div>
            </div>
            <Skeleton className="h-10 w-32 rounded-full" />
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-[18px] border border-[var(--b1)] bg-[var(--card)] p-6 space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-[18px] border border-[var(--b1)] bg-[var(--card)] p-6 space-y-4">
              <Skeleton className="h-6 w-32" />
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// EXAMEN CORRECTION PAGE SKELETON
// ============================================================================
export function ExamenCorrectionSkeleton() {
  return (
    <div className="min-h-screen bg-void page-skeleton-root">
      {/* Navbar */}
      <div className="border-b border-[var(--b1)] bg-[var(--card)]">
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-12 space-y-6">
        {/* Header */}
        <div className="rounded-[28px] border border-[var(--b1)] bg-[var(--card)] p-8 space-y-4">
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>

        {/* Correction content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-[18px] border border-[var(--b1)] bg-[var(--card)] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-8 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="rounded-[18px] border border-[var(--b1)] bg-[var(--card)] p-6 space-y-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-16 w-16 rounded-full mx-auto" />
              <Skeleton className="h-8 w-32 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// EXAMEN RESULTS PAGE SKELETON
// ============================================================================
export function ExamenResultsSkeleton() {
  return (
    <div className="min-h-screen bg-void page-skeleton-root">
      {/* Navbar */}
      <div className="border-b border-[var(--b1)] bg-[var(--card)]">
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-12 space-y-6">
        {/* Results header */}
        <div className="rounded-[28px] border border-[var(--b1)] bg-[var(--card)] p-8 text-center space-y-4">
          <Skeleton className="h-20 w-20 rounded-full mx-auto" />
          <Skeleton className="h-10 w-64 mx-auto" />
          <Skeleton className="h-6 w-48 mx-auto" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-[18px] border border-[var(--b1)] bg-[var(--card)] p-6 text-center space-y-3">
              <Skeleton className="h-12 w-12 rounded-full mx-auto" />
              <Skeleton className="h-8 w-24 mx-auto" />
              <Skeleton className="h-4 w-32 mx-auto" />
            </div>
          ))}
        </div>

        {/* Details */}
        <div className="rounded-[18px] border border-[var(--b1)] bg-[var(--card)] p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

