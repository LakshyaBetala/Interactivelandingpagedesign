"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCRM, ClientStage, OutreachStatus, TaskStatus, FlagSeverity, FlagStatus } from "./CRMContext";
import ClientPortalView from "./ClientPortalView";

// Helpers
const formatINR = (n: number) => n > 0 ? "₹" + n.toLocaleString("en-IN") : "—";
const STAGES: ClientStage[] = ["Lead", "Requirements", "Demo", "Quoted", "Confirmed", "Maintenance"];
const LEAD_STATUSES: OutreachStatus[] = ["Lead", "Contacted", "Responded", "Requirements", "Demo", "Quoted", "Converted", "Lost"];
const TASK_STATUSES: TaskStatus[] = ["Todo", "In Progress", "In Review", "Resolved"];
const SEVERITIES: FlagSeverity[] = ["Critical", "High", "Medium", "Low"];
const FLAG_STATUSES: FlagStatus[] = ["Open", "Investigating", "In Dev", "Resolved"];

const stageColor = (s: string) => {
  if (s === "Confirmed" || s === "Maintenance" || s === "Converted" || s === "Resolved" || s === "Approved") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s === "Quoted" || s === "Demo" || s === "In Review" || s === "Awaiting Review") return "bg-blue-50 text-blue-700 border-blue-200";
  if (s === "Requirements" || s === "Responded" || s === "In Progress" || s === "Investigating" || s === "In Dev") return "bg-amber-50 text-amber-700 border-amber-200";
  if (s === "Lead" || s === "Contacted" || s === "Todo" || s === "Open") return "bg-slate-50 text-slate-600 border-slate-200";
  if (s === "Lost" || s === "Critical") return "bg-red-50 text-red-700 border-red-200";
  return "bg-slate-50 text-slate-600 border-slate-200";
};

const severityDot = (s: FlagSeverity) => {
  if (s === "Critical") return "bg-red-500";
  if (s === "High") return "bg-amber-500";
  if (s === "Medium") return "bg-yellow-400";
  return "bg-slate-300";
};

type Tab = "projects" | "leads" | "tasks" | "issues" | "team" | "client-view";

