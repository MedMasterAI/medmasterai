"use client"

import Link from "next/link"
import { FileText, Clapperboard, Files } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/hooks/useAuth"
import { useUserNotes } from "@/hooks/useUserNotes"
import CardItem from "@/components/dashboard/CardItem"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const { user } = useAuth()
  const { notes } = useUserNotes(user?.uid ?? null)

  const weeklyProgress = notes.reduce((acc: Record<string, number>, note) => {
    const date = new Date(note.createdAt?.toDate?.() || note.createdAt)
    const dayName = date.toLocaleDateString("es-AR", { weekday: "long" })
    acc[dayName] = (acc[dayName] || 0) + 1
    return acc
  }, {})

  const diasSemana = ["lunes", "martes", "miércoles", "jueves", "viernes"]

  const ultimosApuntes = [...notes]
    .sort(
      (a, b) =>
        new Date(b.createdAt?.toDate?.() || b.createdAt).getTime() -
        new Date(a.createdAt?.toDate?.() || a.createdAt).getTime()
    )
    .slice(0, 3)

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full px-4 py-10 md:px-8 mx-auto max-w-6xl space-y-10"
    >
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">
          Bienvenido, {user?.displayName ?? "MedMaster"}
        </h1>
        <p className="text-muted-foreground">
          Accedé rápidamente a tus herramientas de estudio
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <CardItem
          href="/dashboard/apunty"
          icon={FileText}
          title="Apunty PDF"
          description="Resúmenes desde PDF"
        />
        <CardItem
          href="/dashboard/videoai"
          icon={Clapperboard}
          title="VideoAI"
          description="Transcripciones desde video"
        />
        <CardItem
          href="/dashboard/mis-apuntes"
          icon={Files}
          title="Mis Apuntes"
          description="Historial generado"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-background/70 backdrop-blur shadow-md">
          <CardHeader>
            <CardTitle>Tu progreso esta semana</CardTitle>
            <CardDescription>Apuntes generados por día</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {diasSemana.map((day) => (
              <div key={day}>
                <div className="flex justify-between text-sm mb-1 capitalize">
                  <span>{day}</span>
                  <span>{weeklyProgress[day] || 0} apuntes</span>
                </div>
                <Progress value={Math.min((weeklyProgress[day] || 0) * 10, 100)} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-background/70 backdrop-blur shadow-md">
          <CardHeader>
            <CardTitle>Últimos Apuntes Generados</CardTitle>
            <CardDescription>Mostrando tus apuntes más recientes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {ultimosApuntes.length > 0 ? (
              <ul className="space-y-2">
                {ultimosApuntes.map((note) => (
                  <li key={note.id} className="flex flex-col border-b pb-2">
                    <span className="font-medium">{note.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(
                        note.createdAt?.toDate?.() || note.createdAt
                      ).toLocaleString()}
                    </span>
                    {note.url && (
                      <Button variant="link" size="sm" asChild>
                        <Link
                          href={note.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Ver Apunte
                        </Link>
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Aún no generaste apuntes.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.section>
  )
}
