"use client";

import { Toaster } from "sonner";

/**
 * Toaster global (Sonner) para feedback de sucesso e erro.
 */
export function AppToaster() {
  return (
    <Toaster
      richColors
      closeButton
      position="top-center"
      theme="dark"
      toastOptions={{
        classNames: {
          toast:
            "backdrop-blur-md border border-white/10 bg-sidebar/95 text-white shadow-xl",
        },
      }}
    />
  );
}
