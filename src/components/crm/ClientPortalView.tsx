"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCRM, ProjectFlag, ChangelogRelease, FlagSeverity, FlagStatus } from "./CRMContext";

// ═══════════════════════════════════════════════════════════════
//  DATA & UTILS
// ═══════════════════════════════════════════════════════════════

interface Milestone {
  id: number;
  title: string;
  status: "completed" | "current" | "upcoming";
  date: string;
}

interface Invoice {
  id: string;
  amount: string;
  status: "paid" | "pending" | "overdue";
  date: string;
  description: string;
}

// Generate client-specific milestones
const getMilestonesForClient = (clientId: number): Milestone[] => {
  switch (clientId) {
    case 1:
      return [
        { id: 1, title: "Tally Integration Core Architecture", status: "completed", date: "Apr 12" },
        { id: 2, title: "Analytics dashboard & Chart Polish", status: "completed", date: "Apr 28" },
        { id: 3, title: "Phase 1 Review — Real-time stream", status: "current", date: "May 15" },
        { id: 4, title: "Phase 2 — Excel Invoicing module", status: "upcoming", date: "Jun 01" },
        { id: 5, title: "Final Handover & UAT Support", status: "upcoming", date: "Jun 15" },
      ];
    case 3:
      return [
        { id: 1, title: "UI Mockups & Gold Pricing wireframes", status: "completed", date: "May 01" },
        { id: 2, title: "Live Rates Fetching API service link", status: "current", date: "May 18" },
        { id: 3, title: "Admin Portal Accents & Alerts Integration", status: "upcoming", date: "May 30" },
        { id: 4, title: "UAT Handover Beta Release", status: "upcoming", date: "Jun 10" },
      ];
    default:
      return [
        { id: 1, title: "Kickoff & Resource Provisioning", status: "completed", date: "May 05" },
        { id: 2, title: "Core Platform DB Schema design", status: "current", date: "May 20" },
        { id: 3, title: "B2B Admin Dashboard UI & API Integration", status: "upcoming", date: "Jun 15" },
      ];
  }
};

