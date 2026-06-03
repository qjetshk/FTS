"use client"

import { useState } from "react"
import { AnimatePresence, m } from "framer-motion"
import { useRouter } from "next/navigation"
import { cn } from "@/shared/lib"
import { ROUTES } from "@/shared/config"
import { type Organization } from "@/entities/organization"
import { ApiKeysStep } from "@/features/onboarding-api-keys"
import { OrgFormStep } from "@/features/onboarding-org-form"
import { ProductsReviewStep } from "@/features/onboarding-products-review"

const STEPS = [
  { n: 1, label: "API-ключи" },
  { n: 2, label: "Организация" },
  { n: 3, label: "Товары" },
]

const variants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
}

function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const done = current > step.n
        const active = current === step.n
        return (
          <div key={step.n} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <m.div
                animate={{
                  backgroundColor: done || active ? "var(--primary)" : "var(--border)",
                  scale: active ? 1.1 : 1,
                }}
                transition={{ duration: 0.25 }}
                className="flex size-8 items-center justify-center rounded-full text-sm font-semibold text-white"
              >
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7l4 4 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  step.n
                )}
              </m.div>
              <span className={cn("text-xs whitespace-nowrap", active ? "text-foreground font-medium" : "text-muted-foreground")}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <m.div
                animate={{ backgroundColor: done ? "var(--primary)" : "var(--border)" }}
                transition={{ duration: 0.25 }}
                className="h-px w-16 mb-5 mx-2"
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function AddOrgWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [orgData, setOrgData] = useState<Organization | null>(null)
  const [clientId, setClientId] = useState<string>("")

  return (
    <div className="-mx-6 -mt-6 -mb-6 flex flex-col h-[calc(100vh-3.5rem)]">
      <div className={`flex-1 flex flex-col items-center px-4 overflow-y-auto ${step === 3 ? "justify-start pt-4" : "justify-center py-12"}`}>
        <AnimatePresence mode="wait">
          <m.div
            key={step}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex justify-center"
          >
            {step === 1 && (
              <ApiKeysStep
                onComplete={(org, _apiKey, cId) => {
                  setOrgData(org)
                  setClientId(cId)
                  setStep(2)
                }}
              />
            )}
            {step === 2 && orgData && (
              <OrgFormStep
                org={orgData}
                onComplete={() => setStep(3)}
              />
            )}
            {step === 3 && (
              <ProductsReviewStep
                clientId={Number(clientId)}
                onComplete={() => router.push(ROUTES.organizations)}
              />
            )}
          </m.div>
        </AnimatePresence>
      </div>

      <div className="shrink-0 flex justify-center py-5 border-t border-border bg-background">
        <Stepper current={step} />
      </div>
    </div>
  )
}
