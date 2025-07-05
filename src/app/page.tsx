'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { BookOpen, Video, Mic, File, Sparkles, Bot } from 'lucide-react'
import { useEffect } from 'react'

export default function HomePage() {
  useEffect(() => {
    document.documentElement.classList.add('dark')
    return () => document.documentElement.classList.remove('dark')
  }, [])

  return (
    <main className="min-h-screen w-full bg-background text-foreground flex flex-col items-center px-2 relative overflow-x-hidden transition-colors duration-300 font-sans">

      {/* HERO fondo imagen y gradiente */}
      <div className="absolute top-0 left-0 w-full h-[600px] md:h-[700px] z-0">
        <Image
          src="/maint.PNG"
          alt="Mountains"
          fill
          className="object-cover object-top opacity-95 transition-opacity"
          priority
        />
        {/* Gradiente para fundir la imagen con el fondo oscuro */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#21163480] to-[#131121] pointer-events-none"/>
        <div className="absolute inset-0 bg-black/40 z-0" />
      </div>
      {/* Animated gradient blob */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.6, scale: 1 }}
        transition={{ duration: 1.2 }}
        className="absolute -top-24 left-1/2 h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-fuchsia-500 blur-3xl animate-gradient"
      />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full flex justify-between items-center py-6 px-8 max-w-6xl z-10"
      >
        <div className="flex items-center gap-2">
          <Image src="/logo-medmaster.png" alt="MedMaster" width={36} height={36} />
          <span className="font-semibold text-white text-xl">MedMaster</span>
        </div>
        <Link href="/login" className="mt-4 md:mt-0">
          <Button className="px-4 py-2 rounded-lg border border-white bg-transparent text-white hover:bg-white hover:text-purple-700 transition">
            Ingresar
          </Button>
        </Link>
      </motion.header>

      {/* HERO */}
      <section className="z-10 flex flex-col items-center w-full mt-8 mb-2 min-h-[340px] pt-8">
        <motion.h1
          initial={{ opacity: 0, y: -22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-bold leading-tight text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center tracking-tight bg-gradient-to-r from-[#c0b5ff] via-[#a791ff] to-[#f3e9ff] bg-clip-text text-transparent drop-shadow-md"
        >
          Aprendé más rápido,<br /> como nunca antes.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.23 }}
          className="text-lg text-gray-200 text-center max-w-2xl font-medium mb-6"
        >
          Convertí videos, PDFs o audios en apuntes, flashcards y más, con ayuda de la IA.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-8"
        >
          <Link href="/login">
            <Button className="text-base px-8 py-3 rounded-xl bg-[#8f77ff] hover:bg-[#a995ff] text-white font-bold shadow-lg shadow-[#8f77ff20]/40">
              Comenzar gratis
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Divider */}
      <div className="w-full max-w-2xl my-16 h-px bg-gradient-to-r from-transparent via-[#8f77ff33] to-transparent" />

      {/* Features */}
      <section className="relative z-10 max-w-5xl w-full text-center mb-24">
        <h2 className="text-3xl font-extrabold mb-8 text-[#c0b5ff]">¿Por qué MedMasterAI?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FeatureCard
            index={0}
            title="📚 Belleza visual"
            desc="Apuntes organizados, visualmente atractivos, con tablas, emojis y más."
            icon={<BookOpen className="text-[#c0b5ff] w-10 h-10" />}
          />
          <FeatureCard
            index={1}
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
            index={2}
            title="🔁 Flashcards & Quizzes"
            desc="Transformá tus apuntes en tarjetas inteligentes en 1 clic."
            icon={
              <div className="flex space-x-4 mt-2">
                <Sparkles className="text-violet-400 w-7 h-7" />
              </div>
            }
          />
          <FeatureCard
            index={3}
            title="🤖 Chat inteligente"
            desc="Consultá tus apuntes y obtené respuestas contextuales."
            icon={
              <div className="flex items-center space-x-3 mt-2">
                <Bot className="text-pink-400 w-7 h-7" />
                <span className="text-sm text-[#c0b5ff]/80">"¿Qué dijo sobre mecanismos de inflamación?"</span>
              </div>
            }
          />
        </div>
      </section>

      {/* Divider */}
      <div className="w-full max-w-2xl my-8 h-px bg-gradient-to-r from-transparent via-[#8f77ff33] to-transparent" />

      {/* Testimonios */}
      <section className="relative z-10 w-full max-w-5xl text-center">
        <h2 className="text-2xl font-bold mb-10 text-[#c0b5ff]/90">Lo que dicen los usuarios</h2>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-7">
          <Testimony
            index={0}
            quote="Esto me salvó el examen de Semiología. ¡Gracias MedMaster!"
            author="Camila R., UNLP"
          />
          <Testimony
            index={1}
            quote="Transformé todas mis guías en fichas para estudiar en una noche."
            author="Martín A., UBA"
          />
          <Testimony
            index={2}
            quote="Recién cuando empecé a usar esto, realmente entendí farmacología."
            author="Rocío G., UNC"
          />
        </div>
        <div className="mt-14">
          <Link href="/login">
            <Button size="lg" className="text-white bg-[#8f77ff] hover:bg-[#a995ff] font-bold rounded-xl px-7 py-3 shadow-lg shadow-[#8f77ff20]/50">
              Empezá ahora — es gratis
            </Button>
          </Link>
        </div>
      </section>

      <Image
        src="/322.png"
        alt="Decoración"
        width={1200}
        height={200}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full brightness-125 opacity-80 pointer-events-none z-0"
      />

      {/* Footer */}
      <footer className="relative z-10 w-full py-10 text-center text-sm text-[#b9b4d1] border-t border-[#2a2748] bg-[#1a1829]/70 mt-24">
        <div>
          Hecho con <span className="text-red-400">❤️</span> en Argentina — MedMaster 2025
        </div>
      </footer>
    </main>
  )
}

// Componente de card para features
function FeatureCard({ title, desc, icon, index }: { title: string, desc: string, icon: React.ReactNode, index: number }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-2xl border border-[#2a2748] bg-[#242046cc] p-7 text-left shadow-xl hover:scale-[1.03] transition-all flex flex-col gap-2 min-h-[170px] backdrop-blur-[1.5px]"
    >
      <h3 className="font-bold text-xl text-[#e9e4ff]">{title}</h3>
      <p className="text-[#b9b4d1] mb-2">{desc}</p>
      <div>{icon}</div>
    </motion.div>
  )
}

// Componente para testimonios
function Testimony({ quote, author, index }: { quote: string, author: string, index: number }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: index * 0.1 }}
      className="border border-[#2a2748] rounded-2xl p-7 bg-[#1b1831ee] text-left shadow-md flex flex-col gap-3 backdrop-blur-[2px]"
    >
      <p className="text-lg italic text-[#dcd8ff]">"{quote}"</p>
      <span className="text-xs text-[#c0b5ff]/80 mt-2">{author}</span>
    </motion.div>
  )
}
