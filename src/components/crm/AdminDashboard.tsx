"use client";

import React, { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "framer-motion";
import { useCRM, ClientStage, OutreachStatus, TaskStatus, FlagSeverity, FlagStatus, SocialStatus, SocialPlatform, SocialContentType, SocialMediaItem } from "./CRMContext";

/* ─── helpers ─── */
const fmt = (n: number) => n > 0 ? "₹" + n.toLocaleString("en-IN") : "—";
const fmtTime = (s: number) => { const m = Math.floor(s / 60); const sc = Math.floor(s % 60); return `${m.toString().padStart(2, '0')}:${sc.toString().padStart(2, '0')}`; };
const PROJECT_STAGES: ClientStage[] = ["Requirement","Model","Demo 1","Converted","Dev 1","Demo 2","Dev Final","Final Demo","Delivery","Maintenance"];
const TASK_COLS: { s: TaskStatus; l: string }[] = [{s:"Todo",l:"To Do"},{s:"In Progress",l:"In Progress"},{s:"In Review",l:"Review"},{s:"Resolved",l:"Done"}];
const SOCIAL_COLS: { s: SocialStatus; l: string }[] = [{s:"Idea and Create",l:"Idea & Create"},{s:"Schedule",l:"Scheduled"},{s:"Done",l:"Done"}];
const LEAD_STATUSES: OutreachStatus[] = ["Lead","Contacted","Responded","Requirements","Demo","Quoted","Converted","Lost"];
type Section = "dashboard"|"projects"|"tasks"|"social"|"leads"|"support"|"products"|"access";
const USER_COLORS = ["#FF5A1F", "#0D9488", "#65A30D", "#9333EA", "#E11D48", "#2563EB", "#059669", "#D97706", "#4F46E5", "#BE185D"];
const getAvatarColor = (name: string) => {
  if (!name) return "#78716C";
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
};

/* ─── tiny shared components ─── */
const Dot = ({c}:{c:string}) => <span className={`w-[5px] h-[5px] rounded-full inline-block ${c}`}/>;
const Lbl = ({children}:{children:React.ReactNode}) => <span className="text-[8px] font-mono uppercase tracking-[.14em] text-[var(--color-text-faint)]">{children}</span>;
const Av = ({id,name,sz=18}:{id:string;name:string;sz?:number}) => <span title={name} className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{backgroundColor:getAvatarColor(name),width:sz,height:sz,fontSize:sz*0.42}}>{name?.charAt(0).toUpperCase()||"?"}</span>;
const X = ({onClick}:{onClick:()=>void}) => <button onClick={e=>{e.stopPropagation();onClick();}} className="w-5 h-5 rounded flex items-center justify-center text-[14px] text-[var(--color-text-faint)] hover:text-[var(--color-bad)] hover:bg-[var(--color-bad-soft)] transition-colors">×</button>;

