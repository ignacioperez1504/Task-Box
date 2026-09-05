// Clasifica un correo con Groq: decide si es una tarea académica/personal
// y si lo es, extrae los campos necesarios para crear una fila en `tasks`.
// Mismo patrón de prompt que src/lib/aiService.js, adaptado a correos.

export interface EmailInput {
  subject: string
  from: string
  receivedAt: string // ISO date
  bodyText: string // texto plano, ya recortado
}

export interface TaskExtraction {
  isTask: boolean
  title?: string
  description?: string
  subject?: string
  dueDate?: string // YYYY-MM-DD
  durationHours?: number
  importance?: 'Alta' | 'Media' | 'Baja'
}

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

function buildPrompt(email: EmailInput): string {
  return `Analiza este correo y decide si describe una TAREA pendiente que alguien
debe hacer (una entrega, un trabajo, un recordatorio con fecha límite, una
solicitud accionable). Correos informativos, boletines, spam, confirmaciones
automáticas o publicidad NO son tareas.

Responde SOLO con JSON válido, sin texto extra:
{"is_task": boolean, "title": "string corto", "description": "string", "subject": "string (materia o categoría)", "due_date": "YYYY-MM-DD o null", "duration_hours": número, "importance": "Alta|Media|Baja"}

Correo:
- De: ${email.from}
- Asunto: ${email.subject}
- Recibido: ${email.receivedAt}
- Cuerpo:
${email.bodyText.slice(0, 3000)}

Reglas:
1. Si no hay fecha límite explícita ni implícita, due_date debe ser null.
2. Si no estás razonablemente seguro de que es una tarea accionable, is_task debe ser false.
3. duration_hours es tu mejor estimación (número, ej: 1, 2, 4).
4. Responde SOLO con el JSON, nada más.`
}

export async function classifyEmailAsTask(
  email: EmailInput,
  apiKey: string,
  model = 'openai/gpt-oss-20b'
): Promise<TaskExtraction> {
  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: buildPrompt(email) }],
      temperature: 0.2,
      max_completion_tokens: 700,
      reasoning_effort: 'low',
    }),
  })

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status} ${await response.text()}`)
  }

  const data = await response.json()
  const text = data?.choices?.[0]?.message?.content?.trim() || ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error(`Groq no devolvió JSON: ${text}`)

  const parsed = JSON.parse(match[0])
  return {
    isTask: !!parsed.is_task,
    title: parsed.title,
    description: parsed.description,
    subject: parsed.subject,
    dueDate: parsed.due_date || undefined,
    durationHours: Number(parsed.duration_hours) || undefined,
    importance: parsed.importance,
  }
}
