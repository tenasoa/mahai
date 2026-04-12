"use client";

import { usePathname } from "next/navigation";
import { LuxuryNavbar } from "./LuxuryNavbar";
import { shouldShowNavbar } from "./navbarVisibility";

export function ConditionalNavbar() {
  const pathname = usePathname();

  if (!shouldShowNavbar(pathname)) {
    return null;
  }

  return <LuxuryNavbar />;
}