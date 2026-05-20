"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCRM, ClientStage, OutreachStatus, TaskStatus, FlagSeverity, FlagStatus, SocialStatus, SocialPlatform, SocialContentType, SocialMediaItem } from "./CRMContext";

/* ─── helpers ─── */
const fmt = (n: number) => n > 0 ? "₹" + n.toLocaleString("en-IN") : "—";
const PROJECT_STAGES: ClientStage[] = ["Requirement","Model","Demo 1","Converted","Dev 1","Demo 2","Dev Final","Final Demo","Delivery","Maintenance"];
const TASK_COLS: { s: TaskStatus; l: string }[] = [{s:"Todo",l:"To Do"},{s:"In Progress",l:"In Progress"},{s:"In Review",l:"Review"},{s:"Resolved",l:"Done"}];
const SOCIAL_COLS: { s: SocialStatus; l: string }[] = [{s:"Idea",l:"Ideas"},{s:"Planned",l:"Planned"},{s:"In Progress",l:"Creating"},{s:"Scheduled",l:"Scheduled"},{s:"Posted",l:"Done"}];
const LEAD_STATUSES: OutreachStatus[] = ["Lead","Contacted","Responded","Requirements","Demo","Quoted","Converted","Lost"];
type Section = "dashboard"|"projects"|"tasks"|"social"|"leads"|"support"|"products"|"access";
const pc: Record<string,string> = {a1:"#FF5A1F",a2:"#0D9488",a3:"#65A30D",a4:"#9333EA"};

/* ─── tiny shared components ─── */
const Dot = ({c}:{c:string}) => <span className={`w-[5px] h-[5px] rounded-full inline-block ${c}`}/>;
const Lbl = ({children}:{children:React.ReactNode}) => <span className="text-[8px] font-mono uppercase tracking-[.14em] text-[var(--color-text-faint)]">{children}</span>;
const Av = ({id,name,sz=18}:{id:string;name:string;sz?:number}) => <span title={name} className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{backgroundColor:pc[id]||"#78716C",width:sz,height:sz,fontSize:sz*0.42}}>{name.charAt(0)}</span>;
const X = ({onClick}:{onClick:()=>void}) => <button onClick={e=>{e.stopPropagation();onClick();}} className="w-4 h-4 rounded flex items-center justify-center text-[10px] text-[var(--color-text-faint)] hover:text-[var(--color-bad)] hover:bg-[var(--color-bad-soft)] transition-colors">×</button>;

