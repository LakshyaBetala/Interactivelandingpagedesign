"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  useCRM, 
  CRMClient, 
  ClientStage, 
  TeamMember, 
  InternalProduct, 
  OutreachLead, 
  ProjectFlag, 
  ChangelogRelease, 
  FlagSeverity, 
  FlagStatus, 
  OutreachStatus, 
  LeadSource,
  InternalTask,
  TaskStatus,
  Comment
} from "./CRMContext";
import ClientPortalView from "./ClientPortalView";

// ═══════════════════════════════════════════════════════════════
//  SUBCOMPONENTS
// ═══════════════════════════════════════════════════════════════

function HealthRing({ score, size = 36 }: { score: number; size?: number }) {
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : "#EF4444";

  return (
    <svg width={size} height={size} className="health-ring" aria-label={`Health score: ${score}`}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1F1F1F" strokeWidth="2.5" />
      <circle 
        cx={size / 2} 
        cy={size / 2} 
        r={radius} 
        fill="none" 
        stroke={color} 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeDasharray={circumference} 
        strokeDashoffset={offset} 
      />
      <text 
        x="50%" 
        y="52%" 
        textAnchor="middle" 
        dy="0.35em" 
        fill={color} 
        fontSize="8.5" 
        fontWeight="800" 
        fontFamily="var(--font-mono)" 
        transform={`rotate(90 ${size / 2} ${size / 2})`}
      >
        {score}%
      </text>
    </svg>
  );
}

