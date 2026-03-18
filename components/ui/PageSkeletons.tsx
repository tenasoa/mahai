'use client'

import { Skeleton } from '@/components/ui/Skeleton'

function SkeletonShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-void">
      <div className="max-w-[1280px] mx-auto px-6 py-24 space-y-6">{children}</div>
    </div>
  )
}

export function DashboardPageSkeleton() {
  return (
    <SkeletonShell>
      <div className="rounded-[22px] border border-[var(--b1)] bg-[var(--card)] p-8 space-y-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-40 rounded-[18px]" />
        <Skeleton className="h-40 rounded-[18px]" />
        <Skeleton className="h-40 rounded-[18px]" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-[300px] rounded-[18px]" />
        <Skeleton className="h-[300px] rounded-[18px]" />
      </div>
    </SkeletonShell>
  )
}

export function ProfilePageSkeleton() {
  return (
    <SkeletonShell>
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
      <div className="rounded-[999px] border border-[var(--b1)] bg-[var(--card)] p-2 flex gap-2 w-fit">
        <Skeleton className="h-10 w-28 rounded-full" />
        <Skeleton className="h-10 w-28 rounded-full" />
        <Skeleton className="h-10 w-28 rounded-full" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Skeleton className="h-[260px] rounded-[18px]" />
        <Skeleton className="h-[260px] rounded-[18px]" />
        <Skeleton className="h-[260px] rounded-[18px]" />
        <Skeleton className="h-[260px] rounded-[18px]" />
      </div>
    </SkeletonShell>
  )
}

export function CataloguePageSkeleton() {
  return (
    <SkeletonShell>
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-[14px]" />
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-10 w-40 rounded-[10px]" />
          <Skeleton className="h-10 w-28 rounded-[10px]" />
          <Skeleton className="h-10 w-28 rounded-[10px]" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 9 }).map((_, index) => (
          <div key={index} className="rounded-[18px] border border-[var(--b1)] bg-[var(--card)] p-4 space-y-4">
            <Skeleton className="h-40 rounded-[14px]" />
            <Skeleton className="h-5 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex justify-between">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </SkeletonShell>
  )
}

export function AuthPageSkeleton() {
  return (
    <div className="min-h-screen bg-void px-6 py-16 flex items-start justify-center">
      <div className="w-full max-w-[440px] space-y-5">
        <Skeleton className="h-12 w-40 mx-auto" />
        <div className="rounded-[16px] border border-[var(--b1)] bg-[var(--card)] p-6 space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-12 w-full rounded-[10px]" />
          <Skeleton className="h-12 w-full rounded-[10px]" />
          <Skeleton className="h-12 w-full rounded-[10px]" />
        </div>
      </div>
    </div>
  )
}

export function PaymentConfirmationSkeleton() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-bg2 rounded-2xl border border-white/5 p-8 space-y-5">
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

export function SubjectDetailSkeleton() {
  return (
    <SkeletonShell>
      <div className="rounded-[28px] border border-[var(--b1)] bg-[var(--card)] p-8 space-y-5">
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

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
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

        <div className="space-y-4">
          <Skeleton className="h-48 rounded-[18px]" />
          <Skeleton className="h-52 rounded-[18px]" />
          <Skeleton className="h-52 rounded-[18px]" />
        </div>
      </div>
    </SkeletonShell>
  )
}
