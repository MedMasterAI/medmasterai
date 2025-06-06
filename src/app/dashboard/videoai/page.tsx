'use client'
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { useUserPlan } from '@/hooks/useUserPlan'
import { useMonthlyUsage } from '@/hooks/useMonthlyUsage'
import { motion, AnimatePresence } from 'framer-motion'
import { VideoIcon, Info, CheckCircle } from 'lucide-react'
import { PLAN_LIMITS } from '@/lib/plans'
import { Loader2 } from "lucide-react"
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore"

type JobStatus =
  | "idle"
  | "validating"
  | "saving_firestore"
  | "calling_function"
  | "pending"
  | "processing"
  | "generating_schema"
  | "formatting_html"
  | "uploading_final_pdf"
  | "completed"
  | "failed"

const statusMessages: Record<JobStatus, string> = {
  idle: "Esperando acción del usuario.",
  validating: "Validando datos y permisos...",
  saving_firestore: "Guardando registro en Firestore...",
  calling_function: "Procesando video con IA...",
  pending: "En cola...",
  processing: "Procesando video...",
  generating_schema: "Generando esquema del apunte...",
  formatting_html: "Formateando HTML...",
  uploading_final_pdf: "Generando PDF final...",
  completed: "¡Apunte generado exitosamente!",
  failed: "Error durante la generación.",
}

