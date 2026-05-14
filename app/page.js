'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const IS_DM = true
const BUCKET = 'campaign-images'

const C = {
  bg:'#07050a',
  panel:'#0f0b16',
  card:'#15101d',
  card2:'#1d1628',
  border:'#3a2d4d',
  border2:'#6d5a86',
  accent:'#b89b5e',
  accent2:'#d8bd7a',
  red:'#9f2f2f',
  text:'#efe7dc',
  dim:'#b9ac9d',
  muted:'#756b62',
  green:'#6fa36f',
  yellow:'#c9a85f'
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
const emptySimple = { id:null, title:'', date:'', session_number:'', summary:'', name:'', description:'', image_url:'', npc_ids:[] }

const inputStyle = {
  width:'100%',
  marginBottom:14,
  background:C.bg,
  color:C.text,
  border:`1px solid ${C.border}`,
  borderRadius:0,
  padding:'13px 14px',
  outline:'none',
  fontSize:16
}

async function uploadImage(file, folder='uploads'){
  if(!file) return ''
  const ext = file.name.split('.').pop()
  const path = `${folder}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file)
  if(error){ alert(error.message); return '' }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

function getShort(text='', max=95){
  if(!text) return ''
  return text.length > max ? text.slice(0,max).trim() + '…' : text
}

function Tag({children,type}){
  const color = type==='green'?C.green:type==='yellow'?C.yellow:type==='red'?C.red:C.accent
  return <span className="tag" style={{borderColor:color,color}}>{children}</span>
}

function Card({children,onClick}){
  return <div className="compactCard" onClick={onClick}>{children}</div>
}

function Modal({title,onClose,children,onSave,saveLabel='Salva',hideFooter=false}){
  return <div className="modalOverlay">
    <div className="modalBox">
      <div className="modalHead">
        <h2>{title}</h2>
        <button onClick={onClose}>×</button>
      </div>

      <div className="modalBody">{children}</div>

      {!hideFooter && (
        <div className="modalFoot">
          <button className="ghostBtn" onClick={onClose}>Annulla</button>
          <button className="dangerBtn" onClick={onSave}>{saveLabel}</button>
        </div>
      )}
    </div>
  </div>
}

function ConfirmModal({onClose,onConfirm,label}){
  return <Modal title="Conferma eliminazione" onClose={onClose} onSave={onConfirm} saveLabel="Sì, elimina">
    <p className="detailText">
      Stai per eliminare <strong>{label}</strong>.<br/>
      Questa azione non può essere annullata.
    </p>
  </Modal>
}

function Sidebar({tab,setTab,open,setOpen}){
  return <>
    <button className="menuToggle" onClick={()=>setOpen(!open)}>☰</button>

    {open && <aside className="sidebar">
      <button className="closeMenu" onClick={()=>setOpen(false)}>×</button>

      <h1>Campagna</h1>
      <div className="sideSub">Archivio del Master</div>
      <div className="sideLabel">Menu</div>

      <nav>
        {menu.map(([id,label])=>(
          <button key={id} onClick={()=>{setTab(id);setOpen(false)}} className={tab===id?'active':''}>
            {label}
          </button>
        ))}
      </nav>
    </aside>}
  </>
}

function HeaderBar({title,onAdd,canAdd=true}){
  return <div className="headerBar">
    <div>
      <div className="sectionLabel">Archivio</div>
      <h2>{title}</h2>
    </div>

    {IS_DM && canAdd && (
      <button className="addBtn" onClick={onAdd}>+ Aggiungi</button>
    )}
  </div>
}

function ActionButtons({onEdit,onDelete}){
  if(!IS_DM) return null

  return <div className="actions" onClick={e=>e.stopPropagation()}>
    <button onClick={onEdit}>Modifica</button>
    <button className="delete" onClick={onDelete}>Elimina</button>
  </div>
}

function DetailActions({onEdit,onDelete,onClose}){
  if(!IS_DM) return null

  return <div className="detailActions">
    <button onClick={onEdit}>Modifica</button>
    <button className="delete" onClick={onDelete}>Elimina</button>
    <button className="ghost" onClick={onClose}>Chiudi</button>
  </div>
}

function CompactList({items,empty,onOpen,render}){
  if(!items.length) return <div className="emptyBox">{empty}</div>
  return <div className="list">{items.map(item=>render(item,onOpen))}</div>
}

function NpcList({npcs,factions,onAdd,onEdit,onDelete,onOpenDetails}){
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

  return <>
    <HeaderBar title="NPC" onAdd={onAdd}/>

    <div className="filters">
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cerca..." style={inputStyle}/>
      <select value={filter} onChange={e=>setFilter(e.target.value)} style={inputStyle}>
        {factionNames.map(f=><option key={f}>{f}</option>)}
      </select>
    </div>

    <div className="count">{filtered.length} personaggi</div>

    {Object.entries(grouped).map(([faction,items])=>(
      <section key={faction} className="group">
        <div className="groupTitle">{faction} <span>({items.length})</span></div>

        <CompactList
          items={items}
          empty="Nessun NPC trovato."
          onOpen={onOpenDetails}
          render={(n)=>(
            <Card key={n.id} onClick={()=>onOpenDetails(n)}>
              <div className="thumb round" style={{borderColor:n.status==='MORTO'?C.red:C.green}}>
                {n.image_url ? <img src={n.image_url} alt={n.name}/> : <span>👤</span>}
              </div>

              <div className="compactInfo">
                <h3>{n.name}</h3>
                <p>{n.role || 'Ruolo ignoto'}</p>

                <div>
                  <Tag type={n.attitude==='NEMICO'?'red':n.attitude==='NEUTRALE'?'yellow':'green'}>
                    {n.attitude || 'SCONOSCIUTO'}
                  </Tag>
                  <Tag type={n.status==='MORTO'?'red':'green'}>
                    {n.status || 'VIVO'}
                  </Tag>
                  {n.faction && <Tag type="yellow">{n.faction}</Tag>}
                </div>

                <ActionButtons
                  onEdit={()=>onEdit(n)}
                  onDelete={()=>onDelete('npcs',n.id,n.name)}
                />
              </div>
            </Card>
          )}
        />
      </section>
    ))}

    {filtered.length===0 && <div className="emptyBox">Nessun NPC trovato.</div>}
  </>
}

function InfluenceBar({value=0}){
  const safeValue = Math.max(0,Math.min(100,Number(value)||0))
  return <div className="influence">
    <div className="bar"><div style={{width:`${safeValue}%`}}/></div>
    <span>{safeValue}%</span>
  </div>
}

function FactionList({factions,onAdd,onEdit,onDelete,onOpenDetails}){
  return <>
    <HeaderBar title="Fazioni" onAdd={onAdd}/>

    <CompactList
      items={factions}
      empty="Nessuna fazione salvata."
      onOpen={onOpenDetails}
      render={(f)=>(
        <Card key={f.id} onClick={()=>onOpenDetails(f)}>
          <div className="thumb iconThumb">{f.icon || '⚔️'}</div>

          <div className="compactInfo">
            <h3>{f.name}</h3>
            <p>{getShort(f.description,90)}</p>
            <InfluenceBar value={f.influence}/>

            <ActionButtons
              onEdit={()=>onEdit(f)}
              onDelete={()=>onDelete('factions',f.id,f.name)}
            />
          </div>
        </Card>
      )}
    />
  </>
}

function NpcNames({ids,npcs}){
  const selected = npcs.filter(n=>ids?.includes(n.id))
  if(!selected.length) return null

  return <div className="miniTags">
    {selected.map(n=><Tag key={n.id} type="yellow">{n.name}</Tag>)}
  </div>
}

function ArchiveList({title,items,onAdd,type,onEdit,onDelete,onOpenDetails,npcs=[]}){
  return <>
    <HeaderBar title={title} onAdd={onAdd}/>

    <CompactList
      items={items}
      empty="Nessun elemento salvato."
      onOpen={onOpenDetails}
      render={(i)=>(
        <Card key={i.id} onClick={()=>onOpenDetails({...i,type})}>
          <div className="thumb">
            {i.image_url
              ? <img src={i.image_url} alt=""/>
              : <span>{type==='sessions'?'📜':type==='chronicles'?'🕯️':'🗺️'}</span>
            }
          </div>

          <div className="compactInfo">
            <h3>
              {type==='sessions' && i.session_number ? `Sessione ${i.session_number} — ` : ''}
              {i.title || i.name}
            </h3>

            {i.date && <p className="dateLine">{i.date}</p>}
            <p>{getShort(i.summary || i.description,90)}</p>

            {type==='sessions' && <NpcNames ids={i.npc_ids || []} npcs={npcs}/>}

            <ActionButtons
              onEdit={()=>onEdit(i)}
              onDelete={()=>onDelete(type,i.id,i.title || i.name)}
            />
          </div>
        </Card>
      )}
    />
  </>
}

function DetailsModal({item,type,npcs,onClose,onEdit,onDelete}){
  if(!item) return null

  const title =
    type==='sessions' && item.session_number
      ? `Sessione ${item.session_number} — ${item.title}`
      : item.title || item.name

  return <Modal title={title} onClose={onClose} hideFooter>
    <div className="detailWrap">
      {item.image_url && (
        <img className="detailImage" src={item.image_url} alt={title}/>
      )}

      {type==='npcs' && (
        <>
          {item.image_url ? (
            <img className="portrait" src={item.image_url} alt={item.name}/>
          ) : (
            <div className="portrait emptyPortrait">👤</div>
          )}

          <div className="detailTitle">{item.name}</div>
          <div className="detailSub">{item.role || 'Ruolo ignoto'}</div>

          <Tag type={item.attitude==='NEMICO'?'red':item.attitude==='NEUTRALE'?'yellow':'green'}>
            {item.attitude || 'SCONOSCIUTO'}
          </Tag>
          <Tag type={item.status==='MORTO'?'red':'green'}>
            {item.status || 'VIVO'}
          </Tag>
          {item.faction && <Tag type="yellow">{item.faction}</Tag>}

          <div className="detailText">{item.description || 'Nessuna descrizione.'}</div>
        </>
      )}

      {type==='factions' && (
        <>
          <div className="bigIcon">{item.icon || '⚔️'}</div>
          <div className="detailTitle">{item.name}</div>
          <InfluenceBar value={item.influence}/>
          <div className="detailText">{item.description || 'Nessuna descrizione.'}</div>
        </>
      )}

      {(type==='sessions' || type==='chronicles' || type==='locations') && (
        <>
          {item.date && <div className="dateLine big">{item.date}</div>}
          <div className="detailText">{item.summary || item.description || 'Nessuna descrizione.'}</div>
          {type==='sessions' && <NpcNames ids={item.npc_ids || []} npcs={npcs}/>}
        </>
      )}

      <DetailActions
        onEdit={()=>onEdit(type,item)}
        onDelete={()=>onDelete(type,item.id,item.title || item.name)}
        onClose={onClose}
      />
    </div>
  </Modal>
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
Sei l'Oracolo della campagna. Rispondi in italiano, tono oscuro, elegante e fantasy.

SESSIONI:
${data.sessions.map(s=>`- Sessione ${s.session_number||'?'} ${s.title}: ${s.summary||''}`).join('\n')}

CRONACHE:
${data.chronicles.map(c=>`- ${c.date||''} ${c.title}: ${c.summary||''}`).join('\n')}

NPC:
${data.npcs.map(n=>`- ${n.name} (${n.role||''}) ${n.attitude||''} ${n.status||''} ${n.faction||''}: ${n.description||''}`).join('\n')}

FAZIONI:
${data.factions.map(f=>`- ${f.name}, influenza ${f.influence||0}%: ${f.description||''}`).join('\n')}

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

  return <>
    <HeaderBar title="Oracolo" canAdd={false}/>

    <div className="oracleBox">
      <textarea
        value={input}
        onChange={e=>setInput(e.target.value)}
        placeholder="Interroga l'Oracolo..."
        rows={6}
        style={{...inputStyle,resize:'vertical'}}
      />

      <button className="addBtn full" onClick={ask}>
        {loading ? "L'Oracolo osserva..." : 'Consulta'}
      </button>

      {reply && <div className="oracleReply">{reply}</div>}
    </div>
  </>
}

export default function HomePage(){
  const [tab,setTab]=useState('npcs')
  const [sidebarOpen,setSidebarOpen]=useState(false)
  const [data,setData]=useState({sessions:[],chronicles:[],npcs:[],factions:[],locations:[]})
  const [modal,setModal]=useState(null)
  const [deleteTarget,setDeleteTarget]=useState(null)
  const [details,setDetails]=useState(null)

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
    if(type==='sessions'||type==='chronicles'||type==='locations') setSimple(emptySimple)
    setModal(type)
  }

  function openEdit(type,item){
    setDetails(null)

    if(type==='npcs') setNpc({...emptyNpc,...item})
    if(type==='factions') setFaction({...emptyFaction,...item})

    if(type==='sessions'||type==='chronicles') {
      setSimple({
        ...emptySimple,
        ...item,
        session_number:item.session_number || '',
        npc_ids:item.npc_ids || []
      })
    }

    if(type==='locations') setSimple({...emptySimple,...item})
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

    setNpc(emptyNpc)
    setModal(null)
    loadAll()
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

    setFaction(emptyFaction)
    setModal(null)
    loadAll()
  }

  async function saveSimple(){
    if(modal==='sessions'){
      const payload = {
        title:simple.title,
        date:simple.date,
        session_number:Number(simple.session_number)||null,
        summary:simple.summary,
        image_url:simple.image_url,
        npc_ids:simple.npc_ids || []
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

    setSimple(emptySimple)
    setModal(null)
    loadAll()
  }

  async function confirmDelete(){
    if(!deleteTarget) return

    await supabase.from(deleteTarget.table).delete().eq('id',deleteTarget.id)

    setDeleteTarget(null)
    setDetails(null)
    loadAll()
  }

  function requestDelete(table,id,label){
    setDeleteTarget({table,id,label})
  }

  function toggleSessionNpc(id){
    const current = simple.npc_ids || []

    if(current.includes(id)){
      setSimple({...simple,npc_ids:current.filter(x=>x!==id)})
    } else {
      setSimple({...simple,npc_ids:[...current,id]})
    }
  }

  return <main>
    <style jsx global>{`
      *{box-sizing:border-box}
      body{margin:0;background:${C.bg};color:${C.text};font-family:Georgia,'Times New Roman',serif}
      button,input,textarea,select{font-family:inherit}
      main{min-height:100vh;background:linear-gradient(180deg,#07050a,#030205);color:${C.text}}
      .menuToggle{position:fixed;top:16px;left:16px;z-index:60;width:46px;height:46px;background:${C.panel};border:1px solid ${C.border};color:${C.accent2};font-size:24px;cursor:pointer;border-radius:0}
      .sidebar{position:fixed;left:0;top:0;width:260px;height:100vh;background:${C.panel};border-right:1px solid ${C.border};padding:82px 18px 18px;z-index:55}
      .closeMenu{position:absolute;top:18px;right:18px;background:none;border:none;color:${C.dim};font-size:24px;cursor:pointer}
      .sidebar h1{margin:0;color:${C.accent2};font-size:24px;font-weight:400;letter-spacing:.06em}
      .sideSub{color:${C.muted};font-size:13px;margin:6px 0 28px}
      .sideLabel{font-size:11px;color:${C.accent};letter-spacing:.2em;text-transform:uppercase;margin-bottom:12px}
      nav{display:grid;gap:4px}
      nav button{text-align:left;padding:13px 12px;background:transparent;border:1px solid transparent;color:${C.dim};cursor:pointer;border-radius:0;font-size:16px}
      nav button.active{border-color:${C.border2};background:rgba(184,155,94,.08);color:${C.text}}
      section.mainContent{padding:72px 18px 32px;max-width:900px;margin:0 auto}
      .headerBar{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:22px}
      .sectionLabel{font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:${C.accent};margin-bottom:6px}
      .headerBar h2{margin:0;color:${C.text};font-size:32px;font-weight:400;letter-spacing:.04em}
      .addBtn{background:${C.accent};color:#120c06;border:none;padding:12px 18px;font-weight:700;cursor:pointer;border-radius:0;white-space:nowrap}
      .addBtn.full{width:100%;margin-top:4px}
      .filters{display:grid;grid-template-columns:1fr 220px;gap:14px;margin-bottom:12px}
      .count,.emptyBox{color:${C.muted};font-style:italic;margin-bottom:18px}
      .group{margin-bottom:26px}
      .groupTitle{color:${C.accent2};font-size:13px;letter-spacing:.22em;text-transform:uppercase;border-bottom:1px solid ${C.border};padding-bottom:10px;margin-bottom:14px}
      .groupTitle span{color:${C.muted}}
      .list{display:grid;gap:12px}
      .compactCard{display:flex;gap:16px;align-items:center;background:${C.card};border:1px solid ${C.border};padding:16px;cursor:pointer;transition:.15s}
      .compactCard:hover{border-color:${C.accent};background:${C.card2}}
      .thumb{width:72px;height:72px;border:1px solid ${C.border};overflow:hidden;flex-shrink:0;background:${C.card2};display:flex;align-items:center;justify-content:center;font-size:30px;color:${C.accent2}}
      .thumb.round{border-radius:50%;border:3px solid ${C.green}}
      .thumb img{width:100%;height:100%;object-fit:cover}
      .iconThumb{font-size:34px}
      .compactInfo{flex:1;min-width:0}
      .compactInfo h3{margin:0 0 5px;color:${C.text};font-size:22px;font-weight:400}
      .compactInfo p{margin:0 0 6px;color:${C.dim};line-height:1.45}
      .tag{display:inline-block;padding:3px 9px;font-size:11px;font-weight:600;letter-spacing:.14em;margin-right:6px;margin-top:6px;text-transform:uppercase;border:1px solid}
      .dateLine{color:${C.accent2}!important;font-size:14px!important;margin-bottom:4px!important}
      .dateLine.big{margin-bottom:14px!important}
      .miniTags{margin-top:8px}
      .influence{display:flex;align-items:center;gap:10px;margin-top:8px}
      .bar{height:7px;background:${C.bg};border:1px solid ${C.border};flex:1}
      .bar div{height:100%;background:${C.accent}}
      .influence span{color:${C.accent2};font-size:13px}
      .actions{display:flex;gap:8px;margin-top:12px}
      .actions button{flex:1;background:transparent;border:1px solid ${C.border2};color:${C.dim};padding:8px 10px;cursor:pointer;border-radius:0}
      .actions .delete{background:${C.red};border-color:${C.red};color:#fff}
      .modalOverlay{position:fixed;inset:0;background:rgba(0,0,0,.82);z-index:80;display:flex;align-items:center;justify-content:center;padding:16px}
      .modalBox{width:100%;max-width:620px;max-height:92vh;overflow:auto;background:${C.card};border:1px solid ${C.border2};border-radius:0}
      .modalHead{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid ${C.border};padding:20px}
      .modalHead h2{margin:0;color:${C.accent2};font-size:24px;font-weight:400}
      .modalHead button{background:none;border:none;color:${C.dim};font-size:26px;cursor:pointer}
      .modalBody{padding:20px}
      .modalFoot{display:flex;justify-content:flex-end;gap:10px;border-top:1px solid ${C.border};padding:16px 20px}
      .ghostBtn{background:transparent;border:1px solid ${C.border2};color:${C.dim};padding:11px 18px;cursor:pointer;border-radius:0}
      .dangerBtn{background:${C.red};border:1px solid ${C.red};color:white;padding:11px 18px;cursor:pointer;border-radius:0}
      .detailWrap{display:grid;gap:16px}
      .portrait{width:100%;max-height:380px;object-fit:cover;border:1px solid ${C.border}}
      .emptyPortrait{height:260px;background:${C.card2};display:flex;align-items:center;justify-content:center;font-size:70px}
      .detailImage{width:100%;max-height:340px;object-fit:cover;border:1px solid ${C.border}}
      .detailTitle{font-size:28px;color:${C.text};font-weight:400}
      .detailSub{color:${C.dim};font-size:18px}
      .detailText{color:${C.dim};line-height:1.75;white-space:pre-wrap;border-top:1px solid ${C.border};padding-top:16px}
      .detailText strong{color:${C.text}}
      .bigIcon{font-size:54px}
      .detailActions{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:10px}
      .detailActions button{background:transparent;border:1px solid ${C.border2};color:${C.dim};padding:11px;cursor:pointer}
      .detailActions .delete{background:${C.red};border-color:${C.red};color:white}
      .detailActions .ghost{background:${C.panel}}
      .oracleBox{background:${C.card};border:1px solid ${C.border};padding:18px}
      .oracleReply{margin-top:18px;padding:18px;background:${C.bg};border:1px solid ${C.border};color:${C.dim};white-space:pre-wrap;line-height:1.7;font-style:italic}
      .miniLabel{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:${C.accent};margin:16px 0 6px}
      .npcCheckboxList{display:grid;gap:8px;margin-bottom:14px}
      .npcCheck{display:flex;align-items:center;gap:10px;border:1px solid ${C.border};padding:10px;color:${C.dim};cursor:pointer}
      .npcCheck input{width:18px;height:18px}
      @media(max-width:700px){
        section.mainContent{padding:76px 12px 24px}
        .headerBar{align-items:flex-start}
        .headerBar h2{font-size:28px}
        .addBtn{padding:11px 13px}
        .filters{grid-template-columns:1fr}
        .compactCard{gap:14px;padding:14px}
        .thumb{width:62px;height:62px}
        .compactInfo h3{font-size:20px}
        .compactInfo p{font-size:15px}
        .actions{flex-direction:column}
        .modalOverlay{align-items:flex-end;padding:0}
        .modalBox{max-height:90vh;width:100%;border-left:none;border-right:none;border-bottom:none}
        .modalFoot{position:sticky;bottom:0;background:${C.card}}
        .detailActions{grid-template-columns:1fr}
      }
    `}</style>

    <Sidebar tab={tab} setTab={setTab} open={sidebarOpen} setOpen={setSidebarOpen}/>

    <section className="mainContent">
      {tab==='npcs' && (
        <NpcList
          npcs={data.npcs}
          factions={data.factions}
          onAdd={()=>openAdd('npcs')}
          onEdit={(i)=>openEdit('npcs',i)}
          onDelete={requestDelete}
          onOpenDetails={(item)=>setDetails({type:'npcs',item})}
        />
      )}

      {tab==='factions' && (
        <FactionList
          factions={data.factions}
          onAdd={()=>openAdd('factions')}
          onEdit={(i)=>openEdit('factions',i)}
          onDelete={requestDelete}
          onOpenDetails={(item)=>setDetails({type:'factions',item})}
        />
      )}

      {tab==='sessions' && (
        <ArchiveList
          title="Sessioni"
          type="sessions"
          items={data.sessions}
          npcs={data.npcs}
          onAdd={()=>openAdd('sessions')}
          onEdit={(i)=>openEdit('sessions',i)}
          onDelete={requestDelete}
          onOpenDetails={(item)=>setDetails({type:'sessions',item})}
        />
      )}

      {tab==='chronicles' && (
        <ArchiveList
          title="Cronache"
          type="chronicles"
          items={data.chronicles}
          onAdd={()=>openAdd('chronicles')}
          onEdit={(i)=>openEdit('chronicles',i)}
          onDelete={requestDelete}
          onOpenDetails={(item)=>setDetails({type:'chronicles',item})}
        />
      )}

      {tab==='locations' && (
        <ArchiveList
          title="Luoghi"
          type="locations"
          items={data.locations}
          onAdd={()=>openAdd('locations')}
          onEdit={(i)=>openEdit('locations',i)}
          onDelete={requestDelete}
          onOpenDetails={(item)=>setDetails({type:'locations',item})}
        />
      )}

      {tab==='oracle' && <Oracle data={data}/>}
    </section>

    {details && (
      <DetailsModal
        item={details.item}
        type={details.type}
        npcs={data.npcs}
        onClose={()=>setDetails(null)}
        onEdit={openEdit}
        onDelete={requestDelete}
      />
    )}

    {modal==='npcs' && <Modal title={npc.id ? 'Modifica NPC' : 'Aggiungi NPC'} onClose={()=>setModal(null)} onSave={saveNpc}>
      <input value={npc.name} onChange={e=>setNpc({...npc,name:e.target.value})} placeholder="Nome" style={inputStyle}/>
      <input value={npc.role} onChange={e=>setNpc({...npc,role:e.target.value})} placeholder="Ruolo" style={inputStyle}/>
      <input type="file" accept="image/*" style={inputStyle} onChange={async e=>setNpc({...npc,image_url:await uploadImage(e.target.files?.[0],'npcs')})}/>
      {npc.image_url && <img src={npc.image_url} alt="" style={{width:90,height:90,borderRadius:'50%',objectFit:'cover',marginBottom:14}}/>}

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
        {modal==='sessions' && (
          <>
            <input type="number" value={simple.session_number} onChange={e=>setSimple({...simple,session_number:e.target.value})} placeholder="Numero sessione" style={inputStyle}/>

            <div className="miniLabel">NPC incontrati</div>
            <div className="npcCheckboxList">
              {data.npcs.map(n=>(
                <label key={n.id} className="npcCheck">
                  <input
                    type="checkbox"
                    checked={(simple.npc_ids || []).includes(n.id)}
                    onChange={()=>toggleSessionNpc(n.id)}
                  />
                  {n.name}
                </label>
              ))}
            </div>
          </>
        )}

        <input value={simple.title} onChange={e=>setSimple({...simple,title:e.target.value})} placeholder="Titolo" style={inputStyle}/>
        <input type="date" value={simple.date} onChange={e=>setSimple({...simple,date:e.target.value})} style={inputStyle}/>
        <input type="file" accept="image/*" style={inputStyle} onChange={async e=>setSimple({...simple,image_url:await uploadImage(e.target.files?.[0],modal)})}/>
        {simple.image_url && <img src={simple.image_url} alt="" style={{width:'100%',maxHeight:180,objectFit:'cover',borderRadius:0,marginBottom:14}}/>}

        <textarea value={simple.summary} onChange={e=>setSimple({...simple,summary:e.target.value})} placeholder="Riassunto" rows={5} style={{...inputStyle,resize:'vertical'}}/>
      </>}
    </Modal>}

    {deleteTarget && <ConfirmModal label={deleteTarget.label} onClose={()=>setDeleteTarget(null)} onConfirm={confirmDelete}/>}
  </main>
}
