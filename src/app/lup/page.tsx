'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/authcontext'
import { getFirestoreDb } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'

interface Materia { nombre: string; temas: string[]; fecha?: string }
interface Disponibilidad { [dia: string]: string[] }
interface PlanItem { fecha: string; materia: string; tema: string; tipo: string }

interface LUPData {
  materias: Materia[]
  disponibilidad: Disponibilidad
  presentacion: string
  plan: PlanItem[]
}

export default function LUPPage() {
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [materiaInput, setMateriaInput] = useState('')
  const [materias, setMaterias] = useState<Materia[]>([])
  const [temasPorMateria, setTemasPorMateria] = useState<Record<string, string>>({})
  const [fechas, setFechas] = useState<Record<string, string>>({})
  const [presentacion, setPresentacion] = useState('')
  const [disp, setDisp] = useState<Disponibilidad>({})
  const [plan, setPlan] = useState<LUPData['plan']>([])
  const [sugerencias, setSugerencias] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const dias = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo']
  const bloques = ['08-10','10-12','14-16','16-18']

  const agregarMateria = () => {
    if (!materiaInput.trim()) return
    setMaterias([...materias, { nombre: materiaInput.trim(), temas: [] }])
    setMateriaInput('')
  }

  const agregarTemas = (nombre: string, texto: string) => {
    const list = texto.split(/\n+/).map(t => t.trim()).filter(Boolean)
    setMaterias(materias.map(m => m.nombre===nombre ? { ...m, temas: [...m.temas, ...list] } : m))
    setTemasPorMateria({ ...temasPorMateria, [nombre]: '' })
  }

  const generarPlan = async () => {
    setLoading(true)
    setSugerencias([])
    try {
      const res = await fetch('/api/lup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materias,
          disponibilidad: disp,
          presentacion,
          plan: []
        } as LUPData)
      })
      const data = await res.json()
      const planGen: LUPData['plan'] = data.plan || []
      setPlan(planGen)
      setSugerencias(data.sugerencias || [])
      if (user) {
        const db = getFirestoreDb()
        setDoc(doc(db, 'lupPlans', user.uid), {
          materias,
          disponibilidad: disp,
          presentacion,
          plan: planGen,
        })
      }
      setStep(6)
    } catch (err) {
      console.error('Error generating plan', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6">
      {step === 0 && (
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-bold">Bienvenido a LUP</h1>
          <p>Organiza tu estudio, no tu estrés. Comienza agregando tus materias.</p>
          <Button onClick={()=>setStep(1)}>Empezar</Button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Materias</h2>
          <div className="flex gap-2">
            <Input value={materiaInput} onChange={e=>setMateriaInput(e.target.value)} placeholder="Nueva materia" />
            <Button onClick={agregarMateria}>Agregar</Button>
          </div>
          <ul className="list-disc pl-6 space-y-1">
            {materias.map(m=> (
              <li key={m.nombre}>{m.nombre}</li>
            ))}
          </ul>
          <Button onClick={()=>setStep(2)} disabled={materias.length===0}>Siguiente</Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Temas por materia</h2>
          {materias.map(m=> (
            <div key={m.nombre} className="space-y-2">
              <p className="font-medium">{m.nombre}</p>
              <Textarea
                value={temasPorMateria[m.nombre]||''}
                onChange={e=>setTemasPorMateria({...temasPorMateria, [m.nombre]: e.target.value})}
                placeholder="Lista de temas, uno por línea"
              />
              <Button onClick={()=>agregarTemas(m.nombre, temasPorMateria[m.nombre]||'')}>Agregar temas</Button>
              {m.temas.length>0 && (
                <ul className="list-disc pl-6">
                  {m.temas.map(t=> <li key={t}>{t}</li>)}
                </ul>
              )}
            </div>
          ))}
          <Button onClick={()=>setStep(3)}>Siguiente</Button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Fechas de examen (opcional)</h2>
          {materias.map(m=> (
            <div key={m.nombre} className="space-y-2">
              <label className="block font-medium">{m.nombre}</label>
              <Input type="date" value={fechas[m.nombre]||''} onChange={e=>setFechas({...fechas, [m.nombre]: e.target.value})} />
            </div>
          ))}
          <Button onClick={()=>{
            setMaterias(materias.map(m=>({ ...m, fecha: fechas[m.nombre]||undefined })))
            setStep(4)
          }}>Siguiente</Button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Presentación personal</h2>
          <Textarea value={presentacion} onChange={e=>setPresentacion(e.target.value)} placeholder="Cuéntame cómo estudias..." />
          <Button onClick={()=>setStep(5)}>Siguiente</Button>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Disponibilidad</h2>
          <table className="border-collapse">
            <thead>
              <tr>
                <th></th>
                {bloques.map(b=> <th key={b} className="px-2">{b}</th>)}
              </tr>
            </thead>
            <tbody>
              {dias.map(d=> (
                <tr key={d}>
                  <td className="pr-2 font-medium capitalize">{d}</td>
                  {bloques.map(b=> {
                    const checked = disp[d]?.includes(b) || false
                    return (
                      <td key={b} className="p-1">
                        <input type="checkbox" checked={checked} onChange={e=>{
                          const list = disp[d] || []
                          const newList = e.target.checked ? [...list,b] : list.filter(x=>x!==b)
                          setDisp({ ...disp, [d]: newList })
                        }} />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <Button onClick={generarPlan} disabled={loading}>
            {loading ? 'Generando...' : 'Generar Plan con IA'}
          </Button>
        </div>
      )}

      {step === 6 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Plan generado</h2>
          {plan.length===0 ? (
            <div className="space-y-2">
              <p>No hay bloques suficientes para cubrir todos los temas antes de las fechas.</p>
              {sugerencias.length>0 && (
                <ul className="list-disc pl-6">
                  {sugerencias.map((s,i)=>(<li key={i}>{s}</li>))}
                </ul>
              )}
            </div>
          ) : (
            <ul className="list-disc pl-6">
              {plan.map((p,i)=>(
                <li key={i}>{p.fecha}: {p.materia} - {p.tema}</li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <Button onClick={()=>setStep(5)}>Editar disponibilidad</Button>
            <Button onClick={()=>setStep(1)}>Editar materias</Button>
          </div>
        </div>
      )}
    </div>
  )
}

