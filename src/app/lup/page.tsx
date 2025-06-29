'use client'

import { useState, ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/authcontext'
import { getFirestoreDb } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'

interface Tema {
  id: string
  nombre: string
  dificultad: 'fácil' | 'intermedio' | 'difícil'
}

interface Materia {
  id: string
  nombre: string
  importancia: number
  temas: Tema[]
  fecha?: string
}
interface Disponibilidad { [dia: string]: string[] }
interface PlanItem {
  fecha: string
  materia: string
  tema: string
  tipo: string
  dificultad: 'fácil' | 'intermedio' | 'difícil'
  metodo_estudio: string
  justificacion: string
}

interface LUPData {
  materias: Materia[]
  disponibilidad: Disponibilidad
  presentacion: string
  metodoEstudio: string
  plan: PlanItem[]
}

export default function LUPPage() {
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [materiaInput, setMateriaInput] = useState('')
  const [materiaImportancia, setMateriaImportancia] = useState(1)
  const [materias, setMaterias] = useState<Materia[]>([])
  const [temasPorMateria, setTemasPorMateria] = useState<Record<string, string>>({})
  const [fechas, setFechas] = useState<Record<string, string>>({})
  const [presentacion, setPresentacion] = useState('')
  const [metodoEstudio, setMetodoEstudio] = useState('resúmenes')
  const [disp, setDisp] = useState<Disponibilidad>({})
  const [plan, setPlan] = useState<LUPData['plan']>([])
  const [sugerencias, setSugerencias] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const dias = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo']
  const bloques = ['08-10','10-12','14-16','16-18']

  const agregarMateria = () => {
    const n = materiaInput.trim()
    if (!n) return
    setMaterias([
      ...materias,
      { id: Date.now().toString(), nombre: n, importancia: materiaImportancia, temas: [] }
    ])
    setMateriaInput('')
    setMateriaImportancia(1)
  }

  const agregarTemas = (id: string, texto: string) => {
    const list = texto.split(/\n+/).map(t => t.trim()).filter(Boolean)
    const nuevos = list.map((t, i) => ({
      id: `${Date.now()}-${i}`,
      nombre: t,
      dificultad: 'intermedio'
    }))
    setMaterias(
      materias.map(m =>
        m.id === id ? { ...m, temas: [...m.temas, ...nuevos] } : m
      )
    )
    setTemasPorMateria({ ...temasPorMateria, [id]: '' })
  }

  const updateMateria = (
    id: string,
    field: keyof Materia,
    value: any
  ) => {
    setMaterias(materias.map(m => (m.id === id ? { ...m, [field]: value } : m)))
  }

  const removeMateria = (id: string) => {
    setMaterias(materias.filter(m => m.id !== id))
    const { [id]: _, ...rest } = temasPorMateria
    setTemasPorMateria(rest)
    const { [id]: __, ...restF } = fechas
    setFechas(restF)
  }

  const editTema = (
    id: string,
    index: number,
    field: keyof Tema,
    value: any
  ) => {
    setMaterias(
      materias.map(m =>
        m.id === id
          ? {
              ...m,
              temas: m.temas.map((t, i) =>
                i === index ? { ...t, [field]: value } : t
              )
            }
          : m
      )
    )
  }

  const removeTema = (id: string, index: number) => {
    setMaterias(
      materias.map(m =>
        m.id === id
          ? { ...m, temas: m.temas.filter((_, i) => i !== index) }
          : m
      )
    )
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
          metodoEstudio,
          plan: []
        } as LUPData)
      })
      const data = await res.json()
      const planGen: LUPData['plan'] = data.plan || []
      setPlan(planGen)
      setSugerencias(data.sugerencias || [])
      if (user) {
        const db = getFirestoreDb()
        await addDoc(collection(db, 'lupPlans'), {
          planId: Date.now().toString(),
          createdAt: new Date().toISOString(),
          userId: user.uid,
          materias,
          disponibilidad: disp,
          presentacion,
          metodoEstudio,
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
            <Input
              value={materiaInput}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setMateriaInput(e.target.value)}
              placeholder="Nueva materia"
            />
            <Input
              type="number"
              value={materiaImportancia}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setMateriaImportancia(Number(e.target.value))}
              placeholder="Importancia"
              className="w-20"
            />
            <Button onClick={agregarMateria}>Agregar</Button>
          </div>
          <ul className="space-y-2">
            {materias.map(m=> (
              <li key={m.id} className="flex gap-2 items-end">
                <Input
                  value={m.nombre}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateMateria(m.id, 'nombre', e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={m.importancia}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => updateMateria(m.id, 'importancia', Number(e.target.value))}
                  placeholder="Imp."
                  className="w-20"
                />
                <Button variant="destructive" onClick={() => removeMateria(m.id)}>Borrar</Button>
              </li>
            ))}
          </ul>
          <Button onClick={()=>setStep(2)} disabled={materias.length===0}>Siguiente</Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Temas por materia</h2>
          {materias.map(m=> (
            <div key={m.id} className="space-y-2">
              <p className="font-medium">{m.nombre}</p>
              <Textarea
                value={temasPorMateria[m.id] || ''}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setTemasPorMateria({ ...temasPorMateria, [m.id]: e.target.value })
                }
                placeholder="Lista de temas, uno por línea"
              />
              <Button onClick={() => agregarTemas(m.id, temasPorMateria[m.id] || '')}>Agregar temas</Button>
              {m.temas.length>0 && (
                <ul className="list-disc pl-6">
                  {m.temas.map((t,i)=> (
                    <li key={i} className="flex gap-2 items-end">
                      <Input
                        value={t.nombre}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => editTema(m.id, i, 'nombre', e.target.value)}
                        className="flex-1"
                      />
                      <select
                        value={t.dificultad}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                          editTema(m.id, i, 'dificultad', e.target.value as Tema['dificultad'])
                        }
                        className="border border-border bg-background text-foreground rounded-md px-2 py-2 text-sm"
                      >
                        <option value="fácil">fácil</option>
                        <option value="intermedio">intermedio</option>
                        <option value="difícil">difícil</option>
                      </select>
                      <Button variant="destructive" onClick={() => removeTema(m.id, i)}>Borrar</Button>
                    </li>
                  ))}
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
            <div key={m.id} className="space-y-2">
              <label className="block font-medium">{m.nombre}</label>
              <Input
                type="date"
                value={fechas[m.id] || ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFechas({ ...fechas, [m.id]: e.target.value })
                }
              />
            </div>
          ))}
          <Button onClick={()=>{
            setMaterias(materias.map(m=>({ ...m, fecha: fechas[m.id] || undefined })))
            setStep(4)
          }}>Siguiente</Button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Presentación personal</h2>
          <Textarea
            value={presentacion}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setPresentacion(e.target.value)
            }
            placeholder="Cuéntame cómo estudias..."
          />
          <div>
            <label className="block text-sm mb-1">Método de estudio preferido</label>
            <select
              value={metodoEstudio}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setMetodoEstudio(e.target.value)}
              className="border border-border bg-background text-foreground rounded-md px-2 py-2 text-sm"
            >
              <option value="resúmenes">resúmenes</option>
              <option value="mapas mentales">mapas mentales</option>
              <option value="flashcards">flashcards</option>
              <option value="tests">tests</option>
              <option value="explicar a otros">explicar a otros</option>
            </select>
          </div>
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
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const list = disp[d] || []
                            const newList = e.target.checked
                              ? [...list, b]
                              : list.filter(x => x !== b)
                            setDisp({ ...disp, [d]: newList })
                          }}
                        />
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
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 text-left">Fecha</th>
                  <th className="p-2 text-left">Materia</th>
                  <th className="p-2 text-left">Tema</th>
                  <th className="p-2 text-left">Tipo</th>
                  <th className="p-2 text-left">Dificultad</th>
                  <th className="p-2 text-left">Método</th>
                  <th className="p-2 text-left">Justificación</th>
                </tr>
              </thead>
              <tbody>
                {plan.map((p,i)=>(
                  <tr key={i} className="border-t">
                    <td className="p-2">{p.fecha}</td>
                    <td className="p-2">{p.materia}</td>
                    <td className="p-2">{p.tema}</td>
                    <td className="p-2">{p.tipo}</td>
                    <td className="p-2">{p.dificultad}</td>
                    <td className="p-2">{p.metodo_estudio}</td>
                    <td className="p-2">{p.justificacion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="flex gap-2">
            <Button onClick={()=>setStep(5)}>Editar disponibilidad</Button>
            <Button onClick={()=>setStep(1)}>Editar materias</Button>
            <Button asChild variant="secondary">
              <Link href="/lup/historial">Ver historial</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

