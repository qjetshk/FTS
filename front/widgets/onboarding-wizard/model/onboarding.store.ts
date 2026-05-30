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
  reset: () => set({ step: 1, apiKey: "", clientId: "", orgData: null }),
}))
