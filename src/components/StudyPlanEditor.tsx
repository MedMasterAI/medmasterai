'use client'

import { useState } from 'react'
import { useStudyPlan } from '@/hooks/useStudyPlan'
import type { StudyPlan, StudySubject, StudyTopic } from '@/types/study-plan'
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
            onChange={e => updatePrefs('maxBloquesPorDia', Number(e.target.value))}
          />
          <Input
            label="Minutos por bloque"
            type="number"
            value={plan.preferencias.bloqueMinutos}
            onChange={e => updatePrefs('bloqueMinutos', Number(e.target.value))}
          />
          <Input
            label="Descanso (min)"
            type="number"
            value={plan.preferencias.descansoMinutos}
            onChange={e => updatePrefs('descansoMinutos', Number(e.target.value))}
          />
          <Input
            label="Método organización"
            value={plan.preferencias.metodoOrganizacion}
            onChange={e => updatePrefs('metodoOrganizacion', e.target.value)}
          />
          <Input
            label="Métodos favoritos (coma)"
            value={plan.preferencias.metodosFavoritos.join(', ')}
            onChange={e =>
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
              onChange={e => setName(e.target.value)}
            />
            <Input
              label="Importancia"
              type="number"
              value={importance}
              onChange={e => setImportance(Number(e.target.value))}
            />
            <Input
              label="Tipo evaluación"
              value={evaluation}
              onChange={e => setEvaluation(e.target.value)}
            />
          </div>
          <Button onClick={addSubject}>Agregar materia</Button>
          {plan.materias.length > 0 && (
            <ul className="space-y-4">
              {plan.materias.map(subject => (
                <li key={subject.id} className="border rounded-md p-4">
                  <div className="font-semibold mb-2">{subject.nombre}</div>
                  {subject.temas.length > 0 && (
                    <ul className="pl-4 list-disc space-y-1 text-sm mb-2">
                      {subject.temas.map(t => (
                        <li key={t.id}>{t.nombre}</li>
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
      <Input label="Nuevo tema" value={name} onChange={e => setName(e.target.value)} />
      <Input label="Fecha límite" type="date" value={date} onChange={e => setDate(e.target.value)} />
      <Input
        label="Dificultad"
        type="number"
        value={difficulty}
        onChange={e => setDifficulty(Number(e.target.value))}
      />
      <Button onClick={add}>Agregar</Button>
    </div>
  )
}