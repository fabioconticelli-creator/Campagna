'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const C = {
  bg: '#08040f',
  bg2: '#12091c',
  bg3: '#1b1029',
  border: '#2d183f',
  border2: '#46235f',
  text: '#f4eefe',
  textDim: '#b9a7cc',
  textMuted: '#7e6d92',
  red: '#d14b3d',
  red2: '#ff6b57'
}

function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: C.bg2,
        border: `1px solid ${C.border}`,
        borderRadius: 18,
        padding: 20,
        boxShadow: '0 0 30px rgba(0,0,0,.25)',
        ...style
      }}
    >
      {children}
    </div>
  )
}

function Section({ title, children, open = false }) {
  return (
    <details
      open={open}
      style={{
        marginBottom: 18,
        background: C.bg2,
        border: `1px solid ${C.border}`,
        borderRadius: 18,
        overflow: 'hidden'
      }}
    >
      <summary
        style={{
          cursor: 'pointer',
          padding: '18px 20px',
          fontSize: 22,
          fontWeight: 700,
          color: C.red2,
          userSelect: 'none'
        }}
      >
        {title}
      </summary>

      <div style={{ padding: 20 }}>
        {children}
      </div>
    </details>
  )
}

function OracleBox({ sessions }) {
  const [input, setInput] = useState('')
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)

  async function askOracle() {
    if (!input.trim()) return

    setLoading(true)
    setReply('')

    const sessionContext = sessions
      .map(
        s =>
          `- ${s.date || 'Data ignota'} | ${s.title}: ${s.summary || ''}`
      )
      .join('\n')

    const context = `
Sei l'Oracolo della campagna.
Parli in italiano con tono oscuro, evocativo e fantasy.
Aiuti il Dungeon Master con idee, eventi, colpi di scena e conseguenze narrative.

SESSIONI:
${sessionContext || 'Nessuna sessione registrata.'}
`

    try {
      const res = await fetch('/api/oracolo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          context,
          message: input
        })
      })

      const data = await res.json()

      setReply(
        data.reply ||
          data.error ||
          'L’oracolo non risponde.'
      )
    } catch {
      setReply(
        'Le nebbie del destino impediscono la visione...'
      )
    }

    setLoading(false)
  }

  return (
    <Card
      style={{
        background:
          'radial-gradient(circle at top, rgba(209,75,61,.15), rgba(18,9,28,.95))'
      }}
    >
      <div style={{ fontSize: 32 }}>🔮</div>

      <h2
        style={{
          margin: '8px 0',
          color: C.red2
        }}
      >
        Oracolo
      </h2>

      <p
        style={{
          color: C.textDim,
          fontSize: 14
        }}
      >
        Interroga l’oracolo sulla campagna.
      </p>

      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Chiedi qualcosa..."
        rows={4}
        style={{
          width: '100%',
          marginTop: 14,
          background: C.bg,
          border: `1px solid ${C.border2}`,
          borderRadius: 12,
          padding: 12,
          color: C.text,
          resize: 'vertical'
        }}
      />

      <button
        onClick={askOracle}
        disabled={loading}
        style={{
          marginTop: 12,
          width: '100%',
          background: C.red,
          border: 'none',
          borderRadius: 12,
          padding: 12,
          color: '#fff',
          fontWeight: 700,
          cursor: 'pointer'
        }}
      >
        {loading ? 'L’Oracolo osserva...' : 'Interroga'}
      </button>

      {reply && (
        <div
          style={{
            marginTop: 18,
            background: C.bg,
            border: `1px solid ${C.border}`,
            borderRadius: 14,
            padding: 16,
            whiteSpace: 'pre-wrap',
            lineHeight: 1.7,
            color: C.textDim,
            fontStyle: 'italic'
          }}
        >
          {reply}
        </div>
      )}
    </Card>
  )
}