function MilestoneTracker({ milestones }: { milestones: Milestone[] }) {
  return (
    <div className="flex flex-col gap-0 select-none">
      {milestones.map((m, i) => (
        <div key={m.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div 
              className={`w-3.5 h-3.5 rounded-full shrink-0 border flex items-center justify-center transition-colors duration-300 ${
                m.status === "completed" 
                  ? "bg-[#06B6D4]/15 border-[#06B6D4]" 
                  : m.status === "current" 
                    ? "bg-[#0A0A0A] border-[#06B6D4] animate-pulse" 
                    : "bg-[#121212] border-[#1F1F1F]"
              }`}
            >
              {m.status === "completed" && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]" />
              )}
              {m.status === "current" && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] animate-ping" />
              )}
            </div>
            {i < milestones.length - 1 && (
              <div 
                className={`w-[2px] flex-1 min-h-[40px] transition-colors duration-300 ${
                  m.status === "completed" ? "bg-[#06B6D4]/30" : "bg-[#1F1F1F]"
                }`} 
              />
            )}
          </div>
          <div className="pb-6 -mt-0.5 flex-1 min-w-0">
            <div 
              className={`text-xs font-mono font-bold tracking-wide ${
                m.status === "current" 
                  ? "text-[#06B6D4]" 
                  : m.status === "completed" 
                    ? "text-[#FAF9F6]" 
                    : "text-[#8E8E8E]"
              }`}
            >
              {m.title}
            </div>
            <div className="text-[0.625rem] font-mono text-[#8E8E8E] mt-1">{m.date}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function InvoiceStatusBadge({ status }: { status: Invoice["status"] }) {
  const styles: Record<Invoice["status"], string> = {
    paid: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    pending: "bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/20",
    overdue: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-md text-[0.55rem] uppercase tracking-wider font-mono font-semibold border ${styles[status]}`}>
      {status}
    </span>
  );
}

// --- Custom Confetti Particle Physics Effect (Obsidian matched Colors) ---
interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  dX: number;
  dY: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
}

function ConfettiEffect({ active, onComplete }: { active: boolean; onComplete: () => void }) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    // Colors matching Obsidian palette: Glacier Cyan, Cobalt/Cyan tones, and elegant silver/white
    const colors = ["#06B6D4", "#22D3EE", "#0891B2", "#FAF9F6", "#38BDF8", "#0EA5E9"];
    const newParticles: ConfettiParticle[] = Array.from({ length: 90 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 9;
      return {
        id: i,
        x: typeof window !== "undefined" ? window.innerWidth / 2 : 500,
        y: typeof window !== "undefined" ? window.innerHeight * 0.75 : 500,
        dX: Math.cos(angle) * speed,
        dY: Math.sin(angle) * speed - 10, // Fire upwards
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 8,
        rotation: Math.random() * 360,
        rotationSpeed: -12 + Math.random() * 24,
      };
    });

    setParticles(newParticles);

    let animationFrameId: number;
    let elapsed = 0;

    const updatePhysics = () => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.dX,
            y: p.y + p.dY,
            dY: p.dY + 0.32, // Gravity weight
            dX: p.dX * 0.975, // Air resistance drag
            rotation: p.rotation + p.rotationSpeed,
          }))
          .filter((p) => p.y < (typeof window !== "undefined" ? window.innerHeight : 1000) + 50 && p.x > -50 && p.x < (typeof window !== "undefined" ? window.innerWidth : 2000) + 50)
      );

      elapsed += 16;
      if (elapsed < 3200) {
        animationFrameId = requestAnimationFrame(updatePhysics);
      } else {
        onComplete();
      }
    };

    animationFrameId = requestAnimationFrame(updatePhysics);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
            borderRadius: p.id % 2 === 0 ? "50%" : "0%",
            boxShadow: "0 2px 8px rgba(6,182,212,0.15)",
          }}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════════

export default function ClientPortalView() {
  const { 
    clients, 
    team, 
    comments, 
    flags, 
    releases, 
    selectedClientId, 
    setSelectedClientId,
    addComment, 
    deleteComment,
    addFlag,
    approveRelease 
  } = useCRM();

  const [activeTab, setActiveTab] = useState("overview");
  const [newComment, setNewComment] = useState("");
  
  // Custom states for Releases & Confetti
  const [triggerConfetti, setTriggerConfetti] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, Record<number, boolean>>>({});

  const toggleCheckItem = useCallback((releaseId: string, itemIdx: number) => {
    setCheckedItems(prev => {
      const releaseChecked = prev[releaseId] || {};
      return {
        ...prev,
        [releaseId]: {
          ...releaseChecked,
          [itemIdx]: !releaseChecked[itemIdx]
        }
      };
    });
  }, []);

  const isReleaseFullyChecked = useCallback((release: ChangelogRelease) => {
    const releaseChecked = checkedItems[release.id] || {};
    return release.whatWasImproved.every((_, idx) => releaseChecked[idx]);
  }, [checkedItems]);

  // Local support flag form states
  const [flagTitle, setFlagTitle] = useState("");
  const [flagDesc, setFlagDesc] = useState("");
  const [flagSeverity, setFlagSeverity] = useState<FlagSeverity>("High");

  // Load Active Client context dynamically
  const activeClient = useMemo(() => {
    return clients.find(c => c.id === selectedClientId) || clients.find(c => c.category === "Ongoing") || clients[0];
  }, [clients, selectedClientId]);

  // Client-specific list items
  const clientMilestones = useMemo(() => getMilestonesForClient(activeClient.id), [activeClient]);
  const clientComments = useMemo(() => comments.filter(c => c.clientId === activeClient.id), [comments, activeClient]);
  const clientFlags = useMemo(() => flags.filter(f => f.clientId === activeClient.id), [flags, activeClient]);
  const clientReleases = useMemo(() => releases.filter(r => r.clientId === activeClient.id), [releases, activeClient]);

  // Generate dynamic invoices based on contract revenue
  const clientInvoices = useMemo((): Invoice[] => {
    const rev = activeClient.revenue;
    const formatINR = (val: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
    
    return [
      { id: `INV-0${activeClient.id}1`, amount: formatINR(rev * 0.33), status: "paid", date: "Apr 15, 2026", description: "Phase 1 — Advance Contract Commitment" },
      { id: `INV-0${activeClient.id}2`, amount: formatINR(rev * 0.33), status: "paid", date: "May 01, 2026", description: "Phase 2 — Development Kickoff Milestone" },
      { id: `INV-0${activeClient.id}3`, amount: formatINR(rev * 0.34), status: "pending", date: "May 25, 2026", description: "Phase 3 — Production Handover & UAT" },
    ];
  }, [activeClient]);

  const handleTabChange = useCallback((tab: string) => setActiveTab(tab), []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
  };

  // Prevent unload if typing feedback
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (newComment.trim().length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [newComment]);

  const handlePostComment = useCallback(() => {
    if (!newComment.trim()) return;
    addComment({
      clientId: activeClient.id,
      author: activeClient.name,
      role: "client",
      text: newComment,
      timestamp: "Live Portal",
      timeElapsed: "Just now",
    });
    setNewComment("");
  }, [newComment, addComment, activeClient]);

  const handlePostFlag = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!flagTitle.trim() || !flagDesc.trim()) return;

    addFlag({
      clientId: activeClient.id,
      title: flagTitle.trim(),
      description: flagDesc.trim(),
      severity: flagSeverity,
      assignedAdminId: activeClient.assignedAdminId || "a1"
    });

    setFlagTitle("");
    setFlagDesc("");
    setFlagSeverity("High");
    alert("🚨 Support flag logged! Our engineering sprint lead has been assigned.");
  }, [flagTitle, flagDesc, flagSeverity, activeClient, addFlag]);

  const fadeUp = { hidden: { opacity: 0, y: 12, filter: "blur(2px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } } };
  const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0A0A0A] text-[#FAF9F6] font-sans antialiased relative selection:bg-[#06B6D4]/20 selection:text-[#06B6D4]">
      {/* Dynamic Confetti physics generator */}
      <ConfettiEffect active={triggerConfetti} onComplete={() => setTriggerConfetti(false)} />

      {/* ──── LEFT SIMULATED SIDEBAR (MINIMALIST CONSOLE FRAME) ──── */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#1F1F1F] bg-[#121212] flex flex-col justify-between shrink-0 select-none md:h-screen sticky top-0 z-30">
        <div className="flex flex-col">
          
          {/* Brand/Branding console title */}
          <div className="p-6 border-b border-[#1F1F1F] flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4] animate-pulse" aria-hidden="true" />
            <h1 className="text-sm font-bold tracking-widest font-mono text-[#FAF9F6] text-pretty">ALMMATIX CLIENT</h1>
          </div>

          {/* Active Profile simulated Widget */}
          <div className="p-4 mx-4 my-3 bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl flex items-center gap-3">
            <div 
              className="w-8 h-8 bg-[#06B6D4] text-[#0A0A0A] rounded-lg flex items-center justify-center text-xs font-bold font-mono" 
              aria-hidden="true"
            >
              {activeClient.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#FAF9F6] truncate leading-tight">{activeClient.name}</div>
              <div className="text-[0.6rem] font-mono uppercase text-[#8E8E8E] truncate mt-1">{activeClient.project}</div>
            </div>
          </div>

          {/* Simulated Client Selector Dropdown for simulation */}
          <div className="px-4 py-2 flex flex-col gap-1.5 border-b border-[#1F1F1F] pb-4">
            <label htmlFor="client-simulation-selector" className="text-[0.55rem] font-mono uppercase tracking-wider text-[#8E8E8E]">
              Simulate Account Portal
            </label>
            <select
              id="client-simulation-selector"
              value={selectedClientId}
              onChange={(e) => {
                setSelectedClientId(Number(e.target.value));
                setActiveTab("overview");
              }}
              className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg px-2.5 py-1.5 text-[0.68rem] font-mono font-semibold text-[#FAF9F6] uppercase focus:outline-none focus:border-[#06B6D4] focus-visible:ring-1 focus-visible:ring-[#06B6D4]/30 cursor-pointer"
            >
              {clients.filter(c => c.category === "Ongoing").map(cl => (
                <option key={cl.id} value={cl.id}>{cl.name}</option>
              ))}
            </select>
          </div>

          {/* Sidebar vertical tabs navigation */}
          <nav className="p-4 flex flex-col gap-1.5" aria-label="Client Space Navigation">
            {[
              { id: "overview", label: "Overview", icon: "📊", count: null },
              { id: "releases", label: "What’s New", icon: "📢", count: clientReleases.filter(r => r.status === "Awaiting Review").length },
              { id: "support", label: "Support Queue", icon: "🛠️", count: clientFlags.length },
              { id: "invoices", label: "Invoices", icon: "🧾", count: clientInvoices.filter(i => i.status === "pending").length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-mono tracking-wider transition-all duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#06B6D4] cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#1F1F1F] text-[#06B6D4] border border-[#06B6D4]/30"
                    : "text-[#8E8E8E] hover:text-[#FAF9F6] hover:bg-[#1F1F1F]/50"
                }`}
              >
                <span className="uppercase text-left truncate flex items-center gap-2">
                  <span className="text-sm" aria-hidden="true">{tab.icon}</span>
                  {tab.label}
                </span>
                {tab.count !== null && tab.count > 0 && (
                  <span 
                    className={`text-[0.625rem] px-2 py-0.5 rounded-full font-mono ${
                      activeTab === tab.id ? "bg-[#06B6D4]/20 text-[#06B6D4]" : "bg-[#0A0A0A] text-[#8E8E8E] border border-[#1F1F1F]"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>

        </div>

        {/* Sidebar Footer Live Status */}
        <div className="p-4 border-t border-[#1F1F1F] bg-[#0E0E0E] flex flex-col gap-1 select-none">
          <div className="flex items-center gap-1.5 font-mono text-[0.58rem] tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" aria-hidden="true" />
            <span className="text-emerald-400 font-bold uppercase">🟢 CLIENT SYNC ACTIVE</span>
          </div>
          <div className="text-[0.5rem] font-mono text-[#8E8E8E] mt-0.5">ALMMATIX V2.4</div>
        </div>
      </aside>

      {/* ──── RIGHT SCROLLABLE WORKSPACE (MINIMAL DETAILS PANEL) ──── */}
      <main className="flex-1 overflow-y-auto px-6 md:px-12 py-8 md:py-10 z-10 bg-[#0A0A0A]">
        <AnimatePresence mode="wait">

          {/* ═══ TAB 1: OVERVIEW ═══ */}
          {activeTab === "overview" && (
            <motion.div key="overview" initial="hidden" animate="show" exit="hidden" variants={stagger} className="flex flex-col gap-8">
              
              {/* Heading */}
              <motion.div variants={fadeUp}>
                <h2 className="text-2xl font-bold font-mono tracking-tight text-[#FAF9F6] text-pretty">{activeClient.project}</h2>
                <p className="text-xs text-[#8E8E8E] font-mono mt-1.5 uppercase tracking-wider">
                  Interactive customer node view. Monitor sprint activities and flag resolutions.
                </p>
              </motion.div>

              {/* Minimal metrics cards */}
              <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Contract Value", value: formatCurrency(activeClient.revenue) },
                  { label: "Paid Invoices", value: formatCurrency(activeClient.revenue * 0.66) },
                  { label: "Milestones", value: `${clientMilestones.filter(m => m.status === "completed").length}/${clientMilestones.length}` },
                  { label: "Production Health", value: `${activeClient.health}%`, accent: true },
                ].map((s, idx) => (
                  <div key={idx} className="bg-[#121212] border border-[#1F1F1F] rounded-xl p-5 hover:border-[#06B6D4]/30 transition-all duration-200">
                    <div className="text-[0.55rem] font-mono uppercase tracking-wider text-[#8E8E8E] mb-2">{s.label}</div>
                    <div className={`text-base font-mono font-bold tracking-tight ${s.accent ? "text-[#06B6D4]" : "text-[#FAF9F6]"}`}>{s.value}</div>
                  </div>
                ))}
              </motion.div>

              {/* Two Column details split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Milestone Delivery Tracker */}
                <motion.div variants={fadeUp} className="lg:col-span-2">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-[0.15em] text-[#06B6D4] mb-4">Project Delivery Timeline</h3>
                  <div className="bg-[#121212] border border-[#1F1F1F] rounded-xl p-6">
                    <MilestoneTracker milestones={clientMilestones} />
                  </div>
                </motion.div>
                
                {/* Sprint Specialists */}
                <motion.div variants={fadeUp} className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-xs font-bold font-mono uppercase tracking-[0.15em] text-[#06B6D4] mb-4">Sprint Specialists</h3>
                    <div className="bg-[#121212] border border-[#1F1F1F] rounded-xl p-5 flex flex-col gap-4">
                      {team.filter(t => t.id === activeClient.assignedAdminId || t.id === "a2" || t.id === "a4").map((p) => (
                        <div key={p.id} className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[0.58rem] font-bold tracking-wider text-white shadow-xs shrink-0" 
                            style={{ backgroundColor: p.colorVar }}
                            aria-hidden="true"
                          >
                            {p.avatar}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-[#FAF9F6] truncate">{p.name}</div>
                            <div className="text-[0.625rem] font-mono text-[#8E8E8E] uppercase tracking-wider mt-0.5 truncate">{p.role}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

              </div>
            </motion.div>
          )}

          {/* ═══ TAB 2: WHAT'S NEW (RELEASE VERIFICATION CYCLE) ═══ */}
          {activeTab === "releases" && (
            <motion.div key="releases" initial="hidden" animate="show" exit="hidden" variants={stagger} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Releases Timeline & Approvals */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="mb-4">
                  <h2 className="text-lg font-bold font-mono tracking-tight text-[#FAF9F6]">📢 What’s New & Release Approvals</h2>
                  <p className="text-xs text-[#8E8E8E] font-mono mt-1.5 uppercase tracking-wider leading-relaxed">
                    Review specific checklist items completed in our development sprints. Verify each element and deploy live.
                  </p>
                </div>

                <div className="space-y-6">
                  {clientReleases.map((rel) => (
                    <motion.div 
                      key={rel.id}
                      variants={fadeUp}
                      className="bg-[#121212] border border-[#1F1F1F] rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:border-[#06B6D4]/30"
                    >
                      {/* Status Badge */}
                      <span className={`absolute top-6 right-6 inline-flex px-2 py-0.5 rounded font-mono text-[0.55rem] font-bold uppercase tracking-wider border ${
                        rel.status === "Approved" 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                          : "bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/20"
                      }`}>
                        {rel.status}
                      </span>

                      {/* Glowing subtle background glow for awaiting review */}
                      {rel.status === "Awaiting Review" && (
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#06B6D4]/5 rounded-full filter blur-xl -mr-6 -mt-6 pointer-events-none animate-pulse" />
                      )}

                      <div className="text-[0.55rem] font-mono font-bold text-[#06B6D4] uppercase tracking-widest">{rel.version}</div>
                      <h3 className="text-sm font-bold font-mono text-[#FAF9F6] mt-1 mb-1.5">{rel.title}</h3>
                      <div className="text-[0.625rem] font-mono text-[#8E8E8E] mb-4">Published: {rel.publishedAt}</div>

                      {/* Verification checklist */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-[0.55rem] font-mono uppercase text-[#8E8E8E] tracking-widest mb-1 select-none">
                          <span>Sprint Verification Checklist</span>
                          {rel.status === "Awaiting Review" && (
                            <span className="text-[#06B6D4] font-bold">Sign-off required</span>
                          )}
                        </div>

                        <div className="space-y-2.5">
                          {rel.whatWasImproved.map((imp, idx) => {
                            const isChecked = !!(checkedItems[rel.id]?.[idx]);
                            const isAwaiting = rel.status === "Awaiting Review";

                            return (
                              <button
                                key={idx}
                                disabled={!isAwaiting}
                                onClick={() => toggleCheckItem(rel.id, idx)}
                                className={`w-full flex items-start gap-3.5 p-3.5 rounded-xl border text-left transition-all duration-200 group ${
                                  !isAwaiting 
                                    ? "bg-[#0A0A0A]/40 border-transparent text-[#8E8E8E]/80 cursor-default" 
                                    : isChecked
                                      ? "bg-[#06B6D4]/5 border-[#06B6D4]/25 text-[#FAF9F6] shadow-xs cursor-pointer"
                                      : "bg-[#0A0A0A] border-[#1F1F1F] hover:border-[#06B6D4]/30 text-[#FAF9F6]/90 hover:bg-[#121212] cursor-pointer"
                                }`}
                              >
                                <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center border transition-all duration-200 ${
                                  !isAwaiting
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                    : isChecked
                                      ? "bg-[#06B6D4] border-[#06B6D4] text-[#0A0A0A] scale-105"
                                      : "bg-[#121212] border-[#1F1F1F] group-hover:border-[#06B6D4]/50"
                                }`}>
                                  {(!isAwaiting || isChecked) ? (
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  ) : (
                                    <span className="text-[0.55rem] font-mono text-[#8E8E8E] font-bold">{idx + 1}</span>
                                  )}
                                </div>
                                <div className="flex flex-col flex-1 leading-snug">
                                  <span className={`text-xs font-mono font-medium transition-all duration-200 ${
                                    isChecked && isAwaiting ? "line-through text-[#8E8E8E] font-normal" : "text-[#FAF9F6]"
                                  }`}>
                                    {imp}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Confirm release action */}
                      {rel.status === "Awaiting Review" ? (
                        <div className="flex flex-col md:flex-row md:items-center justify-between border-t border-[#1F1F1F] pt-4 gap-4 mt-4">
                          <div className="text-[0.625rem] font-mono text-[#8E8E8E] leading-relaxed max-w-sm">
                            👉 Please verify and click each checklist item above. Once all items are verified, you can deploy the release live to production.
                          </div>
                          
                          {(() => {
                            const fullyChecked = isReleaseFullyChecked(rel);
                            return (
                              <button
                                disabled={!fullyChecked}
                                onClick={() => {
                                  approveRelease(rel.id);
                                  setTriggerConfetti(true);
                                }}
                                className={`font-mono uppercase font-bold text-[0.68rem] tracking-wider px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap overflow-hidden shrink-0 ${
                                  fullyChecked
                                    ? "bg-[#06B6D4] hover:bg-[#06B6D4]/80 text-[#0A0A0A] cursor-pointer shadow-[0_4px_14px_rgba(6,182,212,0.3)] scale-[1.02] hover:scale-[1.04] active:scale-[0.98]"
                                    : "bg-[#1F1F1F] text-[#8E8E8E]/40 cursor-not-allowed border border-[#1F1F1F]"
                                }`}
                              >
                                {fullyChecked ? "🚀 Approve & Deploy Release" : "🔒 Verify Items to Unlock"}
                              </button>
                            );
                          })()}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono border-t border-[#1F1F1F]/40 pt-4 mt-4 select-none">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Verified & Released live in production at: {rel.approvedAt || "Recently"}</span>
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {clientReleases.length === 0 && (
                    <div className="bg-[#121212] border border-dashed border-[#1F1F1F] p-8 rounded-xl text-center text-[#8E8E8E] font-mono italic">
                      No changelogs uploaded for review yet. Sprints ongoing!
                    </div>
                  )}
                </div>
              </div>

              {/* Right Sidebar: Direct Feedback Thread */}
              <motion.div variants={fadeUp} className="flex flex-col bg-[#121212] border border-[#1F1F1F] rounded-xl overflow-hidden h-[fit-content]">
                <div className="p-5 border-b border-[#1F1F1F]">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-[0.15em] text-[#FAF9F6]">Project Activity & Feedback</h3>
                  <div className="text-[0.625rem] font-mono text-[#8E8E8E] mt-1.5 uppercase">Direct communication with your delivery leads.</div>
                </div>

                {/* Comments feed */}
                <div className="p-5 flex flex-col gap-4 max-h-[350px] overflow-y-auto dark-scrollbar bg-[#0A0A0A]/40">
                  <AnimatePresence>
                    {clientComments.map((c) => (
                      <motion.div 
                        key={c.id} 
                        initial={{ opacity: 0, y: 8 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3.5 rounded-lg border relative group ${
                          c.role === "admin" ? "bg-[#1F1F1F] border-[#06B6D4]/30" : "bg-[#0A0A0A] border-[#1F1F1F]"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1.5 pr-6">
                          <span className="text-xs font-bold text-[#FAF9F6]">{c.author}</span>
                          <span className="font-mono text-[0.55rem] text-[#06B6D4] bg-[#06B6D4]/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                            @ {c.timestamp}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-[#FAF9F6]/85 leading-relaxed break-words">{c.text}</p>
                        <div className="text-[0.55rem] font-mono text-[#8E8E8E] mt-1.5">{c.timeElapsed}</div>
                        
                        {/* Delete Comment Button */}
                        {c.role === "client" && (
                          <button 
                            onClick={() => deleteComment(c.id)}
                            className="absolute top-2 right-2 p-1 text-[#8E8E8E] hover:text-[#EF4444] hover:bg-[#1F1F1F] rounded opacity-0 group-hover:opacity-100 transition-all focus:outline-none focus:opacity-100 focus-visible:ring-1 focus-visible:ring-[#EF4444] cursor-pointer" 
                            aria-label="Delete comment"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M3 6h18"/>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                              <line x1="10" y1="11" x2="10" y2="17"/>
                              <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Input block */}
                <div className="p-4 border-t border-[#1F1F1F] bg-[#121212]">
                  <textarea 
                    value={newComment} 
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Log feedback for Live Releases…"
                    className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-lg p-3 text-xs focus:outline-none focus-visible:ring-1 focus-visible:ring-[#06B6D4]/50 resize-none mb-2 placeholder:text-[#8E8E8E]/40 text-[#FAF9F6]"
                    rows={2}
                    spellCheck={false}
                  />
                  <button 
                    onClick={handlePostComment} 
                    className="w-full bg-[#06B6D4] hover:bg-[#06B6D4]/80 text-[#0A0A0A] transition-colors py-2 rounded-lg text-xs font-semibold font-mono uppercase tracking-wider focus:outline-none focus-visible:ring-1 focus-visible:ring-[#06B6D4]"
                  >
                    Post Comment Feedback
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ═══ TAB 3: SUPPORT QUEUE ═══ */}
          {activeTab === "support" && (
            <motion.div key="support" initial="hidden" animate="show" exit="hidden" variants={stagger} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Support Escalation filing form */}
              <div className="lg:col-span-1 bg-[#121212] border border-[#1F1F1F] rounded-xl p-5 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[#FAF9F6] font-mono mb-4">🚨 Flag a Post-Service Issue</h3>
                <p className="text-[0.625rem] text-[#8E8E8E] leading-relaxed font-sans mb-6">
                  Encountered an anomaly or require structural enhancements? File an escalation flag. Our sprint lead will review it immediately.
                </p>

                <form onSubmit={handlePostFlag} className="space-y-4">
                  <div>
                    <label htmlFor="support-severity" className="block mb-1.5 font-mono uppercase text-[0.55rem] text-[#8E8E8E] tracking-wider">Severity Urgency</label>
                    <select
                      id="support-severity"
                      value={flagSeverity}
                      onChange={(e) => setFlagSeverity(e.target.value as FlagSeverity)}
                      className="w-full bg-[#0A0A0A] border border-[#1F1F1F] text-xs rounded px-3 py-2 text-[#FAF9F6] font-mono focus:outline-none focus:border-[#06B6D4]"
                    >
                      <option value="Critical">Critical (Blocker Outage)</option>
                      <option value="High">High (Core Feature Glitch)</option>
                      <option value="Medium">Medium (General Enhancement)</option>
                      <option value="Low">Low (Visual / QA Polish)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="support-title" className="block mb-1.5 font-mono uppercase text-[0.55rem] text-[#8E8E8E] tracking-wider">Issue Title Summary</label>
                    <input 
                      id="support-title"
                      type="text" 
                      placeholder="e.g. Rate card wrapping jitter…"
                      required
                      value={flagTitle}
                      onChange={(e) => setFlagTitle(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#1F1F1F] text-xs rounded px-3 py-2 text-[#FAF9F6] font-mono focus:outline-none focus:border-[#06B6D4]"
                      spellCheck={false}
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label htmlFor="support-desc" className="block mb-1.5 font-mono uppercase text-[0.55rem] text-[#8E8E8E] tracking-wider">Description Escalation Details</label>
                    <textarea 
                      id="support-desc"
                      placeholder="Explain the anomaly exactly, adding steps to replicate or browser context details…"
                      required
                      rows={4}
                      value={flagDesc}
                      onChange={(e) => setFlagDesc(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#1F1F1F] text-xs rounded px-3 py-2 text-[#FAF9F6] font-mono focus:outline-none focus:border-[#06B6D4] resize-none"
                      spellCheck={false}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-mono uppercase font-bold text-[0.68rem] tracking-wider py-2.5 rounded transition-all shadow-xs cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#06B6D4]"
                  >
                    🚀 Submit Escalation Flag
                  </button>
                </form>
              </div>

              {/* Active support queue logs */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[#FAF9F6] font-mono">My Support Escalation queue</h3>
                  <p className="text-[0.625rem] text-[#8E8E8E] font-mono mt-1.5 uppercase tracking-wider">
                    Real-time resolution updates. Watch when assignments are Investigating, In Dev, or Resolved.
                  </p>
                </div>

                <div className="space-y-6">
                  {clientFlags.map((flag) => {
                    const severityColors: Record<FlagSeverity, string> = {
                      Critical: "bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse",
                      High: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
                      Medium: "bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/20",
                      Low: "bg-[#1F1F1F] text-[#8E8E8E] border border-[#1F1F1F]"
                    };

                    const statusStages: { label: string; key: FlagStatus; desc: string }[] = [
                      { label: "Logged", key: "Open", desc: "Flag submitted" },
                      { label: "Investigating", key: "Investigating", desc: "Technical analysis" },
                      { label: "Sprint Dev", key: "In Dev", desc: "Hotfix in progress" },
                      { label: "Resolved", key: "Resolved", desc: "Deployed live" }
                    ];

                    const getStatusProgress = (status: FlagStatus) => {
                      switch (status) {
                        case "Open": return 12.5;
                        case "Investigating": return 37.5;
                        case "In Dev": return 67.5;
                        case "Resolved": return 100;
                      }
                    };

                    const currentStageIdx = statusStages.findIndex(s => s.key === flag.status);
                    const assignee = team.find(t => t.id === flag.assignedAdminId);

                    return (
                      <motion.div 
                        key={flag.id} 
                        variants={fadeUp}
                        className="bg-[#121212] border border-[#1F1F1F] rounded-2xl p-6 shadow-sm flex flex-col gap-5 relative overflow-hidden"
                      >
                        {/* Ticket Header */}
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[0.55rem] uppercase tracking-wider font-mono font-bold shrink-0 border ${severityColors[flag.severity]}`}>
                              {flag.severity} Severity
                            </span>
                            <span className="text-[0.625rem] text-[#8E8E8E] font-mono">Logged: {flag.createdAt}</span>
                          </div>
                          <div className="text-[0.625rem] font-mono text-[#8E8E8E] uppercase bg-[#0A0A0A] px-2 py-0.5 rounded border border-[#1F1F1F]">
                            Ticket: #{flag.id.substring(0, 7)}
                          </div>
                        </div>

                        {/* Ticket details */}
                        <div>
                          <h4 className="text-sm font-bold text-[#FAF9F6] font-mono leading-tight">{flag.title}</h4>
                          <p className="text-xs text-[#FAF9F6]/70 leading-relaxed font-sans mt-2">{flag.description}</p>
                        </div>

                        {/* Interactive timeline */}
                        <div className="py-2">
                          <div className="relative flex justify-between items-center w-full">
                            {/* Background track line */}
                            <div className="absolute top-[14px] left-[12.5%] right-[12.5%] h-[2px] bg-[#1F1F1F] -z-10 rounded-full" />
                            
                            {/* Filled track line based on status */}
                            <div 
                              className="absolute top-[14px] left-[12.5%] h-[2px] bg-[#06B6D4] -z-10 rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                              style={{ width: `${Math.max(0, (getStatusProgress(flag.status) - 12.5) * (100 / 75))}%` }}
                            />

                            {statusStages.map((stage, idx) => {
                              const isCompleted = idx <= currentStageIdx;
                              const isActive = idx === currentStageIdx;

                              return (
                                <div key={stage.key} className="flex flex-col items-center flex-1 relative select-none">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 font-mono text-[0.625rem] font-bold ${
                                    isCompleted 
                                      ? "bg-[#06B6D4] border-[#06B6D4] text-[#0A0A0A]"
                                      : "bg-[#121212] border-[#1F1F1F] text-[#8E8E8E]"
                                  } ${isActive ? "ring-4 ring-[#06B6D4]/15" : ""}`}>
                                    {isCompleted && !isActive ? (
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                    ) : (
                                      <span>{idx + 1}</span>
                                    )}
                                  </div>
                                  <span className={`text-[0.55rem] font-mono font-bold mt-2 tracking-wider uppercase ${
                                    isActive ? "text-[#06B6D4]" : isCompleted ? "text-[#FAF9F6]" : "text-[#8E8E8E]"
                                  }`}>
                                    {stage.label}
                                  </span>
                                  <span className="text-[0.48rem] font-sans text-[#8E8E8E]/65 mt-0.5 text-center hidden md:inline px-1">
                                    {stage.desc}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Sprint Owner & logs logs */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-[#1F1F1F] pt-4 items-stretch">
                          
                          <div className="md:col-span-1">
                            {assignee ? (
                              <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl p-3.5 flex items-center gap-3 relative overflow-hidden h-full">
                                <div className="absolute top-0 left-0 bottom-0 w-[3px]" style={{ backgroundColor: assignee.colorVar }} />
                                <div 
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[0.58rem] font-bold tracking-wider text-white shadow-xs shrink-0" 
                                  style={{ backgroundColor: assignee.colorVar }}
                                  aria-hidden="true"
                                >
                                  {assignee.avatar}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-[0.5rem] font-mono uppercase text-[#8E8E8E] tracking-widest leading-none mb-1">Sprint Lead</div>
                                  <div className="text-xs font-bold text-[#FAF9F6] leading-none truncate">{assignee.name}</div>
                                  <div className="text-[0.55rem] font-mono text-[#8E8E8E] mt-1 truncate uppercase tracking-wide leading-none">{assignee.role}</div>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-[#0A0A0A] border border-dashed border-[#1F1F1F] rounded-xl p-3.5 flex items-center justify-center text-center h-full">
                                <span className="text-[0.55rem] font-mono text-[#8E8E8E] italic">Awaiting Lead Assignment</span>
                              </div>
                            )}
                          </div>

                          <div className="md:col-span-2 bg-[#0A0A0A] border border-[#1F1F1F] p-4 rounded-xl font-mono text-[0.65rem] flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-2 pb-1 border-b border-[#1F1F1F]">
                              <span className="text-[0.55rem] uppercase font-bold text-[#8E8E8E] tracking-widest">🛠️ Developer Sprint Logs</span>
                              <span className={`inline-flex w-1.5 h-1.5 rounded-full ${flag.status === "Resolved" ? "bg-emerald-500" : "bg-[#06B6D4] animate-pulse"}`} />
                            </div>
                            
                            <div className="space-y-2 max-h-[100px] overflow-y-auto pr-1 dark-scrollbar">
                              {flag.sprintLogs && flag.sprintLogs.length > 0 ? (
                                flag.sprintLogs.map((log) => {
                                  const logMember = team.find(t => t.name.toLowerCase() === log.author.toLowerCase());
                                  const authorColor = logMember?.colorVar || "var(--color-neutral)";
                                  
                                  return (
                                    <div key={log.id} className="leading-normal flex items-start gap-1.5">
                                      <span className="text-[#8E8E8E] shrink-0">[{log.timestamp}]</span>
                                      <span className="font-bold shrink-0" style={{ color: authorColor }}>{log.author}:</span>
                                      <span className="text-[#FAF9F6]/85 break-words">{log.text}</span>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="text-[0.55rem] text-[#8E8E8E]/70 italic py-1">
                                  Awaiting technical triage. Developer updates will sync live.
                                </div>
                              )}
                            </div>
                          </div>

                        </div>

                      </motion.div>
                    );
                  })}

                  {clientFlags.length === 0 && (
                    <div className="bg-[#121212] border border-dashed border-[#1F1F1F] p-8 rounded-xl text-center text-[#8E8E8E] font-mono italic">
                      No support tickets logged. Dashboard health outstanding!
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ TAB 4: INVOICES ═══ */}
          {activeTab === "invoices" && (
            <motion.div key="invoices" initial="hidden" animate="show" exit="hidden" variants={stagger}>
              <motion.div variants={fadeUp}>
                <h2 className="text-lg font-bold font-mono mb-6 text-[#FAF9F6]">Escrow & Project Invoices</h2>
                <div className="bg-[#121212] border border-[#1F1F1F] rounded-xl overflow-hidden shadow-xs">
                  <div className="grid grid-cols-[1fr_1.5fr_0.8fr_0.8fr_0.8fr] gap-4 px-5 py-3.5 bg-[#0E0E0E] border-b border-[#1F1F1F] font-mono text-[0.55rem] uppercase tracking-widest text-[#8E8E8E] font-bold">
                    {["Invoice", "Description", "Due Date", "Amount", "Status"].map((h) => (
                      <div key={h}>{h}</div>
                    ))}
                  </div>
                  {clientInvoices.map((inv, i) => (
                    <motion.div 
                      key={inv.id}
                      initial={{ opacity: 0, x: -6 }} 
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="grid grid-cols-[1fr_1.5fr_0.8fr_0.8fr_0.8fr] gap-4 px-5 py-4 border-b border-[#1F1F1F] hover:bg-[#1F1F1F]/40 transition-colors items-center"
                    >
                      <div className="text-xs font-mono font-bold text-[#FAF9F6]">{inv.id}</div>
                      <div className="text-xs font-mono text-[#FAF9F6]/80 truncate">{inv.description}</div>
                      <div className="text-xs font-mono text-[#8E8E8E]">{inv.date}</div>
                      <div className="text-xs font-mono font-bold text-[#FAF9F6] font-variant-numeric: tabular-nums">{inv.amount}</div>
                      <div className="flex items-center gap-3">
                        <InvoiceStatusBadge status={inv.status} />
                        {inv.status === "pending" && (
                          <button 
                            onClick={() => alert("Escrow processing is simulated. Payment received! Thank you.")} 
                            className="bg-[#06B6D4] text-[#0A0A0A] text-[0.58rem] font-bold font-mono uppercase tracking-wider px-2 py-1 rounded hover:bg-[#06B6D4]/80 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#06B6D4] cursor-pointer"
                          >
                            Pay Now
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
