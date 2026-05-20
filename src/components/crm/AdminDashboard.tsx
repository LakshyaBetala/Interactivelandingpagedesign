"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCRM, ClientStage, OutreachStatus, TaskStatus, FlagSeverity, FlagStatus, SocialStatus, SocialPlatform, SocialContentType } from "./CRMContext";
import ClientPortalView from "./ClientPortalView";

const formatINR = (n: number) => n > 0 ? "₹" + n.toLocaleString("en-IN") : "—";

const PROJECT_STAGES: ClientStage[] = ["Requirement", "Model", "Demo 1", "Converted", "Dev 1", "Demo 2", "Dev Final", "Final Demo", "Delivery", "Maintenance"];
const LEAD_STATUSES: OutreachStatus[] = ["Lead", "Contacted", "Responded", "Requirements", "Demo", "Quoted", "Converted", "Lost"];
const TASK_STATUSES: TaskStatus[] = ["Todo", "In Progress", "In Review", "Resolved"];

type Section = "dashboard" | "projects" | "social" | "leads" | "care" | "products";

// Person color map
const personColor: Record<string, string> = { a1: "#FF5A1F", a2: "#0D9488", a3: "#65A30D", a4: "#9333EA" };

export default function AdminDashboard() {
  const crm = useCRM();
  const { clients, team, leads, internalTasks, flags, comments, activities, products, userProfile, isSupabaseOnline, signOut } = crm;
  const [section, setSection] = useState<Section>("dashboard");
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const isIntern = userProfile?.role?.toLowerCase().includes("intern") || false;

  const sections: { id: Section; label: string; count?: number }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "projects", label: "Projects", count: clients.length },
    { id: "social", label: "Social Media", count: (crm as any).socialMedia?.length || 0 },
    { id: "leads", label: "Leads", count: leads.length },
    { id: "care", label: "Client Care", count: flags.filter(f => f.status !== "Resolved").length },
    { id: "products", label: "Products", count: products.length },
  ];

  return (
    <div className="flex h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-52 flex-shrink-0 bg-[var(--color-bg-raised)] border-r border-[var(--color-border-subtle)] flex flex-col">
        <div className="p-5 pb-3">
          <h1 className="text-sm font-bold tracking-tight text-[var(--color-text-primary)]">almmatix</h1>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 font-mono uppercase tracking-wider">Console</p>
        </div>

        <nav className="flex-1 px-2 mt-2 space-y-0.5">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => { setSection(s.id); setSelectedId(null); setShowAdd(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-all duration-150 ${
                section === s.id
                  ? "bg-[var(--color-ember)] text-white font-semibold"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-soft)]"
              }`}
            >
              <span>{s.label}</span>
              {s.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  section === s.id ? "bg-white/20" : "bg-[var(--color-border)]"
                }`}>{s.count}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[var(--color-border-subtle)] space-y-2">
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseOnline ? "bg-[var(--color-ok)]" : "bg-[var(--color-warn)] animate-pulse"}`} />
            <span className="text-[10px] text-[var(--color-text-muted)]">{isSupabaseOnline ? "Connected" : "Offline"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">{userProfile?.name || "Admin"}</span>
            <button onClick={signOut} className="text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-bad)] transition-colors">Sign out</button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-12 flex-shrink-0 border-b border-[var(--color-border-subtle)] flex items-center justify-between px-6 bg-[var(--color-bg-raised)]">
          <h2 className="text-[14px] font-semibold">{sections.find(s => s.id === section)?.label}</h2>
          {section !== "dashboard" && section !== "products" && (
            <button onClick={() => setShowAdd(!showAdd)} className="px-3 py-1 bg-[var(--color-ember)] text-white text-[11px] font-semibold rounded-lg hover:bg-[var(--color-ember-hover)] transition-colors">+ New</button>
          )}
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto crm-scroll p-6">
            <AnimatePresence mode="wait">
              <motion.div key={section} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                {section === "dashboard" && <DashboardSection crm={crm} isIntern={isIntern} />}
                {section === "projects" && <ProjectsSection crm={crm} isIntern={isIntern} onSelect={setSelectedId} selectedId={selectedId} showAdd={showAdd} onCloseAdd={() => setShowAdd(false)} />}
                {section === "social" && <SocialSection crm={crm} showAdd={showAdd} onCloseAdd={() => setShowAdd(false)} />}
                {section === "leads" && <LeadsSection crm={crm} onSelect={setSelectedId} selectedId={selectedId} showAdd={showAdd} onCloseAdd={() => setShowAdd(false)} />}
                {section === "care" && <CareSection crm={crm} onSelect={setSelectedId} showAdd={showAdd} onCloseAdd={() => setShowAdd(false)} />}
                {section === "products" && <ProductsSection crm={crm} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right drawer */}
          <AnimatePresence>
            {selectedId !== null && section !== "dashboard" && (
              <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 400, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] as const }} className="flex-shrink-0 border-l border-[var(--color-border-subtle)] bg-[var(--color-bg-raised)] overflow-hidden">
                <div className="w-[400px] h-full overflow-y-auto crm-scroll">
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

/* ===== SECTION 1: DASHBOARD ===== */
function DashboardSection({ crm, isIntern }: any) {
  const { clients, team, leads, internalTasks, flags, comments, activities } = crm;

  const confirmed = clients.filter((c: any) => ["Converted", "Dev 1", "Demo 2", "Dev Final", "Final Demo", "Delivery"].includes(c.stage)).length;
  const pipeline = clients.reduce((s: number, c: any) => s + c.revenue, 0) + leads.reduce((s: number, l: any) => s + l.estimatedValue, 0);
  const openFlags = flags.filter((f: any) => f.status !== "Resolved").length;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Active Projects", value: confirmed, color: "text-[var(--color-ok)]" },
          { label: "Pipeline Value", value: isIntern ? "—" : formatINR(pipeline), color: "text-[var(--color-text-primary)]" },
          { label: "Open Issues", value: openFlags, color: openFlags > 0 ? "text-[var(--color-warn)]" : "text-[var(--color-text-muted)]" },
          { label: "Leads", value: leads.length, color: "text-[var(--color-text-primary)]" },
        ].map(s => (
          <div key={s.label} className="bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-xl p-4">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">{s.label}</p>
            <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* People lanes — the core insight */}
      <div className="space-y-3">
        <h3 className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">Team Status</h3>
        {team.map((member: any) => {
          const myTasks = internalTasks.filter((t: any) => t.assignedAdminId === member.id);
          const nowTask = myTasks.find((t: any) => t.status === "In Progress");
          const nextTask = myTasks.find((t: any) => t.status === "Todo");
          const blockedTask = myTasks.find((t: any) => t.status === "In Review");
          const myProjects = clients.filter((c: any) => c.assignedAdminId === member.id);

          return (
            <div key={member.id} className="bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border-card)]">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white" style={{ backgroundColor: personColor[member.id] || "#78716C" }}>{member.avatar}</span>
                <div>
                  <h4 className="text-[13px] font-semibold text-[var(--color-card-text)]">{member.name}</h4>
                  <p className="text-[10px] text-[var(--color-card-text-muted)]">{member.role}</p>
                </div>
                <span className="ml-auto text-[10px] text-[var(--color-card-text-muted)]">{myProjects.length} projects · {myTasks.filter((t: any) => t.status !== "Resolved").length} tasks</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-white/60 p-2.5 border border-[var(--color-border-card)]/50">
                  <p className="text-[9px] font-mono uppercase tracking-wider text-[var(--color-ok)] mb-1">Now</p>
                  <p className="text-[11px] text-[var(--color-card-text)] leading-snug font-medium">{nowTask?.title || "No active task"}</p>
                </div>
                <div className="rounded-lg bg-white/60 p-2.5 border border-[var(--color-border-card)]/50">
                  <p className="text-[9px] font-mono uppercase tracking-wider text-[var(--color-info)] mb-1">Next</p>
                  <p className="text-[11px] text-[var(--color-card-text)] leading-snug font-medium">{nextTask?.title || "Queue empty"}</p>
                </div>
                <div className="rounded-lg bg-white/60 p-2.5 border border-[var(--color-border-card)]/50">
                  <p className="text-[9px] font-mono uppercase tracking-wider text-[var(--color-warn)] mb-1">Review</p>
                  <p className="text-[11px] text-[var(--color-card-text)] leading-snug font-medium">{blockedTask?.title || "Nothing pending"}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Needs attention */}
      {(comments.length > 0 || flags.filter((f: any) => f.status !== "Resolved").length > 0) && (
        <div className="space-y-2">
          <h3 className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">Needs Attention</h3>
          <div className="space-y-1.5">
            {comments.filter((c: any) => c.role === "client").slice(0, 3).map((c: any) => {
              const client = clients.find((cl: any) => cl.id === c.clientId);
              return (
                <div key={c.id} className="flex items-center gap-3 bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-lg px-4 py-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-warn)]" />
                  <span className="text-[12px] text-[var(--color-text-secondary)] flex-1">Client feedback from <strong className="text-[var(--color-text-primary)]">{client?.name || "Unknown"}</strong> — {c.text.substring(0, 60)}...</span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">{c.timeElapsed}</span>
                </div>
              );
            })}
            {flags.filter((f: any) => f.status === "Open").slice(0, 2).map((f: any) => {
              const client = clients.find((c: any) => c.id === f.clientId);
              return (
                <div key={f.id} className="flex items-center gap-3 bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-lg px-4 py-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-bad)]" />
                  <span className="text-[12px] text-[var(--color-text-secondary)] flex-1">Open issue on <strong className="text-[var(--color-text-primary)]">{client?.name}</strong>: {f.title}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">{f.severity}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div className="space-y-2">
        <h3 className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">Recent Activity</h3>
        <div className="space-y-1">
          {activities.slice(0, 5).map((a: any) => (
            <div key={a.id} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-[var(--color-bg-soft)] transition-colors">
              <span className={`w-1 h-1 rounded-full ${a.type === "milestone" ? "bg-[var(--color-ok)]" : a.type === "alert" ? "bg-[var(--color-warn)]" : "bg-[var(--color-text-muted)]"}`} />
              <span className="text-[12px] text-[var(--color-text-secondary)] flex-1">{a.action}</span>
              <span className="text-[10px] text-[var(--color-text-muted)]">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===== SECTION 2: PROJECTS ===== */
function ProjectsSection({ crm, isIntern, onSelect, selectedId, showAdd, onCloseAdd }: any) {
  const stageIdx = (s: string) => PROJECT_STAGES.indexOf(s as ClientStage);

  return (
    <div className="space-y-4">
      {showAdd && <AddProjectForm crm={crm} onClose={onCloseAdd} />}
      <div className="space-y-2">
        {crm.clients.map((c: any) => {
          const owner = crm.team.find((t: any) => t.id === c.assignedAdminId);
          const si = stageIdx(c.stage);
          return (
            <button key={c.id} onClick={() => onSelect(c.id)} className={`w-full text-left rounded-xl border transition-all duration-150 ${
              selectedId === c.id ? "border-[var(--color-ember)]/60 bg-[var(--color-ember-soft)]" : "border-[var(--color-border)] bg-[var(--color-bg-soft)] hover:border-[var(--color-text-muted)]/30"
            }`}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-[var(--color-surface)] flex items-center justify-center text-[10px] font-bold text-[var(--color-card-text)]">{c.avatar}</span>
                    <div>
                      <h3 className="text-[13px] font-semibold">{c.name}</h3>
                      <p className="text-[11px] text-[var(--color-text-muted)]">{c.project}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {!isIntern && c.revenue > 0 && <span className="text-[12px] font-semibold">{formatINR(c.revenue)}</span>}
                    <span className="text-[10px] font-medium text-[var(--color-text-secondary)]">{owner?.name}</span>
                  </div>
                </div>
                {/* 10-step progress bar */}
                <div className="flex gap-0.5">
                  {PROJECT_STAGES.map((stage, i) => (
                    <div key={stage} className={`h-1 flex-1 rounded-full transition-colors ${i <= si ? "bg-[var(--color-ember)]" : "bg-[var(--color-border)]"}`} title={stage} />
                  ))}
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-[var(--color-text-muted)]">{c.stage}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">{c.lastActivity}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AddProjectForm({ crm, onClose }: any) {
  const [name, setName] = useState(""); const [project, setProject] = useState(""); const [stage, setStage] = useState<ClientStage>("Requirement"); const [revenue, setRevenue] = useState(0); const [admin, setAdmin] = useState("a1");
  const submit = () => {
    if (!name || !project) return;
    crm.addNewClient({ name, project, location: "India", category: "Potential" as const, stage, revenue, assignedAdminId: admin });
    onClose();
  };
  return (
    <div className="bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between"><h3 className="text-[12px] font-semibold">New Project</h3><button onClick={onClose} className="text-[var(--color-text-muted)] text-sm">×</button></div>
      <div className="grid grid-cols-2 gap-2">
        <input placeholder="Client name" value={name} onChange={e => setName(e.target.value)} className="col-span-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[12px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-ember)] placeholder:text-[var(--color-text-faint)]" />
        <input placeholder="Project name" value={project} onChange={e => setProject(e.target.value)} className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[12px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-ember)] placeholder:text-[var(--color-text-faint)]" />
        <input type="number" placeholder="Revenue (₹)" value={revenue || ""} onChange={e => setRevenue(Number(e.target.value))} className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[12px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-ember)] placeholder:text-[var(--color-text-faint)]" />
        <select value={stage} onChange={e => setStage(e.target.value as ClientStage)} className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[12px] text-[var(--color-text-primary)] outline-none">
          {PROJECT_STAGES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={admin} onChange={e => setAdmin(e.target.value)} className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[12px] text-[var(--color-text-primary)] outline-none">
          {crm.team.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <button onClick={submit} className="w-full bg-[var(--color-ember)] text-white text-[11px] font-semibold py-2 rounded-lg hover:bg-[var(--color-ember-hover)] transition-colors">Create Project</button>
    </div>
  );
}

/* ===== PROJECT DRAWER ===== */
function ProjectDrawer({ crm, clientId, isIntern, onClose }: any) {
  const client = crm.clients.find((c: any) => c.id === clientId);
  if (!client) return null;
  const owner = crm.team.find((t: any) => t.id === client.assignedAdminId);
  const pTasks = crm.internalTasks.filter((t: any) => t.clientId === clientId);
  const pFlags = crm.flags.filter((f: any) => f.clientId === clientId);
  const pComments = crm.comments.filter((c: any) => c.clientId === clientId);
  const si = PROJECT_STAGES.indexOf(client.stage);

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-bold">{client.name}</h3>
        <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] text-sm">×</button>
      </div>

      {/* Stage pipeline visual */}
      <div className="space-y-1.5">
        <div className="flex gap-0.5">
          {PROJECT_STAGES.map((stage, i) => (
            <div key={stage} className={`h-1.5 flex-1 rounded-full ${i <= si ? "bg-[var(--color-ember)]" : "bg-[var(--color-border)]"}`} />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[var(--color-text-muted)]">Stage {si + 1}/{PROJECT_STAGES.length}</span>
          <select value={client.stage} onChange={e => crm.updateClientStage(clientId, e.target.value as ClientStage)} className="text-[11px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded px-2 py-0.5 text-[var(--color-text-primary)] outline-none">
            {PROJECT_STAGES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2.5">
        {[
          { label: "Project", value: client.project },
          { label: "Location", value: client.location },
          { label: "Health", value: `${client.health}%` },
        ].map(f => (
          <div key={f.label} className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">{f.label}</span>
            <span className="text-[12px] text-[var(--color-text-secondary)]">{f.value}</span>
          </div>
        ))}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">Owner</span>
          <select value={client.assignedAdminId || ""} onChange={e => crm.updateClientAdmin(clientId, e.target.value)} className="text-[11px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded px-2 py-0.5 text-[var(--color-text-primary)] outline-none">
            {crm.team.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      </div>

      {/* Financials */}
      {!isIntern && (
        <div className="border-t border-[var(--color-border)] pt-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Financials</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-3">
              <p className="text-[9px] text-[var(--color-text-muted)]">Revenue</p>
              <p className="text-[14px] font-bold">{formatINR(client.revenue)}</p>
            </div>
            <div className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg p-3">
              <p className="text-[9px] text-[var(--color-text-muted)]">Spent (est.)</p>
              <p className="text-[14px] font-bold">{formatINR(Math.round(client.revenue * 0.45))}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tasks */}
      {pTasks.length > 0 && (
        <div className="border-t border-[var(--color-border)] pt-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Tasks ({pTasks.length})</p>
          {pTasks.map((t: any) => (
            <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-bg)] mb-1">
              <span className="text-[11px] text-[var(--color-text-secondary)] truncate flex-1">{t.title}</span>
              <span className="text-[9px] text-[var(--color-text-muted)]">{t.status}</span>
            </div>
          ))}
        </div>
      )}

      {/* Comments */}
      {pComments.length > 0 && (
        <div className="border-t border-[var(--color-border)] pt-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Feedback</p>
          {pComments.slice(0, 4).map((c: any) => (
            <div key={c.id} className="p-2.5 rounded-lg bg-[var(--color-bg)] mb-1.5">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-semibold text-[var(--color-text-primary)]">{c.author}</span>
                <span className="text-[9px] text-[var(--color-text-muted)]">{c.timeElapsed}</span>
              </div>
              <p className="text-[11px] text-[var(--color-text-secondary)]">{c.text}</p>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-[var(--color-border)] pt-4">
        <button onClick={() => { crm.deleteClient(clientId); onClose(); }} className="text-[10px] text-[var(--color-bad)] hover:underline">Delete project</button>
      </div>
    </div>
  );
}

/* ===== SECTION 3: SOCIAL MEDIA ===== */
function SocialSection({ crm, showAdd, onCloseAdd }: any) {
  const socialMedia: any[] = (crm as any).socialMedia || [];
  const columns: { status: SocialStatus; label: string }[] = [
    { status: "Idea", label: "Backlog" },
    { status: "Planned", label: "Planned" },
    { status: "In Progress", label: "Creating" },
    { status: "Scheduled", label: "Scheduled" },
    { status: "Posted", label: "Posted" },
  ];

  const platformIcon: Record<string, string> = { Instagram: "📸", Twitter: "𝕏", LinkedIn: "in", Reddit: "🔴", YouTube: "▶" };

  return (
    <div className="space-y-4">
      {showAdd && <AddSocialForm crm={crm} onClose={onCloseAdd} />}
      <div className="grid grid-cols-5 gap-3 min-h-[400px]">
        {columns.map(col => {
          const items = socialMedia.filter((i: any) => i.status === col.status);
          return (
            <div key={col.status}>
              <div className="flex items-center justify-between mb-2 px-1">
                <h4 className="text-[11px] font-semibold text-[var(--color-text-secondary)]">{col.label}</h4>
                <span className="text-[10px] text-[var(--color-text-muted)] bg-[var(--color-border)] px-1.5 py-0.5 rounded-full">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((item: any) => (
                  <div key={item.id} className="bg-[var(--color-surface)] border border-[var(--color-border-card)] rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-[10px]">{platformIcon[item.platform] || "•"}</span>
                      <span className="text-[10px] font-medium text-[var(--color-card-text-muted)]">{item.platform}</span>
                      <span className="text-[10px] text-[var(--color-card-text-muted)]">·</span>
                      <span className="text-[10px] text-[var(--color-card-text-muted)]">{item.contentType}</span>
                    </div>
                    <p className="text-[11px] text-[var(--color-card-text)] leading-snug font-medium">{item.description}</p>
                    {item.clientTag && <span className="inline-block mt-1.5 text-[9px] px-1.5 py-0.5 bg-[var(--color-surface-muted)] rounded text-[var(--color-card-text-secondary)]">{item.clientTag}</span>}
                    <p className="text-[9px] text-[var(--color-card-text-muted)] mt-1">{item.scheduledDate}</p>
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

function AddSocialForm({ crm, onClose }: any) {
  const [platform, setPlatform] = useState<SocialPlatform>("Instagram");
  const [contentType, setContentType] = useState<SocialContentType>("Post");
  const [desc, setDesc] = useState(""); const [date, setDate] = useState("");
  return (
    <div className="bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between"><h3 className="text-[12px] font-semibold">New Content</h3><button onClick={onClose} className="text-[var(--color-text-muted)]">×</button></div>
      <div className="grid grid-cols-2 gap-2">
        <select value={platform} onChange={e => setPlatform(e.target.value as SocialPlatform)} className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[12px] text-[var(--color-text-primary)] outline-none">
          {(["Instagram", "Twitter", "LinkedIn", "Reddit", "YouTube"] as SocialPlatform[]).map(p => <option key={p}>{p}</option>)}
        </select>
        <select value={contentType} onChange={e => setContentType(e.target.value as SocialContentType)} className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[12px] text-[var(--color-text-primary)] outline-none">
          {(["Reel", "Post", "Story", "Tweet", "Blog", "Thread"] as SocialContentType[]).map(t => <option key={t}>{t}</option>)}
        </select>
        <input placeholder="What is this content about?" value={desc} onChange={e => setDesc(e.target.value)} className="col-span-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[12px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-ember)] placeholder:text-[var(--color-text-faint)]" />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[12px] text-[var(--color-text-primary)] outline-none" />
      </div>
      <button className="w-full bg-[var(--color-ember)] text-white text-[11px] font-semibold py-2 rounded-lg hover:bg-[var(--color-ember-hover)] transition-colors">Add to Pipeline</button>
    </div>
  );
}

/* ===== SECTION 4: LEADS ===== */
function LeadsSection({ crm, onSelect, selectedId, showAdd, onCloseAdd }: any) {
  const { leads, team } = crm;
  // Pipeline funnel counts
  const funnelStages = [
    { status: "Lead", label: "In Pipeline" },
    { status: "Contacted", label: "Contacted" },
    { status: "Responded", label: "In Talk" },
    { status: "Demo", label: "Demo Stage" },
    { status: "Quoted", label: "Quoted" },
  ];

  return (
    <div className="space-y-5">
      {/* Funnel */}
      <div className="flex gap-2">
        {funnelStages.map((fs, i) => {
          const count = leads.filter((l: any) => l.status === fs.status || (fs.status === "Responded" && l.status === "Requirements")).length;
          return (
            <div key={fs.status} className="flex-1 bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-xl p-3 text-center">
              <p className="text-xl font-bold">{count}</p>
              <p className="text-[9px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] mt-0.5">{fs.label}</p>
            </div>
          );
        })}
      </div>

      {showAdd && <AddLeadForm crm={crm} onClose={onCloseAdd} />}

      {/* Lead table */}
      <div className="bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        <table className="w-full text-[12px]">
          <thead><tr className="border-b border-[var(--color-border)] text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">
            <th className="text-left p-3">Company</th><th className="text-left p-3">Project</th><th className="text-left p-3">Value</th><th className="text-left p-3">Status</th><th className="text-left p-3">Owner</th>
          </tr></thead>
          <tbody>
            {leads.map((l: any) => {
              const owner = team.find((t: any) => t.id === l.assignedAdminId);
              return (
                <tr key={l.id} onClick={() => onSelect(l.id)} className={`border-b border-[var(--color-border-subtle)] cursor-pointer transition-colors ${selectedId === l.id ? "bg-[var(--color-ember-soft)]" : "hover:bg-[var(--color-bg)]"}`}>
                  <td className="p-3 font-medium">{l.companyName}</td>
                  <td className="p-3 text-[var(--color-text-muted)] max-w-[200px] truncate">{l.projectDescription}</td>
                  <td className="p-3 font-medium">{formatINR(l.estimatedValue)}</td>
                  <td className="p-3 text-[var(--color-text-secondary)]">{l.status}</td>
                  <td className="p-3 text-[var(--color-text-muted)]">{owner?.name || "—"}</td>
                </tr>
              );
            })}
            {leads.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-[var(--color-text-muted)]">No leads yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddLeadForm({ crm, onClose }: any) {
  const [company, setCompany] = useState(""); const [desc, setDesc] = useState(""); const [value, setValue] = useState(0); const [admin, setAdmin] = useState("a3");
  const submit = () => {
    if (!company) return;
    crm.addNewLead({ companyName: company, projectDescription: desc, source: "LinkedIn" as const, status: "Lead" as const, estimatedValue: value, assignedAdminId: admin, sourcedById: admin, engagementScore: 10 });
    onClose();
  };
  return (
    <div className="bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between"><h3 className="text-[12px] font-semibold">New Lead</h3><button onClick={onClose} className="text-[var(--color-text-muted)]">×</button></div>
      <div className="grid grid-cols-2 gap-2">
        <input placeholder="Company name" value={company} onChange={e => setCompany(e.target.value)} className="col-span-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[12px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-ember)] placeholder:text-[var(--color-text-faint)]" />
        <input placeholder="What do they need?" value={desc} onChange={e => setDesc(e.target.value)} className="col-span-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[12px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-ember)] placeholder:text-[var(--color-text-faint)]" />
        <input type="number" placeholder="Est. value (₹)" value={value || ""} onChange={e => setValue(Number(e.target.value))} className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[12px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-ember)] placeholder:text-[var(--color-text-faint)]" />
        <select value={admin} onChange={e => setAdmin(e.target.value)} className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[12px] text-[var(--color-text-primary)] outline-none">
          {crm.team.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <button onClick={submit} className="w-full bg-[var(--color-ember)] text-white text-[11px] font-semibold py-2 rounded-lg hover:bg-[var(--color-ember-hover)] transition-colors">Add Lead</button>
    </div>
  );
}

/* ===== LEAD DRAWER ===== */
function LeadDrawer({ crm, leadId, onClose }: any) {
  const lead = crm.leads.find((l: any) => l.id === leadId);
  if (!lead) return null;
  const owner = crm.team.find((t: any) => t.id === lead.assignedAdminId);
  const [noteText, setNoteText] = useState("");

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-bold">{lead.companyName}</h3>
        <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">×</button>
      </div>
      <p className="text-[12px] text-[var(--color-text-secondary)]">{lead.projectDescription}</p>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">Status</span>
          <select value={lead.status} onChange={e => crm.updateLeadStatus(leadId, e.target.value)} className="text-[11px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded px-2 py-0.5 text-[var(--color-text-primary)] outline-none">
            {LEAD_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center justify-between"><span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">Value</span><span className="text-[12px] font-semibold">{formatINR(lead.estimatedValue)}</span></div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">Calls</span>
          <div className="flex items-center gap-2"><span className="text-[12px]">{lead.callsMade}</span><button onClick={() => crm.incrementLeadCalls(leadId)} className="text-[10px] px-1.5 py-0.5 bg-[var(--color-border)] rounded hover:bg-[var(--color-text-muted)]/20">+1</button></div>
        </div>
        <div className="flex items-center justify-between"><span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">Owner</span><span className="text-[12px]">{owner?.name || "—"}</span></div>
      </div>

      <div className="border-t border-[var(--color-border)] pt-4">
        <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Notes</p>
        {lead.notes.map((n: string, i: number) => <div key={i} className="p-2 rounded-lg bg-[var(--color-bg)] mb-1 text-[11px] text-[var(--color-text-secondary)]">{n}</div>)}
        <div className="flex gap-2 mt-2">
          <input value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add note..." className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-[11px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-ember)] placeholder:text-[var(--color-text-faint)]" onKeyDown={e => { if (e.key === "Enter" && noteText.trim()) { crm.addLeadNote(leadId, noteText.trim()); setNoteText(""); } }} />
          <button onClick={() => { if (noteText.trim()) { crm.addLeadNote(leadId, noteText.trim()); setNoteText(""); } }} className="px-3 py-1.5 bg-[var(--color-ember)] text-white text-[10px] rounded-lg">Add</button>
        </div>
      </div>

      {lead.status !== "Converted" && lead.status !== "Lost" && (
        <div className="border-t border-[var(--color-border)] pt-4 space-y-2">
          <button onClick={() => { crm.convertLeadToClient(leadId); onClose(); }} className="w-full bg-[var(--color-ok)] text-white text-[11px] font-semibold py-2 rounded-lg hover:bg-emerald-600 transition-colors">Convert to Project</button>
          <button onClick={() => { crm.deleteLead(leadId); onClose(); }} className="text-[10px] text-[var(--color-bad)] hover:underline">Delete lead</button>
        </div>
      )}
    </div>
  );
}

/* ===== SECTION 5: CLIENT CARE ===== */
function CareSection({ crm, onSelect, showAdd, onCloseAdd }: any) {
  const { flags, clients, team } = crm;
  const openFlags = flags.filter((f: any) => f.status !== "Resolved");
  const resolvedFlags = flags.filter((f: any) => f.status === "Resolved");
  const maintenanceProjects = clients.filter((c: any) => c.stage === "Maintenance" || c.stage === "Delivery");

  const severityDot = (s: string) => s === "Critical" ? "bg-[var(--color-bad)]" : s === "High" ? "bg-[var(--color-warn)]" : s === "Medium" ? "bg-yellow-400" : "bg-[var(--color-text-muted)]";

  return (
    <div className="space-y-5">
      {/* Maintenance projects */}
      <div>
        <h3 className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Active Maintenance</h3>
        <div className="grid grid-cols-3 gap-2">
          {maintenanceProjects.map((c: any) => (
            <div key={c.id} className="bg-[var(--color-surface)] border border-[var(--color-border-card)] rounded-xl p-3">
              <h4 className="text-[12px] font-semibold text-[var(--color-card-text)]">{c.name}</h4>
              <p className="text-[10px] text-[var(--color-card-text-muted)]">{c.project}</p>
            </div>
          ))}
          {maintenanceProjects.length === 0 && <p className="text-[11px] text-[var(--color-text-muted)] col-span-3">No maintenance projects</p>}
        </div>
      </div>

      {showAdd && <AddIssueForm crm={crm} onClose={onCloseAdd} />}

      {/* Support queue */}
      <div>
        <h3 className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Support Queue ({openFlags.length})</h3>
        <div className="space-y-1.5">
          {openFlags.map((f: any) => {
            const client = clients.find((c: any) => c.id === f.clientId);
            return (
              <button key={f.id} onClick={() => onSelect(f.id)} className="w-full text-left flex items-center gap-3 bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-xl p-3 hover:border-[var(--color-text-muted)]/30 transition-colors">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${severityDot(f.severity)}`} />
                <div className="flex-1 min-w-0">
                  <h4 className="text-[12px] font-semibold truncate">{f.title}</h4>
                  <p className="text-[10px] text-[var(--color-text-muted)]">{client?.name} · {f.status}</p>
                </div>
                <span className="text-[10px] text-[var(--color-text-muted)]">{f.severity}</span>
              </button>
            );
          })}
          {openFlags.length === 0 && <p className="text-[11px] text-[var(--color-text-muted)] py-4 text-center">No open issues — all clear</p>}
        </div>
      </div>

      {/* Resolved */}
      {resolvedFlags.length > 0 && (
        <div>
          <h3 className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Resolved ({resolvedFlags.length})</h3>
          {resolvedFlags.slice(0, 5).map((f: any) => (
            <div key={f.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--color-bg-soft)]">
              <span className="w-2 h-2 rounded-full bg-[var(--color-ok)]" />
              <span className="text-[11px] text-[var(--color-text-secondary)] line-through">{f.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddIssueForm({ crm, onClose }: any) {
  const [title, setTitle] = useState(""); const [desc, setDesc] = useState(""); const [severity, setSeverity] = useState<FlagSeverity>("Medium");
  const [clientId, setClientId] = useState(crm.clients[0]?.id || 1); const [admin, setAdmin] = useState("a1");
  const submit = () => { if (!title) return; crm.addFlag({ clientId, title, description: desc, severity, assignedAdminId: admin }); onClose(); };
  return (
    <div className="bg-[var(--color-bg-soft)] border border-[var(--color-border)] rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between"><h3 className="text-[12px] font-semibold">Report Issue</h3><button onClick={onClose} className="text-[var(--color-text-muted)]">×</button></div>
      <input placeholder="Issue title" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[12px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-ember)] placeholder:text-[var(--color-text-faint)]" />
      <textarea placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} rows={2} className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[12px] text-[var(--color-text-primary)] outline-none resize-none focus:border-[var(--color-ember)] placeholder:text-[var(--color-text-faint)]" />
      <div className="grid grid-cols-3 gap-2">
        <select value={severity} onChange={e => setSeverity(e.target.value as FlagSeverity)} className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[12px] text-[var(--color-text-primary)] outline-none">{(["Low","Medium","High","Critical"] as FlagSeverity[]).map(s => <option key={s}>{s}</option>)}</select>
        <select value={clientId} onChange={e => setClientId(Number(e.target.value))} className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[12px] text-[var(--color-text-primary)] outline-none">{crm.clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <select value={admin} onChange={e => setAdmin(e.target.value)} className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[12px] text-[var(--color-text-primary)] outline-none">{crm.team.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
      </div>
      <button onClick={submit} className="w-full bg-[var(--color-ember)] text-white text-[11px] font-semibold py-2 rounded-lg hover:bg-[var(--color-ember-hover)] transition-colors">Report Issue</button>
    </div>
  );
}

/* ===== FLAG DRAWER ===== */
function FlagDrawer({ crm, flagId, onClose }: any) {
  const flag = crm.flags.find((f: any) => f.id === flagId);
  if (!flag) return null;
  const client = crm.clients.find((c: any) => c.id === flag.clientId);
  const [logText, setLogText] = useState("");

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-bold">{flag.title}</h3>
        <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">×</button>
      </div>
      <p className="text-[12px] text-[var(--color-text-secondary)]">{flag.description}</p>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between"><span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">Project</span><span className="text-[12px]">{client?.name || "—"}</span></div>
        <div className="flex items-center justify-between"><span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">Severity</span><span className="text-[12px]">{flag.severity}</span></div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">Status</span>
          <select value={flag.status} onChange={e => crm.updateFlagStatus(flagId, e.target.value)} className="text-[11px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded px-2 py-0.5 text-[var(--color-text-primary)] outline-none">
            {(["Open","Investigating","In Dev","Resolved"] as FlagStatus[]).map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">Assigned</span>
          <select value={flag.assignedAdminId || ""} onChange={e => crm.assignFlagAdmin(flagId, e.target.value)} className="text-[11px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded px-2 py-0.5 text-[var(--color-text-primary)] outline-none">
            {crm.team.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      </div>

      <div className="border-t border-[var(--color-border)] pt-4">
        <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Dev Log</p>
        {flag.sprintLogs.map((l: any) => (
          <div key={l.id} className="p-2 rounded-lg bg-[var(--color-bg)] mb-1">
            <span className="text-[10px] font-semibold text-[var(--color-text-primary)]">{l.author}</span>
            <span className="text-[9px] text-[var(--color-text-muted)] ml-2">{l.timestamp}</span>
            <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">{l.text}</p>
          </div>
        ))}
        <div className="flex gap-2 mt-2">
          <input value={logText} onChange={e => setLogText(e.target.value)} placeholder="Add update..." className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-[11px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-ember)] placeholder:text-[var(--color-text-faint)]" onKeyDown={e => { if (e.key === "Enter" && logText.trim()) { crm.addFlagSprintLog(flagId, crm.userProfile?.name || "Admin", logText.trim()); setLogText(""); } }} />
          <button onClick={() => { if (logText.trim()) { crm.addFlagSprintLog(flagId, crm.userProfile?.name || "Admin", logText.trim()); setLogText(""); } }} className="px-3 py-1.5 bg-[var(--color-ember)] text-white text-[10px] rounded-lg">Add</button>
        </div>
      </div>

      <div className="border-t border-[var(--color-border)] pt-4">
        <button onClick={() => { crm.deleteFlag(flagId); onClose(); }} className="text-[10px] text-[var(--color-bad)] hover:underline">Delete issue</button>
      </div>
    </div>
  );
}

/* ===== SECTION 6: PRODUCTS ===== */
function ProductsSection({ crm }: any) {
  const { products } = crm;
  const stageColor = (s: string) => s === "Beta" || s === "Live" ? "bg-[var(--color-ok)]" : s === "In Dev" ? "bg-[var(--color-warn)]" : "bg-[var(--color-text-muted)]";

  return (
    <div className="space-y-3 max-w-3xl">
      <h3 className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-muted)]">Internal Products</h3>
      {products.map((p: any) => {
        const lead = crm.team.find((t: any) => t.id === p.leadId);
        return (
          <div key={p.id} className="bg-[var(--color-surface)] border border-[var(--color-border-card)] rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="text-[14px] font-semibold text-[var(--color-card-text)]">{p.name}</h4>
                <p className="text-[11px] text-[var(--color-card-text-muted)]">{p.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${stageColor(p.stage)}`} />
                <span className="text-[11px] font-medium text-[var(--color-card-text-secondary)]">{p.stage}</span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 bg-[var(--color-surface-deep)] rounded-full overflow-hidden mt-3">
              <div className="h-full bg-[var(--color-ember)] rounded-full transition-all" style={{ width: `${p.progress}%` }} />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10px] text-[var(--color-card-text-muted)]">{p.progress}% complete</span>
              <span className="text-[10px] text-[var(--color-card-text-muted)]">Lead: {lead?.name || "—"}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
