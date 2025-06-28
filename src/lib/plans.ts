export type PlanId =
  | 'free'
  | 'basic'
  | 'pro'
  | 'express'
  | 'extra'
  | 'unlimited'

export type PlanInfo = {
  name: string
  priceARS: number
  priceUSD: number
  pdf: number
  video: number
}

export const PLANS: Array<{
  id: Exclude<PlanId, 'unlimited'>
  label: string
  videos: number
  pdfs: number
  price: number
  description?: string
}> = [
  {
    id: 'free',
    label: 'Gratis',
    videos: 1,
    pdfs: 2,
    price: 0,
    description: 'Solo para probar, incluye marca de agua.',
  },
  {
    id: 'basic',
    label: 'Básico',
    videos: 5,
    pdfs: 5,
    price: 3000,
  },
  {
    id: 'pro',
    label: 'Pro',
    videos: 20,
    pdfs: 20,
    price: 8500,
  },
  {
    id: 'express',
    label: 'Día Express',
    videos: 2,
    pdfs: 3,
    price: 1700,
    description: 'Ideal para emergencias o días pico.',
  },
  {
    id: 'extra',
    label: 'Pack Extra',
    videos: 5,
    pdfs: 0,
    price: 3200,
    description: 'Para sumar créditos cuando los agotás.',
  },
]

export const PLAN_DETAILS: Record<PlanId, PlanInfo> = {
  free:      { name: 'Gratis',     priceARS: 0,    priceUSD: 0,    pdf: 2,  video: 1 },
  basic:     { name: 'Básico',    priceARS: 3000, priceUSD: 3,   pdf: 5,  video: 5 },
  pro:       { name: 'Pro',       priceARS: 8500, priceUSD: 8.5, pdf: 20, video: 20 },
  express:   { name: 'Día Express', priceARS: 1700, priceUSD: 1.7, pdf: 3,  video: 2 },
  extra:     { name: 'Pack Extra', priceARS: 3200, priceUSD: 3.2, pdf: 0,  video: 5 },
  unlimited: { name: 'Ilimitado', priceARS: 0,    priceUSD: 0,    pdf: Infinity, video: Infinity },
}

export const PLAN_LIMITS: Record<PlanId, { pdf: number; video: number }> = {
  free: { pdf: 2, video: 1 },
  basic: { pdf: 5, video: 5 },
  pro: { pdf: 20, video: 20 },
  express: { pdf: 3, video: 2 },
  extra: { pdf: 0, video: 5 },
  unlimited: { pdf: Infinity, video: Infinity },
}
