'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const C = {
  bg: '#05030a',
  side: '#10091b',
  panel: '#130b20',
  card: '#1a1029',
  card2: '#211433',
  border: '#34204d',
  border2: '#4f2d73',
  purple: '#7c3aed',
  purple2: '#a855f7',
  red: '#dc3f32',
  text: '#f2e9ff',
  dim: '#a995c2',
  muted: '#6f5d86',
  green: '#22c55e',
  yellow: '#eab308'
}

const menu = [
  ['sessions', 'Sessioni'],
  ['npcs', 'NPC'],
  ['locations', 'Mappa / Luoghi'],
  ['factions', 'Fazioni'],
  ['oracle', 'Oracolo'],
]

function Button({ children, onClick, active }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '12px 14px',
        borderRadius: 8,
        border: active ? `1px solid ${C.border2}` : '1px solid transparent',
        background: active ? 'rgba(124,58,237,.22)' : 'transparent',
        color: active ? C.text : C.dim,
        cursor: 'pointer',
        fontWeight: active ? 700 : 500
      }}
    >
      {children}
    </button>
  )
}

function Card({ children }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      padding: 18,
      marginBottom: 14
    }}>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%',
  marginBottom: 10,
  background: C.bg,
  color: C.text,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: 12,
  outline: 'none'
}

function Oracle({ data }) {
  const [input, setInput] = useState('')
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)

  async function ask() {
    if (!input.trim() || loading) return

    setLoading(true)
    setReply('')

    const context = `
Sei l'Oracolo della campagna.
Rispondi in italiano con tono oscuro, solenne e fantasy.
Aiuta il Dungeon Master usando i dati salvati.

SESSIONI:
${data.sessions.map(s => `- ${s.date || 'Data ignota'} | ${s.title}: ${s.summary || ''}`).join('\n') || 'Nessuna'}

NPC:
${data.npcs.map(n => `- ${n.name} (${n.role || 'ruolo ignoto'}): ${n.attitude || ''}. ${n.description || ''}`).join('\n') || 'Nessuno'}

FAZIONI:
${data.factions.map(f => `- ${f.name}: ${f.description || ''}`).join('\n') || 'Nessuna'}

LUOGHI:
${data.locations.map(l => `- ${l.name}: ${l.description || ''}`).join('\n') || 'Nessuno'}
`

    try {
      const res = await fetch('/api/oracolo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context, message: input })
      })

      const out = await res.json()
      setReply(out.reply || out.error || "L'Oracolo tace.")
    } catch {
      setReply('Le nebbie del destino impediscono la visione.')
    }

    setLoading(false)
  }

  return (
    <Card>
      <h2 style={{ color: C.purple2, marginTop: 0 }}>🔮 Oracolo</h2>

      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Interroga l'Oracolo..."
        rows={5}
        style={{ ...inputStyle, resize: 'vertical' }}
      />

      <button
        onClick={ask}
        disabled={loading}
        style={{
          width: '100%',
          padding: 13,
          border: 'none',
          borderRadius: 10,
          background: C.purple,
          color: 'white',
          fontWeight: 700,
          cursor: 'pointer'
        }}
      >
        {loading ? "L'Oracolo osserva..." : 'Consulta'}
      </button>

      {reply && (
        <div style={{
          marginTop: 16,
          padding: 16,
          background: C.bg,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          whiteSpace: 'pre-wrap',
          lineHeight: 1.7,
          color: C.dim,
          fontStyle: 'italic'
        }}>
          {reply}
        </div>
      )}
    </Card>
  )
}

