'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const C = {
  bg:'#05030a',
  side:'#10091b',
  card:'#130b20',
  card2:'#1a1029',
  border:'#34204d',
  border2:'#4f2d73',
  purple:'#7c3aed',
  purple2:'#a855f7',
  red:'#dc3f32',
  text:'#f2e9ff',
  dim:'#a995c2',
  muted:'#6f5d86',
  green:'#22c55e',
  yellow:'#d6a93f'
}

const menu = [
  ['sessions','Sessioni'],
  ['npcs','NPC'],
  ['factions','Fazioni'],
  ['locations','Luoghi'],
  ['oracle','Oracolo']
]

const emptyNpc = {
  name:'',
  role:'',
  attitude:'ALLEATO',
  status:'VIVO',
  faction:'',
  image_url:'',
  description:''
}

const emptyFaction = {
  name:'',
  icon:'⚔️',
  description:'',
  influence:0
}

const inputStyle = {
  width:'100%',
  marginBottom:14,
  background:C.bg,
  color:C.text,
  border:`1px solid ${C.border2}`,
  borderRadius:12,
  padding:'13px 14px',
  outline:'none',
  fontSize:16
}

function Tag({children,type}){
  const color =
    type === 'green' ? C.green :
    type === 'yellow' ? C.yellow :
    type === 'red' ? C.red :
    C.purple2

  return (
    <span style={{
      display:'inline-block',
      border:`1px solid ${color}`,
      color,
      borderRadius:6,
      padding:'3px 10px',
      fontSize:12,
      fontWeight:800,
      letterSpacing:'.12em',
      marginRight:6,
      marginTop:6
    }}>
      {children}
    </span>
  )
}

function Card({children,style={}}){
  return (
    <div style={{
      background:C.card,
      border:`1px solid ${C.border}`,
      borderRadius:18,
      padding:18,
      ...style
    }}>
      {children}
    </div>
  )
}

function Modal({title,onClose,children,onSave}){
  return (
    <div style={{
      position:'fixed',
      inset:0,
      background:'rgba(0,0,0,.78)',
      zIndex:50,
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
      padding:20
    }}>
      <div style={{
        width:'100%',
        maxWidth:620,
        background:C.card,
        border:`1px solid ${C.border2}`,
        borderRadius:22,
        overflow:'hidden',
        boxShadow:'0 0 50px rgba(220,63,50,.16)'
      }}>
        <div style={{
          padding:'22px 26px',
          borderBottom:`1px solid ${C.border}`,
          display:'flex',
          justifyContent:'space-between',
          alignItems:'center'
        }}>
          <h2 style={{margin:0,color:C.red,fontSize:24}}>{title}</h2>
          <button onClick={onClose} style={{background:'none',border:'none',color:C.dim,fontSize:28,cursor:'pointer'}}>×</button>
        </div>

        <div style={{padding:26}}>
          {children}
        </div>

        <div style={{
          padding:'18px 26px',
          borderTop:`1px solid ${C.border}`,
          display:'flex',
          justifyContent:'flex-end',
          gap:12
        }}>
          <button onClick={onClose} style={{
            padding:'12px 22px',
            borderRadius:12,
            background:'transparent',
            border:`1px solid ${C.border2}`,
            color:C.dim,
            fontWeight:700,
            cursor:'pointer'
          }}>
            Annulla
          </button>

          <button onClick={onSave} style={{
            padding:'12px 24px',
            borderRadius:12,
            background:C.red,
            border:'none',
            color:'#fff',
            fontWeight:800,
            cursor:'pointer'
          }}>
            Salva
          </button>
        </div>
      </div>
    </div>
  )
}