/* ═══════════════════════════════════════════ ROOT ═══════════════════════════════════════════ */
export default function AdminDashboard() {
  const crm=useCRM();
  const {team,products,comments,activities,leads,flags,internalTasks}=crm;
  const clients = crm.userProfile?.category === "intern" ? crm.clients.filter(c => c.assignedAdminId === crm.userProfile?.id || (crm.userProfile?.assignedProjects || []).includes(c.id)) : crm.clients;
  const [sec,setSec]=useState<Section>("dashboard");
  const [sel,setSel]=useState<number|string|null>(null);
  const [showAdd,setShowAdd] = useState(false);
  const go = (s:Section)=>{setSec(s);setSel(null);setShowAdd(false);};
  const navItems:{id:Section;l:string;i:string;c?:number}[] = [
    {id:"dashboard",l:"Dashboard",i:"◉"},
    {id:"projects",l:"Projects",i:"◫",c:clients.length},
    {id:"tasks",l:"Tasks",i:"☰",c:internalTasks.filter(t=>t.status!=="Resolved").length},
    {id:"social",l:"Social",i:"◎",c:(crm as any).socialMedia?.length||0},
    {id:"leads",l:"Leads",i:"◈",c:leads.length},
    {id:"support",l:"Support",i:"⚑",c:flags.filter(f=>f.status!=="Resolved").length},
    {id:"products",l:"Products",i:"△",c:products.length},
  ];
  if (crm.userProfile?.category === "admin") navItems.push({id:"access",l:"Access Management",i:"⚿",c:crm.crmUsers?.length||0});
  return (
    <div className="flex h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] font-sans overflow-hidden">
      {/* ── sidebar ── */}
      <aside className="w-[188px] flex-shrink-0 bg-[var(--color-bg-raised)] border-r border-[var(--color-border-subtle)] flex flex-col select-none">
        <div className="px-4 pt-4 pb-2"><h1 className="text-[13px] font-bold tracking-tight">almmatix</h1><p className="text-[8px] text-[var(--color-text-faint)] font-mono uppercase tracking-[.15em] mt-px">CRM</p></div>
        <nav className="flex-1 px-1.5 mt-1 space-y-px">
          {navItems.map(n=>(
            <button key={n.id} onClick={()=>go(n.id)} className={`w-full flex items-center gap-2 px-2.5 py-[6px] rounded-md text-[11.5px] transition-all ${sec===n.id?"bg-[var(--color-ember)] text-white font-semibold":"text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-soft)]"}`}>
              <span className="text-[10px] w-4 text-center opacity-60">{n.i}</span><span className="flex-1 text-left">{n.l}</span>
              {n.c!==undefined&&<span className={`text-[8px] min-w-[16px] text-center px-1 rounded-full ${sec===n.id?"bg-white/20":"bg-[var(--color-border)] text-[var(--color-text-muted)]"}`}>{n.c}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-[var(--color-border-subtle)] text-[9px]">
          <div className="flex items-center gap-1.5 mb-1"><Dot c={crm.isSupabaseOnline?"bg-[var(--color-ok)]":"bg-[var(--color-warn)] animate-pulse"}/><span className="text-[var(--color-text-faint)]">{crm.isSupabaseOnline?"Connected":"Offline"}</span></div>
          <div className="flex items-center justify-between"><span className="text-[var(--color-text-secondary)] font-medium">{crm.userProfile?.name||"Admin"}</span><button onClick={crm.signOut} className="text-[var(--color-text-faint)] hover:text-[var(--color-bad)]">Out</button></div>
        </div>
      </aside>
      {/* ── main ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-10 flex-shrink-0 border-b border-[var(--color-border-subtle)] flex items-center justify-between px-5 bg-[var(--color-bg-raised)]">
          <h2 className="text-[12.5px] font-semibold">{navItems.find(n=>n.id===sec)?.l}</h2>
          {!["dashboard","products","access"].includes(sec)&&<button onClick={()=>setShowAdd(!showAdd)} className="px-2 py-[3px] bg-[var(--color-ember)] text-white text-[9px] font-semibold rounded hover:bg-[var(--color-ember-hover)] transition-colors">+ New</button>}
        </header>
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto crm-scroll p-4">
            <AnimatePresence mode="wait"><motion.div key={sec} initial={{opacity:0,y:3}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:.1}}>
              {sec==="dashboard"&&<Dashboard crm={crm}/>}
              {sec==="projects"&&<Projects crm={crm} clients={clients} sel={sel} setSel={setSel} showAdd={showAdd} close={()=>setShowAdd(false)}/>}
              {sec==="tasks"&&<Tasks crm={crm} showAdd={showAdd} close={()=>setShowAdd(false)}/>}
              {sec==="social"&&<Social crm={crm} showAdd={showAdd} close={()=>setShowAdd(false)}/>}
              {sec==="leads"&&<Leads crm={crm} sel={sel} setSel={setSel} showAdd={showAdd} close={()=>setShowAdd(false)}/>}
              {sec==="support"&&<Support crm={crm} sel={sel} setSel={setSel} showAdd={showAdd} close={()=>setShowAdd(false)}/>}
              {sec==="products"&&<Products crm={crm} clients={clients}/>}
              {sec==="access"&&<AccessManagement crm={crm} clients={clients}/>}
            </motion.div></AnimatePresence>
          </div>
          <AnimatePresence>
            {sel!==null&&["projects","leads","support"].includes(sec)&&(
              <motion.div initial={{width:0,opacity:0}} animate={{width:360,opacity:1}} exit={{width:0,opacity:0}} transition={{duration:.18,ease:[.16,1,.3,1]}} className="flex-shrink-0 border-l border-[var(--color-border-subtle)] bg-[var(--color-bg-raised)] overflow-hidden">
                <div className="w-[360px] h-full overflow-y-auto crm-scroll">
                  {sec==="projects"&&<ProjDrawer crm={crm} id={sel as number} onClose={()=>setSel(null)}/>}
                  {sec==="leads"&&<LeadDrawer crm={crm} id={sel as string} onClose={()=>setSel(null)}/>}
                  {sec==="support"&&<FlagDrawer crm={crm} id={sel as string} onClose={()=>setSel(null)}/>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

/* ═══════════════════════ 1. DASHBOARD (read-only overview) ═══════════════════════ */
function Dashboard({crm}:any) {
  const {clients,team,leads,internalTasks,flags,comments,activities}=crm;
  const active=clients.filter((c:any)=>!["Requirement","Model"].includes(c.stage)).length;
  const pipe=clients.reduce((s:number,c:any)=>s+c.revenue,0)+leads.reduce((s:number,l:any)=>s+l.estimatedValue,0);
  const openF=flags.filter((f:any)=>f.status!=="Resolved").length;
  const openT=internalTasks.filter((t:any)=>t.status!=="Resolved").length;
  return (
    <div className="space-y-4 max-w-[1100px]">
      {/* stats */}
      <div className="grid grid-cols-5 gap-2">
        {[{l:"Active",v:active,a:"text-[var(--color-ok)]"},{l:"Pipeline",v:fmt(pipe),a:""},{l:"Tasks",v:openT,a:""},{l:"Issues",v:openF,a:openF?"text-[var(--color-warn)]":""},{l:"Leads",v:leads.length,a:""}].map(s=>(
          <div key={s.l} className="bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-lg px-3 py-2"><Lbl>{s.l}</Lbl><p className={`text-lg font-bold mt-px ${s.a}`}>{s.v}</p></div>
        ))}
      </div>
      {/* grid: team + right */}
      <div className="grid grid-cols-[1fr_320px] gap-4">
        {/* team cards */}
        <div className="space-y-2">
          <Lbl>Team</Lbl>
          {team.map((m:any)=>{const ts=internalTasks.filter((t:any)=>t.assignedAdminId===m.id&&t.status!=="Resolved");const now=ts.find((t:any)=>t.status==="In Progress");const nx=ts.find((t:any)=>t.status==="Todo");const pj=clients.filter((c:any)=>c.assignedAdminId===m.id);const cap=ts.length<=2?"bg-[var(--color-ok)]":ts.length<=4?"bg-[var(--color-warn)]":"bg-[var(--color-bad)]";return(
            <div key={m.id} className="bg-[var(--color-surface)] rounded-xl p-3 border border-[var(--color-border-card)]">
              <div className="flex items-center gap-2 mb-2"><Av id={m.id} name={m.name} sz={24}/><div className="flex-1 min-w-0"><p className="text-[11.5px] font-semibold text-[var(--color-card-text)] leading-none">{m.name}</p><div className="flex items-center gap-1 mt-px"><span className={`w-1.5 h-1.5 rounded-full ${cap}`}/><p className="text-[8.5px] text-[var(--color-card-text-muted)]">{m.role} · {pj.length} proj · {ts.length} tasks</p></div></div></div>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="bg-white/50 rounded-md p-2 border border-[var(--color-border-card)]/30"><p className="text-[7.5px] font-mono uppercase tracking-wider text-[var(--color-ok)]">NOW</p><p className="text-[10px] text-[var(--color-card-text)] font-medium truncate mt-px">{now?.title||"—"}</p></div>
                <div className="bg-white/50 rounded-md p-2 border border-[var(--color-border-card)]/30"><p className="text-[7.5px] font-mono uppercase tracking-wider text-[var(--color-info)]">NEXT</p><p className="text-[10px] text-[var(--color-card-text)] font-medium truncate mt-px">{nx?.title||"—"}</p></div>
              </div>
            </div>
          );})}
        </div>
        {/* right col */}
        <div className="space-y-4">
          <div><Lbl>Attention</Lbl>
            <div className="space-y-1 mt-1">
              {comments.filter((c:any)=>c.role==="client"&&c.isUnreadAdmin).slice(0,3).map((c:any)=>{const cl=clients.find((x:any)=>x.id===c.clientId);return <div key={c.id} onClick={()=>crm.markCommentAsRead(c.id)} className="flex items-start gap-1.5 bg-[var(--color-ember-soft)] border border-[var(--color-ember)]/30 rounded-md px-2.5 py-1.5 cursor-pointer hover:bg-[var(--color-ember)]/10"><Dot c="bg-[var(--color-ember)] mt-1.5 animate-pulse"/><div className="min-w-0 flex-1"><p className="text-[9.5px] font-bold text-[var(--color-ember)]">Needs Reply: {cl?.name}</p><p className="text-[9px] text-[var(--color-text-secondary)] truncate">{c.text}</p></div></div>;})}
              {flags.filter((f:any)=>f.status==="Open").slice(0,2).map((f:any)=><div key={f.id} className="flex items-center gap-1.5 bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-md px-2.5 py-1.5"><Dot c="bg-[var(--color-bad)]"/><p className="text-[9px] text-[var(--color-text-muted)] truncate flex-1">{f.title}</p></div>)}
              {comments.filter((c:any)=>c.role==="client"&&c.isUnreadAdmin).length===0&&flags.filter((f:any)=>f.status==="Open").length===0&&<p className="text-[9px] text-[var(--color-text-faint)] py-1">All clear ✓</p>}
            </div>
          </div>
          <div><Lbl>Projects</Lbl>
            <div className="space-y-px mt-1">{clients.map((c:any)=>{const si=PROJECT_STAGES.indexOf(c.stage);return <div key={c.id} className="flex items-center gap-1.5 py-1 px-1 rounded hover:bg-[var(--color-bg-soft)]"><span className="w-4 h-4 rounded bg-[var(--color-surface)] flex items-center justify-center text-[6.5px] font-bold text-[var(--color-card-text)]">{c.avatar}</span><span className="text-[9.5px] font-medium flex-1 truncate">{c.name}</span><div className="flex gap-px w-14">{PROJECT_STAGES.map((_:any,i:number)=><div key={i} className={`h-[2.5px] flex-1 rounded-full ${i<=si?"bg-[var(--color-ember)]":"bg-[var(--color-border)]"}`}/>)}</div></div>;})}</div>
          </div>
          <div><Lbl>Activity</Lbl>
            <div className="mt-1">{activities.slice(0,4).map((a:any)=><div key={a.id} className="flex items-center gap-1.5 py-0.5"><Dot c={a.type==="milestone"?"bg-[var(--color-ok)]":a.type==="alert"?"bg-[var(--color-warn)]":"bg-[var(--color-text-faint)]"}/><span className="text-[9px] text-[var(--color-text-muted)] flex-1 truncate">{a.action}</span><span className="text-[7.5px] text-[var(--color-text-faint)]">{a.time}</span></div>)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ 2. PROJECTS — MS Planner board ═══════════════════════ */
function Projects({crm,sel,setSel,showAdd,close}:any) {
  const [drag,setDrag]=useState<number|null>(null);
  const drop=(stage:ClientStage)=>{if(drag!==null){crm.updateClientStage(drag,stage);setDrag(null);}};
  // Group by stage
  const grouped:Record<string,any[]>={};
  PROJECT_STAGES.forEach(s=>grouped[s]=[]);
  crm.clients.forEach((c:any)=>{if(grouped[c.stage])grouped[c.stage].push(c);else grouped["Requirement"].push(c);});

  return (
    <div className="space-y-3">
      {showAdd&&<QuickAdd title="New Project" fields={[{k:"name",l:"Client",p:"Client name"},{k:"project",l:"Project",p:"Project name"},{k:"revenue",l:"Revenue (₹)",p:"0",t:"number"},{k:"stage",l:"Stage",t:"select",o:PROJECT_STAGES},{k:"assignedAdminId",l:"Owner",t:"select",o:crm.team.map((t:any)=>({v:t.id,l:t.name}))}]} onSubmit={(d:any)=>{crm.addNewClient({name:d.name,project:d.project,location:"India",category:["Requirement","Model","Demo 1"].includes(d.stage)?"Potential":"Ongoing",stage:d.stage,revenue:Number(d.revenue)||0,assignedAdminId:d.assignedAdminId||"a1"});close();}} onClose={close}/>}
      {/* Board */}
      <div className="flex gap-2 overflow-x-auto pb-2" style={{minHeight:"calc(100vh - 140px)"}}>
        {PROJECT_STAGES.map(stage=>{
          const cards=grouped[stage]||[];
          return(
            <div key={stage} onDrop={e=>{e.preventDefault();drop(stage);}} onDragOver={e=>{e.preventDefault();e.dataTransfer.dropEffect="move";}}
              className={`flex-shrink-0 w-[170px] rounded-xl p-2 border transition-colors ${drag!==null?"border-[var(--color-ember)]/20 bg-[var(--color-ember-soft)]/20":"border-[var(--color-border)]/40 bg-[var(--color-bg-soft)]/30"}`}>
              <div className="flex items-center justify-between mb-1.5 px-0.5">
                <h4 className="text-[9.5px] font-semibold text-[var(--color-text-secondary)]">{stage}</h4>
                <span className="text-[8px] text-[var(--color-text-faint)] bg-[var(--color-border)] px-1 rounded-full">{cards.length}</span>
              </div>
              <div className="space-y-1.5">
                {cards.map((c:any)=>{const ow=crm.team.find((t:any)=>t.id===c.assignedAdminId);return(
                  <div key={c.id} draggable onDragStart={e=>{setDrag(c.id);e.dataTransfer.effectAllowed="move";}} onClick={()=>setSel(c.id)}
                    className={`bg-[var(--color-surface)] border rounded-lg p-2 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow ${sel===c.id?"border-[var(--color-ember)]/50":"border-[var(--color-border-card)]"} ${drag===c.id?"opacity-30":""}`}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] font-semibold text-[var(--color-card-text)] truncate">{c.name}</span>
                      <X onClick={()=>crm.deleteClient(c.id)}/>
                    </div>
                    <p className="text-[8.5px] text-[var(--color-card-text-muted)] truncate">{c.project}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      {c.revenue>0?<span className="text-[8px] font-bold text-[var(--color-card-text)]">{fmt(c.revenue)}</span>:<span/>}
                      <Av id={c.assignedAdminId} name={ow?.name||"?"} sz={16}/>
                    </div>
                  </div>
                );})}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Project Drawer ── */
function ProjDrawer({crm,id,onClose}:any){
  const c=crm.clients.find((x:any)=>x.id===id);if(!c)return null;
  const si=PROJECT_STAGES.indexOf(c.stage);
  const [ed,setEd]=useState<string|null>(null);const [ev,setEv]=useState("");
  const save=(f:string)=>{crm.updateClient(id,{[f]:ev});setEd(null);};
  const EF=({l,v,f}:{l:string;v:string;f:string})=>(
    <div className="flex items-center justify-between py-px"><Lbl>{l}</Lbl>{ed===f?<input autoFocus value={ev} onChange={e=>setEv(e.target.value)} onBlur={()=>save(f)} onKeyDown={e=>e.key==="Enter"&&save(f)} className="text-[10px] bg-[var(--color-bg)] border border-[var(--color-ember)] rounded px-1.5 py-px w-32 text-right outline-none"/>:<span onClick={()=>{setEd(f);setEv(v);}} className="text-[10px] text-[var(--color-text-secondary)] cursor-pointer hover:text-[var(--color-text-primary)] border-b border-dashed border-transparent hover:border-[var(--color-text-muted)]">{v}</span>}</div>
  );
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between"><h3 className="text-[12px] font-bold">{c.name}</h3><X onClick={onClose}/></div>
      <div><div className="flex gap-px mb-1">{PROJECT_STAGES.map((_:any,i:number)=><div key={i} className={`h-1 flex-1 rounded-full ${i<=si?"bg-[var(--color-ember)]":"bg-[var(--color-border)]"}`}/>)}</div>
        <div className="flex justify-between"><span className="text-[8px] text-[var(--color-text-faint)]">{si+1}/{PROJECT_STAGES.length}</span><select value={c.stage} onChange={e=>crm.updateClientStage(id,e.target.value)} className="text-[9px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded px-1 py-px outline-none cursor-pointer">{PROJECT_STAGES.map(s=><option key={s}>{s}</option>)}</select></div></div>
      <div className="space-y-px"><EF l="Project" v={c.project} f="project"/><EF l="Location" v={c.location} f="location"/>
        <div className="flex items-center justify-between py-px"><Lbl>Owner</Lbl><select value={c.assignedAdminId||""} onChange={e=>crm.updateClientAdmin(id,e.target.value)} className="text-[9px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded px-1 py-px outline-none cursor-pointer">{crm.team.map((t:any)=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
        <div className="flex items-center justify-between py-px"><Lbl>Health</Lbl><span className="text-[10px] font-medium">{c.health}%</span></div></div>
      {crm.userProfile?.category === "admin" && (
        <div className="border-t border-[var(--color-border)] pt-2"><Lbl>Financials</Lbl><div className="grid grid-cols-2 gap-1.5 mt-1"><div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md p-2"><p className="text-[7.5px] text-[var(--color-text-faint)]">Revenue</p><p className="text-[12px] font-bold">{fmt(c.revenue)}</p></div><div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md p-2"><p className="text-[7.5px] text-[var(--color-text-faint)]">Cost</p><p className="text-[12px] font-bold">{fmt(c.cost||0)}</p></div><div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md p-2"><p className="text-[7.5px] text-[var(--color-text-faint)]">Margin</p><p className="text-[12px] font-bold text-[var(--color-ok)]">{fmt(c.revenue-(c.cost||0))}</p></div><div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md p-2"><p className="text-[7.5px] text-[var(--color-text-faint)]">Pending Balance</p><p className="text-[12px] font-bold text-[var(--color-warn)]">{fmt(c.revenue-(c.amountPaid||0))}</p></div></div></div>
      )}
      {crm.comments.filter((m:any)=>m.clientId===id).length>0&&<div className="border-t border-[var(--color-border)] pt-2"><Lbl>Feedback</Lbl>{crm.comments.filter((m:any)=>m.clientId===id).slice(-2).map((m:any)=><div key={m.id} className="p-1.5 rounded bg-[var(--color-bg)] mt-1 text-[9px]"><span className="font-semibold">{m.author}</span> <span className="text-[var(--color-text-faint)]">{m.timeElapsed}</span><p className="text-[var(--color-text-muted)] mt-px">{m.text}</p></div>)}</div>}
      <div className="border-t border-[var(--color-border)] pt-2"><button onClick={()=>{crm.deleteClient(id);onClose();}} className="text-[8px] text-[var(--color-bad)] hover:underline">Delete project</button></div>
    </div>
  );
}

/* ═══════════════════════ 3. TASKS — Drag & Drop Kanban with edit/delete ═══════════════════════ */
function Tasks({crm,showAdd,close}:any){
  const [drag,setDrag]=useState<string|null>(null);
  const [editId,setEditId]=useState<string|null>(null);
  const [editTitle,setEditTitle]=useState("");
  const drop=(s:TaskStatus)=>{if(drag){crm.updateInternalTask(drag,{status:s});setDrag(null);}};
  return(
    <div className="space-y-3">
      {showAdd&&<QuickAdd title="New Task" fields={[{k:"title",l:"Task",p:"What needs to be done?"},{k:"assignedAdminId",l:"Assign to",t:"select",o:crm.team.map((t:any)=>({v:t.id,l:t.name}))},{k:"clientId",l:"Project (optional)",t:"select",o:[{v:"",l:"— None —"},...crm.clients.map((c:any)=>({v:String(c.id),l:c.name}))]}]} onSubmit={(d:any)=>{crm.addInternalTask({title:d.title,assignedAdminId:d.assignedAdminId||"a1",clientId:d.clientId?Number(d.clientId):undefined,status:"Todo" as const});close();}} onClose={close}/>}
      <div className="grid grid-cols-4 gap-2.5" style={{minHeight:"calc(100vh - 140px)"}}>
        {TASK_COLS.map(col=>{const items=crm.internalTasks.filter((t:any)=>t.status===col.s);return(
          <div key={col.s} onDrop={e=>{e.preventDefault();drop(col.s);}} onDragOver={e=>{e.preventDefault();e.dataTransfer.dropEffect="move";}}
            className={`rounded-xl p-2 border transition-colors ${drag?"border-[var(--color-ember)]/15 bg-[var(--color-ember-soft)]/20":"border-[var(--color-border)]/30 bg-[var(--color-bg-soft)]/30"}`}>
            <div className="flex items-center justify-between mb-2 px-0.5"><h4 className="text-[10px] font-semibold text-[var(--color-text-secondary)]">{col.l}</h4><span className="text-[8px] text-[var(--color-text-faint)] bg-[var(--color-border)] px-1.5 py-px rounded-full">{items.length}</span></div>
            <div className="space-y-1.5">{items.map((t:any)=>{const ow=crm.team.find((m:any)=>m.id===t.assignedAdminId);const pj=crm.clients.find((c:any)=>c.id===t.clientId);return(
              <div key={t.id} draggable onDragStart={e=>{setDrag(t.id);e.dataTransfer.effectAllowed="move";}}
                className={`bg-[var(--color-surface)] border border-[var(--color-border-card)] rounded-lg p-2 cursor-grab active:cursor-grabbing hover:shadow-sm transition-all group ${drag===t.id?"opacity-30":""}`}>
                {editId===t.id?(
                  <input autoFocus value={editTitle} onChange={e=>setEditTitle(e.target.value)} onBlur={()=>{crm.updateInternalTask(t.id,{title:editTitle});setEditId(null);}} onKeyDown={e=>{if(e.key==="Enter"){crm.updateInternalTask(t.id,{title:editTitle});setEditId(null);}}} className="w-full text-[10px] bg-transparent border-b border-[var(--color-ember)] outline-none text-[var(--color-card-text)] pb-px"/>
                ):(
                  <p onDoubleClick={()=>{setEditId(t.id);setEditTitle(t.title);}} className="text-[10px] font-medium text-[var(--color-card-text)] leading-snug cursor-text">{t.title}</p>
                )}
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[7.5px] text-[var(--color-card-text-muted)]">{pj?.name||""}</span>
                  <div className="flex items-center gap-1">
                    {/* Reassign dropdown */}
                    <select value={t.assignedAdminId} onChange={e=>{e.stopPropagation();crm.updateInternalTask(t.id,{assignedAdminId:e.target.value});}} className="w-4 h-4 opacity-0 absolute cursor-pointer" title="Reassign" style={{zIndex:2}}/>
                    <Av id={t.assignedAdminId} name={ow?.name||"?"} sz={16}/>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity"><X onClick={()=>crm.deleteInternalTask(t.id)}/></span>
                  </div>
                </div>
              </div>
            );})}</div>
          </div>
        );})}
      </div>
    </div>
  );
}

/* ═══════════════════════ 4. SOCIAL — Kanban with edit/delete/drag ═══════════════════════ */
function Social({crm,showAdd,close}:any){
  const sm:SocialMediaItem[]=(crm as any).socialMedia||[];
  const setSM=(crm as any).setSocialMedia;
  const [drag,setDrag]=useState<string|null>(null);
  const [editId,setEditId]=useState<string|null>(null);
  const [editDesc,setEditDesc]=useState("");
  const icon:Record<string,string>={Instagram:"📸",Twitter:"𝕏",LinkedIn:"in",Reddit:"🔴",YouTube:"▶"};

  const moveTo=(status:SocialStatus)=>{if(drag&&setSM){setSM((prev:SocialMediaItem[])=>prev.map(i=>i.id===drag?{...i,status}:i));setDrag(null);}};
  const del=(id:string)=>{if(setSM)setSM((prev:SocialMediaItem[])=>prev.filter(i=>i.id!==id));};
  const saveEdit=(id:string)=>{if(setSM)setSM((prev:SocialMediaItem[])=>prev.map(i=>i.id===id?{...i,description:editDesc}:i));setEditId(null);};

  return(
    <div className="space-y-3">
      {showAdd&&<QuickAdd title="New Content" fields={[{k:"platform",l:"Platform",t:"select",o:["Instagram","Twitter","LinkedIn","Reddit","YouTube"]},{k:"contentType",l:"Type",t:"select",o:["Reel","Post","Story","Tweet","Blog","Thread"]},{k:"description",l:"About",p:"What is this content about?"},{k:"scheduledDate",l:"Date",t:"date"}]} onSubmit={(d:any)=>{if(setSM){const id="sm"+Date.now();setSM((prev:SocialMediaItem[])=>[...prev,{id,platform:d.platform||"Instagram",contentType:d.contentType||"Post",description:d.description||"New content",status:"Idea" as SocialStatus,assignedAdminId:"a4",scheduledDate:d.scheduledDate||"",createdAt:new Date().toISOString().split("T")[0]} as SocialMediaItem]);}close();}} onClose={close}/>}
      <div className="grid grid-cols-5 gap-2" style={{minHeight:"calc(100vh - 140px)"}}>
        {SOCIAL_COLS.map(col=>{const items=sm.filter(i=>i.status===col.s);return(
          <div key={col.s} onDrop={e=>{e.preventDefault();moveTo(col.s);}} onDragOver={e=>{e.preventDefault();e.dataTransfer.dropEffect="move";}}
            className={`rounded-xl p-2 border transition-colors ${drag?"border-[var(--color-ember)]/15 bg-[var(--color-ember-soft)]/20":"border-[var(--color-border)]/30 bg-[var(--color-bg-soft)]/30"}`}>
            <div className="flex items-center justify-between mb-2 px-0.5"><h4 className="text-[10px] font-semibold text-[var(--color-text-secondary)]">{col.l}</h4><span className="text-[8px] text-[var(--color-text-faint)] bg-[var(--color-border)] px-1.5 py-px rounded-full">{items.length}</span></div>
            <div className="space-y-1.5">{items.map(item=>(
              <div key={item.id} draggable onDragStart={e=>{setDrag(item.id);e.dataTransfer.effectAllowed="move";}}
                className={`bg-[var(--color-surface)] border border-[var(--color-border-card)] rounded-lg p-2 cursor-grab active:cursor-grabbing hover:shadow-sm transition-all group ${drag===item.id?"opacity-30":""}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1"><span className="text-[8px]">{icon[item.platform]||"•"}</span><span className="text-[7.5px] font-medium text-[var(--color-card-text-muted)]">{item.platform} · {item.contentType}</span></div>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity"><X onClick={()=>del(item.id)}/></span>
                </div>
                {editId===item.id?(
                  <input autoFocus value={editDesc} onChange={e=>setEditDesc(e.target.value)} onBlur={()=>saveEdit(item.id)} onKeyDown={e=>e.key==="Enter"&&saveEdit(item.id)} className="w-full text-[9.5px] bg-transparent border-b border-[var(--color-ember)] outline-none text-[var(--color-card-text)] pb-px"/>
                ):(
                  <p onDoubleClick={()=>{setEditId(item.id);setEditDesc(item.description);}} className="text-[9.5px] text-[var(--color-card-text)] leading-snug font-medium cursor-text">{item.description}</p>
                )}
                {item.clientTag&&<span className="inline-block mt-1 text-[7.5px] px-1 py-px bg-[var(--color-surface-muted)] rounded text-[var(--color-card-text-secondary)]">{item.clientTag}</span>}
              </div>
            ))}</div>
          </div>
        );})}
      </div>
    </div>
  );
}

/* ═══════════════════════ 5. LEADS — table with inline edit ═══════════════════════ */
function Leads({crm,sel,setSel,showAdd,close}:any){
  const [editId,setEditId]=useState<string|null>(null);
  const [editField,setEditField]=useState<string|null>(null);
  const [editVal,setEditVal]=useState("");
  const saveLead=(id:string,field:string)=>{crm.updateLead(id,{[field]:field==="estimatedValue"?Number(editVal):editVal});setEditId(null);setEditField(null);};
  const funnel=[{m:["Lead"],l:"Pipeline"},{m:["Contacted"],l:"Contacted"},{m:["Responded","Requirements"],l:"In Talk"},{m:["Demo","Quoted"],l:"Quoted"}];

  const EditCell=({lid,field,value,w}:{lid:string;field:string;value:string;w?:string})=>(
    editId===lid&&editField===field?(
      <input autoFocus value={editVal} onChange={e=>setEditVal(e.target.value)} onBlur={()=>saveLead(lid,field)} onKeyDown={e=>e.key==="Enter"&&saveLead(lid,field)} className={`bg-[var(--color-bg)] border border-[var(--color-ember)] rounded px-1.5 py-px text-[10px] outline-none ${w||"w-full"}`}/>
    ):(
      <span onDoubleClick={()=>{setEditId(lid);setEditField(field);setEditVal(value);}} className="cursor-text hover:text-[var(--color-text-primary)]">{value}</span>
    )
  );

  return(
    <div className="space-y-3">
      <div className="flex gap-2">{funnel.map(f=>{const c=crm.leads.filter((l:any)=>f.m.includes(l.status)).length;return <div key={f.l} className="flex-1 bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-lg p-2 text-center"><p className="text-lg font-bold">{c}</p><Lbl>{f.l}</Lbl></div>;})}</div>
      {showAdd&&<QuickAdd title="New Lead" fields={[{k:"companyName",l:"Company",p:"Company name"},{k:"projectDescription",l:"Need",p:"What do they need?"},{k:"estimatedValue",l:"Value (₹)",p:"0",t:"number"},{k:"assignedAdminId",l:"Owner",t:"select",o:crm.team.map((t:any)=>({v:t.id,l:t.name}))}]} onSubmit={(d:any)=>{crm.addNewLead({companyName:d.companyName,projectDescription:d.projectDescription,source:"LinkedIn" as const,status:"Lead" as const,estimatedValue:Number(d.estimatedValue)||0,assignedAdminId:d.assignedAdminId||"a3",sourcedById:d.assignedAdminId||"a3",engagementScore:10});close();}} onClose={close}/>}
      <div className="bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        <table className="w-full text-[10.5px]">
          <thead><tr className="border-b border-[var(--color-border)]"><th className="text-left p-2"><Lbl>Company</Lbl></th><th className="text-left p-2"><Lbl>Project</Lbl></th><th className="text-left p-2"><Lbl>Value</Lbl></th><th className="text-left p-2"><Lbl>Status</Lbl></th><th className="text-left p-2"><Lbl>Owner</Lbl></th><th className="p-2 w-6"></th></tr></thead>
          <tbody>{crm.leads.map((l:any)=>{const ow=crm.team.find((t:any)=>t.id===l.assignedAdminId);return(
            <tr key={l.id} onClick={()=>setSel(l.id)} className={`border-b border-[var(--color-border-subtle)] cursor-pointer transition-colors ${sel===l.id?"bg-[var(--color-ember-soft)]":"hover:bg-[var(--color-bg)]"}`}>
              <td className="p-2 font-medium"><EditCell lid={l.id} field="companyName" value={l.companyName}/></td>
              <td className="p-2 text-[var(--color-text-muted)] max-w-[160px] truncate"><EditCell lid={l.id} field="projectDescription" value={l.projectDescription}/></td>
              <td className="p-2 font-medium">{fmt(l.estimatedValue)}</td>
              <td className="p-2"><select value={l.status} onClick={e=>e.stopPropagation()} onChange={e=>{e.stopPropagation();crm.updateLeadStatus(l.id,e.target.value);}} className="text-[9px] bg-transparent border border-[var(--color-border)] rounded px-1 py-px outline-none cursor-pointer">{LEAD_STATUSES.map(s=><option key={s}>{s}</option>)}</select></td>
              <td className="p-2 text-[var(--color-text-muted)]">{ow?.name||"—"}</td>
              <td className="p-2"><X onClick={()=>crm.deleteLead(l.id)}/></td>
            </tr>
          );})}{crm.leads.length===0&&<tr><td colSpan={6} className="p-4 text-center text-[var(--color-text-faint)]">No leads</td></tr>}</tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Lead Drawer ── */
function LeadDrawer({crm,id,onClose}:any){
  const l=crm.leads.find((x:any)=>x.id===id);if(!l)return null;const [note,setNote]=useState("");
  return(
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between"><h3 className="text-[12px] font-bold">{l.companyName}</h3><X onClick={onClose}/></div>
      <p className="text-[10px] text-[var(--color-text-muted)]">{l.projectDescription}</p>
      <div className="space-y-px">
        <div className="flex items-center justify-between py-px"><Lbl>Status</Lbl><select value={l.status} onChange={e=>crm.updateLeadStatus(id,e.target.value)} className="text-[9px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded px-1 py-px outline-none">{LEAD_STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
        <div className="flex items-center justify-between py-px"><Lbl>Value</Lbl><span className="text-[10px] font-semibold">{fmt(l.estimatedValue)}</span></div>
        <div className="flex items-center justify-between py-px"><Lbl>Calls</Lbl><div className="flex items-center gap-1.5"><span className="text-[10px]">{l.callsMade}</span><button onClick={()=>crm.incrementLeadCalls(id)} className="text-[8px] px-1.5 py-px bg-[var(--color-border)] rounded hover:bg-[var(--color-text-faint)]/20">+1</button></div></div>
        <div className="flex items-center justify-between py-px"><Lbl>Owner</Lbl><select value={l.assignedAdminId} onChange={e=>crm.updateLead(id,{assignedAdminId:e.target.value})} className="text-[9px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded px-1 py-px outline-none">{crm.team.map((t:any)=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
      </div>
      <div className="border-t border-[var(--color-border)] pt-2"><Lbl>Notes</Lbl>
        {l.notes.map((n:string,i:number)=><p key={i} className="text-[9px] text-[var(--color-text-muted)] p-1.5 bg-[var(--color-bg)] rounded mt-1">{n}</p>)}
        <div className="flex gap-1.5 mt-1.5"><input value={note} onChange={e=>setNote(e.target.value)} placeholder="Add note..." className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded px-2 py-1 text-[9px] outline-none focus:border-[var(--color-ember)]" onKeyDown={e=>{if(e.key==="Enter"&&note.trim()){crm.addLeadNote(id,note.trim());setNote("");}}}/><button onClick={()=>{if(note.trim()){crm.addLeadNote(id,note.trim());setNote("");}}} className="px-2 py-1 bg-[var(--color-ember)] text-white text-[8px] rounded">Add</button></div>
      </div>
      {!["Converted","Lost"].includes(l.status)&&<div className="border-t border-[var(--color-border)] pt-2 space-y-1.5">
        <button onClick={()=>{crm.convertLeadToClient(id);onClose();}} className="w-full bg-[var(--color-ok)] text-white text-[9px] font-semibold py-1.5 rounded-md">Convert to Project</button>
        <button onClick={()=>{crm.deleteLead(id);onClose();}} className="text-[8px] text-[var(--color-bad)] hover:underline">Delete</button>
      </div>}
    </div>
  );
}

/* ═══════════════════════ 6. SUPPORT ═══════════════════════ */
function Support({crm,sel,setSel,showAdd,close}:any){
  const open=crm.flags.filter((f:any)=>f.status!=="Resolved");const done=crm.flags.filter((f:any)=>f.status==="Resolved");
  const maint=crm.clients.filter((c:any)=>["Maintenance","Delivery"].includes(c.stage));
  const dot=(s:string)=>s==="Critical"?"bg-[var(--color-bad)]":s==="High"?"bg-[var(--color-warn)]":"bg-[var(--color-text-faint)]";
  return(
    <div className="space-y-4">
      {maint.length>0&&<div><Lbl>Maintenance</Lbl><div className="flex gap-2 mt-1">{maint.map((c:any)=><div key={c.id} className="bg-[var(--color-surface)] border border-[var(--color-border-card)] rounded-lg px-3 py-2"><p className="text-[10px] font-semibold text-[var(--color-card-text)]">{c.name}</p><p className="text-[8px] text-[var(--color-card-text-muted)]">{c.project}</p></div>)}</div></div>}
      {showAdd&&<QuickAdd title="Report Issue" fields={[{k:"title",l:"Title",p:"Issue title"},{k:"description",l:"Description",p:"Describe the issue",t:"textarea"},{k:"severity",l:"Severity",t:"select",o:["Low","Medium","High","Critical"]},{k:"clientId",l:"Project",t:"select",o:crm.clients.map((c:any)=>({v:String(c.id),l:c.name}))},{k:"assignedAdminId",l:"Assign",t:"select",o:crm.team.map((t:any)=>({v:t.id,l:t.name}))}]} onSubmit={(d:any)=>{crm.addFlag({clientId:Number(d.clientId)||crm.clients[0]?.id,title:d.title,description:d.description,severity:d.severity||"Medium",assignedAdminId:d.assignedAdminId||"a1"});close();}} onClose={close}/>}
      <div><Lbl>Open ({open.length})</Lbl><div className="space-y-1.5 mt-1">{open.map((f:any)=>{const cl=crm.clients.find((c:any)=>c.id===f.clientId);return <button key={f.id} onClick={()=>setSel(f.id)} className={`w-full text-left flex items-center gap-2 bg-[var(--color-bg-soft)] border rounded-lg p-2.5 transition-colors ${sel===f.id?"border-[var(--color-ember)]/50 bg-[var(--color-ember-soft)]":"border-[var(--color-border)] hover:border-[var(--color-border)]/80"}`}><span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot(f.severity)}`}/><div className="flex-1 min-w-0"><p className="text-[10px] font-medium truncate">{f.title}</p><p className="text-[8px] text-[var(--color-text-faint)]">{cl?.name} · {f.status}</p></div><X onClick={()=>crm.deleteFlag(f.id)}/></button>;})}{open.length===0&&<p className="text-[9px] text-[var(--color-text-faint)] py-3 text-center">All clear ✓</p>}</div></div>
      {done.length>0&&<div><Lbl>Resolved ({done.length})</Lbl>{done.slice(0,5).map((f:any)=><div key={f.id} className="flex items-center gap-2 px-2 py-1"><Dot c="bg-[var(--color-ok)]"/><span className="text-[9px] text-[var(--color-text-muted)] line-through flex-1">{f.title}</span><X onClick={()=>crm.deleteFlag(f.id)}/></div>)}</div>}
    </div>
  );
}

/* ── Flag Drawer ── */
function FlagDrawer({crm,id,onClose}:any){
  const f=crm.flags.find((x:any)=>x.id===id);if(!f)return null;const cl=crm.clients.find((c:any)=>c.id===f.clientId);const [log,setLog]=useState("");
  return(
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between"><h3 className="text-[12px] font-bold">{f.title}</h3><X onClick={onClose}/></div>
      {f.description&&<p className="text-[10px] text-[var(--color-text-muted)]">{f.description}</p>}
      <div className="space-y-px">
        <div className="flex items-center justify-between py-px"><Lbl>Project</Lbl><span className="text-[10px]">{cl?.name||"—"}</span></div>
        <div className="flex items-center justify-between py-px"><Lbl>Severity</Lbl><span className="text-[10px]">{f.severity}</span></div>
        <div className="flex items-center justify-between py-px"><Lbl>Status</Lbl><select value={f.status} onChange={e=>crm.updateFlagStatus(id,e.target.value)} className="text-[9px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded px-1 py-px outline-none">{(["Open","Investigating","In Dev","Resolved"] as FlagStatus[]).map(s=><option key={s}>{s}</option>)}</select></div>
        <div className="flex items-center justify-between py-px"><Lbl>Assigned</Lbl><select value={f.assignedAdminId||""} onChange={e=>crm.assignFlagAdmin(id,e.target.value)} className="text-[9px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded px-1 py-px outline-none">{crm.team.map((t:any)=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
      </div>
      <div className="border-t border-[var(--color-border)] pt-2"><Lbl>Dev Log</Lbl>
        {f.sprintLogs.map((l:any)=><div key={l.id} className="p-1.5 rounded bg-[var(--color-bg)] mt-1"><span className="text-[8px] font-semibold">{l.author}</span><span className="text-[7px] text-[var(--color-text-faint)] ml-1">{l.timestamp}</span><p className="text-[9px] text-[var(--color-text-muted)] mt-px">{l.text}</p></div>)}
        <div className="flex gap-1.5 mt-1.5"><input value={log} onChange={e=>setLog(e.target.value)} placeholder="Add update..." className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded px-2 py-1 text-[9px] outline-none focus:border-[var(--color-ember)]" onKeyDown={e=>{if(e.key==="Enter"&&log.trim()){crm.addFlagSprintLog(id,crm.userProfile?.name||"Admin",log.trim());setLog("");}}}/><button onClick={()=>{if(log.trim()){crm.addFlagSprintLog(id,crm.userProfile?.name||"Admin",log.trim());setLog("");}}} className="px-2 py-1 bg-[var(--color-ember)] text-white text-[8px] rounded">Add</button></div>
      </div>
      <div className="border-t border-[var(--color-border)] pt-2"><button onClick={()=>{crm.deleteFlag(id);onClose();}} className="text-[8px] text-[var(--color-bad)] hover:underline">Delete issue</button></div>
    </div>
  );
}

/* ═══════════════════════ 7. PRODUCTS ═══════════════════════ */
function Products({crm}:any){
  const sc=(s:string)=>s==="Beta"||s==="Live"?"bg-[var(--color-ok)]":s==="In Dev"?"bg-[var(--color-warn)]":"bg-[var(--color-text-faint)]";
  return(
    <div className="space-y-2 max-w-2xl">
      <Lbl>Internal Products</Lbl>
      {crm.products.map((p:any)=>{const ld=crm.team.find((t:any)=>t.id===p.leadId);return(
        <div key={p.id} className="bg-[var(--color-surface)] border border-[var(--color-border-card)] rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <div><h4 className="text-[12px] font-semibold text-[var(--color-card-text)]">{p.name}</h4><p className="text-[9px] text-[var(--color-card-text-muted)]">{p.description}</p></div>
            <div className="flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${sc(p.stage)}`}/><span className="text-[9px] font-medium text-[var(--color-card-text-secondary)]">{p.stage}</span></div>
          </div>
          <div className="h-1 bg-[var(--color-surface-deep)] rounded-full overflow-hidden mt-2"><div className="h-full bg-[var(--color-ember)] rounded-full" style={{width:`${p.progress}%`}}/></div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[8px] text-[var(--color-card-text-muted)]">{p.progress}%</span>
            <div className="flex items-center gap-1"><Av id={p.leadId} name={ld?.name||"?"} sz={14}/><span className="text-[8px] text-[var(--color-card-text-muted)]">{ld?.name}</span></div>
          </div>
          {(p.repoLink||p.sandboxLink)&&<div className="flex gap-2 mt-2">{p.repoLink&&<span className="text-[7.5px] text-[var(--color-card-text-muted)] bg-[var(--color-surface-muted)] px-1.5 py-px rounded">📁 {p.repoLink.split("/").slice(-1)}</span>}{p.sandboxLink&&<span className="text-[7.5px] text-[var(--color-card-text-muted)] bg-[var(--color-surface-muted)] px-1.5 py-px rounded">🌐 {p.sandboxLink}</span>}</div>}
        </div>
      );})}
    </div>
  );
}

/* ═══════════════════════ ACCESS MANAGEMENT ═══════════════════════ */
function AccessManagement({crm, clients}:any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("client");
  const [assignedClientId, setAssignedClientId] = useState<number>(clients[0]?.id || 1);
  const [error, setError] = useState<string|null>(null);

  const createUser = () => {
    if (!email || !password || !name) {
      setError("Please fill all fields");
      return;
    }
    crm.addCrmUser({
      id: Date.now().toString(),
      email: email.toLowerCase(),
      password,
      name,
      role: role === "admin" ? "admin" : role === "intern" ? "intern" : "client",
      category: role === "admin" ? "admin" : role === "intern" ? "intern" : "client",
      assignedClientId: role === "client" ? assignedClientId : undefined,
      createdBy: crm.userProfile?.email
    });
    setEmail(""); setPassword(""); setName(""); setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border-card)] rounded-xl p-5 shadow-sm max-w-2xl">
        <h3 className="text-[12px] font-semibold mb-4">Create Access Profile</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div><Lbl>Full Name</Lbl><input value={name} onChange={e=>setName(e.target.value)} className="w-full mt-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-1.5 text-[11px] outline-none focus:border-[var(--color-ember)]" placeholder="John Doe"/></div>
          <div><Lbl>Email Address</Lbl><input value={email} onChange={e=>setEmail(e.target.value)} className="w-full mt-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-1.5 text-[11px] outline-none focus:border-[var(--color-ember)]" placeholder="john@example.com"/></div>
          <div><Lbl>Temporary Password</Lbl><input value={password} onChange={e=>setPassword(e.target.value)} type="password" className="w-full mt-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-1.5 text-[11px] outline-none focus:border-[var(--color-ember)]" placeholder="••••••••"/></div>
          <div><Lbl>Access Role</Lbl>
            <select value={role} onChange={e=>setRole(e.target.value)} className="w-full mt-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-1.5 text-[11px] outline-none focus:border-[var(--color-ember)]">
              <option value="client">Client (Restricted to Project)</option>
              <option value="intern">Intern / Employee (Internal access)</option>
              <option value="admin">Admin (Full Access)</option>
            </select>
          </div>
          {role === "client" && (
            <div className="col-span-2"><Lbl>Assigned Project (Client Abstraction)</Lbl>
              <select value={assignedClientId} onChange={e=>setAssignedClientId(Number(e.target.value))} className="w-full mt-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-3 py-1.5 text-[11px] outline-none focus:border-[var(--color-ember)]">
                {clients.map((c:any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
        </div>
        {error && <p className="text-[10px] text-[var(--color-bad)] mb-3">{error}</p>}
        <button onClick={createUser} className="bg-[var(--color-ember)] text-white text-[11px] font-semibold px-4 py-2 rounded-md hover:bg-[var(--color-ember-hover)] transition-colors">Create User</button>
      </div>

      <div>
        <h3 className="text-[12px] font-semibold mb-3">Active Credentials</h3>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border-card)] rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-[10px]">
            <thead><tr className="border-b border-[var(--color-border-card)]"><th className="p-3 font-medium text-[var(--color-text-muted)]">User</th><th className="p-3 font-medium text-[var(--color-text-muted)]">Email</th><th className="p-3 font-medium text-[var(--color-text-muted)]">Role</th><th className="p-3 font-medium text-[var(--color-text-muted)]">Restriction</th><th className="p-3 font-medium text-[var(--color-text-muted)]">Created By</th><th className="p-3"></th></tr></thead>
            <tbody>
              {crm.crmUsers?.map((u:any) => (
                <tr key={u.id} className="border-b border-[var(--color-border-card)]/30 hover:bg-[var(--color-bg-soft)] transition-colors">
                  <td className="p-3 font-medium">{u.name}</td>
                  <td className="p-3 text-[var(--color-text-secondary)]">{u.email}</td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded-full ${u.role==='admin'?'bg-[var(--color-ember)]/20 text-[var(--color-ember)]':u.role==='client'?'bg-[var(--color-ok)]/20 text-[var(--color-ok)]':'bg-[var(--color-info)]/20 text-[var(--color-info)]'}`}>{u.role}</span></td>
                  <td className="p-3 text-[var(--color-text-secondary)]">{u.role === 'client' ? `Project ID: ${u.assignedClientId}` : '—'}</td>
                  <td className="p-3 text-[var(--color-text-secondary)]">{u.createdBy || 'System'}</td>
                  <td className="p-3 text-right"><button onClick={()=>crm.deleteCrmUser(u.email)} className="text-[var(--color-bad)] hover:underline">Revoke</button></td>
                </tr>
              ))}
              {(!crm.crmUsers || crm.crmUsers.length === 0) && <tr><td colSpan={6} className="p-6 text-center text-[var(--color-text-faint)]">No custom accounts provisioned yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ SHARED: QuickAdd form ═══════════════════════ */
function QuickAdd({title,fields,onSubmit,onClose}:{title:string;fields:any[];onSubmit:(d:any)=>void;onClose:()=>void}){
  const [d,setD]=useState<Record<string,any>>(()=>{const init:Record<string,any>={};fields.forEach(f=>{if(f.t==="select"){const o=f.o;if(o?.length)init[f.k]=typeof o[0]==="object"?o[0].v:o[0];}else init[f.k]="";});return init;});
  const set=(k:string,v:any)=>setD(p=>({...p,[k]:v}));
  const cls="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md px-2 py-1.5 text-[10px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-ember)] placeholder:text-[var(--color-text-faint)]";
  return(
    <div className="bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between"><h3 className="text-[10px] font-semibold">{title}</h3><X onClick={onClose}/></div>
      <div className="grid grid-cols-2 gap-1.5">
        {fields.map((f:any)=>{
          if(f.t==="select")return <select key={f.k} value={d[f.k]??""} onChange={e=>set(f.k,e.target.value)} className={cls}>{f.o.map((o:any)=>typeof o==="object"?<option key={o.v} value={o.v}>{o.l}</option>:<option key={o}>{o}</option>)}</select>;
          if(f.t==="textarea")return <textarea key={f.k} placeholder={f.p} value={d[f.k]??""} onChange={e=>set(f.k,e.target.value)} rows={2} className={cls+" col-span-2 resize-none"}/>;
          if(f.t==="date")return <input key={f.k} type="date" value={d[f.k]??""} onChange={e=>set(f.k,e.target.value)} className={cls}/>;
          return <input key={f.k} type={f.t||"text"} placeholder={f.p} value={d[f.k]??""} onChange={e=>set(f.k,e.target.value)} className={`${cls} ${f.k===fields[0]?.k?"col-span-2":""}`}/>;
        })}
      </div>
      <button onClick={()=>onSubmit(d)} className="w-full bg-[var(--color-ember)] text-white text-[9px] font-semibold py-1.5 rounded-md hover:bg-[var(--color-ember-hover)] transition-colors">Create</button>
    </div>
  );
}
