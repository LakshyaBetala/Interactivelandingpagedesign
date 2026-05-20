"use client";

import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCRM, ClientStage, OutreachStatus, TaskStatus, FlagSeverity, FlagStatus, SocialStatus, SocialPlatform, SocialContentType } from "./CRMContext";

const formatINR = (n: number) => n > 0 ? "₹" + n.toLocaleString("en-IN") : "—";
const PROJECT_STAGES: ClientStage[] = ["Requirement", "Model", "Demo 1", "Converted", "Dev 1", "Demo 2", "Dev Final", "Final Demo", "Delivery", "Maintenance"];
const LEAD_STATUSES: OutreachStatus[] = ["Lead", "Contacted", "Responded", "Requirements", "Demo", "Quoted", "Converted", "Lost"];
const TASK_COLS: { status: TaskStatus; label: string }[] = [{ status: "Todo", label: "To Do" }, { status: "In Progress", label: "In Progress" }, { status: "In Review", label: "Review" }, { status: "Resolved", label: "Done" }];
type Section = "dashboard" | "projects" | "tasks" | "social" | "leads" | "care" | "products";
const personColor: Record<string, string> = { a1: "#FF5A1F", a2: "#0D9488", a3: "#65A30D", a4: "#9333EA" };

export default function AdminDashboard() {
  const crm = useCRM();
  const { clients, team, leads, internalTasks, flags, products, userProfile, isSupabaseOnline, signOut } = crm;
  const [section, setSection] = useState<Section>("dashboard");
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const isIntern = userProfile?.role?.toLowerCase().includes("intern") || false;
  const sections: { id: Section; label: string; icon: string; count?: number }[] = [
    { id: "dashboard", label: "Dashboard", icon: "◉" },
    { id: "projects", label: "Projects", icon: "◫", count: clients.length },
    { id: "tasks", label: "Tasks", icon: "☰", count: internalTasks.filter(t => t.status !== "Resolved").length },
    { id: "social", label: "Social", icon: "◎", count: (crm as any).socialMedia?.length || 0 },
    { id: "leads", label: "Leads", icon: "◈", count: leads.length },
    { id: "care", label: "Support", icon: "⚑", count: flags.filter(f => f.status !== "Resolved").length },
    { id: "products", label: "Products", icon: "△", count: products.length },
  ];

  return (
    <div className="flex h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[200px] flex-shrink-0 bg-[var(--color-bg-raised)] border-r border-[var(--color-border-subtle)] flex flex-col">
        <div className="p-4 pb-2">
          <h1 className="text-[13px] font-bold tracking-tight">almmatix</h1>
          <p className="text-[9px] text-[var(--color-text-faint)] font-mono uppercase tracking-widest mt-0.5">CRM</p>
        </div>
        <nav className="flex-1 px-2 mt-1 space-y-px">
          {sections.map(s => (
            <button key={s.id} onClick={() => { setSection(s.id); setSelectedId(null); setShowAdd(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[12px] transition-all ${
                section === s.id ? "bg-[var(--color-ember)] text-white font-semibold" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-soft)]"
              }`}>
              <span className="text-[11px] opacity-70">{s.icon}</span>
              <span className="flex-1 text-left">{s.label}</span>
              {s.count !== undefined && <span className={`text-[9px] min-w-[18px] text-center px-1 py-px rounded-full ${section === s.id ? "bg-white/20" : "bg-[var(--color-border)] text-[var(--color-text-muted)]"}`}>{s.count}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className={`w-[5px] h-[5px] rounded-full ${isSupabaseOnline ? "bg-[var(--color-ok)]" : "bg-[var(--color-warn)] animate-pulse"}`} />
            <span className="text-[9px] text-[var(--color-text-faint)]">{isSupabaseOnline ? "Connected" : "Offline"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">{userProfile?.name || "Admin"}</span>
            <button onClick={signOut} className="text-[9px] text-[var(--color-text-faint)] hover:text-[var(--color-bad)]">Sign out</button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-11 flex-shrink-0 border-b border-[var(--color-border-subtle)] flex items-center justify-between px-5 bg-[var(--color-bg-raised)]">
          <h2 className="text-[13px] font-semibold">{sections.find(s => s.id === section)?.label}</h2>
          {!["dashboard", "products"].includes(section) && (
            <button onClick={() => setShowAdd(!showAdd)} className="px-2.5 py-1 bg-[var(--color-ember)] text-white text-[10px] font-semibold rounded-md hover:bg-[var(--color-ember-hover)] transition-colors">+ New</button>
          )}
        </header>
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto crm-scroll p-5">
            <AnimatePresence mode="wait">
              <motion.div key={section} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
                {section === "dashboard" && <DashboardView crm={crm} isIntern={isIntern} />}
                {section === "projects" && <ProjectsView crm={crm} isIntern={isIntern} onSelect={setSelectedId} selectedId={selectedId} showAdd={showAdd} onCloseAdd={() => setShowAdd(false)} />}
                {section === "tasks" && <TasksView crm={crm} showAdd={showAdd} onCloseAdd={() => setShowAdd(false)} />}
                {section === "social" && <SocialView crm={crm} showAdd={showAdd} onCloseAdd={() => setShowAdd(false)} />}
                {section === "leads" && <LeadsView crm={crm} onSelect={setSelectedId} selectedId={selectedId} showAdd={showAdd} onCloseAdd={() => setShowAdd(false)} />}
                {section === "care" && <SupportView crm={crm} onSelect={setSelectedId} showAdd={showAdd} onCloseAdd={() => setShowAdd(false)} />}
                {section === "products" && <ProductsView crm={crm} />}
              </motion.div>
            </AnimatePresence>
          </div>
          <AnimatePresence>
            {selectedId !== null && ["projects", "leads", "care"].includes(section) && (
              <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 380, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] as const }} className="flex-shrink-0 border-l border-[var(--color-border-subtle)] bg-[var(--color-bg-raised)] overflow-hidden">
                <div className="w-[380px] h-full overflow-y-auto crm-scroll">
                  {section === "projects" && <ProjectDrawer crm={crm} clientId={selectedId as number} isIntern={isIntern} onClose={() => setSelectedId(null)} />}
                  {section === "leads" && <LeadDrawer crm={crm} leadId={selectedId as string} onClose={() => setSelectedId(null)} />}
                  {section === "care" && <FlagDrawer crm={crm} flagId={selectedId as string} onClose={() => setSelectedId(null)} />}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

/* ========================= DASHBOARD ========================= */
function DashboardView({ crm, isIntern }: any) {
  const { clients, team, leads, internalTasks, flags, comments, activities } = crm;
  const active = clients.filter((c: any) => !["Requirement", "Model"].includes(c.stage)).length;
  const pipeline = clients.reduce((s: number, c: any) => s + c.revenue, 0) + leads.reduce((s: number, l: any) => s + l.estimatedValue, 0);
  const openFlags = flags.filter((f: any) => f.status !== "Resolved").length;
  const pendingTasks = internalTasks.filter((t: any) => t.status !== "Resolved").length;

  return (
    <div className="space-y-5">
      {/* Stats strip */}
      <div className="grid grid-cols-5 gap-2.5">
        {[
          { label: "Active", value: active, accent: "text-[var(--color-ok)]" },
          { label: "Pipeline", value: isIntern ? "—" : formatINR(pipeline), accent: "" },
          { label: "Tasks", value: pendingTasks, accent: "" },
          { label: "Issues", value: openFlags, accent: openFlags > 0 ? "text-[var(--color-warn)]" : "" },
          { label: "Leads", value: leads.length, accent: "" },
        ].map(s => (
          <div key={s.label} className="bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-lg px-3 py-2.5">
            <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--color-text-faint)]">{s.label}</p>
            <p className={`text-lg font-bold mt-0.5 ${s.accent}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Two-column: people + attention */}
      <div className="grid grid-cols-5 gap-4">
        {/* People lanes — left 3 cols */}
        <div className="col-span-3 space-y-2">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-text-faint)] mb-1">Team</h3>
          {team.map((m: any) => {
            const tasks = internalTasks.filter((t: any) => t.assignedAdminId === m.id && t.status !== "Resolved");
            const now = tasks.find((t: any) => t.status === "In Progress");
            const next = tasks.find((t: any) => t.status === "Todo");
            const projects = clients.filter((c: any) => c.assignedAdminId === m.id);
            return (
              <div key={m.id} className="bg-[var(--color-surface)] rounded-xl p-3.5 border border-[var(--color-border-card)]">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: personColor[m.id] || "#78716C" }}>{m.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[12px] font-semibold text-[var(--color-card-text)] leading-none">{m.name}</h4>
                    <p className="text-[9px] text-[var(--color-card-text-muted)] mt-0.5">{projects.length} projects · {tasks.length} tasks</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="bg-white/50 rounded-lg p-2 border border-[var(--color-border-card)]/40">
                    <p className="text-[8px] font-mono uppercase tracking-wider text-[var(--color-ok)] mb-0.5">Now</p>
                    <p className="text-[10px] text-[var(--color-card-text)] leading-snug font-medium truncate">{now?.title || "—"}</p>
                  </div>
                  <div className="bg-white/50 rounded-lg p-2 border border-[var(--color-border-card)]/40">
                    <p className="text-[8px] font-mono uppercase tracking-wider text-[var(--color-info)] mb-0.5">Next</p>
                    <p className="text-[10px] text-[var(--color-card-text)] leading-snug font-medium truncate">{next?.title || "—"}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 2 cols — attention + activity */}
        <div className="col-span-2 space-y-4">
          {/* Attention items */}
          <div>
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-text-faint)] mb-1.5">Needs Attention</h3>
            <div className="space-y-1.5">
              {comments.filter((c: any) => c.role === "client").slice(0, 3).map((c: any) => {
                const cl = clients.find((x: any) => x.id === c.clientId);
                return (
                  <div key={c.id} className="flex items-start gap-2 bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-lg px-3 py-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-warn)] mt-1.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-[var(--color-text-primary)]">{cl?.name}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)] truncate">{c.text}</p>
                    </div>
                    <span className="text-[8px] text-[var(--color-text-faint)] flex-shrink-0 mt-0.5">{c.timeElapsed}</span>
                  </div>
                );
              })}
              {flags.filter((f: any) => f.status === "Open").slice(0, 2).map((f: any) => (
                <div key={f.id} className="flex items-center gap-2 bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-lg px-3 py-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-bad)] flex-shrink-0" />
                  <p className="text-[10px] text-[var(--color-text-secondary)] truncate flex-1">{f.title}</p>
                  <span className="text-[8px] text-[var(--color-text-faint)]">{f.severity}</span>
                </div>
              ))}
              {comments.filter((c: any) => c.role === "client").length === 0 && flags.filter((f: any) => f.status === "Open").length === 0 && (
                <p className="text-[10px] text-[var(--color-text-faint)] py-2">All clear</p>
              )}
            </div>
          </div>

          {/* Projects overview */}
          <div>
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-text-faint)] mb-1.5">Projects</h3>
            <div className="space-y-1">
              {clients.map((c: any) => {
                const si = PROJECT_STAGES.indexOf(c.stage);
                return (
                  <div key={c.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--color-bg-soft)]">
                    <span className="w-5 h-5 rounded bg-[var(--color-surface)] flex items-center justify-center text-[7px] font-bold text-[var(--color-card-text)]">{c.avatar}</span>
                    <span className="text-[10px] font-medium flex-1 truncate">{c.name}</span>
                    <div className="flex gap-px w-16">
                      {PROJECT_STAGES.map((_, i) => <div key={i} className={`h-[3px] flex-1 rounded-full ${i <= si ? "bg-[var(--color-ember)]" : "bg-[var(--color-border)]"}`} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent */}
          <div>
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-text-faint)] mb-1.5">Activity</h3>
            {activities.slice(0, 4).map((a: any) => (
              <div key={a.id} className="flex items-center gap-2 py-1">
                <span className={`w-1 h-1 rounded-full ${a.type === "milestone" ? "bg-[var(--color-ok)]" : a.type === "alert" ? "bg-[var(--color-warn)]" : "bg-[var(--color-text-faint)]"}`} />
                <span className="text-[10px] text-[var(--color-text-muted)] flex-1 truncate">{a.action}</span>
                <span className="text-[8px] text-[var(--color-text-faint)]">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================= PROJECTS ========================= */
function ProjectsView({ crm, isIntern, onSelect, selectedId, showAdd, onCloseAdd }: any) {
  const stageIdx = (s: string) => PROJECT_STAGES.indexOf(s as ClientStage);
  return (
    <div className="space-y-3">
      {showAdd && <AddForm title="New Project" fields={[
        { key: "name", label: "Client", placeholder: "Client name" },
        { key: "project", label: "Project", placeholder: "Project name" },
        { key: "revenue", label: "Revenue (₹)", placeholder: "0", type: "number" },
        { key: "stage", label: "Stage", type: "select", options: PROJECT_STAGES },
        { key: "assignedAdminId", label: "Owner", type: "select", options: crm.team.map((t: any) => ({ value: t.id, label: t.name })) },
      ]} onSubmit={(d: any) => { crm.addNewClient({ ...d, location: "India", category: d.stage === "Requirement" || d.stage === "Model" || d.stage === "Demo 1" ? "Potential" : "Ongoing", revenue: Number(d.revenue) || 0 }); onCloseAdd(); }} onClose={onCloseAdd} />}
      {crm.clients.map((c: any) => {
        const owner = crm.team.find((t: any) => t.id === c.assignedAdminId);
        const si = stageIdx(c.stage);
        return (
          <button key={c.id} onClick={() => onSelect(c.id)} className={`w-full text-left rounded-xl border transition-all ${selectedId === c.id ? "border-[var(--color-ember)]/50 bg-[var(--color-ember-soft)]" : "border-[var(--color-border)] bg-[var(--color-bg-soft)] hover:border-[var(--color-border)]/80"}`}>
            <div className="p-3.5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[var(--color-surface)] flex items-center justify-center text-[9px] font-bold text-[var(--color-card-text)]">{c.avatar}</span>
                  <div><h3 className="text-[12px] font-semibold leading-none">{c.name}</h3><p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{c.project}</p></div>
                </div>
                <div className="text-right">
                  {!isIntern && c.revenue > 0 && <p className="text-[11px] font-bold">{formatINR(c.revenue)}</p>}
                  <p className="text-[9px] text-[var(--color-text-muted)]">{owner?.name}</p>
                </div>
              </div>
              <div className="flex gap-px">
                {PROJECT_STAGES.map((stage, i) => <div key={stage} className={`h-1 flex-1 rounded-full ${i <= si ? "bg-[var(--color-ember)]" : "bg-[var(--color-border)]"}`} title={stage} />)}
              </div>
              <div className="flex justify-between mt-1"><span className="text-[9px] text-[var(--color-text-faint)]">{c.stage}</span><span className="text-[9px] text-[var(--color-text-faint)]">{c.lastActivity}</span></div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ========================= PROJECT DRAWER ========================= */
function ProjectDrawer({ crm, clientId, isIntern, onClose }: any) {
  const c = crm.clients.find((x: any) => x.id === clientId);
  if (!c) return null;
  const si = PROJECT_STAGES.indexOf(c.stage);
  const tasks = crm.internalTasks.filter((t: any) => t.clientId === clientId);
  const issues = crm.flags.filter((f: any) => f.clientId === clientId);
  const msgs = crm.comments.filter((m: any) => m.clientId === clientId);
  const [editing, setEditing] = useState<string | null>(null);
  const [editVal, setEditVal] = useState("");

  const save = (field: string) => {
    if (field === "name") crm.updateClient(clientId, { name: editVal });
    if (field === "project") crm.updateClient(clientId, { project: editVal });
    if (field === "location") crm.updateClient(clientId, { location: editVal });
    setEditing(null);
  };

  const EditableField = ({ label, value, field }: { label: string; value: string; field: string }) => (
    <div className="flex items-center justify-between py-1">
      <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--color-text-faint)]">{label}</span>
      {editing === field ? (
        <input autoFocus value={editVal} onChange={e => setEditVal(e.target.value)} onBlur={() => save(field)} onKeyDown={e => e.key === "Enter" && save(field)}
          className="text-[11px] bg-[var(--color-bg)] border border-[var(--color-ember)] rounded px-2 py-0.5 text-[var(--color-text-primary)] outline-none w-36 text-right" />
      ) : (
        <span onClick={() => { setEditing(field); setEditVal(value); }} className="text-[11px] text-[var(--color-text-secondary)] cursor-pointer hover:text-[var(--color-text-primary)] border-b border-dashed border-transparent hover:border-[var(--color-text-muted)]">{value}</span>
      )}
    </div>
  );

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-bold">{c.name}</h3>
        <button onClick={onClose} className="w-5 h-5 rounded flex items-center justify-center hover:bg-[var(--color-bg-soft)] text-[var(--color-text-muted)] text-xs">×</button>
      </div>

      {/* Pipeline */}
      <div>
        <div className="flex gap-px mb-1">{PROJECT_STAGES.map((_, i) => <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= si ? "bg-[var(--color-ember)]" : "bg-[var(--color-border)]"}`} />)}</div>
        <div className="flex justify-between">
          <span className="text-[9px] text-[var(--color-text-faint)]">{si + 1}/{PROJECT_STAGES.length}</span>
          <select value={c.stage} onChange={e => crm.updateClientStage(clientId, e.target.value as ClientStage)} className="text-[10px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded px-1.5 py-0.5 text-[var(--color-text-primary)] outline-none cursor-pointer">
            {PROJECT_STAGES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Editable fields */}
      <div className="space-y-0.5">
        <EditableField label="Project" value={c.project} field="project" />
        <EditableField label="Location" value={c.location} field="location" />
        <div className="flex items-center justify-between py-1">
          <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--color-text-faint)]">Owner</span>
          <select value={c.assignedAdminId || ""} onChange={e => crm.updateClientAdmin(clientId, e.target.value)} className="text-[10px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded px-1.5 py-0.5 text-[var(--color-text-primary)] outline-none cursor-pointer">
            {crm.team.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--color-text-faint)]">Health</span>
          <span className="text-[11px] font-medium">{c.health}%</span>
        </div>
      </div>

      {/* Financials */}
      {!isIntern && (
        <div className="border-t border-[var(--color-border)] pt-3">
          <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--color-text-faint)] mb-2">Financials</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-2.5"><p className="text-[8px] text-[var(--color-text-faint)]">Revenue</p><p className="text-[13px] font-bold">{formatINR(c.revenue)}</p></div>
            <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-2.5"><p className="text-[8px] text-[var(--color-text-faint)]">Spent (est.)</p><p className="text-[13px] font-bold">{formatINR(Math.round(c.revenue * 0.45))}</p></div>
          </div>
        </div>
      )}

      {/* Tasks */}
      {tasks.length > 0 && (
        <div className="border-t border-[var(--color-border)] pt-3">
          <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--color-text-faint)] mb-1.5">Tasks</p>
          {tasks.map((t: any) => <div key={t.id} className="flex items-center justify-between p-1.5 rounded bg-[var(--color-bg)] mb-1"><span className="text-[10px] truncate flex-1">{t.title}</span><span className="text-[8px] text-[var(--color-text-faint)]">{t.status}</span></div>)}
        </div>
      )}

      {/* Feedback preview */}
      {msgs.length > 0 && (
        <div className="border-t border-[var(--color-border)] pt-3">
          <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--color-text-faint)] mb-1.5">Feedback</p>
          {msgs.slice(-3).map((m: any) => <div key={m.id} className="p-2 rounded bg-[var(--color-bg)] mb-1"><p className="text-[9px] font-semibold">{m.author} <span className="font-normal text-[var(--color-text-faint)]">{m.timeElapsed}</span></p><p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{m.text}</p></div>)}
        </div>
      )}

      <div className="border-t border-[var(--color-border)] pt-3">
        <button onClick={() => { crm.deleteClient(clientId); onClose(); }} className="text-[9px] text-[var(--color-bad)] hover:underline">Delete project</button>
      </div>
    </div>
  );
}

/* ========================= TASKS (Drag & Drop Kanban) ========================= */
function TasksView({ crm, showAdd, onCloseAdd }: any) {
  const [dragId, setDragId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => { setDragId(taskId); e.dataTransfer.effectAllowed = "move"; };
  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (dragId) { crm.updateInternalTask(dragId, { status }); setDragId(null); }
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };

  return (
    <div className="space-y-3">
      {showAdd && <AddForm title="New Task" fields={[
        { key: "title", label: "Task", placeholder: "What needs to be done?" },
        { key: "assignedAdminId", label: "Assign to", type: "select", options: crm.team.map((t: any) => ({ value: t.id, label: t.name })) },
        { key: "clientId", label: "Project", type: "select", options: [{ value: "", label: "— None —" }, ...crm.clients.map((c: any) => ({ value: c.id, label: c.name }))] },
      ]} onSubmit={(d: any) => { crm.addInternalTask({ title: d.title, assignedAdminId: d.assignedAdminId || "a1", clientId: d.clientId ? Number(d.clientId) : undefined, status: "Todo" as const }); onCloseAdd(); }} onClose={onCloseAdd} />}
      <div className="grid grid-cols-4 gap-3 min-h-[500px]">
        {TASK_COLS.map(col => {
          const items = crm.internalTasks.filter((t: any) => t.status === col.status);
          return (
            <div key={col.status} onDrop={e => handleDrop(e, col.status)} onDragOver={handleDragOver}
              className={`rounded-xl p-2 border transition-colors ${dragId ? "border-[var(--color-ember)]/20 bg-[var(--color-ember-soft)]/30" : "border-[var(--color-border)]/50 bg-[var(--color-bg-soft)]/50"}`}>
              <div className="flex items-center justify-between mb-2 px-1">
                <h4 className="text-[11px] font-semibold text-[var(--color-text-secondary)]">{col.label}</h4>
                <span className="text-[9px] text-[var(--color-text-faint)] bg-[var(--color-border)] px-1.5 py-px rounded-full">{items.length}</span>
              </div>
              <div className="space-y-1.5">
                {items.map((t: any) => {
                  const owner = crm.team.find((m: any) => m.id === t.assignedAdminId);
                  const project = crm.clients.find((c: any) => c.id === t.clientId);
                  return (
                    <div key={t.id} draggable onDragStart={e => handleDragStart(e, t.id)}
                      className={`bg-[var(--color-surface)] border border-[var(--color-border-card)] rounded-lg p-2.5 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow ${dragId === t.id ? "opacity-40" : ""}`}>
                      <p className="text-[11px] font-medium text-[var(--color-card-text)] leading-snug">{t.title}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[8px] text-[var(--color-card-text-muted)]">{project?.name || ""}</span>
                        <span className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold text-white" style={{ backgroundColor: personColor[t.assignedAdminId] || "#78716C" }}>{owner?.avatar?.charAt(0) || "?"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ========================= SOCIAL ========================= */
function SocialView({ crm, showAdd, onCloseAdd }: any) {
  const socialMedia: any[] = (crm as any).socialMedia || [];
  const cols: { status: SocialStatus; label: string }[] = [
    { status: "Idea", label: "Ideas" }, { status: "Planned", label: "Planned" }, { status: "In Progress", label: "Creating" }, { status: "Scheduled", label: "Scheduled" }, { status: "Posted", label: "Done" },
  ];
  const icon: Record<string, string> = { Instagram: "📸", Twitter: "𝕏", LinkedIn: "in", Reddit: "🔴", YouTube: "▶" };

  return (
    <div className="space-y-3">
      {showAdd && <AddForm title="New Content" fields={[
        { key: "platform", label: "Platform", type: "select", options: ["Instagram", "Twitter", "LinkedIn", "Reddit", "YouTube"] },
        { key: "contentType", label: "Type", type: "select", options: ["Reel", "Post", "Story", "Tweet", "Blog", "Thread"] },
        { key: "description", label: "About", placeholder: "What is this content about?" },
        { key: "scheduledDate", label: "Date", type: "date" },
      ]} onSubmit={() => onCloseAdd()} onClose={onCloseAdd} />}
      <div className="grid grid-cols-5 gap-2.5 min-h-[400px]">
        {cols.map(col => {
          const items = socialMedia.filter((i: any) => i.status === col.status);
          return (
            <div key={col.status}>
              <div className="flex items-center justify-between mb-2 px-0.5">
                <h4 className="text-[10px] font-semibold text-[var(--color-text-secondary)]">{col.label}</h4>
                <span className="text-[8px] text-[var(--color-text-faint)] bg-[var(--color-border)] px-1.5 py-px rounded-full">{items.length}</span>
              </div>
              <div className="space-y-1.5">
                {items.map((item: any) => (
                  <div key={item.id} className="bg-[var(--color-surface)] border border-[var(--color-border-card)] rounded-lg p-2.5">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-[9px]">{icon[item.platform] || "•"}</span>
                      <span className="text-[8px] font-medium text-[var(--color-card-text-muted)]">{item.platform}</span>
                      <span className="text-[8px] text-[var(--color-card-text-muted)]">· {item.contentType}</span>
                    </div>
                    <p className="text-[10px] text-[var(--color-card-text)] leading-snug font-medium">{item.description}</p>
                    {item.clientTag && <span className="inline-block mt-1 text-[8px] px-1 py-px bg-[var(--color-surface-muted)] rounded text-[var(--color-card-text-secondary)]">{item.clientTag}</span>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ========================= LEADS ========================= */
function LeadsView({ crm, onSelect, selectedId, showAdd, onCloseAdd }: any) {
  const funnelStages = [
    { match: ["Lead"], label: "Pipeline" }, { match: ["Contacted"], label: "Contacted" },
    { match: ["Responded", "Requirements"], label: "In Talk" }, { match: ["Demo", "Quoted"], label: "Demo/Quoted" },
  ];
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {funnelStages.map(fs => {
          const count = crm.leads.filter((l: any) => fs.match.includes(l.status)).length;
          return (
            <div key={fs.label} className="flex-1 bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-lg p-2.5 text-center">
              <p className="text-lg font-bold">{count}</p>
              <p className="text-[8px] font-mono uppercase tracking-widest text-[var(--color-text-faint)]">{fs.label}</p>
            </div>
          );
        })}
      </div>
      {showAdd && <AddForm title="New Lead" fields={[
        { key: "companyName", label: "Company", placeholder: "Company name" },
        { key: "projectDescription", label: "Need", placeholder: "What do they need?" },
        { key: "estimatedValue", label: "Value (₹)", placeholder: "0", type: "number" },
        { key: "assignedAdminId", label: "Owner", type: "select", options: crm.team.map((t: any) => ({ value: t.id, label: t.name })) },
      ]} onSubmit={(d: any) => { crm.addNewLead({ companyName: d.companyName, projectDescription: d.projectDescription, source: "LinkedIn" as const, status: "Lead" as const, estimatedValue: Number(d.estimatedValue) || 0, assignedAdminId: d.assignedAdminId || "a3", sourcedById: d.assignedAdminId || "a3", engagementScore: 10 }); onCloseAdd(); }} onClose={onCloseAdd} />}
      <div className="bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        <table className="w-full text-[11px]">
          <thead><tr className="border-b border-[var(--color-border)] text-[9px] font-mono uppercase tracking-widest text-[var(--color-text-faint)]">
            <th className="text-left p-2.5">Company</th><th className="text-left p-2.5">Project</th><th className="text-left p-2.5">Value</th><th className="text-left p-2.5">Status</th><th className="text-left p-2.5">Owner</th>
          </tr></thead>
          <tbody>
            {crm.leads.map((l: any) => {
              const owner = crm.team.find((t: any) => t.id === l.assignedAdminId);
              return (
                <tr key={l.id} onClick={() => onSelect(l.id)} className={`border-b border-[var(--color-border-subtle)] cursor-pointer transition-colors ${selectedId === l.id ? "bg-[var(--color-ember-soft)]" : "hover:bg-[var(--color-bg)]"}`}>
                  <td className="p-2.5 font-medium">{l.companyName}</td>
                  <td className="p-2.5 text-[var(--color-text-muted)] max-w-[180px] truncate">{l.projectDescription}</td>
                  <td className="p-2.5 font-medium">{formatINR(l.estimatedValue)}</td>
                  <td className="p-2.5 text-[var(--color-text-secondary)]">{l.status}</td>
                  <td className="p-2.5 text-[var(--color-text-muted)]">{owner?.name || "—"}</td>
                </tr>
              );
            })}
            {crm.leads.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-[var(--color-text-faint)]">No leads</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ========================= LEAD DRAWER ========================= */
function LeadDrawer({ crm, leadId, onClose }: any) {
  const lead = crm.leads.find((l: any) => l.id === leadId);
  if (!lead) return null;
  const [note, setNote] = useState("");
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between"><h3 className="text-[13px] font-bold">{lead.companyName}</h3><button onClick={onClose} className="text-xs text-[var(--color-text-muted)]">×</button></div>
      <p className="text-[11px] text-[var(--color-text-muted)]">{lead.projectDescription}</p>
      <div className="space-y-1">
        <Row label="Status"><select value={lead.status} onChange={e => crm.updateLeadStatus(leadId, e.target.value)} className="text-[10px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded px-1.5 py-0.5 outline-none">{LEAD_STATUSES.map(s => <option key={s}>{s}</option>)}</select></Row>
        <Row label="Value"><span className="text-[11px] font-semibold">{formatINR(lead.estimatedValue)}</span></Row>
        <Row label="Calls"><span className="text-[11px]">{lead.callsMade}</span><button onClick={() => crm.incrementLeadCalls(leadId)} className="text-[9px] px-1.5 py-px bg-[var(--color-border)] rounded ml-2 hover:bg-[var(--color-text-faint)]/20">+1</button></Row>
      </div>
      <div className="border-t border-[var(--color-border)] pt-3">
        <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--color-text-faint)] mb-1.5">Notes</p>
        {lead.notes.map((n: string, i: number) => <p key={i} className="text-[10px] text-[var(--color-text-muted)] p-1.5 bg-[var(--color-bg)] rounded mb-1">{n}</p>)}
        <div className="flex gap-1.5 mt-1.5">
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Add note..." className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded px-2 py-1 text-[10px] outline-none focus:border-[var(--color-ember)]" onKeyDown={e => { if (e.key === "Enter" && note.trim()) { crm.addLeadNote(leadId, note.trim()); setNote(""); } }} />
          <button onClick={() => { if (note.trim()) { crm.addLeadNote(leadId, note.trim()); setNote(""); } }} className="px-2 py-1 bg-[var(--color-ember)] text-white text-[9px] rounded">Add</button>
        </div>
      </div>
      {!["Converted", "Lost"].includes(lead.status) && (
        <div className="border-t border-[var(--color-border)] pt-3 space-y-1.5">
          <button onClick={() => { crm.convertLeadToClient(leadId); onClose(); }} className="w-full bg-[var(--color-ok)] text-white text-[10px] font-semibold py-1.5 rounded-lg">Convert to Project</button>
          <button onClick={() => { crm.deleteLead(leadId); onClose(); }} className="text-[9px] text-[var(--color-bad)] hover:underline">Delete</button>
        </div>
      )}
    </div>
  );
}

/* ========================= SUPPORT ========================= */
function SupportView({ crm, onSelect, showAdd, onCloseAdd }: any) {
  const open = crm.flags.filter((f: any) => f.status !== "Resolved");
  const done = crm.flags.filter((f: any) => f.status === "Resolved");
  const maintenance = crm.clients.filter((c: any) => ["Maintenance", "Delivery"].includes(c.stage));
  const dot = (s: string) => s === "Critical" ? "bg-[var(--color-bad)]" : s === "High" ? "bg-[var(--color-warn)]" : "bg-[var(--color-text-faint)]";

  return (
    <div className="space-y-4">
      {maintenance.length > 0 && (
        <div>
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-text-faint)] mb-1.5">Maintenance</h3>
          <div className="flex gap-2">{maintenance.map((c: any) => <div key={c.id} className="bg-[var(--color-surface)] border border-[var(--color-border-card)] rounded-lg px-3 py-2"><p className="text-[11px] font-semibold text-[var(--color-card-text)]">{c.name}</p><p className="text-[9px] text-[var(--color-card-text-muted)]">{c.project}</p></div>)}</div>
        </div>
      )}
      {showAdd && <AddForm title="Report Issue" fields={[
        { key: "title", label: "Title", placeholder: "Issue title" },
        { key: "description", label: "Description", placeholder: "Describe the issue", type: "textarea" },
        { key: "severity", label: "Severity", type: "select", options: ["Low", "Medium", "High", "Critical"] },
        { key: "clientId", label: "Project", type: "select", options: crm.clients.map((c: any) => ({ value: c.id, label: c.name })) },
        { key: "assignedAdminId", label: "Assign", type: "select", options: crm.team.map((t: any) => ({ value: t.id, label: t.name })) },
      ]} onSubmit={(d: any) => { crm.addFlag({ clientId: Number(d.clientId) || crm.clients[0]?.id, title: d.title, description: d.description, severity: d.severity || "Medium", assignedAdminId: d.assignedAdminId || "a1" }); onCloseAdd(); }} onClose={onCloseAdd} />}
      <div>
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-text-faint)] mb-1.5">Open ({open.length})</h3>
        <div className="space-y-1.5">
          {open.map((f: any) => {
            const cl = crm.clients.find((c: any) => c.id === f.clientId);
            return <button key={f.id} onClick={() => onSelect(f.id)} className="w-full text-left flex items-center gap-2 bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-lg p-2.5 hover:border-[var(--color-border)]/80 transition-colors">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot(f.severity)}`} /><div className="flex-1 min-w-0"><p className="text-[11px] font-medium truncate">{f.title}</p><p className="text-[9px] text-[var(--color-text-faint)]">{cl?.name} · {f.status}</p></div><span className="text-[8px] text-[var(--color-text-faint)]">{f.severity}</span>
            </button>;
          })}
          {open.length === 0 && <p className="text-[10px] text-[var(--color-text-faint)] py-3 text-center">All clear</p>}
        </div>
      </div>
      {done.length > 0 && <div><h3 className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-text-faint)] mb-1.5">Resolved ({done.length})</h3>{done.slice(0,5).map((f: any) => <div key={f.id} className="flex items-center gap-2 px-2.5 py-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[var(--color-ok)]" /><span className="text-[10px] text-[var(--color-text-muted)] line-through">{f.title}</span></div>)}</div>}
    </div>
  );
}

/* ========================= FLAG DRAWER ========================= */
function FlagDrawer({ crm, flagId, onClose }: any) {
  const f = crm.flags.find((x: any) => x.id === flagId);
  if (!f) return null;
  const cl = crm.clients.find((c: any) => c.id === f.clientId);
  const [log, setLog] = useState("");
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between"><h3 className="text-[13px] font-bold">{f.title}</h3><button onClick={onClose} className="text-xs text-[var(--color-text-muted)]">×</button></div>
      {f.description && <p className="text-[11px] text-[var(--color-text-muted)]">{f.description}</p>}
      <div className="space-y-1">
        <Row label="Project"><span className="text-[11px]">{cl?.name || "—"}</span></Row>
        <Row label="Severity"><span className="text-[11px]">{f.severity}</span></Row>
        <Row label="Status"><select value={f.status} onChange={e => crm.updateFlagStatus(flagId, e.target.value)} className="text-[10px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded px-1.5 py-0.5 outline-none">{(["Open","Investigating","In Dev","Resolved"] as FlagStatus[]).map(s => <option key={s}>{s}</option>)}</select></Row>
        <Row label="Assigned"><select value={f.assignedAdminId || ""} onChange={e => crm.assignFlagAdmin(flagId, e.target.value)} className="text-[10px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded px-1.5 py-0.5 outline-none">{crm.team.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></Row>
      </div>
      <div className="border-t border-[var(--color-border)] pt-3">
        <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--color-text-faint)] mb-1.5">Dev Log</p>
        {f.sprintLogs.map((l: any) => <div key={l.id} className="p-1.5 rounded bg-[var(--color-bg)] mb-1"><span className="text-[9px] font-semibold">{l.author}</span><span className="text-[8px] text-[var(--color-text-faint)] ml-1">{l.timestamp}</span><p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{l.text}</p></div>)}
        <div className="flex gap-1.5 mt-1.5">
          <input value={log} onChange={e => setLog(e.target.value)} placeholder="Add update..." className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded px-2 py-1 text-[10px] outline-none focus:border-[var(--color-ember)]" onKeyDown={e => { if (e.key === "Enter" && log.trim()) { crm.addFlagSprintLog(flagId, crm.userProfile?.name || "Admin", log.trim()); setLog(""); } }} />
          <button onClick={() => { if (log.trim()) { crm.addFlagSprintLog(flagId, crm.userProfile?.name || "Admin", log.trim()); setLog(""); } }} className="px-2 py-1 bg-[var(--color-ember)] text-white text-[9px] rounded">Add</button>
        </div>
      </div>
      <div className="border-t border-[var(--color-border)] pt-3"><button onClick={() => { crm.deleteFlag(flagId); onClose(); }} className="text-[9px] text-[var(--color-bad)] hover:underline">Delete</button></div>
    </div>
  );
}

/* ========================= PRODUCTS ========================= */
function ProductsView({ crm }: any) {
  const stageColor = (s: string) => s === "Beta" || s === "Live" ? "bg-[var(--color-ok)]" : s === "In Dev" ? "bg-[var(--color-warn)]" : "bg-[var(--color-text-faint)]";
  return (
    <div className="space-y-2.5 max-w-2xl">
      {crm.products.map((p: any) => {
        const lead = crm.team.find((t: any) => t.id === p.leadId);
        return (
          <div key={p.id} className="bg-[var(--color-surface)] border border-[var(--color-border-card)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-1.5">
              <div><h4 className="text-[13px] font-semibold text-[var(--color-card-text)]">{p.name}</h4><p className="text-[10px] text-[var(--color-card-text-muted)]">{p.description}</p></div>
              <div className="flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${stageColor(p.stage)}`} /><span className="text-[10px] font-medium text-[var(--color-card-text-secondary)]">{p.stage}</span></div>
            </div>
            <div className="h-1.5 bg-[var(--color-surface-deep)] rounded-full overflow-hidden mt-2"><div className="h-full bg-[var(--color-ember)] rounded-full" style={{ width: `${p.progress}%` }} /></div>
            <div className="flex items-center justify-between mt-1"><span className="text-[9px] text-[var(--color-card-text-muted)]">{p.progress}%</span><span className="text-[9px] text-[var(--color-card-text-muted)]">{lead?.name || "—"}</span></div>
          </div>
        );
      })}
    </div>
  );
}

/* ========================= SHARED COMPONENTS ========================= */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex items-center justify-between py-0.5"><span className="text-[9px] font-mono uppercase tracking-widest text-[var(--color-text-faint)]">{label}</span><div className="flex items-center">{children}</div></div>;
}

function AddForm({ title, fields, onSubmit, onClose }: { title: string; fields: any[]; onSubmit: (data: any) => void; onClose: () => void }) {
  const [data, setData] = useState<Record<string, any>>(() => {
    const init: Record<string, any> = {};
    fields.forEach((f: any) => {
      if (f.type === "select") {
        const opts = f.options;
        if (opts.length > 0) init[f.key] = typeof opts[0] === "object" ? opts[0].value : opts[0];
      } else init[f.key] = "";
    });
    return init;
  });
  const set = (key: string, val: any) => setData(p => ({ ...p, [key]: val }));

  const inputCls = "w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-[11px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-ember)] placeholder:text-[var(--color-text-faint)]";

  return (
    <div className="bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-xl p-3.5 space-y-2.5">
      <div className="flex items-center justify-between"><h3 className="text-[11px] font-semibold">{title}</h3><button onClick={onClose} className="text-[var(--color-text-faint)] text-sm">×</button></div>
      <div className="grid grid-cols-2 gap-2">
        {fields.map((f: any) => {
          if (f.type === "select") {
            const opts = f.options;
            return (
              <select key={f.key} value={data[f.key] ?? ""} onChange={e => set(f.key, e.target.value)} className={inputCls}>
                {opts.map((o: any) => typeof o === "object" ? <option key={o.value} value={o.value}>{o.label}</option> : <option key={o}>{o}</option>)}
              </select>
            );
          }
          if (f.type === "textarea") return <textarea key={f.key} placeholder={f.placeholder} value={data[f.key] ?? ""} onChange={e => set(f.key, e.target.value)} rows={2} className={inputCls + " col-span-2 resize-none"} />;
          if (f.type === "date") return <input key={f.key} type="date" value={data[f.key] ?? ""} onChange={e => set(f.key, e.target.value)} className={inputCls} />;
          return <input key={f.key} type={f.type || "text"} placeholder={f.placeholder} value={data[f.key] ?? ""} onChange={e => set(f.key, e.target.value)} className={`${inputCls} ${f.key === fields[0]?.key || f.type === "textarea" ? "col-span-2" : ""}`} />;
        })}
      </div>
      <button onClick={() => onSubmit(data)} className="w-full bg-[var(--color-ember)] text-white text-[10px] font-semibold py-1.5 rounded-lg hover:bg-[var(--color-ember-hover)] transition-colors">Create</button>
    </div>
  );
}
