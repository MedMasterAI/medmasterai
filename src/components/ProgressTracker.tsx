// src/components/ProgressTracker.tsx
"use client"

import { motion, AnimatePresence } from "framer-motion"
import { JobStatus, statusMessages } from "@/lib/statusMessages"

interface ProgressTrackerProps {
  progress: number
  status: JobStatus
  statusDetail?: string
  downloadUrl?: string
  /**
   * When true, the tracker is shown even if status is "idle".
   */
  loading?: boolean
}

export function ProgressTracker({ progress, status, statusDetail, downloadUrl, loading }: ProgressTrackerProps) {
  const show = loading || status !== "idle"

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="progress"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="w-full max-w-xl flex flex-col gap-2 items-center py-2"
        >
            <div className="w-full h-3 bg-accent-2 rounded-xl overflow-hidden border border-primary/20">
            <motion.div
              style={{ width: `${progress}%` }}
              className="h-full bg-primary shadow-lg transition-all"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, type: "tween" }}
            />
          </div>
          <span className="text-xs text-text-secondary">{progress}%</span>
          <div className="text-sm font-semibold mt-1 text-center">
            {statusMessages[status]}
            {statusDetail && (
              <><br /><span className="text-xs font-normal text-accent">{statusDetail}</span></>
            )}
          </div>
          {status === "completed" && downloadUrl && (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline font-semibold"
            >
              Descargar apunte generado
            </a>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