function Sidebar({tab,setTab}){
  return (
    <aside style={{
      background:C.side,
      borderRight:`1px solid ${C.border}`,
      padding:18,
      height:'100vh',
      position:'sticky',
      top:0
    }}>
      <h1 style={{color:C.purple2,fontSize:22,margin:'0 0 4px'}}>Campagna</h1>
      <div style={{color:C.muted,fontSize:13,marginBottom:28}}>DM · Dungeon Master</div>

      <div style={{
        fontSize:11,
        color:C.purple2,
        letterSpacing:'.16em',
        fontWeight:800,
        marginBottom:10
      }}>
        LA CAMPAGNA
      </div>

      <nav style={{display:'grid',gap:6}}>
        {menu.map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{
            textAlign:'left',
            padding:'12px 14px',
            borderRadius:8,
            border:tab===id?`1px solid ${C.border2}`:'1px solid transparent',
            background:tab===id?'rgba(124,58,237,.24)':'transparent',
            color:tab===id?C.text:C.dim,
            cursor:'pointer',
            fontWeight:tab===id?800:500
          }}>
            {label}
          </button>
        ))}
      </nav>
    </aside>
  )
}

function NpcList({npcs,factions,onAdd}){
  const [search,setSearch]=useState('')
  const [filter,setFilter]=useState('Tutti')

  const factionNames = ['Tutti',...factions.map(f=>f.name)]

  const filtered = npcs.filter(n=>{
    const matchSearch =
      n.name?.toLowerCase().includes(search.toLowerCase()) ||
      n.role?.toLowerCase().includes(search.toLowerCase())

    const matchFaction = filter === 'Tutti' || n.faction === filter

    return matchSearch && matchFaction
  })

  const grouped = filtered.reduce((acc,n)=>{
    const key = n.faction || 'Nessuna fazione'
    acc[key] = acc[key] || []
    acc[key].push(n)
    return acc
  },{})

  return (
    <>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <div style={{
            width:44,
            height:44,
            borderRadius:'50%',
            background:C.red,
            boxShadow:'0 0 28px rgba(220,63,50,.45)'
          }} />
          <h2 style={{margin:0,color:C.red,fontSize:30}}>NPC</h2>
        </div>

        <button onClick={onAdd} style={{
          background:C.purple,
          color:'#fff',
          border:'none',
          borderRadius:10,
          padding:'12px 18px',
          fontWeight:800,
          cursor:'pointer'
        }}>
          + Aggiungi
        </button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 220px',gap:14,marginBottom:18}}>
        <input
          value={search}
          onChange={e=>setSearch(e.target.value)}
          placeholder="Cerca..."
          style={inputStyle}
        />

        <select value={filter} onChange={e=>setFilter(e.target.value)} style={inputStyle}>
          {factionNames.map(f=><option key={f}>{f}</option>)}
        </select>
      </div>

      <div style={{color:C.muted,marginBottom:20}}>
        {filtered.length} personaggi
      </div>

      {Object.entries(grouped).map(([faction,items])=>(
        <section key={faction} style={{marginBottom:26}}>
          <div style={{
            color:C.yellow,
            fontWeight:900,
            letterSpacing:'.22em',
            fontSize:15,
            borderBottom:`1px solid ${C.border2}`,
            paddingBottom:12,
            marginBottom:14
          }}>
            {faction.toUpperCase()} <span style={{color:C.muted}}>({items.length})</span>
          </div>

          <div style={{display:'grid',gap:14}}>
            {items.map(n=>(
              <div key={n.id} style={{
                display:'flex',
                alignItems:'center',
                gap:18,
                background:C.card,
                border:`1px solid ${C.border}`,
                borderRadius:18,
                padding:18
              }}>
                <div style={{
                  width:78,
                  height:78,
                  borderRadius:'50%',
                  border:`4px solid ${n.status==='MORTO'?C.red:C.green}`,
                  overflow:'hidden',
                  flexShrink:0,
                  background:C.card2,
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center'
                }}>
                  {n.image_url
                    ? <img src={n.image_url} alt={n.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    : <span style={{fontSize:30}}>👤</span>
                  }
                </div>

                <div>
                  <h3 style={{margin:'0 0 6px',fontSize:25,color:C.text}}>{n.name}</h3>
                  <div style={{color:C.dim,fontSize:18,marginBottom:4}}>{n.role || 'Ruolo ignoto'}</div>

                  <Tag type={n.attitude==='NEMICO'?'red':n.attitude==='NEUTRALE'?'yellow':'green'}>
                    {n.attitude || 'SCONOSCIUTO'}
                  </Tag>

                  <Tag type={n.status==='MORTO'?'red':'green'}>
                    {n.status || 'VIVO'}
                  </Tag>

                  {n.faction && <Tag type="yellow">{n.faction}</Tag>}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  )
}

function FactionList({factions,onAdd}){
  return (
    <>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <h2 style={{margin:0,color:C.red,fontSize:30}}>Fazioni</h2>

        <button onClick={onAdd} style={{
          background:C.purple,
          color:'#fff',
          border:'none',
          borderRadius:10,
          padding:'12px 18px',
          fontWeight:800,
          cursor:'pointer'
        }}>
          + Aggiungi
        </button>
      </div>

      <div style={{display:'grid',gap:14}}>
        {factions.map(f=>(
          <Card key={f.id}>
            <div style={{display:'flex',gap:16,alignItems:'center'}}>
              <div style={{fontSize:34}}>{f.icon || '⚔️'}</div>
              <div style={{flex:1}}>
                <h3 style={{margin:'0 0 4px',color:C.text,fontSize:24}}>{f.name}</h3>
                <div style={{color:C.dim,lineHeight:1.6}}>{f.description}</div>
                <div style={{marginTop:10,color:C.yellow,fontWeight:800}}>
                  Influenza: {f.influence || 0}%
                </div>
              </div>
            </div>
          </Card>
        ))}

        {factions.length===0 && <Card><div style={{color:C.muted}}>Nessuna fazione salvata.</div></Card>}
      </div>
    </>
  )
}

function SimpleArchive({title,items,type,onAdd}){
  return (
    <>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <h2 style={{margin:0,color:C.red,fontSize:30}}>{title}</h2>
        <button onClick={onAdd} style={{
          background:C.purple,
          color:'#fff',
          border:'none',
          borderRadius:10,
          padding:'12px 18px',
          fontWeight:800,
          cursor:'pointer'
        }}>
          + Aggiungi
        </button>
      </div>

      <div style={{display:'grid',gap:14}}>
        {items.map(i=>(
          <Card key={i.id}>
            <h3 style={{margin:'0 0 8px',color:C.text,fontSize:22}}>{i.title || i.name}</h3>
            {i.date && <div style={{color:C.purple2,marginBottom:8}}>{i.date}</div>}
            <div style={{color:C.dim,lineHeight:1.7,whiteSpace:'pre-wrap'}}>
              {i.summary || i.description}
            </div>
          </Card>
        ))}

        {items.length===0 && <Card><div style={{color:C.muted}}>Nessun elemento salvato.</div></Card>}
      </div>
    </>
  )
}

function Oracle({data}){
  const [input,setInput]=useState('')
  const [reply,setReply]=useState('')
  const [loading,setLoading]=useState(false)

  async function ask(){
    if(!input.trim()) return
    setLoading(true)
    setReply('')

    const context = `
Sei l'Oracolo della campagna. Rispondi in italiano, tono oscuro e fantasy.

SESSIONI:
${data.sessions.map(s=>`- ${s.title}: ${s.summary||''}`).join('\n')}

NPC:
${data.npcs.map(n=>`- ${n.name} (${n.role||''}) ${n.attitude||''} ${n.status||''} ${n.faction||''}: ${n.description||''}`).join('\n')}

FAZIONI:
${data.factions.map(f=>`- ${f.name}: ${f.description||''}`).join('\n')}

LUOGHI:
${data.locations.map(l=>`- ${l.name}: ${l.description||''}`).join('\n')}
`

    try{
      const res = await fetch('/api/oracolo',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({context,message:input})
      })

      const out = await res.json()
      setReply(out.reply || out.error || "L'Oracolo tace.")
    }catch{
      setReply('Le nebbie del destino impediscono la visione.')
    }

    setLoading(false)
  }

  return (
    <Card>
      <h2 style={{color:C.red,marginTop:0}}>Oracolo</h2>
      <textarea
        value={input}
        onChange={e=>setInput(e.target.value)}
        placeholder="Interroga l'Oracolo..."
        rows={6}
        style={{...inputStyle,resize:'vertical'}}
      />
      <button onClick={ask} style={{
        width:'100%',
        padding:14,
        border:'none',
        borderRadius:12,
        background:C.purple,
        color:'#fff',
        fontWeight:800,
        cursor:'pointer'
      }}>
        {loading ? "L'Oracolo osserva..." : 'Consulta'}
      </button>

      {reply && <div style={{
        marginTop:18,
        padding:18,
        background:C.bg,
        border:`1px solid ${C.border}`,
        borderRadius:14,
        color:C.dim,
        whiteSpace:'pre-wrap',
        lineHeight:1.7,
        fontStyle:'italic'
      }}>{reply}</div>}
    </Card>
  )
}

export default function HomePage(){
  const [tab,setTab]=useState('npcs')
  const [data,setData]=useState({sessions:[],npcs:[],factions:[],locations:[]})
  const [modal,setModal]=useState(null)
  const [npc,setNpc]=useState(emptyNpc)
  const [faction,setFaction]=useState(emptyFaction)
  const [simple,setSimple]=useState({title:'',date:'',summary:'',name:'',description:''})

  useEffect(()=>{loadAll()},[])

  async function loadAll(){
    const [sessions,npcs,factions,locations] = await Promise.all([
      supabase.from('sessions').select('*').order('created_at',{ascending:false}),
      supabase.from('npcs').select('*').order('created_at',{ascending:false}),
      supabase.from('factions').select('*').order('created_at',{ascending:false}),
      supabase.from('locations').select('*').order('created_at',{ascending:false})
    ])

    setData({
      sessions:sessions.data||[],
      npcs:npcs.data||[],
      factions:factions.data||[],
      locations:locations.data||[]
    })
  }

  async function saveNpc(){
    if(!npc.name.trim()) return
    await supabase.from('npcs').insert([npc])
    setNpc(emptyNpc)
    setModal(null)
    loadAll()
  }

  async function saveFaction(){
    if(!faction.name.trim()) return
    await supabase.from('factions').insert([faction])
    setFaction(emptyFaction)
    setModal(null)
    loadAll()
  }

  async function saveSimple(){
    if(modal==='sessions'){
      await supabase.from('sessions').insert([{title:simple.title,date:simple.date,summary:simple.summary}])
    }

    if(modal==='locations'){
      await supabase.from('locations').insert([{name:simple.name,description:simple.description}])
    }

    setSimple({title:'',date:'',summary:'',name:'',description:''})
    setModal(null)
    loadAll()
  }

  return (
    <main style={{
      minHeight:'100vh',
      display:'grid',
      gridTemplateColumns:'250px 1fr',
      background:C.bg,
      color:C.text
    }}>
      <Sidebar tab={tab} setTab={setTab}/>

      <section style={{padding:'52px 44px',maxWidth:980,width:'100%',margin:'0 auto'}}>
        {tab==='npcs' && <NpcList npcs={data.npcs} factions={data.factions} onAdd={()=>setModal('npcs')}/>}
        {tab==='factions' && <FactionList factions={data.factions} onAdd={()=>setModal('factions')}/>}
        {tab==='sessions' && <SimpleArchive title="Sessioni" items={data.sessions} onAdd={()=>setModal('sessions')}/>}
        {tab==='locations' && <SimpleArchive title="Luoghi" items={data.locations} onAdd={()=>setModal('locations')}/>}
        {tab==='oracle' && <Oracle data={data}/>}
      </section>

      {modal==='npcs' && (
        <Modal title="Aggiungi NPC" onClose={()=>setModal(null)} onSave={saveNpc}>
          <input value={npc.name} onChange={e=>setNpc({...npc,name:e.target.value})} placeholder="Nome" style={inputStyle}/>
          <input value={npc.role} onChange={e=>setNpc({...npc,role:e.target.value})} placeholder="Ruolo" style={inputStyle}/>
          <input value={npc.image_url} onChange={e=>setNpc({...npc,image_url:e.target.value})} placeholder="URL immagine" style={inputStyle}/>

          <select value={npc.attitude} onChange={e=>setNpc({...npc,attitude:e.target.value})} style={inputStyle}>
            <option>ALLEATO</option>
            <option>NEUTRALE</option>
            <option>NEMICO</option>
            <option>SCONOSCIUTO</option>
          </select>

          <select value={npc.status} onChange={e=>setNpc({...npc,status:e.target.value})} style={inputStyle}>
            <option>VIVO</option>
            <option>MORTO</option>
            <option>SCONOSCIUTO</option>
          </select>

          <select value={npc.faction} onChange={e=>setNpc({...npc,faction:e.target.value})} style={inputStyle}>
            <option value="">Nessuna fazione</option>
            {data.factions.map(f=><option key={f.id}>{f.name}</option>)}
          </select>

          <textarea value={npc.description} onChange={e=>setNpc({...npc,description:e.target.value})} placeholder="Descrizione" rows={5} style={{...inputStyle,resize:'vertical'}}/>
        </Modal>
      )}

      {modal==='factions' && (
        <Modal title="Aggiungi Fazione" onClose={()=>setModal(null)} onSave={saveFaction}>
          <label style={{color:C.dim,fontWeight:800,letterSpacing:'.16em'}}>NOME</label>
          <input value={faction.name} onChange={e=>setFaction({...faction,name:e.target.value})} placeholder="Nome" style={inputStyle}/>

          <label style={{color:C.dim,fontWeight:800,letterSpacing:'.16em'}}>ICONA</label>
          <input value={faction.icon} onChange={e=>setFaction({...faction,icon:e.target.value})} placeholder="⚔️" style={inputStyle}/>

          <label style={{color:C.dim,fontWeight:800,letterSpacing:'.16em'}}>DESCRIZIONE</label>
          <textarea value={faction.description} onChange={e=>setFaction({...faction,description:e.target.value})} placeholder="..." rows={5} style={{...inputStyle,resize:'vertical'}}/>

          <label style={{color:C.dim,fontWeight:800,letterSpacing:'.16em'}}>INFLUENZA %</label>
          <input type="number" value={faction.influence} onChange={e=>setFaction({...faction,influence:Number(e.target.value)})} placeholder="0-100" style={inputStyle}/>
        </Modal>
      )}

      {(modal==='sessions' || modal==='locations') && (
        <Modal title={modal==='sessions'?'Aggiungi Sessione':'Aggiungi Luogo'} onClose={()=>setModal(null)} onSave={saveSimple}>
          {modal==='sessions' ? (
            <>
              <input value={simple.title} onChange={e=>setSimple({...simple,title:e.target.value})} placeholder="Titolo" style={inputStyle}/>
              <input value={simple.date} onChange={e=>setSimple({...simple,date:e.target.value})} placeholder="Data" style={inputStyle}/>
              <textarea value={simple.summary} onChange={e=>setSimple({...simple,summary:e.target.value})} placeholder="Riassunto" rows={5} style={{...inputStyle,resize:'vertical'}}/>
            </>
          ) : (
            <>
              <input value={simple.name} onChange={e=>setSimple({...simple,name:e.target.value})} placeholder="Nome luogo" style={inputStyle}/>
              <textarea value={simple.description} onChange={e=>setSimple({...simple,description:e.target.value})} placeholder="Descrizione" rows={5} style={{...inputStyle,resize:'vertical'}}/>
            </>
          )}
        </Modal>
      )}
    </main>
  )
}
