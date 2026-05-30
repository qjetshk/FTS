"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ROUTES } from "@/shared/config"
import type { Organization } from "@/entities/organization"
import { ApiKeysStep } from "@/features/onboarding-api-keys/ui/ApiKeysStep"
import { OrgFormStep } from "@/features/onboarding-org-form/ui/OrgFormStep"
import { ProductsReviewStep } from "@/features/onboarding-products-review/ui/ProductsReviewStep"
import { Stepper } from "./Stepper"
import { useOnboardingStore } from "./model/onboarding.store"

const variants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
}

export function OnboardingWizard() {
  const router = useRouter()
  const { step, orgData, clientId, setStep, setOrgData, setApiKeys } = useOnboardingStore()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 pb-24">

      <AnimatePresence mode="wait">
        <motion.div
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
              onComplete={(org: Organization, apiKey: string, cId: string) => {
                setOrgData(org)
                setApiKeys(apiKey, cId)
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
              onComplete={() => router.push(ROUTES.statforms)}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
        <Stepper current={step} />
      </div>
    </div>
  )
}
