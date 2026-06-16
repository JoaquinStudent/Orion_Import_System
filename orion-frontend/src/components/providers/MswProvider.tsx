"use client";

import { useEffect, useState } from "react";

const MOCK_ENABLED = process.env.NEXT_PUBLIC_API_MOCK === "true";

/**
 * Arranca el worker una sola vez, aunque el efecto se ejecute dos veces
 * (React Strict Mode en desarrollo monta/desmonta/monta). Sin esto, MSW lanza
 * "cannot configure an already enabled network".
 */
let startPromise: Promise<unknown> | null = null;

function enableMocking(): Promise<unknown> {
  if (typeof window === "undefined") return Promise.resolve();
  if (!startPromise) {
    startPromise = import("@/mocks/browser").then(({ worker }) =>
      worker.start({ onUnhandledRequest: "bypass" })
    );
  }
  return startPromise;
}

/**
 * Habilita Mock Service Worker cuando NEXT_PUBLIC_API_MOCK=true.
 * Permite desarrollar el frontend sin esperar al backend de José.
 */
export function MswProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(!MOCK_ENABLED);

  useEffect(() => {
    if (!MOCK_ENABLED) return;
    let active = true;
    enableMocking().then(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!ready) return null;

  return <>{children}</>;
}