export default function AdminDashboard() {
  const crm = useCRM();
  const { clients, team, leads, internalTasks, flags, comments, activities, userProfile, isSupabaseOnline, signOut } = crm;
  const [activeTab, setActiveTab] = useState<Tab>("projects");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedFlagId, setSelectedFlagId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const isIntern = userProfile?.role?.toLowerCase().includes("intern") || false;
  const isCorePartner = ["a1", "a2", "a3", "a4"].includes(crm.currentAdminId) || 
    ["lakshbetala15@gmail.com", "gandhimouriyan1234@gmail.com", "monarchankit25@gmail.com", "muskanabani01@gmail.com"]
      .includes(userProfile?.email?.toLowerCase() || "");

  // Stats
  const confirmedProjects = clients.filter(c => c.stage === "Confirmed" || c.stage === "Maintenance").length;
  const pipelineValue = clients.reduce((sum, c) => sum + c.revenue, 0) + leads.reduce((sum, l) => sum + l.estimatedValue, 0);
  const openIssues = flags.filter(f => f.status !== "Resolved").length;
  const activeTasks = internalTasks.filter(t => t.status !== "Resolved").length;

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "projects", label: "Projects", count: clients.length },
    { id: "leads", label: "Leads", count: leads.length },
    { id: "tasks", label: "Tasks", count: activeTasks },
    { id: "issues", label: "Issues", count: openIssues },
    { id: "team", label: "Team", count: team.length },
    { id: "client-view", label: "Client View" },
  ];

  const closeDrawer = () => { setSelectedProjectId(null); setSelectedLeadId(null); setSelectedTaskId(null); setSelectedFlagId(null); };
  const drawerOpen = selectedProjectId !== null || selectedLeadId !== null || selectedTaskId !== null || selectedFlagId !== null;

  return (
    <div className="flex h-screen bg-[var(--color-bg)] text-[var(--color-text)] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col">
        <div className="p-5 pb-4">
          <h1 className="text-base font-bold tracking-tight">almmatix</h1>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">Management Console</p>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); closeDrawer(); setShowAddForm(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                activeTab === tab.id
                  ? "bg-[var(--color-accent)] text-white"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? "bg-white/20" : "bg-[var(--color-border-light)]"
                }`}>{tab.count}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[var(--color-border)] space-y-3">
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseOnline ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
            <span className="text-[11px] text-[var(--color-text-muted)]">{isSupabaseOnline ? "Connected" : "Offline"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium">{userProfile?.name || "Admin"}</span>
            <button onClick={signOut} className="text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors">Sign out</button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 flex-shrink-0 border-b border-[var(--color-border)] flex items-center justify-between px-6 bg-[var(--color-surface)]">
          <h2 className="text-[15px] font-semibold">{tabs.find(t => t.id === activeTab)?.label}</h2>
          {activeTab !== "client-view" && activeTab !== "team" && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 bg-[var(--color-accent)] text-white text-[12px] font-medium rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              + New
            </button>
          )}
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Content area */}
          <div className="flex-1 overflow-y-auto crm-scrollbar p-6">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {activeTab === "projects" && <ProjectsTab crm={crm} isIntern={isIntern} onSelect={setSelectedProjectId} selectedId={selectedProjectId} showAdd={showAddForm} onCloseAdd={() => setShowAddForm(false)} stats={{ confirmedProjects, pipelineValue, openIssues, activeTasks }} />}
                {activeTab === "leads" && <LeadsTab crm={crm} onSelect={setSelectedLeadId} selectedId={selectedLeadId} showAdd={showAddForm} onCloseAdd={() => setShowAddForm(false)} />}
                {activeTab === "tasks" && <TasksTab crm={crm} onSelect={setSelectedTaskId} showAdd={showAddForm} onCloseAdd={() => setShowAddForm(false)} />}
                {activeTab === "issues" && <IssuesTab crm={crm} onSelect={setSelectedFlagId} showAdd={showAddForm} onCloseAdd={() => setShowAddForm(false)} />}
                {activeTab === "team" && <TeamTab crm={crm} isCorePartner={isCorePartner} />}
                {activeTab === "client-view" && <div className="bg-[var(--color-dark-bg)] rounded-xl overflow-hidden -m-6 min-h-full"><ClientPortalView /></div>}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Drawer */}
          <AnimatePresence>
            {drawerOpen && (
              <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 420, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as const }} className="flex-shrink-0 border-l border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
                <div className="w-[420px] h-full overflow-y-auto crm-scrollbar">
                  {selectedProjectId !== null && <ProjectDrawer crm={crm} clientId={selectedProjectId} isIntern={isIntern} onClose={closeDrawer} />}
                  {selectedLeadId !== null && <LeadDrawer crm={crm} leadId={selectedLeadId} onClose={closeDrawer} />}
                  {selectedTaskId !== null && <TaskDrawer crm={crm} taskId={selectedTaskId} onClose={closeDrawer} />}
                  {selectedFlagId !== null && <FlagDrawer crm={crm} flagId={selectedFlagId} onClose={closeDrawer} />}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// ===== PROJECTS TAB =====
function ProjectsTab({ crm, isIntern, onSelect, selectedId, showAdd, onCloseAdd, stats }: any) {
  const { clients, team } = crm;
  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Confirmed", value: stats.confirmedProjects, color: "text-emerald-600" },
          { label: "Pipeline", value: formatINR(stats.pipelineValue), color: "text-blue-600" },
          { label: "Open issues", value: stats.openIssues, color: stats.openIssues > 0 ? "text-amber-600" : "text-slate-500" },
          { label: "Active tasks", value: stats.activeTasks, color: "text-slate-700" },
        ].map(s => (
          <div key={s.label} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
            <p className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showAdd && <AddClientForm crm={crm} onClose={onCloseAdd} />}

      {/* Project list */}
      <div className="space-y-2">
        {clients.map((c: any) => {
          const owner = team.find((t: any) => t.id === c.assignedAdminId);
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-150 ${
                selectedId === c.id
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-light)]/30"
                  : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)]/40 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-500 flex-shrink-0">{c.avatar}</span>
                    <div className="min-w-0">
                      <h3 className="text-[14px] font-semibold truncate">{c.name}</h3>
                      <p className="text-[12px] text-[var(--color-text-secondary)] truncate">{c.project} · {c.location}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  {!isIntern && c.revenue > 0 && <span className="text-[12px] font-semibold text-[var(--color-text)]">{formatINR(c.revenue)}</span>}
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${stageColor(c.stage)}`}>{c.stage}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2.5 ml-10">
                <span className="text-[11px] text-[var(--color-text-muted)]">{owner?.name || "Unassigned"}</span>
                <span className="text-[11px] text-[var(--color-text-muted)]">·</span>
                <span className="text-[11px] text-[var(--color-text-muted)] truncate">{c.lastActivity}</span>
                <span className="text-[11px] text-[var(--color-text-muted)]">·</span>
                <span className="text-[11px] text-[var(--color-text-muted)]">Health {c.health}%</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ===== ADD CLIENT FORM =====
