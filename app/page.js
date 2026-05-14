'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const C={bg:'#0e0b14',bg2:'#13101a',bg3:'#1a1624',border:'#2a2040',border2:'#332848',red:'#c0392b',red2:'#e74c3c',text:'#e8e0f0',textDim:'#8a7fa0',textMuted:'#4a4060'}

const tabs=[
  ['sessions','📜 Sessioni'],
  ['npcs','👤 PNG'],
  ['factions','🏰 Fazioni'],
  ['locations','🗺️ Luoghi'],
  ['oracle','🔮 Oracolo']
]

function Card({children}){return <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:16,padding:18}}>{children}</div>}

const inputStyle={width:'100%',marginBottom:12,background:C.bg,color:C.text,border:`1px solid ${C.border2}`,borderRadius:12,padding:13,outline:'none',fontSize:15}

function OracleBox({data}){
  const [input,setInput]=useState('')
  const [reply,setReply]=useState('')
  const [loading,setLoading]=useState(false)

  async function ask(){
    if(!input.trim()||loading)return
    setLoading(true);setReply('')

    const ctx=`
Sei l'Oracolo della campagna.
Rispondi in italiano, tono oscuro, solenne, fantasy e utile.

SESSIONI:
${data.sessions.map(s=>`- ${s.date||'Data ignota'} | ${s.title}: ${s.summary||''}`).join('\n')||'Nessuna.'}

PNG:
${data.npcs.map(n=>`- ${n.name} (${n.role||'ruolo ignoto'}): ${n.attitude||''}. ${n.description||''}`).join('\n')||'Nessuno.'}

FAZIONI:
${data.factions.map(f=>`- ${f.name}: ${f.description||''}`).join('\n')||'Nessuna.'}

LUOGHI:
${data.locations.map(l=>`- ${l.name}: ${l.description||''}`).join('\n')||'Nessuno.'}
`

    try{
      const res=await fetch('/api/oracolo',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({context:ctx,messages:[{role:'user',content:input}]})})
      const out=await res.json()
      setReply(out.reply||out.error||"L'Oracolo tace.")
    }catch(e){setReply('Le nebbie del destino impediscono la risposta.')}
    setLoading(false)
  }

  return <Card>
    <h2 style={{color:C.red2,marginTop:0}}>🔮 Oracolo</h2>
    <textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="Interroga l'Oracolo..." rows={5} style={{...inputStyle,resize:'vertical'}}/>
    <button onClick={ask} disabled={loading||!input.trim()} style={{width:'100%',padding:13,borderRadius:12,border:'none',background:loading?C.bg3:C.red,color:'#fff',fontWeight:700}}>
      {loading?"L'Oracolo scruta...":"Consulta l'Oracolo"}
    </button>
    {reply&&<div style={{marginTop:18,padding:16,background:C.bg3,border:`1px solid ${C.border}`,borderRadius:14,whiteSpace:'pre-wrap',lineHeight:1.7,fontStyle:'italic'}}>{reply}</div>}
  </Card>
}

