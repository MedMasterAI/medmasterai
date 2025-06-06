'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { BookOpen, Video, Mic, File, Sparkles, Bot } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen w-full bg-[#17172B] text-white flex flex-col items-center px-2 relative overflow-x-hidden">

      {/* HERO fondo imagen y gradiente */}
      <div className="absolute top-0 left-0 w-full h-[600px] md:h-[700px] z-0">
        <Image
          src="/maint.PNG"
          alt="Mountains"
          fill
          style={{
            objectFit: "cover",
            objectPosition: "top",
            opacity: 0.98,
            transition: "opacity 0.2s",
          }}
          priority
        />
        {/* Gradiente para fundir la imagen con el fondo oscuro */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#18182980] to-[#17172B] pointer-events-none"/>
      </div>

      {/* Header */}
      <header className="w-full flex justify-between items-center py-6 px-8 max-w-6xl z-10">
        <div className="flex items-center gap-3">
          <Image src="/logo2.png" alt="MedMaster" width={90} height={90} className="rounded-lg" />
        </div>
        <Link href="/login">
          <Button
            variant="outline"
            className="border-white/10 text-white/90 bg-[#191930] hover:bg-[#22213c] hover:text-purple-300 transition rounded-xl px-7 py-2 font-semibold shadow-none"
          >
            Ingresar
          </Button>
        </Link>
      </header>

      {/* HERO */}
      <section className="z-10 flex flex-col items-center w-full mt-8 mb-2" style={{ minHeight: 340, paddingTop: 32 }}>
        <motion.h1
          initial={{ opacity: 0, y: -22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-6xl font-extrabold text-center tracking-tight leading-tight bg-gradient-to-r from-[#a990ff] via-[#3b316a] to-[#f3c9fa] bg-clip-text text-transparent drop-shadow-md"
        >
          Aprendé más rápido,<br /> como nunca antes.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.23 }}
          className="mt-7 text-lg md:text-2xl text-[#f4f1ff] text-center max-w-2xl font-medium drop-shadow"
        >
          Convertí videos, PDFs o audios en apuntes, flashcards y más, con ayuda de la IA.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-10"
        >
          <Link href="/login">
            <Button className="text-base px-8 py-3 rounded-xl bg-[#7b61ff] hover:bg-[#9f86ff] text-white font-bold shadow-lg shadow-[#a990ff20]/40">
              Comenzar gratis
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Divider */}
      <div className="w-full max-w-2xl my-16 h-px bg-gradient-to-r from-transparent via-[#7b61ff33] to-transparent" />

      {/* Features */}
      <section className="relative z-10 max-w-5xl w-full text-center mb-24">
        <h2 className="text-3xl font-extrabold mb-8 text-[#a990ff]">¿Por qué MedMasterAI?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FeatureCard
            title="📚 Belleza visual"
            desc="Apuntes organizados, visualmente atractivos, con tablas, emojis y más."
            icon={<BookOpen className="text-[#a990ff] w-10 h-10" />}
          />
          <FeatureCard
            title="🧠 Multimodalidad"
            desc="Crea apuntes desde audio, video o PDF en segundos."
            icon={
              <div className="flex space-x-4 mt-2">
                <Video className="text-pink-400 w-7 h-7" />
                <Mic className="text-purple-400 w-7 h-7" />
                <File className="text-blue-400 w-7 h-7" />
              </div>
            }
          />
          <FeatureCard
            title="🔁 Flashcards & Quizzes"
            desc="Transformá tus apuntes en tarjetas inteligentes en 1 clic."
            icon={
              <div className="flex space-x-4 mt-2">
                <Sparkles className="text-violet-400 w-7 h-7" />
              </div>
            }
          />
          <FeatureCard
            title="🤖 Chat inteligente"
            desc="Consultá tus apuntes y obtené respuestas contextuales."
            icon={
              <div className="flex items-center space-x-3 mt-2">
                <Bot className="text-pink-400 w-7 h-7" />
                <span className="text-sm text-[#a990ff]/80">"¿Qué dijo sobre mecanismos de inflamación?"</span>
              </div>
            }
          />
        </div>
      </section>

      {/* Divider */}
      <div className="w-full max-w-2xl my-8 h-px bg-gradient-to-r from-transparent via-[#a990ff33] to-transparent" />

      {/* Testimonios */}
      <section className="relative z-10 w-full max-w-5xl text-center">
        <h2 className="text-2xl font-bold mb-10 text-[#a990ff]/90">Lo que dicen los usuarios</h2>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-7">
          <Testimony
            quote="Esto me salvó el examen de Semiología. ¡Gracias MedMaster!"
            author="Camila R., UNLP"
          />
          <Testimony
            quote="Transformé todas mis guías en fichas para estudiar en una noche."
            author="Martín A., UBA"
          />
          <Testimony
            quote="Recién cuando empecé a usar esto, realmente entendí farmacología."
            author="Rocío G., UNC"
          />
        </div>
        <div className="mt-14">
          <Link href="/login">
            <Button size="lg" className="text-white bg-[#7b61ff] hover:bg-[#a990ff] font-bold rounded-xl px-7 py-3 shadow-lg shadow-[#7b61ff20]/50">
              Empezá ahora — es gratis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full py-10 text-center text-sm text-[#c1c1da] border-t border-[#23243A] bg-[#161626]/70 mt-24">
        <div>
          Hecho con <span className="text-red-400">❤️</span> en Argentina — MedMaster 2025
        </div>
      </footer>
    </main>
  )
}

// Componente de card para features
function FeatureCard({ title, desc, icon }: { title: string, desc: string, icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#23243A] bg-[#1f1f38cc] p-7 text-left shadow-xl hover:scale-[1.03] transition-all flex flex-col gap-2 min-h-[170px] backdrop-blur-[1.5px]">
      <h3 className="font-bold text-xl text-[#f2ecff]">{title}</h3>
      <p className="text-[#c1c1da] mb-2">{desc}</p>
      <div>{icon}</div>
    </div>
  )
}

// Componente para testimonios
function Testimony({ quote, author }: { quote: string, author: string }) {
  return (
    <div className="border border-[#23243A] rounded-2xl p-7 bg-[#191930ee] text-left shadow-md flex flex-col gap-3 backdrop-blur-[2px]">
      <p className="text-lg italic text-[#e2deff]">"{quote}"</p>
      <span className="text-xs text-[#a890ff]/80 mt-2">{author}</span>
    </div>
  )
}
