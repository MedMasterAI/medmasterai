'use client'

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { ERROR_CODES, formatErrorMessage } from "@/lib/errorCodes"
import { useRequireAuth } from "@/hooks/useRequireAuth"
import { useMonthlyUsage } from "@/hooks/useMonthlyUsage"
import { useUserPlan } from "@/hooks/useUserPlan"
import { FileTextIcon, Sparkles, Info, CheckCircle, XCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { JobStatus } from "@/lib/statusMessages"
import Link from "next/link"
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore"
import { getStorage, ref, uploadBytes } from "firebase/storage"
import { httpsCallable } from "firebase/functions"
import { getFirebaseFunctions } from "@/lib/firebase"

const DEBUG = process.env.NODE_ENV !== 'production'
const statusMessages: Record<JobStatus, string> = {
  idle: "Esperando acción del usuario.",
  validating: "Validando datos y permisos...",
  uploading_pdf: "Subiendo PDF al almacenamiento...",
  saving_firestore: "Guardando registro en Firestore...",
  calling_function: "Iniciando procesamiento con IA...",
  pending: "Envío registrado. Te notificaremos por mail cuando esté listo.",
  processing: "Procesando apunte...",
  extracting_text: "Extrayendo texto del PDF...",
  generating_schema: "Generando esquema del apunte...",
  formatting_html: "Formateando HTML...",
  uploading_final_pdf: "Subiendo PDF final...",
  completed: "¡Apunte generado exitosamente!",
  failed: "Error durante la generación.",
}

export default function Page() {
  const router = useRouter()
  const user = useRequireAuth()
  const loading = user === undefined
  const { plan } = useUserPlan(user?.uid ?? null)
  const { pdfCount, canPdf, increment } = useMonthlyUsage(user?.uid ?? null, plan)

  const [file, setFile] = useState<File | null>(null)
  const [emphasis, setEmphasis] = useState(false)
  const [points, setPoints] = useState("")
  const [loadingForm, setLoadingForm] = useState(false)
  const [progress, setProgress] = useState(0)
  const [jobStatus, setJobStatus] = useState<JobStatus>("idle")
  const [statusDetail, setStatusDetail] = useState<string>("")
  const [downloadUrl, setDownloadUrl] = useState<string>("")
  const [jobNoteId, setJobNoteId] = useState<string | null>(null)
  const emailSentRef = useRef(false)
  const completedToast = useRef(false)

  
  // Listener para Firestore en tiempo real
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
      setStatusDetail(data.errorMessage ? formatErrorMessage(ERROR_CODES.PDF_PROCESS) : "")
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
        toast.error(formatErrorMessage(ERROR_CODES.PDF_PROCESS))
      }
    })
    return () => unsub()
  }, [user?.uid, jobNoteId])

  function getProgressForStatus(status: string) {
    switch (status) {
      case "validating": return 10
      case "uploading_pdf": return 20
      case "saving_firestore": return 30
      case "calling_function": return 40
      case "pending": return 40
      case "processing": return 50
      case "extracting_text": return 60
      case "generating_schema": return 75
      case "formatting_html": return 85
      case "uploading_final_pdf": return 95
      case "completed": return 100
      case "failed": return 0
      default: return 0
    }
  }