/* ═══════════════════════════════════════════ ROOT ═══════════════════════════════════════════ */
export default function AdminDashboard() {
  const crm=useCRM();
  const {team,products,comments,activities,leads,flags,internalTasks}=crm;
  const clients = crm.userProfile?.category === "intern" ? crm.clients.filter(c => c.assignedAdminId === crm.userProfile?.id || (crm.userProfile?.assignedProjects || []).includes(c.id)) : crm.clients;
  const [sec,setSec]=useState<Section>(() => {
    if (crm.userProfile?.category === "intern") {
      return (crm.userProfile.allowedTabs?.[0] as Section) || "projects";
    }
    return "dashboard";
  });
  
  useEffect(() => {
    if (crm.userProfile?.category === "intern" && sec === "dashboard") {
      setSec((crm.userProfile.allowedTabs?.[0] as Section) || "projects");
    }
  }, [crm.userProfile?.category, crm.userProfile?.allowedTabs, sec]);

  const [sel,setSel]=useState<number|string|null>(null);
  const [showAdd,setShowAdd] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirm, setConfirm] = useState<{ title: string, desc: string, action: () => void } | null>(null);
  const go = (s:Section)=>{setSec(s);setSel(null);setShowAdd(false);setSidebarOpen(false);};
  const navigateTo = (s:Section, id?: string | number)=>{setSec(s);setSel(id ?? null);setShowAdd(false);setSidebarOpen(false);};
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
  
  // Filter nav for interns - they only see their explicitly allowed tabs
  const filteredNav = crm.userProfile?.category === "intern" 
    ? navItems.filter(n => (crm.userProfile?.allowedTabs || []).includes(n.id))
    : navItems;

  if (crm.userProfile?.category === "intern") {
    return (
      <div className="flex flex-col h-[100dvh] bg-[var(--color-bg)] text-[var(--color-text-primary)] font-sans overflow-hidden">
        {/* INTERN TOP NAVIGATION */}
        <header className="h-16 flex-shrink-0 border-b border-[var(--color-border-subtle)] flex items-center justify-between px-4 md:px-8 bg-gradient-to-r from-[var(--color-bg-raised)] to-[var(--color-bg)] shadow-sm z-20">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <h1 className="text-[16px] font-black tracking-tight text-[var(--color-card-text)]">almmatix</h1>
              <span className="text-[10px] font-bold text-[var(--color-ember)] bg-[var(--color-ember)]/10 px-2 py-0.5 rounded uppercase tracking-wider hidden md:block">Workspace</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-2 border-l border-[var(--color-border-subtle)] pl-6 ml-2">
              {filteredNav.map(n => (
                <button key={n.id} onClick={()=>go(n.id)} className={`px-4 py-2 text-[13px] font-bold rounded-lg transition-all ${sec===n.id ? 'bg-[var(--color-surface)] text-[var(--color-ember)] shadow-sm border border-[var(--color-border-card)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-soft)]'}`}>
                  {n.l}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
             {!["dashboard","access"].includes(sec)&&<button onClick={()=>setShowAdd(!showAdd)} className="px-4 py-2 bg-[var(--color-ember)] text-white text-[12px] font-bold rounded-lg hover:bg-[var(--color-ember-hover)] transition-all shadow-[0_0_10px_var(--color-ember-soft)] flex items-center gap-1.5"><span className="text-[14px] leading-none">+</span> <span className="hidden md:block">New</span></button>}
             <div className="flex items-center gap-2 pl-3 md:pl-4 border-l border-[var(--color-border-subtle)]">
               <Av id={crm.userProfile?.id||"i1"} name={crm.userProfile?.name||"Intern"} sz={28}/>
               <div className="hidden md:block text-left mr-2">
                 <p className="text-[12px] font-bold text-[var(--color-card-text)] leading-tight">{crm.userProfile?.name||"Intern"}</p>
                 <p className="text-[9px] text-[var(--color-text-faint)] font-medium">Workspace Member</p>
               </div>
               <button onClick={crm.signOut} className="text-[11px] bg-[var(--color-surface-muted)] px-3 py-2 rounded-lg font-bold text-[var(--color-text-muted)] hover:text-[var(--color-bad)] hover:bg-[var(--color-bad-soft)] transition-colors">Logout</button>
             </div>
          </div>
        </header>

        {/* MOBILE INTERN NAV */}
        <div className="md:hidden flex overflow-x-auto p-3 gap-2 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)] crm-scroll z-10 flex-shrink-0">
           {filteredNav.map(n => (
              <button key={n.id} onClick={()=>go(n.id)} className={`px-4 py-2 text-[12px] font-bold rounded-lg whitespace-nowrap transition-all ${sec===n.id ? 'bg-[var(--color-ember)] text-white shadow-md' : 'bg-[var(--color-bg-soft)] text-[var(--color-text-secondary)] border border-transparent'}`}>
                {n.l}
              </button>
            ))}
        </div>

        {/* MAIN INTERN CONTENT */}
        <div className="flex-1 flex overflow-hidden relative bg-[var(--color-bg)]">
          <div className="flex-1 overflow-y-auto crm-scroll p-4 md:p-8">
            <AnimatePresence mode="wait"><motion.div key={sec} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.2,ease:[0.16,1,0.3,1]}}>
              {sec==="dashboard"&&<Dashboard crm={crm} navigateTo={navigateTo}/>}
              {sec==="projects"&&<Projects crm={crm} clients={clients} sel={sel} setSel={setSel} showAdd={showAdd} close={()=>setShowAdd(false)} navigateTo={navigateTo} setConfirm={setConfirm}/>}
              {sec==="tasks"&&<Tasks crm={crm} showAdd={showAdd} close={()=>setShowAdd(false)} navigateTo={navigateTo} setConfirm={setConfirm}/>}
              {sec==="social"&&<Social crm={crm} showAdd={showAdd} close={()=>setShowAdd(false)} navigateTo={navigateTo} setConfirm={setConfirm}/>}
              {sec==="leads"&&<Leads crm={crm} sel={sel} setSel={setSel} showAdd={showAdd} close={()=>setShowAdd(false)} navigateTo={navigateTo} setConfirm={setConfirm}/>}
              {sec==="support"&&<Support crm={crm} sel={sel} setSel={setSel} showAdd={showAdd} close={()=>setShowAdd(false)} navigateTo={navigateTo} setConfirm={setConfirm}/>}
              {sec==="products"&&<Products crm={crm} clients={clients} showAdd={showAdd} close={()=>setShowAdd(false)} navigateTo={navigateTo} setConfirm={setConfirm}/>}
            </motion.div></AnimatePresence>
          </div>
          <AnimatePresence>
            {sel!==null&&["projects","leads","support"].includes(sec)&&(
              <motion.div initial={{width:0,opacity:0}} animate={{width:380,opacity:1}} exit={{width:0,opacity:0}} transition={{duration:.2,ease:[.16,1,.3,1]}} className="flex-shrink-0 border-l border-[var(--color-border-subtle)] bg-[var(--color-surface)] shadow-2xl overflow-hidden absolute md:relative right-0 h-full z-20">
                <div className="w-[380px] h-full overflow-y-auto crm-scroll relative bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-bg)]">
                  {sec==="projects"&&<ProjDrawer crm={crm} id={sel as number} onClose={()=>setSel(null)} setConfirm={setConfirm}/>}
                  {sec==="leads"&&<LeadDrawer crm={crm} id={sel as string} onClose={()=>setSel(null)} setConfirm={setConfirm}/>}
                  {sec==="support"&&<FlagDrawer crm={crm} id={sel as string} onClose={()=>setSel(null)} setConfirm={setConfirm}/>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {confirm && (
          <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="bg-[var(--color-surface)] border border-[var(--color-border-card)] p-6 rounded-2xl w-full max-w-[400px] shadow-2xl">
              <h3 className="text-[18px] font-black text-white mb-2">{confirm.title}</h3>
              <p className="text-[13px] text-[var(--color-text-secondary)] mb-6 leading-relaxed">{confirm.desc}</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setConfirm(null)} className="px-5 py-2 text-[12px] font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] rounded-lg transition-colors">Cancel</button>
                <button onClick={() => { confirm.action(); setConfirm(null); }} className="px-5 py-2 text-[12px] font-bold bg-[var(--color-bad)] hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg shadow-red-500/20">Yes, Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="flex h-[100dvh] bg-[var(--color-bg)] text-[var(--color-text-primary)] font-sans overflow-hidden">
      {/* ── sidebar overlay (mobile) ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm" onClick={()=>setSidebarOpen(false)} />
        )}
      </AnimatePresence>
      
      {/* ── sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[240px] md:w-[200px] flex-shrink-0 bg-[var(--color-bg-raised)] border-r border-[var(--color-border-subtle)] flex flex-col select-none transition-transform duration-300 md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-5 pt-6 pb-4 flex items-center justify-between">
          <div><h1 className="text-[16px] font-bold tracking-tight">almmatix</h1><p className="text-[10px] text-[var(--color-text-faint)] font-mono uppercase tracking-[.15em] mt-1">CRM Dashboard</p></div>
          <button className="md:hidden p-1 text-[var(--color-text-muted)] hover:text-white" onClick={()=>setSidebarOpen(false)}>×</button>
        </div>
        <nav className="flex-1 px-3 mt-2 space-y-1 overflow-y-auto crm-scroll">
          {filteredNav.map(n=>(
            <button key={n.id} onClick={()=>go(n.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all font-medium ${sec===n.id?"bg-[var(--color-ember)] text-white shadow-md":"text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-soft)]"}`}>
              <span className="text-[14px] w-5 text-center opacity-70">{n.i}</span><span className="flex-1 text-left">{n.l}</span>
              {n.c!==undefined&&<span className={`text-[10px] min-w-[20px] text-center px-1.5 py-0.5 rounded-full ${sec===n.id?"bg-[var(--color-surface)]/20 text-white font-bold":"bg-[var(--color-border)] text-[var(--color-text-muted)]"}`}>{n.c}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-[var(--color-border-subtle)] space-y-4">
          <div className="flex items-center gap-2"><Dot c={crm.isSupabaseOnline?"bg-[var(--color-ok)]":"bg-[var(--color-warn)] animate-pulse"}/><span className="text-[11px] font-medium text-[var(--color-text-faint)]">{crm.isSupabaseOnline?"Connected":"Offline"}</span></div>
          <div className="flex items-center justify-between bg-[var(--color-bg-soft)] border border-[var(--color-border)] p-2 rounded-lg">
            <div className="flex items-center gap-2">
              <Av id={crm.userProfile?.id||"a1"} name={crm.userProfile?.name||"Admin"} sz={24}/>
              <span className="text-[12px] font-bold text-[var(--color-card-text)] truncate max-w-[80px]">{crm.userProfile?.name||"Admin"}</span>
            </div>
            <button onClick={crm.signOut} className="text-[11px] bg-[var(--color-surface-muted)] px-2 py-1.5 rounded font-bold text-[var(--color-text-muted)] hover:text-[var(--color-bad)] hover:bg-[var(--color-bad-soft)] transition-colors">Logout</button>
          </div>
        </div>
      </aside>
      
      {/* ── main ── */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-14 flex-shrink-0 border-b border-[var(--color-border-subtle)] flex items-center justify-between px-4 md:px-6 bg-gradient-to-r from-[var(--color-bg-raised)] to-[var(--color-bg)] shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 -ml-2 text-[var(--color-text-muted)] hover:text-white" onClick={()=>setSidebarOpen(true)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h2 className="text-[15px] font-bold tracking-tight text-[var(--color-card-text)]">{filteredNav.find(n=>n.id===sec)?.l || navItems.find(n=>n.id===sec)?.l}</h2>
          </div>
          {!["dashboard","access"].includes(sec)&&<button onClick={()=>setShowAdd(!showAdd)} className="px-4 py-2 bg-[var(--color-ember)] text-white text-[12px] font-bold rounded-lg hover:bg-[var(--color-ember-hover)] transition-all shadow-[0_0_10px_var(--color-ember-soft)] flex items-center gap-1.5"><span className="text-[14px] leading-none">+</span> New</button>}
        </header>
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto crm-scroll p-4 md:p-6">
            <AnimatePresence mode="wait"><motion.div key={sec} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.2,ease:[0.16,1,0.3,1]}}>
              {sec==="dashboard"&&<Dashboard crm={crm} navigateTo={navigateTo}/>}
              {sec==="projects"&&<Projects crm={crm} clients={clients} sel={sel} setSel={setSel} showAdd={showAdd} close={()=>setShowAdd(false)} navigateTo={navigateTo} setConfirm={setConfirm}/>}
              {sec==="tasks"&&<Tasks crm={crm} showAdd={showAdd} close={()=>setShowAdd(false)} navigateTo={navigateTo} setConfirm={setConfirm}/>}
              {sec==="social"&&<Social crm={crm} showAdd={showAdd} close={()=>setShowAdd(false)} navigateTo={navigateTo} setConfirm={setConfirm}/>}
              {sec==="leads"&&<Leads crm={crm} sel={sel} setSel={setSel} showAdd={showAdd} close={()=>setShowAdd(false)} navigateTo={navigateTo} setConfirm={setConfirm}/>}
              {sec==="support"&&<Support crm={crm} sel={sel} setSel={setSel} showAdd={showAdd} close={()=>setShowAdd(false)} navigateTo={navigateTo} setConfirm={setConfirm}/>}
              {sec==="products"&&<Products crm={crm} clients={clients} showAdd={showAdd} close={()=>setShowAdd(false)} navigateTo={navigateTo} setConfirm={setConfirm}/>}
              {sec==="access"&&<AccessManagement crm={crm} clients={clients} setConfirm={setConfirm}/>}
            </motion.div></AnimatePresence>
          </div>
          <AnimatePresence>
            {sel!==null&&["projects","leads","support"].includes(sec)&&(
              <motion.div initial={{width:0,opacity:0}} animate={{width:380,opacity:1}} exit={{width:0,opacity:0}} transition={{duration:.2,ease:[.16,1,.3,1]}} className="flex-shrink-0 border-l border-[var(--color-border-subtle)] bg-[var(--color-surface)] shadow-2xl overflow-hidden absolute md:relative right-0 h-full z-20">
                <div className="w-[380px] h-full overflow-y-auto crm-scroll relative bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-bg)]">
                  {sec==="projects"&&<ProjDrawer crm={crm} id={sel as number} onClose={()=>setSel(null)} setConfirm={setConfirm}/>}
                  {sec==="leads"&&<LeadDrawer crm={crm} id={sel as string} onClose={()=>setSel(null)} setConfirm={setConfirm}/>}
                  {sec==="support"&&<FlagDrawer crm={crm} id={sel as string} onClose={()=>setSel(null)} setConfirm={setConfirm}/>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      {confirm && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="bg-[var(--color-surface)] border border-[var(--color-border-card)] p-6 rounded-2xl w-full max-w-[400px] shadow-2xl">
            <h3 className="text-[18px] font-black text-white mb-2">{confirm.title}</h3>
            <p className="text-[13px] text-[var(--color-text-secondary)] mb-6 leading-relaxed">{confirm.desc}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirm(null)} className="px-5 py-2 text-[12px] font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] rounded-lg transition-colors">Cancel</button>
              <button onClick={() => { confirm.action(); setConfirm(null); }} className="px-5 py-2 text-[12px] font-bold bg-[var(--color-bad)] hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg shadow-red-500/20">Yes, Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════ 1. DASHBOARD ═══════════════════════ */
function Dashboard({crm, navigateTo}:any) {
  const {clients,team,leads,internalTasks,flags,comments,activities}=crm;
  const ACTIVE_STAGES = ["Converted", "Dev 1", "Demo 2", "Dev Final", "Final Demo", "Delivery"];
  const POSSIBLE_STAGES = ["Requirement", "Model", "Demo 1"];
  const activeClients = clients.filter((c:any) => ACTIVE_STAGES.includes(c.stage));
  const activeCount = activeClients.length;
  const pipe = activeClients.reduce((s:number,c:any)=>s+(Number(c.revenue)||0),0);
  const possibleCount = clients.filter((c:any) => POSSIBLE_STAGES.includes(c.stage)).length;
  const openF=flags.filter((f:any)=>f.status!=="Resolved").length;
  const openT=internalTasks.filter((t:any)=>t.status!=="Resolved").length;
  const typeIcon:Record<string,string> = {milestone:"🏁",comment:"💬",invoice:"💰",alert:"🚨"};
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[{l:"Active Projects",v:activeCount,a:"text-[var(--color-ok)]"},{l:"Pipeline",v:fmt(pipe),a:"text-[var(--color-text-primary)]"},{l:"Tasks",v:openT,a:"text-[var(--color-info)]"},{l:"Issues",v:openF,a:openF?"text-[var(--color-bad)]":"text-[var(--color-text-primary)]"},{l:"Possible Projects",v:possibleCount,a:"text-[var(--color-text-primary)]"}].map(s=>(
          <div key={s.l} className="bg-[var(--color-surface)] border border-[var(--color-border-card)] shadow-sm rounded-xl px-4 py-3"><Lbl>{s.l}</Lbl><p className={`text-2xl font-bold mt-1 ${s.a}`}>{s.v}</p></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Team Workload */}
        <div className="space-y-3">
          <Lbl>Team Workload</Lbl>
          {team.map((m:any)=>{const ts=internalTasks.filter((t:any)=>t.assignedAdminId===m.id&&t.status!=="Resolved");const now=ts.find((t:any)=>t.status==="In Progress");const nx=ts.find((t:any)=>t.status==="Todo");const pj=clients.filter((c:any)=>c.assignedAdminId===m.id);const cap=ts.length<=2?"bg-[var(--color-ok)]":ts.length<=4?"bg-[var(--color-warn)]":"bg-[var(--color-bad)]";return(
            <div key={m.id} className="bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border-card)] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3"><Av id={m.id} name={m.name} sz={32}/><div className="flex-1 min-w-0"><p className="text-[14px] font-bold text-[var(--color-card-text)] leading-none mb-1">{m.name}</p><div className="flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${cap} shadow-sm`}/><p className="text-[11px] font-medium text-[var(--color-card-text-muted)]">{m.role} · {pj.length} projects · {ts.length} tasks</p></div></div></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[var(--color-surface)] rounded-lg p-3 border border-[var(--color-border-card)]"><p className="text-[9px] font-mono uppercase tracking-wider text-[var(--color-ok)] mb-1">NOW</p><p className="text-[12px] text-[var(--color-card-text)] font-bold truncate">{now?.title||"—"}</p></div>
                <div className="bg-[var(--color-surface)] rounded-lg p-3 border border-[var(--color-border-card)]"><p className="text-[9px] font-mono uppercase tracking-wider text-[var(--color-info)] mb-1">NEXT</p><p className="text-[12px] text-[var(--color-card-text)] font-bold truncate">{nx?.title||"—"}</p></div>
              </div>
            </div>
          );})}
        </div>
        {/* Column 2: Activity Feed (In Progress Tasks) */}
        <div className="space-y-3">
          <Lbl>Activity Feed (In Progress)</Lbl>
          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border-card)] shadow-sm p-4 max-h-[600px] overflow-y-auto crm-scroll">
            {internalTasks.filter((t:any) => t.status === "In Progress").length === 0 && <div className="flex flex-col items-center justify-center py-8 opacity-30"><span className="text-2xl mb-1">📋</span><p className="text-[11px] font-medium">No tasks in progress</p></div>}
            <div className="relative">
              {internalTasks.filter((t:any) => t.status === "In Progress").length > 0 && <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-[var(--color-border-card)]/50 rounded-full"/>}
              <div className="space-y-0">
                {internalTasks.filter((t:any) => t.status === "In Progress").slice(0, 20).map((t:any, i:number) => {
                  const ow = team.find((u:any) => u.id === t.assignedAdminId);
                  const cl = clients.find((c:any) => c.id === t.clientId);
                  const pr = crm.products?.find((p:any) => p.id === t.productId);
                  return (
                  <div key={t.id || i} className="flex gap-3 py-3 relative group hover:bg-[var(--color-bg-soft)] rounded-lg px-1 -mx-1 transition-colors">
                    <div className="relative z-10 flex-shrink-0 w-4 h-4 rounded-full bg-[var(--color-surface)] border-2 border-[var(--color-border-card)] flex items-center justify-center mt-0.5">
                      <span className="text-[8px]">⚡</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11.5px] font-bold text-[var(--color-card-text)] leading-snug">{t.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-bold text-[var(--color-ember)] bg-[var(--color-ember-soft)] px-1.5 py-0.5 rounded">{ow?.name || "Unassigned"}</span>
                        <span className="text-[9px] text-[var(--color-text-faint)] font-medium">
                          {(cl && cl.name) || (pr && pr.name) || "General"}
                        </span>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            </div>
          </div>
        </div>
        {/* Column 3: Attention + Active Projects + Active Products */}
        <div className="space-y-6">
          <div className="bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border-card)] shadow-sm"><Lbl>Needs Attention</Lbl>
            <div className="space-y-2 mt-3">
              {comments.filter((c:any)=>c.role==="client"&&c.isUnreadAdmin).slice(0,3).map((c:any)=>{const cl=clients.find((x:any)=>x.id===c.clientId);return <div key={c.id} onClick={()=>crm.markCommentAsRead(c.id)} className="flex items-start gap-2 bg-[var(--color-ember-soft)] border border-[var(--color-ember)]/30 rounded-lg p-3 cursor-pointer hover:bg-[var(--color-ember)]/10 transition-colors"><Dot c="bg-[var(--color-ember)] mt-1.5 animate-pulse shadow-[0_0_5px_var(--color-ember)]"/><div className="min-w-0 flex-1"><p className="text-[11px] font-bold text-[var(--color-ember)] mb-0.5">Reply needed: {cl?.name}</p><p className="text-[11px] text-[var(--color-text-secondary)] line-clamp-2 leading-snug">{c.text}</p></div></div>;})}
              {flags.filter((f:any)=>f.status==="Open").slice(0,2).map((f:any)=><div key={f.id} onClick={() => navigateTo("support", f.id)} className="flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border-card)] rounded-lg p-3 shadow-sm cursor-pointer hover:border-[var(--color-ember)] hover:shadow-md transition-all"><Dot c="bg-[var(--color-bad)] shadow-[0_0_5px_var(--color-bad)]"/><p className="text-[11px] font-bold text-[var(--color-card-text)] truncate flex-1">{f.title}</p></div>)}
              {comments.filter((c:any)=>c.role==="client"&&c.isUnreadAdmin).length===0&&flags.filter((f:any)=>f.status==="Open").length===0&&<div className="flex flex-col items-center justify-center py-6 opacity-30"><span className="text-2xl mb-1">✨</span><p className="text-[11px] font-medium">All clear</p></div>}
            </div>
          </div>
          <div><Lbl>Active Projects</Lbl>
            <div className="space-y-1.5 mt-2">{activeClients.map((c:any)=>{const si=PROJECT_STAGES.indexOf(c.stage);const ow=team.find((t:any)=>t.id===c.assignedAdminId);return <div key={c.id} className="flex flex-col gap-1.5 py-2.5 px-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border-card)] shadow-sm hover:shadow transition-shadow">
              <div className="flex justify-between items-center"><span className="text-[12px] font-bold truncate text-[var(--color-card-text)]">{c.name}</span><div className="flex items-center gap-2"><span className="text-[10px] font-semibold text-[var(--color-ember)]">{c.stage}</span>{ow && <Av id={ow.id} name={ow.name} sz={16}/>}</div></div>
              <div className="flex gap-1 w-full mt-1">{PROJECT_STAGES.map((_:any,i:number)=><div key={i} className={`h-1.5 flex-1 rounded-full ${i<=si?"bg-[var(--color-ember)] shadow-[0_0_5px_var(--color-ember)]/30":"bg-[var(--color-border)]"}`}/>)}</div>
            </div>})}</div>
          </div>
          <div><Lbl>Active Products</Lbl>
            <div className="space-y-1.5 mt-2">
              {crm.products?.filter((p:any) => p.stage === "Post-Demo Dev" || p.stage === "Distribution").map((p:any) => {
                const stages = ["Ideation", "Dev", "Demo", "Post-Demo Dev", "Distribution"];
                const si = stages.indexOf(p.stage);
                const ow = team.find((t:any)=>t.id===p.leadId);
                return <div key={p.id} className="flex flex-col gap-1.5 py-2.5 px-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border-card)] shadow-sm hover:shadow transition-shadow">
                  <div className="flex justify-between items-center"><span className="text-[12px] font-bold truncate text-[var(--color-card-text)]">{p.name}</span><div className="flex items-center gap-2"><span className="text-[10px] font-semibold text-[var(--color-info)]">{p.stage}</span>{ow && <Av id={ow.id} name={ow.name} sz={16}/>}</div></div>
                  <div className="flex gap-1 w-full mt-1">{stages.map((_:any,i:number)=><div key={i} className={`h-1.5 flex-1 rounded-full ${i<=si?"bg-[var(--color-info)] shadow-[0_0_5px_var(--color-info)]/30":"bg-[var(--color-border)]"}`}/>)}</div>
                </div>
              })}
              {crm.products?.filter((p:any) => p.stage === "Post-Demo Dev" || p.stage === "Distribution").length === 0 && (
                <div className="text-[11px] text-[var(--color-text-faint)] py-2 text-center border border-dashed border-[var(--color-border-card)] rounded-lg">No active products</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ 2. PROJECTS ═══════════════════════ */
function Projects({crm,sel,setSel,showAdd,close,clients,setConfirm}:any) {
  const [drag,setDrag]=useState<number|null>(null);
  const drop=(stage:ClientStage)=>{if(drag!==null){crm.updateClientStage(drag,stage);setDrag(null);}};
  const grouped:Record<string,any[]>={};
  PROJECT_STAGES.forEach(s=>grouped[s]=[]);
  clients.forEach((c:any)=>{if(grouped[c.stage])grouped[c.stage].push(c);else grouped["Requirement"].push(c);});

  return (
    <div className="space-y-4 max-w-[1400px]">
      {showAdd&&<QuickAdd title="New Project" fields={[{k:"name",l:"Client",p:"Client name"},{k:"project",l:"Project",p:"Project name"},{k:"revenue",l:"Revenue (₹)",p:"0",t:"number"},{k:"stage",l:"Stage",t:"select",o:PROJECT_STAGES},{k:"assignedAdminId",l:"Owner",t:"select",o:crm.team.map((t:any)=>({v:t.id,l:t.name}))}]} onSubmit={(d:any)=>{crm.addNewClient({name:d.name,project:d.project,location:"India",category:["Requirement","Model","Demo 1"].includes(d.stage)?"Potential":"Ongoing",stage:d.stage,revenue:Number(d.revenue)||0,assignedAdminId:d.assignedAdminId||"a1"});close();}} onClose={close}/>}
      <div className="flex gap-3 overflow-x-auto pb-4 crm-scroll" style={{minHeight:"calc(100vh - 120px)"}}>
        {PROJECT_STAGES.map(stage=>{
          const cards=grouped[stage]||[];
          return(
            <div key={stage} onDrop={e=>{e.preventDefault();drop(stage);}} onDragOver={e=>{e.preventDefault();e.dataTransfer.dropEffect="move";}}
              className={`flex-shrink-0 w-[240px] rounded-2xl p-2.5 border-2 transition-colors ${drag!==null?"border-[var(--color-ember)]/20 bg-[var(--color-ember-soft)]/20":"border-[var(--color-border-card)]/50 bg-[var(--color-surface)] shadow-sm"}`}>
              <div className="flex items-center justify-between mb-3 px-1">
                <h4 className="text-[12px] font-bold text-[var(--color-text-secondary)]">{stage}</h4>
                <span className="text-[10px] font-bold text-[var(--color-text-muted)] bg-[var(--color-border)] px-2 py-0.5 rounded-full">{cards.length}</span>
              </div>
              <div className="space-y-2.5">
                {cards.map((c:any)=>{const ow=crm.team.find((t:any)=>t.id===c.assignedAdminId);return(
                  <div key={c.id} draggable onDragStart={e=>{setDrag(c.id);e.dataTransfer.effectAllowed="move";}} onClick={()=>setSel(c.id)}
                    className={`bg-[var(--color-surface)] border rounded-xl p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${sel===c.id?"border-[var(--color-ember)] ring-2 ring-[var(--color-ember)]/20 shadow-lg scale-[1.02]":"border-[var(--color-border-card)] shadow-sm"} ${drag===c.id?"opacity-40 scale-95":""}`}>
                    <div className="flex items-start justify-between mb-1 gap-2">
                      <span className="text-[12px] font-bold text-[var(--color-card-text)] leading-tight line-clamp-2">{c.name}</span>
                      <X onClick={()=>setConfirm({title:"Delete Project",desc:"Are you sure you want to delete this project everywhere?",action:()=>crm.deleteClient(c.id)})}/>
                    </div>
                    <p className="text-[10px] text-[var(--color-card-text-muted)] line-clamp-1 mb-3 font-medium">{c.project}</p>
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-[var(--color-border-card)]/50">
                      {c.revenue>0?<span className="text-[11px] font-black text-[var(--color-ember)]">{fmt(c.revenue)}</span>:<span/>}
                      <Av id={c.assignedAdminId} name={ow?.name||"?"} sz={20}/>
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
function ProjDrawer({crm,id,onClose,setConfirm}:any){
  const c=crm.clients.find((x:any)=>x.id===id);if(!c)return null;
  const si=PROJECT_STAGES.indexOf(c.stage);
  const [ed,setEd]=useState<string|null>(null);const [ev,setEv]=useState("");
  
  // New Release Form State
  const [showReleaseForm, setShowReleaseForm] = useState(false);
  const [relTitle, setRelTitle] = useState("");
  const [relVer, setRelVer] = useState("1.0");
  const [relVideo, setRelVideo] = useState("");
  const [relNotes, setRelNotes] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const save=(f:string)=>{crm.updateClient(id,{[f]:ev});setEd(null);};
  const EF=({l,v,f}:{l:string;v:string;f:string})=>(
    <div className="flex items-center justify-between py-1.5 border-b border-[var(--color-border-card)]/30"><Lbl>{l}</Lbl>{ed===f?<input autoFocus value={ev} onChange={e=>setEv(e.target.value)} onBlur={()=>save(f)} onKeyDown={e=>e.key==="Enter"&&save(f)} className="!bg-[var(--color-bg)] !text-[var(--color-text-primary)] border border-[var(--color-ember)] shadow-[0_0_5px_var(--color-ember-soft)] rounded-md px-2 py-1 text-[11px] w-40 text-right outline-none font-medium"/>:<span onClick={()=>{setEd(f);setEv(v);}} className="text-[11px] font-bold text-[var(--color-card-text)] cursor-pointer hover:text-[var(--color-ember)] border-b border-dashed border-transparent hover:border-[var(--color-ember)] transition-colors">{v||"—"}</span>}</div>
  );

  const saveN=(f:string)=>{crm.updateClient(id,{[f]:Number(ev)||0});setEd(null);};
  const ENF=({l,v,f}:{l:string;v:number;f:string})=>(
    <div className="flex items-center justify-between py-1.5 border-b border-[var(--color-border-card)]/30"><Lbl>{l}</Lbl>{ed===f?<input autoFocus type="number" value={ev} onChange={e=>setEv(e.target.value)} onBlur={()=>saveN(f)} onKeyDown={e=>e.key==="Enter"&&saveN(f)} className="!bg-[var(--color-bg)] !text-[var(--color-text-primary)] border border-[var(--color-ember)] shadow-[0_0_5px_var(--color-ember-soft)] rounded-md px-2 py-1 text-[11px] w-24 text-right outline-none font-medium"/>:<span onClick={()=>{setEd(f);setEv(v.toString());}} className="text-[12px] font-black text-[var(--color-card-text)] cursor-pointer hover:text-[var(--color-ember)] border-b border-dashed border-transparent hover:border-[var(--color-ember)] transition-colors">{fmt(v)}</span>}</div>
  );

  const submitRelease = () => {
    if(!relTitle) return;
    const notesArray = relNotes.split('\n').map(s=>s.trim()).filter(s=>s);
    crm.addRelease({ clientId: id, title: relTitle, version: relVer, videoUrl: relVideo, whatWasImproved: notesArray });
    setShowReleaseForm(false);
    setRelTitle(""); setRelVer("1.0"); setRelVideo(""); setRelNotes("");
  };

  const handleVideoFile = (file: File) => {
    if (file && file.type.startsWith("video/")) {
      const url = URL.createObjectURL(file);
      setRelVideo(url);
    } else {
      alert("Please select a valid video file.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleVideoFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[18px] font-black tracking-tight text-[var(--color-card-text)]">{c.name}</h3>
        <X onClick={onClose}/>
      </div>
      
      <div className="bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border-card)] shadow-sm">
        <div className="flex gap-1 mb-3">{PROJECT_STAGES.map((_:any,i:number)=><div key={i} className={`h-2 flex-1 rounded-full ${i<=si?"bg-[var(--color-ember)] shadow-[0_0_5px_var(--color-ember-soft)]":"bg-[var(--color-border)]"}`}/>)}</div>
        <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-[var(--color-text-muted)] bg-[var(--color-surface-muted)] px-2 py-1 rounded-md">{si+1}/{PROJECT_STAGES.length}</span><select value={c.stage} onChange={e=>crm.updateClientStage(id,e.target.value)} className="!bg-[var(--color-bg)] !text-[var(--color-text-primary)] border border-[var(--color-border-card)] font-bold shadow-sm rounded-md px-2 py-1 text-[11px] outline-none cursor-pointer hover:border-[var(--color-ember)] transition-colors">{PROJECT_STAGES.map(s=><option key={s}>{s}</option>)}</select></div>
      </div>

      <div className="bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border-card)] shadow-sm space-y-1">
        <EF l="Project" v={c.project} f="project"/>
        <EF l="Location" v={c.location} f="location"/>
        <div className="flex items-center justify-between py-1.5 border-b border-[var(--color-border-card)]/30"><Lbl>Owner</Lbl><select value={c.assignedAdminId||""} onChange={e=>crm.updateClientAdmin(id,e.target.value)} className="!bg-[var(--color-bg)] !text-[var(--color-text-primary)] font-bold border border-[var(--color-border-card)] shadow-sm rounded-md px-2 py-1 text-[11px] outline-none cursor-pointer">{crm.team.map((t:any)=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
        <div className="flex items-center justify-between py-1.5"><Lbl>Health</Lbl><span className="text-[12px] font-black text-[var(--color-ok)]">{c.health}%</span></div>
      </div>

      {crm.userProfile?.category === "admin" && (
        <div className="bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border-card)] shadow-sm space-y-1 mt-6">
          <Lbl>Financials</Lbl>
          <div className="mt-3">
            <ENF l="Total Revenue" v={c.revenue||0} f="revenue" />
            <ENF l="Amount Paid" v={c.amountPaid||0} f="amountPaid" />
            <ENF l="Margin" v={c.margin||0} f="margin" />
            <div className="flex items-center justify-between py-1.5"><Lbl>Amount Left</Lbl><span className="text-[12px] font-black text-[var(--color-ember)]">{fmt((c.revenue||0) - (c.amountPaid||0))}</span></div>
          </div>
        </div>
      )}

      {/* Demo Releases Section */}
      <div className="bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border-card)] shadow-sm">
        <div className="flex items-center justify-between mb-3"><Lbl>Demos & Releases</Lbl>
          <button onClick={()=>setShowReleaseForm(!showReleaseForm)} className="text-[9px] font-bold bg-[var(--color-ember)] text-white px-2 py-1 rounded hover:bg-[var(--color-ember-hover)] transition-colors">
            {showReleaseForm ? "Cancel" : "+ New Demo"}
          </button>
        </div>
        
        {showReleaseForm && (
          <div 
            onDragOver={e=>e.preventDefault()} 
            onDrop={handleDrop}
            className="bg-[var(--color-surface-muted)] rounded-lg p-3 border-2 border-dashed border-[var(--color-border-card)] mb-4 space-y-3 transition-colors hover:border-[var(--color-ember)]/50"
          >
            <input value={relTitle} onChange={e=>setRelTitle(e.target.value)} placeholder="Demo Title (e.g. Sprint 1)" className="w-full !bg-[var(--color-bg)] !text-[var(--color-text-primary)] border border-[var(--color-border-card)] rounded-md px-2.5 py-1.5 text-[11px] font-medium outline-none focus:!border-[var(--color-ember)] shadow-sm"/>
            <div className="flex gap-2">
              <input value={relVer} onChange={e=>setRelVer(e.target.value)} placeholder="Version" className="w-1/4 !bg-[var(--color-bg)] !text-[var(--color-text-primary)] border border-[var(--color-border-card)] rounded-md px-2.5 py-1.5 text-[11px] font-medium outline-none focus:!border-[var(--color-ember)] shadow-sm"/>
              
              <div className="flex-1 flex gap-2 items-center bg-[var(--color-surface)] border border-[var(--color-border-card)] rounded-md px-2 shadow-sm focus-within:border-[var(--color-ember)] transition-colors">
                <input value={relVideo} onChange={e=>setRelVideo(e.target.value)} placeholder="Paste Video URL or Drop File ➡️" className="w-full bg-transparent text-[11px] text-[var(--color-card-text)] font-medium outline-none py-1.5"/>
                <input type="file" accept="video/*" ref={fileInputRef} onChange={e => { if(e.target.files && e.target.files[0]) handleVideoFile(e.target.files[0]); }} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} title="Upload Video" className="text-[12px] bg-[var(--color-surface-muted)] px-2 py-0.5 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-card-text)] border border-[var(--color-border-subtle)]">📁</button>
              </div>
            </div>
            
            {relVideo && relVideo.startsWith("blob:") && (
              <div className="flex items-center gap-2 bg-[var(--color-ok)]/10 text-[var(--color-ok)] border border-[var(--color-ok)]/20 px-2 py-1.5 rounded-md text-[10px] font-bold">
                ✓ Local video attached. (Will be wiped if you refresh)
                <button onClick={()=>setRelVideo("")} className="ml-auto text-red-500 hover:underline">Remove</button>
              </div>
            )}

            <textarea value={relNotes} onChange={e=>setRelNotes(e.target.value)} placeholder="Release notes (one per line)..." rows={3} className="w-full !bg-[var(--color-bg)] !text-[var(--color-text-primary)] border border-[var(--color-border-card)] rounded-md px-2.5 py-1.5 text-[11px] font-medium outline-none resize-none focus:!border-[var(--color-ember)] shadow-sm"/>
            <button onClick={submitRelease} className="w-full bg-[var(--color-charcoal)] text-white text-[11px] font-bold py-1.5 rounded-md hover:bg-[var(--color-charcoal-mid)] shadow-md transition-colors">Publish to Portal</button>
          </div>
        )}

        {crm.releases.filter((r:any)=>r.clientId===id).map((r:any)=>(
          <div key={r.id} className="bg-[var(--color-bg-soft)] rounded-lg p-2.5 mb-2 border border-[var(--color-border)] flex items-center justify-between">
            <div><p className="text-[11px] font-bold text-[var(--color-card-text)]">{r.title}</p><p className="text-[9px] text-[var(--color-text-muted)]">v{r.version} · {r.status}</p></div>
            {r.videoUrl && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold border border-red-200">▶ Video</span>}
          </div>
        ))}
      </div>

      <div className="bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border-card)] shadow-sm">
        <Lbl>Feedback Discussions</Lbl>
        <div className="mt-3 space-y-3">
          {crm.comments.filter((m:any)=>m.clientId===id).slice(-5).map((m:any)=>(
            <div key={m.id} className={`p-3 rounded-xl border ${m.role==="client"?"bg-[var(--color-ember-soft)] border-[var(--color-ember)]/30":"bg-[var(--color-bg-soft)] border-[var(--color-border)]"}`}>
              <div className="flex items-baseline gap-2 mb-1.5">
                <span className="text-[10px] font-black text-[var(--color-card-text)]">{m.author}</span> 
                <span className="text-[8px] font-medium text-[var(--color-text-faint)]">{m.timeElapsed}</span>
              </div>
              {m.videoTimestamp !== undefined && (
                <span className="inline-block mb-1.5 text-[9px] font-bold bg-[var(--color-charcoal)] text-white px-2 py-0.5 rounded-full">
                  ⏱ {fmtTime(m.videoTimestamp)}
                </span>
              )}
              <p className="text-[11px] text-[var(--color-card-text)] leading-relaxed font-medium">{m.text}</p>
            </div>
          ))}
          {crm.comments.filter((m:any)=>m.clientId===id).length===0 && <p className="text-[10px] text-[var(--color-text-faint)] text-center py-2">No feedback yet.</p>}
        </div>
      </div>
      
      <div className="border-t border-[var(--color-border-subtle)] pt-4">
        <button onClick={()=>{setConfirm({title:"Delete Project",desc:"Are you sure you want to delete this project everywhere?",action:()=>{crm.deleteClient(id);onClose();}});}} className="text-[10px] font-bold text-[var(--color-bad)] hover:bg-[var(--color-bad-soft)] px-3 py-1.5 rounded-md transition-colors w-full text-left">Delete project...</button>
      </div>
    </div>
  );
}

/* ═══════════════════════ 3. TASKS ═══════════════════════ */
function Tasks({crm,showAdd,close,setConfirm}:any){
  const [drag,setDrag]=useState<string|null>(null);
  const [editId,setEditId]=useState<string|null>(null);
  const [editTitle,setEditTitle]=useState("");
  const drop=(s:TaskStatus)=>{if(drag){crm.updateInternalTask(drag,{status:s});setDrag(null);}};
  return(
    <div className="space-y-4 max-w-[1400px]">
      {showAdd&&<QuickAdd title="New Task" fields={[
        {k:"title",l:"Task",p:"What needs to be done?"},
        {k:"assignedAdminId",l:"Assign to",t:"select",o:crm.team.map((t:any)=>({v:t.id,l:t.name}))},
        {k:"linkId",l:"Related To (optional)",t:"select",o:[
          {v:"",l:"— None —"},
          {v:"lbl_proj",l:"--- Projects ---",d:true},
          ...crm.clients.map((c:any)=>({v:"client_"+c.id,l:c.name})),
          {v:"lbl_prod",l:"--- Products ---",d:true},
          ...(crm.products||[]).map((p:any)=>({v:"product_"+p.id,l:p.name})),
          {v:"lbl_oth",l:"--- Other ---",d:true},
          {v:"lead",l:"Leads"},
          {v:"social",l:"Social"}
        ]}
      ]} onSubmit={(d:any)=>{
        const isClient = d.linkId?.startsWith("client_");
        const isProduct = d.linkId?.startsWith("product_");
        const isLead = d.linkId === "lead";
        const isSocial = d.linkId === "social";
        let finalTitle = d.title;
        if (isLead) finalTitle = "[Lead] " + finalTitle;
        if (isSocial) finalTitle = "[Social] " + finalTitle;
        
        crm.addInternalTask({
          title: finalTitle,
          assignedAdminId: d.assignedAdminId||"a1",
          clientId: isClient ? Number(d.linkId.split("_")[1]) : undefined,
          productId: isProduct ? d.linkId.split("_")[1] : undefined,
          status: "Todo" as const
        });
        close();
      }} onClose={close}/>}
      <div className="flex gap-4 overflow-x-auto pb-4 crm-scroll" style={{minHeight:"calc(100vh - 140px)"}}>
        {TASK_COLS.map(col=>{const items=crm.internalTasks.filter((t:any)=>t.status===col.s);return(
          <div key={col.s} onDrop={e=>{e.preventDefault();drop(col.s);}} onDragOver={e=>{e.preventDefault();e.dataTransfer.dropEffect="move";}}
            className={`flex-shrink-0 w-[280px] rounded-2xl p-3 border-2 transition-colors ${drag?"border-[var(--color-ember)]/20 bg-[var(--color-ember-soft)]/20":"border-[var(--color-border-card)]/50 bg-[var(--color-surface)] shadow-sm"}`}>
            <div className="flex items-center justify-between mb-4 px-1"><h4 className="text-[12px] font-bold text-[var(--color-text-secondary)]">{col.l}</h4><span className="text-[10px] font-bold text-[var(--color-text-muted)] bg-[var(--color-border)] px-2 py-0.5 rounded-full">{items.length}</span></div>
            <div className="space-y-3">{items.map((t:any)=>{
              const ow=crm.team.find((m:any)=>m.id===t.assignedAdminId);
              const pj=crm.clients.find((c:any)=>c.id===t.clientId);
              const pr=crm.products?.find((p:any)=>p.id===t.productId);
              return(
              <div key={t.id} draggable onDragStart={e=>{setDrag(t.id);e.dataTransfer.effectAllowed="move";}}
                className={`bg-[var(--color-surface)] border rounded-xl p-3.5 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group ${drag===t.id?"opacity-40 scale-95":"border-[var(--color-border-card)] shadow-sm"}`}>
                {editId===t.id?(
                  <input autoFocus value={editTitle} onChange={e=>setEditTitle(e.target.value)} onBlur={()=>{crm.updateInternalTask(t.id,{title:editTitle});setEditId(null);}} onKeyDown={e=>{if(e.key==="Enter"){crm.updateInternalTask(t.id,{title:editTitle});setEditId(null);}}} className="w-full text-[12px] !bg-[var(--color-bg)] !text-[var(--color-text-primary)] border border-[var(--color-ember)] shadow-sm outline-none rounded p-1 font-medium mb-2"/>
                ):(
                  <p onDoubleClick={()=>{setEditId(t.id);setEditTitle(t.title);}} className="text-[12px] font-bold text-[var(--color-card-text)] leading-snug cursor-text mb-2 line-clamp-3">{t.title}</p>
                )}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-[var(--color-border-card)]/50">
                  <span className="text-[9px] font-bold text-[var(--color-card-text-muted)] bg-[var(--color-surface-muted)] px-1.5 py-0.5 rounded truncate max-w-[120px]">{pj?.name||pr?.name||"Internal"}</span>
                  <div className="flex items-center gap-2">
                    <select value={t.assignedAdminId} onChange={e=>{e.stopPropagation();crm.updateInternalTask(t.id,{assignedAdminId:e.target.value});}} className="w-5 h-5 opacity-0 absolute cursor-pointer" title="Reassign" style={{zIndex:2}}/>
                    <Av id={t.assignedAdminId} name={ow?.name||"?"} sz={20}/>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity"><X onClick={()=>setConfirm({title:"Delete Task",desc:"Are you sure you want to delete this task everywhere?",action:()=>crm.deleteInternalTask(t.id)})}/></span>
                  </div>
                </div>
              </div>
            )})}</div>
          </div>
        )})}
      </div>
    </div>
  );
}

/* ═══════════════════════ 4. SOCIAL ═══════════════════════ */
function Social({crm,showAdd,close,setConfirm}:any){
  const sm:SocialMediaItem[]=(crm as any).socialMedia||[];
  const setSM=(crm as any).setSocialMedia;
  const [drag,setDrag]=useState<string|null>(null);
  const [editId,setEditId]=useState<string|null>(null);
  const [editDesc,setEditDesc]=useState("");
  const icon:Record<string,string>={Instagram:"📸",Twitter:"𝕏",LinkedIn:"in",Reddit:"🔴",YouTube:"▶"};
  const moveTo=(status:SocialStatus)=>{if(drag){crm.updateSocialMedia(drag, { status });setDrag(null);}};
  const del=(id:string)=>{setConfirm({title:"Delete Post",desc:"Are you sure you want to delete this social post everywhere?",action:()=>crm.deleteSocialMedia(id)});};
  const saveEdit=(id:string)=>{crm.updateSocialMedia(id, { description: editDesc });setEditId(null);};

  return(
    <div className="space-y-4 max-w-[1400px]">
      {showAdd&&<QuickAdd title="New Content" fields={[
        {k:"platform",l:"Platform",t:"select",o:["Instagram","Twitter","LinkedIn","Reddit","YouTube"]},
        {k:"contentType",l:"Type",t:"select",o:["Reel","Post","Story","Tweet","Blog","Thread"]},
        {k:"description",l:"About",p:"What is this content about?"},
        {k:"deadlineDays",l:"Deadline (in days)",p:"e.g. 5",t:"number"}
      ]} onSubmit={(d:any)=>{
        const id="sm"+Date.now();
        const days = Number(d.deadlineDays) || 0;
        const now = new Date();
        now.setDate(now.getDate() + days);
        const scheduledDate = now.toISOString().split("T")[0];
        crm.addSocialMedia({
          id,
          platform:d.platform||"Instagram",
          contentType:d.contentType||"Post",
          description:d.description||"New content",
          status:"Idea and Create" as SocialStatus,
          assignedAdminId:"a4",
          scheduledDate:scheduledDate,
          createdAt:new Date().toISOString().split("T")[0]
        } as SocialMediaItem);
        close();
      }} onClose={close}/>}
      <div className="flex gap-3 overflow-x-auto pb-4 crm-scroll" style={{minHeight:"calc(100vh - 140px)"}}>
        {SOCIAL_COLS.map(col=>{const items=sm.filter(i=>i.status===col.s);return(
          <div key={col.s} onDrop={e=>{e.preventDefault();moveTo(col.s);}} onDragOver={e=>{e.preventDefault();e.dataTransfer.dropEffect="move";}}
            className={`flex-1 min-w-[240px] rounded-2xl p-2.5 border-2 transition-colors ${drag?"border-[var(--color-ember)]/20 bg-[var(--color-ember-soft)]/20":"border-[var(--color-border-card)]/50 bg-[var(--color-surface)] shadow-sm"}`}>
            <div className="flex items-center justify-between mb-3 px-1"><h4 className="text-[12px] font-bold text-[var(--color-text-secondary)]">{col.l}</h4><span className="text-[10px] font-bold text-[var(--color-text-muted)] bg-[var(--color-border)] px-2 py-0.5 rounded-full">{items.length}</span></div>
            <div className="space-y-2.5">{items.map(item=>{
              const daysLeft = item.scheduledDate ? Math.ceil((new Date(item.scheduledDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0;
              const daysText = daysLeft > 0 ? `In ${daysLeft}d` : daysLeft === 0 ? "Today" : `${Math.abs(daysLeft)}d overdue`;
              const daysColor = daysLeft > 2 ? "text-[var(--color-info)] bg-[var(--color-info)]/10" : daysLeft >= 0 ? "text-[var(--color-warn)] bg-[var(--color-warn)]/10" : "text-[var(--color-bad)] bg-[var(--color-bad)]/10";
              return (
              <div key={item.id} draggable onDragStart={e=>{setDrag(item.id);e.dataTransfer.effectAllowed="move";}}
                className={`bg-[var(--color-surface)] border rounded-xl p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group ${drag===item.id?"opacity-40 scale-95":"border-[var(--color-border-card)] shadow-sm"}`}>
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-[var(--color-border-card)]/50">
                  <div className="flex items-center gap-1.5"><span className="text-[12px]">{icon[item.platform]||"•"}</span><span className="text-[9px] font-bold text-[var(--color-card-text-muted)] uppercase tracking-wider">{item.platform} · {item.contentType}</span></div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${daysColor}`}>{daysText}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity"><X onClick={()=>del(item.id)}/></span>
                  </div>
                </div>
                {editId===item.id?(
                  <textarea autoFocus value={editDesc} onChange={e=>setEditDesc(e.target.value)} onBlur={()=>saveEdit(item.id)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();saveEdit(item.id);}}} className="w-full text-[11px] !bg-[var(--color-bg)] !text-[var(--color-text-primary)] border border-[var(--color-ember)] shadow-sm outline-none rounded p-1 font-medium resize-none" rows={2}/>
                ):(
                  <p onDoubleClick={()=>{setEditId(item.id);setEditDesc(item.description);}} className="text-[11px] text-[var(--color-card-text)] leading-snug font-medium cursor-text">{item.description}</p>

                )}
                {item.clientTag&&<span className="inline-block mt-2 text-[9px] font-bold px-2 py-0.5 bg-[var(--color-surface-muted)] rounded-md text-[var(--color-card-text-secondary)]">{item.clientTag}</span>}
              </div>
            )})}</div>
          </div>
        );})}
      </div>
    </div>
  );
}

/* ═══════════════════════ 5. LEADS ═══════════════════════ */
function Leads({crm,sel,setSel,showAdd,close,setConfirm}:any){
  const [editId,setEditId]=useState<string|null>(null);
  const [editField,setEditField]=useState<string|null>(null);
  const [editVal,setEditVal]=useState("");
  const fileInputRef=useRef<HTMLInputElement>(null);

  const saveLead=(id:string,field:string)=>{crm.updateLead(id,{[field]:field==="estimatedValue"?Number(editVal):editVal});setEditId(null);setEditField(null);};
  const funnel=[{m:["Lead"],l:"Pipeline"},{m:["Contacted"],l:"Contacted"},{m:["Responded","Requirements"],l:"In Talk"},{m:["Demo","Quoted"],l:"Quoted"}];

  const downloadTemplate=()=>{
    const ws=XLSX.utils.json_to_sheet([{
      "Comapny_Name": "Example Corp",
      "est-value": 50000,
      "company_info": "Tech startup",
      "needs_identified": "Website redesign",
      "Contacted_via": "LinkedIn",
      "Person_Contacted": "John Doe",
      "status": "Lead",
      "owner": "a3"
    }]);
    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,"Leads Template");
    XLSX.writeFile(wb,"Leads_Import_Template.xlsx");
  };

  const handleFileUpload=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=(evt)=>{
      const bstr=evt.target?.result;
      const wb=XLSX.read(bstr,{type:"binary"});
      const wsname=wb.SheetNames[0];
      const ws=wb.Sheets[wsname];
      const data=XLSX.utils.sheet_to_json(ws);
      data.forEach((row:any)=>{
        const cn=row["Comapny_Name"]||row["companyName"]||row["Company Name"];
        if(cn){
          let assignedAdmin = row["owner"] || row["Owner"];
          // Optional: if they use a name instead of an ID, we could map it, but we'll try ID first
          const foundAdmin = crm.team.find((t:any)=>t.name.toLowerCase()===String(assignedAdmin).toLowerCase());
          if (foundAdmin) assignedAdmin = foundAdmin.id;

          crm.addNewLead({
            companyName: cn,
            estimatedValue: Number(row["est-value"]||row["Estimated Value"])||0,
            companyInfo: row["company_info"]||"",
            projectDescription: row["needs_identified"]||row["Project Description"]||"",
            source: row["Contacted_via"]||row["Source"]||"Excel Import",
            personContacted: row["Person_Contacted"]||"",
            status: row["status"]||row["Status"]||"Lead",
            assignedAdminId: assignedAdmin||crm.currentAdminId||"a3",
            sourcedById: crm.currentAdminId||"a3",
            engagementScore: 10
          });
        }
      });
    };
    reader.readAsBinaryString(file);
    if(fileInputRef.current)fileInputRef.current.value="";
  };

  const EditCell=({lid,field,value,w,t="text"}:{lid:string;field:string;value:string;w?:string;t?:string})=>(
    editId===lid&&editField===field?(
      <input autoFocus type={t} value={editVal} onChange={e=>setEditVal(e.target.value)} onBlur={()=>saveLead(lid,field)} onKeyDown={e=>e.key==="Enter"&&saveLead(lid,field)} className={`!bg-[var(--color-bg)] !text-[var(--color-text-primary)] border border-[var(--color-ember)] shadow-[0_0_5px_var(--color-ember-soft)] rounded-md px-2 py-1 text-[11px] font-medium outline-none ${w||"w-full"}`}/>
    ):(
      <span onDoubleClick={()=>{setEditId(lid);setEditField(field);setEditVal(value);}} className="cursor-text hover:text-[var(--color-ember)] border-b border-dashed border-transparent hover:border-[var(--color-ember)] transition-colors">{value}</span>
    )
  );

  return(
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 w-full grid grid-cols-2 md:grid-cols-4 gap-3">{funnel.map(f=>{const c=crm.leads.filter((l:any)=>f.m.includes(l.status)).length;return <div key={f.l} className="bg-[var(--color-surface)] border border-[var(--color-border-card)] shadow-sm rounded-xl p-3 md:p-4 text-center"><p className="text-xl md:text-2xl font-black text-[var(--color-card-text)] mb-1">{c}</p><Lbl>{f.l}</Lbl></div>;})}</div>
        <div className="flex flex-col items-end gap-2 shrink-0 w-full md:w-auto">
          <button onClick={downloadTemplate} className="text-[11px] font-bold text-[var(--color-text-muted)] hover:text-[var(--color-card-text)] transition-colors">⬇️ Download Template</button>
          <div className="relative">
            <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} ref={fileInputRef} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
            <button className="bg-[var(--color-surface)] border border-[var(--color-border-card)] text-[var(--color-card-text)] text-[12px] font-bold px-4 py-2 rounded-lg shadow-sm hover:border-[var(--color-ember)] transition-all">⬆️ Import Excel</button>
          </div>
        </div>
      </div>
      {showAdd&&<QuickAdd title="New Lead" fields={[
        {k:"companyName",l:"Company",p:"Company name"},
        {k:"companyInfo",l:"Company Info",p:"Details about the company"},
        {k:"projectDescription",l:"Need",p:"What do they need?"},
        {k:"personContacted",l:"Person Contacted",p:"Name of contact"},
        {k:"source",l:"Contacted Via",p:"e.g., LinkedIn, Email"},
        {k:"estimatedValue",l:"Value (₹)",p:"0",t:"number"},
        {k:"assignedAdminId",l:"Owner",t:"select",o:crm.team.map((t:any)=>({v:t.id,l:t.name}))}
      ]} onSubmit={(d:any)=>{
        crm.addNewLead({
          companyName:d.companyName,
          companyInfo:d.companyInfo||"",
          personContacted:d.personContacted||"",
          source:d.source||"LinkedIn",
          projectDescription:d.projectDescription,
          status:"Lead" as const,
          estimatedValue:Number(d.estimatedValue)||0,
          assignedAdminId:d.assignedAdminId||crm.currentAdminId||"a3",
          sourcedById:crm.currentAdminId||"a3",
          engagementScore:10
        });
        close();
      }} onClose={close}/>}
      
      <div className="bg-[var(--color-surface)] border border-[var(--color-border-card)] shadow-sm rounded-xl overflow-x-auto">
        <table className="w-full text-[11.5px] min-w-[1000px]">
          <thead><tr className="border-b border-[var(--color-border-card)] bg-[var(--color-surface)]"><th className="text-left p-3 font-semibold text-[var(--color-text-secondary)]">Company Name</th><th className="text-left p-3 font-semibold text-[var(--color-text-secondary)]">Company Info</th><th className="text-left p-3 font-semibold text-[var(--color-text-secondary)]">Needs Identified</th><th className="text-left p-3 font-semibold text-[var(--color-text-secondary)]">Contacted Via</th><th className="text-left p-3 font-semibold text-[var(--color-text-secondary)]">Person Contacted</th><th className="text-left p-3 font-semibold text-[var(--color-text-secondary)]">Value</th><th className="text-left p-3 font-semibold text-[var(--color-text-secondary)]">Status</th><th className="text-left p-3 font-semibold text-[var(--color-text-secondary)]">Owner</th><th className="p-3 w-8"></th></tr></thead>
          <tbody>{crm.leads.map((l:any)=>{const ow=crm.team.find((t:any)=>t.id===l.assignedAdminId);return(
            <tr key={l.id} onClick={()=>setSel(l.id)} className={`border-b border-[var(--color-border-card)]/50 cursor-pointer transition-colors ${sel===l.id?"bg-[var(--color-ember-soft)]":"hover:bg-[var(--color-bg-soft)]"}`}>
              <td className="p-3 font-bold text-[var(--color-card-text)]"><EditCell lid={l.id} field="companyName" value={l.companyName}/></td>
              <td className="p-3 text-[var(--color-text-muted)] max-w-[150px] truncate"><EditCell lid={l.id} field="companyInfo" value={l.companyInfo||""}/></td>
              <td className="p-3 text-[var(--color-text-muted)] max-w-[150px] truncate"><EditCell lid={l.id} field="projectDescription" value={l.projectDescription}/></td>
              <td className="p-3 text-[var(--color-text-muted)]"><EditCell lid={l.id} field="source" value={l.source}/></td>
              <td className="p-3 text-[var(--color-text-muted)]"><EditCell lid={l.id} field="personContacted" value={l.personContacted||""}/></td>
              <td className="p-3 font-black text-[var(--color-card-text)] text-[12px]"><EditCell lid={l.id} field="estimatedValue" value={l.estimatedValue.toString()} t="number" w="w-24"/></td>
              <td className="p-3"><select value={l.status} onClick={e=>e.stopPropagation()} onChange={e=>{e.stopPropagation();crm.updateLeadStatus(l.id,e.target.value);}} className="!bg-[var(--color-bg)] !text-[var(--color-text-primary)] border border-[var(--color-border-card)] rounded-md px-2 py-1 outline-none cursor-pointer font-semibold shadow-sm">{LEAD_STATUSES.map(s=><option key={s}>{s}</option>)}</select></td>
              <td className="p-3 text-[var(--color-text-secondary)] font-medium flex items-center gap-2"><Av id={l.assignedAdminId} name={ow?.name||"?"} sz={16}/> {ow?.name||"—"}</td>
              <td className="p-3"><X onClick={()=>setConfirm({title:"Delete Lead",desc:"Are you sure you want to delete this lead everywhere?",action:()=>crm.deleteLead(l.id)})}/></td>
            </tr>
          );})}{crm.leads.length===0&&<tr><td colSpan={9} className="p-8 text-center text-[var(--color-text-faint)] font-medium text-[12px]">No leads in pipeline.</td></tr>}</tbody>
        </table>
      </div>
    </div>
  );
}

function LeadDrawer({crm,id,onClose,setConfirm}:any){
  const l=crm.leads.find((x:any)=>x.id===id);if(!l)return null;const [note,setNote]=useState("");
  return(
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-2"><h3 className="text-[18px] font-black text-[var(--color-card-text)]">{l.companyName}</h3><X onClick={onClose}/></div>
      <div className="bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border-card)] shadow-sm space-y-2">
        <p className="text-[12px] font-medium text-[var(--color-text-secondary)] leading-relaxed">{l.projectDescription}</p>
        <div className="flex items-center justify-between py-1.5 border-t border-[var(--color-border-card)]/30 mt-3 pt-3"><Lbl>Status</Lbl><select value={l.status} onChange={e=>crm.updateLeadStatus(id,e.target.value)} className="!bg-[var(--color-bg)] !text-[var(--color-text-primary)] border border-[var(--color-border-card)] font-bold shadow-sm rounded-md px-2 py-1 text-[11px] outline-none">{LEAD_STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
        <div className="flex items-center justify-between py-1.5"><Lbl>Value</Lbl><span className="text-[14px] font-black">{fmt(l.estimatedValue)}</span></div>
        <div className="flex items-center justify-between py-1.5"><Lbl>Calls</Lbl><div className="flex items-center gap-2"><span className="text-[12px] font-bold">{l.callsMade}</span><button onClick={()=>crm.incrementLeadCalls(id)} className="text-[10px] font-bold px-2 py-1 bg-[var(--color-surface-muted)] text-[var(--color-card-text)] rounded hover:bg-[var(--color-ember)] hover:text-white transition-colors">+1</button></div></div>
        <div className="flex items-center justify-between py-1.5"><Lbl>Owner</Lbl><select value={l.assignedAdminId} onChange={e=>crm.updateLead(id,{assignedAdminId:e.target.value})} className="!bg-[var(--color-bg)] !text-[var(--color-text-primary)] font-bold border border-[var(--color-border-card)] shadow-sm rounded-md px-2 py-1 text-[11px] outline-none">{crm.team.map((t:any)=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
      </div>
      <div className="bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border-card)] shadow-sm"><Lbl>Notes</Lbl>
        <div className="space-y-2 mt-3">
          {l.notes.map((n:string,i:number)=><p key={i} className="text-[11px] text-[var(--color-card-text)] font-medium p-2.5 bg-[var(--color-surface-muted)] rounded-lg">{n}</p>)}
        </div>
        <div className="flex gap-2 mt-3"><input value={note} onChange={e=>setNote(e.target.value)} placeholder="Add note..." className="flex-1 !bg-[var(--color-bg)] !text-[var(--color-text-primary)] border border-[var(--color-border-card)] shadow-sm rounded-lg px-3 py-2 text-[11px] font-medium outline-none focus:!border-[var(--color-ember)]" onKeyDown={e=>{if(e.key==="Enter"&&note.trim()){crm.addLeadNote(id,note.trim());setNote("");}}}/><button onClick={()=>{if(note.trim()){crm.addLeadNote(id,note.trim());setNote("");}}} className="px-3 py-2 bg-[var(--color-charcoal)] text-white text-[11px] font-bold rounded-lg shadow-md hover:bg-[var(--color-charcoal-mid)] transition-colors">Add</button></div>
      </div>
      {!["Converted","Lost"].includes(l.status)&&<div className="pt-2 space-y-2">
        <button onClick={()=>{crm.convertLeadToClient(id);onClose();}} className="w-full bg-[var(--color-ok)] text-white text-[12px] font-bold py-2.5 rounded-xl shadow-md hover:opacity-90 transition-opacity">Convert to Project</button>
        <button onClick={()=>{setConfirm({title:"Delete Lead",desc:"Are you sure you want to delete this lead everywhere?",action:()=>{crm.deleteLead(id);onClose();}});}} className="text-[10px] text-center w-full font-bold text-[var(--color-bad)] hover:underline py-2">Delete Lead</button>
      </div>}
    </div>
  );
}

/* ═══════════════════════ 6. SUPPORT ═══════════════════════ */
function Support({crm,sel,setSel,showAdd,close,navigateTo,setConfirm}:any){
  const open=crm.flags.filter((f:any)=>f.status!=="Resolved");const done=crm.flags.filter((f:any)=>f.status==="Resolved");
  const maint=crm.clients.filter((c:any)=>["Maintenance","Delivery"].includes(c.stage));
  const sv=(s:string)=>s==="Critical"?"var(--color-bad)":s==="High"?"var(--color-warn)":"var(--color-text-faint)";
  return(
    <div className="space-y-6 max-w-[800px] mx-auto">
      {maint.length>0&&<div><Lbl>Maintenance Tier</Lbl><div className="flex flex-wrap gap-3 mt-2">{maint.map((c:any)=><div key={c.id} onClick={() => navigateTo("projects", c.id)} className="bg-[var(--color-surface)] border border-[var(--color-border-card)] shadow-sm rounded-xl px-4 py-3 min-w-[200px] cursor-pointer hover:border-[var(--color-ember)] hover:shadow-md transition-all"><p className="text-[12px] font-bold text-[var(--color-card-text)] mb-0.5">{c.name}</p><p className="text-[10px] font-medium text-[var(--color-text-muted)]">{c.project}</p></div>)}</div></div>}
      {showAdd&&<QuickAdd title="Report Issue" fields={[{k:"title",l:"Title",p:"Issue title"},{k:"description",l:"Description",p:"Describe the issue",t:"textarea"},{k:"severity",l:"Severity",t:"select",o:["Low","Medium","High","Critical"]},{k:"clientId",l:"Project",t:"select",o:crm.clients.map((c:any)=>({v:String(c.id),l:c.name}))},{k:"assignedAdminId",l:"Assign",t:"select",o:crm.team.map((t:any)=>({v:t.id,l:t.name}))}]} onSubmit={(d:any)=>{crm.addFlag({clientId:Number(d.clientId)||crm.clients[0]?.id,title:d.title,description:d.description,severity:d.severity||"Medium",assignedAdminId:d.assignedAdminId||"a1"});close();}} onClose={close}/>}
      <div>
        <Lbl>Open Tickets ({open.length})</Lbl>
        <div className="mt-2 space-y-2">
          {open.map((f:any)=>{const cl=crm.clients.find((c:any)=>c.id===f.clientId);return (
            <div key={f.id} onClick={()=>setSel(f.id)} className={`w-full text-left flex items-center gap-3 bg-[var(--color-surface)] border rounded-xl p-3 md:p-4 cursor-pointer transition-all shadow-sm ${sel===f.id?"border-[var(--color-ember)] ring-1 ring-[var(--color-ember)]":"border-[var(--color-border-card)] hover:shadow-md"}`}>
              <span className={`w-3 h-3 rounded-full flex-shrink-0`} style={{backgroundColor:sv(f.severity)}}/>
              <div className="flex-1 min-w-0"><p className="text-[13px] font-bold text-[var(--color-card-text)] truncate">{f.title}</p><p className="text-[10px] font-medium text-[var(--color-text-muted)] mt-0.5">{cl?.name} · {f.status}</p></div>
              <span className="text-[10px] font-bold bg-[var(--color-surface-muted)] text-[var(--color-card-text)] px-2 py-1 rounded-md">{f.severity}</span>
            </div>
          );})}
          {open.length===0&&<p className="text-[12px] font-medium text-[var(--color-text-faint)] py-6 text-center">All clear ✨</p>}
        </div>
      </div>
      {done.length>0&&<div><Lbl>Recently Resolved</Lbl><div className="mt-2 space-y-1">{done.slice(0,5).map((f:any)=><div key={f.id} onClick={() => setSel(f.id)} className="flex items-center gap-3 px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border-card)] rounded-lg shadow-sm cursor-pointer hover:border-[var(--color-ember)] transition-all"><Dot c="bg-[var(--color-ok)] shadow-[0_0_5px_var(--color-ok)]"/><span className="text-[11px] font-medium text-[var(--color-text-muted)] line-through flex-1">{f.title}</span></div>)}</div></div>}
    </div>
  );
}

function FlagDrawer({crm,id,onClose,setConfirm}:any){
  const f=crm.flags.find((x:any)=>x.id===id);if(!f)return null;const cl=crm.clients.find((c:any)=>c.id===f.clientId);const [log,setLog]=useState("");
  const [edT, setEdT]=useState(false); const [vT, setVT]=useState(f.title);
  const [edD, setEdD]=useState(false); const [vD, setVD]=useState(f.description);
  const saveT=()=>{crm.updateFlag(id,{title:vT});setEdT(false);};
  const saveD=()=>{crm.updateFlag(id,{description:vD});setEdD(false);};
  return(
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between mb-2 gap-3">
        {edT?(<input autoFocus value={vT} onChange={e=>setVT(e.target.value)} onBlur={saveT} onKeyDown={e=>e.key==="Enter"&&saveT()} className="flex-1 !bg-[var(--color-bg)] !text-[var(--color-text-primary)] border border-[var(--color-ember)] shadow-[0_0_5px_var(--color-ember-soft)] rounded-md px-2 py-1 text-[16px] font-black outline-none"/>):(
          <h3 onDoubleClick={()=>setEdT(true)} className="text-[18px] font-black text-[var(--color-card-text)] leading-tight cursor-text hover:text-[var(--color-ember)] border-b border-dashed border-transparent hover:border-[var(--color-ember)] transition-colors">{f.title}</h3>
        )}
        <X onClick={onClose}/>
      </div>
      
      {edD?(<textarea autoFocus value={vD} onChange={e=>setVD(e.target.value)} onBlur={saveD} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();saveD();}}} rows={3} className="w-full !bg-[var(--color-bg)] !text-[var(--color-text-primary)] border border-[var(--color-ember)] shadow-[0_0_5px_var(--color-ember-soft)] rounded-md px-3 py-2 text-[12px] font-medium outline-none resize-none"/>):(
        <p onDoubleClick={()=>setEdD(true)} className="text-[12px] font-medium text-[var(--color-text-secondary)] leading-relaxed cursor-text hover:text-[var(--color-card-text)] border border-dashed border-transparent hover:border-[var(--color-border)] rounded p-2 -m-2 transition-colors">{f.description||"Double click to add description..."}</p>
      )}

      <div className="bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border-card)] shadow-sm space-y-1">
        <div className="flex items-center justify-between py-1.5 border-b border-[var(--color-border-card)]/30"><Lbl>Project</Lbl><span className="text-[12px] font-bold">{cl?.name||"—"}</span></div>
        <div className="flex items-center justify-between py-1.5 border-b border-[var(--color-border-card)]/30"><Lbl>Severity</Lbl><select value={f.severity} onChange={e=>crm.updateFlag(id,{severity:e.target.value as FlagSeverity})} className="!bg-[var(--color-bg)] !text-[var(--color-text-primary)] font-bold border border-[var(--color-border-card)] shadow-sm rounded-md px-2 py-1 text-[11px] outline-none">{["Low","Medium","High","Critical"].map(s=><option key={s}>{s}</option>)}</select></div>
        <div className="flex items-center justify-between py-1.5 border-b border-[var(--color-border-card)]/30"><Lbl>Status</Lbl><select value={f.status} onChange={e=>crm.updateFlagStatus(id,e.target.value)} className="!bg-[var(--color-bg)] !text-[var(--color-text-primary)] font-bold border border-[var(--color-border-card)] shadow-sm rounded-md px-2 py-1 text-[11px] outline-none">{(["Open","Investigating","In Dev","Resolved"] as FlagStatus[]).map(s=><option key={s}>{s}</option>)}</select></div>
        <div className="flex items-center justify-between py-1.5"><Lbl>Assigned</Lbl><select value={f.assignedAdminId||""} onChange={e=>crm.assignFlagAdmin(id,e.target.value)} className="!bg-[var(--color-bg)] !text-[var(--color-text-primary)] font-bold border border-[var(--color-border-card)] shadow-sm rounded-md px-2 py-1 text-[11px] outline-none">{crm.team.map((t:any)=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
      </div>
      
      <div className="bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border-card)] shadow-sm"><Lbl>Dev Log</Lbl>
        <div className="space-y-2 mt-3 mb-3">
          {f.sprintLogs.map((l:any)=><div key={l.id} className="p-2.5 rounded-lg bg-[var(--color-surface-muted)]"><div className="flex items-baseline gap-2 mb-1"><span className="text-[10px] font-black text-[var(--color-card-text)]">{l.author}</span><span className="text-[8px] font-medium text-[var(--color-text-faint)]">{l.timestamp}</span></div><p className="text-[11px] text-[var(--color-card-text)] font-medium leading-relaxed">{l.text}</p></div>)}
        </div>
        <div className="flex gap-2"><input value={log} onChange={e=>setLog(e.target.value)} placeholder="Add update..." className="flex-1 !bg-[var(--color-bg)] !text-[var(--color-text-primary)] border border-[var(--color-border-card)] shadow-sm rounded-lg px-3 py-2 text-[11px] font-medium outline-none focus:!border-[var(--color-ember)]" onKeyDown={e=>{if(e.key==="Enter"&&log.trim()){crm.addFlagSprintLog(id,crm.userProfile?.name||"Admin",log.trim());setLog("");}}}/><button onClick={()=>{if(log.trim()){crm.addFlagSprintLog(id,crm.userProfile?.name||"Admin",log.trim());setLog("");}}} className="px-4 py-2 bg-[var(--color-charcoal)] text-white text-[11px] font-bold rounded-lg shadow-md hover:bg-[var(--color-charcoal-mid)] transition-colors">Add</button></div>
      </div>
      <div className="pt-2"><button onClick={()=>{setConfirm({title:"Delete Issue",desc:"Are you sure you want to delete this issue everywhere?",action:()=>{crm.deleteFlag(id);onClose();}});}} className="text-[10px] text-center w-full font-bold text-[var(--color-bad)] hover:bg-[var(--color-bad-soft)] py-2 rounded-md transition-colors">Delete Issue</button></div>
    </div>
  );
}

/* ═══════════════════════ 7. PRODUCTS ═══════════════════════ */
function Products({crm, showAdd, close, setConfirm}:any){
  const sc=(s:string)=>s==="Demo"||s==="Distribution"?"bg-[var(--color-ok)] shadow-[0_0_5px_var(--color-ok)]":s==="Dev"||s==="Post-Demo Dev"?"bg-[var(--color-warn)]":"bg-[var(--color-border)]";
  
  const [editId,setEditId]=useState<string|null>(null);
  const [editField,setEditField]=useState<string|null>(null);
  const [editVal,setEditVal]=useState("");
  
  const saveP=(id:string,field:string)=>{crm.updateProduct(id,{[field]:field==="progress"?Number(editVal):editVal});setEditId(null);setEditField(null);};
  
  const EditP=({pid,field,value,w,t="text",c="text-[12px] font-bold",isLink=false}:{pid:string;field:string;value:string;w?:string;t?:string;c?:string;isLink?:boolean})=>(
    editId===pid&&editField===field?(
      <input autoFocus type={t} value={editVal} onChange={e=>setEditVal(e.target.value)} onBlur={()=>saveP(pid,field)} onKeyDown={e=>e.key==="Enter"&&saveP(pid,field)} className={`!bg-[var(--color-bg)] !text-[var(--color-text-primary)] border border-[var(--color-ember)] shadow-[0_0_5px_var(--color-ember-soft)] rounded px-1.5 py-0.5 outline-none font-medium ${c} ${w||"w-full"}`}/>
    ):(
      <span className={`inline-flex items-center gap-1 max-w-full ${w||""}`}>
        <span onDoubleClick={()=>{setEditId(pid);setEditField(field);setEditVal(value);}} className={`cursor-text hover:text-[var(--color-ember)] border-b border-dashed border-transparent hover:border-[var(--color-ember)] transition-colors inline-block truncate ${c}`} title="Double-click to edit">{value}</span>
        {isLink && value && !value.includes("Add ") && (
          <a href={value.startsWith("http") ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[var(--color-text-secondary)] hover:text-white bg-[var(--color-border)] hover:bg-[var(--color-ember)] px-1.5 py-0.5 rounded transition-colors flex-shrink-0" title="Open in new tab">↗</a>
        )}
      </span>
    )
  );

  return(
    <div className="space-y-4 max-w-[1000px] mx-auto">
      {showAdd&&<QuickAdd title="New Product" fields={[{k:"name",l:"Name",p:"Product name"},{k:"description",l:"Description",p:"Short description"},{k:"stage",l:"Stage",t:"select",o:["Ideation", "Dev", "Demo", "Post-Demo Dev", "Distribution"]},{k:"leadId",l:"Lead",t:"select",o:crm.team.map((t:any)=>({v:t.id,l:t.name}))}]} onSubmit={(d:any)=>{
        const progressMap: Record<string, number> = { "Ideation": 10, "Dev": 30, "Demo": 60, "Post-Demo Dev": 80, "Distribution": 100 };
        crm.addProduct({name:d.name,description:d.description,stage:d.stage||"Ideation",leadId:d.leadId||"a1",progress:progressMap[d.stage||"Ideation"]||10});close();}} onClose={close}/>}
      
      <Lbl>Internal Products Portfolio</Lbl>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
        {crm.products.map((p:any)=>{const ld=crm.team.find((t:any)=>t.id===p.leadId);return(
          <div key={p.id} className="bg-[var(--color-surface)] border border-[var(--color-border-card)] shadow-sm rounded-2xl p-4 md:p-5 hover:shadow-md transition-shadow relative group">
            <button onClick={()=>setConfirm({title:"Delete Product",desc:"Are you sure you want to delete this product everywhere?",action:()=>crm.deleteProduct(p.id)})} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-[var(--color-text-faint)] hover:text-[var(--color-bad)] transition-all">×</button>
            <div className="flex flex-col mb-4 pr-6">
              <EditP pid={p.id} field="name" value={p.name} c="text-[16px] font-black text-[var(--color-card-text)] mb-1"/>
              <EditP pid={p.id} field="description" value={p.description} c="text-[12px] font-medium text-[var(--color-text-secondary)] leading-snug"/>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2"><span className={`w-2.5 h-2.5 rounded-full ${sc(p.stage)}`}/><select value={p.stage} onChange={e=>{
                const newStage = e.target.value;
                const progressMap: Record<string, number> = { "Ideation": 10, "Dev": 30, "Demo": 60, "Post-Demo Dev": 80, "Distribution": 100 };
                crm.updateProduct(p.id,{stage:newStage, progress: progressMap[newStage] || p.progress});
              }} className="!bg-transparent text-[11px] font-bold text-[var(--color-text-secondary)] outline-none cursor-pointer p-0 border-none">{["Ideation", "Dev", "Demo", "Post-Demo Dev", "Distribution"].map(s=><option key={s}>{s}</option>)}</select></div>
              <div className="flex items-center gap-1 font-bold text-[11px] text-[var(--color-ember)]"><EditP pid={p.id} field="progress" value={p.progress.toString()} t="number" w="w-12 text-right"/>%</div>
            </div>
            
            <div className="h-2 bg-[var(--color-surface-deep)] rounded-full overflow-hidden mb-4 border border-[var(--color-border-subtle)]"><div className="h-full bg-gradient-to-r from-[var(--color-ember-soft)] to-[var(--color-ember)] rounded-full transition-all duration-500" style={{width:`${p.progress}%`}}/></div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-[var(--color-border-card)]/50">
              <div className="flex flex-col gap-1.5 w-full sm:w-auto min-w-0">
                <EditP pid={p.id} field="repoLink" value={p.repoLink||"Add repo"} c="text-[10px] font-mono text-[var(--color-text-muted)] hover:text-[var(--color-ember)] bg-[var(--color-surface-muted)] px-1.5 py-0.5 rounded max-w-[200px]" isLink/>
                <EditP pid={p.id} field="sandboxLink" value={p.sandboxLink||"Add url"} c="text-[10px] font-mono text-[var(--color-text-muted)] hover:text-[var(--color-ember)] bg-[var(--color-surface-muted)] px-1.5 py-0.5 rounded max-w-[200px]" isLink/>
              </div>
              <div className="flex items-center gap-2 bg-[var(--color-bg)] px-2 py-1.5 rounded-lg border border-[var(--color-border)] w-full sm:w-auto mt-2 sm:mt-0"><Av id={p.leadId} name={ld?.name||"?"} sz={18}/><select value={p.leadId} onChange={e=>crm.updateProduct(p.id,{leadId:e.target.value})} className="!bg-transparent text-[10px] font-bold text-[var(--color-card-text)] outline-none cursor-pointer p-0 border-none w-full">{crm.team.map((t:any)=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
            </div>
          </div>
        );})}
      </div>
    </div>
  );
}

/* ═══════════════════════ ACCESS MANAGEMENT ═══════════════════════ */
const ALL_TABS = [{id:"dashboard",l:"Dashboard"},{id:"projects",l:"Projects"},{id:"tasks",l:"Tasks"},{id:"social",l:"Social"},{id:"leads",l:"Leads"},{id:"support",l:"Support"},{id:"products",l:"Products"}];

function AccessManagement({crm, clients, setConfirm}:any) {
  const isSuperAdmin = crm.userProfile?.email === "lakshbetala15@gmail.com";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("client");
  const [assignedClientId, setAssignedClientId] = useState<number>(clients[0]?.id || 1);
  const [internTabs, setInternTabs] = useState<string[]>(["dashboard", "projects", "tasks"]);
  const [error, setError] = useState<string|null>(null);

  const [passPrompt, setPassPrompt] = useState<{ title: string, desc: string, action: () => void } | null>(null);
  const [passInput, setPassInput] = useState("");
  const [passError, setPassError] = useState("");

  const toggleTab = (tabId: string) => {
    setInternTabs(prev => prev.includes(tabId) ? prev.filter(t => t !== tabId) : [...prev, tabId]);
  };

  const createUser = () => {
    if (!email || !password || !name) { setError("Please fill all fields"); return; }
    
    setPassPrompt({
      title: "Confirm Password",
      desc: `Please enter your admin password to create this ${role} account.`,
      action: () => {
        crm.addCrmUser({
          id: Date.now().toString(),
          email: email.toLowerCase(),
          password,
          name,
          role: role === "admin" ? "admin" : role === "intern" ? "intern" : "client",
          category: role === "admin" ? "admin" : role === "intern" ? "intern" : "client",
          assignedClientId: role === "client" ? assignedClientId : undefined,
          allowedTabs: role === "intern" ? internTabs : undefined,
          createdBy: crm.userProfile?.email
        });
        setEmail(""); setPassword(""); setName(""); setError(null); setInternTabs(["dashboard", "projects", "tasks"]);
      }
    });
  };
  
  const [editE,setEditE]=useState<string|null>(null);
  const [editF,setEditF]=useState<string|null>(null);
  const [editV,setEditV]=useState("");
  const saveU=(uemail:string,field:string)=>{crm.updateCrmUser(uemail,{[field]:editV});setEditE(null);setEditF(null);};
  
  const EditU=({uemail,field,value,c="font-medium",disabled=false}:{uemail:string;field:string;value:string;c?:string;disabled?:boolean})=>(
    editE===uemail&&editF===field&&!disabled?(
      <input autoFocus value={editV} onChange={e=>setEditV(e.target.value)} onBlur={()=>saveU(uemail,field)} onKeyDown={e=>e.key==="Enter"&&saveU(uemail,field)} className={`!bg-[var(--color-bg)] !text-[var(--color-text-primary)] border border-[var(--color-ember)] shadow-[0_0_5px_var(--color-ember-soft)] rounded px-2 py-0.5 outline-none font-bold text-[11px] w-full`}/>
    ):(
      <span onDoubleClick={()=>{if(!disabled){setEditE(uemail);setEditF(field);setEditV(value);}}} className={`${disabled?"":"cursor-text hover:text-[var(--color-ember)] border-b border-dashed border-transparent hover:border-[var(--color-ember)]"} transition-colors block ${c}`}>{value}</span>
    )
  );

  const inputCls = "w-full mt-1.5 !bg-[var(--color-bg)] !text-[var(--color-text-primary)] border border-[var(--color-border-card)] shadow-sm rounded-lg px-3 py-2 text-[12px] font-medium outline-none focus:!border-[var(--color-ember)] transition-colors !placeholder:text-[var(--color-card-text-muted)]";

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border-card)] rounded-2xl p-6 md:p-8 shadow-sm max-w-2xl">
        <h3 className="text-[16px] font-black text-[var(--color-card-text)] mb-6">Provision New Account</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div><Lbl>Full Name</Lbl><input value={name} onChange={e=>setName(e.target.value)} className={inputCls} placeholder="John Doe"/></div>
          <div><Lbl>Email Address</Lbl><input value={email} onChange={e=>setEmail(e.target.value)} className={inputCls} placeholder="john@example.com"/></div>
          <div><Lbl>Temporary Password</Lbl><input value={password} onChange={e=>setPassword(e.target.value)} type="text" className={inputCls} placeholder="Enter temporary password"/></div>
          <div><Lbl>Access Role</Lbl>
            <select value={role} onChange={e=>setRole(e.target.value)} className={inputCls + " font-bold cursor-pointer"}>
              <option value="client">Client (Restricted to Project)</option>
              <option value="intern">Intern / Employee</option>
              <option value="admin">Admin (Full Access)</option>
            </select>
          </div>
          {role === "client" && (
            <div className="md:col-span-2"><Lbl>Assigned Project (Data Abstraction)</Lbl>
              <select value={assignedClientId} onChange={e=>setAssignedClientId(Number(e.target.value))} className={inputCls + " font-bold cursor-pointer"}>
                {clients.map((c:any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
          {role === "intern" && (
            <div className="md:col-span-2">
              <Lbl>Allowed Tabs (Data Abstraction)</Lbl>
              <div className="flex flex-wrap gap-2">
                {ALL_TABS.map(tab => (
                  <button key={tab.id} onClick={() => toggleTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${internTabs.includes(tab.id) ? "bg-[var(--color-ember)] text-white border-[var(--color-ember)] shadow-[0_0_8px_var(--color-ember-soft)]" : "bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] border-[var(--color-border-card)] hover:border-[var(--color-ember)]/50"}`}>
                    {internTabs.includes(tab.id) ? "✓ " : ""}{tab.l}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        {error && <p className="text-[12px] font-bold text-[var(--color-bad)] mb-4 bg-[var(--color-bad-soft)] p-3 rounded-lg border border-[var(--color-bad)]/20">{error}</p>}
        <button onClick={createUser} className="w-full bg-[var(--color-charcoal)] text-white text-[13px] font-bold px-4 py-3 rounded-xl hover:bg-[var(--color-charcoal-mid)] shadow-md transition-colors">Create User Credentials</button>
      </div>

      <div>
        <Lbl>Active Provisioned Accounts</Lbl>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border-card)] rounded-xl overflow-x-auto shadow-sm mt-2">
          <table className="w-full text-left border-collapse text-[11px] min-w-[800px]">
            <thead><tr className="border-b border-[var(--color-border-card)] bg-[var(--color-surface)]"><th className="p-4 font-bold text-[var(--color-text-secondary)]">User</th><th className="p-4 font-bold text-[var(--color-text-secondary)]">Email</th><th className="p-4 font-bold text-[var(--color-text-secondary)]">Role</th><th className="p-4 font-bold text-[var(--color-text-secondary)]">Restriction / Password</th><th className="p-4 font-bold text-[var(--color-text-secondary)]">Allowed Tabs</th><th className="p-4 font-bold text-[var(--color-text-secondary)]">Created By</th><th className="p-4"></th></tr></thead>
              {crm.crmUsers?.map((u:any) => {
                const isFounder = ["Lakshya", "Mouriyan", "Ankit", "Muskan"].includes(u.name);
                const defaultEmail = u.name === "Lakshya" ? "lakshbetala15@gmail.com" : u.name === "Mouriyan" ? "gandhimouriyan1234@gmail.com" : u.name === "Ankit" ? "monarchankit25@gmail.com" : u.name === "Muskan" ? "muskanabani01@gmail.com" : "";
                const defaultPass = u.name === "Lakshya" ? "admin@001" : isFounder ? "admin@000" : "";
                const displayEmail = u.email || defaultEmail;
                const displayPass = u.password || defaultPass;
                const displayCategory = u.category || (u.role === "admin" ? "admin" : "client");
                const canEdit = displayCategory !== 'admin' || isSuperAdmin;
                return (
                <tr key={u.id || u.email || u.name} className="border-b border-[var(--color-border-card)]/30 hover:bg-[var(--color-bg-soft)] transition-colors">
                  <td className="p-4 text-[var(--color-card-text)]"><EditU uemail={displayEmail} field="name" value={u.name} c="font-bold text-[12px]" disabled={!canEdit}/></td>
                  <td className="p-4 text-[var(--color-text-secondary)] font-medium">{displayEmail}</td>
                  <td className="p-4">
                    {!canEdit ? (
                      <span className="text-[12px] font-bold text-[var(--color-ember)] bg-[var(--color-ember)]/10 px-2 py-1 rounded-md">admin</span>
                    ) : (
                    <select value={displayCategory} onChange={e=>{
                      const newRole = e.target.value;
                      if (displayCategory === 'admin' || newRole === 'admin') {
                        setPassPrompt({
                          title: "Confirm Password",
                          desc: "Please enter your admin password to modify admin privileges.",
                          action: () => crm.updateCrmUser(displayEmail,{role:newRole, category:newRole})
                        });
                      } else {
                        setConfirm({title:"Change Role",desc:"Are you sure you want to change this user's role?",action:()=>crm.updateCrmUser(displayEmail,{role:newRole, category:newRole})});
                      }
                    }} className={`!bg-transparent outline-none cursor-pointer font-bold px-2 py-1 rounded-md ${displayCategory==='admin'?'text-[var(--color-ember)] bg-[var(--color-ember)]/10':displayCategory==='client'?'text-[var(--color-ok)] bg-[var(--color-ok)]/10':'text-[var(--color-info)] bg-[var(--color-info)]/10'}`}>
                      <option value="client">client</option><option value="intern">intern</option><option value="admin">admin</option>
                    </select>
                    )}
                  </td>
                  <td className="p-4 text-[var(--color-text-secondary)] font-medium">
                    {displayCategory === 'client' ? (
                      <div className="flex flex-col gap-1">
                        {!canEdit ? (
                          <span className="text-[11px] font-bold text-[var(--color-card-text)]">{clients.find((c:any)=>c.id===u.assignedClientId)?.name || "—"}</span>
                        ) : (
                          <select value={u.assignedClientId||""} onChange={e=>crm.updateCrmUser(displayEmail,{assignedClientId:Number(e.target.value)})} className="!bg-transparent border-b border-dashed border-[var(--color-border)] outline-none cursor-pointer w-32">
                            {clients.map((c:any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        )}
                        <div className="flex items-center gap-1 text-[9px]"><span className="text-[var(--color-text-faint)]">Pass:</span> <EditU uemail={displayEmail} field="password" value={displayPass} c="text-[var(--color-card-text)]" disabled={!canEdit}/></div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[10px]"><span className="text-[var(--color-text-faint)]">Pass:</span> <EditU uemail={displayEmail} field="password" value={displayPass} c="text-[var(--color-card-text)]" disabled={!canEdit}/></div>
                    )}
                  </td>
                  <td className="p-4">
                    {u.role === 'intern' ? (
                      <div className="flex flex-wrap gap-1">
                        {ALL_TABS.map(tab => {
                          const allowed = (u.allowedTabs || []).includes(tab.id);
                          return <button key={tab.id} onClick={() => {
                            if (!canEdit) return;
                            const current = u.allowedTabs || [];
                            const updated = allowed ? current.filter((t:string) => t !== tab.id) : [...current, tab.id];
                            crm.updateCrmUser(u.email, {allowedTabs: updated});
                          }} className={`px-1.5 py-0.5 rounded text-[8px] font-bold border transition-all ${allowed ? "bg-[var(--color-ember)] text-white border-[var(--color-ember)]" : "bg-[var(--color-surface-muted)] text-[var(--color-text-faint)] border-[var(--color-border)]"} ${canEdit?"":"opacity-80 cursor-default"}`}>
                            {tab.l}
                          </button>;
                        })}
                      </div>
                    ) : u.role === 'admin' ? (
                      <span className="text-[9px] font-bold text-[var(--color-ember)] bg-[var(--color-ember-soft)] px-2 py-0.5 rounded">Full Access</span>
                    ) : (
                      <span className="text-[9px] font-bold text-[var(--color-ok)] bg-[var(--color-ok)]/10 px-2 py-0.5 rounded">Project Only</span>
                    )}
                  </td>
                  <td className="p-4 text-[var(--color-text-secondary)] font-medium text-[10px]">{u.createdBy || 'System'}</td>
                  <td className="p-4 text-right">
                    {canEdit && (
                      <button onClick={()=>{
                        if (u.role === 'admin') {
                          setPassPrompt({
                            title: "Confirm Password",
                            desc: "Please enter your password to revoke this admin account.",
                            action: () => crm.deleteCrmUser(u.email)
                          });
                        } else {
                          setConfirm({title:"Revoke Access",desc:"Are you sure you want to revoke this user's access everywhere?",action:()=>crm.deleteCrmUser(u.email)});
                        }
                      }} className="text-[11px] font-bold text-[var(--color-bad)] hover:bg-[var(--color-bad-soft)] px-3 py-1.5 rounded-md transition-colors">Revoke</button>
                    )}
                  </td>
                </tr>
              )})}
              {(!crm.crmUsers || crm.crmUsers.length === 0) && <tr><td colSpan={7} className="p-8 text-center text-[var(--color-text-faint)] font-medium text-[13px]">No custom accounts provisioned yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {passPrompt && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="bg-[var(--color-surface)] border border-[var(--color-border-card)] p-6 rounded-2xl w-full max-w-[400px] shadow-2xl">
            <h3 className="text-[18px] font-black text-white mb-2">{passPrompt.title}</h3>
            <p className="text-[13px] text-[var(--color-text-secondary)] mb-4 leading-relaxed">{passPrompt.desc}</p>
            <input type="password" value={passInput} onChange={e=>{setPassInput(e.target.value);setPassError("")}} placeholder="Enter your password" className="w-full !bg-[var(--color-bg)] !text-[var(--color-text-primary)] border border-[var(--color-border-card)] shadow-sm rounded-lg px-3 py-2 text-[12px] font-medium outline-none focus:!border-[var(--color-ember)] mb-2" autoFocus/>
            {passError && <p className="text-[11px] font-bold text-[var(--color-bad)] mb-2 bg-[var(--color-bad-soft)] p-2 rounded">{passError}</p>}
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => {setPassPrompt(null);setPassInput("");setPassError("");}} className="px-5 py-2 text-[12px] font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] rounded-lg transition-colors">Cancel</button>
              <button onClick={() => {
                if (passInput === crm.userProfile?.password) {
                  passPrompt.action();
                  setPassPrompt(null);
                  setPassInput("");
                  setPassError("");
                } else {
                  setPassError("Incorrect password");
                }
              }} className="px-5 py-2 text-[12px] font-bold bg-[var(--color-ember)] hover:bg-[var(--color-ember-hover)] text-white rounded-lg transition-colors shadow-md">Confirm</button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}

/* ═══════════════════════ SHARED: QuickAdd form ═══════════════════════ */
function QuickAdd({title,fields,onSubmit,onClose}:{title:string;fields:any[];onSubmit:(d:any)=>void;onClose:()=>void}){
  const [d,setD]=useState<Record<string,any>>(()=>{const init:Record<string,any>={};fields.forEach(f=>{if(f.t==="select"){const o=f.o;if(o?.length)init[f.k]=typeof o[0]==="object"?o[0].v:o[0];}else init[f.k]="";});return init;});
  const set=(k:string,v:any)=>setD(p=>({...p,[k]:v}));
  const cls="w-full !bg-[var(--color-bg)] !text-[var(--color-text-primary)] border border-[var(--color-border-card)] shadow-sm rounded-lg px-3 py-2 text-[12px] font-medium outline-none focus:!border-[var(--color-ember)] !placeholder:text-[var(--color-card-text-muted)]";
  return(
    <div className="bg-[var(--color-surface)] border border-[var(--color-border-card)] shadow-md rounded-2xl p-5 md:p-6 mb-6">
      <div className="flex items-center justify-between mb-4"><h3 className="text-[16px] font-black text-[var(--color-card-text)]">{title}</h3><X onClick={onClose}/></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {fields.map((f:any)=>{
          if(f.t==="select")return <div key={f.k} className={f.k===fields[0]?.k?"md:col-span-2":""}><Lbl>{f.l}</Lbl><select value={d[f.k]??""} onChange={e=>set(f.k,e.target.value)} className={cls+" mt-1 cursor-pointer font-bold"}>{f.o.map((o:any)=>typeof o==="object"?<option key={o.v} value={o.v}>{o.l}</option>:<option key={o}>{o}</option>)}</select></div>;
          if(f.t==="textarea")return <div key={f.k} className="md:col-span-2"><Lbl>{f.l}</Lbl><textarea placeholder={f.p} value={d[f.k]??""} onChange={e=>set(f.k,e.target.value)} rows={3} className={cls+" mt-1 resize-none"}/></div>;
          if(f.t==="date")return <div key={f.k} className={f.k===fields[0]?.k?"md:col-span-2":""}><Lbl>{f.l}</Lbl><input type="date" value={d[f.k]??""} onChange={e=>set(f.k,e.target.value)} className={cls+" mt-1 font-bold"}/></div>;
          return <div key={f.k} className={f.k===fields[0]?.k?"md:col-span-2":""}><Lbl>{f.l}</Lbl><input type={f.t||"text"} placeholder={f.p} value={d[f.k]??""} onChange={e=>set(f.k,e.target.value)} className={`${cls} mt-1`}/></div>;
        })}
      </div>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-[12px] font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] transition-colors">Cancel</button>
        <button onClick={()=>onSubmit(d)} className="bg-[var(--color-charcoal)] text-white text-[12px] font-bold px-6 py-2.5 rounded-xl hover:bg-[var(--color-charcoal-mid)] shadow-md transition-colors">Create {title}</button>
      </div>
    </div>
  );
}