function AddClientForm({ crm, onClose }: any) {
  const [name, setName] = useState(""); const [project, setProject] = useState(""); const [location, setLocation] = useState("India");
  const [stage, setStage] = useState<ClientStage>("Lead"); const [revenue, setRevenue] = useState(0); const [admin, setAdmin] = useState("a1");
  const submit = () => {
    if (!name || !project) return;
    crm.addNewClient({ name, project, location, category: (stage === "Lead" || stage === "Requirements" || stage === "Demo" || stage === "Quoted") ? "Potential" as const : "Ongoing" as const, stage, revenue, assignedAdminId: admin });
    onClose();
  };
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between"><h3 className="text-[13px] font-semibold">Add Project</h3><button onClick={onClose} className="text-[var(--color-text-muted)] text-lg">×</button></div>
      <div className="grid grid-cols-2 gap-3">
        <input placeholder="Client name" value={name} onChange={e => setName(e.target.value)} className="col-span-2 border border-[var(--color-border)] rounded-lg px-3 py-2 text-[13px] bg-transparent outline-none focus:border-[var(--color-accent)]" />
        <input placeholder="Project name" value={project} onChange={e => setProject(e.target.value)} className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-[13px] bg-transparent outline-none focus:border-[var(--color-accent)]" />
        <input placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-[13px] bg-transparent outline-none focus:border-[var(--color-accent)]" />
        <select value={stage} onChange={e => setStage(e.target.value as ClientStage)} className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-[13px] bg-transparent outline-none">
          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input type="number" placeholder="Revenue (₹)" value={revenue || ""} onChange={e => setRevenue(Number(e.target.value))} className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-[13px] bg-transparent outline-none focus:border-[var(--color-accent)]" />
        <select value={admin} onChange={e => setAdmin(e.target.value)} className="col-span-2 border border-[var(--color-border)] rounded-lg px-3 py-2 text-[13px] bg-transparent outline-none">
          {crm.team.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <button onClick={submit} className="w-full bg-[var(--color-accent)] text-white text-[12px] font-medium py-2 rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors">Add Project</button>
    </div>
  );
}

