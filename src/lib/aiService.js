// ↓ CAMBIO 1: nueva URL base de Groq
const DEFAULT_ENDPOINT = 'https://api.groq.com/openai/v1'

// ↓ CAMBIO 2: modelo de Groq
const DEFAULT_MODEL = 'llama-3.1-8b-instant'

// Cache simple en memoria
const classificationCache = new Map()

function getCacheKey(task) {
  return `${task.title}|${task.subject}|${task.dueDate}|${task.duration}|${task.importance}|${task.academicContext?.taskWeight || 0}`
}

function getConfig() {
  return {
    apiKey: localStorage.getItem('sf_api_key') || '',
    endpoint: localStorage.getItem('sf_api_endpoint') || DEFAULT_ENDPOINT,
    model: localStorage.getItem('sf_api_model') || DEFAULT_MODEL,
  }
}

export function saveConfig(apiKey, endpoint, model) {
  localStorage.setItem('sf_api_key', apiKey)

  if (endpoint) {
    localStorage.setItem('sf_api_endpoint', endpoint)
  }

  if (model) {
    localStorage.setItem('sf_api_model', model)
  }
}

export function hasApiKey() {
  return !!localStorage.getItem('sf_api_key')
}

function buildPrompt(task) {
  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(task.dueDate) - new Date()) /
        (1000 * 60 * 60 * 24)
    )
  )

  return `Clasifica esta tarea académica. Responde SOLO con JSON válido, sin texto extra.

JSON requerido:
{"priority":"Crítica|Alta|Media|Baja","priority_score":número(0-10),"category":"Examen|Proyecto|Tarea corta|Lectura|Investigación|Laboratorio|Otro","suggested_hours":número,"recommendation":"máx 2 líneas","study_plan":"plan de acción concreto y detallado"}

Tarea:
- Título: ${task.title}
- Descripción: ${task.description || 'Sin descripción'}
- Materia: ${task.subject}
- Días restantes: ${daysLeft}
- Duración estimada: ${task.duration}h
- Importancia: ${task.importance}
${task.tags?.length ? `- Etiquetas: ${task.tags.join(', ')}` : ''}
${task.academicContext ? `
Contexto Académico:
- Nota promedio actual: ${task.academicContext.averageGrade.toFixed(2)}
- Créditos de la materia: ${task.academicContext.credits}
- Porcentaje restante por evaluar: ${task.academicContext.remainingPercentage}%
- Peso de esta tarea: ${task.academicContext.taskWeight}% del total de la materia` : ''}
${task.habitContext ? `
Contexto de Hábitos:
- Hábitos completados hoy: ${task.habitContext.completedHabits}/${task.habitContext.totalHabits}
- El usuario tiene ${task.habitContext.totalHabits} compromisos diarios recurrentes.` : ''}
${task.eventsContext && task.eventsContext.count > 0 ? `
Eventos/Recordatorios del día:
- Pendientes: ${task.eventsContext.reminders.join(', ')}
- Total eventos extra: ${task.eventsContext.count}` : ''}

Reglas:
1. <48h restantes → Crítica o Alta (salvo tarea trivial)
2. Importancia alta + >3h → Crítica o Alta
3. Prioriza materias con nota baja (< 3.0) o créditos altos (> 3).
4. Si la tarea vale mucho (> 10% de la materia), súbele la prioridad.
5. Considera la carga de hábitos: si el usuario tiene muchos hábitos y ya completó varios, está en un día productivo pero ocupado.
6. Carga de eventos externos: si el día de entrega tiene muchos recordatorios (${task.eventsContext?.count || 0}), el tiempo disponible es menor. Aumenta la urgencia o sugiere dividir la tarea.
7. Materias de alta carga cognitiva (Cálculo, Física, Química Orgánica, Termodinámica) tienen prioridad mayor.
8. suggested_hours puede diferir del estimado si lo justifica la complejidad
9. study_plan: genera un plan de acción concreto basado en:
   - Días restantes (${daysLeft})
   - Ocupación (${task.habitContext?.completedHabits || 0} hábitos y ${task.eventsContext?.count || 0} eventos)
   - Nota actual en materia (${task.academicContext?.averageGrade.toFixed(2) || 'N/A'}) y peso de la tarea (${task.academicContext?.taskWeight || 0}%)
   Ejemplo: "Tienes 4 días. Estudia 2h hoy, descansa mañana (tienes partido), y dedica 3h los últimos 2 días."
10. recommendation: resumen motivador muy breve.
11. Responde SOLO con el JSON.`
}

