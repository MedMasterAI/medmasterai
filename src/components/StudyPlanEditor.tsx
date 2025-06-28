'use client'

import { useState, ChangeEvent } from 'react'
import { useStudyPlan } from '@/hooks/useStudyPlan'
import type { StudyPlan, StudySubject, StudyTopic } from '../../types/study-plan'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

export default function StudyPlanEditor() {
  const { plan, setPlan } = useStudyPlan()

  const [name, setName] = useState('')
  const [importance, setImportance] = useState(1)
  const [evaluation, setEvaluation] = useState('')

  if (!plan) return null

  const updatePrefs = (field: keyof StudyPlan['preferencias'], value: any) => {
    setPlan({ ...plan, preferencias: { ...plan.preferencias, [field]: value } })
  }

  const addSubject = () => {
    const n = name.trim()
    if (!n) return
    const newSubject: StudySubject = {
      id: Date.now().toString(),
      nombre: n,
      importancia: importance,
      tipoEvaluacion: evaluation,
      temas: []
    }
    setPlan({ ...plan, materias: [...plan.materias, newSubject] })
    setName('')
    setImportance(1)
    setEvaluation('')
  }

  const addTopic = (subject: StudySubject, topic: StudyTopic) => {
    const updated = plan.materias.map(m =>
      m.id === subject.id ? { ...m, temas: [...m.temas, topic] } : m
    )
    setPlan({ ...plan, materias: updated })
  }

  const updateSubject = (
    id: string,
    field: keyof StudySubject,
    value: any
  ) => {
    const updated = plan.materias.map(m =>
      m.id === id ? { ...m, [field]: value } : m
    )
    setPlan({ ...plan, materias: updated })
  }

  const removeSubject = (id: string) => {
    const updated = plan.materias.filter(m => m.id !== id)
    setPlan({ ...plan, materias: updated })
  }

  const updateTopic = (
    subjectId: string,
    topicId: string,
    field: keyof StudyTopic,
    value: any
  ) => {
    const updated = plan.materias.map(m =>
      m.id === subjectId
        ? {
            ...m,
            temas: m.temas.map(t =>
              t.id === topicId ? { ...t, [field]: value } : t
            )
          }
        : m
    )
    setPlan({ ...plan, materias: updated })
  }

  const removeTopic = (subjectId: string, topicId: string) => {
    const updated = plan.materias.map(m =>
      m.id === subjectId
        ? { ...m, temas: m.temas.filter(t => t.id !== topicId) }
        : m
    )
    setPlan({ ...plan, materias: updated })
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Preferencias</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={plan.preferencias.bloquesCortos}
              onCheckedChange={v => updatePrefs('bloquesCortos', v)}
            />
            <span className="text-sm">Bloques cortos</span>
          </div>
          <Input
            label="Bloques por día"
            type="number"
            value={plan.preferencias.maxBloquesPorDia}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              updatePrefs('maxBloquesPorDia', Number(e.target.value))
            }
          />
          <Input
            label="Minutos por bloque"
            type="number"
            value={plan.preferencias.bloqueMinutos}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              updatePrefs('bloqueMinutos', Number(e.target.value))
            }
          />
          <Input
            label="Descanso (min)"
            type="number"
            value={plan.preferencias.descansoMinutos}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              updatePrefs('descansoMinutos', Number(e.target.value))
            }
          />
          <Input
            label="Método organización"
            value={plan.preferencias.metodoOrganizacion}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              updatePrefs('metodoOrganizacion', e.target.value)
            }
          />
          <Input
            label="Métodos favoritos (coma)"
            value={plan.preferencias.metodosFavoritos.join(', ')}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              updatePrefs(
                'metodosFavoritos',
                e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              )
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Materias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <Input
              label="Nombre"
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            />
            <Input
              label="Importancia"
              type="number"
              value={importance}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setImportance(Number(e.target.value))
              }
            />
            <Input
              label="Tipo evaluación"
              value={evaluation}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEvaluation(e.target.value)
              }
            />
          </div>
          <Button onClick={addSubject}>Agregar materia</Button>
          {plan.materias.length > 0 && (
            <ul className="space-y-4">
              {plan.materias.map(subject => (
                <li key={subject.id} className="border rounded-md p-4 space-y-2">
                  <div className="grid grid-cols-3 gap-2 items-end">
                    <Input
                      label="Nombre"
                      value={subject.nombre}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateSubject(subject.id, 'nombre', e.target.value)
                      }
                    />
                    <Input
                      label="Importancia"
                      type="number"
                      value={subject.importancia}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateSubject(
                          subject.id,
                          'importancia',
                          Number(e.target.value)
                        )
                      }
                    />
                    <Input
                      label="Tipo"
                      value={subject.tipoEvaluacion}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateSubject(subject.id, 'tipoEvaluacion', e.target.value)
                      }
                    />
                    <Button
                      variant="destructive"
                      onClick={() => removeSubject(subject.id)}
                      className="col-span-3"
                    >
                      Eliminar materia
                    </Button>
                  </div>

                  {subject.temas.length > 0 && (
                    <ul className="pl-4 list-disc space-y-2 text-sm">
                      {subject.temas.map(t => (
                        <li key={t.id} className="flex items-end gap-2">
                          <Input
                            value={t.nombre}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              updateTopic(subject.id, t.id, 'nombre', e.target.value)
                            }
                            className="flex-1"
                          />
                          <Input
                            type="date"
                            value={t.fechaLimite || ''}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              updateTopic(subject.id, t.id, 'fechaLimite', e.target.value)
                            }
                          />
                          <Input
                            type="number"
                            value={t.dificultad}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              updateTopic(
                                subject.id,
                                t.id,
                                'dificultad',
                                Number(e.target.value)
                              )
                            }
                          />
                          <Button
                            variant="destructive"
                            onClick={() => removeTopic(subject.id, t.id)}
                          >
                            Borrar
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <TopicForm onAdd={topic => addTopic(subject, topic)} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function TopicForm({ onAdd }: { onAdd: (t: StudyTopic) => void }) {
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [difficulty, setDifficulty] = useState(1)

  const add = () => {
    const n = name.trim()
    if (!n) return
    const topic: StudyTopic = {
      id: Date.now().toString(),
      nombre: n,
      fechaLimite: date,
      dificultad: difficulty,
      bloques: []
    }
    onAdd(topic)
    setName('')
    setDate('')
    setDifficulty(1)
  }

  return (
    <div className="grid grid-cols-4 gap-2 items-end">
      <Input
        label="Nuevo tema"
        value={name}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
      />
      <Input
        label="Fecha límite"
        type="date"
        value={date}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
      />
      <Input
        label="Dificultad"
        type="number"
        value={difficulty}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setDifficulty(Number(e.target.value))
        }
      />
      <Button onClick={add}>Agregar</Button>
    </div>
  )
}