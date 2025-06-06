import { dbAdmin } from "@/lib/firebase-admin"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { uid, title, url, type } = await req.json()
    if (!uid || !title || !url || !type) {
      return NextResponse.json({ error: "Faltan campos" }, { status: 400 })
    }

    const ref = dbAdmin.collection("users").doc(uid).collection("notes")
    await ref.add({
      title,
      url,
      type,
      createdAt: Date.now(),
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("❌ Error al guardar apunte:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
