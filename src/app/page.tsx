'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import fondoOndas from '/public/fondo-ondas.png'
import logoMedmaster from '/public/logo-medmaster.png'
// Regex fuera del handler, al inicio del archivo:
const YOUTUBE_REGEX = /^https?:\/\/(www\.)?youtube\.com\/watch\?v=/

export default function Page() {
  const [modo, setModo] = useState<'pdf'|'youtube'|null>(null)
  const [email, setEmail] = useState('')
  const [file,  setFile]  = useState<File|null>(null)
  const [url,   setUrl]   = useState('')
  const [terms, setTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast]     = useState<string|null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(t)
    }
  }, [toast])

  const showToast = (msg: string) => setToast(msg)
  const closeModal = () => setShowModal(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!terms) {
      return showToast('❗ Aceptá los términos.')
    }
    // Validación de URL de YouTube
    if (modo === 'youtube' && !YOUTUBE_REGEX.test(url)) {
      return showToast('🔗 URL inválida.')
    }
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('email', email)
      if (modo==='pdf') fd.append('pdfFile', file!)
      else             fd.append('videoUrl', url)

      const endpoint = modo==='pdf'
        ? 'https://hook.us2.make.com/o5rftketoomeq23r2sbx9tb2dk5udesd'
        : 'https://hook.us2.make.com/vied0j97n7g5vyj3isih8p1h20csa1qk'

      const res = await fetch(endpoint, {
        method: modo==='pdf' ? 'POST' : 'POST',
        headers: modo==='youtube' ? { 'Content-Type':'application/json' } : undefined,
        body: modo==='pdf' ? fd : JSON.stringify({ email, videoUrl: url }),
      })

      if (!res.ok) {
        if (res.status===422) showToast('❌ No se pudieron extraer subtítulos.')
        else                  showToast('❌ Error en el envío.')
      } else {
        setShowModal(true)
      }
    } catch {
      showToast('🔌 Problema de conexión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Toast */}
      {toast && <div className="toast show">{toast}</div>}

      {/* Modal */}
      {showModal && (
        <div className="modal" style={{ display:'flex' }}>
          <div className="modal-content">
            <h3>✅ ¡Envío exitoso!</h3>
            <p>En unos minutos recibirás un correo con tu apunte.</p>
            <button onClick={closeModal}>👌 Cerrar</button>
          </div>
        </div>
      )}

      {/* Fondo */}
      <div className="relative min-h-screen overflow-hidden">
        <Image src={fondoOndas} alt="Fondo" fill className="object-cover" />

        <div className="relative z-10">
          <div className="container">
            <h1>✍️ Generar Apunte</h1>

            <div className="howto">
              <h2>📝 Cómo usar Apunty AI</h2>
              <ol>
                <li>Seleccioná <strong>Desde YouTube</strong> o <strong>Desde PDF</strong>.</li>
                <li>Pegá la URL (debe contener “watch”) o subí el PDF.</li>
                <li>Ingresá tu correo electrónico.</li>
                <li>Aceptá los <a href="…">términos y condiciones</a>.</li>
                <li>Hacé clic en <strong>Enviar</strong> y esperá tu apunte.</li>
              </ol>
            </div>

            <div className="option-buttons">
              <button onClick={() => setModo('pdf')}>📄 Desde PDF</button>
              <button onClick={() => setModo('youtube')}>▶️ Desde YouTube</button>
            </div>

            <div className={`form-section ${modo==='pdf'?'active':''}`}>
              <form onSubmit={handleSubmit}>
                <label>📧 Correo electrónico:</label>
                <input
                  type="email" value={email} required
                  onChange={e=>setEmail(e.target.value)}
                />
                <label>📁 Archivo PDF:</label>
                <input
                  type="file" accept="application/pdf" required
                  onChange={e=>setFile(e.target.files?.[0]||null)}
                />
                <label>
                  <input
                    type="checkbox" checked={terms}
                    onChange={e=>setTerms(e.target.checked)}
                  /> Acepto los términos
                </label>
                <button className={`submit ${loading?'loading':''}`} type="submit">
                  🚀 Enviar PDF
                </button>
              </form>
            </div>

            <div className={`form-section ${modo==='youtube'?'active':''}`}>
              <form onSubmit={handleSubmit}>
                <label>📧 Correo electrónico:</label>
                <input
                  type="email" value={email} required
                  onChange={e=>setEmail(e.target.value)}
                />
                <label>🔗 URL de YouTube:</label>
                <input
                  type="url" value={url} required
                  onChange={e=>setUrl(e.target.value)}
                />
                <label>
                  <input
                    type="checkbox" checked={terms}
                    onChange={e=>setTerms(e.target.checked)}
                  /> Acepto los términos
                </label>
                <button className={`submit ${loading?'loading':''}`} type="submit">
                  🚀 Enviar Video
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

