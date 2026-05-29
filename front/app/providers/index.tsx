"use client"

import { Toaster } from "sonner"
import { ReduxProvider } from "./ReduxProvider"
import { PostHogProvider } from "./PostHogProvider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider>
      <ReduxProvider>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast: "font-sans text-sm",
            },
          }}
        />
      </ReduxProvider>
    </PostHogProvider>
  )
}