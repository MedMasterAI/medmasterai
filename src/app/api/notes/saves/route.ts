import { dbAdmin } from "@/lib/firebase-admin"
import { NextResponse } from "next/server"
import { getAuth } from "firebase-admin/auth"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || ""
    if (!authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token requerido" }, { status: 401 })
    }
    const token = authHeader.split(" ")[1]
    const decoded = await getAuth().verifyIdToken(token)
    const uid = decoded.uid

    const { title, url, type } = await req.json()
    if (!title || !url || !type) {
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
