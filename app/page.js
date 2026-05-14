'use client'

import { useState } from 'react'

const C = {
  bg: '#0e0b14',
  bg2: '#13101a',
  bg3: '#1a1624',
  border: '#2a2040',
  border2: '#332848',
  red: '#c0392b',
  red2: '#e74c3c',
  text: '#e8e0f0',
  textDim: '#8a7fa0',
  textMuted: '#4a4060',
}

function Card({ title, children }) {
  return (
    <div style={{
      background: C.bg2,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      padding: 18,
      boxShadow: '0 0 28px rgba(0,0,0,.25)'
    }}>
      <h2 style={{
        margin: '0 0 10px',
        fontSize: 18,
        color: C.red2,
        fontFamily: 'Georgia, serif'
      }}>
        {title}
      </h2>
      <div style={{ color: C.textDim, lineHeight: 1.7 }}>
        {children}
      </div>
    </div>
  )
}

function OracleBox() {
  const [input, setInput] = useState('')
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)

  async function askOracle() {
    if (!input.trim() || loading) return

    setLoading(true)
    setReply('')

    try {
      const context = `
Sei l'Oracolo della campagna.
Parli in italiano.
Il tuo tono è oscuro, solenne, fantasy e utile.
Aiuti il Dungeon Master a sviluppare sessioni, PNG, fazioni, eventi e conseguenze.
Se mancano informazioni, chiedi o proponi ipotesi coerenti.
`

      const res = await fetch('/api/oracolo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context,
          messages: [{ role: 'user', content: input }]
        })
      })

      const data = await res.json()
      setReply(data.reply || data.error || "L'Oracolo tace.")
    } catch (e) {
      setReply('Le nebbie del destino impediscono la risposta.')
    }

    setLoading(false)
  }

  return (
    <div style={{
      background: 'radial-gradient(circle at top, rgba(192,57,43,.18), rgba(19,16,26,.95))',
      border: `1px solid ${C.border2}`,
      borderRadius: 20,
      padding: 22
    }}>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 36 }}>🔮</div>
        <h2 style={{ margin: '8px 0 4px', color: C.red2 }}>
          Oracolo della Campagna
        </h2>
        <p style={{ margin: 0, color: C.textDim, fontSize: 14 }}>
          Chiedi consigli, idee, conseguenze o sviluppi narrativi.
        </p>
      </div>

      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Interroga l'Oracolo..."
        rows={4}
        style={{
          width: '100%',
          background: C.bg,
          color: C.text,
          border: `1px solid ${C.border2}`,
          borderRadius: 12,
          padding: 14,
          resize: 'vertical',
          outline: 'none',
          fontSize: 15
        }}
      />

      <button
        onClick={askOracle}
        disabled={loading || !input.trim()}
        style={{
          marginTop: 12,
          width: '100%',
          padding: '13px 18px',
          borderRadius: 12,
          border: 'none',
          background: loading || !input.trim() ? C.bg3 : C.red,
          color: '#fff',
          fontWeight: 700,
          cursor: loading || !input.trim() ? 'default' : 'pointer'
        }}
      >
        {loading ? "L'Oracolo scruta..." : "Consulta l'Oracolo"}
      </button>

      {reply && (
        <div style={{
          marginTop: 18,
          padding: 16,
          background: C.bg3,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          color: C.text,
          lineHeight: 1.75,
          whiteSpace: 'pre-wrap',
          fontStyle: 'italic'
        }}>
          {reply}
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: `linear-gradient(180deg, ${C.bg}, #08060c)`,
      color: C.text,
      padding: 24
    }}>
      <div style={{ maxWidth: 1050, margin: '0 auto' }}>
        <header style={{ textAlign: 'center', padding: '36px 0 28px' }}>
          <div style={{ fontSize: 42, marginBottom: 10 }}>⚔️</div>
          <h1 style={{
            fontSize: 42,
            margin: 0,
            color: C.text,
            letterSpacing: '.04em'
          }}>
            Campagna
          </h1>
          <p style={{
            color: C.textDim,
            maxWidth: 680,
            margin: '12px auto 0',
            lineHeight: 1.7
          }}>
            Archivio digitale per sessioni, personaggi, fazioni, cronologia e strumenti da Dungeon Master.
          </p>
        </header>

        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
          marginBottom: 22
        }}>
          <Card title="📜 Sessioni">
            Riassunti, eventi importanti, conseguenze e appunti della campagna.
          </Card>

          <Card title="👥 Personaggi">
            PG, PNG, alleati, nemici, relazioni e segreti narrativi.
          </Card>

          <Card title="🏰 Fazioni">
            Regni, culti, casate, ordini, gilde e poteri in movimento.
          </Card>

          <Card title="🗺️ Mondo">
            Luoghi, regioni, città, dungeon, mappe e punti d’interesse.
          </Card>
        </section>

        <OracleBox />

        <footer style={{
          textAlign: 'center',
          color: C.textMuted,
          fontSize: 12,
          padding: '32px 0 8px'
        }}>
          Creato per gestire la campagna senza perdere pezzi di lore nel Vuoto.
        </footer>
      </div>
    </main>
  )
}
