export type PlanId = 'free' | 'pro' | 'premium'

export const PLAN_DETAILS: Record<PlanId, { name: string; priceARS: number; priceUSD: number; pdf: number; video: number }> = {
  free: {
    name: 'Gratuito',
    priceARS: 0,
    priceUSD: 0,
    pdf: 1,
    video: 1,
  },
  pro: {
    name: 'Pro',
    priceARS: 5000,
    priceUSD: 5,
    pdf: 20,
    video: 20,
  },
  premium: {
    name: 'Premium',
    priceARS: 9000,
    priceUSD: 9,
    pdf: 40,
    video: 40,
  },
}

export const PLAN_LIMITS: Record<PlanId, { pdf: number; video: number }> = {
  free: { pdf: 1, video: 1 },
  pro: { pdf: 20, video: 20 },
  premium: { pdf: 40, video: 40 },
}
