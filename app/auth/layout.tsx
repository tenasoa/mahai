import type { ReactNode } from "react";
import { ThemeToggleButton } from "@/components/layout/ThemeToggleButton";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ThemeToggleButton variant="floating" />
      {children}
    </>
  );
}
