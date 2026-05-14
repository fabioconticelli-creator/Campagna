'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

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

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: C.bg2,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      padding: 18,
      ...style
    }}>
      {children}
    </div>
  )
}

function OracleBox({ sessions }) {
  const [input, setInput] = useState('')
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)

  async function askOracle() {
    if (!input.trim() || loading) return

    setLoading(true)
    setReply('')

    const sessionContext = sessions.map(s =>
      `- ${s.date || 'Data ignota'} | ${s.title}: ${s.summary || ''}`
    ).join('\n')

    const context = `
Sei l'Oracolo della campagna.
Parli in italiano, con tono oscuro, solenne, fantasy e utile.
Aiuti il Dungeon Master a sviluppare sessioni, PNG, fazioni, eventi e conseguenze.

SESSIONI REGISTRATE:
${sessionContext || 'Nessuna sessione registrata.'}
`

    try {
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
    <Card style={{ background: 'radial-gradient(circle at top, rgba(192,57,43,.18), rgba(19,16,26,.95))' }}>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 36 }}>🔮</div>
        <h2 style={{ margin: '8px 0 4px', color: C.red2 }}>Oracolo</h2>
        <p style={{ margin: 0, color: C.textDim, fontSize: 14 }}>
          Conosce le sessioni salvate e ti aiuta a sviluppare la campagna.
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
    </Card>
  )
}

export default function HomePage() {
  const [tab, setTab] = useState('sessioni')
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [summary, setSummary] = useState('')

  useEffect(() => {
    loadSessions()
  }, [])

  async function loadSessions() {
    setLoading(true)

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setSessions(data || [])
    setLoading(false)
  }

  async function addSession() {
    if (!title.trim()) return

    const { error } = await supabase.from('sessions').insert([{
      title,
      date,
      summary
    }])

    if (!error) {
      setTitle('')
      setDate('')
      setSummary('')
      loadSessions()
    } else {
      alert(error.message)
    }
  }

  async function deleteSession(id) {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id)

    if (!error) loadSessions()
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: `linear-gradient(180deg, ${C.bg}, #08060c)`,
      color: C.text,
      padding: 24
    }}>
      <div style={{ maxWidth: 1050, margin: '0 auto' }}>
        <header style={{ textAlign: 'center', padding: '34px 0 24px' }}>
          <div style={{ fontSize: 42, marginBottom: 10 }}>⚔️</div>
          <h1 style={{ fontSize: 42, margin: 0, letterSpacing: '.04em' }}>
            Campagna
          </h1>
          <p style={{ color: C.textDim, marginTop: 10 }}>
            Archivio digitale per sessioni, lore e strumenti da Dungeon Master.
          </p>
        </header>

        <div style={{
          display: 'flex',
          gap: 8,
          justifyContent: 'center',
          marginBottom: 22,
          flexWrap: 'wrap'
        }}>
          {[
            ['sessioni', '📜 Sessioni'],
            ['oracolo', '🔮 Oracolo']
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                padding: '10px 18px',
                borderRadius: 999,
                border: `1px solid ${tab === id ? C.red2 : C.border2}`,
                background: tab === id ? C.red : C.bg2,
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 700
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'sessioni' && (
          <section style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
            <Card>
              <h2 style={{ marginTop: 0, color: C.red2 }}>Aggiungi Sessione</h2>

              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Titolo sessione"
                style={inputStyle}
              />

              <input
                value={date}
                onChange={e => setDate(e.target.value)}
                placeholder="Data o periodo"
                style={inputStyle}
              />

              <textarea
                value={summary}
                onChange={e => setSummary(e.target.value)}
                placeholder="Riassunto della sessione..."
                rows={6}
                style={{ ...inputStyle, resize: 'vertical' }}
              />

              <button
                onClick={addSession}
                style={{
                  width: '100%',
                  padding: 13,
                  borderRadius: 12,
                  border: 'none',
                  background: C.red,
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Salva Sessione
              </button>
            </Card>

            <Card>
              <h2 style={{ marginTop: 0, color: C.red2 }}>Sessioni Salvate</h2>

              {loading && <p style={{ color: C.textDim }}>Caricamento...</p>}

              {!loading && sessions.length === 0 && (
                <p style={{ color: C.textDim, fontStyle: 'italic' }}>
                  Nessuna sessione salvata.
                </p>
              )}

              <div style={{ display: 'grid', gap: 12 }}>
                {sessions.map(s => (
                  <div key={s.id} style={{
                    background: C.bg3,
                    border: `1px solid ${C.border2}`,
                    borderRadius: 14,
                    padding: 14
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <div>
                        <h3 style={{ margin: '0 0 4px', color: C.text }}>
                          {s.title}
                        </h3>
                        <div style={{ fontSize: 13, color: C.red2 }}>
                          {s.date || 'Data ignota'}
                        </div>
                      </div>

                      <button
                        onClick={() => deleteSession(s.id)}
                        style={{
                          background: 'transparent',
                          border: `1px solid ${C.border2}`,
                          color: C.textDim,
                          borderRadius: 8,
                          cursor: 'pointer',
                          padding: '6px 10px'
                        }}
                      >
                        🗑️
                      </button>
                    </div>

                    {s.summary && (
                      <p style={{
                        color: C.textDim,
                        lineHeight: 1.7,
                        whiteSpace: 'pre-wrap',
                        marginBottom: 0
                      }}>
                        {s.summary}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </section>
        )}

        {tab === 'oracolo' && <OracleBox sessions={sessions} />}

        <footer style={{
          textAlign: 'center',
          color: C.textMuted,
          fontSize: 12,
          padding: '32px 0 8px'
        }}>
          Creato per non perdere la lore nel Vuoto.
        </footer>
      </div>
    </main>
  )
}

const inputStyle = {
  width: '100%',
  marginBottom: 12,
  background: C.bg,
  color: C.text,
  border: `1px solid ${C.border2}`,
  borderRadius: 12,
  padding: 13,
  outline: 'none',
  fontSize: 15
}
