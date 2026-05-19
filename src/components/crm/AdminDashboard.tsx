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

// ═══════════════════════════════════════════════════════════════
//  SUBCOMPONENTS
// ═══════════════════════════════════════════════════════════════

function HealthRing({ score, size = 36 }: { score: number; size?: number }) {
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#10B981" : score >= 60 ? "#FF5A1F" : "#EF4444";

  return (
    <svg width={size} height={size} className="health-ring" aria-label={`Health score: ${score}`}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(135,128,116,0.12)" strokeWidth="3" />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fill={color} fontSize="9" fontWeight="800" fontFamily="var(--font-mono)" transform={`rotate(90 ${size / 2} ${size / 2})`}>{score}%</text>
    </svg>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const base = "w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0";
  switch (type) {
    case "milestone": return <div className={`${base} bg-emerald-500/10 text-emerald-600`} aria-hidden="true">✓</div>;
    case "comment": return <div className={`${base} bg-ember/10 text-ember`} aria-hidden="true">💬</div>;
    case "invoice": return <div className={`${base} bg-blue-500/10 text-blue-600`} aria-hidden="true">₹</div>;
    case "alert": return <div className={`${base} bg-rose-500/10 text-rose-600`} aria-hidden="true">🚨</div>;
    default: return null;
  }
}

function StageBadge({ stage }: { stage: ClientStage }) {
  const styles: Record<ClientStage, string> = {
    Lead: "border border-taupe/30 text-taupe bg-taupe/5",
    Proposal: "bg-amber-100 text-amber-800 border border-amber-200",
    "In Dev": "bg-charcoal text-sand border border-charcoal/20",
    Active: "bg-ember text-white shadow-xs",
    Completed: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-[0.6rem] uppercase tracking-[0.12em] font-mono font-medium ${styles[stage]}`}>
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
    userProfile,
    setUserProfile,
    isSupabaseConfigured,
    signOut,
    authorizedEmails,
    provisionUser,
    deprovisionUser
  } = useCRM();

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedClient, setSelectedClient] = useState<CRMClient | null>(null);

  // Changelog Composer local state
  const [composerClientId, setComposerClientId] = useState<string>("1");
  const [composerVersion, setComposerVersion] = useState<string>("v1.2.0");
  const [composerTitle, setComposerTitle] = useState<string>("Performance Polishing & Indexing Sprints");
  const [composerItemText, setComposerItemText] = useState<string>("");
  const [composerItems, setComposerItems] = useState<string[]>([
    "Optimized index parameters in transactions backend for Supreme Petro",
    "Decreased layout shift on Safaris mobile viewport",
    "Added client verification gate for release checks"
  ]);

  // Outreach quick log notes
  const [newLeadNotes, setNewLeadNotes] = useState<Record<string, string>>({});

  // Manual Lead Creation Form states
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [newLeadCompany, setNewLeadCompany] = useState("");
  const [newLeadDesc, setNewLeadDesc] = useState("");
  const [newLeadVal, setNewLeadVal] = useState("200000");
  const [newLeadSource, setNewLeadSource] = useState<LeadSource>("LinkedIn");
  const [newLeadSourcedBy, setNewLeadSourcedBy] = useState("a3"); // Ankit default
  const [newLeadAssigned, setNewLeadAssigned] = useState("a3");
  const [newLeadScore, setNewLeadScore] = useState("75");

  // Private task compilation details
  const [taskComposerComment, setTaskComposerComment] = useState<Comment | null>(null);
  const [taskComposerTitle, setTaskComposerTitle] = useState("");
  const [taskComposerAssignee, setTaskComposerAssignee] = useState("a2"); // Mouriyan tech default

  // Private task inline comment states
  const [newInternalTaskNotes, setNewInternalTaskNotes] = useState<Record<string, string>>({});

  // Support Flag Sprint notes state
  const [newSupportSprintNotes, setNewSupportSprintNotes] = useState<Record<string, string>>({});

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    setSelectedClient(null);
    setTaskComposerComment(null);
  }, []);

  const isCorePartner = useMemo(() => {
    if (!userProfile?.email) return true;
    const coreEmails = [
      "lakshbetala15@gmail.com",
      "gandhimouriyan1234@gmail.com",
      "monarchankit25@gmail.com",
      "muskanabani01@gmail.com"
    ];
    return coreEmails.includes(userProfile.email.toLowerCase());
  }, [userProfile]);

  const clients = useMemo(() => {
    if (isCorePartner) return allClients;
    if (userProfile?.primaryFocus === "Outreach & Marketing") return [];
    return allClients.filter(c => c.assignedAdminId === currentAdminId);
  }, [allClients, isCorePartner, userProfile, currentAdminId]);

  const flags = useMemo(() => {
    if (isCorePartner) return allFlags;
    if (userProfile?.primaryFocus === "Outreach & Marketing") return [];
    return allFlags.filter(f => f.assignedAdminId === currentAdminId);
  }, [allFlags, isCorePartner, userProfile, currentAdminId]);

  const releases = useMemo(() => {
    if (isCorePartner) return allReleases;
    if (userProfile?.primaryFocus === "Outreach & Marketing") return [];
    const clientIds = clients.map(c => c.id);
    return allReleases.filter(r => clientIds.includes(r.clientId));
  }, [allReleases, isCorePartner, userProfile, clients]);

  const internalTasks = useMemo(() => {
    if (isCorePartner) return allInternalTasks;
    if (userProfile?.primaryFocus === "Outreach & Marketing") return [];
    return allInternalTasks.filter(t => t.assignedAdminId === currentAdminId);
  }, [allInternalTasks, isCorePartner, userProfile, currentAdminId]);

  const potentialClients = useMemo(() => clients.filter(c => c.category === "Potential"), [clients]);
  const ongoingClients = useMemo(() => clients.filter(c => c.category === "Ongoing"), [clients]);
  
  // Current logged in admin
  const currentAdmin = team.find(t => t.id === currentAdminId) || team[0];

  const visibleTabs = useMemo(() => {
    const tabs = [
      { id: "overview", label: "Overview" },
    ];

    if (isCorePartner) {
      tabs.push(
        { id: "clients", label: `Client Desk (${allClients.filter(c => c.category === "Ongoing").length})` },
        { id: "internal tasks", label: `Sprint Tasks (${allInternalTasks.filter(t => t.status !== "Resolved").length})` },
        { id: "outreach", label: `Outreach Funnel (${leads.length})` },
        { id: "support queue", label: `Support Queue (${allFlags.filter(f => f.status !== "Resolved").length})` },
        { id: "releases", label: "Changelogs Composer" },
        { id: "products", label: "The Lab (SaaS)" },
        { id: "provisioning", label: "Access & Provisioning" }
      );
    } else {
      const isOutreach = userProfile?.primaryFocus === "Outreach & Marketing";
      if (isOutreach) {
        tabs.push(
          { id: "outreach", label: `Outreach Funnel (${leads.length})` }
        );
      } else {
        const assignedClientsCount = allClients.filter(c => c.category === "Ongoing" && c.assignedAdminId === currentAdminId).length;
        const assignedTasksCount = allInternalTasks.filter(t => t.status !== "Resolved" && t.assignedAdminId === currentAdminId).length;
        const assignedFlagsCount = allFlags.filter(f => f.status !== "Resolved" && f.assignedAdminId === currentAdminId).length;
        
        tabs.push(
          { id: "clients", label: `My Clients (${assignedClientsCount})` },
          { id: "internal tasks", label: `My Sprints (${assignedTasksCount})` },
          { id: "support queue", label: `My Support Queue (${assignedFlagsCount})` },
          { id: "releases", label: "My Changelogs" }
        );
      }
    }
    return tabs;
  }, [isCorePartner, userProfile, allClients, allInternalTasks, leads, allFlags, currentAdminId]);

  // Outreach Analytics Metrics Sourced By muskan & ankit
  const outreachAnalytics = useMemo(() => {
    const totalPipeline = leads.reduce((acc, l) => acc + l.estimatedValue, 0);
    const avgScore = leads.length > 0 ? Math.round(leads.reduce((acc, l) => acc + l.engagementScore, 0) / leads.length) : 0;
    const ankitLeads = leads.filter(l => l.sourcedById === "a3").length;
    const muskanLeads = leads.filter(l => l.sourcedById === "a4").length;
    return { totalPipeline, avgScore, ankitLeads, muskanLeads };
  }, [leads]);

  const overviewStats = useMemo(() => {
    if (isCorePartner) {
      return [
        { label: "Ongoing Accounts Managed", value: allClients.filter(c => c.category === "Ongoing").length, color: "text-charcoal" },
        { label: "Active Team Sprint Tasks", value: allInternalTasks.filter(t => t.status !== "Resolved").length, color: "text-indigo-600" },
        { label: "Support Escalation Tickets", value: allFlags.filter(f => f.status !== "Resolved").length, color: "text-rose-500" },
        { label: "Outreach Lead pipeline", value: formatCurrency(outreachAnalytics.totalPipeline), color: "text-emerald-700" }
      ];
    } else {
      const isOutreach = userProfile?.primaryFocus === "Outreach & Marketing";
      if (isOutreach) {
        return [
          { label: "Outreach Leads Sourced", value: leads.length, color: "text-charcoal" },
          { label: "Total Lead Pipeline", value: formatCurrency(outreachAnalytics.totalPipeline), color: "text-emerald-700" },
          { label: "Average Lead Score", value: `${outreachAnalytics.avgScore}%`, color: "text-indigo-600" }
        ];
      } else {
        const assignedClientsCount = allClients.filter(c => c.category === "Ongoing" && c.assignedAdminId === currentAdminId).length;
        const assignedTasksCount = allInternalTasks.filter(t => t.status !== "Resolved" && t.assignedAdminId === currentAdminId).length;
        const assignedFlagsCount = allFlags.filter(f => f.status !== "Resolved" && f.assignedAdminId === currentAdminId).length;
        
        return [
          { label: "My Assigned Clients", value: assignedClientsCount, color: "text-charcoal" },
          { label: "My Active Sprints", value: assignedTasksCount, color: "text-indigo-600" },
          { label: "My Support Tickets", value: assignedFlagsCount, color: "text-rose-500" }
        ];
      }
    }
  }, [isCorePartner, allClients, allInternalTasks, allFlags, outreachAnalytics, leads, userProfile, currentAdminId]);

  // Tab safety gate
  useEffect(() => {
    const isValid = visibleTabs.some(t => t.id === activeTab);
    if (!isValid && visibleTabs.length > 0) {
      setActiveTab("overview");
    }
  }, [activeTab, visibleTabs]);

  // Pre-authorization provisioner form states
  const [provEmail, setProvEmail] = useState("");
  const [provName, setProvName] = useState("");
  const [provRole, setProvRole] = useState("Dev Intern");
  const [provCategory, setProvCategory] = useState<"admin" | "client">("admin");
  const [provFocus, setProvFocus] = useState<"Client Delivery" | "Outreach & Marketing">("Client Delivery");
  const [provResponsibilities, setProvResponsibilities] = useState<string[]>([]);
  const [provClientId, setProvClientId] = useState<string>("");
  const [provIsSubmitting, setProvIsSubmitting] = useState(false);

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
      alert("🎉 Invited email successfully added to authorization registry! They can now sign up using this email and set their secret password.");
    } else {
      alert("❌ Error pre-authorizing credentials. Please try again.");
    }
  };

  const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const fadeUp = { hidden: { opacity: 0, y: 12, filter: "blur(3px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } } };

  // Helper to add dynamic checklist item in changelog composer
  const handleAddComposerItem = () => {
    if (!composerItemText.trim()) return;
    setComposerItems(prev => [...prev, composerItemText.trim()]);
    setComposerItemText("");
  };

  const handleRemoveComposerItem = (index: number) => {
    setComposerItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handlePublishRelease = () => {
    if (!composerVersion || !composerTitle || composerItems.length === 0) return;
    createRelease({
      clientId: Number(composerClientId),
      version: composerVersion,
      title: composerTitle,
      whatWasImproved: composerItems
    });
    setComposerVersion(`v1.2.${Date.now().toString().slice(-2)}`);
    setComposerItems([]);
    alert("📢 Changelog published successfully! The client will review the checklist in their portal before release goes live.");
  };

  // Convert client feedback comment directly to internal private task
  const triggerCommentToTask = (comment: Comment) => {
    setTaskComposerComment(comment);
    setTaskComposerTitle(`Resolve feedback: "${comment.text.slice(0, 35)}..."`);
    // Route UI-related comments to Muskan, database/tech to Mouriyan
    const isUI = comment.text.toLowerCase().includes("size") || comment.text.toLowerCase().includes("theme") || comment.text.toLowerCase().includes("color") || comment.text.toLowerCase().includes("layout");
    setTaskComposerAssignee(isUI ? "a4" : "a2");
  };

  const submitCommentToTask = () => {
    if (!taskComposerTitle.trim() || !taskComposerComment) return;
    addInternalTask({
      clientId: taskComposerComment.clientId,
      title: taskComposerTitle.trim(),
      assignedAdminId: taskComposerAssignee,
      originCommentId: taskComposerComment.id
    });
    setTaskComposerComment(null);
    alert("🛠️ Feedback successfully converted to a private team Sprint Task! The ticket is assigned.");
  };

  // Manual Lead Creation
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
    alert("🎯 Sourced outreach target successfully logged into calling pipeline!");
  };


  return (
    <div className="flex flex-col min-h-screen bg-sand relative noise-overlay pb-10">
      {/* ──── TOP BAR ──── */}
      <header className="sticky top-0 z-40 bg-sand/85 backdrop-blur-xl border-b border-taupe/15">
        <div className="flex justify-between items-center py-4 px-8 lg:px-12">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold tracking-[-0.04em] font-display">ALMMATIX <span className="text-ember">OS</span></h1>
            <div className="h-5 w-px bg-taupe/20" />
            <span className="portal-label text-taupe-light flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Startup Core Console
            </span>
          </div>

          <nav className="hidden xl:flex gap-1">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-3 py-1.5 rounded text-[0.65rem] uppercase tracking-[0.14em] font-mono font-medium transition-all duration-200 focus:outline-none ${
                  activeTab === tab.id
                    ? "bg-charcoal text-sand shadow-sm"
                    : "text-taupe hover:text-charcoal hover:bg-sand-warm/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[0.625rem] font-bold tracking-wider text-white" style={{ backgroundColor: currentAdmin.colorVar }}>
              {currentAdmin.avatar}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-charcoal">{currentAdmin.name}</div>
              <div className="text-[0.58rem] font-mono uppercase text-taupe" style={{ color: currentAdmin.colorVar }}>{currentAdmin.role}</div>
            </div>
          </div>
        </div>
      </header>

      {/* ──── MAIN CONTENT ──── */}
      <main className="flex-1 px-8 lg:px-12 py-8 relative z-10">
        <AnimatePresence mode="wait">
          
          {/* ═══ TAB 1: OVERVIEW & WORKLOAD BALANCER ═══ */}
          {activeTab === "overview" && (
            <motion.div key="overview" initial="hidden" animate="show" exit="hidden" variants={stagger} className="flex flex-col gap-10">

              {/* Dynamic OS Stats Grid */}
              <motion.div variants={fadeUp} className={`grid grid-cols-2 lg:grid-cols-${overviewStats.length} gap-4`}>
                {overviewStats.map((s, idx) => (
                  <div key={idx} className="bg-sand-light/60 border border-taupe/10 rounded-xl p-5 hover:border-taupe/20 transition-all flex flex-col justify-between shadow-xs">
                    <div className="portal-label text-[0.625rem] mb-2">{s.label}</div>
                    <div className={`text-2xl font-extrabold font-display ${s.color}`}>{s.value}</div>
                  </div>
                ))}
              </motion.div>

              {/* Startup Cross-Functional Workload Allocation Matrix */}
              <motion.div variants={fadeUp}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-[0.15em] font-mono text-charcoal">Startup Allocation & Workload Balancer</h2>
                  <span className="text-[0.65rem] text-taupe italic font-mono">Cross-functional responsibilities. Sprints monitored live.</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {team.map((member) => {
                    const memberClients = clients.filter(c => c.assignedAdminId === member.id);
                    const memberLeads = leads.filter(l => l.assignedAdminId === member.id);
                    const memberSprintTasks = internalTasks.filter(t => t.assignedAdminId === member.id && t.status !== "Resolved");
                    const memberFlags = flags.filter(f => f.assignedAdminId === member.id && f.status !== "Resolved");
                    
                    // Startup Cross-Functional split: Lakshya & Mouriyan handle Delivery (60%), Muskan & Ankit handle Outreach (60%)
                    let clientPct = 20;
                    let productPct = 20;
                    let outreachPct = 60;
                    
                    if (member.name === "Lakshya" || member.name === "Mouriyan") {
                      clientPct = 60;
                      productPct = 25;
                      outreachPct = 15; // Cross-functional backup
                    } else if (member.name === "Ankit" || member.name === "Muskan") {
                      outreachPct = 60;
                      productPct = 25;
                      clientPct = 15; // Cross-functional backup
                    }

                    return (
                      <div key={member.id} className="bg-sand-light/40 border border-taupe/10 rounded-xl p-5 hover:border-taupe/25 transition-colors relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 opacity-80" style={{ backgroundColor: member.colorVar }} />
                        
                        <div className="flex items-center gap-3 mb-4 mt-1">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[0.65rem] font-bold tracking-wider text-white shadow-xs" style={{ backgroundColor: member.colorVar }}>
                            {member.avatar}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-charcoal leading-snug">{member.name}</div>
                            <div className="text-[0.58rem] uppercase tracking-widest font-mono font-bold" style={{ color: member.colorVar }}>{member.role}</div>
                            <div className="mt-1 flex flex-wrap gap-1">
                              <span className="inline-block bg-charcoal/5 border border-charcoal/10 text-[0.52rem] font-mono px-1.5 py-0.5 rounded text-charcoal/70">
                                Core: {member.primaryFocus}
                              </span>
                              <span className="inline-block bg-ember/5 border border-ember/10 text-[0.52rem] font-mono px-1.5 py-0.5 rounded text-ember/70 animate-pulse">
                                Cross-Functional Backup
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Split Bar display */}
                        <div className="mb-4">
                          <div className="flex justify-between text-[0.55rem] font-mono text-taupe mb-1">
                            <span>Delivery {clientPct}%</span>
                            <span>Outreach {outreachPct}%</span>
                            <span>SaaS {productPct}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-taupe/10 rounded-full flex overflow-hidden">
                            <div style={{ width: `${clientPct}%`, backgroundColor: member.colorVar }} className="h-full" />
                            <div style={{ width: `${outreachPct}%`, backgroundColor: "var(--color-admin-ankit)" }} className="h-full opacity-65" />
                            <div style={{ width: `${productPct}%`, backgroundColor: "var(--color-admin-mouriyan)" }} className="h-full opacity-35" />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-1 mb-4 bg-white/40 border border-taupe/5 p-1.5 rounded text-center font-mono text-[0.7rem]">
                          <div>
                            <div className="text-[0.5rem] text-taupe-light">Accounts</div>
                            <div className="font-bold text-charcoal">{memberClients.length}</div>
                          </div>
                          <div>
                            <div className="text-[0.5rem] text-taupe-light">Tasks</div>
                            <div className="font-bold text-indigo-600">{memberSprintTasks.length}</div>
                          </div>
                          <div>
                            <div className="text-[0.5rem] text-taupe-light">Flags</div>
                            <div className="font-bold text-rose-500">{memberFlags.length}</div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="text-[0.58rem] uppercase tracking-widest text-taupe-light mb-1">Active Deliverables</div>
                          <div className="flex flex-wrap gap-1">
                            {memberClients.length > 0 ? memberClients.map(c => (
                              <span key={c.id} className="bg-white/60 border border-taupe/10 text-charcoal/80 text-[0.58rem] px-1.5 py-0.5 rounded shadow-2xs font-mono">{c.name}</span>
                            )) : <span className="text-[0.58rem] text-taupe italic">No active accounts</span>}
                          </div>
                        </div>

                        <div>
                          <div className="text-[0.58rem] uppercase tracking-widest text-taupe-light mb-1">Sprint Tasks</div>
                          <ul className="text-[0.68rem] text-charcoal space-y-1">
                            {member.activeTasks.map((t, idx) => (
                              <li key={idx} className="flex items-start gap-1 leading-snug">
                                <span className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ backgroundColor: member.colorVar }} />
                                {t}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Dynamic Comment REVIEW GATE Stream */}
                <div className="bg-sand-light/40 border border-taupe/10 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs font-bold uppercase tracking-[0.15em] font-mono text-charcoal">Client Feedback & Review Gate</h2>
                    <span className="portal-label bg-white/50 px-2 py-0.5 rounded">{comments.length} items logged</span>
                  </div>
                  <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-2">
                    {comments.map(c => {
                      const client = clients.find(cl => cl.id === c.clientId);
                      // Check if feedback is already converted to task
                      const isTasked = internalTasks.some(t => t.originCommentId === c.id);
                      
                      return (
                        <div key={c.id} className={`p-4 rounded-lg border flex flex-col gap-2 relative group ${c.role === "admin" ? "bg-white/70 border-taupe/15" : "bg-ember/5 border-ember/15"}`}>
                          <div className="flex justify-between items-center border-b border-taupe/5 pb-1">
                            <span className="text-[0.7rem] font-bold text-charcoal">
                              {c.author} 
                              <span className="font-normal text-taupe"> on </span>
                              <span className="text-ember font-mono uppercase">{client?.name || `Client #${c.clientId}`}</span>
                            </span>
                            <span className="text-[0.58rem] text-taupe font-mono">{c.timeElapsed}</span>
                          </div>
                          <p className="text-xs text-charcoal/90 leading-relaxed font-medium">"{c.text}"</p>
                          
                          <div className="flex justify-between items-center mt-1 pt-1 border-t border-taupe/5">
                            <span className="text-[0.55rem] text-taupe uppercase tracking-widest font-mono">Feedback Review Gate</span>
                            {c.role === "client" && (
                              isTasked ? (
                                <span className="bg-emerald-50 text-emerald-700 text-[0.58rem] font-bold px-2 py-0.5 rounded font-mono uppercase flex items-center gap-1 border border-emerald-100">
                                  ✓ Converted to Task
                                </span>
                              ) : (
                                <button 
                                  onClick={() => triggerCommentToTask(c)}
                                  className="bg-charcoal hover:bg-black text-sand text-[0.58rem] font-bold font-mono px-2 py-0.5 rounded uppercase tracking-wider transition-colors"
                                >
                                  🛠️ Convert to Task
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {comments.length === 0 && <div className="text-xs text-taupe text-center py-8">No recent feedback stream.</div>}
                  </div>
                </div>

                {/* System Activity */}
                <div className="bg-sand-light/40 border border-taupe/10 rounded-xl p-5 shadow-xs">
                   <h2 className="text-xs font-bold uppercase tracking-[0.15em] font-mono text-charcoal mb-4">Live Activity Streams</h2>
                   <div className="flex flex-col gap-2.5 max-h-[350px] overflow-y-auto pr-2">
                      {activities.map((item, i) => (
                        <div key={item.id || i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/40 transition-colors">
                          <ActivityIcon type={item.type} />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-charcoal leading-snug">{item.action}</div>
                            <div className="text-[0.625rem] text-taupe font-mono">{item.client}</div>
                          </div>
                          <div className="portal-label text-[0.55rem] text-taupe-light font-mono shrink-0">{item.time}</div>
                        </div>
                      ))}
                   </div>
                </div>
              </motion.div>

              {/* Modal overlay to create task from comment feedback */}
              <AnimatePresence>
                {taskComposerComment && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-charcoal/45 backdrop-blur-md flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }} className="bg-white border border-taupe/20 rounded-xl p-6 max-w-md w-full shadow-2xl relative">
                      <button onClick={() => setTaskComposerComment(null)} className="absolute top-4 right-4 text-taupe hover:text-charcoal transition-colors">
                        ✕
                      </button>
                      <h3 className="text-sm font-bold uppercase font-mono tracking-widest text-charcoal mb-3">🛠️ Convert Feedback to Task</h3>
                      
                      <div className="bg-sand-light/50 border border-taupe/10 p-3 rounded text-xs text-charcoal/80 italic mb-4 leading-normal pr-4">
                        Client feedback: "{taskComposerComment.text}"
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="portal-label block mb-1 font-mono uppercase text-[0.58rem]">Sprint Task Title</label>
                          <input 
                            type="text" 
                            value={taskComposerTitle}
                            onChange={(e) => setTaskComposerTitle(e.target.value)}
                            className="w-full bg-sand border border-taupe/15 text-xs rounded px-3 py-2 text-charcoal focus:outline-none focus:border-ember"
                          />
                        </div>

                        <div>
                          <label className="portal-label block mb-1 font-mono uppercase text-[0.58rem]">Assign Specialist</label>
                          <select 
                            value={taskComposerAssignee}
                            onChange={(e) => setTaskComposerAssignee(e.target.value)}
                            className="w-full bg-sand border border-taupe/15 text-xs rounded px-3 py-2 text-charcoal"
                          >
                            {team.map(t => (
                              <option key={t.id} value={t.id}>{t.name} ({t.role})</option>
                            ))}
                          </select>
                        </div>

                        <button 
                          onClick={submitCommentToTask}
                          className="w-full bg-charcoal hover:bg-black text-sand font-mono uppercase font-bold text-xs py-2.5 rounded transition-colors"
                        >
                          Push to Team Sprint board
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          )}
          
          {/* ═══ TAB 2: CLIENT DESK ═══ */}
          {activeTab === "clients" && (
            <motion.div key="clients" initial="hidden" animate="show" exit="hidden" variants={stagger} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* LEFT: Potential Clients (Pending Approvals / Conversions) */}
              <motion.div variants={fadeUp} className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-charcoal font-mono">Potential Client accounts</h2>
                  <div className="portal-label bg-white/60 px-2 py-0.5 rounded text-[0.6rem] font-mono">{potentialClients.length} deals</div>
                </div>
                <div className="flex flex-col gap-3">
                  {potentialClients.map((client) => {
                    const assignedAdmin = team.find(t => t.id === client.assignedAdminId);
                    return (
                      <div key={client.id} onClick={() => setSelectedClient(client)} className="bg-white/50 border border-taupe/10 rounded-xl p-4 cursor-pointer hover:border-taupe/30 hover:shadow-sm transition-all group relative">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-sand-deep/30 text-charcoal flex items-center justify-center text-[0.625rem] font-bold tracking-wider font-mono">{client.avatar}</div>
                            <div>
                              <div className="font-semibold text-sm group-hover:text-ember transition-colors leading-tight">{client.name}</div>
                              <div className="text-[0.68rem] text-taupe leading-snug">{client.project}</div>
                            </div>
                          </div>
                          <StageBadge stage={client.stage} />
                        </div>
                        <div className="flex items-center justify-between mt-4 border-t border-taupe/8 pt-3 text-[0.65rem]">
                          <div className="text-[0.58rem] text-taupe uppercase tracking-widest font-mono">Director Lead</div>
                          <div className="flex items-center gap-1.5">
                            {assignedAdmin && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: assignedAdmin.colorVar }} />}
                            <span className="font-semibold text-[0.68rem]" style={{ color: assignedAdmin?.colorVar }}>{assignedAdmin?.name}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {potentialClients.length === 0 && <div className="text-xs text-taupe italic text-center py-6 bg-white/10 rounded border border-dashed border-taupe/15">No pending proposals. All converted!</div>}
                </div>
              </motion.div>

              {/* RIGHT: Ongoing Clients & Detail View */}
              <motion.div variants={fadeUp} className="flex flex-col gap-4">
                {!selectedClient ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-charcoal font-mono">Active Ongoing Production</h2>
                      <div className="portal-label bg-white/60 px-2 py-0.5 rounded text-[0.6rem] font-mono">{ongoingClients.length} accounts</div>
                    </div>
                    <div className="flex flex-col gap-3">
                      {ongoingClients.map((client) => {
                        const assignedAdmin = team.find(t => t.id === client.assignedAdminId);
                        return (
                          <div key={client.id} onClick={() => setSelectedClient(client)} className="bg-sand-light/60 border border-taupe/10 rounded-xl p-4 cursor-pointer hover:border-taupe/30 hover:shadow-sm transition-all group">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded bg-charcoal text-sand flex items-center justify-center text-[0.65rem] font-bold tracking-wider font-mono">{client.avatar}</div>
                                <div>
                                  <div className="font-bold text-sm group-hover:text-ember transition-colors leading-tight">{client.name}</div>
                                  <div className="text-[0.65rem] text-taupe mb-1">{client.project}</div>
                                  <StageBadge stage={client.stage} />
                                </div>
                              </div>
                              <HealthRing score={client.health} size={36} />
                            </div>
                            <div className="flex items-center justify-between border-t border-taupe/8 pt-3 text-[0.65rem]">
                              <div className="text-[0.58rem] text-taupe uppercase tracking-widest font-mono">Delivery Director</div>
                              <div className="flex items-center gap-1.5">
                                {assignedAdmin && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: assignedAdmin.colorVar }} />}
                                <span className="font-semibold text-charcoal" style={{ color: assignedAdmin?.colorVar }}>{assignedAdmin?.name}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="bg-charcoal text-sand rounded-xl p-6 shadow-2xl relative border border-white/5">
                    <button onClick={() => setSelectedClient(null)} className="absolute top-4 right-4 p-2 text-taupe hover:text-white transition-colors" aria-label="Close details">
                      ✕
                    </button>
                    
                    <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-6">
                      <div className="w-12 h-12 rounded bg-white text-charcoal flex items-center justify-center text-md font-bold tracking-wider font-mono">{selectedClient.avatar}</div>
                      <div>
                        <h3 className="text-md font-bold font-display text-white">{selectedClient.name}</h3>
                        <div className="text-xs text-taupe mt-0.5">{selectedClient.project}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="portal-label text-taupe block mb-1 font-mono uppercase text-[0.58rem]">Project Stage</label>
                        <select 
                          value={selectedClient.stage} 
                          onChange={(e) => updateClientStage(selectedClient.id, e.target.value as ClientStage)}
                          className="w-full bg-white/5 border border-white/10 text-xs text-white rounded px-2.5 py-1.5 focus:outline-none focus:border-ember"
                        >
                          {(["Lead", "Proposal", "In Dev", "Active", "Completed"] as ClientStage[]).map(s => <option key={s} value={s} className="bg-charcoal">{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="portal-label text-taupe block mb-1 font-mono uppercase text-[0.58rem]">Delivery Director</label>
                        <select 
                          value={selectedClient.assignedAdminId || ""} 
                          onChange={(e) => updateClientAdmin(selectedClient.id, e.target.value)}
                          className="w-full bg-white/5 border border-white/10 text-xs text-white rounded px-2.5 py-1.5 focus:outline-none focus:border-ember"
                        >
                          <option value="" className="bg-charcoal">Unassigned</option>
                          {team.map(t => <option key={t.id} value={t.id} className="bg-charcoal">{t.name} ({t.role})</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="mb-6 bg-white/5 border border-white/5 rounded p-4 flex justify-between items-center">
                      <div>
                        <div className="portal-label text-taupe-light mb-1 font-mono uppercase text-[0.58rem]">Contract Value</div>
                        <div className="text-lg font-bold font-display text-white">{formatCurrency(selectedClient.revenue)}</div>
                      </div>
                      <HealthRing score={selectedClient.health} size={42} />
                    </div>

                    {/* Linked Private Sprint Tasks display */}
                    <div>
                      <div className="portal-label text-taupe mb-2 font-mono uppercase text-[0.58rem]">Client-Linked Sprint Tasks</div>
                      <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                        {internalTasks.filter(t => t.clientId === selectedClient.id).map(t => (
                          <div key={t.id} className="bg-white/5 border border-white/5 p-2 rounded flex justify-between items-center text-xs">
                            <span className="font-medium text-white/95 leading-tight">{t.title}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[0.55rem] font-mono font-bold uppercase ${
                              t.status === "Resolved" ? "bg-emerald-500/10 text-emerald-400" :
                              t.status === "In Review" ? "bg-amber-500/10 text-amber-400" :
                              t.status === "In Progress" ? "bg-sky-500/10 text-sky-400" :
                              "bg-white/10 text-white/50"
                            }`}>{t.status}</span>
                          </div>
                        ))}
                        {internalTasks.filter(t => t.clientId === selectedClient.id).length === 0 && (
                          <div className="text-[0.65rem] text-taupe italic text-center py-2">No linked sprint tasks logged.</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {/* ═══ TAB 3: INTERNAL SPRINT TASKS (PRIVATE COLLABORATION GATE) ═══ */}
          {activeTab === "internal tasks" && (
            <motion.div key="internal tasks" initial="hidden" animate="show" exit="hidden" variants={stagger} className="flex flex-col gap-6">
              
              <motion.div variants={fadeUp}>
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-xl font-bold font-display">🛠️ Private Sprint Tasks & Kanban</h2>
                    <p className="text-sm text-taupe mt-1">Collaboration Gate. Collaborate privately before drafting and publishing releases for client review.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="portal-label bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1 rounded font-mono uppercase font-semibold text-[0.625rem]">
                      {internalTasks.filter(t => t.status !== "Resolved").length} active items
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  {(["Todo", "In Progress", "In Review", "Resolved"] as TaskStatus[]).map((statusCol) => {
                    const colTasks = internalTasks.filter(t => t.status === statusCol);
                    return (
                      <div key={statusCol} className="bg-sand-light/50 border border-taupe/10 rounded-xl p-4 min-h-[480px] flex flex-col">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-taupe/10">
                          <span className="font-mono text-xs uppercase tracking-wider text-charcoal font-bold">{statusCol}</span>
                          <span className="bg-white border border-taupe/12 text-[0.6rem] font-bold px-2 py-0.5 rounded font-mono text-taupe">{colTasks.length}</span>
                        </div>

                        <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
                          {colTasks.map((task) => {
                            const assignee = team.find(t => t.id === task.assignedAdminId) || team[0];
                            const client = clients.find(c => c.id === task.clientId);
                            const prod = products.find(p => p.id === task.productId);

                            return (
                              <div key={task.id} className="bg-white border border-taupe/10 rounded-lg p-3 hover:border-taupe/25 transition-all shadow-2xs relative group">
                                <div className="absolute top-0 right-0 w-1.5 h-full rounded-r-lg" style={{ backgroundColor: assignee.colorVar }} />
                                
                                <div className="text-xs font-bold text-charcoal mb-1 leading-snug">{task.title}</div>
                                
                                {client && (
                                  <div className="text-[0.58rem] font-mono text-ember uppercase mb-1">Client: {client.name}</div>
                                )}
                                {prod && (
                                  <div className="text-[0.58rem] font-mono text-indigo-600 uppercase mb-1">Product: {prod.name}</div>
                                )}

                                <div className="space-y-1 bg-sand-light/40 border border-taupe/5 p-2 rounded text-[0.625rem] text-charcoal/80 mb-3">
                                  <div className="text-[0.5rem] font-mono uppercase text-taupe mb-1">Private Sprints Log</div>
                                  <div className="max-h-[70px] overflow-y-auto space-y-1 pr-1 font-mono">
                                    {task.internalNotes.map((note, nIdx) => (
                                      <div key={nIdx} className="leading-tight border-l border-taupe/15 pl-1.5 italic">"{note}"</div>
                                    ))}
                                  </div>
                                </div>

                                <div className="flex flex-col gap-1.5 border-t border-taupe/5 pt-2">
                                  <div className="flex items-center justify-between text-[0.55rem] font-mono text-taupe mb-1">
                                    <span>Owner: <strong style={{ color: assignee.colorVar }}>{assignee.name}</strong></span>
                                  </div>
                                  
                                  {/* Task Notes quick adding */}
                                  <div className="flex gap-1">
                                    <input 
                                      type="text"
                                      placeholder="Log sprint notes..."
                                      value={newInternalTaskNotes[task.id] || ""}
                                      onChange={(e) => setNewInternalTaskNotes(prev => ({ ...prev, [task.id]: e.target.value }))}
                                      className="flex-1 bg-sand border border-taupe/15 px-1.5 py-0.5 rounded text-[0.65rem] focus:outline-none focus:border-ember"
                                    />
                                    <button 
                                      onClick={() => {
                                        if (!newInternalTaskNotes[task.id]?.trim()) return;
                                        addInternalTaskNote(task.id, newInternalTaskNotes[task.id].trim());
                                        setNewInternalTaskNotes(prev => ({ ...prev, [task.id]: "" }));
                                      }}
                                      className="bg-charcoal hover:bg-black text-sand text-[0.58rem] px-2 rounded"
                                    >
                                      +
                                    </button>
                                  </div>

                                  {/* Status shifter */}
                                  <select
                                    value={task.status}
                                    onChange={(e) => updateInternalTaskStatus(task.id, e.target.value as TaskStatus)}
                                    className="w-full bg-sand border border-taupe/15 rounded text-[0.6rem] py-0.5 text-charcoal"
                                  >
                                    {(["Todo", "In Progress", "In Review", "Resolved"] as TaskStatus[]).map(s => (
                                      <option key={s} value={s}>{s}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

            </motion.div>
          )}

          {/* ═══ TAB 4: OUTREACH & COLD CALLS FUNNEL ═══ */}
          {activeTab === "outreach" && (
            <motion.div key="outreach" initial="hidden" animate="show" exit="hidden" variants={stagger} className="flex flex-col gap-6">
              
              {/* Outreach Sourcing Metrics Panel */}
              <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Deal Pipeline", value: formatCurrency(outreachAnalytics.totalPipeline) },
                  { label: "Pipeline Quality Index", value: `${outreachAnalytics.avgScore}%`, accent: true },
                  { label: "Sourced by Ankit (Comms)", value: `${outreachAnalytics.ankitLeads} leads` },
                  { label: "Sourced by Muskan (Branding)", value: `${outreachAnalytics.muskanLeads} leads` }
                ].map((m, idx) => (
                  <div key={idx} className="bg-sand-light/60 border border-taupe/10 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
                    <div className="portal-label text-[0.58rem] mb-1">{m.label}</div>
                    <div className={`text-xl font-bold font-display ${m.accent ? "text-ember" : "text-charcoal"}`}>{m.value}</div>
                  </div>
                ))}
              </motion.div>

              <motion.div variants={fadeUp}>
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-xl font-bold font-display">Almmatix Deal Funnel & Outreach</h2>
                    <p className="text-sm text-taupe mt-1">Outbound cold calling pipelines, social marketing sourcing (Muskan & Ankit), and direct conversions.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowLeadForm(prev => !prev)}
                      className="bg-charcoal hover:bg-black text-sand text-[0.625rem] font-bold font-mono uppercase px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      {showLeadForm ? "✕ Close Form" : "🎯 Sourced Lead +"}
                    </button>
                  </div>
                </div>

                {/* Inline Lead creation form */}
                <AnimatePresence>
                  {showLeadForm && (
                    <motion.form 
                      onSubmit={handleAddLeadSubmit}
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: "auto" }} 
                      exit={{ opacity: 0, height: 0 }} 
                      className="bg-white border border-taupe/15 rounded-xl p-5 mb-6 shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      <div>
                        <label className="portal-label block mb-1 font-mono uppercase text-[0.58rem]">Outreach Target Company</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Karthik Exports Pvt Ltd"
                          value={newLeadCompany}
                          onChange={(e) => setNewLeadCompany(e.target.value)}
                          className="w-full bg-sand border border-taupe/15 text-xs rounded px-3 py-2 text-charcoal focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="portal-label block mb-1 font-mono uppercase text-[0.58rem]">Project Deliverable Details</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Website development & CRM UI Sprints"
                          value={newLeadDesc}
                          onChange={(e) => setNewLeadDesc(e.target.value)}
                          className="w-full bg-sand border border-taupe/15 text-xs rounded px-3 py-2 text-charcoal focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="portal-label block mb-1 font-mono uppercase text-[0.58rem]">Estimated Value (INR)</label>
                        <input 
                          type="number" 
                          required
                          value={newLeadVal}
                          onChange={(e) => setNewLeadVal(e.target.value)}
                          className="w-full bg-sand border border-taupe/15 text-xs rounded px-3 py-2 text-charcoal focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="portal-label block mb-1 font-mono uppercase text-[0.58rem]">Sourcing Channel</label>
                        <select 
                          value={newLeadSource}
                          onChange={(e) => setNewLeadSource(e.target.value as LeadSource)}
                          className="w-full bg-sand border border-taupe/15 text-xs rounded px-3 py-2 text-charcoal"
                        >
                          {["Cold Call", "LinkedIn", "Twitter", "Email", "Referral", "Instagram", "Social Media"].map(sc => (
                            <option key={sc} value={sc}>{sc}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="portal-label block mb-1 font-mono uppercase text-[0.58rem]">Sourced By (Specialist)</label>
                        <select 
                          value={newLeadSourcedBy}
                          onChange={(e) => setNewLeadSourcedBy(e.target.value)}
                          className="w-full bg-sand border border-taupe/15 text-xs rounded px-3 py-2 text-charcoal"
                        >
                          {team.map(t => (
                            <option key={t.id} value={t.id}>{t.name} ({t.primaryFocus})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="portal-label block mb-1 font-mono uppercase text-[0.58rem]">Interest / Engagement Index (0-100)</label>
                        <input 
                          type="number" 
                          value={newLeadScore}
                          onChange={(e) => setNewLeadScore(e.target.value)}
                          className="w-full bg-sand border border-taupe/15 text-xs rounded px-3 py-2 text-charcoal focus:outline-none"
                        />
                      </div>

                      <div className="md:col-span-3 flex justify-end">
                        <button 
                          type="submit"
                          className="bg-charcoal hover:bg-black text-sand text-xs font-mono font-bold uppercase py-2 px-6 rounded"
                        >
                          Confirm & Log target Sourcing
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  {(["Lead", "Cold Contact", "Discussion", "Proposal"] as OutreachStatus[]).map((funnelStatus) => {
                    const statusLeads = leads.filter(l => l.status === funnelStatus);
                    return (
                      <div key={funnelStatus} className="bg-sand-light/50 border border-taupe/10 rounded-xl p-4 min-h-[480px] flex flex-col">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-taupe/10">
                          <span className="font-mono text-xs uppercase tracking-wider text-charcoal font-bold">{funnelStatus}</span>
                          <span className="bg-white border border-taupe/15 text-[0.6rem] font-bold px-2 py-0.5 rounded font-mono text-taupe">{statusLeads.length}</span>
                        </div>

                        <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
                          {statusLeads.map((lead) => {
                            const handler = team.find(t => t.id === lead.assignedAdminId) || team[0];
                            const sourcer = team.find(t => t.id === lead.sourcedById) || team[0];
                            return (
                              <div key={lead.id} className="bg-white border border-white rounded-lg p-3.5 hover:border-taupe/20 transition-all shadow-2xs relative group">
                                <div className="absolute top-0 right-0 w-1.5 h-full rounded-r-lg" style={{ backgroundColor: handler.colorVar }} />
                                
                                <div className="text-xs font-extrabold text-charcoal mb-1 leading-snug">{lead.companyName}</div>
                                <p className="text-[0.68rem] text-taupe leading-relaxed mb-3">{lead.projectDescription}</p>

                                {/* Sourcing information and Score bar */}
                                <div className="mb-3 space-y-2 border-t border-taupe/5 pt-2">
                                  <div className="flex justify-between text-[0.58rem] font-mono text-taupe-light">
                                    <span>Sourced By: <strong style={{ color: sourcer.colorVar }}>{sourcer.name}</strong></span>
                                    <span>Score: <strong className="text-ember">{lead.engagementScore}%</strong></span>
                                  </div>
                                  <div className="h-1 w-full bg-taupe/10 rounded-full overflow-hidden">
                                    <div style={{ width: `${lead.engagementScore}%` }} className="h-full bg-ember" />
                                  </div>
                                </div>

                                <div className="flex justify-between items-center text-[0.65rem] font-mono text-taupe mb-2">
                                  <span>Val: <span className="font-bold text-charcoal">{formatCurrency(lead.estimatedValue)}</span></span>
                                  <span>Calls: <span className="font-bold text-charcoal">{lead.callsMade} logs</span></span>
                                </div>

                                <div className="flex items-center gap-1.5 mb-3">
                                  <span className="text-[0.55rem] text-taupe-light font-mono uppercase">Channel:</span>
                                  <span className="bg-sand border border-taupe/10 px-1.5 py-0.5 rounded text-[0.55rem] font-bold font-mono tracking-wider text-charcoal">{lead.source}</span>
                                </div>

                                {/* Call note logs */}
                                <div className="mb-3.5 bg-sand-light/50 p-2 rounded text-[0.625rem] text-charcoal/80 space-y-1">
                                  <div className="text-[0.5rem] font-mono uppercase text-taupe">Notes & Contacts</div>
                                  <div className="max-h-[70px] overflow-y-auto space-y-1 pr-1 font-mono leading-tight">
                                    {lead.notes.map((note, nIdx) => (
                                      <div key={nIdx} className="border-l border-taupe/15 pl-1.5">"{note}"</div>
                                    ))}
                                  </div>
                                </div>

                                {/* Interactive Call Logger */}
                                <div className="flex flex-col gap-1.5 border-t border-taupe/5 pt-2">
                                  <div className="flex gap-1.5">
                                    <button 
                                      onClick={() => incrementLeadCalls(lead.id)}
                                      className="flex-1 bg-sand hover:bg-sand-deep border border-taupe/15 text-[0.55rem] font-mono uppercase font-bold py-1 px-1 rounded transition-all text-charcoal"
                                    >
                                      📞 Call Log
                                    </button>
                                    <button 
                                      onClick={() => convertLeadToClient(lead.id)}
                                      className="flex-1 bg-ember text-white text-[0.55rem] font-mono uppercase font-bold py-1 px-1 rounded hover:bg-ember-dark transition-all"
                                    >
                                      🤝 Convert
                                    </button>
                                  </div>

                                  <div className="flex gap-1">
                                    <input 
                                      type="text" 
                                      placeholder="Quick log note..." 
                                      value={newLeadNotes[lead.id] || ""}
                                      onChange={(e) => setNewLeadNotes(prev => ({ ...prev, [lead.id]: e.target.value }))}
                                      className="flex-1 bg-sand border border-taupe/15 px-1.5 py-0.5 rounded text-[0.65rem] focus:outline-none focus:border-ember"
                                    />
                                    <button 
                                      onClick={() => {
                                        if (!newLeadNotes[lead.id]?.trim()) return;
                                        addLeadNote(lead.id, newLeadNotes[lead.id].trim());
                                        setNewLeadNotes(prev => ({ ...prev, [lead.id]: "" }));
                                      }}
                                      className="bg-charcoal text-sand text-[0.58rem] px-2 rounded"
                                    >
                                      +
                                    </button>
                                  </div>

                                  {/* Funnel progression select */}
                                  <select 
                                    value={lead.status}
                                    onChange={(e) => updateLeadStatus(lead.id, e.target.value as OutreachStatus)}
                                    className="w-full bg-sand border border-taupe/15 rounded text-[0.6rem] py-0.5 text-charcoal"
                                  >
                                    {(["Lead", "Cold Contact", "Discussion", "Proposal", "Lost"] as OutreachStatus[]).map(st => (
                                      <option key={st} value={st}>{st}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ═══ TAB 5: SUPPORT QUEUE ═══ */}
          {activeTab === "support queue" && (
            <motion.div key="support queue" initial="hidden" animate="show" exit="hidden" variants={stagger}>
              <motion.div variants={fadeUp}>
                <div className="flex justify-between items-end mb-6">
                  <div>
                     <h2 className="text-xl font-bold font-display">🚨 Client Support & Escalation Flags</h2>
                     <p className="text-sm text-taupe mt-1">Post-service issue queues filed directly by personalized client portals. Track and update resolution timelines.</p>
                  </div>
                  <span className="bg-rose-50 border border-rose-200 text-rose-600 px-3 py-1 rounded font-mono uppercase font-semibold text-xs">
                    {flags.filter(f => f.status !== "Resolved").length} active alerts
                  </span>
                </div>

                <div className="bg-white border border-taupe/10 rounded-xl overflow-hidden shadow-2xs">
                  <div className="grid grid-cols-[0.8fr_1.3fr_2fr_1fr_1.2fr_1.5fr] gap-4 px-6 py-3.5 bg-sand-light/50 border-b border-taupe/15 font-mono text-[0.65rem] uppercase font-bold text-taupe">
                    <div>Severity</div>
                    <div>Client Account</div>
                    <div>Issue Escalation Details</div>
                    <div>Status</div>
                    <div>Sprint Owner</div>
                    <div>Sprint Timeline Resolution Logs</div>
                  </div>

                  <div className="divide-y divide-taupe/10">
                    {flags.map((flag) => {
                      const client = clients.find(c => c.id === flag.clientId);
                      const staff = team.find(t => t.id === flag.assignedAdminId);
                      
                      const severityColors: Record<FlagSeverity, string> = {
                        Critical: "bg-red-500 text-white animate-live-pulse",
                        High: "bg-orange-500 text-white",
                        Medium: "bg-amber-500 text-white",
                        Low: "bg-taupe text-sand"
                      };

                      return (
                        <div key={flag.id} className="grid grid-cols-[0.8fr_1.3fr_2fr_1fr_1.2fr_1.5fr] gap-4 px-6 py-4 items-center hover:bg-sand-warm/10 transition-colors">
                          {/* Severity */}
                          <div>
                            <span className={`inline-flex px-2 py-0.5 rounded text-[0.55rem] uppercase tracking-wider font-mono font-bold ${severityColors[flag.severity]}`}>
                              {flag.severity}
                            </span>
                          </div>

                          {/* Client */}
                          <div className="min-w-0 pr-2">
                            <div className="text-xs font-extrabold text-charcoal">{client?.name || `Client #${flag.clientId}`}</div>
                            <div className="text-[0.6rem] text-taupe font-mono leading-tight">{client?.project}</div>
                          </div>

                          {/* Escalation details */}
                          <div className="pr-4">
                            <div className="text-xs font-bold text-charcoal leading-snug">{flag.title}</div>
                            <p className="text-[0.68rem] text-taupe leading-normal mt-0.5">{flag.description}</p>
                            <span className="text-[0.55rem] text-taupe-light font-mono block mt-1">Logged: {flag.createdAt}</span>
                          </div>

                          {/* Status gate */}
                          <div>
                            <select
                              value={flag.status}
                              onChange={(e) => updateFlagStatus(flag.id, e.target.value as FlagStatus)}
                              className="bg-charcoal text-sand text-[0.65rem] rounded p-1 focus:outline-none focus:border-ember font-mono uppercase"
                            >
                              {(["Open", "Investigating", "In Dev", "Resolved"] as FlagStatus[]).map(st => (
                                <option key={st} value={st} className="bg-charcoal">{st}</option>
                              ))}
                            </select>
                          </div>

                          {/* Sprint Owner assignment */}
                          <div>
                            <select
                              value={flag.assignedAdminId || ""}
                              onChange={(e) => assignFlagAdmin(flag.id, e.target.value)}
                              className="bg-sand border border-taupe/15 text-[0.7rem] text-charcoal rounded p-1 focus:outline-none focus:border-ember"
                            >
                              <option value="">Unassigned</option>
                              {team.map(t => (
                                <option key={t.id} value={t.id}>{t.name} ({t.avatar})</option>
                              ))}
                            </select>
                          </div>

                          {/* Sprint Logs inline compiler */}
                          <div className="flex flex-col gap-1.5">
                            <div className="max-h-[80px] overflow-y-auto text-[0.65rem] text-charcoal/80 space-y-1 font-mono pr-1 bg-sand-light/30 p-1.5 rounded">
                              {flag.sprintLogs.map((log, lIdx) => (
                                <div key={log.id || lIdx} className="leading-tight">
                                  <strong className="text-charcoal">{log.author}:</strong> "{log.text}"
                                </div>
                              ))}
                            </div>
                            
                            <div className="flex gap-1">
                              <input 
                                type="text"
                                placeholder="Log sprint resolution update..."
                                value={newSupportSprintNotes[flag.id] || ""}
                                onChange={(e) => setNewSupportSprintNotes(prev => ({ ...prev, [flag.id]: e.target.value }))}
                                className="flex-1 bg-sand border border-taupe/15 px-1.5 py-0.5 rounded text-[0.65rem] focus:outline-none"
                              />
                              <button
                                onClick={() => {
                                  if (!newSupportSprintNotes[flag.id]?.trim()) return;
                                  addFlagSprintLog(flag.id, currentAdmin.name, newSupportSprintNotes[flag.id].trim());
                                  setNewSupportSprintNotes(prev => ({ ...prev, [flag.id]: "" }));
                                }}
                                className="bg-charcoal text-sand text-[0.58rem] px-2 rounded hover:bg-black"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {flags.length === 0 && (
                      <div className="text-sm text-taupe text-center py-8 italic bg-sand/10">No client flags recorded. Operations healthy!</div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ═══ TAB 6: CHANGELOGS COMPOSER ═══ */}
          {activeTab === "releases" && (
            <motion.div key="releases" initial="hidden" animate="show" exit="hidden" variants={stagger} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* LEFT & CENTER: Release Drafting Board */}
              <motion.div variants={fadeUp} className="lg:col-span-2 flex flex-col gap-6">
                <div className="bg-white border border-taupe/10 rounded-xl p-6 shadow-2xs">
                  <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-charcoal font-mono mb-4">📢 Draft Changelog Review Release</h2>
                  <p className="text-xs text-taupe mb-6 leading-relaxed">Compile client improvements internally. The client only sees this checklist in their portal for formal confirmation once published.</p>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="portal-label block mb-2 font-mono uppercase text-[0.625rem]">Select Client Account</label>
                        <select 
                          value={composerClientId}
                          onChange={(e) => setComposerClientId(e.target.value)}
                          className="w-full bg-sand border border-taupe/15 text-sm rounded px-3 py-2 text-charcoal"
                        >
                          {ongoingClients.map(cl => (
                            <option key={cl.id} value={cl.id}>{cl.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="portal-label block mb-2 font-mono uppercase text-[0.625rem]">Release Version</label>
                        <input 
                          type="text" 
                          placeholder="e.g. v1.2.0" 
                          value={composerVersion}
                          onChange={(e) => setComposerVersion(e.target.value)}
                          className="w-full bg-sand border border-taupe/15 text-sm rounded px-3 py-2 text-charcoal focus:outline-none focus:border-ember"
                        />
                      </div>
                      <div>
                        <label className="portal-label block mb-2 font-mono uppercase text-[0.625rem]">Release Title</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Analytics POLISH" 
                          value={composerTitle}
                          onChange={(e) => setComposerTitle(e.target.value)}
                          className="w-full bg-sand border border-taupe/15 text-sm rounded px-3 py-2 text-charcoal focus:outline-none focus:border-ember"
                        />
                      </div>
                    </div>

                    {/* What was improved checklist compiler */}
                    <div>
                      <label className="portal-label block mb-2 font-mono uppercase text-[0.625rem]">What was improved (Checklist Builder)</label>
                      <div className="flex gap-2 mb-3">
                        <input 
                          type="text" 
                          placeholder="Type an improvement action..." 
                          value={composerItemText}
                          onChange={(e) => setComposerItemText(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAddComposerItem()}
                          className="flex-1 bg-sand border border-taupe/15 text-sm rounded px-3 py-2 text-charcoal focus:outline-none focus:border-ember"
                        />
                        <button 
                          onClick={handleAddComposerItem}
                          className="bg-charcoal hover:bg-black text-sand font-mono uppercase font-bold text-xs px-4 rounded transition-colors"
                        >
                          Add Item
                        </button>
                      </div>

                      {/* Display compiled checklist */}
                      <div className="bg-sand-light/40 border border-taupe/10 rounded-lg p-4 space-y-2">
                        {composerItems.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-start gap-4 text-sm bg-white/70 px-3 py-2 rounded border border-taupe/5 group">
                            <span className="leading-snug text-charcoal font-medium">✓ {item}</span>
                            <button 
                              onClick={() => handleRemoveComposerItem(idx)}
                              className="text-[0.65rem] text-red-500 font-mono opacity-0 group-hover:opacity-100 hover:underline shrink-0"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        {composerItems.length === 0 && (
                          <div className="text-xs text-taupe italic text-center py-4">No checklist items added. Type above to add changes.</div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={handlePublishRelease}
                      disabled={composerItems.length === 0 || !composerVersion}
                      className="w-full bg-ember hover:bg-ember-dark text-white font-mono uppercase font-bold text-xs tracking-wider py-3 rounded transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      📢 Publish Release to Client Portal Review
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* RIGHT: Releases Pipeline Log */}
              <motion.div variants={fadeUp} className="flex flex-col gap-4">
                <div className="bg-sand-light/40 border border-taupe/10 rounded-xl p-5 shadow-xs">
                  <h2 className="text-xs font-bold uppercase tracking-[0.15em] font-mono text-charcoal mb-4">Releases Pipeline History</h2>
                  
                  <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                    {releases.map((release) => {
                      const client = clients.find(cl => cl.id === release.clientId);
                      return (
                        <div key={release.id} className="bg-white border border-taupe/10 rounded-lg p-3 relative shadow-2xs">
                          <span className={`absolute top-3 right-3 inline-flex px-1.5 py-0.5 rounded text-[0.55rem] font-mono font-bold ${
                            release.status === "Approved" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800 animate-pulse"
                          }`}>
                            {release.status}
                          </span>

                          <div className="text-[0.6rem] font-mono font-bold text-ember uppercase">{release.version}</div>
                          <div className="text-xs font-bold text-charcoal mb-1 leading-snug mt-0.5">{release.title}</div>
                          <div className="text-[0.65rem] text-taupe font-mono mb-2">Account: {client?.name}</div>

                          <div className="space-y-1 border-t border-taupe/5 pt-2 mb-2">
                            {release.whatWasImproved.map((imp, idx) => (
                              <div key={idx} className="text-[0.68rem] text-charcoal/80 flex items-start gap-1 leading-snug">
                                <span className="text-emerald-500 shrink-0">✓</span> {imp}
                              </div>
                            ))}
                          </div>
                          
                          {release.status === "Awaiting Review" && (
                            <button
                              onClick={() => approveRelease(release.id)}
                              className="w-full mt-2 bg-charcoal hover:bg-black text-sand text-[0.625rem] font-mono font-bold uppercase py-1.5 rounded transition-all"
                            >
                              Confirm Release Verification
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ═══ TAB 7: THE LAB (INTERNAL PRODUCTS INCUBATIONS) ═══ */}
          {activeTab === "products" && (
            <motion.div key="products" initial="hidden" animate="show" exit="hidden" variants={stagger}>
               <motion.div variants={fadeUp} className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold font-display">The Lab (Internal Products)</h2>
                      <p className="text-sm text-taupe mt-1">Proprietary SaaS tool incubations developed entirely in-house by Almmatix Companies.</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {products.map((product) => {
                      const lead = team.find(t => t.id === product.leadId);
                      const productTasks = internalTasks.filter(t => t.productId === product.id && t.status !== "Resolved");

                      return (
                        <div key={product.id} className="bg-sand-light/60 border border-taupe/10 rounded-2xl p-6 hover:shadow-lg transition-all group overflow-hidden relative shadow-xs flex flex-col justify-between">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-ember/5 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-115" />
                          
                          <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                              <div className="font-bold text-md text-charcoal leading-tight">{product.name}</div>
                              <span className="text-[0.55rem] uppercase tracking-widest font-mono bg-charcoal text-sand px-2 py-0.5 rounded font-semibold">{product.stage}</span>
                            </div>
                            
                            <p className="text-xs text-charcoal/80 mb-5 min-h-[40px] leading-relaxed">{product.description}</p>
                            
                            <div className="space-y-4">
                              {product.metrics && (
                                <div className="bg-white/40 border border-taupe/5 p-2 rounded flex justify-between items-center text-xs font-mono">
                                  <span className="text-taupe-light">{product.metrics.label}:</span>
                                  <strong className="text-charcoal">{product.metrics.value}</strong>
                                </div>
                              )}

                              <div>
                                <div className="text-[0.58rem] uppercase tracking-widest font-mono text-taupe mb-1.5">Development Progress</div>
                                <div className="w-full h-1.5 bg-taupe/15 rounded-full overflow-hidden">
                                  <div className="h-full bg-ember" style={{ width: `${product.progress}%` }} />
                                </div>
                                <div className="text-right text-[0.625rem] font-bold text-ember mt-0.5 font-mono">{product.progress}% Complete</div>
                              </div>

                              {/* Repo links */}
                              <div className="flex justify-between text-[0.625rem] font-mono text-taupe-light border-t border-taupe/5 pt-3">
                                <span>Repo: <a href={`https://${product.repoLink}`} className="underline text-charcoal font-semibold">{product.repoLink?.split("/").pop()}</a></span>
                                {product.sandboxLink && (
                                  <span>Preview: <a href={`https://${product.sandboxLink}`} className="underline text-ember font-semibold">Live Sandbox</a></span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="relative z-10 border-t border-taupe/10 pt-4 mt-5">
                            <div className="text-[0.58rem] uppercase tracking-widest font-mono text-taupe mb-2">Lab Product Lead</div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {lead && <span className="w-6 h-6 rounded bg-charcoal text-sand flex items-center justify-center text-[0.5rem] font-bold font-mono" style={{ backgroundColor: lead.colorVar }}>{lead.avatar}</span>}
                                <span className="text-xs font-semibold text-charcoal">{lead?.name}</span>
                              </div>
                              <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[0.55rem] font-mono uppercase">
                                {productTasks.length} active tasks
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
               </motion.div>
            </motion.div>
          )}

          {/* ═══ TAB 8: ACCESS & PROVISIONING (CORE PARTNERS ONLY) ═══ */}
          {activeTab === "provisioning" && isCorePartner && (
            <motion.div key="provisioning" initial="hidden" animate="show" exit="hidden" variants={stagger}>
              <motion.div variants={fadeUp} className="flex flex-col gap-8">
                <div>
                  <h2 className="text-xl font-bold font-display flex items-center gap-2">
                    Access & Credentials Provisioning
                    <span className="text-[0.55rem] font-mono uppercase bg-amber-500 text-charcoal px-2 py-0.5 rounded font-extrabold">Partners Only</span>
                  </h2>
                  <p className="text-sm text-taupe mt-1">Pre-authorize email addresses for new team interns or client sandboxes. They can then register themselves with a custom password.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left side: Provisioning Form */}
                  <form onSubmit={handleProvisionSubmit} className="lg:col-span-5 bg-sand-light/60 border border-taupe/15 rounded-2xl p-6 flex flex-col gap-5 shadow-xs">
                    <div className="text-xs uppercase tracking-widest font-mono text-charcoal font-bold border-b border-taupe/10 pb-2">Pre-Authorize Credentials</div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.625rem] font-mono uppercase text-taupe font-bold">Email Address</label>
                      <input
                        type="email"
                        required
                        value={provEmail}
                        onChange={(e) => setProvEmail(e.target.value)}
                        placeholder="e.g. intern.dev@almmatix.com"
                        className="w-full bg-sand-warm/30 border border-taupe/20 px-3 py-2 text-xs rounded font-sans focus:outline-none focus:border-charcoal transition-all text-charcoal font-medium placeholder-taupe/40"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.625rem] font-mono uppercase text-taupe font-bold">Invitee Full Name</label>
                      <input
                        type="text"
                        required
                        value={provName}
                        onChange={(e) => setProvName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full bg-sand-warm/30 border border-taupe/20 px-3 py-2 text-xs rounded font-sans focus:outline-none focus:border-charcoal transition-all text-charcoal font-medium placeholder-taupe/40"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.625rem] font-mono uppercase text-taupe font-bold">Designation / Role Title</label>
                      <input
                        type="text"
                        required
                        value={provRole}
                        onChange={(e) => setProvRole(e.target.value)}
                        placeholder="e.g. Developer Intern"
                        className="w-full bg-sand-warm/30 border border-taupe/20 px-3 py-2 text-xs rounded font-sans focus:outline-none focus:border-charcoal transition-all text-charcoal font-medium placeholder-taupe/40"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.625rem] font-mono uppercase text-taupe font-bold">Account Category</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: "admin", label: "Startup Admin (Intern/Dev)" },
                          { id: "client", label: "Client Partner" }
                        ].map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setProvCategory(cat.id as any);
                              if (cat.id === "client") {
                                setProvRole("Client Partner");
                              } else {
                                setProvRole("Dev Intern");
                              }
                            }}
                            className={`py-2 px-3 rounded text-[0.65rem] uppercase font-mono font-bold tracking-wider border transition-all text-center focus:outline-none ${
                              provCategory === cat.id
                                ? "bg-charcoal text-sand border-charcoal"
                                : "border-taupe/20 text-taupe hover:border-taupe/40 hover:bg-sand-warm/20"
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {provCategory === "admin" ? (
                      <>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[0.625rem] font-mono uppercase text-taupe font-bold">Primary Specialization Focus</label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: "Client Delivery", label: "Client Delivery" },
                              { id: "Outreach & Marketing", label: "Outreach Funnel" }
                            ].map((focus) => (
                              <button
                                key={focus.id}
                                type="button"
                                onClick={() => {
                                  setProvFocus(focus.id as any);
                                  setProvResponsibilities([]);
                                }}
                                className={`py-2 px-2 rounded text-[0.65rem] uppercase font-mono font-bold tracking-wider border transition-all text-center focus:outline-none ${
                                  provFocus === focus.id
                                    ? "bg-ember text-sand border-ember"
                                    : "border-taupe/20 text-taupe hover:border-taupe/40 hover:bg-sand-warm/20"
                                }`}
                              >
                                {focus.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[0.625rem] font-mono uppercase text-taupe font-bold">Seeded Staff Responsibilities</label>
                          <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto border border-taupe/10 p-3 rounded bg-sand-warm/25">
                            {(provFocus === "Client Delivery" 
                              ? ["API Architecture", "Database Schema", "Production Builds", "Bug Fixes", "CSS Polishing", "Client Communication"]
                              : ["Lead Sourcing", "Cold Calling Funnel", "Social Media Outreach", "Client Outreach", "Sales Pitching"]
                            ).map((resp) => {
                              const checked = provResponsibilities.includes(resp);
                              return (
                                <label key={resp} className="flex items-center gap-2 cursor-pointer text-[0.65rem] font-mono font-medium text-charcoal select-none">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => {
                                      if (checked) {
                                        setProvResponsibilities(prev => prev.filter(r => r !== resp));
                                      } else {
                                        setProvResponsibilities(prev => [...prev, resp]);
                                      }
                                    }}
                                    className="rounded border-taupe/30 text-ember focus:ring-ember cursor-pointer"
                                  />
                                  {resp}
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[0.625rem] font-mono uppercase text-taupe font-bold">Link to Active Client Project</label>
                        <select
                          required
                          value={provClientId}
                          onChange={(e) => setProvClientId(e.target.value)}
                          className="w-full bg-sand-warm/30 border border-taupe/20 px-3 py-2 text-xs rounded font-sans focus:outline-none focus:border-charcoal transition-all text-charcoal font-semibold"
                        >
                          <option value="">-- Choose Client Sandbox Workspace --</option>
                          {allClients.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.project})
                            </option>
                          ))}
                        </select>
                        <p className="text-[0.55rem] text-taupe font-mono lowercase mt-0.5">Linking a client to a project restricts their live dashboard to this specific project only.</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={provIsSubmitting}
                      className="w-full bg-charcoal hover:bg-ember text-sand font-mono uppercase py-2.5 rounded-lg text-xs font-bold tracking-widest transition-all duration-300 shadow-sm border border-charcoal focus:outline-none flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {provIsSubmitting ? "Processing Authorization..." : "⚡ Pre-Authorize Credentials"}
                    </button>
                  </form>

                  {/* Right side: Registry Directory */}
                  <div className="lg:col-span-7 bg-sand-light/60 border border-taupe/15 rounded-2xl p-6 flex flex-col gap-4 shadow-xs min-h-[500px]">
                    <div className="flex justify-between items-center border-b border-taupe/10 pb-2">
                      <div className="text-xs uppercase tracking-widest font-mono text-charcoal font-bold">Authorized Sign-Up Registry</div>
                      <span className="text-[0.6rem] font-mono bg-charcoal text-sand px-2 py-0.5 rounded">{authorizedEmails.length} active invitations</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-sans text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-taupe/15 text-[0.625rem] font-mono uppercase text-taupe tracking-wider">
                            <th className="pb-3 font-semibold">User Details</th>
                            <th className="pb-3 font-semibold">Category</th>
                            <th className="pb-3 font-semibold">Focus / Project</th>
                            <th className="pb-3 font-semibold text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {authorizedEmails.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-8 text-center text-taupe font-mono text-[0.65rem] uppercase">
                                No pre-authorized email invitations active
                              </td>
                            </tr>
                          ) : (
                            authorizedEmails.map((ae) => {
                              const isLive = team.some(t => t.name.toLowerCase() === ae.name.toLowerCase());
                              const linkedClient = ae.clientId ? allClients.find(c => c.id === ae.clientId) : null;
                              return (
                                <tr key={ae.email} className="border-b border-taupe/10 last:border-0 hover:bg-sand-warm/20 transition-all">
                                  <td className="py-4 pr-3">
                                    <div className="flex items-center gap-3">
                                      <span className="w-8 h-8 rounded bg-charcoal text-sand flex items-center justify-center text-[0.6rem] font-extrabold" style={{ backgroundColor: ae.colorVar }}>
                                        {ae.avatar}
                                      </span>
                                      <div>
                                        <div className="font-bold text-charcoal leading-tight">{ae.name}</div>
                                        <div className="text-[0.625rem] font-mono text-taupe leading-relaxed">{ae.email}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-4">
                                    <span className={`inline-flex px-2 py-0.5 rounded text-[0.55rem] uppercase tracking-widest font-mono font-bold ${
                                      ae.category === "admin" 
                                        ? "bg-amber-100 text-amber-800 border border-amber-200" 
                                        : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                    }`}>
                                      {ae.category}
                                    </span>
                                  </td>
                                  <td className="py-4">
                                    {ae.category === "admin" ? (
                                      <div>
                                        <div className="font-semibold text-charcoal">{ae.role}</div>
                                        <div className="text-[0.625rem] font-mono text-taupe">{ae.primaryFocus}</div>
                                      </div>
                                    ) : (
                                      <div>
                                        {linkedClient ? (
                                          <>
                                            <div className="font-semibold text-charcoal">{linkedClient.name}</div>
                                            <div className="text-[0.625rem] font-mono text-taupe leading-none mt-0.5">{linkedClient.project}</div>
                                          </>
                                        ) : (
                                          <span className="text-rose-500 font-mono text-[0.6rem]">No Project Linked</span>
                                        )}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-4 text-right">
                                    {/* Core partners are immutable */}
                                    {[
                                      "lakshbetala15@gmail.com",
                                      "gandhimouriyan1234@gmail.com",
                                      "monarchankit25@gmail.com",
                                      "muskanabani01@gmail.com"
                                    ].includes(ae.email.toLowerCase()) ? (
                                      <span className="text-[0.58rem] font-mono uppercase bg-charcoal text-sand px-2 py-0.5 rounded">Core Partner</span>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          if (confirm(`Revoke all sign-up permissions for ${ae.name} (${ae.email})?`)) {
                                            await deprovisionUser(ae.email);
                                          }
                                        }}
                                        className="text-[0.6rem] font-mono uppercase border border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white px-2 py-1 rounded transition-all focus:outline-none"
                                      >
                                        [ Revoke Access ]
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ──── SIMULATOR SWITCHER (MOCK ONLY) ──── */}
      {!isSupabaseConfigured && (
        <div className="fixed bottom-4 right-4 z-50 bg-charcoal text-sand border border-sand p-4 rounded-xl shadow-2xl w-72 font-mono text-[0.625rem] tracking-wider uppercase border-sand/40">
          <div className="flex justify-between items-center mb-2 border-b border-sand/20 pb-1">
            <span className="font-extrabold text-ember flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-ember animate-pulse" />
              OS SANDBOX SIMULATOR
            </span>
            <span className="text-[0.55rem] text-taupe">Mock Mode</span>
          </div>
          <div className="text-[0.55rem] text-sand/70 mb-3 normal-case font-sans tracking-normal leading-relaxed text-left">
            Toggle between roles to verify access filters: Core Partners see all, Outreach interns see leads only, Dev interns see assigned projects only.
          </div>
          <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
            {[
              { email: "lakshbetala15@gmail.com", name: "Lakshya (Core Partner)", role: "PM & Client Delivery Lead", focus: "Client Delivery", cat: "admin" },
              { email: "gandhimouriyan1234@gmail.com", name: "Mouriyan (Core Partner)", role: "Backend & Tech Delivery Lead", focus: "Client Delivery", cat: "admin" },
              { email: "monarchankit25@gmail.com", name: "Ankit (Core Partner)", role: "Outreach & Marketing Lead", focus: "Outreach & Marketing", cat: "admin" },
              { email: "muskanabani01@gmail.com", name: "Muskan (Core Partner)", role: "Brand & Marketing Director", focus: "Outreach & Marketing", cat: "admin" },
              { email: "intern.outreach@almmatix.com", name: "Outreach Intern (Non-core)", role: "Outreach Intern", focus: "Outreach & Marketing", cat: "admin" },
              { email: "intern.dev@almmatix.com", name: "Delivery Intern (Non-core)", role: "Dev Intern", focus: "Client Delivery", cat: "admin" },
            ].map((mock) => {
              const active = userProfile?.email?.toLowerCase() === mock.email.toLowerCase();
              return (
                <button
                  key={mock.email}
                  onClick={() => {
                    setUserProfile({
                      id: mock.email === "lakshbetala15@gmail.com" ? "a1" : mock.email === "gandhimouriyan1234@gmail.com" ? "a2" : mock.email === "monarchankit25@gmail.com" ? "a3" : mock.email === "muskanabani01@gmail.com" ? "a4" : `mock_${mock.email.split("@")[0]}`,
                      email: mock.email,
                      name: mock.name.split(" ")[0],
                      role: mock.role,
                      category: mock.cat as "admin" | "client",
                      avatar: mock.name.substring(0, 2).toUpperCase(),
                      colorVar: mock.email === "lakshbetala15@gmail.com" ? "var(--color-admin-lakshya)" : mock.email === "gandhimouriyan1234@gmail.com" ? "var(--color-admin-mouriyan)" : mock.email === "monarchankit25@gmail.com" ? "var(--color-admin-ankit)" : mock.email === "muskanabani01@gmail.com" ? "var(--color-admin-muskan)" : "var(--color-neutral)",
                      primaryFocus: mock.focus,
                      responsibilities: ["Simulation Task"],
                      activeTasks: ["Simulation Task Active"]
                    });
                    setActiveTab("overview");
                  }}
                  className={`w-full text-left p-1.5 rounded transition-all flex items-center justify-between border ${
                    active 
                      ? "bg-sand text-charcoal border-ember font-bold" 
                      : "bg-charcoal/40 text-sand/80 border-transparent hover:bg-sand-warm/10"
                  }`}
                >
                  <span>{mock.name}</span>
                  <span className="text-[0.5rem] px-1 py-0.2 rounded border border-sand/15 font-mono uppercase bg-black/30">
                    {mock.focus.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
