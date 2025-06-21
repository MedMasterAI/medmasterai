"use client"

import Link from "next/link"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, FileTextIcon, Brain, Eye, Loader2, Info } from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/hooks/useAuth"
import { useUserNotes } from "@/hooks/useUserNotes"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

export default function MisApuntesPage() {
  const { user } = useAuth()
  const { notes, loading } = useUserNotes(user?.uid ?? null)
  const [loadingNoteId, setLoadingNoteId] = useState<string | null>(null)
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null)

  const generarFlashcards = async (noteId: string, text: string) => {
    if (!user?.uid) return
    setLoadingNoteId(noteId)
    try {
      const res = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid, noteId, text }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al generar flashcards.")
      toast.success("🧠 Flashcards generadas correctamente.")
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoadingNoteId(null)
    }
  }

  const toggleFlashcards = (noteId: string) => {
    setExpandedNoteId(expandedNoteId === noteId ? null : noteId)
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <SidebarInset className="w-full max-w-5xl mx-auto px-4 md:px-8 py-10 flex flex-col items-center">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-3xl text-center mb-10 p-8 md:p-12 rounded-3xl relative overflow-hidden bg-card border border-border shadow-lg bg-[url('/ggr.PNG')] bg-cover bg-center"
          >
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="bg-primary/10 rounded-full p-4 mx-auto">
                <FileTextIcon className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Tus Apuntes Generados
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Accedé a tu historial de apuntes generados por IA, descargá tus PDFs y creá flashcards inteligentes.
              </p>
            </div>
          </motion.div>

          {/* Estado de carga */}
          {loading && (
            <div className="flex flex-col items-center py-14">
              <Loader2 className="animate-spin w-8 h-8 text-primary mb-3" />
              <span className="text-muted-foreground text-sm">Cargando tus apuntes...</span>
            </div>
          )}

          {/* Sin apuntes */}
          {!loading && notes.length === 0 && (
            <div className="flex flex-col items-center py-14 space-y-5">
              <Sparkles className="w-10 h-10 text-primary/80" />
              <p className="text-lg text-muted-foreground font-medium">Aún no generaste ningún apunte.</p>
              <Button asChild size="lg">
                <Link href="/dashboard/apunty">+ Generar mi primer apunte</Link>
              </Button>
            </div>
          )}

          {/* Lista de apuntes */}
          {!loading && notes.length > 0 && (
            <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-6">
              {notes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="bg-card border border-border rounded-2xl p-6 shadow-card transition-all flex flex-col h-full"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1 text-lg font-semibold">
                        <FileTextIcon className="w-5 h-5 text-primary" />
                        <span>{note.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(note.createdAt?.toDate?.() || note.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 items-center">
                      {note.status === "completed" && note.url ? (
                        <Button asChild variant="link" size="sm" className="text-accent">
                          <a href={note.url} target="_blank" rel="noopener noreferrer">
                            <FileTextIcon className="w-4 h-4 mr-1" /> Ver PDF
                          </a>
                        </Button>
                      ) : (
                        <span className="flex items-center text-sm text-muted-foreground">
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Generando PDF…
                        </span>
                      )}

                      <Button
                        size="sm"
                        onClick={() => generarFlashcards(note.id, note.rawText || "")}
                        disabled={loadingNoteId === note.id}
                      >
                        {loadingNoteId === note.id ? (
                          <span className="flex items-center gap-1">
                            <Loader2 className="animate-spin w-4 h-4" /> Generando…
                          </span>
                        ) : (
                          <span><Brain className="inline w-4 h-4 mr-1" /> Generar Flashcards</span>
                        )}
                      </Button>

                      {note.flashcards?.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFlashcards(note.id)}
                          className="text-foreground"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {expandedNoteId === note.id ? "Ocultar Flashcards" : "Ver Flashcards"}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Flashcards */}
                  <AnimatePresence>
                    {expandedNoteId === note.id && note.flashcards?.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="grid gap-3 mt-4 p-4 bg-muted rounded-xl max-h-80 overflow-y-auto border border-border"
                      >
                        {note.flashcards.map((card: any, idx: number) => (
                          <div key={idx} className="bg-background border rounded-xl p-3">
                            <p className="font-semibold mb-1">Q: {card.question || card.pregunta}</p>
                            <p className="text-sm">A: {card.answer || card.respuesta}</p>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}

          {/* Cómo funciona */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.4 }}
            className="w-full max-w-3xl mt-12"
          >
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-5 h-5 text-accent" />
                <span className="text-lg font-semibold">¿Cómo funciona esta sección?</span>
              </div>
              <ul className="list-disc pl-6 space-y-2 text-base text-muted-foreground">
                <li>Todos los apuntes generados quedan guardados si sos usuario Plus.</li>
                <li>Descargá tu PDF en cualquier momento desde “Ver PDF”.</li>
                <li>Generá flashcards inteligentes a partir de cualquier apunte con un clic.</li>
                <li>Si ya tenés flashcards, podés verlas desde “Ver Flashcards”.</li>
              </ul>
              <p className="text-sm text-muted-foreground pt-2">
                ¿Tenés problemas o sugerencias?{" "}
                <Link href="/ayuda" className="underline text-accent font-semibold hover:text-primary">
                  Ir a la ayuda
                </Link>
              </p>
            </div>
          </motion.div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}