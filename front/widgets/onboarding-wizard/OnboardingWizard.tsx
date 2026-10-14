"use client"

import { useEffect, useRef } from "react"
import { AnimatePresence, m } from "framer-motion"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { ROUTES } from "@/shared/config"
import { useGetFirstOrgQuery, useClassifyMutation, type Organization } from "@/entities/organization"
import { ApiKeysStep } from "@/features/onboarding-api-keys"
import { OrgFormStep } from "@/features/onboarding-org-form"
import { ProductsReviewStep } from "@/features/onboarding-products-review"
import { Stepper } from "./Stepper"
import { useOnboardingStore } from "./model/onboarding.store"

const variants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
}

export function OnboardingWizard() {
  const router = useRouter()
  const { step, orgData, clientId, setStep, setOrgData, setApiKeys, resume } = useOnboardingStore()
  const [classify] = useClassifyMutation()
  const resumed = useRef(false)

  const { data: existingOrg, isLoading: orgLoading } = useGetFirstOrgQuery(undefined, {
    // не бросаем ошибку если орги нет — это нормальное состояние для шага 1
  })

  // шаг восстанавливаем один раз при открытии: раньше каждый refetch орги (например, после сохранения
  // на шаге 2) заново выставлял шаг и повторно запускал классификацию товаров
  useEffect(() => {
    if (orgLoading || resumed.current) return
    resumed.current = true
    resume(existingOrg ?? null)
    // повторный заход на шаг 3 не перезапускает многочасовую классификацию: только если её ещё не было
    // (идёт / упала — шаг 3 сам покажет прогресс или кнопку «Повторить»)
    if (existingOrg?.declarant?.document && !existingOrg.productsSyncStatus) {
      classify({ clientId: String(existingOrg.ozonClientId) })
    }
  }, [orgLoading, existingOrg, resume, classify])

  if (orgLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className={`flex min-h-screen flex-col items-center px-4 pb-24 ${step === 3 ? "justify-start pt-4" : "justify-center py-12"}`}>

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
        </m.div>
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 right-0 flex justify-center py-5 bg-background">
        <Stepper current={step} />
      </div>
    </div>
  )
}