// Justo antes de llamar httpsCallable
if (DEBUG) console.log("Usuario Firebase actual:", user);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatusDetail("")
    if (!canPdf) {
      setJobStatus("failed")
      setStatusDetail("Límite mensual alcanzado.")
      toast.error("Has alcanzado tu límite de PDFs.")
      return
    }
    if (!file || !user?.uid) {
      setJobStatus("failed")
      setStatusDetail("Archivo o usuario no encontrado.")
      toast.error("Seleccioná un archivo.")
      return
    }
    setLoadingForm(true)
    setProgress(10)
    setJobStatus("validating")
    setStatusDetail("Validando datos y usuario...")
    try {
      await increment("pdf")
      const noteId = Date.now().toString()
      setJobNoteId(noteId)

      // Subir PDF al storage temporal
      setProgress(20)
      setJobStatus("uploading_pdf")
      setStatusDetail("Subiendo archivo PDF a Cloud Storage...")
      if (DEBUG) console.log("Subiendo PDF al storage...")
      const storage = getStorage()
      const storageRef = ref(storage, `temp_uploads/${user.uid}/${noteId}/${file.name}`)
      await uploadBytes(storageRef, file)

      // Crear documento en Firestore
      setProgress(30)
      setJobStatus("saving_firestore")
      setStatusDetail("Guardando registro del apunte en Firestore...")
      if (DEBUG) console.log("Guardando en Firestore...")
      const db = getFirestore()
      await setDoc(doc(db, "users", user.uid, "notes", noteId), {
        fileName: file.name,
        status: "pending",
        createdAt: new Date(),
        plan,
      })

      // Llamar función Cloud Function
      setProgress(35)
      setJobStatus("calling_function")
      setStatusDetail("Llamando función Cloud Function (IA)...")
      const funcName = emphasis && points.trim()
        ? "generateNoteFromPdfEmphasis"
        : "generateNoteFromPdf"
      if (DEBUG) console.log("Llamando Cloud Function:", funcName)
      const generate = httpsCallable(getFirebaseFunctions(), funcName, {
        timeout: 540000,
      })
      await generate({
        noteId,
        plan,
        fileName: file.name,
        fileMimeType: "application/pdf",
        ...(emphasis && points.trim() ? { emphasis: points.trim() } : {}),
      })

      setProgress(40)
      setJobStatus("pending")
      setStatusDetail("Procesando en backend (esperando respuesta)...")
      toast.success("⏳ Apunte en proceso. Te avisaremos cuando esté listo.")
    } catch (err: any) {
      setJobStatus("failed")
      setStatusDetail(formatErrorMessage(ERROR_CODES.PDF_PROCESS))
      console.error("ERROR:", err)
      toast.error(formatErrorMessage(ERROR_CODES.PDF_PROCESS))
      setProgress(0)
    } finally {
      setLoadingForm(false)
    }
  }

  if (loading || !user) {
    return <div className="p-8 text-center">Cargando…</div>
  }

  const welcome =
    plan === "free"
      ? `¡Hola ${user.displayName?.split(" ")[0] || "👋"}! Usá tu crédito gratuito de Apunte PDF.`
      : `¡Bienvenido ${user.displayName?.split(" ")[0] || "👋"}! Disfrutá los beneficios de tu plan.`

  const ventajas = [
    {
      icon: <Sparkles className="text-primary w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Apuntes claros y limpios",
      desc: "La IA organiza y resume por vos, en PDF profesional."
    },
    {
      icon: <CheckCircle className="text-accent w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Ahorro de tiempo",
      desc: "Subí, esperá unos segundos y recibí tu apunte al instante."
    },
    {
      icon: <FileTextIcon className="text-primary w-5 h-5 sm:w-6 sm:h-6" />,
      title: "Archivos 100% tuyos",
      desc: "Tus apuntes son privados y los podés usar cuando quieras."
    },
  ]

  return (
    <SidebarProvider className="flex flex-col">
      <div className="flex flex-1 ">
        <SidebarInset className="px-2 sm:px-6 md:px-12 py-10">
          <div className="flex flex-col items-center w-full">
            {/* Header hero */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, type: "spring", bounce: 0.15 }}
              className="flex flex-col items-center mb-8"
            >
              <div className="bg-primary/10 rounded-full p-4 mb-2">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-text dark:text-text-dark text-center">
                Generá tus apuntes con IA
              </h1>
              <span className="mt-2 text-base text-text-secondary font-semibold">{welcome}</span>
            </motion.div>

            {/* Barra de progreso y estado */}
            <AnimatePresence>
              {(loadingForm || jobStatus !== "idle") && (
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
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
              <Card className="bg-card dark:bg-card-dark border border-border rounded-xl shadow-md hover:shadow-lg transition">
                <CardHeader className="text-center flex flex-col items-center gap-2">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <FileTextIcon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                    Generar Apunte (PDF)
                  </CardTitle>
                  <CardDescription className="text-sm text-text-secondary">
                    Sube tu PDF y obtené un apunte limpio y profesional en segundos.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {(plan === "free" || plan === "pro") && (
                    <div className="text-xs text-accent font-semibold text-center bg-accent/10 rounded-lg py-2">
                      <span>
                        {plan === "free"
                          ? <>Hoy usaste <b>{pdfCount}/1</b> PDF disponible</>
                          : <>Este mes usaste <b>{pdfCount}/15</b> PDFs disponibles</>
                        }
                      </span>
                    </div>
                  )}

                  {/* Formulario */}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="file" className="font-medium flex items-center gap-2">
                        <FileTextIcon className="inline-block w-4 h-4 sm:w-5 sm:h-5" /> Archivo PDF
                      </Label>
                      <Input
                        id="file"
                        type="file"
                        accept="application/pdf"
                        required
                        disabled={!canPdf}
                        className="bg-accent-2/50 dark:bg-card-dark focus:border-primary"
                        onChange={(e) => {
                          setFile(e.target.files?.[0] || null)
                          setProgress(0)
                          setJobStatus("idle")
                          setDownloadUrl("")
                        }}
                      />
                    {file && (
                      <p className="text-xs text-primary mt-1 font-semibold flex items-center gap-1">
                        <FileTextIcon className="w-4 h-4" /> {file.name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={emphasis} onChange={(e) => setEmphasis(e.target.checked)} />
                      ¿Querés enfatizar algún punto?
                    </label>
                    {emphasis && (
                      <Textarea
                        placeholder="Fisiopatología, diagnóstico diferencial..."
                        value={points}
                        onChange={(e) => setPoints(e.target.value)}
                      />
                    )}
                  </div>

                    <Button
                      type="submit"
                      disabled={loadingForm || !canPdf}
                      className="w-full bg-primary hover:bg-primary-dark text-primary-foreground font-bold py-3 rounded-lg shadow-button hover:shadow-cardHover transition-all flex items-center justify-center gap-2 text-lg"
                    >
                      {loadingForm ? (
                        <>
                          <Sparkles className="animate-spin w-5 h-5 sm:w-6 sm:h-6" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <span role="img" aria-label="rocket">🚀</span> Enviar PDF
                        </>
                      )}
                    </Button>

                    {/* Sugerencia si alcanzó el límite */}
                    {!canPdf && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#FFE06622] text-accent border-l-4 border-accent rounded-lg px-3 py-2 mt-2 flex gap-2 items-center text-sm"
                      >
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>
                          Alcanzaste tu límite de PDFs este mes.
                          <Link href="/upgrade" className="ml-1 underline font-semibold hover:text-primary">
                            Mejorá tu plan
                          </Link>
                        </span>
                      </motion.div>
                    )}
                  </form>

                  <div className="text-xs text-text-secondary text-center pt-2">
                    Funciona mejor con PDFs legibles o subrayados.<br />
                  ¿Problemas? <Link href="/ayuda" className="underline text-primary hover:text-primary-dark transition">Ir a la ayuda</Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

              {/* Ventajas de Apunty */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="w-full mt-8"
              >
              <Card className="bg-[var(--card-feature)] border-none shadow-card rounded-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary text-xl">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" /> ¿Por qué usar Apunty PDF?
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-4">
                  {ventajas.map((v, i) => (
                    <div
                      key={i}
                      className="
                        flex-1 flex flex-col items-start gap-2
                        bg-[var(--card-feature)] border border-[var(--card-feature-border)]
                        p-4 rounded-2xl shadow-card transition
                        hover:scale-105 hover:shadow-lg
                      "
                      style={{
                        color: "var(--card-feature-text)",
                        minWidth: 0,
                      }}
                    >
                      <div className="mb-1 text-[var(--card-feature-title)]">{v.icon}</div>
                      <div className="text-base font-bold text-[var(--card-feature-title)]">{v.title}</div>
                      <div className="text-sm text-[var(--card-feature-desc)]">{v.desc}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

              {/* Cómo usar Apunty PDF */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className="w-full mt-6"
              >
              <Card className="w-full bg-[var(--card)] dark:bg-[var(--card-dark)] border border-[var(--border)] shadow-card rounded-2xl">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <Info className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  <CardTitle className="text-lg font-bold text-[var(--card-foreground)]">
                    ¿Cómo usar Apunty PDF?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-[var(--text-secondary)] space-y-2">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Seleccioná un archivo PDF desde tu computadora.</li>
                    <li>El archivo debe ser legible o subrayado digitalmente (no escaneado a mano).</li>
                    <li>
                      Presioná el botón <span className="font-semibold text-primary">“Enviar PDF”</span>.
                    </li>
                    <li>Esperá mientras generamos el apunte.</li>
                    <li>Recibirás el enlace de descarga apenas esté listo.</li>
                  </ol>
                  <p className="pt-2 text-xs">
                    <span className="font-semibold text-primary">Tip:</span> Si tu archivo es escaneado o tiene mala calidad, es posible que no funcione correctamente.
                  </p>
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
