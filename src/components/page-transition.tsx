"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * @deprecated Substituído por `.page-intro` no PublicShell.
 * Mantido aqui para evitar quebrar imports antigos.
 */
export function PageTransition({ children }: { children: ReactNode }): JSX.Element {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-intro">
      {children}
    </div>
  );
}
