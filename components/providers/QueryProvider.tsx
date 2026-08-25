"use client";

import React, { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/lib/api/query-client";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Ensure QueryClient is instantiated once per component tree
  const [queryClient] = useState(() => createQueryClient());

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