export default function HomePage() {
  const [tab, setTab] = useState('sessions')
  const [data, setData] = useState({
    sessions: [],
    npcs: [],
    factions: [],
    locations: []
  })

  const [form, setForm] = useState({
    title: '',
    date: '',
    summary: '',
    name: '',
    role: '',
    attitude: '',
    description: ''
  })

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    const [sessions, npcs, factions, locations] = await Promise.all([
      supabase.from('sessions').select('*').order('created_at', { ascending: false }),
      supabase.from('npcs').select('*').order('created_at', { ascending: false }),
      supabase.from('factions').select('*').order('created_at', { ascending: false }),
      supabase.from('locations').select('*').order('created_at', { ascending: false })
    ])

    setData({
      sessions: sessions.data || [],
      npcs: npcs.data || [],
      factions: factions.data || [],
      locations: locations.data || []
    })
  }

  async function addItem() {
    if (tab === 'sessions') {
      if (!form.title.trim()) return
      await supabase.from('sessions').insert([{
        title: form.title,
        date: form.date,
        summary: form.summary
      }])
    }

    if (tab === 'npcs') {
      if (!form.name.trim()) return
      await supabase.from('npcs').insert([{
        name: form.name,
        role: form.role,
        attitude: form.attitude,
        description: form.description
      }])
    }

    if (tab === 'factions') {
      if (!form.name.trim()) return
      await supabase.from('factions').insert([{
        name: form.name,
        description: form.description
      }])
    }

    if (tab === 'locations') {
      if (!form.name.trim()) return
      await supabase.from('locations').insert([{
        name: form.name,
        description: form.description
      }])
    }

    setForm({
      title: '',
      date: '',
      summary: '',
      name: '',
      role: '',
      attitude: '',
      description: ''
    })

    loadAll()
  }

  async function deleteItem(table, id) {
    await supabase.from(table).delete().eq('id', id)
    loadAll()
  }

  const titleMap = {
    sessions: 'Sessioni',
    npcs: 'NPC',
    factions: 'Fazioni',
    locations: 'Luoghi',
    oracle: 'Oracolo'
  }

  const current = data[tab] || []

  return (
    <main style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '260px 1fr',
      background: C.bg,
      color: C.text
    }}>
      <aside style={{
        background: C.side,
        borderRight: `1px solid ${C.border}`,
        padding: 18,
        position: 'sticky',
        top: 0,
        height: '100vh'
      }}>
        <h1 style={{
          color: C.purple2,
          fontSize: 22,
          margin: '0 0 4px'
        }}>
          Campagna
        </h1>

        <div style={{ color: C.muted, fontSize: 13, marginBottom: 26 }}>
          DM · Dungeon Master
        </div>

        <div style={{
          fontSize: 11,
          color: C.purple2,
          letterSpacing: '.14em',
          fontWeight: 700,
          marginBottom: 10
        }}>
          LA CAMPAGNA
        </div>

        <nav style={{ display: 'grid', gap: 6 }}>
          {menu.map(([id, label]) => (
            <Button key={id} active={tab === id} onClick={() => setTab(id)}>
              {label}
            </Button>
          ))}
        </nav>
      </aside>

      <section style={{
        padding: '48px 40px',
        maxWidth: 960,
        width: '100%',
        margin: '0 auto'
      }}>
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 22
        }}>
          <div>
            <h2 style={{
              color: C.purple2,
              margin: 0,
              fontSize: 26
            }}>
              {titleMap[tab]}
            </h2>

            <div style={{ color: C.muted, fontSize: 13, marginTop: 6 }}>
              Gestisci informazioni e lore della campagna.
            </div>
          </div>
        </header>

        {tab === 'oracle' ? (
          <Oracle data={data} />
        ) : (
          <>
            <Card>
              <h3 style={{ color: C.purple2, marginTop: 0 }}>
                + Aggiungi
              </h3>

              {tab === 'sessions' ? (
                <>
                  <input
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="Titolo sessione"
                    style={inputStyle}
                  />

                  <input
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    placeholder="Data o periodo"
                    style={inputStyle}
                  />

                  <textarea
                    value={form.summary}
                    onChange={e => setForm({ ...form, summary: e.target.value })}
                    placeholder="Riassunto..."
                    rows={6}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </>
              ) : (
                <>
                  <input
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Nome"
                    style={inputStyle}
                  />

                  {tab === 'npcs' && (
                    <>
                      <input
                        value={form.role}
                        onChange={e => setForm({ ...form, role: e.target.value })}
                        placeholder="Ruolo"
                        style={inputStyle}
                      />

                      <input
                        value={form.attitude}
                        onChange={e => setForm({ ...form, attitude: e.target.value })}
                        placeholder="Atteggiamento"
                        style={inputStyle}
                      />
                    </>
                  )}

                  <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Descrizione..."
                    rows={6}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </>
              )}

              <button
                onClick={addItem}
                style={{
                  width: '100%',
                  padding: 13,
                  border: 'none',
                  borderRadius: 10,
                  background: C.purple,
                  color: 'white',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Salva
              </button>
            </Card>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 14
            }}>
              {current.length === 0 && (
                <Card>
                  <div style={{ color: C.muted, fontStyle: 'italic' }}>
                    Nessun elemento salvato.
                  </div>
                </Card>
              )}

              {current.map(item => (
                <Card key={item.id}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 10
                  }}>
                    <div>
                      <h3 style={{
                        margin: 0,
                        color: C.text,
                        fontSize: 18
                      }}>
                        {item.title || item.name}
                      </h3>

                      {item.date && (
                        <div style={{ color: C.purple2, fontSize: 13, marginTop: 5 }}>
                          {item.date}
                        </div>
                      )}

                      {item.role && (
                        <div style={{ color: C.purple2, fontSize: 13, marginTop: 5 }}>
                          {item.role} · {item.attitude}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => deleteItem(tab, item.id)}
                      style={{
                        background: 'transparent',
                        border: `1px solid ${C.border}`,
                        color: C.muted,
                        borderRadius: 8,
                        cursor: 'pointer',
                        height: 32
                      }}
                    >
                      🗑️
                    </button>
                  </div>

                  {(item.summary || item.description) && (
                    <p style={{
                      color: C.dim,
                      lineHeight: 1.7,
                      whiteSpace: 'pre-wrap',
                      marginBottom: 0
                    }}>
                      {item.summary || item.description}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  )
}
