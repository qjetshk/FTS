import { create } from "zustand"
import type { Organization } from "@/entities/organization"

type OnboardingStep = 1 | 2 | 3

type OnboardingStore = {
  step: OnboardingStep
  apiKey: string
  clientId: string
  orgData: Organization | null
  setStep: (step: OnboardingStep) => void
  setApiKeys: (apiKey: string, clientId: string) => void
  setOrgData: (org: Organization) => void
  // продолжить онбординг с того шага, где юзер остановился (по уже созданной орге)
  resume: (org: Organization | null) => void
  reset: () => void
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  step: 1,
  apiKey: "",
  clientId: "",
  orgData: null,
  setStep: (step) => set({ step }),
  setApiKeys: (apiKey, clientId) => set({ apiKey, clientId }),
  setOrgData: (orgData) => set({ orgData }),
  resume: (org) =>
    set(
      org
        ? {
            orgData: org,
            apiKey: "",
            clientId: String(org.ozonClientId),
            // документ декларанта есть → шаг 2 пройден
            step: org.declarant?.document ? 3 : 2,
          }
        : { step: 1 },
    ),
  reset: () => set({ step: 1, apiKey: "", clientId: "", orgData: null }),
}))
