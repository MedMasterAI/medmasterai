"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function AsistentePage() {
  const { user } = useAuth()
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(false)

  const send = async () => {
    if (!user || !question.trim()) return
    setLoading(true)
    setAnswer("")
    try {
      const token = await user.getIdToken()
      const res = await fetch("/api/asistente", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ question })
      })
      const data = await res.json()
      if (res.ok) {
        setAnswer(data.answer)
      } else {
        setAnswer(data.error || "Error")
      }
    } catch (err) {
      console.error(err)
      setAnswer("Error al consultar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto py-10 space-y-4">
      <h1 className="text-2xl font-bold">Asistente</h1>
      <Textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Escribí tu pregunta"
      />
      <Button onClick={send} disabled={!user || loading}>
        {loading ? "Consultando..." : "Enviar"}
      </Button>
      {answer && (
        <div className="whitespace-pre-wrap border rounded-md p-4 bg-muted">
          {answer}
        </div>
      )}
    </div>
  )
}
