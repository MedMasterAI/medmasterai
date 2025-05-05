'use client'

import './globals.css'
import React, { ReactNode, useState, JSX } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Montserrat } from 'next/font/google'
import { Menu, X, FileText, Headphones, Layers, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const montserrat = Montserrat({ weight: ['400', '600'], subsets: ['latin'], display: 'swap' })

export default function RootLayout({ children }: { children: ReactNode }) {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true)

  const toggleSidebar = () => {
    setIsSidebarVisible(prev => !prev)
  }

  return (
    <html lang="es" className="h-full">
      <body className={`${montserrat.className} h-full min-h-screen relative overflow-x-hidden`}>
        <div className="flex h-full">

          {/* Sidebar */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: isSidebarVisible ? 0 : '-100%' }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 h-full w-64 bg-zinc-950/90 backdrop-blur-xl shadow-2xl z-40"
          >
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <Image src="/logo-medmaster.png" alt="MedMaster" width={32} height={32} />
                <span className="text-xl font-semibold text-purple-400">MedMaster</span>
              </div>
              <button
                onClick={toggleSidebar}
                aria-label="Cerrar barra"
                className="text-zinc-400 hover:text-white transition-transform hover:rotate-90 duration-300"
              >
                <X size={22} />
              </button>
            </div>

            <nav className="px-4 mt-6 space-y-1 font-medium text-sm">
              <SidebarLink href="/" label="PDF" icon={<FileText size={18} />} />
              <SidebarLink href="/audio" label="Audio" icon={<Headphones size={18} />} />
              <SidebarLink href="/flashcards" label="Flashcards" icon={<Layers size={18} />} />
              <SidebarLink href="/testimonios" label="Testimonios" icon={<MessageCircle size={18} />} />
            </nav>
          </motion.aside>

          {/* Main content */}
          <main className={`flex-1 p-8 transition-all duration-300 ease-in-out ${isSidebarVisible ? 'ml-64' : 'ml-0'}`}>
            {children}
          </main>
        </div>

        {/* Fondo con la imagen y sin color blanco */}
        <div className="absolute top-0 left-0 w-full h-full z-0">
          <Image
            src="/fondo-ondas.png" // asegúrate de que la ruta sea correcta
            alt="Fondo Ondas"
            layout="fill"
            objectFit="cover"
            objectPosition="center"
            quality={100}
            priority
          />
        </div>
      </body>
    </html>
  )
}

function SidebarLink({ href, label, icon }: { href: string; label: string; icon: JSX.Element }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-2 rounded-lg text-zinc-300 hover:bg-purple-600/15 hover:text-white transition-all duration-200 hover:translate-x-1"
    >
      <span className="text-purple-400">{icon}</span>
      <span>{label}</span>
    </Link>
  )
}