export default function Page() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { plan } = useUserPlan(user?.uid ?? null)
  const { videoCount, canVideo, increment } = useMonthlyUsage(user?.uid ?? null, plan)

  const [videoUrl, setVideoUrl] = useState('')
  const [loadingForm, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [jobStatus, setJobStatus] = useState<JobStatus>("idle")
  const [statusDetail, setStatusDetail] = useState<string>("")
  const [downloadUrl, setDownloadUrl] = useState<string>("")
  const [jobNoteId, setJobNoteId] = useState<string | null>(null)

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
      setProgress(Number(data.progress ?? getProgressForStatus(status)))
      setStatusDetail(data.errorMessage || "")
      if (status === "completed" && data.url) {
        setDownloadUrl(data.url)
        toast.success("✅ ¡Tu apunte está listo para descargar!")
      } else if (status === "failed") {
        toast.error(data.errorMessage || "Error al generar el apunte.")
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
  console.log("Usuario Firebase actual:", user);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatusDetail("")
    setDownloadUrl("")

    // ---- DEBUG LOGS ----
    console.log('[DEBUG] ======== SUBMIT ========')

    console.log('[DEBUG] user:', user)
    if (user) {
      console.log('[DEBUG] user.uid:', user.uid)
      console.log('[DEBUG] user.getIdToken exists?', typeof user.getIdToken === "function")
      user.getIdToken().then(tk => {
        console.log('[DEBUG] user.getIdToken:', tk.slice(0, 40) + '...')
      })
    }
    console.log('[DEBUG] plan:', plan)
    console.log('[DEBUG] canVideo:', canVideo)
    console.log('[DEBUG] videoUrl:', videoUrl)
    console.log('[DEBUG] jobNoteId:', jobNoteId)
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

    setLoading(true)
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
      console.log("Subiendo PDF al storage...")
      const db = getFirestore()
      await setDoc(doc(db, "users", user.uid, "notes", noteId), {
        videoUrl,
        fileName: "Apunte-Video.pdf",
        status: "pending",
        createdAt: new Date(),
        plan,
      })
      // ---- MÁS LOGS ANTES DE CALLABLE ----
      console.log('[DEBUG] Antes de llamar httpsCallable')
      console.log('[DEBUG] functions:', functions)
      console.log('[DEBUG] noteId:', noteId)
      // ---- MÁS LOGS ANTES DE CALLABLE ----

      // 2️⃣ Llamar función Cloud Function
      setProgress(30)
      setJobStatus("calling_function")
      setStatusDetail("Llamando función Cloud Function (IA)...")
      const generateNoteFromVideo = httpsCallable(functions, "generateNoteFromVideo")
      await generateNoteFromVideo({
        noteId,
        plan,
        videoUrl,
        fileName: "Apunte-Video.pdf"
      }).then(r => {
        console.log('[DEBUG] Response función:', r)
      }).catch(err => {
        console.error('[DEBUG] ERROR FUNCIÓN:', err)
      })

      setProgress(40)
      setJobStatus("pending")
      setStatusDetail("Procesando en backend (esperando respuesta)...")
      toast.success("⏳ Apunte en proceso. Te avisaremos cuando esté listo.")

    } catch (err: any) {
      setJobStatus("failed")
      setStatusDetail("Ocurrió un error en el frontend: " + (err.message || err))
      console.error("ERROR:", err)
      toast.error("🔌 Problema de conexión o permisos.")
      setProgress(0)
    } finally {
      setLoading(false)
    }
  }

 if (loading || !user) {
    return <div className="p-8 text-center">Cargando…</div>
  }


  return (
    <SidebarProvider className="flex flex-col min-h-screen">
      <div className="flex-1 min-h-screen flex">
        <AppSidebar />
        {loading ? (
          <SidebarInset className="flex-1 min-h-screen w-full flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center gap-4"
            >
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-muted-foreground font-medium">Cargando interfaz de VideoAI…</p>
            </motion.div>
          </SidebarInset>
        ) : (
          <SidebarInset className="relative flex-1 min-h-screen w-full flex flex-col items-center justify-center px-2 md:px-0 pt-10">
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-xl space-y-10 mx-auto"
            >
              {/* Hero */}
              <div className="text-center">
                <motion.h1
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-[2.4rem] md:text-4xl font-extrabold flex flex-col items-center gap-2"
                >
                  <span className="inline-flex items-center gap-2 text-primary text-[2.7rem]">
                    <VideoIcon className="w-8 h-8" /> VideoAI
                  </span>
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Transcribí Videos</span>
                </motion.h1>
                <p className="text-base text-muted-foreground mt-2 max-w-xl mx-auto font-medium">
                  Convertí cualquier clase, seminario o video educativo de YouTube en un apunte PDF profesional, limpio y organizado.
                </p>
              </div>

              {/* Barra de progreso y estado */}
              <AnimatePresence>
                {(loading || jobStatus !== "idle") && (
                  <motion.div
                    key="progress"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="w-full max-w-xl flex flex-col gap-2 items-center py-2"
                  >
                    <div className="w-full h-3 bg-softLila rounded-xl overflow-hidden border border-primary/20">
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
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Card principal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.18, duration: 0.5 }}
              >
                <Card className="shadow-card bg-card border border-[var(--card-border)] rounded-2xl w-full">
                  <CardHeader className="text-center flex flex-col items-center gap-2">
                    <CardTitle className="text-2xl flex items-center gap-2 text-primary">
                      <VideoIcon className="w-7 h-7" />
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
                          onChange={(e) => setVideoUrl(e.target.value)}
                          required
                          className="bg-[var(--input)] border border-[var(--card-border)] rounded-lg"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={loading || !canVideo || !user}
                        className="w-full bg-primary hover:bg-accent text-white font-bold py-3 rounded-lg shadow-button hover:shadow-card transition-all flex items-center justify-center gap-2 text-lg"
                      >
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

              {/* Card de ayuda / instrucciones */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="w-full"
              >
                <Card className="w-full bg-[#232243]/90 border border-[var(--card-border)] shadow-card rounded-2xl transition-colors">
                  <CardHeader className="flex flex-row items-center gap-3 pb-2">
                    <Info className="w-5 h-5 text-accent" />
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
                      <CheckCircle className="w-4 h-4" /> Mejor resultado: videos nítidos, sin música de fondo.
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.section>
          </SidebarInset>
        )}
      </div>
    </SidebarProvider>
  )
}