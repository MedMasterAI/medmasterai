// src/app/soporte/page.tsx
'use client'

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export default function SoportePage() {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    mensaje: "",
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const resp = await fetch("/api/send-support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!resp.ok) throw new Error("No se pudo enviar el mensaje")
      toast.success("Mensaje enviado. Te responderemos pronto.")
      setForm({ nombre: "", email: "", mensaje: "" })
    } catch (err) {
      toast.error("No se pudo enviar el mensaje. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }
  

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground transition-colors duration-300 px-4">
      <Card className="w-full max-w-lg shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Soporte y Ayuda</CardTitle>
          <p className="text-center text-muted-foreground mt-1">
            ¿Dudas, problemas o sugerencias? Contactanos por WhatsApp o desde este formulario.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="mensaje">Mensaje</Label>
              <Textarea id="mensaje" name="mensaje" rows={4} value={form.mensaje} onChange={handleChange} required />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Enviando…" : "Enviar Mensaje"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <span className="block mb-2">¿Prefieres WhatsApp?</span>
            <a
              href="https://wa.me/5491123456789?text=Hola!%20Necesito%20ayuda%20con%20MedMaster."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-500 text-white px-4 py-2 rounded-xl font-semibold shadow hover:bg-green-600 transition"
            >
              Contactar por WhatsApp
            </a>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