function StageBadge({ stage }: { stage: ClientStage }) {
  const styles: Record<ClientStage, string> = {
    Lead: "border border-[#1F1F1F] text-[#8E8E8E] bg-[#121212]",
    Proposal: "border border-amber-500/20 text-amber-500 bg-amber-500/5",
    "In Dev": "border border-[#06B6D4]/20 text-[#06B6D4] bg-[#06B6D4]/5",
    Active: "border border-emerald-500/20 text-emerald-500 bg-emerald-500/5",
    Completed: "border border-stone-700 text-stone-500 bg-stone-900/50 line-through",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-[0.55rem] uppercase tracking-[0.12em] font-mono font-bold ${styles[stage]}`}>
      {stage}
    </span>
  );
}

const formatCurrency = (amount: number) => {
  if (amount === 0) return "—";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
};

// ═══════════════════════════════════════════════════════════════
//  MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════

export default function AdminDashboard() {
  const { 
    clients: allClients, 
    team, 
    products, 
    activities, 
    comments, 
    leads, 
    flags: allFlags, 
    releases: allReleases, 
    internalTasks: allInternalTasks,
    currentAdminId, 
    updateClientStage, 
    updateClientAdmin, 
    deleteComment,
    updateLeadStatus,
    incrementLeadCalls,
    addLeadNote,
    convertLeadToClient,
    addNewLead,
    updateFlagStatus,
    assignFlagAdmin,
    addFlagSprintLog,
    createRelease,
    approveRelease,
    addInternalTask,
    updateInternalTaskStatus,
    addInternalTaskNote,
    addNewClient,
    deleteClient,
    deleteLead,
    deleteInternalTask,
    deleteFlag,
    deleteRelease,
    addFlag,
    userProfile,
    isSupabaseConfigured,
    isSupabaseOnline,
    signOut,
    authorizedEmails,
    provisionUser,
    deprovisionUser,
    purgeAllMockData,
    selectedClientId,
    setSelectedClientId
  } = useCRM();

  // Consolidated Navigation Tabs: operations, outreach, client_portal_view, staff_invites
  const [activeTab, setActiveTab] = useState("operations");
  
  // Drawer States
  const [selectedClient, setSelectedClient] = useState<CRMClient | null>(null);
  const [selectedTask, setSelectedTask] = useState<InternalTask | null>(null);
  const [selectedFlag, setSelectedFlag] = useState<ProjectFlag | null>(null);

  // Quick-log helper state
  const [newLeadNotes, setNewLeadNotes] = useState<Record<string, string>>({});
  const [newInternalTaskNotes, setNewInternalTaskNotes] = useState<Record<string, string>>({});
  const [newSupportSprintNotes, setNewSupportSprintNotes] = useState<Record<string, string>>({});

  // Manual Creation Modal/Forms Toggles
  const [showClientForm, setShowClientForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showFlagForm, setShowFlagForm] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);

  // Forms Fields States
  const [newClientName, setNewClientName] = useState("");
  const [newClientProject, setNewClientProject] = useState("");
  const [newClientRevenue, setNewClientRevenue] = useState("250000");
  const [newClientCategory, setNewClientCategory] = useState<"Ongoing" | "Potential">("Ongoing");
  const [newClientStage, setNewClientStage] = useState<ClientStage>("In Dev");
  const [newClientAssigned, setNewClientAssigned] = useState("a1");

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskClient, setNewTaskClient] = useState("");
  const [newTaskProduct, setNewTaskProduct] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("a2");

  const [newFlagTitle, setNewFlagTitle] = useState("");
  const [newFlagDesc, setNewFlagDesc] = useState("");
  const [newFlagSeverity, setNewFlagSeverity] = useState<FlagSeverity>("High");
  const [newFlagClient, setNewFlagClient] = useState("1");
  const [newFlagAssignee, setNewFlagAssignee] = useState("a2");

  const [newLeadCompany, setNewLeadCompany] = useState("");
  const [newLeadDesc, setNewLeadDesc] = useState("");
  const [newLeadVal, setNewLeadVal] = useState("200000");
  const [newLeadSource, setNewLeadSource] = useState<LeadSource>("LinkedIn");
  const [newLeadSourcedBy, setNewLeadSourcedBy] = useState("a3");
  const [newLeadAssigned, setNewLeadAssigned] = useState("a3");
  const [newLeadScore, setNewLeadScore] = useState("75");

  // Staff Pre-auth invite states
  const [provEmail, setProvEmail] = useState("");
  const [provName, setProvName] = useState("");
  const [provRole, setProvRole] = useState("Dev Intern");
  const [provCategory, setProvCategory] = useState<"admin" | "client">("admin");
  const [provFocus, setProvFocus] = useState<"Client Delivery" | "Outreach & Marketing">("Client Delivery");
  const [provResponsibilities, setProvResponsibilities] = useState<string[]>([]);
  const [provClientId, setProvClientId] = useState<string>("");
  const [provIsSubmitting, setProvIsSubmitting] = useState(false);

  // Expandable work Balancer checklist states
  const [expandedMembers, setExpandedMembers] = useState<Record<string, boolean>>({});

  // Auth Category & Security Checks
  const isCorePartner = useMemo(() => {
    if (!userProfile?.email) return false;
    const coreEmails = [
      "lakshbetala15@gmail.com",
      "gandhimouriyan1234@gmail.com",
      "monarchankit25@gmail.com",
      "muskanabani01@gmail.com"
    ];
    return coreEmails.includes(userProfile.email.toLowerCase());
  }, [userProfile]);

  const isIntern = useMemo(() => {
    if (!userProfile?.role) return false;
    return userProfile.role.toLowerCase().includes("intern");
  }, [userProfile]);

  // Telemetry Lists safe type-casted fallbacks
  const clients = useMemo(() => {
    if (isCorePartner || isIntern) return allClients;
    return allClients.filter(c => c.assignedAdminId === currentAdminId);
  }, [allClients, isCorePartner, isIntern, currentAdminId]);

  const flags = useMemo(() => {
    if (isCorePartner || isIntern) return allFlags;
    return allFlags.filter(f => f.assignedAdminId === currentAdminId);
  }, [allFlags, isCorePartner, isIntern, currentAdminId]);

  const internalTasks = useMemo(() => {
    if (isCorePartner || isIntern) return allInternalTasks;
    return allInternalTasks.filter(t => t.assignedAdminId === currentAdminId);
  }, [allInternalTasks, isCorePartner, isIntern, currentAdminId]);

  const potentialClients = useMemo(() => clients.filter(c => c.category === "Potential"), [clients]);
  const ongoingClients = useMemo(() => clients.filter(c => c.category === "Ongoing"), [clients]);
  const currentAdmin = team.find(t => t.id === currentAdminId) || team[0];

  // Sourcing pipeline stats
  const outreachAnalytics = useMemo(() => {
    const totalPipeline = leads.reduce((acc, l) => acc + l.estimatedValue, 0);
    const avgScore = leads.length > 0 ? Math.round(leads.reduce((acc, l) => acc + l.engagementScore, 0) / leads.length) : 0;
    return { totalPipeline, avgScore };
  }, [leads]);

  // Custom Form handlers
  const handleAddClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newClientProject.trim()) return;
    addNewClient({
      name: newClientName.trim(),
      project: newClientProject.trim(),
      location: "Chennai",
      category: newClientCategory,
      stage: newClientStage,
      revenue: Number(newClientRevenue),
      assignedAdminId: newClientAssigned,
    });
    setNewClientName("");
    setNewClientProject("");
    setShowClientForm(false);
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addInternalTask({
      title: newTaskTitle.trim(),
      clientId: newTaskClient ? Number(newTaskClient) : undefined,
      productId: newTaskProduct || undefined,
      assignedAdminId: newTaskAssignee,
    });
    setNewTaskTitle("");
    setShowTaskForm(false);
  };

  const handleAddFlagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlagTitle.trim() || !newFlagDesc.trim()) return;
    addFlag({
      title: newFlagTitle.trim(),
      description: newFlagDesc.trim(),
      clientId: Number(newFlagClient),
      severity: newFlagSeverity,
      assignedAdminId: newFlagAssignee || undefined,
    });
    setNewFlagTitle("");
    setNewFlagDesc("");
    setShowFlagForm(false);
  };

  const handleAddLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadCompany.trim() || !newLeadDesc.trim()) return;
    addNewLead({
      companyName: newLeadCompany.trim(),
      projectDescription: newLeadDesc.trim(),
      estimatedValue: Number(newLeadVal),
      source: newLeadSource,
      status: "Lead",
      assignedAdminId: newLeadAssigned,
      sourcedById: newLeadSourcedBy,
      engagementScore: Number(newLeadScore)
    });
    setNewLeadCompany("");
    setNewLeadDesc("");
    setShowLeadForm(false);
  };

  const handleProvisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provEmail.trim() || !provName.trim()) return;
    setProvIsSubmitting(true);
    const success = await provisionUser({
      email: provEmail.trim().toLowerCase(),
      name: provName.trim(),
      role: provRole.trim(),
      category: provCategory,
      avatar: provName.split(" ").map(w => w[0]).join("").toUpperCase().substring(0, 2),
      colorVar: provCategory === "admin" 
        ? (provFocus === "Client Delivery" ? "var(--color-admin-mouriyan)" : "var(--color-admin-muskan)")
        : "var(--color-neutral)",
      primaryFocus: provCategory === "admin" ? provFocus : "Product Sandbox",
      responsibilities: provResponsibilities,
      activeTasks: provCategory === "admin" ? ["Complete operational system onboarding"] : [],
      clientId: provCategory === "client" && provClientId ? Number(provClientId) : undefined
    });
    setProvIsSubmitting(false);
    if (success) {
      setProvEmail("");
      setProvName("");
      setProvResponsibilities([]);
      alert("🎉 Invited email successfully added to registry!");
    } else {
      alert("❌ Error pre-authorizing credentials.");
    }
  };

  // Close all drawers on background click
  const closeAllDrawers = () => {
    setSelectedClient(null);
    setSelectedTask(null);
    setSelectedFlag(null);
  };

  const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const fadeUp = { hidden: { opacity: 0, y: 12, filter: "blur(2px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } } };

  return (
    <div className="flex min-h-screen bg-[#0A0A0A] text-[#F5F5F5] font-sans antialiased selection:bg-[#06B6D4]/20 selection:text-[#06B6D4] relative overflow-hidden">
      
      {/* ──── FIXED LEFT SIDEBAR (OBSIDIAN CONSOLE FRAME) ──── */}
      <aside className="w-64 border-r border-[#1F1F1F] bg-[#121212] flex flex-col justify-between h-screen sticky top-0 shrink-0 z-30 select-none">
        <div className="flex flex-col">
          {/* Brand/Console Identity */}
          <div className="p-6 border-b border-[#1F1F1F] flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4] animate-pulse" />
            <h1 className="text-sm font-bold tracking-widest font-mono text-[#FAF9F6]">ALMMATIX OS</h1>
          </div>

          {/* Navigation Consolidated Tabs */}
          <nav className="p-4 flex flex-col gap-1.5">
            {[
              { id: "operations", label: "Operations Desk", icon: "🛠️", count: ongoingClients.length + internalTasks.filter(t => t.status !== "Resolved").length },
              { id: "outreach", label: "Outreach Funnel", icon: "🎯", count: leads.length },
              { id: "client_portal_view", label: "Client Portal View", icon: "👥", count: null },
              { id: "staff_invites", label: "Staff Invites", icon: "🔒", count: null },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  closeAllDrawers();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-mono tracking-wider transition-all duration-150 focus:outline-none ${
                  activeTab === tab.id
                    ? "bg-[#1F1F1F] text-[#06B6D4] border border-[#06B6D4]/30"
                    : "text-[#8E8E8E] hover:text-[#FAF9F6] hover:bg-[#1C1917]"
                }`}
              >
                <span className="uppercase text-left truncate flex items-center gap-2">
                  <span className="text-sm">{tab.icon}</span>
                  {tab.label}
                </span>
                {tab.count !== null && tab.count > 0 && (
                  <span className={`text-[0.625rem] px-2 py-0.5 rounded-full font-mono ${
                    activeTab === tab.id ? "bg-[#06B6D4]/20 text-[#06B6D4]" : "bg-[#1C1917] text-[#8E8E8E] border border-[#1F1F1F]"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Sync telemetry indicator */}
        <div className="mx-4 my-2 border-t border-[#1F1F1F] pt-3 pb-1 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 font-mono text-[0.58rem] tracking-widest">
            {isSupabaseOnline ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                <span className="text-emerald-400 font-bold uppercase">🟢 LIVE DATABASE SYNC</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 animate-pulse" />
                <span className="text-amber-500 font-bold uppercase">🟡 LOCAL SANDBOX FALLBACK</span>
              </>
            )}
          </div>
        </div>

        {/* Active Logged Partner Card */}
        <div className="p-4 border-t border-[#1F1F1F] bg-[#0E0E0E] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[0.65rem] font-bold text-white shrink-0 shadow-sm border border-white/5" 
              style={{ backgroundColor: currentAdmin.colorVar || "#06B6D4" }}
            >
              {currentAdmin.avatar}
            </div>
            <div className="text-left min-w-0">
              <div className="text-xs font-bold text-[#FAF9F6] truncate leading-snug">{currentAdmin.name}</div>
              <div className="text-[0.58rem] font-mono uppercase text-[#8E8E8E] truncate mt-0.5">{currentAdmin.role}</div>
            </div>
          </div>
          <button 
            onClick={signOut}
            className="p-1.5 rounded-md hover:bg-[#1F1F1F] text-[#8E8E8E] hover:text-[#EF4444] transition-all focus:outline-none shrink-0" 
            title="Sign Out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>

      {/* ──── RIGHT SCROLLABLE WORKSPACE ──── */}
      <main className="flex-1 min-h-screen overflow-y-auto px-12 py-10 z-10 bg-[#0A0A0A]">
        <AnimatePresence mode="wait">
          
          {/* ═══ TAB 1: OPERATIONS DESK ═══ */}
          {activeTab === "operations" && (
            <motion.div key="operations" initial="hidden" animate="show" exit="hidden" variants={stagger} className="flex flex-col gap-8">
              
              {/* Top: Workload Allocation Matrix */}
              <motion.div variants={fadeUp} className="border border-[#1F1F1F] bg-[#121212] p-5 rounded-2xl">
                <div className="flex justify-between items-center mb-4 border-b border-[#1F1F1F] pb-3">
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] font-mono text-[#06B6D4]">Core Four & Staff Workload Allocation</h2>
                  <span className="text-[0.625rem] text-[#8E8E8E] font-mono uppercase">Live resource analytics</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {team.map((member) => {
                    const memberClients = allClients.filter(c => c.assignedAdminId === member.id && c.category === "Ongoing");
                    const memberSprintTasks = internalTasks.filter(t => t.assignedAdminId === member.id && t.status !== "Resolved");
                    const memberFlags = flags.filter(f => f.assignedAdminId === member.id && f.status !== "Resolved");
                    
                    // Capacity math
                    const capacityLoad = Math.min(100, (memberClients.length * 25) + (memberSprintTasks.length * 15) + (memberFlags.length * 20));
                    const isExpanded = !!expandedMembers[member.id];

                    return (
                      <div key={member.id} className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl p-4 hover:border-[#06B6D4]/35 transition-all duration-200 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[2.5px]" style={{ backgroundColor: member.colorVar || "#06B6D4" }} />
                        
                        <div className="flex items-start justify-between mb-3 mt-1">
                          <div className="flex items-center gap-2.5">
                            <div 
                              className="w-7 h-7 rounded flex items-center justify-center text-[0.6rem] font-bold text-white shrink-0 border border-white/5" 
                              style={{ backgroundColor: member.colorVar || "#06B6D4" }}
                            >
                              {member.avatar}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-xs text-[#FAF9F6] truncate leading-tight">{member.name}</div>
                              <div className="text-[0.55rem] uppercase tracking-wider font-mono font-bold mt-0.5 text-[#8E8E8E]" style={{ color: member.colorVar }}>
                                {member.role}
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-[0.5rem] font-mono text-[#8E8E8E] uppercase">LOAD</div>
                            <div className="text-xs font-mono font-bold text-[#FAF9F6] mt-0.5">{capacityLoad}%</div>
                          </div>
                        </div>

                        {/* Capacity Progress Bar */}
                        <div className="mb-3">
                          <div className="h-1 w-full bg-[#1F1F1F] rounded-full overflow-hidden">
                            <div 
                              style={{ width: `${capacityLoad}%`, backgroundColor: member.colorVar || "#06B6D4" }} 
                              className="h-full rounded-full transition-all duration-500" 
                            />
                          </div>
                        </div>

                        {/* Minimal Metrics Grid */}
                        <div className="grid grid-cols-3 gap-1 py-1.5 border-y border-[#1F1F1F] mb-3 text-center font-mono text-[0.6rem]">
                          <div>
                            <div className="text-[0.45rem] text-[#8E8E8E] uppercase">Clients</div>
                            <div className="font-bold text-[#FAF9F6] mt-0.5">{memberClients.length}</div>
                          </div>
                          <div>
                            <div className="text-[0.45rem] text-[#8E8E8E] uppercase">Tasks</div>
                            <div className="font-bold text-[#FAF9F6] mt-0.5">{memberSprintTasks.length}</div>
                          </div>
                          <div>
                            <div className="text-[0.45rem] text-[#8E8E8E] uppercase">Flags</div>
                            <div className="font-bold text-[#EF4444] mt-0.5">{memberFlags.length}</div>
                          </div>
                        </div>

                        {/* Expandable tasks check-list trigger */}
                        <button
                          onClick={() => setExpandedMembers(prev => ({ ...prev, [member.id]: !prev[member.id] }))}
                          className="flex items-center justify-between w-full text-[0.55rem] font-mono uppercase tracking-wider text-[#8E8E8E] hover:text-[#FAF9F6] transition-colors pt-1"
                        >
                          <span>Checklist ({member.activeTasks.length})</span>
                          <span className="font-bold text-[0.7rem]">{isExpanded ? "−" : "+"}</span>
                        </button>
                        
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <ul className="text-[0.58rem] text-[#8E8E8E] space-y-1.5 mt-3 pl-0 list-none font-mono">
                                {member.activeTasks.map((t, idx) => (
                                  <li key={idx} className="flex items-start gap-1.5 leading-normal bg-[#121212] border border-[#1F1F1F] p-2 rounded-lg">
                                    <span className="w-1 h-1 rounded-full mt-1 shrink-0 bg-[#06B6D4]" />
                                    <span>{t}</span>
                                  </li>
                                ))}
                                {member.activeTasks.length === 0 && (
                                  <li className="text-[#8E8E8E]/40 italic text-center py-1">No active sprint tasks.</li>
                                )}
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* 3-Column Operations Desk Layout */}
              <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* COLUMN 1: Client Sprints Desk */}
                <div className="border border-[#1F1F1F] bg-[#121212] rounded-2xl p-5 min-h-[580px] flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4 border-b border-[#1F1F1F] pb-3">
                      <h3 className="text-xs font-bold uppercase tracking-[0.15em] font-mono text-[#06B6D4] flex items-center gap-1.5">
                        <span className="text-[#06B6D4]">🏢</span> Client Projects
                      </h3>
                      <button 
                        onClick={() => setShowClientForm(true)}
                        className="bg-[#1F1F1F] hover:bg-[#06B6D4] text-[#FAF9F6] hover:text-[#0A0A0A] border border-[#1F1F1F] text-[0.6rem] font-mono uppercase px-2 py-1 rounded transition-colors"
                      >
                        + Add Project
                      </button>
                    </div>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 dark-scrollbar">
                      {ongoingClients.map((client) => {
                        const assignedAdmin = team.find(t => t.id === client.assignedAdminId);
                        return (
                          <div 
                            key={client.id}
                            onClick={() => setSelectedClient(client)}
                            className="bg-[#0A0A0A] border border-[#1F1F1F] p-4 rounded-xl cursor-pointer hover:border-[#06B6D4]/35 transition-all group relative"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Delete workspace for ${client.name}?`)) {
                                  deleteClient(client.id);
                                }
                              }}
                              className="absolute top-3 right-3 text-[#8E8E8E] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-xs font-mono"
                              title="Delete Client"
                            >
                              ✕
                            </button>

                            <div className="flex justify-between items-start mb-3 pr-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded bg-[#121212] border border-[#1F1F1F] text-[#FAF9F6] flex items-center justify-center text-[0.625rem] font-bold tracking-wider font-mono">{client.avatar}</div>
                                <div className="min-w-0">
                                  <div className="font-bold text-xs text-[#FAF9F6] truncate leading-tight">{client.name}</div>
                                  <div className="text-[0.65rem] text-[#8E8E8E] mt-0.5 truncate">{client.project}</div>
                                </div>
                              </div>
                              <HealthRing score={client.health} size={30} />
                            </div>

                            <div className="flex items-center justify-between border-t border-[#1F1F1F] pt-2 text-[0.625rem] font-mono">
                              <StageBadge stage={client.stage} />
                              <div className="flex items-center gap-1.5">
                                {assignedAdmin && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: assignedAdmin.colorVar }} />}
                                <span className="font-semibold text-[0.625rem] text-[#FAF9F6]">{assignedAdmin?.name || "Unassigned"}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {ongoingClients.length === 0 && (
                        <div className="text-xs text-[#8E8E8E] font-mono italic text-center py-10">No ongoing clients currently logged.</div>
                      )}
                    </div>
                  </div>

                  {/* Inline Client creation Modal */}
                  <AnimatePresence>
                    {showClientForm && (
                      <div className="fixed inset-0 bg-[#0A0A0A]/70 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
                        <motion.form 
                          onSubmit={handleAddClientSubmit}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="bg-[#121212] border border-[#1F1F1F] p-6 rounded-2xl w-full max-w-sm space-y-4 shadow-2xl relative"
                        >
                          <button 
                            type="button" 
                            onClick={() => setShowClientForm(false)}
                            className="absolute top-4 right-4 text-[#8E8E8E] hover:text-[#FAF9F6] transition-colors"
                          >
                            ✕
                          </button>
                          <h3 className="text-xs font-mono uppercase tracking-widest font-bold text-[#06B6D4]">🏢 Provision New Client Project</h3>
                          
                          <div className="space-y-3 text-xs font-mono">
                            <div>
                              <label className="block mb-1 text-[0.55rem] uppercase text-[#8E8E8E]">Client Corporate Name</label>
                              <input 
                                type="text" 
                                required 
                                value={newClientName} 
                                onChange={(e) => setNewClientName(e.target.value)} 
                                placeholder="NJ Jewellers" 
                                className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#06B6D4] text-[#FAF9F6]"
                              />
                            </div>
                            <div>
                              <label className="block mb-1 text-[0.55rem] uppercase text-[#8E8E8E]">Deliverable Title / Project</label>
                              <input 
                                type="text" 
                                required 
                                value={newClientProject} 
                                onChange={(e) => setNewClientProject(e.target.value)} 
                                placeholder="Gold Rate Analytics Polish" 
                                className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#06B6D4] text-[#FAF9F6]"
                              />
                            </div>
                            <div>
                              <label className="block mb-1 text-[0.55rem] uppercase text-[#8E8E8E]">Contract Revenue Value (INR)</label>
                              <input 
                                type="number" 
                                required 
                                value={newClientRevenue} 
                                onChange={(e) => setNewClientRevenue(e.target.value)} 
                                className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#06B6D4] text-[#FAF9F6]"
                              />
                            </div>
                            <div>
                              <label className="block mb-1 text-[0.55rem] uppercase text-[#8E8E8E]">Delivery Sprint Director</label>
                              <select
                                value={newClientAssigned}
                                onChange={(e) => setNewClientAssigned(e.target.value)}
                                className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#06B6D4] text-[#FAF9F6]"
                              >
                                {team.map(t => <option key={t.id} value={t.id}>{t.name} ({t.role})</option>)}
                              </select>
                            </div>
                          </div>
                          
                          <button 
                            type="submit" 
                            className="w-full bg-[#06B6D4] hover:bg-[#0891B2] text-[#0A0A0A] font-mono text-xs uppercase tracking-[0.15em] font-bold py-2.5 rounded-lg transition-colors"
                          >
                            Create Active Project
                          </button>
                        </motion.form>
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {/* COLUMN 2: Sprints Checklist Kanban */}
                <div className="border border-[#1F1F1F] bg-[#121212] rounded-2xl p-5 min-h-[580px] flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4 border-b border-[#1F1F1F] pb-3">
                      <h3 className="text-xs font-bold uppercase tracking-[0.15em] font-mono text-[#06B6D4] flex items-center gap-1.5">
                        <span className="text-[#06B6D4]">📋</span> Active Sprints
                      </h3>
                      <button 
                        onClick={() => setShowTaskForm(true)}
                        className="bg-[#1F1F1F] hover:bg-[#06B6D4] text-[#FAF9F6] hover:text-[#0A0A0A] border border-[#1F1F1F] text-[0.6rem] font-mono uppercase px-2 py-1 rounded transition-colors"
                      >
                        + Create Task
                      </button>
                    </div>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 dark-scrollbar">
                      {internalTasks.filter(t => t.status !== "Resolved").map((task) => {
                        const assignee = team.find(t => t.id === task.assignedAdminId) || team[0];
                        const client = allClients.find(c => c.id === task.clientId);
                        
                        return (
                          <div 
                            key={task.id}
                            onClick={() => setSelectedTask(task)}
                            className="bg-[#0A0A0A] border border-[#1F1F1F] p-4 rounded-xl cursor-pointer hover:border-[#06B6D4]/35 transition-all relative group"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Delete task: ${task.title}?`)) {
                                  deleteInternalTask(task.id);
                                }
                              }}
                              className="absolute top-3 right-3 text-[#8E8E8E] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-xs font-mono"
                            >
                              ✕
                            </button>
                            <div className="absolute top-0 right-0 w-[3px] h-full rounded-r-xl" style={{ backgroundColor: assignee.colorVar || "#06B6D4" }} />
                            
                            <div className="text-xs font-bold text-[#FAF9F6] mb-1.5 leading-snug pr-4">{task.title}</div>
                            {client && (
                              <div className="text-[0.55rem] font-mono text-[#06B6D4] uppercase mb-1">CLIENT: {client.name}</div>
                            )}

                            {/* Sprint logs preview */}
                            <div className="space-y-1 bg-[#121212] border border-[#1F1F1F] p-2 rounded-lg text-[0.58rem] text-[#8E8E8E] font-mono mb-2">
                              <div className="max-h-[60px] overflow-y-auto space-y-1">
                                {task.internalNotes && task.internalNotes.length > 0 ? (
                                  task.internalNotes.map((note, idx) => (
                                    <div key={idx} className="border-l border-[#1F1F1F] pl-1.5 italic">"{note}"</div>
                                  ))
                                ) : (
                                  <div className="text-[#8E8E8E]/40 italic">No notes logged yet.</div>
                                )}
                              </div>
                            </div>

                            <div className="flex justify-between items-center border-t border-[#1F1F1F] pt-2 text-[0.58rem] font-mono">
                              <span className="text-[#8E8E8E]">Owner: <strong style={{ color: assignee.colorVar }}>{assignee.name}</strong></span>
                              <span className="text-[#06B6D4] uppercase font-bold">{task.status}</span>
                            </div>
                          </div>
                        );
                      })}
                      {internalTasks.filter(t => t.status !== "Resolved").length === 0 && (
                        <div className="text-xs text-[#8E8E8E] font-mono italic text-center py-10">No pending sprint tasks.</div>
                      )}
                    </div>
                  </div>

                  {/* Inline Task creation Modal */}
                  <AnimatePresence>
                    {showTaskForm && (
                      <div className="fixed inset-0 bg-[#0A0A0A]/70 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
                        <motion.form 
                          onSubmit={handleAddTaskSubmit}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="bg-[#121212] border border-[#1F1F1F] p-6 rounded-2xl w-full max-w-sm space-y-4 shadow-2xl relative"
                        >
                          <button 
                            type="button" 
                            onClick={() => setShowTaskForm(false)}
                            className="absolute top-4 right-4 text-[#8E8E8E] hover:text-[#FAF9F6] transition-colors"
                          >
                            ✕
                          </button>
                          <h3 className="text-xs font-mono uppercase tracking-widest font-bold text-[#06B6D4]">📋 Log New Sprint Task</h3>
                          
                          <div className="space-y-3 text-xs font-mono">
                            <div>
                              <label className="block mb-1 text-[0.55rem] uppercase text-[#8E8E8E]">Task Title</label>
                              <input 
                                type="text" 
                                required 
                                value={newTaskTitle} 
                                onChange={(e) => setNewTaskTitle(e.target.value)} 
                                placeholder="Refactor rate columns mobile wrapping" 
                                className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#06B6D4] text-[#FAF9F6]"
                              />
                            </div>
                            <div>
                              <label className="block mb-1 text-[0.55rem] uppercase text-[#8E8E8E]">Linked Client Account (Optional)</label>
                              <select
                                value={newTaskClient}
                                onChange={(e) => setNewTaskClient(e.target.value)}
                                className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#06B6D4] text-[#FAF9F6]"
                              >
                                <option value="">Internal Core Development</option>
                                {allClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block mb-1 text-[0.55rem] uppercase text-[#8E8E8E]">Specialist Owner</label>
                              <select
                                value={newTaskAssignee}
                                onChange={(e) => setNewTaskAssignee(e.target.value)}
                                className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#06B6D4] text-[#FAF9F6]"
                              >
                                {team.map(t => <option key={t.id} value={t.id}>{t.name} ({t.role})</option>)}
                              </select>
                            </div>
                          </div>
                          
                          <button 
                            type="submit" 
                            className="w-full bg-[#06B6D4] hover:bg-[#0891B2] text-[#0A0A0A] font-mono text-xs uppercase tracking-[0.15em] font-bold py-2.5 rounded-lg transition-colors"
                          >
                            Push Sprint Task
                          </button>
                        </motion.form>
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {/* COLUMN 3: Support Incident Desk */}
                <div className="border border-[#1F1F1F] bg-[#121212] rounded-2xl p-5 min-h-[580px] flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4 border-b border-[#1F1F1F] pb-3">
                      <h3 className="text-xs font-bold uppercase tracking-[0.15em] font-mono text-[#06B6D4] flex items-center gap-1.5">
                        <span className="text-[#06B6D4]">🚨</span> Incident Support
                      </h3>
                      <button 
                        onClick={() => setShowFlagForm(true)}
                        className="bg-[#1F1F1F] hover:bg-[#06B6D4] text-[#FAF9F6] hover:text-[#0A0A0A] border border-[#1F1F1F] text-[0.6rem] font-mono uppercase px-2 py-1 rounded transition-colors"
                      >
                        + Raise Ticket
                      </button>
                    </div>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 dark-scrollbar">
                      {flags.filter(f => f.status !== "Resolved").map((flag) => {
                        const assignee = team.find(t => t.id === flag.assignedAdminId);
                        const client = allClients.find(c => c.id === flag.clientId);
                        
                        return (
                          <div 
                            key={flag.id}
                            onClick={() => setSelectedFlag(flag)}
                            className="bg-[#0A0A0A] border border-[#1F1F1F] p-4 rounded-xl cursor-pointer hover:border-[#06B6D4]/35 transition-all relative group"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Remove support flag ticket?`)) {
                                  deleteFlag(flag.id);
                                }
                              }}
                              className="absolute top-3 right-3 text-[#8E8E8E] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-xs font-mono"
                            >
                              ✕
                            </button>

                            <div className="flex items-center gap-2 mb-2">
                              <span className={`inline-flex px-1.5 py-0.5 rounded text-[0.5rem] uppercase font-mono font-bold ${
                                flag.severity === "Critical" ? "bg-red-500/10 text-red-500 border border-red-500/30 animate-pulse" :
                                flag.severity === "High" ? "bg-amber-500/10 text-amber-500 border border-amber-500/30" :
                                "bg-stone-800 text-[#8E8E8E]"
                              }`}>
                                {flag.severity}
                              </span>
                              {client && (
                                <span className="text-[0.55rem] font-mono text-[#06B6D4] truncate font-semibold uppercase">{client.name}</span>
                              )}
                            </div>

                            <div className="text-xs font-bold text-[#FAF9F6] mb-2 leading-snug truncate pr-4">{flag.title}</div>
                            
                            <div className="flex justify-between items-center border-t border-[#1F1F1F] pt-2 text-[0.58rem] font-mono">
                              <span className="text-[#8E8E8E]">Lead: <strong style={{ color: assignee?.colorVar }}>{assignee?.name || "Unassigned"}</strong></span>
                              <span className="text-[#06B6D4] font-bold uppercase">{flag.status}</span>
                            </div>
                          </div>
                        );
                      })}
                      {flags.filter(f => f.status !== "Resolved").length === 0 && (
                        <div className="text-xs text-[#8E8E8E] font-mono italic text-center py-10">No active support tickets. All stable!</div>
                      )}
                    </div>
                  </div>

                  {/* Inline Support Flag creation Modal */}
                  <AnimatePresence>
                    {showFlagForm && (
                      <div className="fixed inset-0 bg-[#0A0A0A]/70 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
                        <motion.form 
                          onSubmit={handleAddFlagSubmit}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="bg-[#121212] border border-[#1F1F1F] p-6 rounded-2xl w-full max-w-sm space-y-4 shadow-2xl relative"
                        >
                          <button 
                            type="button" 
                            onClick={() => setShowFlagForm(false)}
                            className="absolute top-4 right-4 text-[#8E8E8E] hover:text-[#FAF9F6] transition-colors"
                          >
                            ✕
                          </button>
                          <h3 className="text-xs font-mono uppercase tracking-widest font-bold text-[#EF4444]">🚨 File Post-Service Escalation Ticket</h3>
                          
                          <div className="space-y-3 text-xs font-mono">
                            <div>
                              <label className="block mb-1 text-[0.55rem] uppercase text-[#8E8E8E]">Issue Title</label>
                              <input 
                                type="text" 
                                required 
                                value={newFlagTitle} 
                                onChange={(e) => setNewFlagTitle(e.target.value)} 
                                placeholder="Rate limit API timeout" 
                                className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#06B6D4] text-[#FAF9F6]"
                              />
                            </div>
                            <div>
                              <label className="block mb-1 text-[0.55rem] uppercase text-[#8E8E8E]">Escalation Details</label>
                              <textarea 
                                required 
                                value={newFlagDesc} 
                                onChange={(e) => setNewFlagDesc(e.target.value)} 
                                placeholder="API crashes exactly at 23:00 daily." 
                                rows={3}
                                className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#06B6D4] text-[#FAF9F6] resize-none"
                              />
                            </div>
                            <div>
                              <label className="block mb-1 text-[0.55rem] uppercase text-[#8E8E8E]">Escalated Client Account</label>
                              <select
                                value={newFlagClient}
                                onChange={(e) => setNewFlagClient(e.target.value)}
                                className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#06B6D4] text-[#FAF9F6]"
                              >
                                {allClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block mb-1 text-[0.55rem] uppercase text-[#8E8E8E]">Severity</label>
                              <select
                                value={newFlagSeverity}
                                onChange={(e) => setNewFlagSeverity(e.target.value as FlagSeverity)}
                                className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#06B6D4] text-[#FAF9F6]"
                              >
                                <option value="Critical">Critical Outage</option>
                                <option value="High">High Glitch</option>
                                <option value="Medium">Medium Enhancement</option>
                                <option value="Low">Low QA Polish</option>
                              </select>
                            </div>
                            <div>
                              <label className="block mb-1 text-[0.55rem] uppercase text-[#8E8E8E]">Assigned Lead</label>
                              <select
                                value={newFlagAssignee}
                                onChange={(e) => setNewFlagAssignee(e.target.value)}
                                className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#06B6D4] text-[#FAF9F6]"
                              >
                                {team.map(t => <option key={t.id} value={t.id}>{t.name} ({t.role})</option>)}
                              </select>
                            </div>
                          </div>
                          
                          <button 
                            type="submit" 
                            className="w-full bg-[#EF4444] text-[#FAF9F6] font-mono text-xs uppercase tracking-[0.15em] font-bold py-2.5 rounded-lg transition-colors"
                          >
                            Raise Incident Ticket
                          </button>
                        </motion.form>
                      </div>
                    )}
                  </AnimatePresence>
                </div>

              </motion.div>

            </motion.div>
          )}

          {/* ═══ TAB 2: OUTREACH FUNNEL ═══ */}
          {activeTab === "outreach" && (
            <motion.div key="outreach" initial="hidden" animate="show" exit="hidden" variants={stagger} className="flex flex-col gap-6">
              
              {/* Sourcing funnel analytics */}
              <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Lead Pipeline", value: formatCurrency(outreachAnalytics.totalPipeline) },
                  { label: "Deal Quality score", value: `${outreachAnalytics.avgScore}%`, accent: true },
                  { label: "Active Lead Targets", value: `${leads.length} contacts` },
                  { label: "Converted Success Rate", value: "85%", accent: false },
                ].map((m, idx) => (
                  <div key={idx} className="bg-[#121212] border border-[#1F1F1F] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                    <div className="portal-label text-[0.55rem] mb-2">{m.label}</div>
                    <div className={`text-xl font-bold font-mono ${m.accent ? "text-[#06B6D4]" : "text-[#FAF9F6]"}`}>{m.value}</div>
                  </div>
                ))}
              </motion.div>

              <motion.div variants={fadeUp}>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em] font-mono text-[#06B6D4]">Sales Outreach Sourcing Desk</h2>
                    <p className="text-xs text-[#8E8E8E] mt-1 font-mono">Cold Calling records, social media pipelines (LinkedIn/Twitter), and conversion triggers.</p>
                  </div>
                  <button 
                    onClick={() => setShowLeadForm(prev => !prev)}
                    className="bg-[#121212] hover:bg-[#06B6D4] text-[#06B6D4] hover:text-[#0A0A0A] border border-[#06B6D4]/30 text-[0.6rem] font-bold font-mono uppercase px-4 py-2.5 rounded-lg transition-all"
                  >
                    {showLeadForm ? "✕ Close Form" : "🎯 Add Sourced Lead"}
                  </button>
                </div>

                {/* Inline Lead Sourcing form */}
                <AnimatePresence>
                  {showLeadForm && (
                    <motion.form 
                      onSubmit={handleAddLeadSubmit}
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: "auto" }} 
                      exit={{ opacity: 0, height: 0 }} 
                      className="bg-[#121212] border border-[#1F1F1F] rounded-2xl p-5 mb-6 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono"
                    >
                      <div>
                        <label className="block mb-1 text-[0.55rem] uppercase text-[#8E8E8E]">Corporate Target</label>
                        <input 
                          type="text" 
                          required
                          value={newLeadCompany}
                          onChange={(e) => setNewLeadCompany(e.target.value)}
                          placeholder="UPKEM Labs Inc"
                          className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-3 py-2 text-xs text-[#FAF9F6] outline-none focus:border-[#06B6D4]"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-[0.55rem] uppercase text-[#8E8E8E]">Project Focus</label>
                        <input 
                          type="text" 
                          required
                          value={newLeadDesc}
                          onChange={(e) => setNewLeadDesc(e.target.value)}
                          placeholder="Website polish & CRM Dashboard"
                          className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-3 py-2 text-xs text-[#FAF9F6] outline-none focus:border-[#06B6D4]"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-[0.55rem] uppercase text-[#8E8E8E]">Est Val (INR)</label>
                        <input 
                          type="number" 
                          required
                          value={newLeadVal}
                          onChange={(e) => setNewLeadVal(e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-3 py-2 text-xs text-[#FAF9F6] outline-none focus:border-[#06B6D4]"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-[0.55rem] uppercase text-[#8E8E8E]">Sourced Channel</label>
                        <select
                          value={newLeadSource}
                          onChange={(e) => setNewLeadSource(e.target.value as LeadSource)}
                          className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-3 py-2 text-xs text-[#FAF9F6] outline-none focus:border-[#06B6D4]"
                        >
                          <option value="LinkedIn">LinkedIn Outreach</option>
                          <option value="Twitter">Twitter Sprints</option>
                          <option value="Cold Call">Cold Calling</option>
                          <option value="Email">Cold Emailing</option>
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1 text-[0.55rem] uppercase text-[#8E8E8E]">Sourced By</label>
                        <select
                          value={newLeadSourcedBy}
                          onChange={(e) => setNewLeadSourcedBy(e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-3 py-2 text-xs text-[#FAF9F6] outline-none focus:border-[#06B6D4]"
                        >
                          {team.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button 
                          type="submit"
                          className="w-full bg-[#06B6D4] text-[#0A0A0A] uppercase font-bold py-2.5 rounded-lg text-xs"
                        >
                          Log Outreach Lead
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Sourcing leads calling pipeline grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {leads.map((lead) => {
                    const assignee = team.find(t => t.id === lead.assignedAdminId);
                    const sourcer = team.find(t => t.id === lead.sourcedById);

                    return (
                      <div key={lead.id} className="bg-[#121212] border border-[#1F1F1F] p-5 rounded-2xl relative group font-mono text-xs">
                        <button
                          onClick={() => {
                            if (confirm(`Remove lead ${lead.companyName}?`)) {
                              deleteLead(lead.id);
                            }
                          }}
                          className="absolute top-3 right-3 text-[#8E8E8E] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                        >
                          ✕
                        </button>

                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="text-[0.55rem] bg-[#1F1F1F] text-[#06B6D4] px-2 py-0.5 rounded font-bold uppercase tracking-widest">{lead.source}</span>
                            <h3 className="text-sm font-bold text-[#FAF9F6] mt-2 leading-tight">{lead.companyName}</h3>
                          </div>
                          <div className="text-right">
                            <span className="text-[0.5rem] text-[#8E8E8E] block uppercase">Est Val</span>
                            <span className="font-extrabold text-[#FAF9F6]">{formatCurrency(lead.estimatedValue)}</span>
                          </div>
                        </div>

                        <p className="text-[#8E8E8E] text-[0.68rem] leading-relaxed mb-4">"{lead.projectDescription}"</p>

                        <div className="bg-[#0A0A0A] border border-[#1F1F1F] p-3 rounded-xl mb-4 space-y-1.5">
                          <div className="text-[0.5rem] uppercase text-[#8E8E8E] border-b border-[#1F1F1F] pb-1 flex justify-between items-center">
                            <span>Outreach log notes ({lead.callsMade} dials)</span>
                            <button 
                              onClick={() => incrementLeadCalls(lead.id)}
                              className="text-[#06B6D4] hover:underline uppercase text-[0.48rem] font-bold"
                            >
                              📞 Dial pinger (+1)
                            </button>
                          </div>
                          <div className="max-h-[60px] overflow-y-auto space-y-1 text-[0.625rem] text-[#8E8E8E] pr-1">
                            {lead.notes.map((note, idx) => (
                              <div key={idx} className="border-l border-[#1F1F1F] pl-2 italic">"{note}"</div>
                            ))}
                          </div>
                          <div className="flex gap-1.5 mt-2 pt-1 border-t border-[#1F1F1F]">
                            <input 
                              type="text" 
                              placeholder="Log conversation details..." 
                              value={newLeadNotes[lead.id] || ""}
                              onChange={(e) => setNewLeadNotes(prev => ({ ...prev, [lead.id]: e.target.value }))}
                              className="flex-1 bg-[#121212] border border-[#1F1F1F] rounded px-2 py-1 text-[0.625rem] text-[#FAF9F6] outline-none"
                            />
                            <button 
                              onClick={() => {
                                if (!newLeadNotes[lead.id]?.trim()) return;
                                addLeadNote(lead.id, newLeadNotes[lead.id].trim());
                                setNewLeadNotes(prev => ({ ...prev, [lead.id]: "" }));
                              }}
                              className="bg-[#06B6D4] hover:bg-[#0891B2] text-[#0A0A0A] font-bold px-2 rounded"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 items-center justify-between border-t border-[#1F1F1F] pt-3 text-[0.58rem]">
                          <div className="flex gap-4">
                            <span>Sourced: <strong className="text-[#FAF9F6]">{sourcer?.name || "Muskan"}</strong></span>
                            <span>Pipeline Lead: <strong className="text-[#FAF9F6]">{assignee?.name || "Ankit"}</strong></span>
                          </div>
                          
                          <button 
                            onClick={() => {
                              if (confirm(`Convert ${lead.companyName} to Ongoing Client? This will provision their active project.`)) {
                                convertLeadToClient(lead.id);
                                alert("🎉 Lead converted! Staging playground sandbox and timeline are provisioned.");
                              }
                            }}
                            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg font-mono uppercase font-bold"
                          >
                            🚀 Convert to Client
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

            </motion.div>
          )}

          {/* ═══ TAB 3: CLIENT PORTAL PREVIEW VIEW ═══ */}
          {activeTab === "client_portal_view" && (
            <motion.div key="client_portal_view" initial="hidden" animate="show" exit="hidden" variants={stagger} className="w-full">
              <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#1F1F1F] pb-4">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-[#06B6D4]">Client Portal Preview Simulator</h2>
                  <p className="text-xs text-[#8E8E8E] mt-1 font-mono">Live customer dashboard viewport. Test visual isolation and timeline status feeds.</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-[0.6rem] font-mono uppercase text-[#8E8E8E] tracking-widest select-none">Active Viewport Profile:</span>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(Number(e.target.value))}
                    className="bg-[#121212] border border-[#1F1F1F] text-xs text-[#FAF9F6] px-3 py-1.5 rounded-lg font-mono uppercase focus:outline-none focus:border-[#06B6D4]"
                  >
                    {allClients.filter(c => c.category === "Ongoing").map(cl => (
                      <option key={cl.id} value={cl.id}>{cl.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Mount the actual client view component directly inside the viewport frame */}
              <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl overflow-hidden relative shadow-2xl">
                <div className="bg-[#121212] border-b border-[#1F1F1F] px-4 py-2 text-[0.55rem] font-mono text-[#8E8E8E] flex justify-between items-center select-none">
                  <span>🖥️ PREVIEW VIEWPORT FRAME — CLIENT ISOLATED SPACE</span>
                  <span className="text-[#06B6D4] font-bold">● VISUAL SIMULATOR MODE</span>
                </div>
                <ClientPortalView />
              </div>
            </motion.div>
          )}

          {/* ═══ TAB 4: STAFF INVITES / ACCESS PROVISIONING ═══ */}
          {activeTab === "staff_invites" && (
            <motion.div key="staff_invites" initial="hidden" animate="show" exit="hidden" variants={stagger} className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
              
              {/* Invite Provisioner Form */}
              <div className="lg:col-span-1 border border-[#1F1F1F] bg-[#121212] p-5 rounded-2xl space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[#06B6D4] mb-1">Invite Employee / Client</h3>
                  <p className="text-[0.625rem] text-[#8E8E8E] leading-normal font-sans">Pre-authorize secure email addresses. Only listed emails are allowed to bypass cryptographical signup barriers.</p>
                </div>

                {!isCorePartner ? (
                  <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl text-center">
                    <span className="text-[0.65rem] text-red-400 font-bold uppercase block">🔒 Core Partner Restricted</span>
                    <span className="text-[0.58rem] text-[#8E8E8E] block mt-1 font-sans">Only Lakshya, Mouriyan, Ankit, or Muskan can authorize staff registry.</span>
                  </div>
                ) : (
                  <form onSubmit={handleProvisionSubmit} className="space-y-4 text-xs font-mono">
                    <div>
                      <label className="block mb-1 text-[0.55rem] uppercase text-[#8E8E8E]">Authorized Email</label>
                      <input 
                        type="email" 
                        required
                        value={provEmail}
                        onChange={(e) => setProvEmail(e.target.value)}
                        placeholder="intern.outreach@almmatix.com"
                        className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#06B6D4] text-[#FAF9F6]"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-[0.55rem] uppercase text-[#8E8E8E]">Employee Name</label>
                      <input 
                        type="text" 
                        required
                        value={provName}
                        onChange={(e) => setProvName(e.target.value)}
                        placeholder="Muskan Sourcing Intern"
                        className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#06B6D4] text-[#FAF9F6]"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-[0.55rem] uppercase text-[#8E8E8E]">Operational Role</label>
                      <input 
                        type="text" 
                        required
                        value={provRole}
                        onChange={(e) => setProvRole(e.target.value)}
                        placeholder="Outreach Intern"
                        className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#06B6D4] text-[#FAF9F6]"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-[0.55rem] uppercase text-[#8E8E8E]">Permissions Category</label>
                      <select
                        value={provCategory}
                        onChange={(e) => setProvCategory(e.target.value as any)}
                        className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#06B6D4] text-[#FAF9F6]"
                      >
                        <option value="admin">Internal Admin console</option>
                        <option value="client">Client Portal dashboard</option>
                      </select>
                    </div>

                    {provCategory === "admin" ? (
                      <div>
                        <label className="block mb-1 text-[0.55rem] uppercase text-[#8E8E8E]">Operational Focus</label>
                        <select
                          value={provFocus}
                          onChange={(e) => setProvFocus(e.target.value as any)}
                          className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#06B6D4] text-[#FAF9F6]"
                        >
                          <option value="Client Delivery">Client Delivery (PM / Dev)</option>
                          <option value="Outreach & Marketing">Outreach & Marketing (Sales)</option>
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="block mb-1 text-[0.55rem] uppercase text-[#8E8E8E]">Linked Client Portal Workspace</label>
                        <select
                          value={provClientId}
                          onChange={(e) => setProvClientId(e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#06B6D4] text-[#FAF9F6]"
                        >
                          <option value="">Awaiting Assignment</option>
                          {allClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    )}

                    <button 
                      type="submit" 
                      disabled={provIsSubmitting}
                      className="w-full bg-[#06B6D4] hover:bg-[#0891B2] text-[#0A0A0A] font-bold uppercase py-2.5 rounded-lg text-xs transition-colors disabled:opacity-50"
                    >
                      Authorize & Register Email
                    </button>
                  </form>
                )}
              </div>

              {/* Authorized Staff registry list */}
              <div className="lg:col-span-2 border border-[#1F1F1F] bg-[#121212] p-5 rounded-2xl">
                <div className="flex justify-between items-center mb-4 border-b border-[#1F1F1F] pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[#06B6D4]">Pre-Authorized Credentials Registry</h3>
                  <span className="text-[#8E8E8E] text-[0.58rem] font-mono">{authorizedEmails.length} accounts verified</span>
                </div>

                <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1 dark-scrollbar">
                  {authorizedEmails.map((item) => (
                    <div key={item.email} className="bg-[#0A0A0A] border border-[#1F1F1F] p-4 rounded-xl flex items-center justify-between gap-4 relative group">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-7 h-7 rounded flex items-center justify-center font-bold text-white shrink-0 text-[0.6rem] border border-white/5"
                          style={{ backgroundColor: item.colorVar || "#06B6D4" }}
                        >
                          {item.avatar || "AL"}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[#FAF9F6]">{item.name} <span className="text-[0.55rem] text-[#8E8E8E] font-normal font-sans">({item.role})</span></div>
                          <div className="text-[0.625rem] text-[#8E8E8E] mt-0.5">{item.email}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 text-[0.58rem]">
                        <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-widest ${
                          item.category === "admin" ? "bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/20" : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        }`}>
                          {item.category}
                        </span>

                        {/* Deprovision email trigger */}
                        {isCorePartner && (
                          <button 
                            onClick={async () => {
                              if (confirm(`Deprovision email permissions for: ${item.name}?`)) {
                                const success = await deprovisionUser(item.email);
                                if (success) alert("✓ Revoked permissions successfully.");
                              }
                            }}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-2 py-1 rounded transition-colors uppercase font-bold"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ═══════════════════════════════════════════════════════════════
       SLIDE-OUT RIGHT SHEET DETAILS DRAWERS (AnimatePresence)
      ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        
        {/* Drawer backdrop overlay */}
        {(selectedClient || selectedTask || selectedFlag) && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={closeAllDrawers}
            className="fixed inset-0 bg-[#0A0A0A]/60 backdrop-blur-sm z-[98]"
          />
        )}

        {/* 1. Client Sprints Details drawer */}
        {selectedClient && (
          <motion.div 
            initial={{ x: "100%" }} 
            animate={{ x: 0 }} 
            exit={{ x: "100%" }} 
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 w-[460px] h-full bg-[#121212] border-l border-[#1F1F1F] shadow-2xl z-[99] p-6 overflow-y-auto select-none"
          >
            <div className="flex justify-between items-center border-b border-[#1F1F1F] pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-[#0A0A0A] border border-[#1F1F1F] text-[#FAF9F6] flex items-center justify-center text-xs font-bold tracking-widest font-mono">
                  {selectedClient.avatar}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#FAF9F6]">{selectedClient.name}</h3>
                  <div className="text-[0.65rem] text-[#8E8E8E] mt-0.5">{selectedClient.project}</div>
                </div>
              </div>
              <button onClick={closeAllDrawers} className="p-1 hover:bg-[#1F1F1F] rounded text-[#8E8E8E] hover:text-[#FAF9F6]">✕</button>
            </div>

            <div className="space-y-6 text-xs font-mono">
              
              {/* Dynamic stage selectors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.55rem] uppercase text-[#8E8E8E] mb-1.5">Project Stage</label>
                  <select 
                    value={selectedClient.stage} 
                    onChange={(e) => updateClientStage(selectedClient.id, e.target.value as ClientStage)}
                    className="w-full bg-[#0A0A0A] border border-[#1F1F1F] text-xs text-[#FAF9F6] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#06B6D4]"
                  >
                    {(["Lead", "Proposal", "In Dev", "Active", "Completed"] as ClientStage[]).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[0.55rem] uppercase text-[#8E8E8E] mb-1.5">Delivery Lead</label>
                  <select 
                    value={selectedClient.assignedAdminId || ""} 
                    onChange={(e) => updateClientAdmin(selectedClient.id, e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#1F1F1F] text-xs text-[#FAF9F6] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#06B6D4]"
                  >
                    <option value="">Unassigned</option>
                    {team.map(t => <option key={t.id} value={t.id}>{t.name} ({t.role})</option>)}
                  </select>
                </div>
              </div>

              {/* Premium Staging and Playground Info */}
              <div className="bg-[#0A0A0A] border border-[#1F1F1F] p-4 rounded-xl space-y-3">
                <div className="text-[0.55rem] uppercase text-[#8E8E8E] border-b border-[#1F1F1F] pb-1 font-bold">Staging & Production links</div>
                <div className="space-y-2 text-[0.625rem]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8E8E8E]">Playground Sandbox:</span>
                    <a href="https://almmatix.com/sandbox/demo" target="_blank" rel="noreferrer" className="text-[#06B6D4] hover:underline font-bold">
                      sandbox.almmatix.com ↗
                    </a>
                  </div>
                  
                  {/* GitHub Repo links hidden strictly from standard Interns */}
                  {!isIntern ? (
                    <div className="flex justify-between items-center">
                      <span className="text-[#8E8E8E]">GitHub Repository:</span>
                      <span className="text-[#FAF9F6] font-bold">github.com/almmatix/{selectedClient.avatar.toLowerCase()}-core</span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-[#EF4444] border-t border-[#1F1F1F] pt-1.5">
                      <span>🔒 Code Vault Restricted</span>
                      <span className="text-[0.5rem] uppercase text-[#8E8E8E]">Partner access only</span>
                    </div>
                  )}
                </div>
              </div>

              {/* SECURE FINANCIAL LEDGER (Restricted strictly to Partners, hidden from standard Interns) */}
              <div className="border border-[#1F1F1F] bg-[#0E0E0E] rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-[#1F1F1F] pb-1.5">
                  <div className="text-[0.55rem] uppercase text-[#06B6D4] font-bold">🔒 Secure Financial Ledger</div>
                  <span className="text-[#8E8E8E] text-[0.5rem] uppercase font-bold tracking-widest">Calculated Margins</span>
                </div>

                {!isIntern ? (
                  <div className="space-y-2 text-[0.65rem] font-mono font-medium">
                    {/* Est Cost spent and calculatedExpected revenue mathematically calculated */}
                    {(() => {
                      const estimated = selectedClient.revenue;
                      const spent = Math.round(estimated * 0.45);
                      const expectedRemaining = estimated - spent;

                      return (
                        <>
                          <div className="flex justify-between items-center text-[#FAF9F6]">
                            <span className="text-[#8E8E8E]">Estimated project Cost:</span>
                            <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatCurrency(estimated)}</span>
                          </div>
                          <div className="flex justify-between items-center text-[#FAF9F6]">
                            <span className="text-[#8E8E8E]">Total Cost spent:</span>
                            <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatCurrency(spent)}</span>
                          </div>
                          <div className="flex justify-between items-center border-t border-[#1F1F1F] pt-2 font-bold text-[#06B6D4] text-xs">
                            <span>Remaining Expected Revenue:</span>
                            <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatCurrency(expectedRemaining)}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="bg-[#121212] border border-[#1F1F1F] p-4 rounded-lg text-center select-none">
                    <div className="text-xs font-mono uppercase text-[#EF4444] font-bold">🔒 Secure Ledger Locked</div>
                    <div className="text-[0.58rem] text-[#8E8E8E] mt-1 font-sans">Financial margins are locked to Core Four partners.</div>
                  </div>
                )}
              </div>

              {/* Active project Sprints Checklist */}
              <div className="bg-[#0A0A0A] border border-[#1F1F1F] p-4 rounded-xl space-y-2">
                <div className="text-[0.55rem] uppercase text-[#8E8E8E] border-b border-[#1F1F1F] pb-1 font-bold">Linked Sprint Tasks</div>
                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 dark-scrollbar">
                  {internalTasks.filter(t => t.clientId === selectedClient.id).map(task => (
                    <div key={task.id} className="bg-[#121212] border border-[#1F1F1F] p-2.5 rounded-lg flex justify-between items-center">
                      <span className="font-semibold text-[#FAF9F6] text-[0.625rem] truncate leading-tight flex-1 pr-3">{task.title}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[0.5rem] font-bold uppercase ${
                        task.status === "Resolved" ? "bg-emerald-500/10 text-emerald-400" : "bg-[#1F1F1F] text-[#8E8E8E]"
                      }`}>{task.status}</span>
                    </div>
                  ))}
                  {internalTasks.filter(t => t.clientId === selectedClient.id).length === 0 && (
                    <div className="text-[0.58rem] text-[#8E8E8E]/40 italic text-center py-4">No linked sprint tasks logged.</div>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* 2. Sprint Task Detail drawer */}
        {selectedTask && (
          <motion.div 
            initial={{ x: "100%" }} 
            animate={{ x: 0 }} 
            exit={{ x: "100%" }} 
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 w-[460px] h-full bg-[#121212] border-l border-[#1F1F1F] shadow-2xl z-[99] p-6 overflow-y-auto select-none"
          >
            <div className="flex justify-between items-center border-b border-[#1F1F1F] pb-4 mb-6">
              <div>
                <span className="text-[0.525rem] bg-[#1F1F1F] text-[#06B6D4] px-2 py-0.5 rounded font-bold uppercase font-mono">SPRINT CHECKLIST TICKET</span>
                <h3 className="text-sm font-bold text-[#FAF9F6] mt-2 truncate leading-tight pr-8">{selectedTask.title}</h3>
              </div>
              <button onClick={closeAllDrawers} className="p-1 hover:bg-[#1F1F1F] rounded text-[#8E8E8E] hover:text-[#FAF9F6]">✕</button>
            </div>

            <div className="space-y-6 text-xs font-mono">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.55rem] uppercase text-[#8E8E8E] mb-1.5">Specialist Assigned</label>
                  <select 
                    value={selectedTask.assignedAdminId || ""} 
                    onChange={(e) => {
                      updateClientAdmin(selectedTask.clientId || 0, e.target.value); // Syncs context
                    }}
                    className="w-full bg-[#0A0A0A] border border-[#1F1F1F] text-xs text-[#FAF9F6] rounded-lg px-2.5 py-1.5 focus:outline-none"
                  >
                    {team.map(t => <option key={t.id} value={t.id}>{t.name} ({t.role})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[0.55rem] uppercase text-[#8E8E8E] mb-1.5">Sprint Status</label>
                  <select 
                    value={selectedTask.status} 
                    onChange={(e) => {
                      updateInternalTaskStatus(selectedTask.id, e.target.value as TaskStatus);
                      setSelectedTask(prev => prev ? { ...prev, status: e.target.value as TaskStatus } : null);
                    }}
                    className="w-full bg-[#0A0A0A] border border-[#1F1F1F] text-xs text-[#FAF9F6] rounded-lg px-2.5 py-1.5 focus:outline-none"
                  >
                    {(["Todo", "In Progress", "In Review", "Resolved"] as TaskStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Developer private logs inside task */}
              <div className="bg-[#0A0A0A] border border-[#1F1F1F] p-4 rounded-xl space-y-3">
                <div className="text-[0.55rem] uppercase text-[#8E8E8E] border-b border-[#1F1F1F] pb-1 font-bold">Internal Sprints Checklist Logs</div>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 dark-scrollbar leading-relaxed">
                  {selectedTask.internalNotes && selectedTask.internalNotes.length > 0 ? (
                    selectedTask.internalNotes.map((note, idx) => (
                      <div key={idx} className="bg-[#121212] border border-[#1F1F1F] p-2.5 rounded-lg text-[0.625rem] text-[#8E8E8E] italic">
                        "{note}"
                      </div>
                    ))
                  ) : (
                    <div className="text-[#8E8E8E]/40 italic py-4 text-center">No logs recorded. Log notes below.</div>
                  )}
                </div>

                <div className="flex gap-2 border-t border-[#1F1F1F] pt-3">
                  <input 
                    type="text" 
                    placeholder="Log technical progress..." 
                    value={newInternalTaskNotes[selectedTask.id] || ""}
                    onChange={(e) => setNewInternalTaskNotes(prev => ({ ...prev, [selectedTask.id]: e.target.value }))}
                    className="flex-1 bg-[#121212] border border-[#1F1F1F] rounded px-3 py-1.5 text-xs text-[#FAF9F6] outline-none"
                  />
                  <button 
                    onClick={() => {
                      if (!newInternalTaskNotes[selectedTask.id]?.trim()) return;
                      addInternalTaskNote(selectedTask.id, newInternalTaskNotes[selectedTask.id].trim());
                      // Local visual sync
                      setSelectedTask(prev => prev ? { ...prev, internalNotes: [...(prev.internalNotes || []), newInternalTaskNotes[selectedTask.id].trim()] } : null);
                      setNewInternalTaskNotes(prev => ({ ...prev, [selectedTask.id]: "" }));
                    }}
                    className="bg-[#06B6D4] hover:bg-[#0891B2] text-[#0A0A0A] font-bold px-3.5 rounded text-xs"
                  >
                    + Add
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* 3. Support incident details and sprint logs drawer */}
        {selectedFlag && (
          <motion.div 
            initial={{ x: "100%" }} 
            animate={{ x: 0 }} 
            exit={{ x: "100%" }} 
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 w-[460px] h-full bg-[#121212] border-l border-[#1F1F1F] shadow-2xl z-[99] p-6 overflow-y-auto select-none"
          >
            <div className="flex justify-between items-center border-b border-[#1F1F1F] pb-4 mb-6">
              <div>
                <span className={`inline-flex px-1.5 py-0.5 rounded text-[0.5rem] uppercase font-mono font-bold ${
                  selectedFlag.severity === "Critical" ? "bg-red-500/10 text-red-500 border border-red-500/30" : "bg-[#1F1F1F] text-[#8E8E8E]"
                }`}>
                  {selectedFlag.severity} SEVERITY ESCALATION
                </span>
                <h3 className="text-sm font-bold text-[#FAF9F6] mt-2 truncate leading-tight pr-8">{selectedFlag.title}</h3>
              </div>
              <button onClick={closeAllDrawers} className="p-1 hover:bg-[#1F1F1F] rounded text-[#8E8E8E] hover:text-[#FAF9F6]">✕</button>
            </div>

            <div className="space-y-6 text-xs font-mono">
              <div className="bg-[#0A0A0A] border border-[#1F1F1F] p-4 rounded-xl">
                <span className="text-[0.55rem] uppercase text-[#8E8E8E] block mb-1">Escalated incident summary:</span>
                <p className="text-xs text-[#FAF9F6] leading-relaxed">"{selectedFlag.description}"</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.55rem] uppercase text-[#8E8E8E] mb-1.5">Sprint status</label>
                  <select 
                    value={selectedFlag.status} 
                    onChange={(e) => {
                      updateFlagStatus(selectedFlag.id, e.target.value as FlagStatus);
                      setSelectedFlag(prev => prev ? { ...prev, status: e.target.value as FlagStatus } : null);
                    }}
                    className="w-full bg-[#0A0A0A] border border-[#1F1F1F] text-xs text-[#FAF9F6] rounded-lg px-2.5 py-1.5 focus:outline-none"
                  >
                    {(["Open", "Investigating", "In Dev", "Resolved"] as FlagStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[0.55rem] uppercase text-[#8E8E8E] mb-1.5">Assignee</label>
                  <select 
                    value={selectedFlag.assignedAdminId || ""} 
                    onChange={(e) => {
                      assignFlagAdmin(selectedFlag.id, e.target.value);
                      setSelectedFlag(prev => prev ? { ...prev, assignedAdminId: e.target.value } : null);
                    }}
                    className="w-full bg-[#0A0A0A] border border-[#1F1F1F] text-xs text-[#FAF9F6] rounded-lg px-2.5 py-1.5 focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {team.map(t => <option key={t.id} value={t.id}>{t.name} ({t.role})</option>)}
                  </select>
                </div>
              </div>

              {/* Developer incident logs */}
              <div className="bg-[#0A0A0A] border border-[#1F1F1F] p-4 rounded-xl space-y-3">
                <div className="text-[0.55rem] uppercase text-[#8E8E8E] border-b border-[#1F1F1F] pb-1 font-bold">Developer Incident Sprints logs</div>
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 dark-scrollbar leading-relaxed">
                  {selectedFlag.sprintLogs && selectedFlag.sprintLogs.length > 0 ? (
                    selectedFlag.sprintLogs.map((log) => (
                      <div key={log.id} className="bg-[#121212] border border-[#1F1F1F] p-2.5 rounded-lg text-[0.625rem]">
                        <div className="flex justify-between items-center text-[0.525rem] text-[#8E8E8E] mb-1 border-b border-[#1F1F1F] pb-0.5">
                          <span>{log.author}</span>
                          <span>{log.timestamp}</span>
                        </div>
                        <p className="text-[#8E8E8E] italic">"{log.text}"</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-[#8E8E8E]/40 italic py-4 text-center">No sprint progress logs registered.</div>
                  )}
                </div>

                <div className="flex gap-2 border-t border-[#1F1F1F] pt-3">
                  <input 
                    type="text" 
                    placeholder="Log progress check details..." 
                    value={newSupportSprintNotes[selectedFlag.id] || ""}
                    onChange={(e) => setNewSupportSprintNotes(prev => ({ ...prev, [selectedFlag.id]: e.target.value }))}
                    className="flex-1 bg-[#121212] border border-[#1F1F1F] rounded px-3 py-1.5 text-xs text-[#FAF9F6] outline-none"
                  />
                  <button 
                    onClick={() => {
                      if (!newSupportSprintNotes[selectedFlag.id]?.trim()) return;
                      addFlagSprintLog(selectedFlag.id, currentAdmin.name, newSupportSprintNotes[selectedFlag.id].trim());
                      // Local sync
                      setSelectedFlag(prev => prev ? { 
                        ...prev, 
                        sprintLogs: [...(prev.sprintLogs || []), {
                          id: Date.now().toString(),
                          author: currentAdmin.name,
                          text: newSupportSprintNotes[selectedFlag.id].trim(),
                          timestamp: "Just now"
                        }]
                      } : null);
                      setNewSupportSprintNotes(prev => ({ ...prev, [selectedFlag.id]: "" }));
                    }}
                    className="bg-[#06B6D4] hover:bg-[#0891B2] text-[#0A0A0A] font-bold px-3.5 rounded text-xs"
                  >
                    + Log
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
