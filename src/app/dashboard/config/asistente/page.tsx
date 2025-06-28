"use client"
import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface Msg {
  role: "user" | "assistant"
  text: string
}

export default function AsistentePage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement | null>(null)

  const send = async () => {
    if (!user || !input.trim()) return
    const question = input.trim()
    setMessages((prev) => [...prev, { role: "user", text: question }])
    setInput("")
    setLoading(true)
    try {
      const token = await user.getIdToken()
      const res = await fetch("/api/asistente", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question }),
      })
      const data = await res.json()
      const text = res.ok ? data.answer : data.error || "Error"
      setMessages((prev) => [...prev, { role: "assistant", text }])
    } catch (err) {
      console.error(err)
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Error al consultar" },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] max-w-2xl mx-auto flex flex-col py-6">
      <Card className="flex-1 overflow-hidden">
        <CardHeader>
          <CardTitle>Asistente</CardTitle>
        </CardHeader>
        <CardContent className="h-full overflow-y-auto space-y-4 pb-28">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`rounded-lg px-3 py-2 text-sm max-w-[80%] whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </CardContent>
      </Card>
      <div className="mt-4 flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Escribí tu mensaje"
          className="flex-1 min-h-[60px]"
        />
        <Button onClick={send} disabled={!user || loading} className="self-end">
          {loading ? "Enviando..." : "Enviar"}
        </Button>
      </div>
    </div>
  )
}