// ===== PROJECT DRAWER =====
function ProjectDrawer({ crm, clientId, isIntern, onClose }: any) {
  const client = crm.clients.find((c: any) => c.id === clientId);
  if (!client) return null;
  const owner = crm.team.find((t: any) => t.id === client.assignedAdminId);
  const projectComments = crm.comments.filter((c: any) => c.clientId === clientId);
  const projectFlags = crm.flags.filter((f: any) => f.clientId === clientId);
  const projectTasks = crm.internalTasks.filter((t: any) => t.clientId === clientId);

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold">{client.name}</h3>
        <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-lg">×</button>
      </div>

      {/* Editable fields */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase">Project</span>
          <span className="text-[13px]">{client.project}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase">Location</span>
          <span className="text-[13px]">{client.location}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase">Stage</span>
          <select value={client.stage} onChange={e => crm.updateClientStage(clientId, e.target.value as ClientStage)} className="text-[12px] border border-[var(--color-border)] rounded-lg px-2 py-1 bg-transparent outline-none">
            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase">Assigned to</span>
          <select value={client.assignedAdminId || ""} onChange={e => crm.updateClientAdmin(clientId, e.target.value)} className="text-[12px] border border-[var(--color-border)] rounded-lg px-2 py-1 bg-transparent outline-none">
            {crm.team.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase">Health</span>
          <span className="text-[13px] font-semibold">{client.health}%</span>
        </div>
      </div>

      {/* Financials - hidden from interns */}
      {!isIntern && (
        <div className="border-t border-[var(--color-border)] pt-4">
          <p className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase mb-2">Financials</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-[10px] text-[var(--color-text-muted)]">Revenue</p>
              <p className="text-[15px] font-bold">{formatINR(client.revenue)}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-[10px] text-[var(--color-text-muted)]">Spent (est.)</p>
              <p className="text-[15px] font-bold">{formatINR(Math.round(client.revenue * 0.45))}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tasks */}
      {projectTasks.length > 0 && (
        <div className="border-t border-[var(--color-border)] pt-4">
          <p className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase mb-2">Tasks ({projectTasks.length})</p>
          <div className="space-y-1.5">
            {projectTasks.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <span className="text-[12px] truncate flex-1">{t.title}</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${stageColor(t.status)}`}>{t.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Issues */}
      {projectFlags.length > 0 && (
        <div className="border-t border-[var(--color-border)] pt-4">
          <p className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase mb-2">Issues ({projectFlags.length})</p>
          <div className="space-y-1.5">
            {projectFlags.map((f: any) => (
              <div key={f.id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
                <span className={`w-2 h-2 rounded-full ${severityDot(f.severity)}`} />
                <span className="text-[12px] truncate flex-1">{f.title}</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${stageColor(f.status)}`}>{f.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent comments */}
      {projectComments.length > 0 && (
        <div className="border-t border-[var(--color-border)] pt-4">
          <p className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase mb-2">Recent feedback</p>
          <div className="space-y-2">
            {projectComments.slice(0, 5).map((c: any) => (
              <div key={c.id} className="p-2.5 rounded-lg bg-slate-50">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-semibold">{c.author}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${c.role === "admin" ? "bg-blue-100 text-blue-600" : "bg-slate-200 text-slate-600"}`}>{c.role}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)] ml-auto">{c.timeElapsed}</span>
                </div>
                <p className="text-[12px] text-[var(--color-text-secondary)]">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete */}
      <div className="border-t border-[var(--color-border)] pt-4">
        <button onClick={() => { crm.deleteClient(clientId); onClose(); }} className="text-[11px] text-[var(--color-danger)] hover:underline">Delete project</button>
      </div>
    </div>
  );
}

// ===== LEADS TAB =====
function LeadsTab({ crm, onSelect, selectedId, showAdd, onCloseAdd }: any) {
  const { leads, team } = crm;
  return (
    <div className="space-y-4">
      {showAdd && <AddLeadForm crm={crm} onClose={onCloseAdd} />}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        <table className="w-full text-[13px]">
          <thead><tr className="border-b border-[var(--color-border)] text-[11px] font-medium text-[var(--color-text-muted)] uppercase">
            <th className="text-left p-3">Company</th><th className="text-left p-3">Project</th><th className="text-left p-3">Source</th><th className="text-left p-3">Value</th><th className="text-left p-3">Status</th><th className="text-left p-3">Owner</th>
          </tr></thead>
          <tbody>
            {leads.map((l: any) => {
              const owner = team.find((t: any) => t.id === l.assignedAdminId);
              return (
                <tr key={l.id} onClick={() => onSelect(l.id)} className={`border-b border-[var(--color-border-light)] cursor-pointer transition-colors ${selectedId === l.id ? "bg-[var(--color-accent-light)]/30" : "hover:bg-[var(--color-surface-hover)]"}`}>
                  <td className="p-3 font-medium">{l.companyName}</td>
                  <td className="p-3 text-[var(--color-text-secondary)] max-w-[200px] truncate">{l.projectDescription}</td>
                  <td className="p-3 text-[var(--color-text-secondary)]">{l.source}</td>
                  <td className="p-3 font-medium">{formatINR(l.estimatedValue)}</td>
                  <td className="p-3"><span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${stageColor(l.status)}`}>{l.status}</span></td>
                  <td className="p-3 text-[var(--color-text-secondary)]">{owner?.name || "—"}</td>
                </tr>
              );
            })}
            {leads.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-[var(--color-text-muted)]">No leads yet. Click + New to add one.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddLeadForm({ crm, onClose }: any) {
  const [company, setCompany] = useState(""); const [desc, setDesc] = useState(""); const [source, setSource] = useState<any>("LinkedIn"); const [value, setValue] = useState(0); const [admin, setAdmin] = useState("a3");
  const submit = () => {
    if (!company) return;
    crm.addNewLead({ companyName: company, projectDescription: desc, source, status: "Lead" as const, estimatedValue: value, assignedAdminId: admin, sourcedById: admin, engagementScore: 10 });
    onClose();
  };
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between"><h3 className="text-[13px] font-semibold">Add Lead</h3><button onClick={onClose} className="text-[var(--color-text-muted)] text-lg">×</button></div>
      <div className="grid grid-cols-2 gap-3">
        <input placeholder="Company name" value={company} onChange={e => setCompany(e.target.value)} className="col-span-2 border border-[var(--color-border)] rounded-lg px-3 py-2 text-[13px] bg-transparent outline-none focus:border-[var(--color-accent)]" />
        <input placeholder="Project description" value={desc} onChange={e => setDesc(e.target.value)} className="col-span-2 border border-[var(--color-border)] rounded-lg px-3 py-2 text-[13px] bg-transparent outline-none focus:border-[var(--color-accent)]" />
        <select value={source} onChange={e => setSource(e.target.value)} className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-[13px] bg-transparent outline-none">
          {["Cold Call", "LinkedIn", "Twitter", "Email", "Referral", "Instagram", "Social Media"].map(s => <option key={s}>{s}</option>)}
        </select>
        <input type="number" placeholder="Est. value (₹)" value={value || ""} onChange={e => setValue(Number(e.target.value))} className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-[13px] bg-transparent outline-none focus:border-[var(--color-accent)]" />
        <select value={admin} onChange={e => setAdmin(e.target.value)} className="col-span-2 border border-[var(--color-border)] rounded-lg px-3 py-2 text-[13px] bg-transparent outline-none">
          {crm.team.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <button onClick={submit} className="w-full bg-[var(--color-accent)] text-white text-[12px] font-medium py-2 rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors">Add Lead</button>
    </div>
  );
}

// ===== LEAD DRAWER =====
function LeadDrawer({ crm, leadId, onClose }: any) {
  const lead = crm.leads.find((l: any) => l.id === leadId);
  if (!lead) return null;
  const [noteText, setNoteText] = useState("");
  const owner = crm.team.find((t: any) => t.id === lead.assignedAdminId);

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold">{lead.companyName}</h3>
        <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-lg">×</button>
      </div>
      <p className="text-[13px] text-[var(--color-text-secondary)]">{lead.projectDescription}</p>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase">Status</span>
          <select value={lead.status} onChange={e => crm.updateLeadStatus(leadId, e.target.value)} className="text-[12px] border border-[var(--color-border)] rounded-lg px-2 py-1 bg-transparent outline-none">
            {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase">Source</span>
          <span className="text-[13px]">{lead.source}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase">Value</span>
          <span className="text-[13px] font-semibold">{formatINR(lead.estimatedValue)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase">Calls made</span>
          <div className="flex items-center gap-2">
            <span className="text-[13px]">{lead.callsMade}</span>
            <button onClick={() => crm.incrementLeadCalls(leadId)} className="text-[11px] px-2 py-0.5 bg-slate-100 rounded hover:bg-slate-200 transition-colors">+1</button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase">Owner</span>
          <span className="text-[13px]">{owner?.name || "—"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase">Last contacted</span>
          <span className="text-[13px]">{lead.lastContacted}</span>
        </div>
      </div>

      {/* Notes */}
      <div className="border-t border-[var(--color-border)] pt-4">
        <p className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase mb-2">Notes</p>
        <div className="space-y-1.5 mb-3">
          {lead.notes.map((n: string, i: number) => (
            <div key={i} className="p-2 rounded-lg bg-slate-50 text-[12px]">{n}</div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add a note..." className="flex-1 border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-[12px] bg-transparent outline-none focus:border-[var(--color-accent)]" onKeyDown={e => { if (e.key === "Enter" && noteText.trim()) { crm.addLeadNote(leadId, noteText.trim()); setNoteText(""); } }} />
          <button onClick={() => { if (noteText.trim()) { crm.addLeadNote(leadId, noteText.trim()); setNoteText(""); } }} className="px-3 py-1.5 bg-[var(--color-accent)] text-white text-[11px] rounded-lg hover:bg-[var(--color-accent-hover)]">Add</button>
        </div>
      </div>

      {/* Convert */}
      {lead.status !== "Converted" && lead.status !== "Lost" && (
        <div className="border-t border-[var(--color-border)] pt-4 space-y-2">
          <button onClick={() => { crm.convertLeadToClient(leadId); onClose(); }} className="w-full bg-emerald-600 text-white text-[12px] font-medium py-2 rounded-lg hover:bg-emerald-700 transition-colors">Convert to Project</button>
          <button onClick={() => { crm.deleteLead(leadId); onClose(); }} className="text-[11px] text-[var(--color-danger)] hover:underline">Delete lead</button>
        </div>
      )}
    </div>
  );
}

// ===== TASKS TAB (KANBAN) =====
function TasksTab({ crm, onSelect, showAdd, onCloseAdd }: any) {
  const { internalTasks, team, clients } = crm;

  const columns: { status: TaskStatus; label: string }[] = [
    { status: "Todo", label: "To Do" },
    { status: "In Progress", label: "In Progress" },
    { status: "In Review", label: "Review" },
    { status: "Resolved", label: "Done" },
  ];

  return (
    <div className="space-y-4">
      {showAdd && <AddTaskForm crm={crm} onClose={onCloseAdd} />}
      <div className="grid grid-cols-4 gap-4 min-h-[400px]">
        {columns.map(col => {
          const tasks = internalTasks.filter((t: any) => t.status === col.status);
          return (
            <div key={col.status} className="space-y-2">
              <div className="flex items-center justify-between px-1 mb-1">
                <h4 className="text-[12px] font-semibold text-[var(--color-text-secondary)]">{col.label}</h4>
                <span className="text-[11px] text-[var(--color-text-muted)] bg-slate-100 px-1.5 py-0.5 rounded-full">{tasks.length}</span>
              </div>
              <div className="space-y-2">
                {tasks.map((t: any) => {
                  const owner = team.find((m: any) => m.id === t.assignedAdminId);
                  const client = clients.find((c: any) => c.id === t.clientId);
                  return (
                    <div key={t.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3 hover:shadow-sm transition-shadow cursor-pointer" onClick={() => onSelect(t.id)}>
                      <p className="text-[13px] font-medium leading-snug">{t.title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {client && <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-[var(--color-text-secondary)]">{client.name}</span>}
                        {owner && <span className="text-[10px] text-[var(--color-text-muted)] ml-auto">{owner.name}</span>}
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

function AddTaskForm({ crm, onClose }: any) {
  const [title, setTitle] = useState(""); const [admin, setAdmin] = useState("a1"); const [clientId, setClientId] = useState<number | undefined>(undefined);
  const submit = () => {
    if (!title) return;
    crm.addInternalTask({ title, assignedAdminId: admin, clientId, productId: undefined, originCommentId: undefined });
    onClose();
  };
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between"><h3 className="text-[13px] font-semibold">Add Task</h3><button onClick={onClose} className="text-[var(--color-text-muted)] text-lg">×</button></div>
      <input placeholder="Task title" value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-[13px] bg-transparent outline-none focus:border-[var(--color-accent)]" />
      <div className="grid grid-cols-2 gap-3">
        <select value={admin} onChange={e => setAdmin(e.target.value)} className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-[13px] bg-transparent outline-none">
          {crm.team.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select value={clientId ?? ""} onChange={e => setClientId(e.target.value ? Number(e.target.value) : undefined)} className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-[13px] bg-transparent outline-none">
          <option value="">No project</option>
          {crm.clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <button onClick={submit} className="w-full bg-[var(--color-accent)] text-white text-[12px] font-medium py-2 rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors">Add Task</button>
    </div>
  );
}

// ===== TASK DRAWER =====
function TaskDrawer({ crm, taskId, onClose }: any) {
  const task = crm.internalTasks.find((t: any) => t.id === taskId);
  if (!task) return null;
  const owner = crm.team.find((t: any) => t.id === task.assignedAdminId);
  const client = crm.clients.find((c: any) => c.id === task.clientId);
  const [noteText, setNoteText] = useState("");

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold">{task.title}</h3>
        <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-lg">×</button>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase">Status</span>
          <select value={task.status} onChange={e => crm.updateInternalTaskStatus(taskId, e.target.value)} className="text-[12px] border border-[var(--color-border)] rounded-lg px-2 py-1 bg-transparent outline-none">
            {TASK_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase">Assigned to</span>
          <select value={task.assignedAdminId} onChange={e => crm.updateInternalTask(taskId, { assignedAdminId: e.target.value })} className="text-[12px] border border-[var(--color-border)] rounded-lg px-2 py-1 bg-transparent outline-none">
            {crm.team.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        {client && <div className="flex items-center justify-between"><span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase">Project</span><span className="text-[13px]">{client.name}</span></div>}
        <div className="flex items-center justify-between"><span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase">Created</span><span className="text-[13px]">{task.createdAt}</span></div>
      </div>

      <div className="border-t border-[var(--color-border)] pt-4">
        <p className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase mb-2">Internal notes</p>
        <div className="space-y-1.5 mb-3">
          {task.internalNotes.map((n: string, i: number) => <div key={i} className="p-2 rounded-lg bg-slate-50 text-[12px]">{n}</div>)}
        </div>
        <div className="flex gap-2">
          <input value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add a note..." className="flex-1 border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-[12px] bg-transparent outline-none focus:border-[var(--color-accent)]" onKeyDown={e => { if (e.key === "Enter" && noteText.trim()) { crm.addInternalTaskNote(taskId, noteText.trim()); setNoteText(""); } }} />
          <button onClick={() => { if (noteText.trim()) { crm.addInternalTaskNote(taskId, noteText.trim()); setNoteText(""); } }} className="px-3 py-1.5 bg-[var(--color-accent)] text-white text-[11px] rounded-lg">Add</button>
        </div>
      </div>

      <div className="border-t border-[var(--color-border)] pt-4">
        <button onClick={() => { crm.deleteInternalTask(taskId); onClose(); }} className="text-[11px] text-[var(--color-danger)] hover:underline">Delete task</button>
      </div>
    </div>
  );
}

// ===== ISSUES TAB =====
function IssuesTab({ crm, onSelect, showAdd, onCloseAdd }: any) {
  const { flags, clients, team } = crm;
  return (
    <div className="space-y-4">
      {showAdd && <AddIssueForm crm={crm} onClose={onCloseAdd} />}
      <div className="space-y-2">
        {flags.map((f: any) => {
          const client = clients.find((c: any) => c.id === f.clientId);
          const owner = team.find((t: any) => t.id === f.assignedAdminId);
          return (
            <button key={f.id} onClick={() => onSelect(f.id)} className="w-full text-left p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)]/40 hover:shadow-sm transition-all">
              <div className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${severityDot(f.severity)}`} />
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13px] font-semibold truncate">{f.title}</h4>
                  <p className="text-[11px] text-[var(--color-text-muted)]">{client?.name || "Unknown"} · {owner?.name || "Unassigned"}</p>
                </div>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${stageColor(f.status)}`}>{f.status}</span>
              </div>
            </button>
          );
        })}
        {flags.length === 0 && <div className="text-center py-12 text-[var(--color-text-muted)]">No issues. Looking good!</div>}
      </div>
    </div>
  );
}

function AddIssueForm({ crm, onClose }: any) {
  const [title, setTitle] = useState(""); const [desc, setDesc] = useState(""); const [severity, setSeverity] = useState<FlagSeverity>("Medium");
  const [clientId, setClientId] = useState(crm.clients[0]?.id || 1); const [admin, setAdmin] = useState("a1");
  const submit = () => {
    if (!title) return;
    crm.addFlag({ clientId, title, description: desc, severity, assignedAdminId: admin });
    onClose();
  };
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between"><h3 className="text-[13px] font-semibold">Report Issue</h3><button onClick={onClose} className="text-[var(--color-text-muted)] text-lg">×</button></div>
      <input placeholder="Issue title" value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-[13px] bg-transparent outline-none focus:border-[var(--color-accent)]" />
      <textarea placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} rows={2} className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-[13px] bg-transparent outline-none focus:border-[var(--color-accent)] resize-none" />
      <div className="grid grid-cols-3 gap-3">
        <select value={severity} onChange={e => setSeverity(e.target.value as FlagSeverity)} className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-[13px] bg-transparent outline-none">
          {SEVERITIES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={clientId} onChange={e => setClientId(Number(e.target.value))} className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-[13px] bg-transparent outline-none">
          {crm.clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={admin} onChange={e => setAdmin(e.target.value)} className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-[13px] bg-transparent outline-none">
          {crm.team.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>
      <button onClick={submit} className="w-full bg-[var(--color-accent)] text-white text-[12px] font-medium py-2 rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors">Report Issue</button>
    </div>
  );
}

// ===== FLAG DRAWER =====
function FlagDrawer({ crm, flagId, onClose }: any) {
  const flag = crm.flags.find((f: any) => f.id === flagId);
  if (!flag) return null;
  const client = crm.clients.find((c: any) => c.id === flag.clientId);
  const owner = crm.team.find((t: any) => t.id === flag.assignedAdminId);
  const [logText, setLogText] = useState("");

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold">{flag.title}</h3>
        <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-lg">×</button>
      </div>
      <p className="text-[13px] text-[var(--color-text-secondary)]">{flag.description}</p>

      <div className="space-y-3">
        <div className="flex items-center justify-between"><span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase">Project</span><span className="text-[13px]">{client?.name || "—"}</span></div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase">Severity</span>
          <div className="flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${severityDot(flag.severity)}`} /><span className="text-[13px]">{flag.severity}</span></div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase">Status</span>
          <select value={flag.status} onChange={e => crm.updateFlagStatus(flagId, e.target.value)} className="text-[12px] border border-[var(--color-border)] rounded-lg px-2 py-1 bg-transparent outline-none">
            {FLAG_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase">Assigned to</span>
          <select value={flag.assignedAdminId || ""} onChange={e => crm.assignFlagAdmin(flagId, e.target.value)} className="text-[12px] border border-[var(--color-border)] rounded-lg px-2 py-1 bg-transparent outline-none">
            {crm.team.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      </div>

      {/* Dev logs */}
      <div className="border-t border-[var(--color-border)] pt-4">
        <p className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase mb-2">Developer log</p>
        <div className="space-y-1.5 mb-3">
          {flag.sprintLogs.map((l: any) => (
            <div key={l.id} className="p-2 rounded-lg bg-slate-50">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] font-semibold">{l.author}</span>
                <span className="text-[10px] text-[var(--color-text-muted)]">{l.timestamp}</span>
              </div>
              <p className="text-[12px] text-[var(--color-text-secondary)]">{l.text}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={logText} onChange={e => setLogText(e.target.value)} placeholder="Add update..." className="flex-1 border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-[12px] bg-transparent outline-none focus:border-[var(--color-accent)]" onKeyDown={e => { if (e.key === "Enter" && logText.trim()) { crm.addFlagSprintLog(flagId, crm.userProfile?.name || "Admin", logText.trim()); setLogText(""); } }} />
          <button onClick={() => { if (logText.trim()) { crm.addFlagSprintLog(flagId, crm.userProfile?.name || "Admin", logText.trim()); setLogText(""); } }} className="px-3 py-1.5 bg-[var(--color-accent)] text-white text-[11px] rounded-lg">Add</button>
        </div>
      </div>

      <div className="border-t border-[var(--color-border)] pt-4">
        <button onClick={() => { crm.deleteFlag(flagId); onClose(); }} className="text-[11px] text-[var(--color-danger)] hover:underline">Delete issue</button>
      </div>
    </div>
  );
}

// ===== TEAM TAB =====
function TeamTab({ crm, isCorePartner }: any) {
  const { team, clients, internalTasks, leads, authorizedEmails } = crm;
  const [showInvite, setShowInvite] = useState(false);

  return (
    <div className="space-y-6">
      {/* Team grid */}
      <div className="grid grid-cols-2 gap-4">
        {team.map((m: any) => {
          const memberProjects = clients.filter((c: any) => c.assignedAdminId === m.id).length;
          const memberTasks = internalTasks.filter((t: any) => t.assignedAdminId === m.id && t.status !== "Resolved").length;
          const memberLeads = leads.filter((l: any) => l.assignedAdminId === m.id).length;
          return (
            <div key={m.id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold text-white" style={{ backgroundColor: m.colorVar?.replace("var(", "").replace(")", "") || "#64748B" }}>{m.avatar}</span>
                <div>
                  <h4 className="text-[14px] font-semibold">{m.name}</h4>
                  <p className="text-[11px] text-[var(--color-text-secondary)]">{m.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-[var(--color-text-muted)]">
                <span>{memberProjects} projects</span>
                <span>{memberTasks} tasks</span>
                <span>{memberLeads} leads</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invite form */}
      {isCorePartner && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold">Invite Team Member</h3>
            <button onClick={() => setShowInvite(!showInvite)} className="text-[12px] text-[var(--color-accent)] hover:underline">{showInvite ? "Cancel" : "+ Invite"}</button>
          </div>
          {showInvite && <InviteForm crm={crm} onClose={() => setShowInvite(false)} />}

          {/* Authorized emails */}
          {authorizedEmails.length > 0 && (
            <div className="border-t border-[var(--color-border)] pt-4">
              <p className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase mb-2">Authorized accounts ({authorizedEmails.length})</p>
              <div className="space-y-1.5">
                {authorizedEmails.map((ae: any) => (
                  <div key={ae.email} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                    <div>
                      <p className="text-[12px] font-medium">{ae.name}</p>
                      <p className="text-[11px] text-[var(--color-text-muted)]">{ae.email} · {ae.role} · {ae.category}</p>
                    </div>
                    <button onClick={() => crm.deprovisionUser(ae.email)} className="text-[10px] text-[var(--color-danger)] hover:underline">Remove</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InviteForm({ crm, onClose }: any) {
  const [email, setEmail] = useState(""); const [name, setName] = useState(""); const [role, setRole] = useState("");
  const [category, setCategory] = useState<"admin" | "client">("admin"); const [clientId, setClientId] = useState<number | undefined>(undefined);
  const submit = async () => {
    if (!email || !name || !role) return;
    const avatar = name.split(" ").map(w => w[0]).join("").toUpperCase().substring(0, 2);
    await crm.provisionUser({ email, name, role, category, avatar, colorVar: "var(--color-admin-ankit)", primaryFocus: category === "admin" ? "Client Delivery" : "Product Sandbox", responsibilities: [], activeTasks: [], clientId });
    onClose();
  };
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="col-span-2 border border-[var(--color-border)] rounded-lg px-3 py-2 text-[13px] bg-transparent outline-none focus:border-[var(--color-accent)]" />
        <input placeholder="Full name" value={name} onChange={e => setName(e.target.value)} className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-[13px] bg-transparent outline-none focus:border-[var(--color-accent)]" />
        <input placeholder="Role title" value={role} onChange={e => setRole(e.target.value)} className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-[13px] bg-transparent outline-none focus:border-[var(--color-accent)]" />
        <select value={category} onChange={e => setCategory(e.target.value as any)} className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-[13px] bg-transparent outline-none">
          <option value="admin">Admin / Intern</option>
          <option value="client">Client</option>
        </select>
        {category === "client" && (
          <select value={clientId ?? ""} onChange={e => setClientId(e.target.value ? Number(e.target.value) : undefined)} className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-[13px] bg-transparent outline-none">
            <option value="">Link to project...</option>
            {crm.clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
      </div>
      <button onClick={submit} className="w-full bg-[var(--color-accent)] text-white text-[12px] font-medium py-2 rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors">Invite</button>
    </div>
  );
}
