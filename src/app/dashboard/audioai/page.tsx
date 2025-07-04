'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { httpsCallable } from 'firebase/functions'
import { getFirebaseFunctions } from '@/lib/firebase'
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore'
import { getStorage, ref, uploadBytes } from 'firebase/storage'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ProgressTracker } from '@/components/ProgressTracker'
import { useAuth } from '@/hooks/useAuth'
import { useUserPlan } from '@/hooks/useUserPlan'
import { JobStatus } from '@/lib/statusMessages'
import { toast } from 'sonner'
import { Mic } from 'lucide-react'

export default function Page() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { plan } = useUserPlan(user?.uid ?? null)

  const [file, setFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState('')
  const [progress, setProgress] = useState(0)
  const [jobStatus, setJobStatus] = useState<JobStatus>('idle')
  const [statusDetail, setStatusDetail] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [jobNoteId, setJobNoteId] = useState<string | null>(null)
  const completedToast = useRef(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (!user?.uid || !jobNoteId) return
    const db = getFirestore()
    const noteRef = doc(db, 'users', user.uid, 'notes', jobNoteId)
    const unsub = onSnapshot(noteRef, snap => {
      const data = snap.data()
      if (!data) return
      const status = (data.status || 'idle').toLowerCase() as JobStatus
      setJobStatus(status)
      setProgress(p => Math.max(p, Number(data.progress ?? 0)))
      setStatusDetail(data.errorMessage || '')
      if (status === 'completed' && data.url) {
        setDownloadUrl(data.url)
        if (!completedToast.current) {
          toast.success('✅ ¡Tu apunte está listo para descargar!')
          completedToast.current = true
        }
      } else if (status === 'failed') {
        toast.error(data.errorMessage || 'Error al generar el apunte.')
      }
    })
    return () => unsub()
  }, [user?.uid, jobNoteId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatusDetail('')
    setDownloadUrl('')

    if ((!file && !audioUrl) || !user?.uid) {
      setJobStatus('failed')
      setStatusDetail('Debes subir un archivo o URL válida.')
      toast.error('Entrada inválida.')
      return
    }

    if (file) {
      const type = file.type.split(';')[0]
      const allowed = [
        'audio/mpeg',
        'audio/mp3',
        'audio/mp4',
        'audio/mpga',
        'audio/m4a',
        'audio/x-m4a',
        'audio/wav',
        'audio/webm'
      ]
      if (!allowed.includes(type)) {
        setJobStatus('failed')
        setStatusDetail('Formato de audio no soportado. Usa mp3, mp4, mpeg, mpga, m4a, wav o webm.')
        toast.error('Formato de audio no soportado.')
        return
      }
    }

    try {
      const noteId = Date.now().toString()
      setJobNoteId(noteId)

      if (file) {
        setProgress(20)
        setJobStatus('uploading_audio')
        const storage = getStorage()
        const storageRef = ref(storage, `temp_uploads/${user.uid}/${noteId}/${file.name}`)
        await uploadBytes(storageRef, file)
      }

      setProgress(30)
      setJobStatus('saving_firestore')
      const db = getFirestore()
      await setDoc(doc(db, 'users', user.uid, 'notes', noteId), {
        fileName: file ? file.name : 'audio-url',
        audioUrl: file ? '' : audioUrl,
        status: 'pending',
        createdAt: new Date(),
        plan,
      })

      setProgress(40)
      setJobStatus('calling_function')
      const generate = httpsCallable(getFirebaseFunctions(), 'generateNoteFromAudio', { timeout: 540000 })
      await generate({
        noteId,
        plan,
        fileName: file ? file.name : 'audio.mp3',
        fileMimeType: file ? file.type : 'audio/mpeg',
        ...(file ? {} : { audioUrl }),
      })

      setProgress(50)
      setJobStatus('pending')
      toast.success('⏳ Apunte en proceso. Te avisaremos cuando esté listo.')
    } catch (err: any) {
      console.error(err)
      setJobStatus('failed')
      setStatusDetail(err.message || 'Error')
      toast.error('Error al iniciar la tarea.')
    }
  }

  if (loading || !user) {
    return <div className='p-8 text-center'>Cargando…</div>
  }

  return (
    <SidebarProvider className='flex flex-col'>
      <div className='flex flex-1'>
        <SidebarInset className='px-2 sm:px-6 md:px-12 py-10'>
          <div className='flex flex-col items-center w-full'>
            <div className='flex flex-col items-center mb-8'>
              <div className='bg-primary/10 rounded-full p-4 mb-2'>
                <Mic className='w-8 h-8 text-primary' />
              </div>
              <h1 className='text-2xl md:text-3xl font-extrabold text-text text-center'>Generar Apunte desde Audio</h1>
            </div>

            <ProgressTracker progress={progress} status={jobStatus} statusDetail={statusDetail} downloadUrl={downloadUrl} />

            <Card className='shadow-card bg-card border border-[var(--card-border)] rounded-2xl w-full mt-4'>
              <CardHeader className='text-center'>
                <CardTitle>Subí un audio o pegá un enlace</CardTitle>
                <CardDescription>Procesaremos el archivo y podrás descargar el PDF.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='file'>Archivo de audio</Label>
                    <Input id='file' type='file' accept='audio/*' onChange={e => setFile(e.target.files?.[0] || null)} />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='audioUrl'>o URL directa</Label>
                    <Input id='audioUrl' type='url' value={audioUrl} onChange={e => setAudioUrl(e.target.value)} placeholder='https://...' />
                  </div>
                  <Button type='submit' className='w-full'>Enviar Audio</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
