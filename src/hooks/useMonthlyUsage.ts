import { useState, useCallback, useEffect } from "react"
import { PLAN_LIMITS } from "@/lib/plans"

type PlanType = "free" | "pro" | "unlimited"

type UseMonthlyUsage = {
  pdfCount: number
  videoCount: number
  canPdf: boolean
  canVideo: boolean
  increment: (type: "pdf" | "video") => Promise<void>
}

export function useMonthlyUsage(
  uid: string | null,
  plan: PlanType
): UseMonthlyUsage {
  const [counts, setCounts] = useState({
    pdfCount: 0,
    videoCount: 0,
  })

  // Carga inicial de uso desde backend
  useEffect(() => {
    if (!uid) return
    const fetchCounts = async () => {
      const res = await fetch("/api/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "status", uid, plan }),
      })
      const data = await res.json()
      setCounts({
        pdfCount: data.pdfCount,
        videoCount: data.videoCount,
      })
    }
    fetchCounts()
  }, [uid, plan])

  const increment = useCallback(
    async (type: "pdf" | "video") => {
      if (!uid) throw new Error("No hay usuario")
      const res = await fetch("/api/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, uid, plan }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCounts({
        pdfCount: data.pdfCount,
        videoCount: data.videoCount,
      })
    },
    [uid, plan]
  )

  const canPdf = counts.pdfCount < PLAN_LIMITS[plan].pdf
  const canVideo = counts.videoCount < PLAN_LIMITS[plan].video

  return {
    ...counts,
    canPdf,
    canVideo,
    increment,
  }
}
