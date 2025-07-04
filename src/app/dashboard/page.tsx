"use client"

import Link from "next/link";
import { FaRobot, FaVideo, FaFileAlt, FaMagic, FaMicrophone } from "react-icons/fa";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useUserNotes } from "@/hooks/useUserNotes";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useMonthlyUsage } from "@/hooks/useMonthlyUsage";
import CardItem from "@/components/dashboard/CardItem";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PLAN_LIMITS } from "@/lib/plans";

export default function DashboardPage() {
  const { user } = useAuth();
  const { notes } = useUserNotes(user?.uid ?? null);
  const { plan } = useUserPlan(user?.uid ?? null);
  const { pdfCount, videoCount } = useMonthlyUsage(user?.uid ?? null, plan);
  const weeklyProgress = notes.reduce((acc: Record<string, number>, note) => {
    const date = new Date(note.createdAt?.toDate?.() || note.createdAt);
    const dayName = date.toLocaleDateString("es-AR", { weekday: "long" });
    acc[dayName] = (acc[dayName] || 0) + 1;
    return acc;
  }, {});

  const diasSemana = ["lunes", "martes", "miércoles", "jueves", "viernes"];

  const ultimosApuntes = [...notes]
  .sort(
    (a, b) =>
      new Date(b.createdAt?.toDate?.() || b.createdAt).getTime() -
      new Date(a.createdAt?.toDate?.() || a.createdAt).getTime(),
    )
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full px-4 py-10 md:px-8 max-w-6xl mx-auto space-y-10"
      >
        {/* Mensaje de bienvenida */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-primary">
            Bienvenido, {user?.displayName ?? "MedMaster"}
          </h1>
          <p className="text-muted-foreground">
            Accedé rápidamente a tus herramientas de estudio
          </p>
        </div>

        {/* Tarjetas de acceso rápido */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <CardItem
            href="/dashboard/apunty"
            icon={FaRobot}
            title="Apunty PDF"
            description="Resúmenes desde PDF"
          />
          <CardItem
            href="/dashboard/videoai"
            icon={FaVideo}
            title="VideoAI"
            description="Transcripciones desde video"
          />
          <CardItem
            href="/dashboard/anki"
            icon={FaMagic}
            title="AnkiAI"
            description="Flashcards automáticas"
          />
          <CardItem
            href="/dashboard/mis-apuntes"
            icon={FaFileAlt}
            title="Mis Apuntes"
            description="Historial generado"
          />
          <CardItem
            href="/dashboard/audioai"
            icon={FaMicrophone}
            title="AudioAI"
            description="Convierte audio en apuntes"
          />
        </div>

        {/* Sección inferior */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {/* Progreso semanal */}
          <Card className="backdrop-blur-xl shadow-card">
            <CardHeader>
              <CardTitle className="text-xl">Tu progreso esta semana</CardTitle>
              <CardDescription>Apuntes generados por día</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {diasSemana.map((day) => (
                <div key={day}>
                  <div className="flex justify-between text-sm mb-1 capitalize">
                    <span>{day}</span>
                    <span>{weeklyProgress[day] || 0} apuntes</span>
                  </div>
                  <Progress
                    value={Math.min((weeklyProgress[day] || 0) * 10, 100)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Últimos apuntes */}
          <Card className="backdrop-blur-xl shadow-card">
            <CardHeader>
            <CardTitle className="text-xl">
                Últimos Apuntes Generados
              </CardTitle>
              <CardDescription>
                Mostrando tus apuntes más recientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {ultimosApuntes.length > 0 ? (
                <ul className="space-y-2">
                  {ultimosApuntes.map((note) => (
                    <li
                    key={note.id}
                    className="flex flex-col border-b pb-2 border-border"
                  >
                      <span className="font-medium">{note.title}</span>
                      <span className="text-xs text-muted-foreground">
                      {new Date(
                          note.createdAt?.toDate?.() || note.createdAt,
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
                <p className="text-muted-foreground">
                Aún no generaste apuntes.
              </p>
              )}
            </CardContent>
          </Card>

          {/* Estado del plan */}
          <Card className="backdrop-blur-xl shadow-card">
            <CardHeader>
              <CardTitle className="text-xl">Tu Plan Actual</CardTitle>
              <CardDescription>Uso de este mes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>
                Plan: <span className="font-semibold uppercase">{plan}</span>
              </p>
              <p>
                PDFs usados: <b>{pdfCount}</b> /{" "}
                {PLAN_LIMITS[plan].pdf === Infinity
                  ? "∞"
                  : PLAN_LIMITS[plan].pdf}
              </p>
              <p>
                Videos usados: <b>{videoCount}</b> /{" "}
                {PLAN_LIMITS[plan].video === Infinity
                  ? "∞"
                  : PLAN_LIMITS[plan].video}
              </p>
              <Button asChild className="w-full">
                <Link href="/pagos">Cambiar plan</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.section>
    </div>
  );
}