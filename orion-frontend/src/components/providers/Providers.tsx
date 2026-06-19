"use client";

import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";
import { AuthProvider } from "@/components/providers/AuthProvider";

/** El interceptor de Axios ya maneja 401/403 (logout / toast SIN_PERMISO). */
function notifica(e: unknown, fallback: string) {
  const status = axios.isAxiosError(e) ? e.response?.status : undefined;
  if (status === 401 || status === 403) return;
  toast.error(getApiErrorMessage(e, fallback));
}

/** QueryClient + AuthProvider, montados una sola vez sobre toda la app. */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
        },
        // Toast genérico ante errores (el 401/403/SIN_PERMISO ya lo maneja el
        // interceptor de Axios; esto cubre el resto sin repetir en cada pantalla).
        queryCache: new QueryCache({
          onError: (e) => notifica(e, "No se pudieron cargar los datos"),
        }),
        mutationCache: new MutationCache({
          onError: (e) => notifica(e, "No se pudo completar la acción"),
        }),
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
