import { dbAdmin } from "@/lib/firebase-admin"
import { NextResponse } from "next/server"
import { generateFlashcards } from "@lib/structura/generateFlashcards" // corregido el alias

export async function POST(req: Request) {
  const { uid, noteId, text } = await req.json()

  if (!uid || !noteId || !text) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
  }

  const noteRef = dbAdmin.collection("users").doc(uid).collection("notes").doc(noteId)
  const snap = await noteRef.get()

  const data = snap.data()

  if (snap.exists && data?.flashcards?.length) {
    return NextResponse.json({ flashcards: data.flashcards })
  }

  const flashcards = await generateFlashcards(text)

  await noteRef.update({ flashcards })

  return NextResponse.json({ flashcards })
}

