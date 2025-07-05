'use client'

import { useState, useEffect, useRef } from 'react'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { toast } from 'sonner'
import { ERROR_CODES, formatErrorMessage } from '@/lib/errorCodes'
import { Loader2, Sparkles, FileTextIcon, CheckCircle, BookCopy } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Page() {
  const user = useRequireAuth()
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [emphasis, setEmphasis] = useState(false)
  const [points, setPoints] = useState('')
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout>()

  const features = [
    {
      icon: <CheckCircle className="text-accent w-5 h-5 sm:w-6 sm:h-6" />,
      title: 'Organización automática',
      desc: 'Convertí apuntes largos en tarjetas claras y jerarquizadas.'
    },
    {
      icon: <FileTextIcon className="text-primary w-5 h-5 sm:w-6 sm:h-6" />,
      title: 'Soporte de archivos',
      desc: 'Subí TXT, PDF o PPTX y evitá copiar y pegar manualmente.'
    },
    {
      icon: <BookCopy className="text-primary w-5 h-5 sm:w-6 sm:h-6" />,
      title: 'Listo para estudiar',
      desc: 'Descargá un archivo importable en Anki al instante.'
    },
  ]
  
  useEffect(() => {
    if (loading) {
      intervalRef.current = setInterval(() => {
        setProgress((p) => (p < 95 ? p + 5 : p))
      }, 500)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [loading])

  const handleFile = (f: File | null) => {
    if (!f) return
    if (f.size > 50 * 1024 * 1024) {
      toast.error('El archivo supera el límite de 50MB')
      return
    }
    if (f.type === 'text/plain') {
      const reader = new FileReader()
      reader.onload = (e) => {
        setText(String(e.target?.result || ''))
      }
      reader.readAsText(f, 'UTF-8')
    } else if (f.type === 'application/pdf' || f.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || f.type === 'application/vnd.ms-powerpoint') {
      // El procesamiento de PDF se hace en el servidor; para PPTX mostramos solo el nombre
    } else {
      toast.error('Solo se permiten archivos .txt, .pdf o .pptx')
      return
    }
    setFile(f)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() && !file) {
      toast.error('Ingresa texto o subí un archivo')
      return
    }
    setLoading(true)
    setProgress(5)
    setDownloadUrl(null)
    try {
      let res: Response
      if (file) {
        const formData = new FormData()
        formData.append('emphasis', emphasis ? points : '')
        formData.append('text', text)
        formData.append('file', file)
        res = await fetch('/api/anki', {
          method: 'POST',
          body: formData
        })
      } else {
        res = await fetch('/api/anki', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, emphasis: emphasis ? points : '' })
        })
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error al generar el archivo')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
      setProgress(100)
      toast.success('¡Listo! Archivo para Anki generado.')
    } catch (err: any) {
      console.error(err)
      toast.error(formatErrorMessage(ERROR_CODES.ANKI_PROCESS))
      setProgress(0)
    } finally {
      setLoading(false)
    }
  }

  if (user === undefined) {
    return <div className="p-8 text-center">Cargando…</div>
  }
  if (!user) return null

  return (
    <SidebarProvider className="flex flex-col">
      <div className="flex flex-1">
        <SidebarInset className="px-2 sm:px-6 md:px-12 py-10 w-full flex flex-col items-center">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-3xl text-center mb-10 p-8 md:p-12 rounded-3xl relative overflow-hidden bg-card border border-border shadow-lg bg-[url('/fondo-ondas.png')] bg-cover bg-center"
          >
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="bg-primary/10 rounded-full p-4 mx-auto">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Generá Flashcards Anki
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Pegá tu texto o subí un PDF y obtené tarjetas de estudio listas para importar.
              </p>
            </div>
          </motion.div>

          {/* Formulario principal */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl"
          >
            <Card className="bg-card border border-border shadow-card rounded-2xl">
              <CardHeader className="text-center flex flex-col items-center gap-2">
                <CardTitle className="text-xl flex items-center gap-2 font-bold text-primary">
                  <Sparkles className="w-5 h-5" /> Generar Flashcards
                </CardTitle>
                <CardDescription>Ingresá tu texto o subí un archivo.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="text">Texto</Label>
                    <Textarea id="text" value={text} onChange={(e) => setText(e.target.value)} rows={8} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="file" className="flex items-center gap-2">
                      <FileTextIcon className="w-4 h-4" /> Archivo .txt, .pdf o .pptx
                    </Label>
                    <Input
                      id="file"
                      type="file"
                      accept="text/plain,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint"
                      onChange={(e) => handleFile(e.target.files?.[0] || null)}
                    />
                    {file && <p className="text-xs text-primary mt-1 font-semibold">{file.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={emphasis} onChange={(e) => setEmphasis(e.target.checked)} />
                      ¿Querés enfatizar algún punto?
                    </label>
                    {emphasis && (
                      <Textarea placeholder="Fisiopatología, diagnóstico diferencial..." value={points} onChange={(e) => setPoints(e.target.value)} />
                    )}
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                      <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</span>
                    ) : (
                      'Generar Flashcards'
                    )}
                  </Button>
                  {(loading || progress > 0) && (
                    <div className="space-y-1">
                      <Progress value={progress} />
                      <p className="text-xs text-center text-muted-foreground">{progress}%</p>
                      {loading && (
                        <p className="text-xs text-center text-muted-foreground">Procesando, por favor no cierres la ventana o pestaña.</p>
                      )}
                    </div>
                  )}
                </form>
                {downloadUrl && (
                  <div className="text-center pt-2">
                    <a href={downloadUrl} download="flashcards.txt" className="text-primary underline font-semibold">Descargar archivo</a>
                  </div>
                )}
                <div className="text-xs text-center text-muted-foreground border border-dashed rounded-md p-2 mt-4">
                  Solo aceptamos archivos <b>.pdf</b> o <b>.pptx</b> que contengan texto extraíble.
                  Si el documento no incluye texto (por ejemplo, un escaneo sin OCR) no podremos procesarlo.
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Ventajas */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="w-full mt-8"
          >
            <Card className="bg-[var(--card-feature)] border-none shadow-card rounded-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary text-xl">
                  <BookCopy className="w-5 h-5 sm:w-6 sm:h-6" /> ¿Por qué usar AnkiAI?
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row gap-4">
                {features.map((f, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-start gap-2 bg-[var(--card-feature)] border border-[var(--card-feature-border)] p-4 rounded-2xl shadow-card transition hover:scale-105 hover:shadow-lg"
                    style={{ color: 'var(--card-feature-text)', minWidth: 0 }}
                  >
                    <div className="mb-1 text-[var(--card-feature-title)]">{f.icon}</div>
                    <div className="text-base font-bold text-[var(--card-feature-title)]">{f.title}</div>
                    <div className="text-sm text-[var(--card-feature-desc)]">{f.desc}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
