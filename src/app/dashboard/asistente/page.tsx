"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function AsistentePage() {
  const { user } = useAuth()
  const [question, setQuestion] = useState("")
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([])

  const send = async () => {
    if (!user || !question.trim()) return
    const q = question.trim()
    setQuestion("")
    setMessages(msgs => [...msgs, { role: "user", text: q }])
    setLoading(true)
    try {
      const token = await user.getIdToken()
      const res = await fetch("/api/asistente", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ question: q })
      })
      const data = await res.json()
      if (res.ok) {
        setMessages(msgs => [...msgs, { role: "assistant", text: data.answer }])
      } else {
        setMessages(msgs => [...msgs, { role: "assistant", text: data.error || "Error" }])
      }
    } catch (err) {
      console.error(err)
      setMessages(msgs => [...msgs, { role: "assistant", text: "Error al consultar" }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <SidebarProvider className="flex flex-col">
      <div className="flex flex-1">
        <SidebarInset className="px-2 sm:px-6 md:px-12 py-10 w-full">
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="bg-card border border-border shadow-md">
              <CardHeader>
                <CardTitle>Asistente Inteligente</CardTitle>
                <CardDescription>
                  Consultá tus dudas en lenguaje natural. Evitá compartir datos personales.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p className="font-semibold mb-1">Consejos:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Redactá preguntas claras y específicas.</li>
                    <li>Podés escribir en español.</li>
                    <li>No incluyas información sensible.</li>
                  </ul>
                </div>

                {messages.length > 0 && (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto border border-border rounded-lg p-3 bg-muted/50">
                    {messages.map((m, i) => (
                      <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                        <span className="whitespace-pre-wrap text-sm">{m.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribí tu pregunta aquí..."
                  className="min-h-[90px]"
                />
                <Button onClick={send} disabled={!user || loading || !question.trim()} className="w-full">
                  {loading ? "Consultando..." : "Enviar"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