export default function HomePage(){
  const [tab,setTab]=useState('sessions')
  const [data,setData]=useState({sessions:[],npcs:[],factions:[],locations:[]})
  const [form,setForm]=useState({title:'',date:'',summary:'',name:'',role:'',attitude:'',description:''})

  useEffect(()=>{loadAll()},[])

  async function loadAll(){
    const [sessions,npcs,factions,locations]=await Promise.all([
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

  async function add(){
    if(tab==='sessions'){
      if(!form.title.trim())return
      await supabase.from('sessions').insert([{title:form.title,date:form.date,summary:form.summary}])
    }
    if(tab==='npcs'){
      if(!form.name.trim())return
      await supabase.from('npcs').insert([{name:form.name,role:form.role,attitude:form.attitude,description:form.description}])
    }
    if(tab==='factions'){
      if(!form.name.trim())return
      await supabase.from('factions').insert([{name:form.name,description:form.description}])
    }
    if(tab==='locations'){
      if(!form.name.trim())return
      await supabase.from('locations').insert([{name:form.name,description:form.description}])
    }
    setForm({title:'',date:'',summary:'',name:'',role:'',attitude:'',description:''})
    loadAll()
  }

  async function del(table,id){
    await supabase.from(table).delete().eq('id',id)
    loadAll()
  }

  const current=data[tab]||[]

  return <main style={{minHeight:'100vh',background:`linear-gradient(180deg,${C.bg},#08060c)`,color:C.text,padding:24}}>
    <div style={{maxWidth:1050,margin:'0 auto'}}>
      <header style={{textAlign:'center',padding:'34px 0 24px'}}>
        <div style={{fontSize:42}}>⚔️</div>
        <h1 style={{fontSize:42,margin:0}}>Campagna</h1>
        <p style={{color:C.textDim}}>Archivio digitale per sessioni, PNG, fazioni, luoghi e Oracolo.</p>
      </header>

      <div style={{display:'flex',gap:8,justifyContent:'center',marginBottom:22,flexWrap:'wrap'}}>
        {tabs.map(([id,label])=><button key={id} onClick={()=>setTab(id)} style={{padding:'10px 18px',borderRadius:999,border:`1px solid ${tab===id?C.red2:C.border2}`,background:tab===id?C.red:C.bg2,color:'#fff',cursor:'pointer',fontWeight:700}}>{label}</button>)}
      </div>

      {tab==='oracle'?<OracleBox data={data}/>:<>
        <Card>
          <h2 style={{marginTop:0,color:C.red2}}>Aggiungi {tabs.find(t=>t[0]===tab)?.[1]}</h2>

          {tab==='sessions'?<>
            <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Titolo sessione" style={inputStyle}/>
            <input value={form.date} onChange={e=>setForm({...form,date:e.target.value})} placeholder="Data o periodo" style={inputStyle}/>
            <textarea value={form.summary} onChange={e=>setForm({...form,summary:e.target.value})} placeholder="Riassunto..." rows={6} style={{...inputStyle,resize:'vertical'}}/>
          </>:<>
            <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Nome" style={inputStyle}/>
            {tab==='npcs'&&<>
              <input value={form.role} onChange={e=>setForm({...form,role:e.target.value})} placeholder="Ruolo" style={inputStyle}/>
              <input value={form.attitude} onChange={e=>setForm({...form,attitude:e.target.value})} placeholder="Atteggiamento: Alleato, Nemico, Neutrale..." style={inputStyle}/>
            </>}
            <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Descrizione..." rows={6} style={{...inputStyle,resize:'vertical'}}/>
          </>}

          <button onClick={add} style={{width:'100%',padding:13,borderRadius:12,border:'none',background:C.red,color:'#fff',fontWeight:700,cursor:'pointer'}}>Salva</button>
        </Card>

        <div style={{height:16}}/>

        <Card>
          <h2 style={{marginTop:0,color:C.red2}}>Archivio</h2>
          {current.length===0&&<p style={{color:C.textDim,fontStyle:'italic'}}>Nessun elemento salvato.</p>}

          <div style={{display:'grid',gap:12}}>
            {current.map(item=><div key={item.id} style={{background:C.bg3,border:`1px solid ${C.border2}`,borderRadius:14,padding:14}}>
              <div style={{display:'flex',justifyContent:'space-between',gap:12}}>
                <div>
                  <h3 style={{margin:'0 0 4px'}}>{item.title||item.name}</h3>
                  {item.date&&<div style={{fontSize:13,color:C.red2}}>{item.date}</div>}
                  {item.role&&<div style={{fontSize:13,color:C.red2}}>{item.role} · {item.attitude}</div>}
                </div>
                <button onClick={()=>del(tab,item.id)} style={{background:'transparent',border:`1px solid ${C.border2}`,color:C.textDim,borderRadius:8,cursor:'pointer',padding:'6px 10px'}}>🗑️</button>
              </div>
              {(item.summary||item.description)&&<p style={{color:C.textDim,lineHeight:1.7,whiteSpace:'pre-wrap',marginBottom:0}}>{item.summary||item.description}</p>}
            </div>)}
          </div>
        </Card>
      </>}

      <footer style={{textAlign:'center',color:C.textMuted,fontSize:12,padding:'32px 0 8px'}}>Creato per non perdere la lore nel Vuoto.</footer>
    </div>
  </main>
}
