export type PlanId = 'free' | 'pro' | 'unlimited'

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
  unlimited: {
    name: 'Ilimitado',
    priceARS: 9000,
    priceUSD: 9,
    pdf: Infinity,
    video: Infinity,
  },
}

export const PLAN_LIMITS: Record<PlanId, { pdf: number; video: number }> = {
  free: { pdf: 1, video: 1 },
  pro: { pdf: 20, video: 20 },
  unlimited: { pdf: Infinity, video: Infinity },
}
