"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function Page() {
  const [videoUrl, setVideoUrl] = useState("")
  const [transcript, setTranscript] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTranscript(null)
    setLoading(true)
    try {
      const res = await fetch("/api/audioai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl })
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      setTranscript(data.transcript)
    } catch (err) {
      console.error(err)
      alert("Error procesando video")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Probar extracción de audio</CardTitle>
          <CardDescription>Descarga el audio de YouTube y transcribe con Gemini</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="videoUrl">URL de YouTube</Label>
              <Input
                id="videoUrl"
                type="url"
                required
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Procesando..." : "Extraer y Transcribir"}
            </Button>
          </form>
          {transcript && (
            <div className="mt-4 whitespace-pre-wrap p-2 border rounded">
              {transcript}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
