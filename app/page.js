'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const IS_DM = true
const BUCKET = 'campaign-images'

const C = {
  bg:'#05030a', side:'#10091b', card:'#130b20', card2:'#1a1029',
  border:'#34204d', border2:'#4f2d73',
  purple:'#7c3aed', purple2:'#a855f7', red:'#dc3f32',
  text:'#f2e9ff', dim:'#a995c2', muted:'#6f5d86',
  green:'#22c55e', yellow:'#d6a93f'
}

const menu = [
  ['sessions','Sessioni'],
  ['chronicles','Cronache'],
  ['npcs','NPC'],
  ['factions','Fazioni'],
  ['locations','Luoghi'],
  ['oracle','Oracolo']
]

const emptyNpc = { id:null, name:'', role:'', attitude:'ALLEATO', status:'VIVO', faction:'', image_url:'', description:'' }
const emptyFaction = { id:null, name:'', icon:'⚔️', description:'', influence:0 }
const emptySimple = { id:null, title:'', date:'', session_number:'', summary:'', name:'', description:'', image_url:'' }

const inputStyle = {
  width:'100%', marginBottom:14, background:C.bg, color:C.text,
  border:`1px solid ${C.border2}`, borderRadius:12,
  padding:'13px 14px', outline:'none', fontSize:16
}

