"use client"

import { Toaster } from "sonner"
import { LazyMotion, MotionConfig, domAnimation } from "framer-motion"
import { ReduxProvider } from "./ReduxProvider"
import { PostHogProvider } from "./PostHogProvider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation}>
      {/* системная настройка «уменьшить движение» → без перемещений/масштаба, плавность прозрачности остаётся */}
      <MotionConfig reducedMotion="user">
      <PostHogProvider>
        <ReduxProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              classNames: {
                toast: "font-sans text-sm",
              },
            }}
          />
        </ReduxProvider>
      </PostHogProvider>
      </MotionConfig>
    </LazyMotion>
  )
}