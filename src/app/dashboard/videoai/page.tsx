'use client'
import { httpsCallable } from "firebase/functions";
import { getFirebaseFunctions } from "@/lib/firebase";
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { ERROR_CODES, formatErrorMessage } from '@/lib/errorCodes'
import { useAuth } from '@/hooks/useAuth'
import { useUserPlan } from '@/hooks/useUserPlan'
import { useMonthlyUsage } from '@/hooks/useMonthlyUsage'
import { motion, AnimatePresence } from 'framer-motion'
import { JobStatus, statusMessages } from '@/lib/statusMessages'
import { VideoIcon, Info, CheckCircle, FileTextIcon } from 'lucide-react'
import { PLAN_LIMITS } from '@/lib/plans'
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore"

const DEBUG = process.env.NODE_ENV !== 'production'


export default function Page() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { plan } = useUserPlan(user?.uid ?? null)
  const { videoCount, canVideo, increment } = useMonthlyUsage(user?.uid ?? null, plan)

  const [videoUrl, setVideoUrl] = useState('')
  const [progress, setProgress] = useState(0)
  const [jobStatus, setJobStatus] = useState<JobStatus>("idle")
  const [statusDetail, setStatusDetail] = useState<string>("")
  const [downloadUrl, setDownloadUrl] = useState<string>("")
  const [jobNoteId, setJobNoteId] = useState<string | null>(null)
  const emailSentRef = useRef(false)
  const completedToast = useRef(false)
  const ventajas = [
    {
      icon: <VideoIcon className="text-primary w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Transcripción precisa",
      desc: "Convertí clases o charlas en texto rápidamente.",
    },
    {
      icon: <CheckCircle className="text-accent w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Resumen automático",
      desc: "Obtené un PDF organizado y fácil de leer.",
    },
    {
      icon: <FileTextIcon className="text-primary w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Listo para estudiar",
      desc: "Descargá apuntes profesionales al instante.",
    },
  ]

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [loading, user, router])

  // Listener Firestore (igual que Apunty)
  useEffect(() => {
    if (!user?.uid || !jobNoteId) return
    const db = getFirestore()
    const noteRef = doc(db, "users", user.uid, "notes", jobNoteId)
    const unsub = onSnapshot(noteRef, (snap) => {
      const data = snap.data()
      if (!data) return
      const status = (data.status || "idle").toLowerCase() as JobStatus
      setJobStatus(status)
      setProgress((p) => Math.max(p, Number(data.progress ?? getProgressForStatus(status))))
      setStatusDetail(data.errorMessage ? formatErrorMessage(ERROR_CODES.VIDEO_PROCESS) : "")
      if (status === "completed" && data.url) {
        setDownloadUrl(data.url)
        if (!emailSentRef.current && user?.email) {
          fetch("/api/send-note-ready", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email, url: data.url }),
          })
          emailSentRef.current = true
        }
        if (!completedToast.current) {
          toast.success("✅ ¡Tu apunte está listo para descargar!")
          completedToast.current = true
        }
      } else if (status === "failed") {
        toast.error(formatErrorMessage(ERROR_CODES.VIDEO_PROCESS))
      }
    })
    return () => unsub()
  }, [user?.uid, jobNoteId])

  function getProgressForStatus(status: string) {
    switch (status) {
      case "validating": return 10
      case "saving_firestore": return 20
      case "calling_function": return 30
      case "pending": return 40
      case "processing": return 50
      case "generating_schema": return 75
      case "formatting_html": return 85
      case "uploading_final_pdf": return 95
      case "completed": return 100
      case "failed": return 0
      default: return 0
    }
  }
  if (DEBUG) console.log("Usuario Firebase actual:", user);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatusDetail("")
    setDownloadUrl("")

    // ---- DEBUG LOGS ----
    if (DEBUG) console.log('[DEBUG] ======== SUBMIT ========')

    if (DEBUG) console.log('[DEBUG] user:', user)
    if (user) {
      if (DEBUG) console.log('[DEBUG] user.uid:', user.uid)
      if (DEBUG) console.log('[DEBUG] user.getIdToken exists?', typeof user.getIdToken === "function")
      user.getIdToken().then(tk => {
        if (DEBUG) console.log('[DEBUG] user.getIdToken:', tk.slice(0, 40) + '...')
      })
    }
    if (DEBUG) console.log('[DEBUG] plan:', plan)
    if (DEBUG) console.log('[DEBUG] canVideo:', canVideo)
    if (DEBUG) console.log('[DEBUG] videoUrl:', videoUrl)
    if (DEBUG) console.log('[DEBUG] jobNoteId:', jobNoteId)
    // ---- DEBUG LOGS ----

    
    if (!canVideo) {
      setJobStatus("failed")
      setStatusDetail("Límite mensual alcanzado.")
      toast.error("Has alcanzado tu límite de videos.")
      return
    }
    if (!videoUrl || !user?.uid) {
      setJobStatus("failed")
      setStatusDetail("URL o usuario no encontrado.")
      toast.error("Debes ingresar una URL válida y estar logueado.")
      return
    }

    setProgress(10)
    setJobStatus("validating")
    setStatusDetail("Validando datos y usuario...")

    try {
      await increment("video")
      const noteId = Date.now().toString()
      setJobNoteId(noteId)

      // 1️⃣ Crear documento en Firestore
      setProgress(20)
      setJobStatus("saving_firestore")
      setStatusDetail("Guardando registro en Firestore...")
      if (DEBUG) console.log("Subiendo PDF al storage...")
      const db = getFirestore()
      await setDoc(doc(db, "users", user.uid, "notes", noteId), {
        videoUrl,
        fileName: "Apunte-Video.pdf",
        status: "pending",
        createdAt: new Date(),
        plan,
      })
      // ---- MÁS LOGS ANTES DE CALLABLE ----
      if (DEBUG) console.log('[DEBUG] Antes de llamar httpsCallable')
      if (DEBUG) console.log('[DEBUG] functions:', getFirebaseFunctions())
      if (DEBUG) console.log('[DEBUG] noteId:', noteId)
      // ---- MÁS LOGS ANTES DE CALLABLE ----

      // 2️⃣ Llamar función Cloud Function
      setProgress(30)
      setJobStatus("calling_function")
      setStatusDetail("Llamando función Cloud Function (IA)...")
      const funcName = "generateNoteFromVideo"
      const generateNoteFromVideo = httpsCallable(getFirebaseFunctions(), funcName, {
        timeout: 540000,
      })
      await generateNoteFromVideo({
        noteId,
        plan,
        videoUrl,
        fileName: "Apunte-Video.pdf",
      }).then(r => {
        if (DEBUG) console.log('[DEBUG] Response función:', r)
      }).catch(err => {
        console.error('[DEBUG] ERROR FUNCIÓN:', err)
      })

      setProgress(40)
      setJobStatus("pending")
      setStatusDetail("Procesando en backend (esperando respuesta)...")
      toast.success("⏳ Apunte en proceso. Te avisaremos cuando esté listo.")

    } catch (err: any) {
      setJobStatus("failed")
      setStatusDetail(formatErrorMessage(ERROR_CODES.VIDEO_PROCESS))
      console.error("ERROR:", err)
      toast.error(formatErrorMessage(ERROR_CODES.VIDEO_PROCESS))
      setProgress(0)
    }
  }

 if (loading || !user) {
    return <div className="p-8 text-center">Cargando…</div>
  }


  return (
    <SidebarProvider className="flex flex-col">
    <div className="flex flex-1">
        <SidebarInset className="px-2 sm:px-6 md:px-12 py-10">
          <div className="flex flex-col items-center w-full">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, type: "spring", bounce: 0.15 }}
              className="flex flex-col items-center mb-8"
            >
              <div className="bg-primary/10 rounded-full p-4 mb-2">
                <VideoIcon className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-text dark:text-text-dark text-center">
                Transcribí videos con IA
              </h1>
              <span className="mt-2 text-base text-text-secondary font-semibold text-center">
                Pegá un link de YouTube y obtené tu PDF
              </span>
            </motion.div>
              {/* Barra de progreso y estado */}
              <AnimatePresence>
              {jobStatus !== "idle" && (
                  <motion.div
                    key="progress"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="w-full max-w-3xl flex flex-col gap-2 items-center py-2"
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
                    <div className="text-sm font-semibold mt-1">
                      {statusMessages[jobStatus]}
                      {statusDetail && <><br /><span className="text-xs font-normal text-accent">{statusDetail}</span></>}
                    </div>
                    {jobStatus === "completed" && downloadUrl && (
                      <a
                        href={downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline font-semibold"
                      >
                        Descargar apunte generado
                      </a>
                    )}
                    {jobStatus !== "completed" && jobStatus !== "failed" && (
                      <p className="text-xs text-text-secondary text-center mt-1">
                        Favor no cerrar la pantalla mientras se procesa tu apunte.
                        {jobStatus === "pending" && " Cuando esté listo te llegará un mail."}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="w-full flex flex-col gap-8">
                {/* Card principal */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.18, duration: 0.5 }}
                >
                  <Card className="shadow-card bg-card border border-[var(--card-border)] rounded-2xl w-full">
                  <CardHeader className="text-center flex flex-col items-center gap-2">
                    <CardTitle className="text-2xl flex items-center gap-2 text-primary">
                      <VideoIcon className="w-7 h-7 sm:w-8 sm:h-8" />
                      Generar Apunte desde Video
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground">
                      Pegá el enlace de YouTube y obtené tu PDF.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-xs text-muted-foreground font-semibold text-center bg-[var(--muted)]/60 dark:bg-muted/60 rounded-lg py-2">
                      {plan === "unlimited"
                        ? "Uso ilimitado de videos."
                        : <>Usaste <b>{videoCount}/{PLAN_LIMITS[plan].video === Infinity ? "∞" : PLAN_LIMITS[plan].video}</b> este mes</>
                      }
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="videoUrl" className="font-medium">
                          URL del Video (YouTube)
                        </Label>
                      <Input
 id="videoUrl"
 type="url"
 placeholder="https://www.youtube.com/watch?v=..."
 value={videoUrl}
 onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVideoUrl(e.target.value)}
 required
 className="bg-accent-2/50 dark:bg-card-dark focus:border-primary"
/>


                      </div>
                      <Button
                        type="submit"
                        disabled={loading || !canVideo || !user}
                        className="w-full bg-primary hover:bg-primary-dark text-primary-foreground font-bold py-3 rounded-lg shadow-button hover:shadow-cardHover transition-all flex items-center justify-center gap-2 text-lg">
                        {loading ? (
                          <>Procesando…</>
                        ) : (
                          <>
                            <span role="img" aria-label="rocket">🚀</span> Enviar Video
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
                </motion.div>
  {/* Ventajas de VideoAI */}
  <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="w-full mt-8"
                >
                <Card className="bg-[var(--card-feature)] border-none shadow-card rounded-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary text-xl">
                      <VideoIcon className="w-5 h-5 sm:w-6 sm:h-6" /> ¿Por qué usar VideoAI?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col md:flex-row gap-4">
                    {ventajas.map((v, i) => (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-start gap-2 bg-[var(--card-feature)] border border-[var(--card-feature-border)] p-4 rounded-2xl shadow-card transition hover:scale-105 hover:shadow-lg"
                        style={{ color: "var(--card-feature-text)", minWidth: 0 }}
                      >
                        <div className="mb-1 text-[var(--card-feature-title)]">{v.icon}</div>
                        <div className="text-base font-bold text-[var(--card-feature-title)]">{v.title}</div>
                        <div className="text-sm text-[var(--card-feature-desc)]">{v.desc}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                </motion.div>

                {/* Card de ayuda / instrucciones */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="w-full"
                >
                <Card className="w-full bg-card border border-[var(--card-border)] shadow-card rounded-2xl transition-colors">
                  <CardHeader className="flex flex-row items-center gap-3 pb-2">
                    <Info className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                    <CardTitle className="text-lg font-bold text-[var(--card-foreground)]">
                      ¿Cómo funciona?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-[var(--text-secondary)] font-medium space-y-2">
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Pegá la URL de YouTube arriba.</li>
                      <li>Hacé click en <span className="font-semibold text-primary">“Enviar Video”</span>.</li>
                      <li>Esperá el procesamiento (puede demorar según la duración).</li>
                      <li>¡Listo! Descargá el PDF generado.</li>
                    </ol>
                    <div className="pt-2 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> Mejor resultado: videos nítidos, sin música de fondo.
                    </div>
                  </CardContent>
                </Card>
                </motion.div>
              </div>
              </div>
          </SidebarInset>
      </div>
    </SidebarProvider>
  )
}