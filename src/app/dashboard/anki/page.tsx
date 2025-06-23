'use client'

import { useState } from 'react'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function Page() {
  const user = useRequireAuth()
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [emphasis, setEmphasis] = useState(false)
  const [points, setPoints] = useState('')
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  const handleFile = (f: File | null) => {
    if (!f) return
    if (f.type !== 'text/plain') {
      toast.error('Solo se permiten archivos .txt')
      return
    }
    if (f.size > 50 * 1024 * 1024) {
      toast.error('El archivo supera el límite de 50MB')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      setText(String(e.target?.result || ''))
    }
    reader.readAsText(f, 'UTF-8')
    setFile(f)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) {
      toast.error('Ingresa texto válido')
      return
    }
    setLoading(true)
    setDownloadUrl(null)
    try {
      const res = await fetch('/api/anki', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, emphasis: emphasis ? points : '' })
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error al generar el archivo')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
      toast.success('¡Listo! Archivo para Anki generado.')
    } catch (err: any) {
      toast.error(err.message)
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
          <Card className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Generar Flashcards Anki</CardTitle>
              <CardDescription>Pegá tu texto o subí un .txt y descargá el archivo listo para Anki.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="text">Texto</Label>
                  <Textarea id="text" value={text} onChange={(e) => setText(e.target.value)} rows={8} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">o Archivo .txt</Label>
                  <Input id="file" type="file" accept="text/plain" onChange={(e) => handleFile(e.target.files?.[0] || null)} />
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
              </form>
              {downloadUrl && (
                <div className="text-center pt-2">
                  <a href={downloadUrl} download="flashcards.txt" className="text-primary underline font-semibold">Descargar archivo</a>
                </div>
              )}
            </CardContent>
          </Card>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