export default function HomePage() {
  const [sessions, setSessions] = useState([])
  const [npcs, setNpcs] = useState([])
  const [factions, setFactions] = useState([])
  const [locations, setLocations] = useState([])

  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [summary, setSummary] = useState('')

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    const s = await supabase.from('sessions').select('*').order('created_at', { ascending: false })
    const n = await supabase.from('npcs').select('*')
    const f = await supabase.from('factions').select('*')
    const l = await supabase.from('locations').select('*')

    setSessions(s.data || [])
    setNpcs(n.data || [])
    setFactions(f.data || [])
    setLocations(l.data || [])
  }

  async function addSession() {
    if (!title.trim()) return

    await supabase.from('sessions').insert({
      title,
      date,
      summary
    })

    setTitle('')
    setDate('')
    setSummary('')

    loadAll()
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top, #13071d 0%, #08040f 60%)',
        color: C.text,
        padding: 24
      }}
    >
      <div
        style={{
          maxWidth: 1050,
          margin: '0 auto'
        }}
      >
        <header
          style={{
            textAlign: 'center',
            marginBottom: 30
          }}
        >
          <div style={{ fontSize: 42 }}>⚔️</div>

          <h1
            style={{
              fontSize: 46,
              margin: 0,
              letterSpacing: '.04em'
            }}
          >
            Campagna
          </h1>

          <p
            style={{
              color: C.textMuted,
              marginTop: 10
            }}
          >
            Archivio digitale per Dungeon Master
          </p>
        </header>

        <Section title="📜 Sessioni" open>
          <Card style={{ marginBottom: 18 }}>
            <h3 style={{ color: C.red2 }}>Aggiungi Sessione</h3>

            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Titolo sessione"
              style={inputStyle}
            />

            <input
              value={date}
              onChange={e => setDate(e.target.value)}
              placeholder="Data"
              style={inputStyle}
            />

            <textarea
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Riassunto..."
              rows={5}
              style={inputStyle}
            />

            <button
              onClick={addSession}
              style={buttonStyle}
            >
              Salva Sessione
            </button>
          </Card>

          {sessions.map(s => (
            <Card key={s.id} style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: C.red2
                }}
              >
                {s.title}
              </div>

              <div
                style={{
                  color: C.textMuted,
                  marginTop: 4,
                  marginBottom: 12
                }}
              >
                {s.date}
              </div>

              <div
                style={{
                  lineHeight: 1.7,
                  color: C.textDim
                }}
              >
                {s.summary}
              </div>
            </Card>
          ))}
        </Section>

        <Section title="👤 NPC">
          {npcs.length === 0 ? (
            <div style={{ color: C.textMuted }}>
              Nessun NPC salvato.
            </div>
          ) : (
            npcs.map(n => (
              <Card key={n.id} style={{ marginBottom: 12 }}>
                <div style={{ color: C.red2, fontSize: 20 }}>
                  {n.name}
                </div>

                <div style={{ color: C.textDim }}>
                  {n.description}
                </div>
              </Card>
            ))
          )}
        </Section>

        <Section title="🏰 Fazioni">
          {factions.length === 0 ? (
            <div style={{ color: C.textMuted }}>
              Nessuna fazione salvata.
            </div>
          ) : (
            factions.map(f => (
              <Card key={f.id} style={{ marginBottom: 12 }}>
                <div style={{ color: C.red2, fontSize: 20 }}>
                  {f.name}
                </div>

                <div style={{ color: C.textDim }}>
                  {f.description}
                </div>
              </Card>
            ))
          )}
        </Section>

        <Section title="🗺️ Location">
          {locations.length === 0 ? (
            <div style={{ color: C.textMuted }}>
              Nessuna location salvata.
            </div>
          ) : (
            locations.map(l => (
              <Card key={l.id} style={{ marginBottom: 12 }}>
                <div style={{ color: C.red2, fontSize: 20 }}>
                  {l.name}
                </div>

                <div style={{ color: C.textDim }}>
                  {l.description}
                </div>
              </Card>
            ))
          )}
        </Section>

        <Section title="🔮 Oracolo">
          <OracleBox sessions={sessions} />
        </Section>
      </div>
    </main>
  )
}

const inputStyle = {
  width: '100%',
  marginBottom: 12,
  background: C.bg,
  border: `1px solid ${C.border2}`,
  borderRadius: 12,
  padding: 12,
  color: C.text,
  outline: 'none'
}

const buttonStyle = {
  width: '100%',
  background: C.red,
  border: 'none',
  borderRadius: 12,
  padding: 12,
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer'
}