async function uploadImage(file, folder='uploads'){
  if(!file) return ''
  const ext = file.name.split('.').pop()
  const path = `${folder}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file)
  if(error) {
    alert(error.message)
    return ''
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

function Tag({children,type}){
  const color = type==='green'?C.green:type==='yellow'?C.yellow:type==='red'?C.red:C.purple2
  return <span style={{
    display:'inline-block', border:`1px solid ${color}`, color,
    borderRadius:6, padding:'3px 10px', fontSize:12,
    fontWeight:800, letterSpacing:'.12em', marginRight:6, marginTop:6
  }}>{children}</span>
}

function Card({children,style={}}){
  return <div style={{
    background:C.card, border:`1px solid ${C.border}`,
    borderRadius:18, padding:18, ...style
  }}>{children}</div>
}

function Modal({title,onClose,children,onSave,saveLabel='Salva'}){
  return <div style={{
    position:'fixed', inset:0, background:'rgba(0,0,0,.78)',
    zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:20
  }}>
    <div style={{
      width:'100%', maxWidth:620, background:C.card,
      border:`1px solid ${C.border2}`, borderRadius:22, overflow:'hidden',
      boxShadow:'0 0 50px rgba(220,63,50,.16)'
    }}>
      <div style={{
        padding:'22px 26px', borderBottom:`1px solid ${C.border}`,
        display:'flex', justifyContent:'space-between', alignItems:'center'
      }}>
        <h2 style={{margin:0,color:C.red,fontSize:24}}>{title}</h2>
        <button onClick={onClose} style={{background:'none',border:'none',color:C.dim,fontSize:28,cursor:'pointer'}}>×</button>
      </div>

      <div style={{padding:26}}>{children}</div>

      <div style={{
        padding:'18px 26px', borderTop:`1px solid ${C.border}`,
        display:'flex', justifyContent:'flex-end', gap:12
      }}>
        <button onClick={onClose} style={{
          padding:'12px 22px', borderRadius:12, background:'transparent',
          border:`1px solid ${C.border2}`, color:C.dim, fontWeight:700, cursor:'pointer'
        }}>Annulla</button>

        <button onClick={onSave} style={{
          padding:'12px 24px', borderRadius:12, background:C.red,
          border:'none', color:'#fff', fontWeight:800, cursor:'pointer'
        }}>{saveLabel}</button>
      </div>
    </div>
  </div>
}

function ConfirmModal({onClose,onConfirm,label}){
  return <Modal title="Sei sicuro?" onClose={onClose} onSave={onConfirm} saveLabel="Sì, elimina">
    <p style={{color:C.dim,lineHeight:1.7,marginTop:0}}>
      Stai per eliminare <strong style={{color:C.text}}>{label}</strong>.
      <br />
      Questa azione non può essere annullata.
    </p>
  </Modal>
}

function Sidebar({tab,setTab,open,setOpen}){
  return <>
    <button onClick={()=>setOpen(!open)} style={{
      position:'fixed', top:18, left:18, zIndex:60,
      width:48, height:48, borderRadius:12,
      background:C.side, border:`1px solid ${C.border2}`,
      color:C.dim, fontSize:24, cursor:'pointer'
    }}>☰</button>

    {open && <aside style={{
      background:C.side, borderRight:`1px solid ${C.border}`,
      padding:'80px 18px 18px', height:'100vh', position:'fixed',
      left:0, top:0, width:250, zIndex:55
    }}>
      <button onClick={()=>setOpen(false)} style={{
        position:'absolute', top:18, right:18, background:'none',
        border:'none', color:C.dim, fontSize:22, cursor:'pointer'
      }}>×</button>

      <h1 style={{color:C.purple2,fontSize:22,margin:'0 0 4px'}}>Campagna</h1>
      <div style={{color:C.muted,fontSize:13,marginBottom:28}}>DM · Dungeon Master</div>

      <div style={{
        fontSize:11, color:C.purple2, letterSpacing:'.16em',
        fontWeight:800, marginBottom:10
      }}>LA CAMPAGNA</div>

      <nav style={{display:'grid',gap:6}}>
        {menu.map(([id,label])=>(
          <button key={id} onClick={()=>{setTab(id);setOpen(false)}} style={{
            textAlign:'left', padding:'12px 14px', borderRadius:8,
            border:tab===id?`1px solid ${C.border2}`:'1px solid transparent',
            background:tab===id?'rgba(124,58,237,.24)':'transparent',
            color:tab===id?C.text:C.dim, cursor:'pointer',
            fontWeight:tab===id?800:500
          }}>{label}</button>
        ))}
      </nav>
    </aside>}
  </>
}

function HeaderBar({title,onAdd,canAdd=true}){
  return <div style={{
    display:'flex', alignItems:'center', justifyContent:'space-between',
    gap:18, marginBottom:22
  }}>
    <div style={{display:'flex',alignItems:'center',gap:16,marginLeft:64}}>
      <div style={{width:44,height:44,borderRadius:'50%',background:C.red,boxShadow:'0 0 28px rgba(220,63,50,.45)'}} />
      <h2 style={{margin:0,color:C.red,fontSize:30}}>{title}</h2>
    </div>

    {IS_DM && canAdd && <button onClick={onAdd} style={{
      background:C.purple, color:'#fff', border:'none',
      borderRadius:10, padding:'12px 18px', fontWeight:800, cursor:'pointer'
    }}>+ Aggiungi</button>}
  </div>
}

function ActionButtons({onEdit,onDelete}){
  if(!IS_DM) return null

  return <div style={{display:'flex',gap:8,marginTop:14}}>
    <button onClick={onEdit} style={{
      flex:1,
      background:'transparent',
      border:`1px solid ${C.border2}`,
      color:C.dim,
      borderRadius:10,
      padding:'9px 12px',
      fontWeight:700,
      cursor:'pointer'
    }}>
      ✏️ Modifica
    </button>

    <button onClick={onDelete} style={{
      flex:1,
      background:C.red,
      border:'none',
      color:'#fff',
      borderRadius:10,
      padding:'9px 12px',
      fontWeight:800,
      cursor:'pointer'
    }}>
      🗑️ Elimina
    </button>
  </div>
}

function NpcList({npcs,factions,onAdd,onEdit,onDelete}){
  const [search,setSearch]=useState('')
  const [filter,setFilter]=useState('Tutti')
  const factionNames = ['Tutti',...factions.map(f=>f.name)]

  const filtered = npcs.filter(n=>{
    const matchSearch = n.name?.toLowerCase().includes(search.toLowerCase()) || n.role?.toLowerCase().includes(search.toLowerCase())
    const matchFaction = filter === 'Tutti' || n.faction === filter
    return matchSearch && matchFaction
  })

  const grouped = filtered.reduce((acc,n)=>{
    const key = n.faction || 'Nessuna fazione'
    acc[key] = acc[key] || []
    acc[key].push(n)
    return acc
  },{})

  return <>
    <HeaderBar title="NPC" onAdd={onAdd} />

    <div style={{display:'grid',gridTemplateColumns:'1fr 220px',gap:14,marginBottom:18}}>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca..." style={inputStyle}/>
      <select value={filter} onChange={e=>setFilter(e.target.value)} style={inputStyle}>
        {factionNames.map(f=><option key={f}>{f}</option>)}
      </select>
    </div>

    <div style={{color:C.muted,marginBottom:20}}>{filtered.length} personaggi</div>

    {Object.entries(grouped).map(([faction,items])=>(
      <section key={faction} style={{marginBottom:26}}>
        <div style={{
          color:C.yellow, fontWeight:900, letterSpacing:'.22em',
          fontSize:15, borderBottom:`1px solid ${C.border2}`,
          paddingBottom:12, marginBottom:14
        }}>{faction.toUpperCase()} <span style={{color:C.muted}}>({items.length})</span></div>

        <div style={{display:'grid',gap:14}}>
          {items.map(n=>(
            <div key={n.id} style={{
              display:'flex',alignItems:'center',gap:18,
              background:C.card,border:`1px solid ${C.border}`,
              borderRadius:18,padding:18
            }}>
              <div style={{
                width:78,height:78,borderRadius:'50%',
                border:`4px solid ${n.status==='MORTO'?C.red:C.green}`,
                overflow:'hidden',flexShrink:0,background:C.card2,
                display:'flex',alignItems:'center',justifyContent:'center'
              }}>
                {n.image_url ? <img src={n.image_url} alt={n.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <span style={{fontSize:30}}>👤</span>}
              </div>

              <div style={{flex:1}}>
                <h3 style={{margin:'0 0 6px',fontSize:25,color:C.text}}>{n.name}</h3>
                <div style={{color:C.dim,fontSize:18,marginBottom:4}}>{n.role || 'Ruolo ignoto'}</div>
                <Tag type={n.attitude==='NEMICO'?'red':n.attitude==='NEUTRALE'?'yellow':'green'}>{n.attitude || 'SCONOSCIUTO'}</Tag>
                <Tag type={n.status==='MORTO'?'red':'green'}>{n.status || 'VIVO'}</Tag>
                {n.faction && <Tag type="yellow">{n.faction}</Tag>}

                <ActionButtons
                  onEdit={()=>onEdit(n)}
                  onDelete={()=>onDelete('npcs',n.id,n.name)}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    ))}

    {filtered.length===0 && <Card><div style={{color:C.muted}}>Nessun NPC trovato.</div></Card>}
  </>
}

function FactionList({factions,onAdd,onEdit,onDelete}){
  return <>
    <HeaderBar title="Fazioni" onAdd={onAdd} />
    <div style={{display:'grid',gap:14}}>
      {factions.map(f=>(
        <Card key={f.id}>
          <div style={{display:'flex',gap:16,alignItems:'center'}}>
            <div style={{fontSize:34}}>{f.icon || '⚔️'}</div>
            <div style={{flex:1}}>
              <h3 style={{margin:'0 0 4px',color:C.text,fontSize:24}}>{f.name}</h3>
              <div style={{color:C.dim,lineHeight:1.6}}>{f.description}</div>
              <div style={{marginTop:10,color:C.yellow,fontWeight:800}}>Influenza: {f.influence || 0}%</div>

              <ActionButtons
                onEdit={()=>onEdit(f)}
                onDelete={()=>onDelete('factions',f.id,f.name)}
              />
            </div>
          </div>
        </Card>
      ))}
      {factions.length===0 && <Card><div style={{color:C.muted}}>Nessuna fazione salvata.</div></Card>}
    </div>
  </>
}

function SimpleArchive({title,items,onAdd,type,onEdit,onDelete}){
  return <>
    <HeaderBar title={title} onAdd={onAdd} />
    <div style={{display:'grid',gap:14}}>
      {items.map(i=>(
        <Card key={i.id}>
          {i.image_url && <img src={i.image_url} alt="" style={{width:'100%',maxHeight:260,objectFit:'cover',borderRadius:14,marginBottom:14}}/>}
          <h3 style={{margin:'0 0 8px',color:C.text,fontSize:22}}>
            {type==='sessions' && i.session_number ? `Sessione ${i.session_number} — ` : ''}{i.title || i.name}
          </h3>
          {i.date && <div style={{color:C.purple2,marginBottom:8}}>{i.date}</div>}
          <div style={{color:C.dim,lineHeight:1.7,whiteSpace:'pre-wrap'}}>{i.summary || i.description}</div>

          <ActionButtons
            onEdit={()=>onEdit(i)}
            onDelete={()=>onDelete(type,i.id,i.title || i.name)}
          />
        </Card>
      ))}
      {items.length===0 && <Card><div style={{color:C.muted}}>Nessun elemento salvato.</div></Card>}
    </div>
  </>
}

function Oracle({data}){
  const [input,setInput]=useState('')
  const [reply,setReply]=useState('')
  const [loading,setLoading]=useState(false)

  async function ask(){
    if(!input.trim()) return
    setLoading(true); setReply('')

    const context = `
Sei l'Oracolo della campagna. Rispondi in italiano, tono oscuro e fantasy.
SESSIONI:
${data.sessions.map(s=>`- Sessione ${s.session_number||'?'} ${s.title}: ${s.summary||''}`).join('\n')}
CRONACHE:
${data.chronicles.map(c=>`- ${c.date||''} ${c.title}: ${c.summary||''}`).join('\n')}
NPC:
${data.npcs.map(n=>`- ${n.name} (${n.role||''}) ${n.attitude||''} ${n.status||''} ${n.faction||''}: ${n.description||''}`).join('\n')}
FAZIONI:
${data.factions.map(f=>`- ${f.name}: ${f.description||''}`).join('\n')}
LUOGHI:
${data.locations.map(l=>`- ${l.name}: ${l.description||''}`).join('\n')}
`
    try{
      const res = await fetch('/api/oracolo',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({context,message:input})})
      const out = await res.json()
      setReply(out.reply || out.error || "L'Oracolo tace.")
    }catch{
      setReply('Le nebbie del destino impediscono la visione.')
    }
    setLoading(false)
  }

  return <>
    <HeaderBar title="Oracolo" canAdd={false} />
    <Card>
      <textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="Interroga l'Oracolo..." rows={6} style={{...inputStyle,resize:'vertical'}}/>
      <button onClick={ask} style={{width:'100%',padding:14,border:'none',borderRadius:12,background:C.purple,color:'#fff',fontWeight:800,cursor:'pointer'}}>
        {loading ? "L'Oracolo osserva..." : 'Consulta'}
      </button>
      {reply && <div style={{marginTop:18,padding:18,background:C.bg,border:`1px solid ${C.border}`,borderRadius:14,color:C.dim,whiteSpace:'pre-wrap',lineHeight:1.7,fontStyle:'italic'}}>{reply}</div>}
    </Card>
  </>
}

export default function HomePage(){
  const [tab,setTab]=useState('npcs')
  const [sidebarOpen,setSidebarOpen]=useState(false)
  const [data,setData]=useState({sessions:[],chronicles:[],npcs:[],factions:[],locations:[]})
  const [modal,setModal]=useState(null)
  const [deleteTarget,setDeleteTarget]=useState(null)
  const [npc,setNpc]=useState(emptyNpc)
  const [faction,setFaction]=useState(emptyFaction)
  const [simple,setSimple]=useState(emptySimple)

  useEffect(()=>{loadAll()},[])

  async function loadAll(){
    const [sessions,chronicles,npcs,factions,locations] = await Promise.all([
      supabase.from('sessions').select('*').order('created_at',{ascending:false}),
      supabase.from('chronicles').select('*').order('created_at',{ascending:false}),
      supabase.from('npcs').select('*').order('created_at',{ascending:false}),
      supabase.from('factions').select('*').order('created_at',{ascending:false}),
      supabase.from('locations').select('*').order('created_at',{ascending:false})
    ])
    setData({
      sessions:sessions.data||[],
      chronicles:chronicles.data||[],
      npcs:npcs.data||[],
      factions:factions.data||[],
      locations:locations.data||[]
    })
  }

  function openAdd(type){
    if(type==='npcs') setNpc(emptyNpc)
    if(type==='factions') setFaction(emptyFaction)
    if(type==='sessions' || type==='chronicles' || type==='locations') setSimple(emptySimple)
    setModal(type)
  }

  function openEdit(type,item){
    if(type==='npcs') setNpc({...emptyNpc,...item})
    if(type==='factions') setFaction({...emptyFaction,...item})
    if(type==='sessions' || type==='chronicles') {
      setSimple({
        ...emptySimple,
        id:item.id,
        title:item.title || '',
        date:item.date || '',
        session_number:item.session_number || '',
        summary:item.summary || '',
        image_url:item.image_url || ''
      })
    }
    if(type==='locations') {
      setSimple({
        ...emptySimple,
        id:item.id,
        name:item.name || '',
        description:item.description || ''
      })
    }
    setModal(type)
  }

  async function saveNpc(){
    if(!npc.name.trim()) return

    const payload = {
      name:npc.name,
      role:npc.role,
      attitude:npc.attitude,
      status:npc.status,
      faction:npc.faction,
      image_url:npc.image_url,
      description:npc.description
    }

    if(npc.id) await supabase.from('npcs').update(payload).eq('id',npc.id)
    else await supabase.from('npcs').insert([payload])

    setNpc(emptyNpc); setModal(null); loadAll()
  }

  async function saveFaction(){
    if(!faction.name.trim()) return

    const payload = {
      name:faction.name,
      icon:faction.icon,
      description:faction.description,
      influence:Number(faction.influence)||0
    }

    if(faction.id) await supabase.from('factions').update(payload).eq('id',faction.id)
    else await supabase.from('factions').insert([payload])

    setFaction(emptyFaction); setModal(null); loadAll()
  }

  async function saveSimple(){
    if(modal==='sessions'){
      const payload = {
        title:simple.title,
        date:simple.date,
        session_number:Number(simple.session_number)||null,
        summary:simple.summary,
        image_url:simple.image_url
      }

      if(simple.id) await supabase.from('sessions').update(payload).eq('id',simple.id)
      else await supabase.from('sessions').insert([payload])
    }

    if(modal==='chronicles'){
      const payload = {
        title:simple.title,
        date:simple.date,
        summary:simple.summary,
        image_url:simple.image_url
      }

      if(simple.id) await supabase.from('chronicles').update(payload).eq('id',simple.id)
      else await supabase.from('chronicles').insert([payload])
    }

    if(modal==='locations'){
      const payload = {
        name:simple.name,
        description:simple.description
      }

      if(simple.id) await supabase.from('locations').update(payload).eq('id',simple.id)
      else await supabase.from('locations').insert([payload])
    }

    setSimple(emptySimple); setModal(null); loadAll()
  }

  async function confirmDelete(){
    if(!deleteTarget) return

    await supabase.from(deleteTarget.table).delete().eq('id',deleteTarget.id)

    setDeleteTarget(null)
    loadAll()
  }

  function requestDelete(table,id,label){
    setDeleteTarget({table,id,label})
  }

  return <main style={{minHeight:'100vh',background:C.bg,color:C.text}}>
    <Sidebar tab={tab} setTab={setTab} open={sidebarOpen} setOpen={setSidebarOpen}/>

    <section style={{padding:'52px 44px',maxWidth:980,width:'100%',margin:'0 auto'}}>
      {tab==='npcs' && <NpcList npcs={data.npcs} factions={data.factions} onAdd={()=>openAdd('npcs')} onEdit={(i)=>openEdit('npcs',i)} onDelete={requestDelete}/>}
      {tab==='factions' && <FactionList factions={data.factions} onAdd={()=>openAdd('factions')} onEdit={(i)=>openEdit('factions',i)} onDelete={requestDelete}/>}
      {tab==='sessions' && <SimpleArchive title="Sessioni" type="sessions" items={data.sessions} onAdd={()=>openAdd('sessions')} onEdit={(i)=>openEdit('sessions',i)} onDelete={requestDelete}/>}
      {tab==='chronicles' && <SimpleArchive title="Cronache" type="chronicles" items={data.chronicles} onAdd={()=>openAdd('chronicles')} onEdit={(i)=>openEdit('chronicles',i)} onDelete={requestDelete}/>}
      {tab==='locations' && <SimpleArchive title="Luoghi" type="locations" items={data.locations} onAdd={()=>openAdd('locations')} onEdit={(i)=>openEdit('locations',i)} onDelete={requestDelete}/>}
      {tab==='oracle' && <Oracle data={data}/>}
    </section>

    {modal==='npcs' && <Modal title={npc.id ? 'Modifica NPC' : 'Aggiungi NPC'} onClose={()=>setModal(null)} onSave={saveNpc}>
      <input value={npc.name} onChange={e=>setNpc({...npc,name:e.target.value})} placeholder="Nome" style={inputStyle}/>
      <input value={npc.role} onChange={e=>setNpc({...npc,role:e.target.value})} placeholder="Ruolo" style={inputStyle}/>

      <input type="file" accept="image/*" style={inputStyle} onChange={async e=>setNpc({...npc,image_url:await uploadImage(e.target.files?.[0],'npcs')})}/>
      {npc.image_url && <img src={npc.image_url} alt="" style={{width:90,height:90,borderRadius:'50%',objectFit:'cover',marginBottom:14}}/>}

      <select value={npc.attitude} onChange={e=>setNpc({...npc,attitude:e.target.value})} style={inputStyle}>
        <option>ALLEATO</option><option>NEUTRALE</option><option>NEMICO</option><option>SCONOSCIUTO</option>
      </select>
      <select value={npc.status} onChange={e=>setNpc({...npc,status:e.target.value})} style={inputStyle}>
        <option>VIVO</option><option>MORTO</option><option>SCONOSCIUTO</option>
      </select>
      <select value={npc.faction} onChange={e=>setNpc({...npc,faction:e.target.value})} style={inputStyle}>
        <option value="">Nessuna fazione</option>
        {data.factions.map(f=><option key={f.id}>{f.name}</option>)}
      </select>
      <textarea value={npc.description} onChange={e=>setNpc({...npc,description:e.target.value})} placeholder="Descrizione" rows={5} style={{...inputStyle,resize:'vertical'}}/>
    </Modal>}

    {modal==='factions' && <Modal title={faction.id ? 'Modifica Fazione' : 'Aggiungi Fazione'} onClose={()=>setModal(null)} onSave={saveFaction}>
      <input value={faction.name} onChange={e=>setFaction({...faction,name:e.target.value})} placeholder="Nome" style={inputStyle}/>
      <input value={faction.icon} onChange={e=>setFaction({...faction,icon:e.target.value})} placeholder="Icona es. ⚔️" style={inputStyle}/>
      <textarea value={faction.description} onChange={e=>setFaction({...faction,description:e.target.value})} placeholder="Descrizione" rows={5} style={{...inputStyle,resize:'vertical'}}/>
      <input type="number" value={faction.influence} onChange={e=>setFaction({...faction,influence:Number(e.target.value)})} placeholder="Influenza 0-100" style={inputStyle}/>
    </Modal>}

    {(modal==='sessions' || modal==='chronicles' || modal==='locations') && <Modal title={
      modal==='sessions'
        ? simple.id ? 'Modifica Sessione' : 'Aggiungi Sessione'
        : modal==='chronicles'
          ? simple.id ? 'Modifica Cronaca' : 'Aggiungi Cronaca'
          : simple.id ? 'Modifica Luogo' : 'Aggiungi Luogo'
    } onClose={()=>setModal(null)} onSave={saveSimple}>
      {modal==='locations' ? <>
        <input value={simple.name} onChange={e=>setSimple({...simple,name:e.target.value})} placeholder="Nome luogo" style={inputStyle}/>
        <textarea value={simple.description} onChange={e=>setSimple({...simple,description:e.target.value})} placeholder="Descrizione" rows={5} style={{...inputStyle,resize:'vertical'}}/>
      </> : <>
        {modal==='sessions' && <input type="number" value={simple.session_number} onChange={e=>setSimple({...simple,session_number:e.target.value})} placeholder="Numero sessione" style={inputStyle}/>}
        <input value={simple.title} onChange={e=>setSimple({...simple,title:e.target.value})} placeholder="Titolo" style={inputStyle}/>
        <input value={simple.date} onChange={e=>setSimple({...simple,date:e.target.value})} placeholder="Data" style={inputStyle}/>
        <input type="file" accept="image/*" style={inputStyle} onChange={async e=>setSimple({...simple,image_url:await uploadImage(e.target.files?.[0],modal)})}/>
        {simple.image_url && <img src={simple.image_url} alt="" style={{width:'100%',maxHeight:180,objectFit:'cover',borderRadius:12,marginBottom:14}}/>}
        <textarea value={simple.summary} onChange={e=>setSimple({...simple,summary:e.target.value})} placeholder="Riassunto" rows={5} style={{...inputStyle,resize:'vertical'}}/>
      </>}
    </Modal>}

    {deleteTarget && (
      <ConfirmModal
        label={deleteTarget.label}
        onClose={()=>setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    )}
  </main>
}