export async function classifyTask(task) {
  const cacheKey = getCacheKey(task)

  // Revisar caché
  if (classificationCache.has(cacheKey)) {
    console.log('✅ Resultado desde caché, no se llamó la API')
    return classificationCache.get(cacheKey)
  }

  const { apiKey, endpoint, model } = getConfig()

  // Validación API Key
  if (!apiKey) {
    throw new Error('NO_API_KEY - Por favor configura tu API key de Groq')
  }

  if (apiKey.trim().length === 0) {
    throw new Error('API_KEY_EMPTY - La API key está vacía')
  }

  // Logs de configuración
  console.log('🔧 Configuración API:', {
    endpoint,
    model,
    apiKeyLength: apiKey.length,
    apiKeyPreview: apiKey.substring(0, 10) + '...',
  })

  const url = `${endpoint}/chat/completions`

  const requestBody = {
    model,
    messages: [
      {
        role: 'user',
        content: buildPrompt(task),
      },
    ],
    temperature: 0.3,
    max_tokens: 200,
  }

  console.log('📤 URL:', url)
  console.log(
    '📋 Request body:',
    JSON.stringify(requestBody, null, 2)
  )

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    console.log('📊 Response status:', response.status)

    // Manejo de errores HTTP
    if (!response.ok) {
      const rawText = await response.text()

      console.error('❌ Respuesta cruda:', rawText)

      let errorData = {}

      try {
        errorData = JSON.parse(rawText)
      } catch {
        console.error('⚠️ La respuesta no era JSON')
      }

      console.error('❌ Error API:', {
        status: response.status,
        error: errorData,
      })

      throw new Error(
        errorData?.error?.message ||
          `Error API: ${response.status}`
      )
    }

    // Parsear respuesta exitosa
    const data = await response.json()

    console.log('✅ Data recibida:', data)

    const text =
      data?.choices?.[0]?.message?.content?.trim() || ''

    if (!text) {
      throw new Error('La IA devolvió una respuesta vacía')
    }

    console.log('📝 Texto IA:', text)

    // Buscar JSON dentro del texto
    const jsonMatch = text.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      throw new Error(
        `La IA no devolvió JSON válido. Respuesta: ${text}`
      )
    }

    let parsed

    try {
      parsed = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error('❌ Error parseando JSON:', parseError)
      console.error('📄 JSON recibido:', jsonMatch[0])

      throw new Error(
        `JSON parsing failed: ${parseError.message}`
      )
    }

    console.log('✅ JSON parseado:', parsed)

    const classification = {
      priority: parsed.priority || 'Media',
      priorityScore: Number(parsed.priority_score) || 5,
      category: parsed.category || 'Otro',
      suggestedHours: Number(parsed.suggested_hours) || 1,
      recommendation: parsed.recommendation || '',
      studyPlan: parsed.study_plan || '',
    }

    console.log('✅ Clasificación final:', classification)

    // Guardar en caché
    classificationCache.set(cacheKey, classification)

    return classification
  } catch (error) {
    console.error('🚨 Error en classifyTask:', error)

    throw error
  }
}

export async function getDailyRecommendation(tasks, reminders) {
  const { apiKey, endpoint, model } = getConfig()
  if (!apiKey) return null

  const prompt = `Eres un asistente académico experto. Basado en las siguientes tareas y recordatorios de HOY, da una recomendación corta (máx 3 frases) sobre qué priorizar y cómo empezar.
  
  TAREAS TOP (prioridad + score):
  ${tasks.map(t => `- ${t.title} (${t.ai_priority}, ${t.progress || 0}% progreso, vence: ${t.due_date})`).join('\n')}
  
  RECORDATORIOS DE HOY:
  ${reminders.length > 0 ? reminders.map(r => `- ${r.title}`).join('\n') : 'Ninguno'}
  
  REGLAS:
  1. Sé directo y motivador.
  2. Si una tarea tiene progreso alto (>70%), sugiere terminarla.
  3. Si hay muchos recordatorios, sugiere enfocarse solo en lo más crítico.
  4. Responde con texto plano, sin JSON.`

  const url = `${endpoint}/chat/completions`
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 150,
      }),
    })

    if (!response.ok) return null
    const data = await response.json()
    return data?.choices?.[0]?.message?.content?.trim() || null
  } catch (error) {
    console.error('Error en getDailyRecommendation:', error)
    return null
  }
}