"use client"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { deleteDoc, doc, getFirestore } from "firebase/firestore"
import { getFirebaseApp } from "@/lib/firebase"

interface Note {
  id: string
  title: string
  createdAt: string
  url?: string
}

export function NotesList({ notes }: { notes: Note[] }) {
  const router = useRouter()
  const db = getFirestore(getFirebaseApp())

  const handleDelete = async (noteId: string) => {
    const confirm = window.confirm("¿Estás seguro de que querés eliminar este apunte?")
    if (!confirm) return

    try {
      await deleteDoc(doc(db, `users/${noteId.split("_")[0]}/notes/${noteId}`))
      toast.success("✅ Apunte eliminado correctamente.")
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error("❌ Hubo un error al eliminar el apunte.")
    }
  }


  return (
    <ul className="space-y-4">
      {notes.map((note) => (
        <li key={note.id} className="p-4 border rounded-md shadow-sm bg-card space-y-2">
          <div>
            <p className="font-semibold">{note.title}</p>
            <p className="text-sm text-muted-foreground">{note.createdAt}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {note.url && (
              <Button asChild size="sm" variant="secondary">
                <a href={note.url} target="_blank" rel="noopener noreferrer">
                  📄 Ver Apunte
                </a>
              </Button>
            )}


            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDelete(note.id)}
            >
              🗑️ Eliminar
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}
