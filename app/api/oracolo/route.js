export async function POST(req) {
  try {
    const { context, messages, message } = await req.json()

    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: 'Manca GEMINI_API_KEY su Vercel.' },
        { status: 500 }
      )
    }

    const userMessages = messages?.length
      ? messages
      : [{ role: 'user', content: message || '' }]

    const prompt = `
${context || "Sei l'Oracolo della campagna. Rispondi in italiano con tono oscuro, evocativo e utile."}

CONVERSAZIONE:
${userMessages
  .map(m => `${m.role === 'user' ? 'Viandante' : 'Oracolo'}: ${m.content}`)
  .join('\n')}

Rispondi all'ultimo messaggio del Viandante.
`

    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    )

    const data = await res.json()

    if (!res.ok) {
      return Response.json(
        { error: data?.error?.message || 'Errore Gemini.' },
        { status: 500 }
      )
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "L'Oracolo rimane in silenzio."

    return Response.json({ reply })
  } catch (error) {
    return Response.json(
      { error: error.message || "Errore sconosciuto dell'Oracolo." },
      { status: 500 }
    )
  }
}
