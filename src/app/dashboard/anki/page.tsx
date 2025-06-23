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
import { Loader2, Sparkles, FileTextIcon } from 'lucide-react'
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
    } else if (f.type !== 'application/pdf') {
      toast.error('Solo se permiten archivos .txt o .pdf')
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
      toast.error(err.message)
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
        <SidebarInset className="px-4 py-10 w-full flex flex-col items-center">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="w-full">
          <Card className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-md">
            <CardHeader className="text-center flex flex-col items-center gap-2">
              <CardTitle className="text-2xl flex items-center gap-2 font-bold text-primary">
                <Sparkles className="w-5 h-5" /> Generar Flashcards Anki
              </CardTitle>
              <CardDescription>Pegá tu texto o subí un .txt o .pdf y descargá el archivo listo para Anki.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="text">Texto</Label>
                  <Textarea id="text" value={text} onChange={(e) => setText(e.target.value)} rows={8} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file" className="flex items-center gap-2">
                    <FileTextIcon className="w-4 h-4" /> Archivo .txt o .pdf
                  </Label>
                  <Input
                    id="file"
                    type="file"
                    accept="text/plain,application/pdf"
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
                  </div>
                )}
              </form>
              {downloadUrl && (
                <div className="text-center pt-2">
                  <a href={downloadUrl} download="flashcards.txt" className="text-primary underline font-semibold">Descargar archivo</a>
                </div>
              )}
            </CardContent>
          </Card>
          </motion.div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
