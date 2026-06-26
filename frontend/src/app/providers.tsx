"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

/** Client-side TanStack Query provider — used by interactive client fetches
 *  (project detail, gallery). The home page itself is server-rendered for SEO. */
export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false } },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
