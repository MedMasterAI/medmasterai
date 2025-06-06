'use client'
import { Loader2 } from "lucide-react"
import { useUserNotes } from "@/hooks/useUserNotes"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import { useUserPlan } from "@/hooks/useUserPlan"
import Link from "next/link"
import { PremiumOnly } from "@/components/auth/PremiumOnly"
import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { RocketIcon, FileTextIcon, VideoIcon } from "lucide-react"
import Image from "next/image"

export default function DashboardPage() {
  const { user } = useAuth()
  const { plan, isNearExpiration, daysLeft, isActive, loading: loadingPlan } = useUserPlan(user?.uid ?? null)
  const { notes, loading: loadingNotes } = useUserNotes(
    (plan === "pro" || plan === "unlimited") ? user?.uid ?? null : null
  )

  if (loadingPlan) {
    return (
      <SidebarProvider className="flex flex-col min-h-screen">
        <div className="flex flex-1 min-h-screen">
          <AppSidebar />
          <SidebarInset className="flex-1 min-h-screen w-full flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center gap-4"
            >
             <Loader2 className="w-10 h-10 text-primary animate-spin" />
             <span className="text-lg font-semibold text-[#cfcff8]">Cargando tu dashboard...</span>
            </motion.div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    )
  }
  

  const weeklyProgress = notes.reduce((acc: Record<string, number>, note) => {
    const date = new Date(note.createdAt?.toDate?.() || note.createdAt)
    const dayName = date.toLocaleDateString('es-AR', { weekday: 'long' })
    acc[dayName] = (acc[dayName] || 0) + 1
    return acc
  }, {})

  const diasSemana = ["lunes", "martes", "miércoles", "jueves", "viernes"]

  const ultimosApuntes = [...notes]
    .sort((a, b) => new Date(b.createdAt?.toDate?.() || b.createdAt).getTime() - new Date(a.createdAt?.toDate?.() || a.createdAt).getTime())
    .slice(0, 3)

  return (
    <SidebarProvider>
      <div className="relative flex flex-1 min-h-screen overflow-x-hidden">
        {/* Fondo principal */}
        

        <AppSidebar />

        <SidebarInset className="px-4 py-10 md:px-8">
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-5xl space-y-10 mx-auto"
          >
            <Card className="shadow-lg border border-[#23243A] bg-[#191930d9] rounded-2xl w-full backdrop-blur-[2px]">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl text-white">
                  Bienvenido, {user?.displayName || "Usuario"}
                </CardTitle>
                <CardDescription className="text-base text-[#cfcff8]">
                  Accedé a tus herramientas de estudio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {(plan === "pro" || plan === "unlimited") && isNearExpiration && (
                  <div className="bg-yellow-100 text-yellow-800 p-3 rounded-md text-sm text-center">
                    ⏳ Tu plan Plus vence en {daysLeft} día{daysLeft !== 1 ? "s" : ""}. <Link href="/upgrade" className="underline">Renová ahora</Link>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  <Link
                    href="/dashboard/apunty"
                    className="rounded-2xl bg-[#5d28f0] hover:bg-[#5A3DAA] text-white p-6 flex flex-col items-center gap-2 shadow-md transition-all"
                  >
                    <FileTextIcon className="w-10 h-10 mb-1" />
                    <span className="text-base font-semibold">Apunty PDF</span>
                    <span className="text-sm opacity-80 text-center leading-tight">Resúmenes desde PDF</span>
                  </Link>

                  <Link
                    href="/dashboard/videoai"
                    className="rounded-2xl bg-[#5d28f0] hover:bg-[#5A3DAA] text-white p-6 flex flex-col items-center gap-2 shadow-md transition-all"
                  >
                    <VideoIcon className="w-10 h-10 mb-1" />
                    <span className="text-base font-semibold">VideoAI</span>
                    <span className="text-sm opacity-80 text-center leading-tight">Transcripciones desde video</span>
                  </Link>

                  <Link
                    href="/dashboard/mis-apuntes"
                    className="rounded-2xl bg-[#5d28f0] hover:bg-[#5A3DAA] text-white p-6 flex flex-col items-center gap-2 shadow-md transition-all"
                  >
                    <FileTextIcon className="w-10 h-10 mb-1" />
                    <span className="text-base font-semibold">Mis Apuntes</span>
                    <span className="text-sm opacity-80 text-center leading-tight">Historial generado</span>
                  </Link>
                </div>

                {plan === "free" && (
                  <div className="text-center pt-4 text-sm text-[#b0aef0]">
                    ¿Querés funciones ilimitadas?<br />
                    <Button asChild variant="default" className="mt-2 bg-[#7C5BF6] hover:bg-[#6F4DDB] text-white font-semibold shadow-sm rounded-full px-5 py-2">
                      <Link href="/upgrade">🚀 Activar Plus</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-sm rounded-xl border border-[#23243A] bg-[#191930e8] backdrop-blur">
                <CardHeader>
                  <CardTitle className="md-2 font-semibold text-white">Tu progreso esta semana</CardTitle>
                  <CardDescription className="text-[#cfcff8]">Resúmenes generados por día</CardDescription>
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

              <Card className="shadow-sm rounded-xl border border-[#23243A] bg-[#191930e8] backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-md text-white">Últimos Apuntes Generados</CardTitle>
                  <CardDescription className="text-[#cfcff8]">Mostrando tus apuntes más recientes</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-[#cfcff8] space-y-4">
                  {loadingNotes ? (
                    <p>Cargando apuntes...</p>
                  ) : ultimosApuntes.length > 0 ? (
                    <ul className="space-y-2">
                      {ultimosApuntes.map(note => (
                        <li key={note.id} className="flex flex-col border-b border-[#23243A] pb-2">
                          <span className="font-medium text-white">{note.title}</span>
                          <span className="text-xs text-[#bdbdf3]">
                            {new Date(note.createdAt?.toDate?.() || note.createdAt).toLocaleString()}
                          </span>
                          {note.url && (
                            <Button asChild variant="link" className="w-fit p-0 h-auto text-[#a990ff] text-sm">
                              <a href={note.url} target="_blank" rel="noopener noreferrer">Ver Apunte</a>
                            </Button>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[#bdbdf3]">Aún no generaste apuntes.</p>
                  )}
                  <div className="pt-2 text-right">
                    <Button asChild variant="ghost" size="sm" className="text-[#a990ff]">
                      <Link href="/dashboard/mis-apuntes">Ver todos</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.section>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
