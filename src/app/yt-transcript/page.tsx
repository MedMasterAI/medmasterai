'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function YTTranscriptPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  useEffect(() => {
    document.documentElement.classList.add('dark')
    return () => document.documentElement.classList.remove('dark')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setDownloadUrl(null)
    try {
      const res = await fetch('/api/yt-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: url })
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error al procesar el video')
      }
      const blob = await res.blob()
      const link = URL.createObjectURL(blob)
      setDownloadUrl(link)
      toast.success('Transcripción generada')
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground p-4">
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md bg-card p-6 rounded-xl shadow-lg">
        <div className="space-y-2">
          <Label htmlFor="url">URL de YouTube</Label>
          <Input
            id="url"
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Procesando…' : 'Obtener transcripción'}
        </Button>
        {downloadUrl && (
          <div className="text-center pt-2">
            <a href={downloadUrl} download="transcripcion.txt" className="text-primary underline font-semibold">
              Descargar TXT
            </a>
          </div>
        )}
      </form>
    </div>
  )
}
