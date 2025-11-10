"use client";

import {
  QueryClientProvider as ReactQueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import { memo, PropsWithChildren } from "react";

export const queryClient = new QueryClient();

export const QueryClientProvider = memo<PropsWithChildren>(({ children }) => {
  return (
    <ReactQueryClientProvider client={queryClient}>
      {children}
    </ReactQueryClientProvider>
  );
});
QueryClientProvider.displayName = "QueryClientProvider";
